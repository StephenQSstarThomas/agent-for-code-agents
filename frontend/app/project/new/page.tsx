'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'
import { ProjectForm } from '@/components/forms/project-form'
import { useAppStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { cleanUnicodeText, sanitizeErrorMessage } from '@/lib/utils'

export default function NewProjectPage() {
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { addProject } = useAppStore()
  const { toast } = useToast()

  const handleSubmit = async (data: { 
    name: string; 
    description: string; 
    referenceUrls?: string[];
    referenceFiles?: string[];
  }) => {
    setIsCreating(true)
    
    try {
      // Create project via API with additional Unicode cleaning
      const projectData = {
        name: cleanUnicodeText(data.name),
        description: cleanUnicodeText(data.description),
        user_prompt: cleanUnicodeText(data.description), // Use description as user prompt for now
        reference_urls: data.referenceUrls?.map(url => cleanUnicodeText(url)),
        reference_files: data.referenceFiles?.map(file => cleanUnicodeText(file))
      }
      
      const newProject = await apiClient.createProject(projectData)
      
      // Add project to store
      addProject({
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        status: newProject.status as any,
        steps: newProject.steps?.map((step: any) => ({
          id: step.id,
          name: step.name,
          description: step.description || '',
          status: step.status as any,
          output: step.output,
          filePath: step.file_path,
          createdAt: new Date(),
          updatedAt: new Date()
        })) || [],
        workspace: newProject.workspace,
        createdAt: new Date(newProject.created_at),
        updatedAt: new Date(newProject.updated_at)
      })
      
      toast({
        title: "Project created",
        description: `Successfully created "${newProject.name}"`,
        variant: "success",
      })
      
      // Navigate to the project workflow page
      router.push(`/project/${newProject.id}/workflow`)
    } catch (error) {
      console.error('Failed to create project:', sanitizeErrorMessage(error))
      toast({
        title: "Error creating project",
        description: sanitizeErrorMessage(error) || "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Create New Project
            </h1>
            <p className="text-muted-foreground mt-2">
              Transform your project idea into structured prompts for AI code generation
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Form */}
          <div className="lg:col-span-2">
            <ProjectForm onSubmit={handleSubmit} loading={isCreating} />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
                <CardDescription>
                  Our 4-phase workflow transforms your idea
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    phase: '1',
                    title: 'Analysis',
                    description: 'Structured requirements analysis from your description'
                  },
                  {
                    phase: '2', 
                    title: 'Architecture',
                    description: 'Technical architecture and system design'
                  },
                  {
                    phase: '3',
                    title: 'Planning', 
                    description: 'Detailed task breakdown and implementation plan'
                  },
                  {
                    phase: '4',
                    title: 'Optimization',
                    description: 'Final optimized prompt for code generation'
                  }
                ].map((step) => (
                  <div key={step.phase} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.phase}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for better results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p>Be specific about features and functionality</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p>Include target users and use cases</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p>Mention technology preferences if any</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p>Add URLs or file paths for reference</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  )
}