import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiClient } from './api'

// Types
export interface ProjectStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  output?: string
  filePath?: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'processing' | 'completed' | 'error' | 'archived'
  steps: ProjectStep[]
  workspace: string
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface AppState {
  // UI State
  sidebarOpen: boolean
  darkMode: boolean
  
  // Project State
  currentProject: Project | null
  projects: Project[]
  
  // Chat State
  messages: ChatMessage[]
  isProcessing: boolean
  
  // Editor State
  activeFile: string | null
  openFiles: string[]
  fileContents: Record<string, string>
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
  
  // Project Actions
  createProject: (name: string, description: string) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  duplicateProject: (id: string, newName: string) => void
  setCurrentProject: (project: Project | null) => void
  addProjectStep: (projectId: string, step: Omit<ProjectStep, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProjectStep: (projectId: string, stepId: string, updates: Partial<ProjectStep>) => void
  loadWorkspaceProjects: () => Promise<void>
  
  // Chat Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setProcessing: (processing: boolean) => void
  
  // Editor Actions
  openFile: (filePath: string) => void
  closeFile: (filePath: string) => void
  setActiveFile: (filePath: string | null) => void
  updateFileContent: (filePath: string, content: string) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial State
      sidebarOpen: true,
      darkMode: false,
      currentProject: null,
      projects: [],
      messages: [],
      isProcessing: false,
      activeFile: null,
      openFiles: [],
      fileContents: {},
      
      // UI Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode
        // Update document class for theme switching
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newDarkMode)
        }
        return { darkMode: newDarkMode }
      }),
      
      // Project Actions
      createProject: (name, description) => {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name,
          description,
          status: 'draft',
          steps: [
            {
              id: 'analysis',
              name: 'Requirements Analysis',
              description: 'Analyzing project requirements and creating structured analysis',
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'architecture',
              name: 'Technical Architecture',
              description: 'Designing technical architecture and system components',
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'planning',
              name: 'Implementation Planning',
              description: 'Creating detailed task breakdown and implementation plan',
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'optimization',
              name: 'Prompt Optimization',
              description: 'Generating optimized final prompt for code generation',
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          workspace: `workspace/${name.toLowerCase().replace(/\s+/g, '-')}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }))
      },
      
      addProject: (project) => set((state) => {
        console.log('=== ADD PROJECT DEBUG ===')
        console.log('Adding project:', { id: project.id, workspace: project.workspace, name: project.name })
        console.log('Current projects before add:', state.projects.map(p => ({ id: p.id, workspace: p.workspace, name: p.name })))

        // Check for duplicates
        const existingProject = state.projects.find(p => p.id === project.id)
        if (existingProject) {
          console.warn('Project with same ID already exists:', existingProject)
          return state // Don't add duplicate
        }

        const newProjects = [...state.projects, project]
        console.log('Projects after add:', newProjects.map(p => ({ id: p.id, workspace: p.workspace, name: p.name })))

        return {
          projects: newProjects
        }
      }),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, ...updates, updatedAt: new Date() }
          : state.currentProject
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject
      })),

      duplicateProject: (id, newName) => set((state) => {
        const originalProject = state.projects.find(p => p.id === id)
        if (!originalProject) return state

        const duplicatedProject: Project = {
          ...originalProject,
          id: crypto.randomUUID(),
          name: newName,
          status: 'draft',
          steps: originalProject.steps.map(step => ({
            ...step,
            id: step.id,
            status: 'pending' as const,
            output: undefined,
            filePath: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          workspace: `workspace/${newName.toLowerCase().replace(/\s+/g, '-')}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        return {
          projects: [...state.projects, duplicatedProject]
        }
      }),
      
      setCurrentProject: (project) => set({ currentProject: project }),

      loadWorkspaceProjects: async () => {
        try {
          const workspaceProjects = await apiClient.scanWorkspaceProjects() as any[]

          if (!Array.isArray(workspaceProjects)) {
            console.warn('Workspace projects response is not an array:', workspaceProjects)
            return
          }

          const convertedProjects: Project[] = workspaceProjects
            .filter((wp: any) => wp && wp.id) // Filter out invalid entries
            .map((wp: any) => ({
              id: wp.id,
              name: wp.name || 'Unnamed Project',
              description: wp.description || '',
              status: wp.status as Project['status'] || 'draft',
              steps: Array.isArray(wp.steps) ? wp.steps.map((step: any) => ({
                id: step.id || '',
                name: step.name || '',
                description: step.description || '',
                status: step.status as ProjectStep['status'] || 'pending',
                output: step.output || undefined,
                filePath: step.file_path || undefined,
                createdAt: new Date(step.created_at || Date.now()),
                updatedAt: new Date(step.updated_at || Date.now()),
              })) : [],
              workspace: wp.workspace || '',
              createdAt: new Date(wp.created_at),
              updatedAt: new Date(wp.updated_at),
            }))

          console.log('=== LOAD WORKSPACE PROJECTS DEBUG ===')
          console.log('Raw API response projects:', workspaceProjects.map(p => ({ id: p.id, workspace: p.workspace, name: p.name })))
          console.log('Converted projects:', convertedProjects.map(p => ({ id: p.id, workspace: p.workspace, name: p.name })))

          set((state) => {
            console.log('Current state projects:', state.projects.map(p => ({ id: p.id, workspace: p.workspace, name: p.name })))

            // Filter out workspace projects that already exist (to avoid duplicates)
            const existingWorkspaceProjects = state.projects.filter(p =>
              p.workspace && p.workspace.startsWith('workspace/')
            )
            const existingWorkspacePaths = new Set(
              existingWorkspaceProjects.map(p => p.workspace)
            )

            console.log('Existing workspace projects:', existingWorkspaceProjects.map(p => ({ id: p.id, workspace: p.workspace })))
            console.log('Existing workspace paths:', Array.from(existingWorkspacePaths))

            // Only add new workspace projects
            const existingProjectIds = new Set(state.projects.map(p => p.id))
            const newProjects = convertedProjects.filter(project =>
              !existingWorkspacePaths.has(project.workspace) &&
              !existingProjectIds.has(project.id)
            )

            console.log('New projects to add:', newProjects.map(p => ({ id: p.id, workspace: p.workspace })))
            console.log('Final projects count:', state.projects.length + newProjects.length)

            const finalProjects = [...state.projects, ...newProjects]
            console.log('Final projects list:', finalProjects.map(p => ({ id: p.id, workspace: p.workspace, name: p.name })))

            return {
              projects: finalProjects
            }
          })

          console.log(`Successfully loaded ${convertedProjects.length} workspace projects`)
        } catch (error) {
          console.error('Failed to load workspace projects:', error)
          // Re-throw error so dashboard can handle it
          throw error
        }
      },

      addProjectStep: (projectId, step) => {
        const newStep: ProjectStep = {
          ...step,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, steps: [...p.steps, newStep], updatedAt: new Date() }
              : p
          ),
          currentProject: state.currentProject?.id === projectId
            ? { ...state.currentProject, steps: [...state.currentProject.steps, newStep], updatedAt: new Date() }
            : state.currentProject
        }))
      },
      
      updateProjectStep: (projectId, stepId, updates) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === projectId 
            ? { 
                ...p, 
                steps: p.steps.map(s => 
                  s.id === stepId ? { ...s, ...updates, updatedAt: new Date() } : s
                ),
                updatedAt: new Date()
              }
            : p
        ),
        currentProject: state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              steps: state.currentProject.steps.map(s =>
                s.id === stepId ? { ...s, ...updates, updatedAt: new Date() } : s
              ),
              updatedAt: new Date()
            }
          : state.currentProject
      })),
      
      // Chat Actions
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        set((state) => ({
          messages: [...state.messages, newMessage]
        }))
      },
      
      clearMessages: () => set({ messages: [] }),
      
      setProcessing: (processing) => set({ isProcessing: processing }),
      
      // Editor Actions
      openFile: (filePath) => set((state) => ({
        openFiles: state.openFiles.includes(filePath) 
          ? state.openFiles 
          : [...state.openFiles, filePath],
        activeFile: filePath,
      })),
      
      closeFile: (filePath) => set((state) => {
        const newOpenFiles = state.openFiles.filter(f => f !== filePath)
        const newActiveFile = state.activeFile === filePath
          ? newOpenFiles[newOpenFiles.length - 1] || null
          : state.activeFile
        
        const newFileContents = { ...state.fileContents }
        delete newFileContents[filePath]
        
        return {
          openFiles: newOpenFiles,
          activeFile: newActiveFile,
          fileContents: newFileContents,
        }
      }),
      
      setActiveFile: (filePath) => set({ activeFile: filePath }),
      
      updateFileContent: (filePath, content) => set((state) => ({
        fileContents: {
          ...state.fileContents,
          [filePath]: content,
        }
      })),
    }),
    { name: 'app-store' }
  )
)