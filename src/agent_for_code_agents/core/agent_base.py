"""Base agent class with essential functionality."""

import time
from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAgent(ABC):
    """Base agent class with core AI principles."""
    
    def __init__(self, name: str, model: str = "gpt-4o"):
        self.name = name
        self.model = model
        
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the agent's system prompt."""
        pass
    
    async def run(self, input_data: Any, client, context: Dict[str, Any] = None) -> str:
        """Execute the agent and return result."""
        start_time = time.time()
        
        try:
            system_prompt = self.get_system_prompt()
            
            # Prepare messages
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": str(input_data)}
            ]
            
            # Make LLM request
            response = await client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=4000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error in {self.name}: {str(e)}")
            raise