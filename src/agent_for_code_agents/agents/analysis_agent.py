"""Analysis Agent - Transforms user ideas into structured requirement analysis."""

import asyncio
import httpx
import aiofiles
from typing import Optional
from ..config.prompts import ANALYSIS_SYSTEM_PROMPT
from ..config.llm_config import MODEL

async def fetch_url_content(url: str) -> Optional[str]:
    """Fetch content from a URL."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30)
            if response.status_code == 200:
                return response.text
            else:
                # print(f"Failed to fetch {url}: HTTP {response.status_code}")
                return None
    except Exception as e:
        # print(f"Error fetching {url}: {str(e)}")
        return None

async def fetch_file_content(file_path: str) -> Optional[str]:
    """Fetch content from a local file."""
    try:
        import os
        if os.path.exists(file_path) and os.path.isfile(file_path):
            async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                return await f.read()
        else:
            # print(f"File not found: {file_path}")
            return None
    except Exception as e:
        # print(f"Error reading file {file_path}: {str(e)}")
        return None

async def extract_urls_and_fetch(user_prompt: str) -> str:
    """Extract URLs and file paths from user prompt and fetch their content."""
    import re
    import os
    
    # Find file paths first (Windows and Unix paths with file extensions)
    file_patterns = [
        r'[A-Za-z]:\\[^<>"|?*\s]*\.[a-zA-Z0-9]{1,10}',  # Windows absolute paths with extensions
        r'/[^<>"|?*\s]*\.[a-zA-Z0-9]{1,10}',             # Unix absolute paths with extensions  
        r'\.{1,2}/[^<>"|?*\s]*\.[a-zA-Z0-9]{1,10}'       # Relative paths with extensions
    ]
    
    file_paths = []
    for pattern in file_patterns:
        matches = re.findall(pattern, user_prompt)
        file_paths.extend(matches)
    
    # Remove file paths from the prompt when searching for URLs to avoid conflicts
    prompt_without_files = user_prompt
    for file_path in file_paths:
        prompt_without_files = prompt_without_files.replace(file_path, '')
    
    # Find URLs in the remaining text
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/[^\s<>"{}|\\^`\[\]]*'
    urls = re.findall(url_pattern, prompt_without_files)
    
    enhanced_prompt = user_prompt
    
    # Process file paths first
    if file_paths:
        # print(f"Found {len(file_paths)} local file path(s) in your prompt. Reading content...")
        
        for file_path in file_paths:
            # print(f"Reading: {file_path}")
            content = await fetch_file_content(file_path)
            
            if content:
                # Truncate content if too long (keep first 2000 characters)
                truncated_content = content[:2000] + "..." if len(content) > 2000 else content
                enhanced_prompt += f"\n\n--- Content from {file_path} ---\n{truncated_content}\n--- End of content ---"
                # print(f"Successfully read file {file_path}")
            else:
                enhanced_prompt += f"\n\n--- Note: Could not read file {file_path} ---"
    
    # Process URLs
    if urls:
        # print(f"Found {len(urls)} URL(s) in your prompt. Fetching content...")
        
        for url in urls:
            # Ensure URL has proper protocol
            if not url.startswith(('http://', 'https://')):
                if url.startswith('www.'):
                    url = 'https://' + url
                else:
                    url = 'https://' + url
            
            # print(f"Fetching: {url}")
            content = await fetch_url_content(url)
            
            if content:
                # Truncate content if too long (keep first 2000 characters)
                truncated_content = content[:2000] + "..." if len(content) > 2000 else content
                enhanced_prompt += f"\n\n--- Content from {url} ---\n{truncated_content}\n--- End of content ---"
                # print(f"Successfully fetched content from {url}")
            else:
                enhanced_prompt += f"\n\n--- Note: Could not fetch content from {url} ---"
    
    return enhanced_prompt

async def run(user_prompt: str, client) -> str:
    """
    Analyze user input and generate structured requirements.
    
    Args:
        user_prompt: User's project idea in natural language (may contain URLs)
        client: AsyncOpenAI client instance
        
    Returns:
        Structured analysis of the project requirements
    """
    # Extract URLs and fetch content if any
    enhanced_prompt = await extract_urls_and_fetch(user_prompt)
    
    system_prompt = ANALYSIS_SYSTEM_PROMPT
    
    # print("Sending request to AI model...")
    
    try:
        # Add timeout for API call
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": enhanced_prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            ),
            timeout=600.0  # 2 minute timeout
        )
        
        # print("Analysis completed successfully!")
        return response.choices[0].message.content
        
    except asyncio.TimeoutError:
        # print("Request timed out after 2 minutes")
        raise Exception("Analysis request timed out. Please try again.")
    except Exception as e:
        # print(f"Error during analysis: {str(e)}")
        raise