"""Project naming utilities for generating clean folder names from user input."""

import re
import string
from datetime import datetime
from typing import Optional

def sanitize_folder_name(name: str) -> str:
    """
    Convert a string into a clean folder name.
    
    Args:
        name: Raw string to convert
        
    Returns:
        Clean folder name safe for filesystem
    """
    # Remove or replace problematic characters
    # Replace spaces and common separators with hyphens
    clean_name = re.sub(r'[\s\-_]+', '-', name)
    
    # Remove non-alphanumeric characters except hyphens
    clean_name = re.sub(r'[^\w\-]', '', clean_name)
    
    # Remove leading/trailing hyphens
    clean_name = clean_name.strip('-')
    
    # Convert to lowercase
    clean_name = clean_name.lower()
    
    # Limit length to reasonable size
    if len(clean_name) > 50:
        clean_name = clean_name[:50].rstrip('-')
    
    # Ensure it's not empty
    if not clean_name:
        clean_name = "project"
    
    return clean_name

def extract_project_keywords(user_input: str) -> list[str]:
    """
    Extract key words from user input that describe the project.
    
    Args:
        user_input: User's project description
        
    Returns:
        List of relevant keywords
    """
    # Common stop words to ignore
    stop_words = {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has',
        'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was',
        'will', 'with', 'would', 'i', 'want', 'need', 'create', 'build', 'make',
        'develop', 'application', 'app', 'system', 'software', 'tool', 'using',
        'can', 'should', 'could', 'have', 'this', 'that', 'these', 'those'
    }
    
    # Extract words, clean them up
    words = re.findall(r'\b[a-zA-Z]+\b', user_input.lower())
    
    # Filter out stop words and short words
    keywords = [
        word for word in words 
        if len(word) >= 3 and word not in stop_words
    ]
    
    # Remove duplicates while preserving order
    seen = set()
    unique_keywords = []
    for word in keywords:
        if word not in seen:
            seen.add(word)
            unique_keywords.append(word)
    
    return unique_keywords[:5]  # Limit to top 5 keywords

def generate_project_name(user_input: str, max_length: int = 40) -> str:
    """
    Generate a project folder name from user input.
    
    Args:
        user_input: User's project description
        max_length: Maximum length for the project name
        
    Returns:
        Clean project folder name
    """
    # Extract keywords from user input
    keywords = extract_project_keywords(user_input)
    
    if not keywords:
        # Fallback to sanitized first few words
        first_words = user_input.split()[:3]
        project_name = '-'.join(first_words)
    else:
        # Join keywords with hyphens
        project_name = '-'.join(keywords[:3])  # Use top 3 keywords
    
    # Sanitize the name
    clean_name = sanitize_folder_name(project_name)
    
    # Ensure it fits within max_length
    if len(clean_name) > max_length:
        clean_name = clean_name[:max_length].rstrip('-')
    
    return clean_name

def generate_unique_project_name(user_input: str, existing_names: set[str], max_length: int = 40) -> str:
    """
    Generate a unique project name that doesn't conflict with existing names.
    
    Args:
        user_input: User's project description
        existing_names: Set of existing project names to avoid
        max_length: Maximum length for the project name
        
    Returns:
        Unique project folder name
    """
    base_name = generate_project_name(user_input, max_length - 4)  # Reserve 4 chars for suffix
    
    if base_name not in existing_names:
        return base_name
    
    # Add timestamp suffix for uniqueness
    timestamp = datetime.now().strftime("%m%d")
    unique_name = f"{base_name}-{timestamp}"
    
    # If still conflicts, add hour-minute
    if unique_name in existing_names:
        timestamp = datetime.now().strftime("%m%d-%H%M")
        unique_name = f"{base_name}-{timestamp}"
    
    return unique_name

def create_project_readme_content(project_name: str, user_input: str) -> str:
    """
    Generate README content for the project folder.
    
    Args:
        project_name: Name of the project
        user_input: Original user input
        
    Returns:
        README.md content for the project
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    return f"""# {project_name.replace('-', ' ').title()}

## Project Description

{user_input}

## Generated Files

This project folder contains the following generated files:

- **analysis_output.md** - Requirements analysis and project breakdown
- **architecture.md** - Technical architecture and system design
- **task_plan.md** - Implementation roadmap and task breakdown
- **final_prompt.txt** - Optimized prompt for AI code generation

## Usage

1. Review the generated files to understand the project structure
2. Use the `final_prompt.txt` with your preferred AI coding assistant
3. Follow the implementation plan in `task_plan.md`

## Generated On

{timestamp}

---

*Generated by Agent for Code Agents*
"""