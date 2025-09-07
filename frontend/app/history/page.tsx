'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  History as HistoryIcon,
  Calendar,
  AlphabeticalSort,
  Clock,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Archive,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Folder,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MainLayout } from '@/components/layout/main-layout'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/store'

type SortField = 'name' | 'createdAt' | 'updatedAt' | 'status'
type SortOrder = 'asc' | 'desc'
type FilterStatus = 'all' | 'draft' | 'processing' | 'completed' | 'error' | 'archived'

export default function HistoryPage() {
  const { projects, loadWorkspaceProjects } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Load workspace projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)
      try {
        await loadWorkspaceProjects()
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [loadWorkspaceProjects])

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus
      
      return matchesSearch && matchesStatus
    })

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.updatedAt
          bValue = b.updatedAt
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [projects, searchQuery, sortField, sortOrder, filterStatus])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getProjectUrlParam = (project: Project) => {
    if (project.workspace) {
      const workspaceName = project.workspace.split('/').pop() || project.workspace.split('\\').pop()
      return encodeURIComponent(workspaceName || project.id)
    }
    return encodeURIComponent(project.id)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getCompletionPercentage = (project: Project) => {
    if (!project.steps || project.steps.length === 0) return 0
    const completedSteps = project.steps.filter(step => step.status === 'completed').length
    return Math.round((completedSteps / project.steps.length) * 100)
  }

  const statusCounts = useMemo(() => {
    const counts = {
      all: projects.length,
      draft: 0,
      processing: 0,
      completed: 0,
      error: 0,
      archived: 0
    }

    projects.forEach(project => {
      counts[project.status]++
    })

    return counts
  }, [projects])

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={cn(
        "flex items-center gap-1",
        sortField === field && "bg-muted"
      )}
    >
      {children}
      {sortField === field ? (
        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3" />
      )}
    </Button>
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <HistoryIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">项目历史</h1>
              <p className="text-muted-foreground mt-1">
                查看和管理所有项目的历史记录
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {filteredAndSortedProjects.length} 个项目
            </Badge>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">筛选和排序</CardTitle>
                <div className="flex items-center gap-2">
                  <SortButton field="name">
                    <AlphabeticalSort className="h-4 w-4" />
                    名称
                  </SortButton>
                  <SortButton field="createdAt">
                    <Calendar className="h-4 w-4" />
                    创建时间
                  </SortButton>
                  <SortButton field="updatedAt">
                    <Clock className="h-4 w-4" />
                    更新时间
                  </SortButton>
                  <SortButton field="status">
                    <Filter className="h-4 w-4" />
                    状态
                  </SortButton>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索项目名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">
                    全部 ({statusCounts.all})
                  </TabsTrigger>
                  <TabsTrigger value="draft">
                    草稿 ({statusCounts.draft})
                  </TabsTrigger>
                  <TabsTrigger value="processing">
                    进行中 ({statusCounts.processing})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    已完成 ({statusCounts.completed})
                  </TabsTrigger>
                  <TabsTrigger value="error">
                    错误 ({statusCounts.error})
                  </TabsTrigger>
                  <TabsTrigger value="archived">
                    已归档 ({statusCounts.archived})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>加载项目中...</span>
                </div>
              </CardContent>
            </Card>
          ) : filteredAndSortedProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">没有找到项目</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery || filterStatus !== 'all' 
                    ? '尝试调整搜索条件或筛选器' 
                    : '还没有任何项目，去创建第一个项目吧！'}
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Button asChild className="mt-4">
                    <Link href="/project/new">创建新项目</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredAndSortedProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(project.status)}
                                <Link 
                                  href={`/project/${getProjectUrlParam(project)}/workflow`}
                                  className="text-xl font-semibold hover:text-primary transition-colors"
                                >
                                  {project.name}
                                </Link>
                              </div>
                              <Badge className={cn("text-xs", getStatusColor(project.status))}>
                                {project.status}
                              </Badge>
                              {getCompletionPercentage(project) > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {getCompletionPercentage(project)}% 完成
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                              {project.description}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>创建: {formatDate(project.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>更新: {formatDate(project.updatedAt)}</span>
                              </div>
                              {project.workspace && (
                                <div className="flex items-center gap-1">
                                  <Folder className="h-4 w-4" />
                                  <span className="font-mono text-xs">
                                    {project.workspace}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/project/${getProjectUrlParam(project)}/workflow`}>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                打开
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  )
}
