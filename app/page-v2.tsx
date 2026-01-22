'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmailCampaignWorkflow from './components/EmailCampaignWorkflow'
import VideoProductionWorkflow from './components/VideoProductionWorkflow'
import ImageGenerationWorkflow from './components/ImageGenerationWorkflow'
import AudioWorkflow from './components/AudioWorkflow'
import ThreeDWorkflow from './components/ThreeDWorkflow'
import ResearchWorkflow from './components/ResearchWorkflow'
import AutomationBuilder from './components/AutomationBuilder'

type IntentId = 'email_campaign' | 'video_production' | 'image_generation' | 'audio' | '3d_assets' | 'research' | 'automation' | null

interface IntentModule {
  id: IntentId
  icon: string
  title: string
  subtitle: string
  tools: string[]
  color: string
  gradient: string
}

const intentModules: IntentModule[] = [
  {
    id: 'email_campaign',
    icon: '📧',
    title: 'Email Campaign',
    subtitle: 'Figma templates, copy, AI images',
    tools: ['Figma', 'Stability SD3.5', 'Claude Opus', 'Photoshop'],
    color: '#9333EA',
    gradient: 'from-purple-600 to-pink-500'
  },
  {
    id: 'video_production',
    icon: '🎬',
    title: 'Video Production',
    subtitle: 'AI video generation & editing',
    tools: ['Luma Dream Machine', 'Runway Gen-3', 'Premiere Pro'],
    color: '#3B82F6',
    gradient: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'image_generation',
    icon: '🎨',
    title: 'Image Generation',
    subtitle: 'Concept art & product shots',
    tools: ['Stability SD3.5', 'KREA AI', 'Photoshop'],
    color: '#22C55E',
    gradient: 'from-green-600 to-emerald-500'
  },
  {
    id: 'audio',
    icon: '🎵',
    title: 'Audio Production',
    subtitle: 'Music, SFX & voiceover',
    tools: ['ElevenLabs', 'Stability Audio', 'Suno AI'],
    color: '#F97316',
    gradient: 'from-orange-600 to-yellow-500'
  },
  {
    id: '3d_assets',
    icon: '🎲',
    title: '3D Assets',
    subtitle: 'Models, textures & scenes',
    tools: ['SPAR3D', 'Stability SD3.5', 'After Effects'],
    color: '#EC4899',
    gradient: 'from-pink-600 to-rose-500'
  },
  {
    id: 'research',
    icon: '🔬',
    title: 'Research & Ideation',
    subtitle: 'Parallel AI research & planning',
    tools: ['Perplexity', 'Claude', 'Gemini'],
    color: '#8B5CF6',
    gradient: 'from-violet-600 to-purple-500'
  },
  {
    id: 'automation',
    icon: '⚡',
    title: 'Automation Builder',
    subtitle: 'Custom workflows & pipelines',
    tools: ['Notion', 'Replicate', 'Hugging Face', 'n8n'],
    color: '#06B6D4',
    gradient: 'from-cyan-600 to-teal-500'
  }
]

interface ServiceStatus {
  name: string
  configured: boolean
  description: string
}

interface ApiStatus {
  services: Record<string, ServiceStatus>
  summary: {
    connected: number
    total: number
    status: string
  }
}

// Sub-agents configuration
const subAgents = [
  {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    specialty: 'Strategic Analysis & Creative Writing',
    capabilities: ['Deep reasoning', 'Long-form content', 'Code generation', 'Task planning'],
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🔍',
    specialty: 'Real-time Web Research',
    capabilities: ['Live search', 'Cited sources', 'Fact-checking', 'Trend analysis'],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    specialty: 'Multimodal Reasoning',
    capabilities: ['Image analysis', 'Data synthesis', 'Technical research', 'Code review'],
    color: 'from-blue-500 to-purple-500',
  },
  {
    id: 'gpt4',
    name: 'GPT-4',
    icon: '🤖',
    specialty: 'General Intelligence',
    capabilities: ['Versatile tasks', 'API integration', 'Data analysis', 'Translation'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    icon: '🔄',
    specialty: 'Open-Source Models',
    capabilities: ['Flux', 'SDXL', 'LLaMA', 'Whisper', 'Custom models'],
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    icon: '🤗',
    specialty: 'ML Inference',
    capabilities: ['Embeddings', 'Classification', 'NER', 'Sentiment'],
    color: 'from-yellow-500 to-orange-500',
  },
]

export default function Home() {
  const [selectedIntent, setSelectedIntent] = useState<IntentId>(null)
  const [showLanding, setShowLanding] = useState(true)
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [commandPrompt, setCommandPrompt] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['claude', 'perplexity'])
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Fetch API status on mount
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Build tool status from API response
  const toolStatus = [
    { name: 'Figma', status: 'active', description: 'MCP Connected' },
    { name: 'Photoshop', status: 'active', description: 'MCP Connected' },
    {
      name: 'Stability AI',
      status: apiStatus?.services?.stability?.configured ? 'active' : 'pending',
      description: apiStatus?.services?.stability?.description || 'Checking...'
    },
    {
      name: 'Luma AI',
      status: apiStatus?.services?.luma?.configured ? 'active' : 'pending',
      description: apiStatus?.services?.luma?.description || 'Checking...'
    },
    {
      name: 'Runway',
      status: apiStatus?.services?.runway?.configured ? 'active' : 'pending',
      description: apiStatus?.services?.runway?.description || 'Checking...'
    },
    {
      name: 'ElevenLabs',
      status: apiStatus?.services?.elevenlabs?.configured ? 'active' : 'pending',
      description: apiStatus?.services?.elevenlabs?.description || 'Checking...'
    },
    {
      name: 'Claude',
      status: apiStatus?.services?.anthropic?.configured ? 'active' : 'pending',
      description: apiStatus?.services?.anthropic?.description || 'Checking...'
    },
    {
      name: 'OpenAI',
      status: apiStatus?.services?.openai?.configured ? 'active' : 'pending',
      description: apiStatus?.services?.openai?.description || 'Checking...'
    },
  ]

  const handleSelectIntent = (intentId: IntentId) => {
    setSelectedIntent(intentId)
    setShowLanding(false)
  }

  const handleBackToLanding = () => {
    setSelectedIntent(null)
    setShowLanding(true)
  }

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const handleCommandSubmit = async () => {
    if (!commandPrompt.trim()) return
    setIsProcessing(true)

    // Parse command to detect workflow intent
    const lowerPrompt = commandPrompt.toLowerCase()

    // Check for workflow triggers
    if (lowerPrompt.includes('email') || lowerPrompt.includes('campaign')) {
      setSelectedIntent('email_campaign')
      setShowLanding(false)
    } else if (lowerPrompt.includes('video') || lowerPrompt.includes('film')) {
      setSelectedIntent('video_production')
      setShowLanding(false)
    } else if (lowerPrompt.includes('image') || lowerPrompt.includes('photo') || lowerPrompt.includes('picture')) {
      setSelectedIntent('image_generation')
      setShowLanding(false)
    } else if (lowerPrompt.includes('audio') || lowerPrompt.includes('music') || lowerPrompt.includes('voice')) {
      setSelectedIntent('audio')
      setShowLanding(false)
    } else if (lowerPrompt.includes('3d') || lowerPrompt.includes('model')) {
      setSelectedIntent('3d_assets')
      setShowLanding(false)
    } else if (lowerPrompt.includes('research') || lowerPrompt.includes('analyze')) {
      setSelectedIntent('research')
      setShowLanding(false)
    } else if (lowerPrompt.includes('automat') || lowerPrompt.includes('workflow') || lowerPrompt.includes('pipeline')) {
      setSelectedIntent('automation')
      setShowLanding(false)
    }

    setIsProcessing(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ')
      setCommandPrompt(prev => prev + (prev ? ' ' : '') + `[Attached: ${fileNames}]`)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Header */}
            <header className="border-b border-[#2a2a2a]">
              <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
                    ⚡
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold gradient-text">SOLUS FORGE</h1>
                    <span className="text-xs text-gray-500">v2.3 • Creative Command Center</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                    🟢 Systems Online
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
              {/* Hero */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4">What are we creating today?</h2>
                <p className="text-gray-500 text-lg">Command your AI agents or select a workflow</p>
              </div>

              {/* Sub-Agents Command Center */}
              <div className="bg-gradient-to-br from-[#141414] to-[#1a1a2e] border border-[#2a2a2a] rounded-2xl p-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    🤖 AI Sub-Agents
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                      {selectedAgents.length} active
                    </span>
                  </h3>
                  <div className="text-xs text-gray-500">Click to toggle • Drag files for context</div>
                </div>

                {/* Agent Pills */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {subAgents.map(agent => (
                    <motion.button
                      key={agent.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleAgent(agent.id)}
                      className={`relative group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        selectedAgents.includes(agent.id)
                          ? 'bg-[#1e1e1e] border-purple-500/50 shadow-lg shadow-purple-500/10'
                          : 'bg-[#141414] border-[#2a2a2a] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-lg`}>
                        {agent.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {agent.name}
                          {selectedAgents.includes(agent.id) && (
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{agent.specialty}</div>
                      </div>
                      {/* Hover tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="text-xs text-gray-400 flex flex-wrap gap-1 max-w-[200px]">
                          {agent.capabilities.map((cap, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-[#2a2a2a] rounded text-[10px]">{cap}</span>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Command Input */}
                <div
                  className={`relative ${dragActive ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={commandPrompt}
                        onChange={(e) => setCommandPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleCommandSubmit()
                          }
                        }}
                        placeholder="Solus, leverage Claude and Perplexity to research skincare trends for Q2, then launch the email campaign workflow with this brief..."
                        className="w-full h-24 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none text-sm"
                      />
                      {/* File Drop Overlay */}
                      {dragActive && (
                        <div className="absolute inset-0 bg-purple-500/10 border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center">
                          <div className="text-purple-400 text-sm font-medium">
                            📎 Drop files for context (PDF, MD, TXT, Images, GDrive links)
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleCommandSubmit}
                        disabled={isProcessing || !commandPrompt.trim()}
                        className={`px-6 h-12 rounded-xl font-medium transition-all flex items-center gap-2 ${
                          isProcessing || !commandPrompt.trim()
                            ? 'bg-[#2a2a2a] text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/20'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing
                          </>
                        ) : (
                          <>⚡ Execute</>
                        )}
                      </button>
                      <label className="px-4 h-10 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-xs text-gray-400 flex items-center justify-center gap-2 cursor-pointer hover:border-gray-600 transition-colors">
                        <input type="file" multiple className="hidden" onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          if (files.length > 0) {
                            const fileNames = files.map(f => f.name).join(', ')
                            setCommandPrompt(prev => prev + (prev ? ' ' : '') + `[Attached: ${fileNames}]`)
                          }
                        }} />
                        📎 Attach
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                    <span>Supports:</span>
                    <span className="px-2 py-1 bg-[#1e1e1e] rounded">PDF</span>
                    <span className="px-2 py-1 bg-[#1e1e1e] rounded">Markdown</span>
                    <span className="px-2 py-1 bg-[#1e1e1e] rounded">TXT</span>
                    <span className="px-2 py-1 bg-[#1e1e1e] rounded">Images</span>
                    <span className="px-2 py-1 bg-[#1e1e1e] rounded">GDrive Links</span>
                    <span className="px-2 py-1 bg-[#1e1e1e] rounded">Notion</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-px bg-[#2a2a2a]" />
                <span className="text-gray-600 text-sm">or select a workflow</span>
                <div className="flex-1 h-px bg-[#2a2a2a]" />
              </div>

              {/* Intent Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {intentModules.map((intent, index) => (
                  <motion.div
                    key={intent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSelectIntent(intent.id)}
                    className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 cursor-pointer card-hover group"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${intent.gradient} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                      {intent.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{intent.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{intent.subtitle}</p>
                    <div className="flex flex-wrap gap-2">
                      {intent.tools.slice(0, 3).map(tool => (
                        <span key={tool} className="px-2 py-1 bg-[#1e1e1e] rounded text-xs text-gray-400">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tool Status Grid */}
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🔧 Connected Tools
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {toolStatus.map(tool => (
                    <div key={tool.name} className="p-3 bg-[#1e1e1e] rounded-lg flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${tool.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <div>
                        <div className="text-sm font-medium">{tool.name}</div>
                        <div className="text-xs text-gray-500">{tool.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Workspace Header */}
            <header className="border-b border-[#2a2a2a] sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-50">
              <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToLanding}
                    className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center text-xl">
                      ⚡
                    </div>
                    <div>
                      <h1 className="text-lg font-bold">SOLUS FORGE</h1>
                      <span className="text-xs text-gray-500">
                        {intentModules.find(i => i.id === selectedIntent)?.title}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {intentModules.find(i => i.id === selectedIntent)?.icon} {intentModules.find(i => i.id === selectedIntent)?.title}
                  </div>
                </div>
              </div>
            </header>

            {/* Workspace Content */}
            <main className="max-w-7xl mx-auto px-6 py-6">
              {selectedIntent === 'email_campaign' && <EmailCampaignWorkflow />}
              {selectedIntent === 'video_production' && <VideoProductionWorkflow />}
              {selectedIntent === 'image_generation' && <ImageGenerationWorkflow />}
              {selectedIntent === 'audio' && <AudioWorkflow />}
              {selectedIntent === '3d_assets' && <ThreeDWorkflow />}
              {selectedIntent === 'research' && <ResearchWorkflow />}
              {selectedIntent === 'automation' && <AutomationBuilder />}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
