"""Todo Planning Agent - Transforms architecture into actionable task list."""

import asyncio
import aiofiles
from ..config.prompts import TODO_PLANNING_SYSTEM_PROMPT
from ..config.llm_config import MODEL

async def run(architecture_file_path: str, client, analysis_file_path: str = None) -> str:
    """
    Generate detailed task list from architecture and analysis files.
    
    Args:
        architecture_file_path: Path to the architecture file
        client: AsyncOpenAI client instance
        analysis_file_path: Path to the analysis file (optional for backward compatibility)
        
    Returns:
        Detailed implementation task list
    """
    print("Reading architecture file...")
    
    # Read architecture file
    async with aiofiles.open(architecture_file_path, "r", encoding="utf-8") as f:
        architecture_content = await f.read()
    
    # Read analysis file if provided
    analysis_content = ""
    if analysis_file_path:
        print("Reading analysis file...")
        async with aiofiles.open(analysis_file_path, "r", encoding="utf-8") as f:
            analysis_content = await f.read()
    
    print("Creating implementation task plan...")
    
    system_prompt = TODO_PLANNING_SYSTEM_PROMPT
    
    if analysis_content:
        user_prompt = f"""Please create a comprehensive task list based on the requirements analysis and technical architecture:

REQUIREMENTS ANALYSIS:
{analysis_content}

TECHNICAL ARCHITECTURE:
{architecture_content}

Create a detailed implementation plan that considers both the business requirements and technical design."""
    else:
        user_prompt = f"""Please create a comprehensive task list based on this technical architecture:

{architecture_content}"""
    
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
        
        print("Task planning completed successfully!")
        return response.choices[0].message.content
        
    except asyncio.TimeoutError:
        print("Request timed out after 2 minutes")
        raise Exception("Task planning generation timed out. Please try again.")
    except Exception as e:
        print(f"Error during task planning: {str(e)}")
        raise