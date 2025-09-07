'use client'

import { useState } from 'react'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Play, 
  Edit, 
  RefreshCw,
  ChevronRight,
  ChevronDown,
  FileText,
  ExternalLink,
  Download,
  FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { cn, formatFileSize } from '@/lib/utils'
import type { ProjectStep } from '@/lib/store'

interface WorkflowStepsProps {
  onStepAction?: (stepId: string, action: 'run' | 'edit' | 'regenerate' | 'load') => void
  onFileOpen?: (filePath: string) => void
  hasExistingWorkflow?: boolean
  className?: string
}

export function WorkflowSteps({ onStepAction, onFileOpen, hasExistingWorkflow, className }: WorkflowStepsProps) {
  const { currentProject } = useAppStore()
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])

  if (!currentProject) return null

  const steps = currentProject.steps
  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const progress = (completedSteps / totalSteps) * 100

  const getStepIcon = (status: ProjectStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStepBadgeVariant = (status: ProjectStep['status']) => {
    switch (status) {
      case 'completed':
        return 'success' as const
      case 'in_progress':
        return 'warning' as const
      case 'error':
        return 'destructive' as const
      default:
        return 'secondary' as const
    }
  }

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const canRunStep = (step: ProjectStep, index: number) => {
    if (step.status === 'in_progress') return false
    if (index === 0) return true
    return steps[index - 1].status === 'completed'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Workflow Progress</CardTitle>
            <Badge variant="outline">
              {completedSteps}/{totalSteps} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {progress === 100 ? 'All steps completed!' : 'Workflow in progress'}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.includes(step.id)
          const hasOutput = Boolean(step.output)
          const canRun = canRunStep(step, index)

          return (
            <Card 
              key={step.id}
              className={cn(
                "transition-all duration-200",
                step.status === 'in_progress' && "ring-2 ring-yellow-500/20",
                step.status === 'completed' && "bg-green-50/50 dark:bg-green-900/10",
                step.status === 'error' && "bg-red-50/50 dark:bg-red-900/10"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {getStepIcon(step.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{step.name}</h3>
                        <Badge variant={getStepBadgeVariant(step.status)} className="text-xs">
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action Buttons */}
                    {step.status === 'pending' && canRun && (
                      <>
                        {hasExistingWorkflow ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStepAction?.(step.id, 'load')}
                          >
                            <FolderOpen className="h-4 w-4 mr-1" />
                            Load
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          onClick={() => onStepAction?.(step.id, 'run')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {hasExistingWorkflow ? 'Regenerate' : 'Run'}
                        </Button>
                      </>
                    )}
                    
                    {step.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStepAction?.(step.id, 'regenerate')}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Regenerate
                      </Button>
                    )}
                    
                    {step.filePath && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFileOpen?.(step.filePath!)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}

                    {/* Expand/Collapse */}
                    {hasOutput && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStepExpansion(step.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Step Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span>
                    Updated {step.updatedAt.toLocaleDateString()} at {step.updatedAt.toLocaleTimeString()}
                  </span>
                  {step.filePath && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{step.filePath}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* Expanded Output */}
              {isExpanded && hasOutput && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Output Preview</h4>
                      {step.filePath && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onFileOpen?.(step.filePath!)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open Full File
                        </Button>
                      )}
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar">
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        {step.output}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              )}

              {/* Connection Line to Next Step */}
              {index < steps.length - 1 && (
                <div className="flex justify-center">
                  <div className={cn(
                    "w-px h-6 -mb-4 -mt-2 z-10",
                    step.status === 'completed' ? "bg-green-300" : "bg-muted"
                  )} />
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}