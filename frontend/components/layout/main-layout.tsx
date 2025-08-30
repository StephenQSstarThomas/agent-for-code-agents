'use client'

import { useEffect } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const { sidebarOpen, darkMode } = useAppStore()

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    if (isDark !== darkMode) {
      useAppStore.getState().toggleDarkMode()
    }
  }, [darkMode])

  // Save dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main 
          className={cn(
            "flex-1 transition-all duration-200",
            sidebarOpen && "lg:ml-0",
            className
          )}
        >
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}