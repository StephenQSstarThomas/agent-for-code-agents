'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function FileEditorPage() {
  const params = useParams()
  const router = useRouter()
  const filePath = params.file as string

  // Decode the file path (it might be URL encoded)
  const decodedFilePath = decodeURIComponent(filePath || '')

  if (!decodedFilePath) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">File not found</h1>
          <Button asChild>
            <Link href="/editor">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {decodedFilePath.split('/').pop() || 'File Editor'}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                {decodedFilePath}
              </p>
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href="/editor">
              Open Full Editor
            </Link>
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
      >
        <div className="max-w-none">
          <MarkdownEditor
            filePath={decodedFilePath}
            title={decodedFilePath.split('/').pop() || 'File Editor'}
            height={800}
          />
        </div>
      </motion.div>
    </div>
  )
}
