'use client'

import { useState } from 'react'
import { MoreVertical, Edit3, Trash2, Copy, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import type { Project } from '@/lib/store'

interface ProjectActionsProps {
  project: Project
  onRename?: (project: Project) => void
  onDelete?: (project: Project) => void
  onDuplicate?: (project: Project) => void
  onArchive?: (project: Project) => void
}

export function ProjectActions({
  project,
  onRename,
  onDelete,
  onDuplicate,
  onArchive,
}: ProjectActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { updateProject } = useAppStore()

  const handleRename = () => {
    setIsOpen(false)
    onRename?.(project)
  }

  const handleDelete = () => {
    setIsOpen(false)
    onDelete?.(project)
  }

  const handleDuplicate = () => {
    setIsOpen(false)
    onDuplicate?.(project)
  }

  const handleArchive = () => {
    setIsOpen(false)
    onArchive?.(project)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={handleRename}>
          <Edit3 className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="mr-2 h-4 w-4" />
          <span>Archive</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}