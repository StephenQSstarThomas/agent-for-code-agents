"""Interactive main application with enhanced user experience."""

import asyncio
import sys
from pathlib import Path

try:
    from .config.llm_config import async_client
    from .core.orchestrator import InteractiveOrchestrator
except ImportError as e:
    print(f"ERROR: Import error: {e}")
    print("TIP: Make sure you have installed the package: pip install -e .")
    sys.exit(1)

def print_welcome():
    """Print welcome message with app info."""
    print("+" + "=" * 58 + "+")
    print("|" + " " * 18 + "AGENT FOR CODE AGENTS" + " " * 15 + "|")
    print("|" + " " * 58 + "|")
    print("|" + " Transform your ideas into structured prompts for AI" + " " * 7 + "|")
    print("|" + " " * 20 + "code generation tools" + " " * 17 + "|")
    print("+" + "=" * 58 + "+")
    
    print("\n* Features:")
    print("   Interactive 4-phase workflow")
    print("   Review and edit outputs at each step")
    print("   Regenerate content if needed")
    print("   Navigate back to previous steps")
    print("   Beautiful formatted output")

def get_project_idea():
    """Get project idea from user with nice formatting."""
    print("\n" + "" * 60)
    print("TIP: PROJECT IDEA INPUT")
    print("" * 60)
    print("Please describe your project in detail. Include:")
    print("   What you want to build")
    print("   Key features and functionality")
    print("   Target users or use cases")
    print("   Any specific requirements or constraints")
    
    print("\n Example: 'A web-based task management app with real-time")
    print("   collaboration, drag-and-drop interface, and mobile support'")
    
    while True:
        user_idea = input("\n> Your project idea: ").strip()
        if user_idea:
            return user_idea
        print("ERROR: Please enter a project description.")

async def main():
    """Enhanced main application entry point."""
    try:
        # Print welcome message
        print_welcome()
        
        # Setup workspace
        workspace_dir = Path("workspace")
        orchestrator = InteractiveOrchestrator(workspace_dir)
        
        # Get user input
        user_idea = get_project_idea()
        
        print(f"\n Project Idea: {user_idea}")
        print(f" Workspace Directory: {workspace_dir.absolute()}")
        print(" A unique project folder will be created based on your project description")
        
        # Confirm start
        confirm = input("\n Ready to start the workflow? (y/n): ").strip().lower()
        if confirm not in ['y', 'yes']:
            print(" Workflow cancelled. Come back anytime!")
            return
        
        # Run interactive workflow
        final_output_path = await orchestrator.run_interactive_workflow(user_idea, async_client)
        
        if final_output_path:
            orchestrator.show_workflow_summary()
        else:
            print("\nERROR: Workflow was not completed.")
            print("TIP: You can restart anytime to try again!")
        
    except KeyboardInterrupt:
        print("\n\n Workflow interrupted by user. Goodbye!")
    except ValueError as e:
        print(f"\nERROR: Configuration Error: {e}")
        print("TIP: Troubleshooting:")
        print("   1. Check if .env file exists in the project root")
        print("   2. Ensure API_KEY is set correctly")
        print("   3. Verify your API key is valid")
    except Exception as e:
        print(f"\nERROR: Unexpected Error: {e}")
        print("TIP: Troubleshooting:")
        print("   1. Check your internet connection")
        print("   2. Verify API configuration")
        print("   3. Try running the workflow again")
        
        # Debug info for developers
        if "--debug" in sys.argv:
            import traceback
            print("\nDebug information:")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())