"""Entry point for running the agent system as a module."""

import asyncio
from .app import main

if __name__ == "__main__":
    asyncio.run(main())