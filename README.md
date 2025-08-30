# Agent for Code Agents

> *"Give me six hours to chop down a tree and I will spend the first four sharpening the axe."* — Abraham Lincoln

This system embodies that philosophy: it takes time to analyze, architect, plan, and optimize before generating code, ensuring better results than rushing straight to implementation.

## Overview

Agent for Code Agents is a multi-agent AI system that transforms natural language project ideas into structured, comprehensive prompts for code generation. Instead of jumping directly from idea to code, it follows a methodical four-stage workflow that mirrors professional software development practices.

## Core Philosophy

Traditional AI code generation often fails because it lacks proper analysis and planning. This system addresses that by implementing a structured workflow:

1. **Analysis** - Understanding requirements thoroughly
2. **Architecture** - Designing technical foundation  
3. **Planning** - Creating detailed implementation roadmap
4. **Optimization** - Refining prompts for maximum effectiveness

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Project    │  │  Workflow   │  │  Markdown Editor    │  │
│  │  Management │  │  Interface  │  │  & File Browser     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                          HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Backend (FastAPI)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Project   │  │   Agent     │  │   File Management   │  │
│  │   Manager   │  │ Orchestrator│  │      & Storage      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                         AI Agent Layer
                              │
┌─────────────────────────────────────────────────────────────┐
│                   AI Agents (LLM)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Analysis   │  │ Architecture│  │     Planning &      │  │
│  │   Agent     │  │    Agent    │  │  Optimization       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                        Workspace Storage
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Local File System                          │
├─────────────────────────────────────────────────────────────┤
│         workspace/                                          │
│         ├── project-1/                                      │
│         │   ├── analysis.md                                 │
│         │   ├── architecture.md                             │
│         │   ├── planning.md                                 │
│         │   └── final_prompt.md                             │
│         └── project-2/                                      │
│             └── ...                                         │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
agent-for-code-agents/
├── Backend Components
│   ├── simple_backend.py          # FastAPI server & orchestration
│   └── src/agent_for_code_agents/ # Core agent implementations
│       ├── agents/                # Individual AI agents
│       │   ├── analysis_agent.py
│       │   ├── architect_agent.py
│       │   ├── todo_planning_agent.py
│       │   └── prompt_optimization_agent.py
│       ├── config/                # LLM configuration & prompts
│       │   ├── llm_config.py
│       │   └── prompts.py
│       └── core/                  # Base classes & utilities
│
├── Frontend Components
│   ├── app/                       # Next.js app router
│   │   ├── dashboard/
│   │   ├── editor/
│   │   ├── project/
│   │   │   ├── new/
│   │   │   └── [id]/workflow/
│   │   └── settings/
│   ├── components/                # React components
│   │   ├── chat/                  # AI chat interface
│   │   ├── editor/                # Markdown editor & file browser
│   │   ├── layout/                # App layout components
│   │   ├── workflow/              # Workflow step management
│   │   └── ui/                    # Base UI components
│   └── lib/                       # Utilities & API client
│
├── Workspace
│   └── workspace/                 # User project files
│
└── Configuration
    ├── pyproject.toml             # Python dependencies & config
    ├── .gitignore                 # Git ignore rules
    └── start.bat                  # Application launcher
```

## Installation & Setup

### Prerequisites
- Python 3.11+ with conda
- Node.js 16+ with npm
- OpenAI API key (or compatible LLM provider)

### Quick Start

1. **Clone and setup environment**
   ```bash
   git clone <repository-url>
   cd agent-for-code-agents
   conda create -n agent python=3.11
   conda activate agent
   pip install -e .
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
   
3. **Configure environment**
   Create `.env` file in the root directory:
   ```env
   API_KEY=your_openai_api_key_here
   BASE_URL=https://api.openai.com/v1
   MODEL=gpt-4o-mini
   ```

4. **Launch application**

   **Option 1: Manual Launch (Recommended)**
   ```bash
   # Terminal 1: Start Backend
   conda activate agent
   python simple_backend.py
   
   # Terminal 2: Start Frontend (in new terminal)
   cd frontend
   npm run dev
   ```
   
   **Option 2: Automatic Launch**
   ```bash
   start.bat  # Windows
   # or
   ./start.ps1  # PowerShell
   ```

5. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://127.0.0.1:8002](http://127.0.0.1:8002)
   - API Documentation: [http://127.0.0.1:8002/docs](http://127.0.0.1:8002/docs)

### Troubleshooting

If `start.bat` doesn't work:
1. Ensure conda environment is activated: `conda activate agent`
2. Install dependencies: `pip install -e .`
3. Run backend manually: `python simple_backend.py`
4. In another terminal, run frontend: `cd frontend && npm run dev`

## Workflow Process

### 1. Analysis Agent
Transforms user ideas into structured requirements analysis:
- Stakeholder analysis
- Functional requirements breakdown
- Technical constraints identification
- Success criteria definition

### 2. Architecture Agent  
Creates technical foundation:
- System design patterns
- Technology stack recommendations
- Database schema planning
- API endpoint structure

### 3. Planning Agent
Develops implementation roadmap:
- Task breakdown and prioritization
- Timeline estimation
- Resource requirements
- Risk assessment

### 4. Optimization Agent
Refines output for code generation:
- Prompt engineering optimization
- Context consolidation
- Implementation guidance
- Quality assurance checklist

## API Reference

### Core Endpoints

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects/{id}/archive` - Archive completed project

#### Workflow Agents
- `POST /api/agents/analysis` - Execute analysis phase
- `POST /api/agents/architect` - Execute architecture phase
- `POST /api/agents/planning` - Execute planning phase
- `POST /api/agents/optimization` - Execute optimization phase

#### File Management
- `POST /api/files/read` - Read file content
- `POST /api/files/write` - Write file content
- `POST /api/files/list` - List directory contents

## Development

### Backend Development
```bash
python simple_backend.py  # Development server
pip install -e ".[dev]"   # Install with dev dependencies (from pyproject.toml)
pytest                    # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Code linting
```

### Environment Configuration

The system supports multiple LLM providers through environment variables:

```env
# OpenAI (default)
API_KEY=sk-...
BASE_URL=https://api.openai.com/v1
MODEL=gpt-4o-mini

# Azure OpenAI
API_KEY=your-azure-key
BASE_URL=https://your-resource.openai.azure.com
MODEL=gpt-4

# Other providers (e.g., Anthropic, local models)
API_KEY=your-api-key
BASE_URL=https://api.provider.com/v1
MODEL=model-name
```

## Features

### User Interface
- **Project Management**: Create, track, and archive projects
- **Workflow Visualization**: Real-time progress tracking
- **Interactive Chat**: Communicate with AI during workflow
- **File Editor**: Edit markdown files with live preview
- **Archive System**: Complete project archival with local paths

### Technical Features
- **Unicode Support**: Full international character support
- **Error Recovery**: Robust error handling with fallbacks
- **Real-time Updates**: Live synchronization between frontend/backend
- **Extensible Architecture**: Easy to add new agents or modify workflow

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Submit pull request with clear description

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check existing GitHub issues
2. Review API documentation
3. Examine console logs for errors
4. Create new issue with reproduction steps

---

*Built with careful consideration for the software development process*