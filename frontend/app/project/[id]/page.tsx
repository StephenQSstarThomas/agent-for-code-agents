'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MainLayout } from '@/components/layout/main-layout'
import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { FileBrowser } from '@/components/editor/file-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import {
  PanelLeftOpen,
  PanelLeftClose,
  FileText,
  Edit,
  ArrowLeft,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Settings
} from 'lucide-react'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectParam = params.id as string

  const { projects, currentProject, setCurrentProject, updateProject } = useAppStore()
  const { toast } = useToast()

  const [selectedFile, setSelectedFile] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Function to find project by URL parameter
  const findProject = (param: string) => {
    console.log('Finding project for param:', param)
    console.log('Available projects:', projects.map(p => ({ id: p.id, name: p.name, workspace: p.workspace })))
    
    // Decode URL parameter in case it contains encoded characters
    let decodedParam = param
    try {
      decodedParam = decodeURIComponent(param)
      console.log('Decoded param:', decodedParam)
    } catch (e) {
      console.log('Failed to decode param, using original:', param)
    }
    
    // First try to find by exact ID match
    let project = projects.find(p => p.id === param || p.id === decodedParam)
    if (project) {
      console.log('Found by exact ID match:', project.id)
      return project
    }

    // Try to find by workspace path match
    project = projects.find(p => {
      if (p.workspace) {
        const workspaceName = p.workspace.split('/').pop() || p.workspace.split('\\').pop()
        return workspaceName === param || workspaceName === decodedParam
      }
      return false
    })
    if (project) {
      console.log('Found by workspace path match:', project.id)
      return project
    }

    // Try to find by project name match
    project = projects.find(p => {
      return p.name === param || p.name === decodedParam
    })
    if (project) {
      console.log('Found by name match:', project.id)
      return project
    }

    // If not found and param looks like a workspace project name, try workspace_ prefix
    if (!param.startsWith('workspace_')) {
      project = projects.find(p => p.id === `workspace_${param}` || p.id === `workspace_${decodedParam}`)
      if (project) {
        console.log('Found by workspace_ prefix:', project.id)
        return project
      }
    }

    console.log('No project found for param:', param)
    return null
  }

  // Find the project
  const project = findProject(projectParam)

  useEffect(() => {
    if (project) {
      setCurrentProject(project)
      setIsLoading(false)
    } else {
      setIsLoading(false)
      toast({
        title: "Project not found",
        description: `The requested project "${projectParam}" could not be found.`,
        variant: "destructive",
      })
    }
  }, [projectParam, project, setCurrentProject, toast])

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FolderOpen className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      case 'error':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Loading project...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Project Not Found</h2>
              <p className="text-muted-foreground">
                The project you're looking for doesn't exist or has been deleted.
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Edit className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(project.status)}
                <Badge variant={getStatusColor(project.status) as any} className="text-xs">
                  {project.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Updated {project.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/project/${projectParam}/workflow`)}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Workflow
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-6"
            >
              {sidebarOpen ? (
                <>
                  <PanelLeftClose className="h-4 w-4 mr-2" />
                  Hide Files
                </>
              ) : (
                <>
                  <PanelLeftOpen className="h-4 w-4 mr-2" />
                  Show Files
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Project Info */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {project.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Workspace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-mono">
                  {project.workspace}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Steps Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {project.steps.filter(step => step.status === 'completed').length} / {project.steps.length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Browser Sidebar */}
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r bg-muted/30 backdrop-blur-sm"
            >
              <div className="p-6 h-full">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Project Files</h3>
                  <p className="text-sm text-muted-foreground">Browse and select files to edit</p>
                </div>
                <FileBrowser
                  initialPath={project.workspace}
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  height="calc(100% - 80px)"
                  showSearch={true}
                />
              </div>
            </motion.div>
          )}

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden bg-gradient-to-br from-background to-muted/10">
            <div className="p-6 h-full">
              {selectedFile ? (
                <MarkdownEditor
                  filePath={selectedFile}
                  title={selectedFile.split('/').pop() || 'File Editor'}
                  height="100%"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full"
                >
                  <Card className="h-full border-2 border-dashed border-muted-foreground/20 bg-gradient-to-br from-muted/20 to-muted/40 backdrop-blur-sm">
                    <div className="h-full flex flex-col">
                      <div className="flex-none p-8 text-center border-b border-muted-foreground/10">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">Select a file to edit</h3>
                        <p className="text-muted-foreground max-w-md mx-auto text-lg">
                          Choose a markdown file from the file browser to start editing, or use the editor below to create new content.
                        </p>
                      </div>
                      <div className="flex-1 p-6">
                        <MarkdownEditor
                          title="Quick Editor"
                          initialContent={`# Welcome to ${project.name}

This is the project workspace for **${project.name}**.

## Project Overview
${project.description || 'Add your project description here.'}

## Recent Updates
- Project created: ${project.createdAt.toLocaleDateString()}
- Last updated: ${project.updatedAt.toLocaleDateString()}
- Status: ${project.status}

## Next Steps
1. Explore the project files in the sidebar
2. Edit markdown files with the integrated editor
3. Use the workflow feature to generate project documentation

Start writing your content here...`}
                          height="100%"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
