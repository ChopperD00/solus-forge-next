'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Integration {
  id: string
  name: string
  icon: string
  description: string
  category: 'storage' | 'ai' | 'automation' | 'media'
  color: string
  actions: string[]
  triggers?: string[]
}

interface WorkflowNode {
  id: string
  integration: string
  action: string
  config: Record<string, any>
  position: { x: number; y: number }
}

const integrations: Integration[] = [
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    description: 'Workspace & knowledge base',
    category: 'storage',
    color: 'from-slate-600 to-slate-800',
    triggers: ['New page created', 'Database updated', 'Page property changed'],
    actions: ['Create page', 'Update database', 'Add to database', 'Search pages', 'Export content'],
  },
  {
    id: 'replicate',
    name: 'Replicate',
    icon: '🔄',
    description: 'Run open-source AI models',
    category: 'ai',
    color: 'from-indigo-500 to-purple-600',
    actions: ['Run model', 'Get prediction', 'List models', 'Create deployment'],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    icon: '🤗',
    description: 'ML models & datasets',
    category: 'ai',
    color: 'from-yellow-500 to-orange-500',
    actions: ['Run inference', 'Text generation', 'Image classification', 'Embeddings', 'Fine-tune model'],
  },
  {
    id: 'n8n',
    name: 'n8n',
    icon: '⚡',
    description: 'Workflow automation',
    category: 'automation',
    color: 'from-red-500 to-pink-500',
    triggers: ['Webhook received', 'Schedule trigger', 'Manual trigger'],
    actions: ['Execute workflow', 'Create workflow', 'HTTP request', 'Transform data'],
  },
  {
    id: 'stability',
    name: 'Stability AI',
    icon: '🎨',
    description: 'Image generation',
    category: 'media',
    color: 'from-purple-500 to-violet-600',
    actions: ['Generate image', 'Upscale', 'Inpaint', 'Outpaint'],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    icon: '🎙️',
    description: 'Voice synthesis',
    category: 'media',
    color: 'from-green-500 to-emerald-600',
    actions: ['Text to speech', 'Voice clone', 'Sound effects'],
  },
  {
    id: 'luma',
    name: 'Luma AI',
    icon: '🎬',
    description: 'Video generation',
    category: 'media',
    color: 'from-cyan-500 to-blue-600',
    actions: ['Generate video', 'Image to video', 'Extend video'],
  },
  {
    id: 'krea',
    name: 'Krea AI',
    icon: '✨',
    description: 'Real-time AI generation',
    category: 'media',
    color: 'from-pink-500 to-rose-600',
    actions: ['Generate image', 'Upscale', 'Enhance', 'Real-time generate'],
  },
]

const workflowTemplates = [
  {
    id: 'content-pipeline',
    name: 'Content Generation Pipeline',
    description: 'Research → Generate → Store workflow',
    steps: ['perplexity:research', 'stability:generate', 'notion:create'],
  },
  {
    id: 'video-production',
    name: 'Video Production Workflow',
    description: 'Script → Voice → Video → Export',
    steps: ['claude:script', 'elevenlabs:voice', 'luma:video', 'notion:save'],
  },
  {
    id: 'data-processing',
    name: 'Data Processing Pipeline',
    description: 'Ingest → Transform → Analyze → Store',
    steps: ['n8n:webhook', 'huggingface:embed', 'claude:analyze', 'notion:database'],
  },
  {
    id: 'image-batch',
    name: 'Batch Image Processing',
    description: 'Generate → Upscale → Enhance → Export',
    steps: ['stability:generate', 'krea:upscale', 'replicate:enhance', 'notion:gallery'],
  },
]

export default function AutomationBuilder() {
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showBuilder, setShowBuilder] = useState(false)

  const categories = [
    { id: 'all', name: 'All', icon: '📦' },
    { id: 'storage', name: 'Storage', icon: '💾' },
    { id: 'ai', name: 'AI Models', icon: '🤖' },
    { id: 'automation', name: 'Automation', icon: '⚡' },
    { id: 'media', name: 'Media', icon: '🎨' },
  ]

  const filteredIntegrations =
    activeCategory === 'all'
      ? integrations
      : integrations.filter((i) => i.category === activeCategory)

  const addNode = (integrationId: string, action: string) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      integration: integrationId,
      action,
      config: {},
      position: { x: nodes.length * 200, y: 100 },
    }
    setNodes([...nodes, newNode])
  }

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId))
  }

  const applyTemplate = (templateId: string) => {
    const template = workflowTemplates.find((t) => t.id === templateId)
    if (!template) return

    setSelectedTemplate(templateId)
    setWorkflowName(template.name)
    setWorkflowDescription(template.description)

    const newNodes: WorkflowNode[] = template.steps.map((step, index) => {
      const [integrationId, action] = step.split(':')
      return {
        id: `node-${Date.now()}-${index}`,
        integration: integrationId,
        action,
        config: {},
        position: { x: index * 220, y: 100 },
      }
    })

    setNodes(newNodes)
    setShowBuilder(true)
  }

  const exportWorkflow = () => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map((n) => ({
        integration: n.integration,
        action: n.action,
        config: n.config,
      })),
      connections: nodes.slice(0, -1).map((n, i) => ({
        from: n.id,
        to: nodes[i + 1]?.id,
      })),
    }

    // Download as JSON
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}_workflow.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Workflow Automation Builder
          </h1>
          <p className="text-slate-400 text-lg">
            Create custom workflows with Notion, Replicate, Hugging Face, n8n, and more
          </p>
        </motion.div>

        {/* Quick Templates */}
        <div className="mb-12">
          <h3 className="text-white text-lg font-semibold mb-4">Quick Start Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowTemplates.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => applyTemplate(template.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <h4 className="text-white font-medium mb-1">{template.name}</h4>
                <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.steps.map((step, i) => {
                    const [integrationId] = step.split(':')
                    const integration = integrations.find((int) => int.id === integrationId)
                    return (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-slate-700 rounded-full"
                      >
                        {integration?.icon}
                      </span>
                    )
                  })}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="mb-12">
          <h3 className="text-white text-lg font-semibold mb-4">Available Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredIntegrations.map((integration) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-2xl`}
                  >
                    {integration.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{integration.name}</h4>
                    <p className="text-slate-400 text-xs">{integration.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-500 text-xs uppercase tracking-wider">Actions</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.actions.slice(0, 4).map((action, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          addNode(integration.id, action)
                          setShowBuilder(true)
                        }}
                        className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        + {action}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Workflow Builder */}
        <AnimatePresence>
          {showBuilder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-xl font-semibold">Workflow Builder</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNodes([])
                      setShowBuilder(false)
                      setSelectedTemplate(null)
                    }}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={exportWorkflow}
                    disabled={nodes.length === 0}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export Workflow
                  </button>
                </div>
              </div>

              {/* Workflow Name */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Workflow Name</label>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="My Custom Workflow"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Description</label>
                  <input
                    type="text"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="What does this workflow do?"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Workflow Nodes */}
              <div className="min-h-[200px] bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                {nodes.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-slate-500">
                    Click on integration actions above to add steps to your workflow
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4 items-center">
                    {nodes.map((node, index) => {
                      const integration = integrations.find((i) => i.id === node.integration)
                      return (
                        <div key={node.id} className="flex items-center gap-2">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative p-4 rounded-xl bg-gradient-to-br ${integration?.color || 'from-slate-600 to-slate-700'} border border-white/10`}
                          >
                            <button
                              onClick={() => removeNode(node.id)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                            <div className="text-2xl mb-1">{integration?.icon}</div>
                            <div className="text-white text-sm font-medium">{integration?.name}</div>
                            <div className="text-white/70 text-xs">{node.action}</div>
                          </motion.div>
                          {index < nodes.length - 1 && (
                            <div className="text-slate-500 text-2xl">→</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Integration Tips */}
              <div className="mt-6 p-4 bg-indigo-900/30 rounded-xl border border-indigo-500/30">
                <h4 className="text-indigo-400 font-medium mb-2">💡 Integration Tips</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• <strong>Notion:</strong> Great for storing results, managing projects, and triggering workflows</li>
                  <li>• <strong>Replicate:</strong> Run any open-source model (Flux, SDXL, LLaMA, etc.)</li>
                  <li>• <strong>Hugging Face:</strong> Embeddings, text generation, and specialized ML tasks</li>
                  <li>• <strong>n8n:</strong> Connect to 400+ apps, webhooks, and complex automation logic</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
