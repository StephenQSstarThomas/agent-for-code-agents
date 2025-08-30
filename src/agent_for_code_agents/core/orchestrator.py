"""Interactive orchestrator for agent workflow management."""

import asyncio
import aiofiles
import os
import sys
import subprocess
from pathlib import Path
from typing import Dict, List, Optional

from ..utils.project_naming import (
    generate_unique_project_name, 
    create_project_readme_content
)

class InteractiveOrchestrator:
    """Interactive orchestrator for managing agent workflows with user confirmation."""
    
    def __init__(self, workspace_dir: Path):
        self.workspace_dir = workspace_dir
        self.workspace_dir.mkdir(exist_ok=True)
        self.project_dir: Optional[Path] = None
        self.project_name: Optional[str] = None
    
    def _create_project_directory(self, user_input: str) -> None:
        """Create a unique project directory based on user input."""
        # Get existing project names
        existing_names = set()
        if self.workspace_dir.exists():
            existing_names = {
                item.name for item in self.workspace_dir.iterdir() 
                if item.is_dir()
            }
        
        # Generate unique project name
        self.project_name = generate_unique_project_name(user_input, existing_names)
        self.project_dir = self.workspace_dir / self.project_name
        
        # Create project directory
        self.project_dir.mkdir(exist_ok=True)
        
        # Create project README
        readme_content = create_project_readme_content(self.project_name, user_input)
        readme_path = self.project_dir / "README.md"
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(readme_content)
    
    def _print_project_info(self) -> None:
        """Print project directory information."""
        if self.project_dir and self.project_name:
            print(f"\n Project Directory: {self.project_dir}")
            print(f" Project Name: {self.project_name.replace('-', ' ').title()}")
            print(f" All files will be saved in: {self.project_dir}/")
        
    def _print_banner(self, text: str, emoji: str = "") -> None:
        """Print a formatted banner."""
        print(f"\n{emoji} {text}")
        print("" * (len(text) + 4))
    
    def _print_step_header(self, step_num: int, step_name: str, emoji: str) -> None:
        """Print formatted step header."""
        print(f"\n{'='*60}")
        print(f"{emoji} STEP {step_num}/4: {step_name}")
        print(f"{'='*60}")
    
    def _print_file_info(self, file_path: Path, content_preview: str = None) -> None:
        """Print file information with preview."""
        print(f"\n Generated file: {file_path}")
        print(f" File size: {file_path.stat().st_size} bytes")
        
        if content_preview:
            lines = content_preview.split('\n')
            preview_lines = lines[:3] if len(lines) > 3 else lines
            print(f" Preview:")
            for line in preview_lines:
                print(f"   {line[:80]}{'...' if len(line) > 80 else ''}")
            if len(lines) > 3:
                print(f"   ... ({len(lines) - 3} more lines)")
    
    def _get_user_choice(self, prompt: str, choices: List[str]) -> str:
        """Get user choice with validation."""
        while True:
            print(f"\n{prompt}")
            for i, choice in enumerate(choices, 1):
                print(f"  {i}. {choice}")
            
            try:
                user_input = input("\n> Enter your choice (number): ").strip()
                choice_num = int(user_input)
                if 1 <= choice_num <= len(choices):
                    return choices[choice_num - 1]
                else:
                    print(f"ERROR: Please enter a number between 1 and {len(choices)}")
            except ValueError:
                print("ERROR: Please enter a valid number")
    
    def _open_file_for_editing(self, file_path: Path) -> bool:
        """Open file for editing and return True if user wants to continue."""
        print(f"\n Opening file for editing: {file_path}")
        
        try:
            if sys.platform.startswith('win'):
                os.startfile(str(file_path))
            elif sys.platform.startswith('darwin'):
                subprocess.run(['open', str(file_path)])
            else:
                subprocess.run(['xdg-open', str(file_path)])
            
            print(f" File opened in default editor")
            input(" Edit the file as needed, then press Enter to continue...")
            return True
            
        except Exception as e:
            print(f"ERROR: Could not open file automatically: {e}")
            print(f" Please manually open and edit: {file_path}")
            input(" Press Enter when you're done editing...")
            return True
    
    async def run_interactive_workflow(self, user_input: str, client) -> Optional[str]:
        """Run the interactive 4-phase workflow with user confirmation."""
        
        # Import here to avoid circular imports
        from ..agents import analysis_agent, architect_agent, todo_planning_agent, prompt_optimization_agent
        
        # Create project-specific directory
        self._create_project_directory(user_input)
        
        print("\n Starting Interactive Agent Workflow")
        print("=" * 50)
        print("You can review and edit each output before proceeding to the next step.")
        
        # Show project information
        self._print_project_info()
        
        # Phase 1: Analysis
        self._print_step_header(1, "REQUIREMENTS ANALYSIS", "")
        print(f" Analyzing your project idea: '{user_input}'")
        print(" This may take a moment...")
        
        try:
            analysis_result = await analysis_agent.run(user_input, client)
            analysis_file = self.project_dir / "analysis_output.md"
            await self._save_file(analysis_file, analysis_result)
            
            self._print_file_info(analysis_file, analysis_result)
            
            choice = self._get_user_choice(
                " What would you like to do next?",
                ["Continue to next step", "Edit the analysis file", "Regenerate analysis", "Exit workflow"]
            )
            
            if choice == "Edit the analysis file":
                self._open_file_for_editing(analysis_file)
                # Re-read the file in case it was modified
                analysis_result = analysis_file.read_text(encoding='utf-8')
            elif choice == "Regenerate analysis":
                print(" Regenerating analysis...")
                analysis_result = await analysis_agent.run(user_input, client)
                await self._save_file(analysis_file, analysis_result)
                self._print_file_info(analysis_file, analysis_result)
            elif choice == "Exit workflow":
                print(" Workflow cancelled by user")
                return None
                
        except Exception as e:
            print(f"ERROR: Error in analysis phase: {e}")
            return None
        
        # Phase 2: Architecture
        self._print_step_header(2, "TECHNICAL ARCHITECTURE", "")
        print(" Generating technical architecture from requirements...")
        print(" This may take a moment...")
        
        try:
            architecture_result = await architect_agent.run(str(analysis_file), client)
            architecture_file = self.project_dir / "architecture.md"
            await self._save_file(architecture_file, architecture_result)
            
            self._print_file_info(architecture_file, architecture_result)
            
            choice = self._get_user_choice(
                " What would you like to do next?",
                ["Continue to next step", "Edit the architecture file", "Regenerate architecture", "Go back to analysis", "Exit workflow"]
            )
            
            if choice == "Edit the architecture file":
                self._open_file_for_editing(architecture_file)
                architecture_result = architecture_file.read_text(encoding='utf-8')
            elif choice == "Regenerate architecture":
                print(" Regenerating architecture...")
                architecture_result = await architect_agent.run(str(analysis_file), client)
                await self._save_file(architecture_file, architecture_result)
                self._print_file_info(architecture_file, architecture_result)
            elif choice == "Go back to analysis":
                print(" Going back to analysis step...")
                return await self.run_interactive_workflow(user_input, client)
            elif choice == "Exit workflow":
                print(" Workflow cancelled by user")
                return None
                
        except Exception as e:
            print(f"ERROR: Error in architecture phase: {e}")
            return None
        
        # Phase 3: Task Planning
        self._print_step_header(3, "IMPLEMENTATION PLANNING", "")
        print(" Creating detailed implementation task list...")
        print(" This may take a moment...")
        
        try:
            task_result = await todo_planning_agent.run(str(architecture_file), client, str(analysis_file))
            task_file = self.project_dir / "task_plan.md"
            await self._save_file(task_file, task_result)
            
            self._print_file_info(task_file, task_result)
            
            choice = self._get_user_choice(
                " What would you like to do next?",
                ["Continue to final step", "Edit the task plan", "Regenerate task plan", "Go back to architecture", "Exit workflow"]
            )
            
            if choice == "Edit the task plan":
                self._open_file_for_editing(task_file)
                task_result = task_file.read_text(encoding='utf-8')
            elif choice == "Regenerate task plan":
                print(" Regenerating task plan...")
                task_result = await todo_planning_agent.run(str(architecture_file), client, str(analysis_file))
                await self._save_file(task_file, task_result)
                self._print_file_info(task_file, task_result)
            elif choice == "Go back to architecture":
                print(" Going back to architecture step...")
                # Re-run from architecture step
                return await self.run_interactive_workflow(user_input, client)
            elif choice == "Exit workflow":
                print(" Workflow cancelled by user")
                return None
                
        except Exception as e:
            print(f"ERROR: Error in task planning phase: {e}")
            return None
        
        # Phase 4: Final Prompt Generation
        self._print_step_header(4, "FINAL PROMPT GENERATION", "")
        print(" Creating optimized prompt for code generation...")
        print(" This may take a moment...")
        
        try:
            final_prompt = await prompt_optimization_agent.run(str(architecture_file), str(task_file), client, str(analysis_file))
            final_prompt_file = self.project_dir / "final_prompt.txt"
            await self._save_file(final_prompt_file, final_prompt)
            
            self._print_file_info(final_prompt_file, final_prompt)
            
            choice = self._get_user_choice(
                " What would you like to do with the final prompt?",
                ["Complete workflow", "Edit the final prompt", "Regenerate final prompt", "Go back to task planning"]
            )
            
            if choice == "Edit the final prompt":
                self._open_file_for_editing(final_prompt_file)
                final_prompt = final_prompt_file.read_text(encoding='utf-8')
            elif choice == "Regenerate final prompt":
                print(" Regenerating final prompt...")
                final_prompt = await prompt_optimization_agent.run(str(architecture_file), str(task_file), client, str(analysis_file))
                await self._save_file(final_prompt_file, final_prompt)
                self._print_file_info(final_prompt_file, final_prompt)
            elif choice == "Go back to task planning":
                print(" Going back to task planning step...")
                return await self.run_interactive_workflow(user_input, client)
            
            return str(final_prompt_file)
            
        except Exception as e:
            print(f"ERROR: Error in final prompt generation: {e}")
            return None
    
    async def _save_file(self, file_path: Path, content: str) -> None:
        """Save content to file with UTF-8 encoding."""
        async with aiofiles.open(file_path, "w", encoding="utf-8") as f:
            await f.write(content)
    
    def show_workflow_summary(self) -> None:
        """Show summary of generated files."""
        print("\n WORKFLOW COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f" Project: {self.project_name.replace('-', ' ').title()}")
        print(f" Project Directory: {self.project_dir}")
        print(" Generated files:")
        
        files = [
            ("analysis_output.md", " Requirements Analysis"),
            ("architecture.md", " Technical Architecture"),
            ("task_plan.md", " Implementation Plan"),
            ("final_prompt.txt", " Code Generation Prompt")
        ]
        
        for filename, description in files:
            file_path = self.project_dir / filename
            if file_path.exists():
                size = file_path.stat().st_size
                print(f"  {description}")
                print(f"     {file_path} ({size} bytes)")
        
        print(f"\nTIP: Next steps:")
        print(f"  1. Review the final prompt: {self.project_dir}/final_prompt.txt")
        print(f"  2. Copy it to your preferred AI code generation tool")
        print(f"  3. Start building your project!")
        print(f"\n Project saved at: {self.project_dir}")
        print(f" README available at: {self.project_dir}/README.md")