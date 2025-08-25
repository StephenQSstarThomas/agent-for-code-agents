'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MainLayout } from '@/components/layout/main-layout'
import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { FileBrowser } from '@/components/editor/file-browser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  PanelLeftOpen, 
  PanelLeftClose,
  FileText,
  Edit
} from 'lucide-react'

export default function EditorPage() {
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath)
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Edit className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Markdown Editor
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Edit and preview markdown files with real-time synchronization
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-6"
          >
            {sidebarOpen ? (
              <>
                <PanelLeftClose className="h-4 w-4 mr-2" />
                Hide Files
              </>
            ) : (
              <>
                <PanelLeftOpen className="h-4 w-4 mr-2" />
                Show Files
              </>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Browser Sidebar */}
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r bg-muted/30 backdrop-blur-sm"
            >
              <div className="p-6 h-full">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Project Files</h3>
                  <p className="text-sm text-muted-foreground">Browse and select files to edit</p>
                </div>
                <FileBrowser
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  height="calc(100% - 80px)"
                />
              </div>
            </motion.div>
          )}
          
          {/* Editor Content */}
          <div className="flex-1 overflow-hidden bg-gradient-to-br from-background to-muted/10">
            <div className="p-8 h-full">
              {selectedFile ? (
                <MarkdownEditor
                  filePath={selectedFile}
                  title={selectedFile.split('/').pop() || 'Untitled'}
                  height="100%"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full"
                >
                  <Card className="h-full border-2 border-dashed border-muted-foreground/20 bg-gradient-to-br from-muted/20 to-muted/40 backdrop-blur-sm">
                    <div className="h-full flex flex-col">
                      <div className="flex-none p-8 text-center border-b border-muted-foreground/10">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">No file selected</h3>
                        <p className="text-muted-foreground max-w-md mx-auto text-lg">
                          Select a markdown file from the file browser to start editing, or use the editor below to create new content.
                        </p>
                      </div>
                      <div className="flex-1 p-6">
                        <MarkdownEditor
                          title="Quick Editor"
                          initialContent="# Welcome to Markdown Editor\n\nStart typing your content here...\n\n## Features\n- Real-time preview\n- Syntax highlighting\n- File browser integration\n- Auto-save functionality"
                          height="100%"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}