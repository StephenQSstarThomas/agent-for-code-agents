'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  Minimize2,
  Settings,
  Copy,
  Share,
  Link2,
  BookOpen
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

// Dynamically import editors to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
const MDXEditor = dynamic(() => 
  import('@mdxeditor/editor').then(mod => ({ default: mod.MDXEditor })), 
  { ssr: false }
)
const TipTapEditor = dynamic(() => import('./tiptap-editor'), { ssr: false })
const VditorEditor = dynamic(() => import('./vditor-editor'), { ssr: false })

type EditorType = 'uiw' | 'mdx' | 'tiptap' | 'vditor'

interface AdvancedMarkdownEditorProps {
  filePath?: string
  initialContent?: string
  title?: string
  onSave?: (content: string) => void
  onContentChange?: (content: string) => void
  readOnly?: boolean
  height?: string | number
  defaultEditor?: EditorType
  enableCrossPageLinks?: boolean
  enableCollaboration?: boolean
  projectId?: string
}

export function AdvancedMarkdownEditor({
  filePath,
  initialContent = '',
  title = 'Advanced Markdown Editor',
  onSave,
  onContentChange,
  readOnly = false,
  height = 600,
  defaultEditor = 'uiw',
  enableCrossPageLinks = true,
  enableCollaboration = false,
  projectId
}: AdvancedMarkdownEditorProps) {
  const [content, setContent] = useState<string>(initialContent)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [activeEditor, setActiveEditor] = useState<EditorType>(defaultEditor)
  const [linkedPages, setLinkedPages] = useState<string[]>([])
  const { toast } = useToast()

  // Memoized content statistics
  const contentStats = useMemo(() => {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
    const lineCount = content.split('\n').length
    const charCount = content.length
    const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute
    
    return { wordCount, lineCount, charCount, readingTime }
  }, [content])

  // Extract cross-page links from content
  useEffect(() => {
    if (enableCrossPageLinks) {
      const linkRegex = /\[\[([^\]]+)\]\]/g
      const matches = [...content.matchAll(linkRegex)]
      const pages = matches.map(match => match[1]).filter(Boolean)
      setLinkedPages([...new Set(pages)])
    }
  }, [content, enableCrossPageLinks])

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    onContentChange?.(newContent)
  }, [onContentChange])

  const loadFileContent = useCallback(async () => {
    if (!filePath) return

    setIsLoading(true)
    try {
      const fileData = await apiClient.readFile(filePath)
      setContent(fileData.content)
      toast({
        title: "File loaded",
        description: `Successfully loaded ${filePath} (${fileData.size} bytes)`,
        variant: "default",
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
        variant: "default",
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
      variant: "default",
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
        variant: "default",
      })
    }
    reader.readAsText(file)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied to clipboard",
        description: "Content copied to clipboard",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleCreateLink = (pageName: string) => {
    const linkText = `[[${pageName}]]`
    setContent(prev => prev + `\n\n${linkText}`)
    
    if (enableCrossPageLinks && projectId) {
      // Here you could create the linked page or navigate to it
      toast({
        title: "Link created",
        description: `Created link to ${pageName}`,
        variant: "default",
      })
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const renderEditor = () => {
    const editorProps = {
      value: content,
      onChange: handleContentChange,
      height,
      readOnly
    }

    switch (activeEditor) {
      case 'uiw':
        return (
          <MDEditor
            value={content}
            onChange={(val) => handleContentChange(val || '')}
            preview={viewMode === 'preview' ? 'preview' : viewMode === 'edit' ? 'edit' : 'live'}
            hideToolbar={false}
            height={height}
          />
        )
      
      case 'mdx':
        return <MDXEditor {...editorProps} />
      
      case 'tiptap':
        return <TipTapEditor {...editorProps} enableCollaboration={enableCollaboration} />
      
      case 'vditor':
        return <VditorEditor {...editorProps} />
      
      default:
        return (
          <MDEditor
            value={content}
            onChange={(val) => handleContentChange(val || '')}
            preview={viewMode === 'preview' ? 'preview' : viewMode === 'edit' ? 'edit' : 'live'}
            hideToolbar={false}
            height={height}
          />
        )
    }
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
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {contentStats.charCount} chars
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {contentStats.wordCount} words
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {contentStats.readingTime}min read
                  </Badge>
                  {linkedPages.length > 0 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      <Link2 className="h-3 w-3 mr-1" />
                      {linkedPages.length} links
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Tabs value={activeEditor} onValueChange={(value) => setActiveEditor(value as EditorType)}>
                <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                  <TabsTrigger value="uiw" className="text-xs px-2 py-1">UIW</TabsTrigger>
                  <TabsTrigger value="mdx" className="text-xs px-2 py-1">MDX</TabsTrigger>
                  <TabsTrigger value="tiptap" className="text-xs px-2 py-1">TipTap</TabsTrigger>
                  <TabsTrigger value="vditor" className="text-xs px-2 py-1">Vditor</TabsTrigger>
                </TabsList>
              </Tabs>
              
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
                  onClick={handleCopyToClipboard}
                  disabled={!content.trim()}
                  className="px-3 bg-background/50 hover:bg-background/80"
                >
                  <Copy className="h-4 w-4" />
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
                  id="advanced-markdown-file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('advanced-markdown-file-upload')?.click()}
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

          {/* Cross-page links section */}
          {enableCrossPageLinks && linkedPages.length > 0 && (
            <div className="mt-4 p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Linked Pages</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {linkedPages.map((page, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-primary/20"
                    onClick={() => handleCreateLink(page)}
                  >
                    <Link2 className="h-3 w-3 mr-1" />
                    {page}
                  </Badge>
                ))}
              </div>
            </div>
          )}
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
              {viewMode === 'split' && activeEditor === 'uiw' ? (
                <div className="grid grid-cols-2 h-full border-t">
                  <div className="border-r">
                    {renderEditor()}
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
              ) : viewMode === 'preview' ? (
                <div className="overflow-auto p-4 border-t" style={{ height }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose dark:prose-invert max-w-none"
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="border-t">
                  {renderEditor()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
