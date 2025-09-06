'use client'

import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'

interface TipTapEditorProps {
  value: string
  onChange: (content: string) => void
  height?: string | number
  readOnly?: boolean
  enableCollaboration?: boolean
}

export default function TipTapEditor({ 
  value, 
  onChange, 
  height = 600, 
  readOnly = false,
  enableCollaboration = false 
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 10,
        },
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const markdown = editor.getHTML() // In a real implementation, you'd convert HTML to Markdown
      onChange(markdown)
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!editor) {
    return null
  }

  const MenuBar = () => {
    if (readOnly) return null

    return (
      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/20">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="p-2"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="p-2"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('strike') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="p-2"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('code') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="p-2"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />
        
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="p-2"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="p-2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="p-2"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />
        
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-2"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="p-2"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="p-2"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <MenuBar />
      <EditorContent 
        editor={editor} 
        className="prose prose-sm dark:prose-invert max-w-none p-4"
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height,
          overflowY: 'auto'
        }}
      />
    </div>
  )
}
