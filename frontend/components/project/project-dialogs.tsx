'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Project } from '@/lib/store'

interface RenameDialogProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => void
}

export function RenameDialog({ project, isOpen, onClose, onConfirm }: RenameDialogProps) {
  const [newName, setNewName] = useState(project?.name || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      onConfirm(newName.trim())
      onClose()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    } else if (project) {
      setNewName(project.name)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Enter a new name for "{project?.name}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteDialogProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteDialog({ project, isOpen, onClose, onConfirm }: DeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{project?.name}"? This action cannot be undone.
            All project files and workflow data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DuplicateDialogProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => void
}

export function DuplicateDialog({ project, isOpen, onClose, onConfirm }: DuplicateDialogProps) {
  const [newName, setNewName] = useState(project ? `${project.name} (Copy)` : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      onConfirm(newName.trim())
      onClose()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    } else if (project) {
      setNewName(`${project.name} (Copy)`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate Project</DialogTitle>
          <DialogDescription>
            Create a copy of "{project?.name}" with a new name
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              placeholder="New project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newName.trim()}>
              Duplicate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}