'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  expanded?: boolean
}

interface FileBrowserProps {
  initialPath?: string
  onFileSelect: (filePath: string) => void
  selectedFile?: string
  height?: string | number
  showSearch?: boolean
}

export function FileBrowser({
  initialPath = 'workspace',
  onFileSelect,
  selectedFile,
  height = 400,
  showSearch = true
}: FileBrowserProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTree, setFilteredTree] = useState<FileNode[]>([])
  const { toast } = useToast()

  const loadDirectory = useCallback(async (path: string) => {
    setIsLoading(true)
    try {
      const files = await apiClient.listFiles(path)
      const nodes = files.map(file => ({
        name: file.name,
        path: file.path,
        type: file.is_directory ? 'directory' as const : 'file' as const,
        children: file.is_directory ? [] : undefined,
        expanded: false
      }))

      setFileTree(nodes)
    } catch (error) {
      console.error('Failed to load directory:', error)
      toast({
        title: "Error loading directory",
        description: `Failed to load ${path}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const filterFileTree = useCallback((nodes: FileNode[], query: string): FileNode[] => {
    return nodes.reduce<FileNode[]>((acc, node) => {
      if (node.name.toLowerCase().includes(query)) {
        acc.push({ ...node })
      } else if (node.children) {
        const filteredChildren = filterFileTree(node.children, query)
        if (filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
            expanded: true
          })
        }
      }
      return acc
    }, [])
  }, [])

  useEffect(() => {
    loadDirectory(initialPath)
  }, [loadDirectory, initialPath])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = filterFileTree(fileTree, searchQuery.toLowerCase())
      setFilteredTree(filtered)
    } else {
      setFilteredTree(fileTree)
    }
  }, [fileTree, searchQuery, filterFileTree])



  const toggleDirectory = async (node: FileNode) => {
    if (node.type !== 'directory') return

    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(n => {
        if (n.path === node.path) {
          const expanded = !n.expanded
          return { ...n, expanded }
        }
        if (n.children) {
          return { ...n, children: updateNode(n.children) }
        }
        return n
      })
    }

    if (!node.expanded && (!node.children || node.children.length === 0)) {
      // Load directory contents
      try {
        const files = await apiClient.listFiles(node.path)
        const children = files.map(file => ({
          name: file.name,
          path: file.path,
          type: file.is_directory ? 'directory' as const : 'file' as const,
          children: file.is_directory ? [] : undefined,
          expanded: false
        }))

        setFileTree(prev => prev.map(n => {
          if (n.path === node.path) {
            return { ...n, children, expanded: true }
          }
          return n
        }))
      } catch (error) {
        console.error('Failed to load directory contents:', error)
        toast({
          title: "Error loading directory",
          description: `Failed to load contents of ${node.name}`,
          variant: "destructive",
        })
      }
    } else {
      setFileTree(updateNode)
    }
  }

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'file') {
      onFileSelect(node.path)
    } else {
      toggleDirectory(node)
    }
  }

  const handleOpenInNewWindow = (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the file selection
    const encodedPath = encodeURIComponent(node.path)
    const url = `/editor/${encodedPath}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isMarkdown = node.name.endsWith('.md') || node.name.endsWith('.markdown')
    const isSelected = selectedFile === node.path

    return (
      <div key={node.path}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: depth * 0.1 }}
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors
            hover:bg-accent/50
            ${isSelected ? 'bg-accent text-accent-foreground' : ''}
            ${isMarkdown ? 'text-blue-600 dark:text-blue-400' : ''}
          `}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {node.type === 'directory' ? (
            <>
              {node.expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <Folder className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </>
          ) : (
            <>
              <div className="w-4" />
              <FileText className={`h-4 w-4 ${isMarkdown ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
            </>
          )}

          <span className="flex-1 text-sm truncate">
            {node.name}
          </span>

          {isMarkdown && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                MD
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-accent/50"
                onClick={(e) => handleOpenInNewWindow(node, e)}
                title="Open in new window"
              >
                <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
          )}
        </motion.div>

        {node.expanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Files</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDirectory(initialPath)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          className="overflow-auto px-2 pb-2"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading files...</span>
              </div>
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">
                {searchQuery ? 'No matching files found' : 'No files found'}
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTree.map(node => renderFileNode(node))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}