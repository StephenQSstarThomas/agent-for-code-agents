'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, FileText, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatInterfaceProps {
  onMessageSend?: (message: string) => void
  className?: string
  disabled?: boolean
}

export function ChatInterface({ onMessageSend, className, disabled }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { messages, addMessage, isProcessing, clearMessages } = useAppStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing || disabled) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message to store
    addMessage({
      type: 'user',
      content: userMessage,
    })

    // Call parent handler if provided
    if (onMessageSend) {
      onMessageSend(userMessage)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const MessageIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />
      case 'system':
        return <FileText className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getMessageStyles = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-primary text-primary-foreground ml-12'
      case 'system':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted mr-12'
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Welcome to Agent for Code Agents</h3>
                  <p className="text-muted-foreground">
                    Start a conversation to begin your project workflow
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.type === 'user' && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.type === 'user' 
                      ? "bg-primary text-primary-foreground"
                      : message.type === 'system'
                      ? "bg-muted text-muted-foreground"
                      : "bg-gradient-primary text-white"
                  )}>
                    <MessageIcon type={message.type} />
                  </div>
                  
                  <Card className={cn(
                    "flex-1 max-w-[80%]",
                    getMessageStyles(message.type)
                  )}>
                    <CardContent className="p-3">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ className, children, ...props }) => (
                              <code
                                className={cn(
                                  "bg-muted px-1 py-0.5 rounded text-sm",
                                  className
                                )}
                                {...props}
                              >
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.metadata?.step && (
                          <Badge variant="outline" className="text-xs">
                            {message.metadata.step}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <Card className="flex-1 max-w-[80%] bg-muted mr-12">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>Agent is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background p-4">
        <div className="flex items-center gap-2 mb-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              disabled={isProcessing}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here... (Shift+Enter for new line)"
              disabled={isProcessing || disabled}
              autoResize
              className="min-h-[50px] max-h-[120px] resize-none pr-12"
            />
          </div>
          
          <Button
            type="submit"
            disabled={!input.trim() || isProcessing || disabled}
            size="icon"
            className="self-end mb-0.5"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground mt-2">
          Pro tip: Include URLs or file paths in your messages - they'll be automatically processed!
        </p>
      </div>
    </div>
  )
}