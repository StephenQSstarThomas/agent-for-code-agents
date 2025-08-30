'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bot, ArrowRight, Sparkles, Code, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Analysis',
    description: 'Transform vague ideas into structured requirements with intelligent analysis',
  },
  {
    icon: Code,
    title: 'Technical Architecture',
    description: 'Generate comprehensive system design and technical specifications',
  },
  {
    icon: FileText,
    title: 'Task Breakdown',
    description: 'Create detailed implementation plans with actionable task lists',
  },
  {
    icon: Users,
    title: 'Interactive Workflow',
    description: 'Review, edit, and refine outputs at each step of the process',
  },
]

export default function HomePage() {
  const router = useRouter()

  // Remove auto-redirect - let users browse the homepage freely

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Bot className="h-10 w-10 text-white" />
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-12 leading-[1.3] tracking-wide"
            style={{ 
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              paddingBottom: '0.25rem',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Agent for Code Agents
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mb-8"
          >
            <p className="text-base text-muted-foreground mb-3">Contributors:</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-base">
              <a 
                href="https://stephenqsstarthomas.github.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors underline decoration-dotted"
              >
                Shi Qiu
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="https://lillianwei-h.github.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors underline decoration-dotted"
              >
                Siwei Han
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="https://billchan226.github.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors underline decoration-dotted"
              >
                Zhaorun Chen
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="https://www.huaxiuyao.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors underline decoration-dotted"
              >
                Huaxiu Yao
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="https://scholar.google.com/citations?user=WR875gYAAAAJ&hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors underline decoration-dotted"
              >
                Linjie Li
              </a>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Transform your natural language project ideas into well-structured, detailed prompts 
            optimized for AI code generation tools like Cursor, Claude, and GPT-4.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              variant="gradient"
              onClick={() => router.push('/dashboard')}
              className="text-lg px-8 py-4 h-auto min-w-[180px]"
            >
              Browse Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/project/new')}
              className="text-lg px-8 py-4 h-auto min-w-[180px]"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-card">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Workflow Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-8">Interactive 4-Phase Workflow</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              { step: 1, title: 'Analysis', desc: 'Requirements Analysis' },
              { step: 2, title: 'Architecture', desc: 'Technical Design' },
              { step: 3, title: 'Planning', desc: 'Task Breakdown' },
              { step: 4, title: 'Optimization', desc: 'Final Prompt' },
            ].map((phase, index) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                className="relative"
              >
                <Card className="p-6 bg-gradient-card border-0">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                      {phase.step}
                    </div>
                    <h3 className="font-semibold mb-2">{phase.title}</h3>
                    <p className="text-sm text-muted-foreground">{phase.desc}</p>
                  </div>
                </Card>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-card rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Ideas?</h3>
            <p className="text-muted-foreground mb-6">
              Start your AI-powered development workflow today. Create structured prompts that help you build better software faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="gradient"
                onClick={() => router.push('/project/new')}
                className="px-6"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Your First Project
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="px-6"
              >
                Explore Dashboard
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}