import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { Project } from '@/lib/store'

interface UseProjectLoaderOptions {
  rawProjectId: string
  projectId: string
  actualProject: Project | undefined
}

export function useProjectLoader({ rawProjectId, projectId, actualProject }: UseProjectLoaderOptions) {
  const { currentProject, setCurrentProject, loadWorkspaceProjects } = useAppStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [workspacePath, setWorkspacePath] = useState<string>('')

  useEffect(() => {
    const loadProject = async () => {
      if (currentProject && currentProject.id === projectId) {
        // Project already loaded
        if (currentProject.workspace) {
          setWorkspacePath(currentProject.workspace)
        }
        return
      }

      setIsLoading(true)

      try {
        // First check if we have the project in store
        if (actualProject) {
          console.log('Using project from store:', actualProject)
          setCurrentProject(actualProject)
          if (actualProject.workspace) {
            setWorkspacePath(actualProject.workspace)
          }
          return
        }

        // If not in store, try to load workspace projects first
        console.log('Loading workspace projects to find:', projectId)
        await loadWorkspaceProjects()

        // After loading workspace projects, check again
        const { projects } = useAppStore.getState()
        const foundProject = projects.find(p => {
          if (p.id === projectId) return true
          if (p.workspace) {
            const workspaceName = p.workspace.split('/').pop() || p.workspace.split('\\').pop()
            if (workspaceName === rawProjectId) return true
          }
          return false
        })

        if (foundProject) {
          console.log('Found project after workspace load:', foundProject)
          setCurrentProject(foundProject)
          if (foundProject.workspace) {
            setWorkspacePath(foundProject.workspace)
          }
          return
        }

         // For workspace projects, don't try API if the projectId looks like a workspace path
         if (projectId.includes('workspace\\') || projectId.includes('workspace/')) {
           console.log('Skipping API call for workspace project:', projectId)
           throw new Error('Workspace project not found in store')
         }

         // If still not found, try API (only for non-workspace projects)
         console.log('Attempting to load project from API:', projectId)
         try {
           const project = await apiClient.getProject(projectId) as any
          
          const transformedProject: Project = {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status as Project['status'],
            steps: project.steps?.map((step: any) => ({
              id: step.id,
              name: step.name,
              description: step.name,
              status: step.status as any,
              output: step.output,
              filePath: step.file_path,
              error: step.error,
              createdAt: new Date(step.created_at || Date.now()),
              updatedAt: new Date(step.updated_at || Date.now()),
            })) || [],
            workspace: project.workspace,
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.updated_at),
          }
          
          setCurrentProject(transformedProject)
          if (transformedProject.workspace) {
            setWorkspacePath(transformedProject.workspace)
          }
        } catch (apiError) {
          console.error('API failed, creating fallback project:', apiError)
          
          // Create a fallback project for workspace projects
          const fallbackProject: Project = {
            id: projectId,
            name: rawProjectId || 'Workspace Project',
            description: 'Workspace project - continuing workflow',
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
            workspace: `workspace/${rawProjectId}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          setCurrentProject(fallbackProject)
          setWorkspacePath(fallbackProject.workspace)
          
          toast({
            title: "Workspace Project Loaded",
            description: `Loaded ${fallbackProject.name} from workspace. You can continue the workflow.`,
            variant: "default",
          })
        }
      } catch (error) {
        console.error('Failed to load project:', error)
        toast({
          title: "Error loading project",
          description: "Failed to load project. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [projectId, rawProjectId, actualProject, currentProject, setCurrentProject, loadWorkspaceProjects, toast])

  // Load workspace path
  useEffect(() => {
    const loadWorkspacePath = async () => {
      if (workspacePath) return // Already have workspace path

      // For workspace projects, prefer the project's workspace path
      if (currentProject?.workspace) {
        setWorkspacePath(currentProject.workspace)
        return
      }

      try {
        const workspace = await apiClient.getProjectWorkspace(projectId)
        setWorkspacePath(workspace.workspace_path)
      } catch (error) {
        console.warn('Workspace API not available, using fallback path:', error)
        // Use fallback workspace path - this is normal for workspace projects
        const fallbackPath = `workspace/${rawProjectId}`
        setWorkspacePath(fallbackPath)
      }
    }

    if (currentProject) {
      loadWorkspacePath()
    }
  }, [projectId, rawProjectId, currentProject, workspacePath])

  // Check if project has existing workflow files by actually checking for files
  const [hasExistingWorkflow, setHasExistingWorkflow] = useState(false)

  useEffect(() => {
    const checkForExistingFiles = async () => {
      if (!currentProject || !workspacePath) return

      // Check if any step has completed status or files
      const hasCompletedSteps = currentProject.steps?.some(step => 
        step.status === 'completed' || step.filePath || step.output
      )

      if (hasCompletedSteps) {
        setHasExistingWorkflow(true)
        return
      }

      // Check for actual files in workspace
      try {
        const stepIds = ['analysis', 'architecture', 'planning', 'optimization']
        const possiblePaths = [
          ...stepIds.map(id => `${workspacePath}/${id}.md`),
          ...stepIds.map(id => `workspace/${rawProjectId}/${id}.md`),
        ]

        for (const filePath of possiblePaths) {
          try {
            await apiClient.readFile(filePath)
            console.log(`Found existing workflow file: ${filePath}`)
            setHasExistingWorkflow(true)
            return
          } catch {
            // File doesn't exist, continue checking
          }
        }
        
        setHasExistingWorkflow(false)
      } catch (error) {
        console.warn('Failed to check for existing workflow files:', error)
        setHasExistingWorkflow(false)
      }
    }

    checkForExistingFiles()
  }, [currentProject, workspacePath, rawProjectId])

  return {
    isLoading,
    workspacePath,
    project: currentProject,
    hasExistingWorkflow
  }
}
