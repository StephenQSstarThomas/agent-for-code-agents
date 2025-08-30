// API client for backend communication
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002'

export class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      console.log(`Making API request to: ${url}`)
      console.log(`Request config:`, config)
      
      const response = await fetch(url, config)
      console.log(`API response status: ${response.status}`)

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`

        // Try to get error details from response
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // If we can't parse error response, use default message
        }

        throw new Error(errorMessage)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        console.log(`API response data:`, data)
        return data
      }

      const text = await response.text()
      console.log(`API response text:`, text)
      return text as unknown as T
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      
      // Check for network errors specifically
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error(`Cannot connect to backend server at ${this.baseURL}. Please ensure the backend is running on the correct port.`)
      }
      
      // Check for CORS errors
      if (error instanceof TypeError && error.message.includes('CORS')) {
        throw new Error(`CORS error when connecting to ${this.baseURL}. Backend CORS configuration may be incorrect.`)
      }
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`API request to ${endpoint} failed: ${error.message}`)
      }
      throw new Error(`API request to ${endpoint} failed: ${String(error)}`)
    }
  }

  // Project API
  async createProject(projectData: {
    name: string
    description: string
    user_prompt: string
    reference_urls?: string[]
    reference_files?: string[]
  }): Promise<{
    id: string
    name: string
    description: string
    status: string
    workspace: string
    created_at: string
    updated_at: string
    steps: Array<{
      id: string
      name: string
      status: string
      description?: string
      output?: string
      file_path?: string
    }>
  }> {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async getProject(projectId: string) {
    return this.request(`/api/projects/${projectId}`)
  }

  async getProjectWorkspace(projectId: string): Promise<{project_id: string, workspace_path: string, exists: boolean}> {
    return this.request(`/api/projects/${projectId}/workspace`)
  }

  async archiveProject(projectId: string): Promise<{message: string, project_id: string, local_path: string, project_name: string, archived_at: string}> {
    return this.request(`/api/projects/${projectId}/archive`, {
      method: 'POST',
    })
  }

  async listProjects() {
    return this.request('/api/projects')
  }

  async scanWorkspaceProjects() {
    return this.request('/api/workspace/projects')
  }

  // Agent API
  async runAnalysisAgent(projectId: string, userPrompt: string) {
    return this.request(`/api/agents/analysis`, {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, user_prompt: userPrompt }),
    })
  }

  async runArchitectAgent(projectId: string, analysisPath: string) {
    return this.request(`/api/agents/architect`, {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, analysis_path: analysisPath }),
    })
  }

  async runPlanningAgent(projectId: string, architecturePath: string, analysisPath?: string) {
    return this.request(`/api/agents/planning`, {
      method: 'POST',
      body: JSON.stringify({ 
        project_id: projectId, 
        architecture_path: architecturePath,
        analysis_path: analysisPath 
      }),
    })
  }

  async runOptimizationAgent(
    projectId: string, 
    architecturePath: string, 
    taskPath: string, 
    analysisPath?: string
  ) {
    return this.request(`/api/agents/optimization`, {
      method: 'POST',
      body: JSON.stringify({ 
        project_id: projectId,
        architecture_path: architecturePath,
        task_path: taskPath,
        analysis_path: analysisPath
      }),
    })
  }

  // File API
  async readFile(filePath: string): Promise<{path: string, content: string, size: number, modified: string}> {
    return this.request(`/api/files/read`, {
      method: 'POST',
      body: JSON.stringify({ file_path: filePath }),
    })
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    return this.request(`/api/files/write`, {
      method: 'POST',
      body: JSON.stringify({ file_path: filePath, content }),
    })
  }

  async listFiles(directoryPath: string): Promise<{name: string, path: string, is_directory: boolean, size: number | null, modified: string}[]> {
    return this.request(`/api/files/list`, {
      method: 'POST',
      body: JSON.stringify({ directory_path: directoryPath }),
    })
  }

  // WebSocket for real-time updates
  createWebSocket(endpoint: string): WebSocket {
    const wsUrl = this.baseURL.replace('http', 'ws') + endpoint
    return new WebSocket(wsUrl)
  }

  // Server-Sent Events for progress updates
  createEventSource(endpoint: string): EventSource {
    const url = `${this.baseURL}${endpoint}`
    return new EventSource(url)
  }
}

// Default API client instance
export const apiClient = new ApiClient()

// React Query helpers
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  files: (path: string) => ['files', path] as const,
  fileContent: (path: string) => ['files', 'content', path] as const,
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ProjectResponse {
  id: string
  name: string
  description: string
  status: string
  workspace: string
  created_at: string
  updated_at: string
}

export interface AgentResponse {
  status: string
  output: string
  file_path?: string
  error?: string
}

export interface FileResponse {
  path: string
  content: string
  size: number
  modified: string
}