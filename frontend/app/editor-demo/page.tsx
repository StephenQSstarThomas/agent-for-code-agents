'use client'

import React, { useState } from 'react'
import { AdvancedMarkdownEditor } from '@/components/editor/advanced-markdown-editor'
import { CrossPageManager } from '@/components/editor/cross-page-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Sparkles, 
  Zap, 
  Users, 
  Link2,
  BookOpen,
  Settings,
  Info
} from 'lucide-react'

const initialContent = `# Advanced Markdown Editor Demo

Welcome to the **Advanced Markdown Editor**! This editor supports multiple rendering engines and cross-page linking.

## Features

### 🚀 Multiple Editor Engines
- **UIW Editor**: The original reliable editor
- **MDX Editor**: Rich text editing with MDX support
- **TipTap**: Powerful WYSIWYG editor
- **Vditor**: Feature-rich markdown editor

### 🔗 Cross-Page Links
You can create links between pages using the \`[[ ]]\` syntax:
- [[Project Overview]]
- [[API Documentation]]
- [[User Guide]]

### 📊 Real-time Statistics
- Character count
- Word count
- Reading time estimation
- Linked pages counter

### 🎨 Advanced Features
- **Full-screen editing**
- **Multiple view modes** (Edit, Split, Preview)
- **File upload/download**
- **Copy to clipboard**
- **Collaborative editing** (TipTap)
- **Cross-page navigation**

## Code Examples

\`\`\`javascript
// Example JavaScript code
function createMarkdownEditor(config) {
  return new AdvancedMarkdownEditor({
    ...config,
    enableCrossPageLinks: true,
    enableCollaboration: true
  })
}
\`\`\`

\`\`\`python
# Example Python code
def process_markdown(content):
    """Process markdown content with cross-page links."""
    links = extract_cross_page_links(content)
    return {
        'content': content,
        'links': links,
        'stats': calculate_stats(content)
    }
\`\`\`

## Tables

| Editor | WYSIWYG | Collaboration | File Size |
|--------|---------|---------------|-----------|
| UIW    | ✅      | ❌            | Small     |
| MDX    | ✅      | ❌            | Medium    |
| TipTap | ✅      | ✅            | Large     |
| Vditor | ✅      | ❌            | Large     |

## Task Lists

- [x] Implement multiple editor engines
- [x] Add cross-page linking
- [x] Create real-time statistics
- [ ] Add collaborative editing
- [ ] Implement version history
- [ ] Add plugin system

## Mathematical Expressions

When using supported editors, you can include math:

Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Conclusion

This advanced markdown editor provides a comprehensive writing experience with multiple engine options and cross-page linking capabilities. Try switching between different editors to see the differences!
`

export default function EditorDemoPage() {
  const [content, setContent] = useState(initialContent)
  const [activeDemo, setActiveDemo] = useState<'editor' | 'comparison' | 'features'>('editor')

  const handleLinkInsert = (linkText: string) => {
    setContent(prev => prev + `\n\n${linkText}`)
  }

  const handleNavigate = (pageId: string) => {
    console.log('Navigate to page:', pageId)
    // In a real app, this would navigate to the actual page
  }

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Multiple Engines",
      description: "Switch between UIW, MDX, TipTap, and Vditor editors"
    },
    {
      icon: <Link2 className="h-5 w-5" />,
      title: "Cross-Page Links",
      description: "Create and manage links between different pages"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Collaboration",
      description: "Real-time collaborative editing with TipTap"
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Rich Features",
      description: "Full-screen, statistics, file operations, and more"
    }
  ]

  const editorComparison = [
    {
      name: "UIW Editor",
      pros: ["Lightweight", "Fast loading", "Good for basic editing"],
      cons: ["Limited features", "No collaboration"],
      useCase: "Simple markdown editing"
    },
    {
      name: "MDX Editor",
      pros: ["MDX support", "Rich components", "Good performance"],
      cons: ["Learning curve", "Larger bundle"],
      useCase: "Content with React components"
    },
    {
      name: "TipTap",
      pros: ["WYSIWYG", "Collaboration", "Extensible"],
      cons: ["Large bundle", "Complex setup"],
      useCase: "Rich text editing with collaboration"
    },
    {
      name: "Vditor",
      pros: ["Feature-rich", "Multiple modes", "Good UX"],
      cons: ["Large bundle", "Chinese-focused"],
      useCase: "Full-featured markdown editing"
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Advanced Markdown Editor</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience the next generation of markdown editing with multiple engines, 
          cross-page linking, and collaborative features.
        </p>
        <div className="flex items-center justify-center gap-2">
          {features.map((feature, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {feature.icon}
              {feature.title}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Live Editor
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Engine Comparison
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <AdvancedMarkdownEditor
                initialContent={content}
                onContentChange={setContent}
                title="Advanced Markdown Editor Demo"
                height={700}
                enableCrossPageLinks={true}
                enableCollaboration={true}
                defaultEditor="uiw"
              />
            </div>
            <div className="lg:col-span-1">
              <CrossPageManager
                currentPageId="demo"
                projectId="demo-project"
                onLinkInsert={handleLinkInsert}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editorComparison.map((editor, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {editor.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Pros</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {editor.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Cons</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {editor.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">Best Use Case</h4>
                    <p className="text-sm">{editor.useCase}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {feature.icon}
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4</div>
                  <div className="text-sm text-green-600">Editor Engines</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">∞</div>
                  <div className="text-sm text-blue-600">Cross-Page Links</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Real-time</div>
                  <div className="text-sm text-purple-600">Collaboration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
