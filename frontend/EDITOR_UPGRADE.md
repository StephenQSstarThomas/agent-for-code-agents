# Advanced Markdown Editor Upgrade

## Overview

This upgrade enhances the markdown editing experience by integrating multiple modern editor engines and adding cross-page linking capabilities.

## New Features

### 🚀 Multiple Editor Engines
- **UIW Editor** (`@uiw/react-md-editor`): Lightweight, fast, good for basic editing
- **MDX Editor** (`@mdxeditor/editor`): Rich text editing with MDX support  
- **TipTap** (`@tiptap/react`): Powerful WYSIWYG editor with collaboration features
- **Vditor** (`vditor`): Feature-rich markdown editor with multiple modes

### 🔗 Cross-Page Linking
- Create links between pages using `[[Page Name]]` syntax
- Automatic link detection and management
- Visual link browser and navigator
- Support for external links

### 📊 Enhanced Statistics
- Real-time character, word, and line count
- Reading time estimation
- Linked pages counter
- Content analysis

### 🎨 Advanced UI Features
- Full-screen editing mode
- Multiple view modes (Edit, Split, Preview)
- Editor engine switching
- File upload/download
- Copy to clipboard
- Improved toolbar and controls

## Installation

### 1. Install New Dependencies

The following packages have been added to `package.json`:

```bash
npm install @mdxeditor/editor @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text @tiptap/pm vditor react-markdown-editor-lite markdown-it dompurify
```

### 2. Install Type Definitions

```bash
npm install --save-dev @types/dompurify @types/markdown-it
```

### 3. CSS Imports

Some editors require CSS imports. Add these to your global CSS file or component:

```css
/* For Vditor */
@import 'vditor/dist/index.css';

/* For TipTap (if using default styles) */
@import '@tiptap/core/dist/index.css';
```

## Usage

### Basic Usage

```tsx
import { AdvancedMarkdownEditor } from '@/components/editor/advanced-markdown-editor'

function MyComponent() {
  return (
    <AdvancedMarkdownEditor
      initialContent="# Hello World"
      title="My Document"
      height={600}
      enableCrossPageLinks={true}
      enableCollaboration={true}
      defaultEditor="uiw"
      onContentChange={(content) => console.log(content)}
      onSave={(content) => console.log('Saving:', content)}
    />
  )
}
```

### With Cross-Page Manager

```tsx
import { AdvancedMarkdownEditor } from '@/components/editor/advanced-markdown-editor'
import { CrossPageManager } from '@/components/editor/cross-page-manager'

function DocumentEditor() {
  const [content, setContent] = useState('')

  const handleLinkInsert = (linkText: string) => {
    setContent(prev => prev + `\n\n${linkText}`)
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3">
        <AdvancedMarkdownEditor
          initialContent={content}
          onContentChange={setContent}
          enableCrossPageLinks={true}
        />
      </div>
      <div className="col-span-1">
        <CrossPageManager
          onLinkInsert={handleLinkInsert}
          onNavigate={(pageId) => console.log('Navigate to:', pageId)}
        />
      </div>
    </div>
  )
}
```

## Editor Comparison

| Feature | UIW | MDX | TipTap | Vditor |
|---------|-----|-----|--------|--------|
| Bundle Size | Small | Medium | Large | Large |
| WYSIWYG | ✅ | ✅ | ✅ | ✅ |
| Collaboration | ❌ | ❌ | ✅ | ❌ |
| MDX Support | ❌ | ✅ | ❌ | ❌ |
| Math Support | ❌ | ✅ | ✅ | ✅ |
| Diagram Support | ❌ | ❌ | ✅ | ✅ |
| Mobile Friendly | ✅ | ✅ | ✅ | ✅ |

## Configuration Options

### AdvancedMarkdownEditor Props

```tsx
interface AdvancedMarkdownEditorProps {
  filePath?: string                    // File path for loading/saving
  initialContent?: string              // Initial markdown content
  title?: string                       // Editor title
  onSave?: (content: string) => void   // Save callback
  onContentChange?: (content: string) => void // Content change callback
  readOnly?: boolean                   // Read-only mode
  height?: string | number             // Editor height
  defaultEditor?: 'uiw' | 'mdx' | 'tiptap' | 'vditor' // Default editor
  enableCrossPageLinks?: boolean       // Enable cross-page linking
  enableCollaboration?: boolean        // Enable collaboration (TipTap only)
  projectId?: string                   // Project ID for linking
}
```

### CrossPageManager Props

```tsx
interface CrossPageManagerProps {
  currentPageId?: string               // Current page ID
  projectId?: string                   // Project ID
  onLinkInsert: (linkText: string) => void // Link insertion callback
  onNavigate: (pageId: string) => void // Navigation callback
  className?: string                   // Additional CSS classes
}
```

## Migration from Old Editor

### 1. Replace Component Import

```tsx
// Old
import { MarkdownEditor } from '@/components/editor/markdown-editor'

// New
import { AdvancedMarkdownEditor } from '@/components/editor/advanced-markdown-editor'
```

### 2. Update Props

```tsx
// Old
<MarkdownEditor
  filePath="/path/to/file.md"
  initialContent="# Hello"
  onSave={handleSave}
/>

// New
<AdvancedMarkdownEditor
  filePath="/path/to/file.md"
  initialContent="# Hello"
  onSave={handleSave}
  enableCrossPageLinks={true}
  defaultEditor="uiw"
/>
```

## Demo Page

Visit `/editor-demo` to see all features in action and compare different editors.

## Performance Considerations

1. **Bundle Size**: TipTap and Vditor add significant bundle size. Use dynamic imports to reduce initial load.

2. **Memory Usage**: Multiple editors can increase memory usage. Consider lazy loading unused editors.

3. **Collaboration**: TipTap collaboration requires WebSocket setup for real-time features.

## Troubleshooting

### Common Issues

1. **SSR Issues**: All editors are dynamically imported to avoid SSR problems.

2. **CSS Conflicts**: Some editors have global CSS that might conflict. Use CSS modules if needed.

3. **TypeScript Errors**: Ensure all type definitions are installed.

### Debug Mode

Enable debug logging by setting:

```tsx
<AdvancedMarkdownEditor
  // ... other props
  debug={true}
/>
```

## Future Enhancements

- [ ] Plugin system for custom extensions
- [ ] Version history and diff viewing
- [ ] Advanced search and replace
- [ ] Custom themes and styling
- [ ] Export to multiple formats
- [ ] Integration with external services
- [ ] Mobile-optimized interface
- [ ] Accessibility improvements

## Support

For issues or questions about the advanced markdown editor, please check:

1. Component documentation in the source files
2. Demo page examples at `/editor-demo`
3. Individual editor documentation:
   - [UIW Editor](https://uiwjs.github.io/react-md-editor/)
   - [MDX Editor](https://mdxeditor.dev/)
   - [TipTap](https://tiptap.dev/)
   - [Vditor](https://b3log.org/vditor/)
