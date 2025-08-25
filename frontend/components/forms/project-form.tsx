'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, Link as LinkIcon, Upload, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { cleanUnicodeText } from '@/lib/utils'

interface ProjectFormProps {
  onSubmit?: (data: { 
    name: string; 
    description: string; 
    referenceUrls?: string[];
    referenceFiles?: string[];
  }) => void
  loading?: boolean
}

export function ProjectForm({ onSubmit, loading = false }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [referenceUrls, setReferenceUrls] = useState<string[]>([])
  const [referenceFiles, setReferenceFiles] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [newFile, setNewFile] = useState('')
  const { createProject } = useAppStore()
  const router = useRouter()

  const addUrl = () => {
    if (newUrl.trim() && !referenceUrls.includes(newUrl.trim())) {
      setReferenceUrls([...referenceUrls, newUrl.trim()])
      setNewUrl('')
    }
  }

  const removeUrl = (urlToRemove: string) => {
    setReferenceUrls(referenceUrls.filter(url => url !== urlToRemove))
  }

  const addFile = () => {
    if (newFile.trim() && !referenceFiles.includes(newFile.trim())) {
      setReferenceFiles([...referenceFiles, newFile.trim()])
      setNewFile('')
    }
  }

  const removeFile = (fileToRemove: string) => {
    setReferenceFiles(referenceFiles.filter(file => file !== fileToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !description.trim()) return

    // Clean all input data to prevent Unicode/emoji issues
    const cleanName = cleanUnicodeText(name.trim())
    const cleanDescription = cleanUnicodeText(description.trim())
    const cleanUrls = referenceUrls.map(url => cleanUnicodeText(url))
    const cleanFiles = referenceFiles.map(file => cleanUnicodeText(file))

    const projectData = { 
      name: cleanName, 
      description: cleanDescription,
      referenceUrls: cleanUrls.length > 0 ? cleanUrls : undefined,
      referenceFiles: cleanFiles.length > 0 ? cleanFiles : undefined,
    }
    
    if (onSubmit) {
      onSubmit(projectData)
    } else {
      // Default behavior - create project and navigate
      createProject(cleanName, cleanDescription)
      router.push('/dashboard')
    }
  }

  const isValid = name.trim() && description.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Provide a name and detailed description of your project idea
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="name"
              placeholder="e.g., Real-time Chat Application"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Project Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe your project in detail. Include:
• What you want to build
• Key features and functionality
• Target users or use cases
• Any specific requirements or constraints"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              autoResize
              className="min-h-[120px]"
            />
          </div>

          {/* Reference Materials Tabs */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Reference Materials (Optional)</h3>
            <Tabs defaultValue="urls" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="urls">Web URLs</TabsTrigger>
                <TabsTrigger value="files">Local Files</TabsTrigger>
              </TabsList>

              <TabsContent value="urls" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/documentation"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                      disabled={loading}
                    />
                    <Button 
                      type="button" 
                      onClick={addUrl} 
                      disabled={!newUrl.trim() || loading}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {referenceUrls.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LinkIcon className="h-4 w-4" />
                        <span>Reference URLs ({referenceUrls.length})</span>
                      </div>
                      <div className="space-y-2">
                        {referenceUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                            <span className="text-sm flex-1 truncate">{url}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeUrl(url)}
                              className="h-6 w-6 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="C:\path\to\file.md or /path/to/file.txt"
                      value={newFile}
                      onChange={(e) => setNewFile(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFile())}
                      disabled={loading}
                    />
                    <Button 
                      type="button" 
                      onClick={addFile} 
                      disabled={!newFile.trim() || loading}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {referenceFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Reference Files ({referenceFiles.length})</span>
                      </div>
                      <div className="space-y-2">
                        {referenceFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                            <span className="text-sm flex-1 truncate">{file}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(file)}
                              className="h-6 w-6 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isValid ? (
            <span className="text-green-600">Ready to create project</span>
          ) : (
            <span>Please fill in all required fields</span>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={!isValid || loading}
          loading={loading}
          variant="gradient"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Project...
            </>
          ) : (
            'Start Workflow'
          )}
        </Button>
      </div>
    </form>
  )
}