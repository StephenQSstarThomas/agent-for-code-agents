"""
Backend for Agent for Code Agents
Integrates with real agent implementations
"""
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
import json
import asyncio
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add src to path to import agents
sys.path.append(str(Path(__file__).parent / "src"))

# Import real agents
try:
    from src.agent_for_code_agents.agents import analysis_agent, architect_agent, todo_planning_agent, prompt_optimization_agent
    from src.agent_for_code_agents.config.llm_config import create_client
    AGENTS_AVAILABLE = True
    print("Real agents imported successfully")
except ImportError as e:
    print(f"Warning: Could not import real agents: {e}")
    print("   Falling back to simplified agents")
    AGENTS_AVAILABLE = False

# Fix encoding issues on Windows
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ['PYTHONLEGACYWINDOWSSTDIO'] = '0'

# Force UTF-8 encoding for stdout and stderr
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

app = FastAPI(
    title="Agent for Code Agents API",
    description="Simple backend for Agent for Code Agents UI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ProjectCreate(BaseModel):
    name: str
    description: str
    user_prompt: str
    reference_urls: Optional[List[str]] = None
    reference_files: Optional[List[str]] = None

class AgentRequest(BaseModel):
    project_id: str
    user_prompt: Optional[str] = None

# In-memory storage
projects_db: Dict[str, Dict[str, Any]] = {}

def clean_text_for_encoding(text: str) -> str:
    """Clean text to prevent encoding issues while preserving Chinese characters"""
    import re
    if not text:
        return text
    
    # Remove problematic emoji and symbols that cause GBK encoding issues
    # But keep Chinese characters, basic Latin, and common punctuation
    emoji_pattern = r'[\U0001F000-\U0001F9FF]|[\U00002600-\U000026FF]|[\U00002700-\U000027BF]|[\U0001F300-\U0001F5FF]|[\U0001F600-\U0001F64F]|[\U0001F680-\U0001F6FF]|[\U0001F700-\U0001F77F]|[\U0001F780-\U0001F7FF]|[\U0001F800-\U0001F8FF]|[\U0001F900-\U0001F9FF]'
    cleaned_text = re.sub(emoji_pattern, '', text)
    
    # If still having issues, fallback to ASCII-only
    try:
        cleaned_text.encode('utf-8')
        return cleaned_text
    except UnicodeEncodeError:
        return text.encode('ascii', 'ignore').decode('ascii')

def get_workspace_dir(project_name: str) -> Path:
    """Get project workspace directory"""
    workspace = Path("workspace")
    workspace.mkdir(exist_ok=True)
    # Clean project name for file system
    clean_name = clean_text_for_encoding(project_name.replace(' ', '-').lower())
    project_dir = workspace / clean_name
    project_dir.mkdir(exist_ok=True)
    return project_dir

def get_project(project_id: str) -> Dict[str, Any]:
    """Get project by ID"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]

# API endpoints
@app.get("/")
async def root():
    return {"message": "Agent for Code Agents API", "version": "1.0.0"}

@app.get("/api/projects")
async def list_projects():
    """List all projects"""
    return list(projects_db.values())

@app.post("/api/projects")  
async def create_project(project: ProjectCreate):
    """Create a new project"""
    project_id = f"proj_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    workspace_dir = get_workspace_dir(project.name)
    
    new_project = {
        "id": project_id,
        "name": project.name,
        "description": project.description,
        "user_prompt": project.user_prompt,
        "status": "draft",
        "workspace": str(workspace_dir),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "steps": [
            {"id": "analysis", "status": "pending", "name": "Requirements Analysis"},
            {"id": "architecture", "status": "pending", "name": "Technical Architecture"},
            {"id": "planning", "status": "pending", "name": "Implementation Planning"},
            {"id": "optimization", "status": "pending", "name": "Prompt Optimization"}
        ]
    }
    
    projects_db[project_id] = new_project
    return new_project

@app.get("/api/projects/{project_id}")
async def get_project_by_id(project_id: str):
    """Get project by ID"""
    return get_project(project_id)

@app.get("/api/projects/{project_id}/workspace")
async def get_project_workspace(project_id: str):
    """Get project workspace info"""
    project = get_project(project_id)
    workspace_path = project["workspace"]
    return {
        "project_id": project_id,
        "workspace_path": workspace_path,
        "exists": Path(workspace_path).exists()
    }

@app.post("/api/projects/{project_id}/archive")
async def archive_project(project_id: str):
    """Archive a completed project"""
    try:
        project = get_project(project_id)
        
        # Check if project is completed
        if project["status"] != "completed":
            raise HTTPException(status_code=400, detail="Project must be completed before archiving")
        
        # Update project status
        project["status"] = "archived"
        project["archived_at"] = datetime.now().isoformat()
        project["updated_at"] = datetime.now().isoformat()
        
        # Get workspace info
        workspace_path = Path(project["workspace"]).resolve()
        
        return {
            "message": "Project archived successfully",
            "project_id": project_id,
            "local_path": str(workspace_path),
            "project_name": project["name"],
            "archived_at": project["archived_at"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=clean_text_for_encoding(str(e)))

@app.post("/api/agents/analysis")
async def run_analysis_agent(request: AgentRequest):
    """Run the real analysis agent"""
    try:
        project = get_project(request.project_id)
        workspace_dir = Path(project["workspace"])
        workspace_dir.mkdir(parents=True, exist_ok=True)
        
        # Update project status
        project["status"] = "processing"
        project["current_step"] = "analysis"
        project["updated_at"] = datetime.now().isoformat()
        
        # Get user prompt and clean it
        user_prompt = request.user_prompt or project["user_prompt"]
        clean_prompt = clean_text_for_encoding(user_prompt) if user_prompt else 'the requested functionality'
        
        if AGENTS_AVAILABLE:
            # Use real analysis agent
            try:
                client = create_client()
                analysis_content = await analysis_agent.run(clean_prompt, client)
            except Exception as agent_error:
                print(f"Real agent failed, using fallback: {agent_error}")
                analysis_content = f"""# Requirements Analysis

## Executive Summary
This project involves creating {clean_prompt}.

## Business Requirements
- Target users: General users who need this functionality
- Primary goal: Deliver a functional and user-friendly application

## Functional Requirements
- Core functionality as described in user prompt
- Intuitive user interface
- Responsive design

## Technical Requirements  
- Modern web technologies
- Cross-browser compatibility
- Mobile responsiveness

## Implementation Approach
- Use proven technologies and frameworks
- Follow best practices for code organization
- Ensure good user experience

## Next Steps
1. Design technical architecture
2. Create implementation plan
3. Begin development

Generated for: {clean_prompt}
Generated at: {datetime.now().isoformat()}
(Note: Generated with fallback due to agent error: {str(agent_error)})
"""
        else:
            # Fallback to simple content
            analysis_content = f"""# Requirements Analysis

## Executive Summary  
This project involves creating {clean_prompt}.

## Business Requirements
- Target users: General users who need this functionality
- Primary goal: Deliver a functional and user-friendly application

## Functional Requirements
- Core functionality as described in user prompt
- Intuitive user interface
- Responsive design

## Technical Requirements  
- Modern web technologies
- Cross-browser compatibility
- Mobile responsiveness

## Implementation Approach
- Use proven technologies and frameworks
- Follow best practices for code organization
- Ensure good user experience

## Next Steps
1. Design technical architecture
2. Create implementation plan
3. Begin development

Generated for: {clean_prompt}
Generated at: {datetime.now().isoformat()}
(Note: Generated with simplified agent - real agents not available)
"""
        
        # Save analysis file with UTF-8 encoding
        analysis_file = workspace_dir / "analysis.md"
        with open(analysis_file, "w", encoding="utf-8") as f:
            f.write(analysis_content)
        
        # Update project step
        project["steps"][0]["status"] = "completed"
        project["steps"][0]["output"] = analysis_content
        project["steps"][0]["file_path"] = str(analysis_file)
        project["status"] = "completed"
        project["updated_at"] = datetime.now().isoformat()
        
        return {"message": "Analysis completed", "task_id": f"{request.project_id}_analysis"}
        
    except Exception as e:
        # Update project with error
        project = projects_db.get(request.project_id)
        if project:
            project["steps"][0]["status"] = "error"
            project["steps"][0]["error"] = clean_text_for_encoding(str(e))
            project["status"] = "error"
            project["updated_at"] = datetime.now().isoformat()
        
        raise HTTPException(status_code=500, detail=clean_text_for_encoding(str(e)))

@app.post("/api/agents/architect")
async def run_architect_agent(request: AgentRequest):
    """Run the real architect agent"""
    try:
        project = get_project(request.project_id)
        workspace_dir = Path(project["workspace"])
        
        # Update project status
        project["status"] = "processing"
        project["current_step"] = "architecture"
        project["updated_at"] = datetime.now().isoformat()
        
        # Find analysis file
        analysis_file = workspace_dir / "analysis.md"
        if not analysis_file.exists():
            raise HTTPException(status_code=400, detail="Analysis file not found. Please run analysis first.")
        
        if AGENTS_AVAILABLE:
            # Use real architect agent
            try:
                client = create_client()
                architecture_content = await architect_agent.run(str(analysis_file), client)
            except Exception as agent_error:
                print(f"Real architect agent failed, using fallback: {agent_error}")
                architecture_content = f"""# Technical Architecture

## System Overview
This document outlines the technical architecture for the project.

## Technology Stack
- **Frontend**: Modern web technologies (React/Vue/Angular)
- **Backend**: RESTful API architecture
- **Database**: Appropriate database solution
- **Infrastructure**: Cloud-ready deployment

## System Components
1. **User Interface Layer**
   - Responsive web interface
   - Mobile-friendly design
   - User authentication and authorization

2. **Application Layer**
   - Business logic implementation
   - API endpoints
   - Data validation

3. **Data Layer**
   - Database design
   - Data models
   - Storage optimization

## Security Considerations
- Input validation and sanitization
- Authentication and authorization
- Data encryption
- HTTPS implementation

## Performance Optimization
- Caching strategies
- Database optimization
- Code splitting and lazy loading
- CDN integration

## Deployment Architecture
- Containerized deployment
- Load balancing
- Auto-scaling capabilities
- Monitoring and logging

Generated at: {datetime.now().isoformat()}
(Note: Generated with fallback due to agent error: {str(agent_error)})
"""
        else:
            # Fallback content
            architecture_content = f"""# Technical Architecture

## System Overview
This document outlines the technical architecture for the project.

## Technology Stack
- **Frontend**: Modern web technologies (React/Vue/Angular)
- **Backend**: RESTful API architecture
- **Database**: Appropriate database solution
- **Infrastructure**: Cloud-ready deployment

## System Components
1. **User Interface Layer**
   - Responsive web interface
   - Mobile-friendly design
   - User authentication and authorization

2. **Application Layer**
   - Business logic implementation
   - API endpoints
   - Data validation

3. **Data Layer**
   - Database design
   - Data models
   - Storage optimization

## Security Considerations
- Input validation and sanitization
- Authentication and authorization
- Data encryption
- HTTPS implementation

## Performance Optimization
- Caching strategies
- Database optimization
- Code splitting and lazy loading
- CDN integration

## Deployment Architecture
- Containerized deployment
- Load balancing
- Auto-scaling capabilities
- Monitoring and logging

Generated at: {datetime.now().isoformat()}
(Note: Generated with simplified agent - real agents not available)
"""
        
        # Save architecture file
        architecture_file = workspace_dir / "architecture.md"
        with open(architecture_file, "w", encoding="utf-8") as f:
            f.write(architecture_content)
        
        # Update project step
        project["steps"][1]["status"] = "completed"
        project["steps"][1]["output"] = architecture_content
        project["steps"][1]["file_path"] = str(architecture_file)
        project["updated_at"] = datetime.now().isoformat()
        
        return {"message": "Architecture phase completed", "task_id": f"{request.project_id}_architect"}
        
    except Exception as e:
        project = projects_db.get(request.project_id)
        if project:
            project["steps"][1]["status"] = "error"
            project["steps"][1]["error"] = clean_text_for_encoding(str(e))
            project["status"] = "error"
            project["updated_at"] = datetime.now().isoformat()
        
        raise HTTPException(status_code=500, detail=clean_text_for_encoding(str(e)))

@app.post("/api/agents/planning") 
async def run_planning_agent(request: AgentRequest):
    """Run the real planning agent"""
    try:
        project = get_project(request.project_id)
        workspace_dir = Path(project["workspace"])
        
        # Update project status
        project["status"] = "processing"
        project["current_step"] = "planning"
        project["updated_at"] = datetime.now().isoformat()
        
        # Find required files
        architecture_file = workspace_dir / "architecture.md"
        analysis_file = workspace_dir / "analysis.md"
        
        if not architecture_file.exists():
            raise HTTPException(status_code=400, detail="Architecture file not found. Please run architecture first.")
        
        if AGENTS_AVAILABLE:
            # Use real planning agent (todo_planning_agent)
            try:
                client = create_client()
                planning_content = await todo_planning_agent.run(
                    str(architecture_file), 
                    client, 
                    str(analysis_file) if analysis_file.exists() else None
                )
            except Exception as agent_error:
                print(f"Real planning agent failed, using fallback: {agent_error}")
                planning_content = f"""# Implementation Planning

## Project Overview
Detailed implementation plan for the project development.

## Development Phases

### Phase 1: Foundation Setup
- [ ] Project initialization and setup
- [ ] Development environment configuration
- [ ] Basic project structure
- [ ] Initial dependencies and tools

### Phase 2: Core Development
- [ ] Database schema design and implementation
- [ ] Backend API development
- [ ] Frontend component development
- [ ] User authentication system

### Phase 3: Feature Implementation
- [ ] Core business logic
- [ ] User interface completion
- [ ] Integration testing
- [ ] Performance optimization

### Phase 4: Testing & Deployment
- [ ] Comprehensive testing suite
- [ ] Bug fixes and refinements
- [ ] Production deployment setup
- [ ] Documentation completion

## Technical Tasks

### Backend Development
1. **API Design**
   - RESTful endpoint definition
   - Request/response schemas
   - Error handling implementation

2. **Database Design**
   - Entity relationship modeling
   - Migration scripts
   - Indexing strategy

3. **Business Logic**
   - Core functionality implementation
   - Validation rules
   - Security measures

### Frontend Development
1. **UI Components**
   - Reusable component library
   - Responsive design implementation
   - Accessibility compliance

2. **State Management**
   - Application state architecture
   - Data flow optimization
   - Caching strategies

3. **User Experience**
   - Navigation design
   - Form handling
   - Error messaging

## Timeline Estimation
- **Phase 1**: 1-2 weeks
- **Phase 2**: 3-4 weeks
- **Phase 3**: 2-3 weeks
- **Phase 4**: 1-2 weeks

**Total Estimated Duration**: 7-11 weeks

## Resource Requirements
- Development team
- Testing environment
- Production infrastructure
- Third-party services

Generated at: {datetime.now().isoformat()}
(Note: Generated with fallback due to agent error: {str(agent_error)})
"""
        else:
            # Fallback content 
            planning_content = f"""# Implementation Planning

## Project Overview
Detailed implementation plan for the project development.

## Development Phases

### Phase 1: Foundation Setup
- [ ] Project initialization and setup
- [ ] Development environment configuration
- [ ] Basic project structure
- [ ] Initial dependencies and tools

### Phase 2: Core Development
- [ ] Database schema design and implementation
- [ ] Backend API development
- [ ] Frontend component development
- [ ] User authentication system

### Phase 3: Feature Implementation
- [ ] Core business logic
- [ ] User interface completion
- [ ] Integration testing
- [ ] Performance optimization

### Phase 4: Testing & Deployment
- [ ] Comprehensive testing suite
- [ ] Bug fixes and refinements
- [ ] Production deployment setup
- [ ] Documentation completion

## Technical Tasks

### Backend Development
1. **API Design**
   - RESTful endpoint definition
   - Request/response schemas
   - Error handling implementation

2. **Database Design**
   - Entity relationship modeling
   - Migration scripts
   - Indexing strategy

3. **Business Logic**
   - Core functionality implementation
   - Validation rules
   - Security measures

### Frontend Development
1. **UI Components**
   - Reusable component library
   - Responsive design implementation
   - Accessibility compliance

2. **State Management**
   - Application state architecture
   - Data flow optimization
   - Caching strategies

3. **User Experience**
   - Navigation design
   - Form handling
   - Error messaging

## Timeline Estimation
- **Phase 1**: 1-2 weeks
- **Phase 2**: 3-4 weeks
- **Phase 3**: 2-3 weeks
- **Phase 4**: 1-2 weeks

**Total Estimated Duration**: 7-11 weeks

## Resource Requirements
- Development team
- Testing environment
- Production infrastructure
- Third-party services

Generated at: {datetime.now().isoformat()}
(Note: Generated with simplified agent - real agents not available)
"""
        
        # Save planning file
        planning_file = workspace_dir / "planning.md"
        with open(planning_file, "w", encoding="utf-8") as f:
            f.write(planning_content)
        
        # Update project step
        project["steps"][2]["status"] = "completed"
        project["steps"][2]["output"] = planning_content
        project["steps"][2]["file_path"] = str(planning_file)
        project["updated_at"] = datetime.now().isoformat()
        
        return {"message": "Planning phase completed", "task_id": f"{request.project_id}_planning"}
        
    except Exception as e:
        project = projects_db.get(request.project_id)
        if project:
            project["steps"][2]["status"] = "error"
            project["steps"][2]["error"] = clean_text_for_encoding(str(e))
            project["status"] = "error"
            project["updated_at"] = datetime.now().isoformat()
        
        raise HTTPException(status_code=500, detail=clean_text_for_encoding(str(e)))

@app.post("/api/agents/optimization")
async def run_optimization_agent(request: AgentRequest):
    """Run the real optimization agent"""
    try:
        project = get_project(request.project_id)
        workspace_dir = Path(project["workspace"])
        
        # Update project status
        project["status"] = "processing"
        project["current_step"] = "optimization"
        project["updated_at"] = datetime.now().isoformat()
        
        # Find required files
        architecture_file = workspace_dir / "architecture.md"
        planning_file = workspace_dir / "planning.md"
        analysis_file = workspace_dir / "analysis.md"
        
        if not architecture_file.exists():
            raise HTTPException(status_code=400, detail="Architecture file not found. Please run architecture first.")
        if not planning_file.exists():
            raise HTTPException(status_code=400, detail="Planning file not found. Please run planning first.")
        
        if AGENTS_AVAILABLE:
            # Use real optimization agent
            try:
                client = create_client()
                optimization_content = await prompt_optimization_agent.run(
                    str(architecture_file),
                    str(planning_file), 
                    client,
                    str(analysis_file) if analysis_file.exists() else None
                )
            except Exception as agent_error:
                print(f"Real optimization agent failed, using fallback: {agent_error}")
                optimization_content = f"""# Final Optimized Prompt

## Project Context
This is the final optimized prompt generated from the complete project analysis, architecture design, and implementation planning.

## File References
- Analysis: {analysis_file if analysis_file.exists() else 'Not available'}
- Architecture: {architecture_file}
- Planning: {planning_file}

## Comprehensive Project Prompt

Based on the complete project analysis and technical planning, here is the optimized prompt for code generation:

### Project Overview
Create a modern, scalable application following the specifications outlined in the project files.

### Technical Requirements
- Follow the architecture defined in {architecture_file}
- Implement the tasks outlined in {planning_file}
- Ensure all business requirements are met

### Implementation Guidelines
1. Use modern development practices
2. Implement comprehensive error handling
3. Follow security best practices
4. Ensure code maintainability and scalability
5. Include appropriate testing strategies

### Code Generation Protocol
When implementing this project:
1. Read and understand all referenced files
2. Follow the architectural patterns defined
3. Implement features incrementally based on the task plan
4. Maintain code quality and documentation standards
5. Test each component thoroughly before integration

Generated at: {datetime.now().isoformat()}
(Note: Generated with fallback due to agent error: {str(agent_error)})
"""
        else:
            # Fallback content
            optimization_content = f"""# Final Optimized Prompt

## Project Context
This is the final optimized prompt generated from the complete project analysis, architecture design, and implementation planning.

## File References
- Analysis: {analysis_file if analysis_file.exists() else 'Not available'}
- Architecture: {architecture_file}
- Planning: {planning_file}

## Comprehensive Project Prompt

Based on the complete project analysis and technical planning, here is the optimized prompt for code generation:

### Project Overview
Create a modern, scalable application following the specifications outlined in the project files.

### Technical Requirements
- Follow the architecture defined in {architecture_file}
- Implement the tasks outlined in {planning_file}
- Ensure all business requirements are met

### Implementation Guidelines
1. Use modern development practices
2. Implement comprehensive error handling
3. Follow security best practices
4. Ensure code maintainability and scalability
5. Include appropriate testing strategies

### Code Generation Protocol
When implementing this project:
1. Read and understand all referenced files
2. Follow the architectural patterns defined
3. Implement features incrementally based on the task plan
4. Maintain code quality and documentation standards
5. Test each component thoroughly before integration

Generated at: {datetime.now().isoformat()}
(Note: Generated with simplified agent - real agents not available)
"""
        
        # Save optimization file
        optimization_file = workspace_dir / "final_prompt.md"
        with open(optimization_file, "w", encoding="utf-8") as f:
            f.write(optimization_content)
        
        # Update project step
        project["steps"][3]["status"] = "completed"
        project["steps"][3]["output"] = optimization_content
        project["steps"][3]["file_path"] = str(optimization_file)
        project["status"] = "completed"
        project["updated_at"] = datetime.now().isoformat()
        
        return {"message": "Optimization phase completed", "task_id": f"{request.project_id}_optimization"}
        
    except Exception as e:
        project = projects_db.get(request.project_id)
        if project:
            project["steps"][3]["status"] = "error"
            project["steps"][3]["error"] = clean_text_for_encoding(str(e))
            project["status"] = "error"
            project["updated_at"] = datetime.now().isoformat()
        
        raise HTTPException(status_code=500, detail=clean_text_for_encoding(str(e)))

@app.post("/api/files/read")
async def read_file(request: dict):
    """Read a file with UTF-8 support"""
    file_path = Path(request["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        return {
            "path": str(file_path),
            "content": content,
            "size": file_path.stat().st_size,
            "modified": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=clean_text_for_encoding(str(e)))

@app.post("/api/files/write")
async def write_file(request: dict):
    """Write a file with UTF-8 support"""
    file_path = Path(request["file_path"])
    content = request["content"]
    
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        return {"message": "File written successfully", "path": str(file_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=clean_text_for_encoding(str(e)))

@app.post("/api/files/list")
async def list_files(request: dict):
    """List files in directory with UTF-8 support"""
    dir_path = Path(request["directory_path"])
    if not dir_path.exists():
        raise HTTPException(status_code=404, detail="Directory not found")
    
    try:
        files = []
        for item in dir_path.iterdir():
            stat = item.stat()
            files.append({
                "name": item.name,
                "path": str(item),
                "is_directory": item.is_dir(),
                "size": stat.st_size if item.is_file() else None,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
        
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=clean_text_for_encoding(str(e)))

if __name__ == "__main__":
    print("Starting Agent for Code Agents Backend...")
    print("UTF-8 encoding configured")
    uvicorn.run(app, host="0.0.0.0", port=8002)
