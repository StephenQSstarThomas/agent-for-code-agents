"""Architect Agent - Transforms requirements into technical architecture."""

import asyncio
import aiofiles
from ..config.prompts import ARCHITECT_SYSTEM_PROMPT
from ..config.llm_config import MODEL

async def run(analysis_file_path: str, client) -> str:
    """
    Generate technical architecture from analysis file.
    
    Args:
        analysis_file_path: Path to the analysis output file
        client: AsyncOpenAI client instance
        
    Returns:
        Technical architecture specification
    """
    print("Reading analysis file...")
    
    # Read analysis file
    async with aiofiles.open(analysis_file_path, "r", encoding="utf-8") as f:
        analysis_content = await f.read()
    
    print("Generating technical architecture...")
    
    system_prompt = ARCHITECT_SYSTEM_PROMPT
    
    user_prompt = f"""Please create a technical architecture based on this requirements analysis:

{analysis_content}"""
    
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
        
        print("Architecture completed successfully!")
        return response.choices[0].message.content
        
    except asyncio.TimeoutError:
        print("Request timed out after 2 minutes")
        raise Exception("Architecture generation timed out. Please try again.")
    except Exception as e:
        print(f"Error during architecture generation: {str(e)}")
        raise