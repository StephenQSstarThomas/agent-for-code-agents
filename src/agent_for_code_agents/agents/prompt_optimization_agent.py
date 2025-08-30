"""Prompt Optimization Agent - Creates final comprehensive prompt for code generation."""

import asyncio
import aiofiles
from ..config.prompts import PROMPT_OPTIMIZATION_SYSTEM_PROMPT
from ..config.llm_config import MODEL

async def run(architecture_file_path: str, task_file_path: str, client, analysis_file_path: str = None) -> str:
    """
    Generate optimized final prompt integrating analysis, architecture and tasks.
    
    Args:
        architecture_file_path: Path to the architecture file
        task_file_path: Path to the task list file  
        client: AsyncOpenAI client instance
        analysis_file_path: Path to the analysis file (optional for backward compatibility)
        
    Returns:
        Comprehensive prompt for code generation agents
    """
    print("Reading all project files...")
    
    # Read architecture and task files
    async with aiofiles.open(architecture_file_path, "r", encoding="utf-8") as f:
        architecture_content = await f.read()
    
    async with aiofiles.open(task_file_path, "r", encoding="utf-8") as f:
        task_content = await f.read()
    
    # Read analysis file if provided
    analysis_content = ""
    if analysis_file_path:
        print("Reading analysis file...")
        async with aiofiles.open(analysis_file_path, "r", encoding="utf-8") as f:
            analysis_content = await f.read()
    
    print("Generating final optimized prompt...")
    
    system_prompt = PROMPT_OPTIMIZATION_SYSTEM_PROMPT
    
    if analysis_content:
        user_prompt = f"""Create a concise final prompt that synthesizes all project information:

REQUIREMENTS ANALYSIS:
{analysis_content}

TECHNICAL ARCHITECTURE: 
{architecture_content}

IMPLEMENTATION TASKS:
{task_content}

Create a streamlined prompt under 1000 words that includes:
1. Brief project context (from analysis)
2. File references:
   - Analysis: {analysis_file_path}
   - Architecture: {architecture_file_path}
   - Tasks: {task_file_path}
3. List of available files
4. The exact coding protocol as specified

Integrate insights from all three documents to create the most effective final prompt."""
    else:
        user_prompt = f"""Create a concise final prompt that includes:

1. Brief project context
2. File references:
   - Architecture: {architecture_file_path}
   - Tasks: {task_file_path}
3. List of available files
4. The exact coding protocol as specified

Architecture file: {architecture_file_path}
Task file: {task_file_path}

Create a streamlined prompt under 1000 words that references these files and includes the mandatory coding protocol."""
    
    try:
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            ),
            timeout=600.0  # 2 minute timeout
        )
        
        print("Final prompt generated successfully!")
        return response.choices[0].message.content
        
    except asyncio.TimeoutError:
        print("Request timed out after 2 minutes")
        raise Exception("Prompt optimization timed out. Please try again.")
    except Exception as e:
        print(f"Error during prompt optimization: {str(e)}")
        raise