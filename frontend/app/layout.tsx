import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agent for Code Agents',
  description: 'Transform your ideas into structured prompts for AI code generation tools',
  keywords: ['AI', 'code generation', 'prompts', 'automation', 'development'],
  authors: [
    { name: 'Shi Qiu', url: 'https://stephenqsstarthomas.github.io/' },
    { name: 'Siwei Han', url: 'https://lillianwei-h.github.io/' },
    { name: 'Zhaorun Chen', url: 'https://billchan226.github.io/' },
    { name: 'Linjie Li', url: 'https://scholar.google.com/citations?user=WR875gYAAAAJ&hl=en' },
    { name: 'Huaxiu Yao', url: 'https://www.huaxiuyao.io/' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}