# Agent for Code Agents - Frontend

A modern React-based user interface for the Agent for Code Agents project.

## 🚀 Features

### ✨ Modern UI Components
- **Beautiful Design**: Modern, clean interface with dark/light mode
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Accessible**: Built with accessibility in mind using Radix UI primitives
- **Smooth Animations**: Framer Motion powered animations and transitions

### 🤖 Interactive Workflow
- **4-Phase Process**: Visual workflow for Analysis → Architecture → Planning → Optimization
- **Real-time Progress**: Live updates and progress tracking
- **Step Navigation**: Go back and forth between workflow steps
- **File Management**: View and edit generated files inline

### 💬 Advanced Chat Interface
- **Multi-turn Conversations**: Support for ongoing conversations with agents
- **Message Types**: User, assistant, and system messages with proper styling
- **Markdown Support**: Rich text rendering with code highlighting
- **URL & File Detection**: Automatically detects and processes URLs and file paths
- **Real-time Typing Indicators**: Visual feedback during processing

### 📝 Powerful Editors
- **Monaco Editor Integration**: VS Code-quality editing experience
- **Syntax Highlighting**: Support for multiple programming languages
- **Auto-resize Textarea**: Smart text input that adapts to content
- **File Preview**: Markdown preview and syntax highlighting
- **Auto-save**: Intelligent saving with change tracking

### 📊 Project Management
- **Dashboard Overview**: Status cards and project statistics
- **Project History**: Complete project timeline and version history
- **Workspace Organization**: Clean file and folder management
- **Status Tracking**: Visual progress indicators and status badges

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions

### UI Components
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Beautiful component library
- **Lucide React**: Consistent icon set
- **Monaco Editor**: Code editing capabilities

### State Management
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management (ready to integrate)

### Backend Integration
- **FastAPI Client**: RESTful API communication
- **WebSocket Support**: Real-time updates
- **Server-Sent Events**: Progress streaming

## 📁 Project Structure

```
frontend/
├── app/                     # Next.js App Router
│   ├── globals.css         # Global styles and CSS variables
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Landing page with hero section
│   ├── dashboard/          # Dashboard pages
│   └── project/            # Project-related pages
├── components/             # React components
│   ├── ui/                 # Base UI components (Button, Card, etc.)
│   ├── layout/             # Layout components (Header, Sidebar)
│   ├── forms/              # Form components (ProjectForm)
│   ├── editors/            # Editor components (Monaco)
│   ├── chat/               # Chat interface components
│   └── workflow/           # Workflow and step components
├── lib/                    # Utility libraries
│   ├── api.ts             # API client and types
│   ├── store.ts           # Zustand state management
│   └── utils.ts           # Helper functions
└── styles/                # Additional styles
```

## 🎨 Design System

### Color Scheme
- **Primary**: Blue-based gradient system
- **Secondary**: Neutral grays for content
- **Success**: Green for completed states
- **Warning**: Yellow for in-progress states
- **Error**: Red for error states

### Typography
- **Font**: Inter (clean, readable, modern)
- **Headings**: Bold weights for hierarchy
- **Body**: Regular weight for readability
- **Code**: Monospace for technical content

### Components
- **Cards**: Elevated surfaces with subtle shadows
- **Buttons**: Multiple variants (solid, outline, ghost)
- **Badges**: Status indicators with semantic colors
- **Progress**: Visual progress tracking
- **Tabs**: Clean navigation between content

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Python backend running on port 8000

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

### Backend Connection

The frontend connects to the Python backend API:
- **Development**: `http://localhost:8000`
- **API Endpoints**: `/api/projects`, `/api/agents/*`, `/api/files/*`
- **WebSocket**: Real-time updates for long-running operations

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Tailwind Configuration
Custom design tokens in `tailwind.config.js`:
- Colors, spacing, animations
- Custom component classes
- Dark mode support

## 🎯 Key Features Implementation

### 1. Multi-line Text Input with Recognition
- **Auto-resize Textarea**: Grows with content
- **URL Detection**: Automatically finds and highlights URLs
- **File Path Recognition**: Detects local file paths
- **Smart Processing**: Fetches content from URLs and reads local files

### 2. Multi-turn Dynamic Interaction
- **Chat Interface**: Conversational flow with agents
- **Message History**: Persistent conversation state
- **Context Awareness**: Messages include workflow context
- **Real-time Updates**: Live response streaming

### 3. README File Visualization
- **Monaco Editor**: Full-featured code editor
- **Markdown Preview**: Side-by-side editing and preview
- **Syntax Highlighting**: Language-aware highlighting
- **File Management**: Open, edit, save workflow

### 4. Beautiful Design
- **Modern Aesthetics**: Clean, professional appearance
- **Smooth Animations**: Framer Motion transitions
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Modes**: User preference support

## 🔄 API Integration

### REST Endpoints
```typescript
// Create project
POST /api/projects
{
  name: string
  description: string
  userPrompt: string
}

// Run workflow steps
POST /api/agents/analysis
POST /api/agents/architect
POST /api/agents/planning
POST /api/agents/optimization

// File operations
POST /api/files/read
POST /api/files/write
POST /api/files/list
```

### Real-time Updates
- **WebSocket**: `/ws/projects/{id}`
- **Server-Sent Events**: `/api/projects/{id}/stream`
- **Progress Tracking**: Live workflow updates

## 🎨 Customization

### Theming
Modify CSS variables in `globals.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... more variables */
}
```

### Component Styling
Extend Tailwind classes in `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      'custom-blue': '#1e3a8a',
    }
  }
}
```

## 📱 Mobile Experience

- **Responsive Header**: Collapsible navigation
- **Touch-friendly**: Large tap targets
- **Swipe Gestures**: Natural mobile interactions
- **Optimized Performance**: Lazy loading and code splitting

## 🔒 Security Features

- **Input Sanitization**: XSS protection
- **CORS Configuration**: Secure cross-origin requests  
- **Type Safety**: TypeScript prevents runtime errors
- **Error Boundaries**: Graceful error handling

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic bundle optimization
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components load on demand
- **Caching**: Intelligent API response caching

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.