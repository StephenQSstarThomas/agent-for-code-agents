'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  RefreshCw, 
  Settings as SettingsIcon,
  Key,
  Server,
  Database,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { MainLayout } from '@/components/layout/main-layout'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'

interface EnvironmentConfig {
  API_KEY: string
  BASE_URL: string
  MODEL: string
}

export default function SettingsPage() {
  const [config, setConfig] = useState<EnvironmentConfig>({
    API_KEY: '',
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-4o-mini'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const { toast } = useToast()

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.request<EnvironmentConfig>('/api/config')
      setConfig(response)
    } catch (error) {
      console.error('Failed to load config:', error)
      toast({
        title: "Error loading configuration",
        description: "Failed to load current settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      await apiClient.request('/api/config', {
        method: 'POST',
        body: JSON.stringify(config),
      })
      
      toast({
        title: "Settings saved",
        description: "Configuration has been updated successfully",
        variant: "success",
      })
    } catch (error) {
      console.error('Failed to save config:', error)
      toast({
        title: "Error saving settings",
        description: "Failed to save configuration",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async () => {
    setConnectionStatus('testing')
    try {
      const response = await apiClient.request<{success: boolean, error?: string}>('/api/config/test', {
        method: 'POST',
        body: JSON.stringify(config),
      })
      
      if (response.success) {
        setConnectionStatus('success')
        toast({
          title: "Connection successful",
          description: "API connection is working correctly",
          variant: "success",
        })
      } else {
        throw new Error(response.error || 'Connection failed')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast({
        title: "Connection failed",
        description: `Unable to connect to API: ${error}`,
        variant: "destructive",
      })
    }
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Server className="h-4 w-4 text-muted-foreground" />
    }
  }

  const presetConfigs = {
    openai: {
      name: 'OpenAI',
      BASE_URL: 'https://api.openai.com/v1',
      MODEL: 'gpt-4o-mini'
    },
    azure: {
      name: 'Azure OpenAI',
      BASE_URL: 'https://your-resource.openai.azure.com/',
      MODEL: 'gpt-4'
    },
    local: {
      name: 'Local API',
      BASE_URL: 'http://localhost:8080/v1',
      MODEL: 'llama-3.1-8b'
    }
  }

  const applyPreset = (preset: keyof typeof presetConfigs) => {
    const presetConfig = presetConfigs[preset]
    setConfig(prev => ({
      ...prev,
      BASE_URL: presetConfig.BASE_URL,
      MODEL: presetConfig.MODEL
    }))
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Configure API settings and environment variables
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* API Configuration Tab */}
          <TabsContent value="api" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure your AI API settings and credentials
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getConnectionIcon()}
                      <Badge variant={connectionStatus === 'success' ? 'success' : 'secondary'}>
                        {connectionStatus === 'idle' && 'Not tested'}
                        {connectionStatus === 'testing' && 'Testing...'}
                        {connectionStatus === 'success' && 'Connected'}
                        {connectionStatus === 'error' && 'Failed'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Preset Configurations */}
                  <div>
                    <Label className="text-sm font-medium">Quick Setup</Label>
                    <div className="flex gap-2 mt-2">
                      {Object.entries(presetConfigs).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => applyPreset(key as keyof typeof presetConfigs)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key *</Label>
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showApiKey ? 'text' : 'password'}
                        value={config.API_KEY}
                        onChange={(e) => setConfig(prev => ({ ...prev, API_KEY: e.target.value }))}
                        placeholder="Enter your API key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Base URL */}
                  <div className="space-y-2">
                    <Label htmlFor="base-url">Base URL</Label>
                    <Input
                      id="base-url"
                      type="url"
                      value={config.BASE_URL}
                      onChange={(e) => setConfig(prev => ({ ...prev, BASE_URL: e.target.value }))}
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={config.MODEL}
                      onChange={(e) => setConfig(prev => ({ ...prev, MODEL: e.target.value }))}
                      placeholder="gpt-4o-mini"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      onClick={testConnection}
                      variant="outline"
                      disabled={!config.API_KEY || connectionStatus === 'testing'}
                    >
                      {connectionStatus === 'testing' ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Server className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    
                    <Button
                      onClick={saveConfig}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Workspace Tab */}
          <TabsContent value="workspace" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Workspace Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage workspace directory and file storage settings
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Current Workspace</h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {process.cwd()}/workspace
                    </p>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Generated files are automatically saved to the workspace directory.</p>
                    <p className="mt-2">This ensures all project files remain in your local file system.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>
                    Additional configuration options and system information
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Badge variant="outline">Development</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Backend Status</Label>
                      <Badge variant="success">Connected</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Environment Sync</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your settings are synchronized with the .env file to ensure consistency between the web interface and local development.
                    </p>
                    
                    <Button
                      variant="outline"
                      onClick={loadConfig}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Reload from .env
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}