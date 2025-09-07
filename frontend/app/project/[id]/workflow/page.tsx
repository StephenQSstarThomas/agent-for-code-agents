'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw, FileText, PanelRightOpen, PanelRightClose, Archive, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { MainLayout } from '@/components/layout/main-layout'
import { WorkflowSteps } from '@/components/workflow/workflow-steps'
import { ChatInterface } from '@/components/chat/chat-interface'
import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { FileBrowser } from '@/components/editor/file-browser'
import { useAppStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { sanitizeErrorMessage, cleanUnicodeText } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useProjectLoader } from '@/hooks/use-project-loader'

export default function ProjectWorkflowPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const { 
    projects,
    updateProject, 
    updateProjectStep,
    addMessage,
    setProcessing,
    isProcessing 
  } = useAppStore()
  
  // Get the raw project ID from URL params
  const rawProjectId = params.id as string
  
  // For workspace projects, the URL param might be the workspace folder name
  // We need to find the actual project by checking the store
  const decodedProjectId = decodeURIComponent(rawProjectId)
  
  let actualProject = projects.find(p => {
    // Direct ID match (both raw and decoded)
    if (p.id === rawProjectId || p.id === decodedProjectId) return true
    
    // Workspace folder name match
    if (p.workspace) {
      const workspaceName = p.workspace.split('/').pop() || p.workspace.split('\\').pop()
      if (workspaceName === rawProjectId || workspaceName === decodedProjectId) return true
    }
    
    return false
  })
  
  // Use the actual project ID, with better fallback logic
  const projectId = actualProject ? actualProject.id : decodedProjectId

  console.log('Raw project ID from params:', rawProjectId)
  console.log('Found project:', actualProject)
  console.log('Using project ID:', projectId)

  // Use the project loader hook
  const { isLoading: isLoadingProject, workspacePath, project: currentProject, hasExistingWorkflow } = useProjectLoader({
    rawProjectId,
    projectId,
    actualProject
  })
  
  const [isRunning, setIsRunning] = useState(false)
  const [showFileViewer, setShowFileViewer] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [isArchiving, setIsArchiving] = useState(false)

  // Project loading is now handled by the useProjectLoader hook

  const handleStepAction = async (stepId: string, action: 'run' | 'edit' | 'regenerate' | 'load') => {
    if (!currentProject) return

    // For load action, try to load existing files
    if (action === 'load') {
      try {
        const step = currentProject.steps.find(s => s.id === stepId)
        if (step?.filePath) {
          // Try to read the existing file
          const fileData = await apiClient.readFile(step.filePath)
          
          // Update step with loaded content
          updateProjectStep(currentProject.id, stepId, { 
            status: 'completed',
            output: fileData.content,
            filePath: step.filePath
          })

          addMessage({
            type: 'assistant',
            content: `Loaded existing ${stepId} from ${step.filePath}`,
            metadata: { step: stepId }
          })

          toast({
            title: "Workflow loaded",
            description: `Loaded existing ${stepId} file successfully`,
            variant: "default",
          })
        } else {
          // Try to find file by convention - try multiple possible paths
          const possiblePaths = [
            `${workspacePath}/${stepId}.md`,
            `workspace/${rawProjectId}/${stepId}.md`,
            `workspace/${decodedProjectId}/${stepId}.md`,
          ]
          
          let fileFound = false
          for (const conventionalPath of possiblePaths) {
            try {
              console.log(`Trying to load file from: ${conventionalPath}`)
              const fileData = await apiClient.readFile(conventionalPath)
              
              updateProjectStep(currentProject.id, stepId, { 
                status: 'completed',
                output: fileData.content,
                filePath: conventionalPath
              })

              addMessage({
                type: 'assistant',
                content: `Loaded existing ${stepId} from ${conventionalPath}`,
                metadata: { step: stepId }
              })

              toast({
                title: "Workflow loaded",
                description: `Found and loaded ${stepId}.md`,
                variant: "default",
              })
              
              fileFound = true
              break
            } catch (fileError) {
              console.log(`File not found at: ${conventionalPath}`)
            }
          }
          
          if (!fileFound) {
            addMessage({
              type: 'system',
              content: `No existing ${stepId} file found in any of the expected locations. You can run the step to generate it.`,
              metadata: { step: stepId }
            })

            toast({
              title: "No existing file",
              description: `No ${stepId}.md file found in workspace`,
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error(`Failed to load ${stepId}:`, error)
        addMessage({
          type: 'system',
          content: `Failed to load ${stepId}: ${error}`,
          metadata: { step: stepId }
        })
      }
      return
    }

    setIsRunning(true)
    setProcessing(true)

    try {
      // Update step status to in_progress
      updateProjectStep(currentProject.id, stepId, { status: 'in_progress' })
      
      addMessage({
        type: 'system',
        content: `Starting ${stepId} phase...`,
        metadata: { step: stepId }
      })

      // Call real backend API based on step
      let result
      const workspaceBase = currentProject.workspace || `workspace/${projectId}`
      switch (stepId) {
        case 'analysis':
          result = await apiClient.runAnalysisAgent(projectId, currentProject.description || '')
          break
        case 'architecture':
          result = await apiClient.runArchitectAgent(projectId, `${workspaceBase}/analysis.md`)
          break
        case 'planning':
          result = await apiClient.runPlanningAgent(projectId, `${workspaceBase}/architecture.md`, `${workspaceBase}/analysis.md`)
          break
        case 'optimization':
          result = await apiClient.runOptimizationAgent(projectId, `${workspaceBase}/architecture.md`, `${workspaceBase}/planning.md`, `${workspaceBase}/analysis.md`)
          break
        default:
          throw new Error(`Unknown step: ${stepId}`)
      }

      // Wait for completion and get result
      let completed = false
      let attempts = 0
      while (!completed && attempts < 30) { // Wait up to 5 minutes
        await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
        
        try {
          const project = await apiClient.getProject(projectId) as any
          const step = project.steps.find((s: any) => s.id === stepId)
          
          if (step?.status === 'completed') {
            completed = true
            
            // Clean output content to prevent encoding issues
            const cleanOutput = step.output ? cleanUnicodeText(step.output) : `${stepId} completed`
            
            // Update step to completed
            updateProjectStep(currentProject.id, stepId, { 
              status: 'completed',
              output: cleanOutput,
              filePath: step.file_path || `${workspaceBase}/${stepId}.md`
            })

            addMessage({
              type: 'assistant',
              content: `${stepId} phase completed successfully!`,
              metadata: { step: stepId }
            })
          } else if (step?.status === 'error') {
            // Clean error message to prevent encoding issues - multiple layers of protection
            const rawErrorMsg = step.error || `${stepId} failed`
            const cleanErrorMsg = cleanUnicodeText(String(rawErrorMsg))
            const safeErrorMsg = cleanErrorMsg || `${stepId} encountered an error`
            throw new Error(safeErrorMsg)
          }
        } catch (pollError) {
          console.error('Error polling project status:', sanitizeErrorMessage(pollError))
        }
        
        attempts++
      }

      if (!completed) {
        throw new Error(`${stepId} timed out after 5 minutes`)
      }

    } catch (error) {
      updateProjectStep(currentProject.id, stepId, { status: 'error' })
      
      // Clean error message to prevent encoding issues
      const cleanErrorMessage = sanitizeErrorMessage(error)
      
      addMessage({
        type: 'system',
        content: `Error in ${stepId} phase: ${cleanErrorMessage}`,
        metadata: { step: stepId }
      })
    } finally {
      setIsRunning(false)
      setProcessing(false)
    }
  }

  const handleFileOpen = (filePath: string) => {
    setSelectedFile(filePath)
    setShowFileViewer(true)
    addMessage({
      type: 'system',
      content: `Opening file: ${filePath}`,
    })
  }

  const handleMessageSend = (message: string) => {
    // Handle user messages
    addMessage({
      type: 'user',
      content: message,
    })

    // Simulate AI response
    setTimeout(() => {
      addMessage({
        type: 'assistant',
        content: `I understand you want to: "${message}". How can I help with your project workflow?`,
      })
    }, 1000)
  }

  const handleArchiveProject = async () => {
    if (!currentProject) return
    
    setIsArchiving(true)
    try {
      const result = await apiClient.archiveProject(projectId)
      
      // Update project status
      updateProject(projectId, {
        status: 'archived',
        archivedAt: new Date(result.archived_at),
        updatedAt: new Date()
      })
      
      // Show success toast with local path
      toast({
        title: "🎉 Project Archived Successfully!",
        description: `${result.project_name} has been archived. Files saved to: ${result.local_path}`,
        variant: "default",
        duration: 10000,
      })
      
      // Show success message with local path
      addMessage({
        type: 'assistant',
        content: `🎉 Project "${result.project_name}" has been successfully archived!\n\n📁 **Local Path:** \`${result.local_path}\`\n\nYou can find all your project files at the above location. The project has been marked as archived and is now read-only.`,
      })
      
      // Optionally redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 5000)
      
    } catch (error) {
      console.error('Failed to archive project:', error)
      addMessage({
        type: 'assistant',
        content: `❌ Failed to archive project: ${sanitizeErrorMessage(String(error))}`,
      })
    } finally {
      setIsArchiving(false)
    }
  }

  const getOverallProgress = () => {
    if (!currentProject) return 0
    const completedSteps = currentProject.steps.filter(step => step.status === 'completed').length
    return (completedSteps / currentProject.steps.length) * 100
  }

  if (isLoadingProject || !currentProject) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">
              {isLoadingProject ? 'Loading Project...' : 'Initializing...'}
            </h2>
            <p className="text-muted-foreground">
              {isLoadingProject 
                ? 'Please wait while we load your project details.' 
                : 'Setting up your workspace project.'}
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold">{currentProject.name}</h1>
              <p className="text-muted-foreground mt-1">AI Workflow Execution</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFileViewer(!showFileViewer)}
            >
              {showFileViewer ? (
                <React.Fragment>
                  <PanelRightClose className="h-4 w-4 mr-2" />
                  Hide Files
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <PanelRightOpen className="h-4 w-4 mr-2" />
                  Show Files
                </React.Fragment>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isRunning}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button
              variant={isRunning ? "secondary" : "default"}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <React.Fragment>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </React.Fragment>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overall Progress</CardTitle>
                  <CardDescription>AI workflow execution progress</CardDescription>
                </div>
                <div className="text-2xl font-bold">{Math.round(getOverallProgress())}%</div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={getOverallProgress()} className="h-3" />
              
              {/* Archive Button for Completed Projects */}
              {currentProject?.status === 'completed' && getOverallProgress() === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                        🎉 Project Completed!
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        All workflow steps have been completed successfully. You can now archive this project.
                      </p>
                    </div>
                    <Button
                      onClick={handleArchiveProject}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isArchiving}
                    >
                      {isArchiving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Archiving...
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Project
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content - Dynamic Layout */}
        <div className={`grid gap-6 ${showFileViewer ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Left Column - Workflow Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={showFileViewer ? 'xl:col-span-1' : 'lg:col-span-1'}
          >
            <WorkflowSteps
              onStepAction={handleStepAction}
              onFileOpen={handleFileOpen}
              hasExistingWorkflow={hasExistingWorkflow}
            />
          </motion.div>

          {/* Middle Column - Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`h-[600px] ${showFileViewer ? 'xl:col-span-1' : 'lg:col-span-1'}`}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Workflow Assistant</CardTitle>
                <CardDescription>
                  Chat with AI about your project workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full p-0">
                <ChatInterface 
                  onMessageSend={handleMessageSend}
                  className="h-full"
                  disabled={isRunning}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - File Viewer */}
          {showFileViewer && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ delay: 0.1 }}
              className="xl:col-span-1"
            >
              <div className="space-y-4">
                <Card className="h-[300px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Project Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {workspacePath && (
                      <FileBrowser
                        initialPath={workspacePath}
                        onFileSelect={setSelectedFile}
                        selectedFile={selectedFile}
                        height={220}
                        showSearch={false}
                      />
                    )}
                    {!workspacePath && (
                      <div className="p-4 text-center text-muted-foreground">
                        Loading workspace...
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-[290px]"
                  >
                    <MarkdownEditor
                      filePath={selectedFile}
                      title={selectedFile.split('/').pop() || 'File'}
                      height={290}
                      readOnly={false}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
