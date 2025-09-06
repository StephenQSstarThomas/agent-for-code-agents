'use client'

import React, { useEffect, useRef } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

interface VditorEditorProps {
  value: string
  onChange: (content: string) => void
  height?: string | number
  readOnly?: boolean
}

export default function VditorEditor({ 
  value, 
  onChange, 
  height = 600, 
  readOnly = false 
}: VditorEditorProps) {
  const vditorRef = useRef<Vditor>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const vditor = new Vditor(containerRef.current, {
      height: typeof height === 'number' ? height : parseInt(height as string) || 600,
      mode: 'wysiwyg',
      placeholder: 'Start writing...',
      theme: 'classic',
      preview: {
        theme: {
          current: 'light',
          path: 'https://cdn.jsdelivr.net/npm/vditor@3.10.9/dist/css/content-theme'
        }
      },
      toolbar: readOnly ? [] : [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        '|',
        'line',
        'quote',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'code',
        'inline-code',
        'insert-before',
        'insert-after',
        '|',
        'table',
        'link',
        '|',
        'undo',
        'redo',
        '|',
        'edit-mode',
        'content-theme',
        'code-theme',
        'export',
        'outline',
        'preview',
        'fullscreen',
      ],
      cache: {
        enable: false,
      },
      after: () => {
        if (vditorRef.current && value) {
          vditorRef.current.setValue(value)
        }
      },
      input: (value) => {
        onChange(value)
      },
      blur: (value) => {
        onChange(value)
      },
      select: (value) => {
        // Handle text selection if needed
      },
      focus: (value) => {
        // Handle focus if needed
      },
    })

    vditorRef.current = vditor

    return () => {
      if (vditorRef.current) {
        vditorRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (vditorRef.current && value !== vditorRef.current.getValue()) {
      vditorRef.current.setValue(value)
    }
  }, [value])

  return (
    <div className="vditor-container">
      <div ref={containerRef} />
    </div>
  )
}
