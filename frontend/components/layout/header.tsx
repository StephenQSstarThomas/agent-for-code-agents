'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Bot, Github, Moon, Sun, Home, Settings, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function Header() {
  const { sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, currentProject } = useAppStore()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold">Agent for Code Agents</h1>
                {currentProject && (
                  <p className="text-sm text-muted-foreground">
                    {currentProject.name}
                  </p>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Center section - Project status */}
        {currentProject && (
          <div className="hidden md:flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              currentProject.status === 'completed' && "bg-green-500",
              currentProject.status === 'processing' && "bg-yellow-500 animate-pulse",
              currentProject.status === 'error' && "bg-red-500",
              currentProject.status === 'draft' && "bg-gray-400"
            )} />
            <span className="text-sm capitalize">{currentProject.status}</span>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Navigation buttons - only show when not on home page */}
          {pathname !== '/' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="hidden sm:inline-flex"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden sm:inline-flex"
          >
            <a
              href="https://github.com/anthropics/claude-code"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}