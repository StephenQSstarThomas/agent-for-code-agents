"""LLM client configuration module."""

import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL", "https://api.openai.com/v1")
MODEL = os.getenv("MODEL", "gpt-4o-mini")

if not API_KEY:
    raise ValueError("API_KEY environment variable is required")

# Check if using Azure OpenAI (has "azure.com" in base URL)
is_azure = "azure.com" in BASE_URL.lower() if BASE_URL else False

def create_client():
    """Create and return async OpenAI client with current environment variables."""
    global async_client, API_KEY, BASE_URL, MODEL, is_azure
    
    # Reload environment variables
    load_dotenv()
    API_KEY = os.getenv("API_KEY")
    BASE_URL = os.getenv("BASE_URL", "https://api.openai.com/v1")
    MODEL = os.getenv("MODEL", "gpt-4o-mini")
    is_azure = "azure.com" in BASE_URL.lower() if BASE_URL else False
    
    if not API_KEY:
        raise ValueError("API_KEY environment variable is required")
    
    if is_azure:
        return AsyncOpenAI(
            api_key=API_KEY,
            base_url=BASE_URL,
            default_query={"api-version": "2025-01-01-preview"}
        )
    else:
        return AsyncOpenAI(
            api_key=API_KEY,
            base_url=BASE_URL
        )

# Initialize client
async_client = create_client()

async def reinitialize_client():
    """Reinitialize the async client with updated environment variables."""
    global async_client
    async_client = create_client()
    return async_client