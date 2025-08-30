'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Download, 
  Upload, 
  RefreshCw, 
  Eye, 
  Edit3,
  FileText,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Dynamically import the MD Editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface MarkdownEditorProps {
  filePath?: string
  initialContent?: string
  title?: string
  onSave?: (content: string) => void
  readOnly?: boolean
  height?: string | number
}

export function MarkdownEditor({
  filePath,
  initialContent = '',
  title = 'Markdown Editor',
  onSave,
  readOnly = false,
  height = 600
}: MarkdownEditorProps) {
  const [content, setContent] = useState<string>(initialContent)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const { toast } = useToast()

  const loadFileContent = useCallback(async () => {
    if (!filePath) return

    setIsLoading(true)
    try {
      const fileData = await apiClient.readFile(filePath)
      setContent(fileData.content)
      toast({
        title: "File loaded",
        description: `Successfully loaded ${filePath} (${fileData.size} bytes)`,
        variant: "success",
      })
    } catch (error) {
      console.error('Failed to load file:', error)
      toast({
        title: "Error loading file",
        description: `Failed to load ${filePath}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filePath, toast])

  // Load file content if filePath is provided
  useEffect(() => {
    if (filePath) {
      loadFileContent()
    }
  }, [filePath, loadFileContent])

  const handleSave = async () => {
    if (!filePath && !onSave) return

    setIsSaving(true)
    try {
      if (onSave) {
        onSave(content)
      } else if (filePath) {
        await apiClient.writeFile(filePath, content)
      }
      
      toast({
        title: "File saved",
        description: filePath ? `Saved ${filePath}` : "Content saved successfully",
        variant: "success",
      })
    } catch (error) {
      console.error('Failed to save file:', error)
      toast({
        title: "Error saving file",
        description: "Failed to save the file",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filePath ? filePath.split('/').pop() || 'document.md' : 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "Markdown file download started",
      variant: "success",
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileContent = e.target?.result as string
      setContent(fileContent)
      toast({
        title: "File uploaded",
        description: `Successfully uploaded ${file.name}`,
        variant: "success",
      })
    }
    reader.readAsText(file)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-background"
    : ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={containerClasses}
    >
      <Card className={`h-full shadow-xl border-2 bg-gradient-to-br from-background to-muted/5 ${isFullscreen ? 'h-screen rounded-none' : ''}`}>
        <CardHeader className="pb-6 border-b bg-gradient-to-r from-muted/20 to-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                {filePath && (
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {filePath}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs px-3 py-1 bg-primary/5">
                {content.length} characters
              </Badge>
              
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="edit" className="text-xs px-3 py-2">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="split" className="text-xs px-3 py-2">
                    Split
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs px-3 py-2">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadFileContent}
                  disabled={isLoading || !filePath}
                  className="px-3 bg-background/50 hover:bg-background/80"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!content.trim()}
                  className="px-3 bg-background/50 hover:bg-background/80"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <input
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="markdown-file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('markdown-file-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                {!readOnly && (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className={`h-4 w-4 mr-1 ${isSaving ? 'animate-pulse' : ''}`} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading file...</span>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {viewMode === 'split' ? (
                <div className="grid grid-cols-2 h-full border-t">
                  <div className="border-r">
                    <MDEditor
                      value={content}
                      onChange={(val) => setContent(val || '')}
                      preview="edit"
                      hideToolbar={false}
                      height={height}
                    />
                  </div>
                  <div className="overflow-auto p-4" style={{ height }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : viewMode === 'edit' ? (
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  preview="edit"
                  hideToolbar={false}
                  height={height}
                />
              ) : (
                <div className="overflow-auto p-4 border-t" style={{ height }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose dark:prose-invert max-w-none"
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}