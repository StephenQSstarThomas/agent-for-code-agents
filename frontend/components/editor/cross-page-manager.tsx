'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Plus,
  Link2,
  ExternalLink,
  BookOpen,
  FileText,
  Folder,
  ArrowRight,
  X,
  Copy,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface CrossPageLink {
  id: string
  title: string
  path: string
  type: 'markdown' | 'page' | 'external'
  lastModified: Date
  isLinked: boolean
}

interface CrossPageManagerProps {
  currentPageId?: string
  projectId?: string
  onLinkInsert: (linkText: string) => void
  onNavigate: (pageId: string) => void
  className?: string
}

export function CrossPageManager({
  currentPageId,
  projectId,
  onLinkInsert,
  onNavigate,
  className = ''
}: CrossPageManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [pages, setPages] = useState<CrossPageLink[]>([])
  const [filteredPages, setFilteredPages] = useState<CrossPageLink[]>([])
  const [isCreatingPage, setIsCreatingPage] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'linked' | 'recent'>('all')
  const { toast } = useToast()

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockPages: CrossPageLink[] = [
      {
        id: '1',
        title: 'Project Overview',
        path: '/project/overview.md',
        type: 'markdown',
        lastModified: new Date('2024-01-15'),
        isLinked: true
      },
      {
        id: '2',
        title: 'API Documentation',
        path: '/docs/api.md',
        type: 'markdown',
        lastModified: new Date('2024-01-14'),
        isLinked: false
      },
      {
        id: '3',
        title: 'User Guide',
        path: '/guides/user-guide.md',
        type: 'markdown',
        lastModified: new Date('2024-01-13'),
        isLinked: true
      },
      {
        id: '4',
        title: 'External Resource',
        path: 'https://example.com/resource',
        type: 'external',
        lastModified: new Date('2024-01-12'),
        isLinked: false
      }
    ]
    setPages(mockPages)
  }, [projectId])

  // Filter pages based on search query and active tab
  useEffect(() => {
    let filtered = pages.filter(page => 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase())
    )

    switch (activeTab) {
      case 'linked':
        filtered = filtered.filter(page => page.isLinked)
        break
      case 'recent':
        filtered = filtered.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()).slice(0, 10)
        break
      default:
        break
    }

    setFilteredPages(filtered)
  }, [pages, searchQuery, activeTab])

  const handleCreatePage = useCallback(async () => {
    if (!newPageTitle.trim()) return

    try {
      const newPage: CrossPageLink = {
        id: Date.now().toString(),
        title: newPageTitle.trim(),
        path: `/pages/${newPageTitle.toLowerCase().replace(/\s+/g, '-')}.md`,
        type: 'markdown',
        lastModified: new Date(),
        isLinked: false
      }

      setPages(prev => [newPage, ...prev])
      setNewPageTitle('')
      setIsCreatingPage(false)

      toast({
        title: "Page created",
        description: `Created new page: ${newPage.title}`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error creating page",
        description: "Failed to create new page",
        variant: "destructive",
      })
    }
  }, [newPageTitle, toast])

  const handleInsertLink = useCallback((page: CrossPageLink) => {
    const linkText = page.type === 'external' 
      ? `[${page.title}](${page.path})`
      : `[[${page.title}]]`
    
    onLinkInsert(linkText)
    
    // Update page as linked
    setPages(prev => prev.map(p => 
      p.id === page.id ? { ...p, isLinked: true } : p
    ))

    toast({
      title: "Link inserted",
      description: `Inserted link to ${page.title}`,
      variant: "default",
    })
  }, [onLinkInsert, toast])

  const handleNavigateToPage = useCallback((page: CrossPageLink) => {
    if (page.type === 'external') {
      window.open(page.path, '_blank')
    } else {
      onNavigate(page.id)
    }
  }, [onNavigate])

  const handleCopyLink = useCallback(async (page: CrossPageLink) => {
    const linkText = page.type === 'external' 
      ? `[${page.title}](${page.path})`
      : `[[${page.title}]]`
    
    try {
      await navigator.clipboard.writeText(linkText)
      toast({
        title: "Link copied",
        description: "Link copied to clipboard",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }, [toast])

  const getPageIcon = (type: CrossPageLink['type']) => {
    switch (type) {
      case 'markdown':
        return <FileText className="h-4 w-4" />
      case 'page':
        return <BookOpen className="h-4 w-4" />
      case 'external':
        return <ExternalLink className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5" />
          Cross-Page Links
        </CardTitle>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="linked" className="text-xs">Linked</TabsTrigger>
              <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
            </TabsList>
          </Tabs>

          <AnimatePresence>
            {isCreatingPage ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2"
              >
                <Input
                  placeholder="New page title..."
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreatePage()
                    if (e.key === 'Escape') {
                      setIsCreatingPage(false)
                      setNewPageTitle('')
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={handleCreatePage} disabled={!newPageTitle.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreatingPage(false)
                    setNewPageTitle('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingPage(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Page
              </Button>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredPages.map((page) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="mt-1">
                      {getPageIcon(page.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{page.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{page.path}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {page.type}
                        </Badge>
                        {page.isLinked && (
                          <Badge variant="secondary" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1" />
                            Linked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(page)}
                      className="p-1 h-auto"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsertLink(page)}
                      className="p-1 h-auto"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavigateToPage(page)}
                      className="p-1 h-auto"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredPages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pages found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try adjusting your search query</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
