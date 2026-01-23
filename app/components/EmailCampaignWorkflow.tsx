'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type TabId = 'templates' | 'copy' | 'images' | 'ai' | 'export'

const tabs: { id: TabId; icon: string; label: string }[] = [
  { id: 'templates', icon: '📋', label: 'Templates' },
  { id: 'copy', icon: '✏️', label: 'Copy Changes' },
  { id: 'images', icon: '🖼️', label: 'Image Replacement' },
  { id: 'ai', icon: '🤖', label: 'AI Generation' },
  { id: 'export', icon: '📤', label: 'Export' },
]

const tools = [
  { name: 'Figma', status: 'active', description: 'Connected' },
  { name: 'Photoshop', status: 'pending', description: 'MCP Setup' },
  { name: 'Stability AI', status: 'pending', description: 'API Key' },
  { name: 'Solus', status: 'active', description: 'Strategic AI' },
]

interface Template {
  id: string
  name: string
  type: 'psd' | 'figma'
  source: string
  thumbnail?: string
  layers?: string[]
  createdAt: Date
}

export default function EmailCampaignWorkflow() {
  const [activeTab, setActiveTab] = useState<TabId>('templates')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['PNG'])
  const [aiPrompt, setAiPrompt] = useState('')

  // Modal states
  const [showPsdModal, setShowPsdModal] = useState(false)
  const [showFigmaModal, setShowFigmaModal] = useState(false)
  const [figmaUrl, setFigmaUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Email deployment state
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployConfig, setDeployConfig] = useState({
    provider: 'mailchimp',
    listId: '',
    subject: '',
    preheader: '',
    sendTime: 'immediate',
    scheduledTime: '',
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    )
  }

  // Handle PSD file upload
  const handlePsdUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      for (const file of Array.from(files)) {
        if (!file.name.toLowerCase().endsWith('.psd')) {
          setUploadError('Please upload a .psd file')
          continue
        }

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(r => setTimeout(r, 100))
          setUploadProgress(i)
        }

        // Create template from PSD
        const newTemplate: Template = {
          id: `psd-${Date.now()}`,
          name: file.name.replace('.psd', ''),
          type: 'psd',
          source: file.name,
          createdAt: new Date(),
          layers: ['Background', 'Headline', 'Subheadline', 'Body', 'CTA Button', 'Logo'],
        }

        setTemplates(prev => [...prev, newTemplate])
      }

      setShowPsdModal(false)
    } catch (error) {
      setUploadError('Failed to upload PSD file. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle Figma URL import
  const handleFigmaImport = async () => {
    if (!figmaUrl.trim()) {
      setUploadError('Please enter a Figma URL')
      return
    }

    // Validate Figma URL format
    const figmaPattern = /^https:\/\/(www\.)?figma\.com\/(file|design)\/([a-zA-Z0-9]+)/
    if (!figmaPattern.test(figmaUrl)) {
      setUploadError('Please enter a valid Figma URL (e.g., https://figma.com/file/...)')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // Simulate Figma API fetch
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(r => setTimeout(r, 200))
        setUploadProgress(i)
      }

      // Extract file key from URL
      const matches = figmaUrl.match(figmaPattern)
      const fileKey = matches?.[3] || 'unknown'

      // Create template from Figma
      const newTemplate: Template = {
        id: `figma-${Date.now()}`,
        name: `Figma Design (${fileKey.slice(0, 8)}...)`,
        type: 'figma',
        source: figmaUrl,
        createdAt: new Date(),
        layers: ['Frame 1', 'Header', 'Hero Section', 'Content Block', 'Footer'],
      }

      setTemplates(prev => [...prev, newTemplate])
      setFigmaUrl('')
      setShowFigmaModal(false)
    } catch (error) {
      setUploadError('Failed to import from Figma. Please check the URL and try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle email deployment
  const handleDeploy = async () => {
    if (!deployConfig.subject.trim()) {
      setUploadError('Please enter an email subject')
      return
    }

    setIsDeploying(true)
    setDeployStatus('idle')

    try {
      // Simulate deployment
      await new Promise(r => setTimeout(r, 2000))

      // In production, this would call your email API
      // await fetch('/api/email/deploy', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     templates,
      //     config: deployConfig,
      //     formats: selectedFormats,
      //   }),
      // })

      setDeployStatus('success')
      setTimeout(() => {
        setShowDeployModal(false)
        setDeployStatus('idle')
      }, 2000)
    } catch (error) {
      setDeployStatus('error')
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      {/* Main Workspace */}
      <div>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#141414] text-gray-400 hover:bg-[#1e1e1e] hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
          {/* Templates */}
          {activeTab === 'templates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">📋 Template Management</h2>
                <button
                  onClick={() => setShowFigmaModal(true)}
                  className="px-5 py-2.5 bg-purple-600 rounded-lg font-medium hover:bg-purple-700 transition-all text-sm"
                >
                  Import from Figma
                </button>
              </div>

              <div className="p-12 border-2 border-dashed border-[#2a2a2a] rounded-xl text-center hover:border-purple-500/50 transition-colors">
                <div className="text-4xl mb-4">📄</div>
                <h4 className="font-medium mb-2">Import Template from Figma</h4>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Select a frame in Figma Desktop, then ask Solus: "Import the selected Figma frame"
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowPsdModal(true)}
                    className="px-5 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] hover:border-purple-500/50 transition-all text-sm flex items-center gap-2"
                  >
                    <span>📄</span> Upload PSD
                  </button>
                  <button
                    onClick={() => setShowFigmaModal(true)}
                    className="px-5 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] hover:border-purple-500/50 transition-all text-sm flex items-center gap-2"
                  >
                    <span>🔗</span> Paste Figma URL
                  </button>
                </div>
              </div>

              {templates.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {templates.map((t, i) => (
                    <div key={t.id} className="bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:ring-2 ring-purple-500 transition-all">
                      <div className="aspect-[4/5] bg-[#2a2a2a] rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-4xl">{t.type === 'psd' ? '📄' : '🎨'}</span>
                      </div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t.type === 'psd' ? 'Photoshop' : 'Figma'} • {t.layers?.length || 0} layers
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Copy Changes */}
          {activeTab === 'copy' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">✏️ Copy Changes</h2>
                <button className="px-5 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-all text-sm">
                  🤖 AI Suggestions
                </button>
              </div>

              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-16">
                  Import a template first to edit text layers
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <label className="text-sm text-gray-400 mb-2 block">Headline</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter headline text..."
                    />
                  </div>
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <label className="text-sm text-gray-400 mb-2 block">Subheadline</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter subheadline text..."
                    />
                  </div>
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <label className="text-sm text-gray-400 mb-2 block">Body Copy</label>
                    <textarea
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none min-h-[120px]"
                      placeholder="Enter body copy..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image Replacement */}
          {activeTab === 'images' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">🖼️ Image Replacement</h2>
                <button className="px-5 py-2.5 bg-purple-600 rounded-lg font-medium hover:bg-purple-700 transition-all text-sm">
                  Upload Assets
                </button>
              </div>

              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-16">
                  Import a template first to replace images
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <div className="aspect-square bg-[#2a2a2a] rounded-lg mb-3 flex items-center justify-center text-3xl">
                      ��️
                    </div>
                    <p className="text-sm font-medium">Hero Image</p>
                    <p className="text-xs text-gray-500">1200 x 628px</p>
                  </div>
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <div className="aspect-square bg-[#2a2a2a] rounded-lg mb-3 flex items-center justify-center text-3xl">
                      📦
                    </div>
                    <p className="text-sm font-medium">Product Image</p>
                    <p className="text-xs text-gray-500">600 x 600px</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Generation */}
          {activeTab === 'ai' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">🤖 AI Generation</h2>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:ring-2 ring-purple-500/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <h4 className="font-medium">Generate Influencer</h4>
                      <p className="text-gray-500 text-sm">Create AI-generated influencer images for your campaign</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:ring-2 ring-purple-500/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      📦
                    </div>
                    <div>
                      <h4 className="font-medium">Generate Product Shot</h4>
                      <p className="text-gray-500 text-sm">Create professional product photography with AI</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:ring-2 ring-purple-500/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-medium">Custom Generation</h4>
                      <p className="text-gray-500 text-sm">Generate any image with a custom prompt</p>
                    </div>
                  </div>
                </div>
              </div>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[120px] mb-4"
                placeholder="Describe the image you want to generate..."
              />
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:opacity-90 transition-all">
                🎨 Generate Image
              </button>
            </div>
          )}

          {/* Export */}
          {activeTab === 'export' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">📤 Export & Deploy</h2>
              </div>

              <h4 className="text-sm font-medium mb-3 text-gray-400">Select Formats</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'PNG', desc: 'High quality, transparent', icon: '🖼️' },
                  { id: 'JPG', desc: 'Compressed, smaller size', icon: '📷' },
                  { id: 'HTML', desc: 'Email-ready code', icon: '📧' },
                  { id: 'PDF', desc: 'Print-ready format', icon: '📄' },
                ].map(format => (
                  <div
                    key={format.id}
                    onClick={() => toggleFormat(format.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedFormats.includes(format.id)
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[#2a2a2a] bg-[#1e1e1e] hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{format.icon}</span>
                      <strong>{format.id}</strong>
                    </div>
                    <p className="text-xs text-gray-500">{format.desc}</p>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-3 mb-6 cursor-pointer p-3 bg-[#1e1e1e] rounded-xl">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm">Export @2x (Retina)</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl font-medium hover:bg-[#2a2a2a] transition-all">
                  📤 Export All
                </button>
                <button
                  onClick={() => setShowDeployModal(true)}
                  className="py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:opacity-90 transition-all"
                >
                  🚀 Deploy Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {/* Tool Status */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">🔧 Tool Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map(tool => (
              <div key={tool.name} className="p-3 bg-[#1e1e1e] rounded-lg flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tool.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                <div>
                  <div className="text-xs font-medium">{tool.name}</div>
                  <div className="text-[10px] text-gray-500">{tool.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Info */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">📁 Campaign: Nurse Jamie</h3>
          <div className="text-gray-500 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Templates</span>
              <span className="text-white">{templates.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-yellow-400">In Progress</span>
            </div>
            <div className="flex justify-between">
              <span>Client</span>
              <span className="text-white">Nurse Jamie</span>
            </div>
          </div>
        </div>

        {/* Solus Commands */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">🔮 Solus Commands</h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-[#1e1e1e] rounded-lg text-gray-400 font-mono">
              "Import the selected Figma frame"
            </div>
            <div className="p-2.5 bg-[#1e1e1e] rounded-lg text-gray-400 font-mono">
              "Generate influencer: [description]"
            </div>
            <div className="p-2.5 bg-[#1e1e1e] rounded-lg text-gray-400 font-mono">
              "Suggest copy for headline"
            </div>
          </div>
        </div>
      </div>

      {/* PSD Upload Modal */}
      <AnimatePresence>
        {showPsdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => !isUploading && setShowPsdModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span>📄</span> Upload PSD File
                </h3>
                <button
                  onClick={() => !isUploading && setShowPsdModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isUploading}
                >
                  ✕
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".psd"
                multiple
                className="hidden"
                onChange={(e) => handlePsdUpload(e.target.files)}
              />

              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  isUploading ? 'border-purple-500 bg-purple-500/10' : 'border-[#2a2a2a] hover:border-purple-500/50'
                }`}
              >
                {isUploading ? (
                  <div>
                    <div className="text-4xl mb-4 animate-pulse">⏳</div>
                    <p className="text-sm text-gray-400 mb-4">Uploading...</p>
                    <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{uploadProgress}%</p>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-4">📁</div>
                    <p className="font-medium mb-2">Drop PSD files here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </>
                )}
              </div>

              {uploadError && (
                <p className="text-red-400 text-sm mt-4 text-center">{uploadError}</p>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                Supports Adobe Photoshop .psd files. Layers will be automatically detected.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Figma URL Modal */}
      <AnimatePresence>
        {showFigmaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => !isUploading && setShowFigmaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span>🎨</span> Import from Figma
                </h3>
                <button
                  onClick={() => !isUploading && setShowFigmaModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isUploading}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Figma File URL</label>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://figma.com/file/..."
                    className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    disabled={isUploading}
                  />
                </div>

                {isUploading && (
                  <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                {uploadError && (
                  <p className="text-red-400 text-sm">{uploadError}</p>
                )}

                <button
                  onClick={handleFigmaImport}
                  disabled={isUploading || !figmaUrl.trim()}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    isUploading || !figmaUrl.trim()
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                  }`}
                >
                  {isUploading ? 'Importing...' : '🔗 Import Frame'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-[#141414] rounded-xl">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span>💡</span> How to get a Figma URL
                </h4>
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Open your design in Figma</li>
                  <li>Select the frame you want to import</li>
                  <li>Copy the URL from your browser</li>
                  <li>Paste it above and click Import</li>
                </ol>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Deploy Modal */}
      <AnimatePresence>
        {showDeployModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => !isDeploying && setShowDeployModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span>🚀</span> Deploy Email Campaign
                </h3>
                <button
                  onClick={() => !isDeploying && setShowDeployModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isDeploying}
                >
                  ✕
                </button>
              </div>

              {deployStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h4 className="text-xl font-semibold mb-2">Campaign Deployed!</h4>
                  <p className="text-gray-400">Your email campaign has been sent successfully.</p>
                </div>
              ) : deployStatus === 'error' ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">❌</div>
                  <h4 className="text-xl font-semibold mb-2">Deployment Failed</h4>
                  <p className="text-gray-400">Please check your settings and try again.</p>
                  <button
                    onClick={() => setDeployStatus('idle')}
                    className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Email Provider</label>
                    <select
                      value={deployConfig.provider}
                      onChange={(e) => setDeployConfig({ ...deployConfig, provider: e.target.value })}
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      disabled={isDeploying}
                    >
                      <option value="mailchimp">Mailchimp</option>
                      <option value="klaviyo">Klaviyo</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Email Subject</label>
                    <input
                      type="text"
                      value={deployConfig.subject}
                      onChange={(e) => setDeployConfig({ ...deployConfig, subject: e.target.value })}
                      placeholder="Your amazing email subject..."
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      disabled={isDeploying}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Preview Text (Preheader)</label>
                    <input
                      type="text"
                      value={deployConfig.preheader}
                      onChange={(e) => setDeployConfig({ ...deployConfig, preheader: e.target.value })}
                      placeholder="The text that appears after the subject..."
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      disabled={isDeploying}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Send Time</label>
                    <select
                      value={deployConfig.sendTime}
                      onChange={(e) => setDeployConfig({ ...deployConfig, sendTime: e.target.value })}
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      disabled={isDeploying}
                    >
                      <option value="immediate">Send Immediately</option>
                      <option value="scheduled">Schedule for Later</option>
                      <option value="optimal">Optimal Send Time (AI)</option>
                    </select>
                  </div>

                  {deployConfig.sendTime === 'scheduled' && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Scheduled Time</label>
                      <input
                        type="datetime-local"
                        value={deployConfig.scheduledTime}
                        onChange={(e) => setDeployConfig({ ...deployConfig, scheduledTime: e.target.value })}
                        className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        disabled={isDeploying}
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#2a2a2a]">
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-400">Templates to send:</span>
                      <span className="text-white font-medium">{templates.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-400">Export formats:</span>
                      <span className="text-white font-medium">{selectedFormats.join(', ')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying || !deployConfig.subject.trim()}
                    className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      isDeploying || !deployConfig.subject.trim()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90'
                    }`}
                  >
                    {isDeploying ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Deploying...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        Deploy Campaign
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
