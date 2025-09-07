// API client for backend communication
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002'

export class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const timeoutMs = 30000 // 30 second timeout
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    let lastError: Error | undefined

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Making API request to: ${url} (attempt ${attempt + 1}/${retries + 1})`)
        if (attempt > 0) {
          console.log(`Request config:`, config)
        }
        
        const response = await fetch(url, config)
        console.log(`API response status: ${response.status}`)

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`
          let errorDetails = null

          // Try to get error details from response
          try {
            const errorData = await response.json()
            errorDetails = errorData
            if (errorData.detail) {
              errorMessage = errorData.detail
            } else if (errorData.message) {
              errorMessage = errorData.message
            } else if (typeof errorData === 'string') {
              errorMessage = errorData
            }
          } catch {
            // If we can't parse error response, use status text
            errorMessage = response.statusText || errorMessage
          }

          // For 4xx errors, don't retry
          if (response.status >= 400 && response.status < 500) {
            throw new ApiError(errorMessage, response.status, errorDetails)
          }

          // For 5xx errors, retry
          if (attempt === retries) {
            throw new ApiError(errorMessage, response.status, errorDetails)
          }
          
          console.warn(`Server error (${response.status}), retrying in ${(attempt + 1) * 1000}ms...`)
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000))
          continue
        }

        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          if (attempt > 0) {
            console.log(`API request succeeded on attempt ${attempt + 1}`)
          }
          return data
        }

        const text = await response.text()
        if (attempt > 0) {
          console.log(`API request succeeded on attempt ${attempt + 1}`)
        }
        return text as unknown as T
      } catch (error) {
        lastError = error as Error
        console.error(`API request attempt ${attempt + 1} failed for ${endpoint}:`, error)
        
        // Check for network errors specifically
        if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
          if (attempt === retries) {
            throw new Error(`Cannot connect to backend server at ${this.baseURL}. Please ensure the backend is running on the correct port.`)
          }
          console.warn(`Network error, retrying in ${(attempt + 1) * 1000}ms...`)
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000))
          continue
        }
        
        // Check for timeout errors
        if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
          if (attempt === retries) {
            throw new Error(`Request to ${endpoint} timed out after ${timeoutMs}ms`)
          }
          console.warn(`Timeout error, retrying in ${(attempt + 1) * 1000}ms...`)
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000))
          continue
        }
        
        // Check for CORS errors
        if (error instanceof TypeError && error.message.includes('CORS')) {
          throw new Error(`CORS error when connecting to ${this.baseURL}. Backend CORS configuration may be incorrect.`)
        }
        
        // For API errors, don't retry
        if (error instanceof ApiError) {
          throw error
        }
        
        // For other errors, retry
        if (attempt === retries) {
          if (error instanceof Error) {
            throw new Error(`API request to ${endpoint} failed after ${retries + 1} attempts: ${error.message}`)
          }
          throw new Error(`API request to ${endpoint} failed after ${retries + 1} attempts: ${String(error)}`)
        }
        
        console.warn(`Retrying in ${(attempt + 1) * 1000}ms...`)
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000))
      }
    }

    throw lastError || new Error(`API request to ${endpoint} failed after ${retries + 1} attempts`)
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
    // Properly encode project ID for URL
    const encodedProjectId = encodeURIComponent(projectId)
    return this.request(`/api/projects/${encodedProjectId}`)
  }

  async getProjectWorkspace(projectId: string): Promise<{project_id: string, workspace_path: string, exists: boolean}> {
    try {
      // Properly encode project ID for URL
      const encodedProjectId = encodeURIComponent(projectId)
      console.log(`Getting workspace for project: ${projectId} (encoded: ${encodedProjectId})`)
      return await this.request(`/api/projects/${encodedProjectId}/workspace`)
    } catch (error) {
      console.error(`Failed to get workspace for project ${projectId}:`, error)
      // Return fallback workspace data
      return {
        project_id: projectId,
        workspace_path: `workspace/${projectId}`,
        exists: false
      }
    }
  }

  async archiveProject(projectId: string): Promise<{message: string, project_id: string, local_path: string, project_name: string, archived_at: string}> {
    const encodedProjectId = encodeURIComponent(projectId)
    return this.request(`/api/projects/${encodedProjectId}/archive`, {
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