"""Progress indicator for long-running operations."""

import asyncio
import sys
from typing import Optional

class ProgressIndicator:
    """Simple progress indicator for async operations."""
    
    def __init__(self, message: str = "Processing"):
        self.message = message
        self.running = False
        self.task: Optional[asyncio.Task] = None
    
    async def _animate(self):
        """Animate the progress indicator."""
        chars = "|/-\\"
        i = 0
        while self.running:
            sys.stdout.write(f"\r{chars[i % len(chars)]} {self.message}...")
            sys.stdout.flush()
            await asyncio.sleep(0.1)
            i += 1
    
    def start(self):
        """Start the progress indicator."""
        self.running = True
        self.task = asyncio.create_task(self._animate())
    
    def stop(self):
        """Stop the progress indicator."""
        self.running = False
        if self.task:
            self.task.cancel()
        sys.stdout.write(f"\r{self.message} completed!\n")
        sys.stdout.flush()

async def with_progress(coro, message: str = "Processing"):
    """Run a coroutine with progress indicator."""
    indicator = ProgressIndicator(message)
    try:
        indicator.start()
        result = await coro
        indicator.stop()
        return result
    except Exception as e:
        indicator.stop()
        sys.stdout.write(f"\r{message} failed: {str(e)}\n")
        raise