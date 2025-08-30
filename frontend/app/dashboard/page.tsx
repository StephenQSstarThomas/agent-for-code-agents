'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { ProjectActions } from '@/components/project/project-actions'
import { RenameDialog, DeleteDialog, DuplicateDialog } from '@/components/project/project-dialogs'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/store'

export default function DashboardPage() {
  const {
    projects,
    currentProject,
    setCurrentProject,
    updateProject,
    deleteProject,
    duplicateProject,
    loadWorkspaceProjects
  } = useAppStore()

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false)

  const { toast } = useToast()

  // Function to convert project ID to URL-safe project name
  const getProjectUrlParam = (projectId: string) => {
    console.log('Getting URL param for project ID:', projectId)
    
    // For workspace projects, use the workspace directory name directly
    const project = projects.find(p => p.id === projectId)
    if (project && project.workspace) {
      const workspaceName = project.workspace.split('/').pop() || project.workspace.split('\\').pop()
      console.log('Using workspace name as URL param:', workspaceName)
      return encodeURIComponent(workspaceName || projectId)
    }
    
    // For regular projects, use the project ID
    return encodeURIComponent(projectId)
  }

  // Load workspace projects on component mount
  useEffect(() => {
    const loadWorkspace = async () => {
      if (!workspaceLoaded) {
        try {
          await loadWorkspaceProjects()
          setWorkspaceLoaded(true)
        } catch (error) {
          console.error('Failed to load workspace projects:', error)
          // Show error toast to user
          toast({
            title: "Error loading workspace projects",
            description: "Unable to load projects from workspace. Please check if the backend server is running.",
            variant: "destructive",
          })
          setWorkspaceLoaded(true) // Prevent retry loops
        }
      }
    }
    loadWorkspace()
  }, [loadWorkspaceProjects, workspaceLoaded, toast])

  const stats = {
    total: projects.filter(p => p.status !== 'archived').length,
    completed: projects.filter(p => p.status === 'completed').length,
    processing: projects.filter(p => p.status === 'processing').length,
    draft: projects.filter(p => p.status === 'draft').length,
  }

  const recentProjects = projects
    .filter(p => p.status !== 'archived')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'archived':
        return <FolderOpen className="h-4 w-4 text-gray-400" />
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
      case 'archived':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const handleRename = (project: Project) => {
    setSelectedProject(project)
    setShowRenameDialog(true)
  }

  const handleDelete = (project: Project) => {
    setSelectedProject(project)
    setShowDeleteDialog(true)
  }

  const handleDuplicate = (project: Project) => {
    setSelectedProject(project)
    setShowDuplicateDialog(true)
  }

  const handleArchive = (project: Project) => {
    updateProject(project.id, { status: 'archived' })
  }

  const confirmRename = (newName: string) => {
    if (selectedProject) {
      try {
        updateProject(selectedProject.id, { name: newName })
        toast({
          title: "Project renamed",
          description: `Successfully renamed to "${newName}"`,
          variant: "success",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to rename project",
          variant: "destructive",
        })
      }
    }
  }

  const confirmDelete = () => {
    if (selectedProject) {
      try {
        deleteProject(selectedProject.id)
        toast({
          title: "Project deleted",
          description: `"${selectedProject.name}" has been permanently deleted`,
          variant: "success",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        })
      }
    }
  }

  const confirmDuplicate = (newName: string) => {
    if (selectedProject) {
      try {
        duplicateProject(selectedProject.id, newName)
        toast({
          title: "Project duplicated",
          description: `Created "${newName}" from "${selectedProject.name}"`,
          variant: "success",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to duplicate project",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your AI-generated project prompts and workflows
            </p>
          </div>
          
          <Button asChild variant="gradient" size="lg">
            <Link href="/project/new">
              <Plus className="mr-2 h-5 w-5" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Projects', value: stats.total, color: 'primary' },
            { label: 'Completed', value: stats.completed, color: 'success' },
            { label: 'In Progress', value: stats.processing, color: 'warning' },
            { label: 'Drafts', value: stats.draft, color: 'secondary' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      stat.color === 'success' && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                      stat.color === 'warning' && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
                      stat.color === 'secondary' && "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
                      stat.color === 'primary' && "bg-primary/10 text-primary"
                    )}>
                      {stat.label === 'Total Projects' && <FolderOpen className="h-6 w-6" />}
                      {stat.label === 'Completed' && <CheckCircle2 className="h-6 w-6" />}
                      {stat.label === 'In Progress' && <Clock className="h-6 w-6" />}
                      {stat.label === 'Drafts' && <Edit className="h-6 w-6" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Projects</h2>
            <Button variant="outline" asChild>
              <Link href="/projects">
                View All
              </Link>
            </Button>
          </div>

          {recentProjects.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No projects yet</h3>
                  <p className="text-muted-foreground">
                    Create your first project to get started with AI-powered prompt generation
                  </p>
                </div>
                <Button asChild variant="gradient">
                  <Link href="/project/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(project.status)}
                            <CardTitle className="text-lg truncate">
                              {project.name}
                            </CardTitle>
                          </div>
                          <Badge 
                            variant={getStatusColor(project.status) as any}
                            className="w-fit"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        
                        <ProjectActions
                          project={project}
                          onRename={handleRename}
                          onDelete={handleDelete}
                          onDuplicate={handleDuplicate}
                          onArchive={handleArchive}
                        />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                      
                      <div className="text-xs text-muted-foreground">
                        Updated {project.updatedAt.toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                          className="flex-1"
                        >
                          <Link href={`/project/${getProjectUrlParam(project.id)}`}>
                            Open
                          </Link>
                        </Button>
                        
                        {project.status === 'draft' && (
                          <Button 
                            size="sm"
                            asChild
                            className="flex-1"
                          >
                            <Link href={`/project/${project.id}/workflow`}>
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Dialogs */}
        <RenameDialog
          project={selectedProject}
          isOpen={showRenameDialog}
          onClose={() => setShowRenameDialog(false)}
          onConfirm={confirmRename}
        />
        
        <DeleteDialog
          project={selectedProject}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
        />
        
        <DuplicateDialog
          project={selectedProject}
          isOpen={showDuplicateDialog}
          onClose={() => setShowDuplicateDialog(false)}
          onConfirm={confirmDuplicate}
        />
      </div>
    </MainLayout>
  )
}