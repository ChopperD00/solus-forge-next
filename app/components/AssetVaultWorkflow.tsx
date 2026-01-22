'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const colors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  border: '#333333',
  text: '#FFFFFF',
  textMuted: '#999999',
  textDim: '#666666',
  vault: '#8B5CF6',
  vaultGlow: 'rgba(139, 92, 246, 0.3)',
  positive: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
}

// Asset types with icons
const assetTypes = [
  { id: 'all', label: 'All Assets', icon: '📁', count: 0 },
  { id: 'image', label: 'Images', icon: '🖼️', count: 0 },
  { id: 'video', label: 'Videos', icon: '🎬', count: 0 },
  { id: 'audio', label: 'Audio', icon: '🎵', count: 0 },
  { id: '3d', label: '3D Models', icon: '🎲', count: 0 },
  { id: 'document', label: 'Documents', icon: '📄', count: 0 },
  { id: 'prompt', label: 'Prompts', icon: '✨', count: 0 },
  { id: 'workflow', label: 'Workflows', icon: '⚡', count: 0 },
]

// Sample assets for demonstration
const sampleAssets = [
  { id: '1', name: 'Product Hero Shot', type: 'image', tags: ['product', 'hero', 'marketing'], created: '2024-01-15', size: '2.4 MB', workflow: 'Image Generation', notebookId: 'nb_001' },
  { id: '2', name: 'Brand Video Intro', type: 'video', tags: ['brand', 'intro', 'motion'], created: '2024-01-14', size: '45 MB', workflow: 'Video Production', notebookId: 'nb_002' },
  { id: '3', name: 'Podcast Jingle', type: 'audio', tags: ['music', 'jingle', 'brand'], created: '2024-01-13', size: '1.2 MB', workflow: 'Audio Production', notebookId: 'nb_001' },
  { id: '4', name: 'Email Campaign Template', type: 'workflow', tags: ['email', 'template', 'automation'], created: '2024-01-12', size: '24 KB', workflow: 'Email Campaign', notebookId: 'nb_003' },
  { id: '5', name: 'Character LoRA Prompts', type: 'prompt', tags: ['lora', 'character', 'sdxl'], created: '2024-01-11', size: '8 KB', workflow: 'Prompt Vault', notebookId: 'nb_001' },
  { id: '6', name: 'Competitor Analysis Doc', type: 'document', tags: ['research', 'competitor', 'analysis'], created: '2024-01-10', size: '156 KB', workflow: 'Research', notebookId: 'nb_004' },
]

// NotebookLM notebooks for knowledge organization
const notebooks = [
  { id: 'nb_001', name: 'Brand Assets', description: 'Core brand visuals, audio, and prompts', assetCount: 12, lastUpdated: '2024-01-15', color: '#8B5CF6' },
  { id: 'nb_002', name: 'Video Projects', description: 'Video production assets and exports', assetCount: 8, lastUpdated: '2024-01-14', color: '#06B6D4' },
  { id: 'nb_003', name: 'Marketing Campaigns', description: 'Email templates, ads, and workflows', assetCount: 15, lastUpdated: '2024-01-12', color: '#10B981' },
  { id: 'nb_004', name: 'Research & Intel', description: 'Research docs and OSINT findings', assetCount: 6, lastUpdated: '2024-01-10', color: '#F59E0B' },
]

interface Asset {
  id: string
  name: string
  type: string
  tags: string[]
  created: string
  size: string
  workflow: string
  notebookId: string
}

export default function AssetVaultWorkflow() {
  const [selectedType, setSelectedType] = useState('all')
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [assets, setAssets] = useState<Asset[]>(sampleAssets)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showNotebookPanel, setShowNotebookPanel] = useState(true)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponses, setAiResponses] = useState<Array<{ query: string; response: string }>>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter assets based on type, notebook, and search
  const filteredAssets = assets.filter(asset => {
    const matchesType = selectedType === 'all' || asset.type === selectedType
    const matchesNotebook = !selectedNotebook || asset.notebookId === selectedNotebook
    const matchesSearch = !searchQuery ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesType && matchesNotebook && matchesSearch
  })

  // Calculate asset counts per type
  const assetCounts = assetTypes.map(type => ({
    ...type,
    count: type.id === 'all'
      ? assets.length
      : assets.filter(a => a.type === type.id).length
  }))

  // Toggle asset selection
  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }

  // Handle AI query to NotebookLM
  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return

    setIsProcessing(true)
    // Simulate NotebookLM response
    await new Promise(resolve => setTimeout(resolve, 1500))

    const response = `Based on your vault contents, I found relevant information about "${aiQuery}".

Here's what I discovered:
• 3 related assets match your query
• The most relevant is in the "${notebooks.find(n => n.id === selectedNotebook)?.name || 'Brand Assets'}" notebook
• Consider linking these with your recent workflow outputs

Would you like me to create a summary document or suggest related assets?`

    setAiResponses(prev => [...prev, { query: aiQuery, response }])
    setAiQuery('')
    setIsProcessing(false)
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Asset Vault
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
            Organize, version, and search your creative assets with AI
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="relative flex-1 md:w-64"
            style={{ background: colors.surface, borderRadius: 12 }}
          >
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-transparent text-sm focus:outline-none"
              style={{ color: colors.text }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          </div>

          {/* View Toggle */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="px-3 py-2 text-sm transition-all"
              style={{
                background: viewMode === 'grid' ? colors.vault : 'transparent',
                color: viewMode === 'grid' ? colors.text : colors.textMuted
              }}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-2 text-sm transition-all"
              style={{
                background: viewMode === 'list' ? colors.vault : 'transparent',
                color: viewMode === 'list' ? colors.text : colors.textMuted
              }}
            >
              ☰
            </button>
          </div>

          {/* AI Chat Toggle */}
          <motion.button
            onClick={() => setShowAIChat(!showAIChat)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{
              background: showAIChat ? colors.vault : colors.surface,
              color: colors.text,
              border: `1px solid ${showAIChat ? colors.vault : colors.border}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🧠 AI Assistant
          </motion.button>

          {/* Upload Button */}
          <motion.button
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${colors.vault} 0%, #7C3AED 100%)`,
              color: colors.text,
              boxShadow: `0 4px 20px ${colors.vaultGlow}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ⬆️ Upload
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-1">
        {/* Left Sidebar - Notebooks (NotebookLM) */}
        <AnimatePresence>
          {showNotebookPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 rounded-2xl overflow-hidden"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                    📓 NotebookLM Collections
                  </h3>
                  <button
                    className="text-lg opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => setShowNotebookPanel(false)}
                  >
                    ×
                  </button>
                </div>

                {/* Notebooks List */}
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedNotebook(null)}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-sm transition-all flex items-center gap-3"
                    style={{
                      background: !selectedNotebook ? `${colors.vault}22` : 'transparent',
                      color: !selectedNotebook ? colors.vault : colors.textMuted,
                      border: `1px solid ${!selectedNotebook ? colors.vault + '44' : 'transparent'}`,
                    }}
                  >
                    <span>📁</span>
                    <div className="flex-1">
                      <div className="font-medium">All Notebooks</div>
                      <div className="text-xs opacity-70">{assets.length} total assets</div>
                    </div>
                  </button>

                  {notebooks.map(notebook => (
                    <button
                      key={notebook.id}
                      onClick={() => setSelectedNotebook(notebook.id)}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-sm transition-all flex items-center gap-3"
                      style={{
                        background: selectedNotebook === notebook.id ? `${notebook.color}22` : 'transparent',
                        color: selectedNotebook === notebook.id ? notebook.color : colors.textMuted,
                        border: `1px solid ${selectedNotebook === notebook.id ? notebook.color + '44' : 'transparent'}`,
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: notebook.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{notebook.name}</div>
                        <div className="text-xs opacity-70">{notebook.assetCount} assets</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Create Notebook Button */}
                <motion.button
                  className="w-full mt-4 px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    background: colors.surfaceLight,
                    color: colors.textMuted,
                    border: `1px dashed ${colors.border}`,
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  + New Notebook
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Asset Type Filters */}
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {assetCounts.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2"
                style={{
                  background: selectedType === type.id ? colors.vault : colors.surface,
                  color: selectedType === type.id ? colors.text : colors.textMuted,
                  border: `1px solid ${selectedType === type.id ? colors.vault : colors.border}`,
                }}
              >
                <span>{type.icon}</span>
                {type.label}
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs"
                  style={{
                    background: selectedType === type.id ? 'rgba(255,255,255,0.2)' : colors.surfaceLight,
                  }}
                >
                  {type.count}
                </span>
              </button>
            ))}
          </div>

          {/* Assets Grid/List */}
          <div
            className="flex-1 rounded-2xl p-4 overflow-y-auto"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            {filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <span className="text-6xl mb-4">📭</span>
                <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                  No assets found
                </h3>
                <p className="text-sm text-center max-w-sm" style={{ color: colors.textMuted }}>
                  {searchQuery
                    ? `No assets match "${searchQuery}". Try a different search term.`
                    : 'Start by uploading assets or saving from your workflows.'
                  }
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAssets.map(asset => (
                  <motion.div
                    key={asset.id}
                    className="rounded-xl overflow-hidden cursor-pointer group"
                    style={{
                      background: colors.surfaceLight,
                      border: `1px solid ${selectedAssets.includes(asset.id) ? colors.vault : colors.border}`,
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => toggleAssetSelection(asset.id)}
                  >
                    {/* Thumbnail */}
                    <div
                      className="aspect-video flex items-center justify-center text-4xl"
                      style={{ background: colors.bg }}
                    >
                      {asset.type === 'image' && '🖼️'}
                      {asset.type === 'video' && '🎬'}
                      {asset.type === 'audio' && '🎵'}
                      {asset.type === '3d' && '🎲'}
                      {asset.type === 'document' && '📄'}
                      {asset.type === 'prompt' && '✨'}
                      {asset.type === 'workflow' && '⚡'}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h4 className="text-sm font-medium truncate" style={{ color: colors.text }}>
                        {asset.name}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs" style={{ color: colors.textDim }}>
                          {asset.size}
                        </span>
                        <span className="text-xs" style={{ color: colors.textDim }}>
                          {asset.created}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {asset.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: colors.bg, color: colors.textMuted }}
                          >
                            {tag}
                          </span>
                        ))}
                        {asset.tags.length > 2 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: colors.bg, color: colors.textDim }}
                          >
                            +{asset.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedAssets.includes(asset.id) && (
                      <div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: colors.vault }}
                      >
                        ✓
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map(asset => (
                  <motion.div
                    key={asset.id}
                    className="flex items-center gap-4 p-3 rounded-xl cursor-pointer"
                    style={{
                      background: selectedAssets.includes(asset.id) ? `${colors.vault}15` : colors.surfaceLight,
                      border: `1px solid ${selectedAssets.includes(asset.id) ? colors.vault + '44' : colors.border}`,
                    }}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => toggleAssetSelection(asset.id)}
                  >
                    <span className="text-2xl">
                      {asset.type === 'image' && '🖼️'}
                      {asset.type === 'video' && '🎬'}
                      {asset.type === 'audio' && '🎵'}
                      {asset.type === '3d' && '🎲'}
                      {asset.type === 'document' && '📄'}
                      {asset.type === 'prompt' && '✨'}
                      {asset.type === 'workflow' && '⚡'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate" style={{ color: colors.text }}>
                        {asset.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs" style={{ color: colors.textDim }}>
                        <span>{asset.workflow}</span>
                        <span>•</span>
                        <span>{asset.size}</span>
                        <span>•</span>
                        <span>{asset.created}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {asset.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ background: colors.bg, color: colors.textMuted }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Assets Actions Bar */}
          <AnimatePresence>
            {selectedAssets.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: colors.vault, color: colors.text }}
              >
                <span className="text-sm font-medium">
                  {selectedAssets.length} asset{selectedAssets.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-sm bg-white/20 hover:bg-white/30 transition-colors">
                    📁 Move to Notebook
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-sm bg-white/20 hover:bg-white/30 transition-colors">
                    🏷️ Add Tags
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-sm bg-white/20 hover:bg-white/30 transition-colors">
                    ⬇️ Download
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg text-sm bg-red-500/30 hover:bg-red-500/50 transition-colors"
                    onClick={() => setSelectedAssets([])}
                  >
                    ✕ Clear
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - AI Chat (NotebookLM Integration) */}
        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 rounded-2xl overflow-hidden flex flex-col"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                  🧠 NotebookLM AI
                </h3>
                <button
                  className="text-lg opacity-60 hover:opacity-100 transition-opacity"
                  onClick={() => setShowAIChat(false)}
                >
                  ×
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {aiResponses.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">🧠</span>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      Ask questions about your assets, get summaries, or find connections between items in your vault.
                    </p>
                  </div>
                ) : (
                  aiResponses.map((item, i) => (
                    <div key={i} className="space-y-3">
                      {/* User Query */}
                      <div className="flex justify-end">
                        <div
                          className="px-3 py-2 rounded-xl rounded-tr-sm max-w-[85%] text-sm"
                          style={{ background: colors.vault, color: colors.text }}
                        >
                          {item.query}
                        </div>
                      </div>
                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div
                          className="px-3 py-2 rounded-xl rounded-tl-sm max-w-[85%] text-sm whitespace-pre-line"
                          style={{ background: colors.surfaceLight, color: colors.text }}
                        >
                          {item.response}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div
                      className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                      style={{ background: colors.surfaceLight, color: colors.textMuted }}
                    >
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⏳
                      </motion.span>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                    placeholder="Ask about your assets..."
                    className="flex-1 px-3 py-2 rounded-xl bg-transparent text-sm focus:outline-none"
                    style={{
                      background: colors.surfaceLight,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <motion.button
                    onClick={handleAIQuery}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: colors.vault, color: colors.text }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
