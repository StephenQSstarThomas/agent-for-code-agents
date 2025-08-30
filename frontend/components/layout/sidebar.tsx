'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FolderOpen, 
  Plus, 
  FileText, 
  Settings, 
  History, 
  Zap,
  ChevronRight,
  ChevronDown,
  Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: FolderOpen },
  { name: 'New Project', href: '/project/new', icon: Plus },
  { name: 'Projects', href: '/projects', icon: FileText },
  { name: 'Editor', href: '/editor', icon: Edit3 },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const { sidebarOpen, projects, currentProject } = useAppStore()
  const pathname = usePathname()
  const [expandedProjects, setExpandedProjects] = useState(true)

  const recentProjects = projects.slice(0, 5)

  // Function to convert project ID to URL-safe project name
  const getProjectUrlParam = (projectId: string) => {
    // For workspace projects, use the workspace directory name directly
    const project = projects.find(p => p.id === projectId)
    if (project && project.workspace) {
      const workspaceName = project.workspace.split('/').pop() || project.workspace.split('\\').pop()
      return encodeURIComponent(workspaceName || projectId)
    }
    
    // For regular projects, use the project ID
    return encodeURIComponent(projectId)
  }

  if (!sidebarOpen) return null

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-background border-r lg:relative lg:inset-y-auto lg:z-auto">
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={
                    isActive 
                      ? "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground" 
                      : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setExpandedProjects(!expandedProjects)}
                className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2"
              >
                <span>Recent Projects</span>
                {expandedProjects ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {expandedProjects && (
                <div className="space-y-1 mt-2">
                  {recentProjects.map((project, index) => (
                    <Link
                      key={`sidebar-${project.id}-${index}`}
                      href={`/project/${getProjectUrlParam(project.id)}`}
                      className={
                        currentProject?.id === project.id
                          ? "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors bg-accent text-accent-foreground"
                          : "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      }
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={
                          project.status === 'completed' 
                            ? "w-2 h-2 rounded-full flex-shrink-0 bg-green-500"
                            : project.status === 'processing'
                            ? "w-2 h-2 rounded-full flex-shrink-0 bg-yellow-500"
                            : project.status === 'error'
                            ? "w-2 h-2 rounded-full flex-shrink-0 bg-red-500"
                            : project.status === 'draft'
                            ? "w-2 h-2 rounded-full flex-shrink-0 bg-gray-400"
                            : "w-2 h-2 rounded-full flex-shrink-0 bg-gray-300"
                        } />
                        <span className="truncate">{project.name}</span>
                      </div>
                      
                      {project.status === 'processing' && (
                        <Zap className="h-3 w-3 text-yellow-500 animate-pulse flex-shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>v0.1.0</span>
            <Badge variant="outline" className="text-xs">
              Beta
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  )
}