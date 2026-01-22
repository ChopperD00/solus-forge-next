'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NeuralNodeCanvas, { NeuralNode, NeuralConnection } from './NeuralNodeCanvas'

const colors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
  accent: '#FF6B00',
  pink: '#FF69B4',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  green: '#10B981',
  yellow: '#F59E0B',
}

// Identity/LoRA management
const identityModels = [
  { id: 'jamie-base', name: 'Nurse Jamie', type: 'face', thumbnail: '👩‍⚕️', trained: true, runpodId: 'lora_jamie_v2' },
  { id: 'stylest-model1', name: 'Stylest Model A', type: 'face', thumbnail: '👱‍♀️', trained: true, runpodId: 'lora_stylest_a' },
  { id: 'stylest-model2', name: 'Stylest Model B', type: 'face', thumbnail: '👩', trained: true, runpodId: 'lora_stylest_b' },
  { id: 'custom-influencer', name: 'Custom Influencer', type: 'face', thumbnail: '✨', trained: false, runpodId: null },
]

// Clothing/Style LoRAs for product swaps
const clothingLoRAs = [
  { id: 'clothing-casual', name: 'Casual Wear', category: 'style', thumbnail: '👕' },
  { id: 'clothing-formal', name: 'Formal Attire', category: 'style', thumbnail: '👔' },
  { id: 'clothing-athletic', name: 'Athletic Wear', category: 'style', thumbnail: '🏃‍♀️' },
  { id: 'clothing-swimwear', name: 'Swimwear', category: 'style', thumbnail: '👙' },
  { id: 'product-skincare', name: 'Skincare Products', category: 'product', thumbnail: '🧴' },
  { id: 'product-jewelry', name: 'Jewelry', category: 'product', thumbnail: '💎' },
]

// SKU/Product library for clothing swap
const productSKUs = [
  { id: 'sku-001', name: 'Summer Dress - Blue', category: 'Dresses', image: '👗', sku: 'DRS-BLU-001' },
  { id: 'sku-002', name: 'Blazer - Black', category: 'Outerwear', image: '🧥', sku: 'BLZ-BLK-001' },
  { id: 'sku-003', name: 'Skincare Serum', category: 'Beauty', image: '🧴', sku: 'SKN-SRM-001' },
  { id: 'sku-004', name: 'Gold Necklace', category: 'Jewelry', image: '📿', sku: 'JWL-NCK-001' },
  { id: 'sku-005', name: 'Athletic Leggings', category: 'Activewear', image: '🩳', sku: 'ATH-LEG-001' },
  { id: 'sku-006', name: 'Face Cream', category: 'Beauty', image: '🫧', sku: 'SKN-CRM-001' },
]

// Output format presets
const outputFormats = [
  { id: 'instagram-feed', name: 'Instagram Feed', ratio: '1:1', size: '1080x1080', icon: '📸' },
  { id: 'instagram-story', name: 'Instagram Story', ratio: '9:16', size: '1080x1920', icon: '📱' },
  { id: 'instagram-post', name: 'Instagram Post', ratio: '4:5', size: '1080x1350', icon: '🖼️' },
  { id: 'youtube-thumb', name: 'YouTube Thumbnail', ratio: '16:9', size: '1280x720', icon: '▶️' },
  { id: 'tiktok', name: 'TikTok', ratio: '9:16', size: '1080x1920', icon: '🎵' },
  { id: 'facebook-ad', name: 'Facebook Ad', ratio: '1:1', size: '1200x1200', icon: '📘' },
]

// Node templates for the workflow
const nodeTemplates = [
  // Identity nodes
  { type: 'identity_select', title: 'Identity', icon: '👤', category: 'Identity', size: 'medium' as const },
  { type: 'lora_loader', title: 'LoRA Loader', icon: '🎭', category: 'Identity', size: 'medium' as const },
  { type: 'face_swap', title: 'Face Swap', icon: '🔄', category: 'Identity', size: 'hub' as const },

  // Product/Clothing nodes
  { type: 'product_select', title: 'Product SKU', icon: '🏷️', category: 'Products', size: 'medium' as const },
  { type: 'clothing_swap', title: 'Clothing Swap', icon: '👗', category: 'Products', size: 'hub' as const },
  { type: 'product_placement', title: 'Product Placement', icon: '📦', category: 'Products', size: 'medium' as const },

  // Generation nodes
  { type: 'wan_generate', title: 'Wan 2.2', icon: '🎬', category: 'Generation', size: 'hub' as const },
  { type: 'flux_generate', title: 'Flux Pro', icon: '🎨', category: 'Generation', size: 'hub' as const },
  { type: 'krea_generate', title: 'Krea AI', icon: '✨', category: 'Generation', size: 'hub' as const },
  { type: 'runway_generate', title: 'Runway Gen-3', icon: '🎥', category: 'Generation', size: 'hub' as const },

  // Post-processing
  { type: 'upscale_4k', title: '4K Upscale', icon: '📐', category: 'Post-Process', size: 'medium' as const },
  { type: 'rife_interpolate', title: 'RIFE 60fps', icon: '🎞️', category: 'Post-Process', size: 'medium' as const },
  { type: 'face_enhance', title: 'Face Enhance', icon: '✨', category: 'Post-Process', size: 'medium' as const },
  { type: 'color_grade', title: 'Color Grade', icon: '🎨', category: 'Post-Process', size: 'medium' as const },

  // Export nodes
  { type: 'format_export', title: 'Format Export', icon: '📤', category: 'Export', size: 'medium' as const },
  { type: 'batch_render', title: 'Batch Render', icon: '⚡', category: 'Export', size: 'hub' as const },
]

// Panel components
function IdentityPanel({ onSelect }: { onSelect: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium" style={{ color: colors.text }}>Trained Identities</h3>
      <div className="grid grid-cols-2 gap-3">
        {identityModels.map(model => (
          <button
            key={model.id}
            onClick={() => { setSelectedId(model.id); onSelect(model.id) }}
            className="p-4 rounded-xl text-left transition-all"
            style={{
              background: selectedId === model.id ? `${colors.accent}22` : colors.bg,
              border: `1px solid ${selectedId === model.id ? colors.accent : colors.border}`,
            }}
          >
            <div className="text-3xl mb-2">{model.thumbnail}</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>{model.name}</div>
            <div className="flex items-center gap-2 mt-1">
              {model.trained ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.green}22`, color: colors.green }}>
                  ✓ Trained
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.yellow}22`, color: colors.yellow }}>
                  Train New
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
        <h4 className="text-xs font-medium mb-3" style={{ color: colors.textMuted }}>Style LoRAs</h4>
        <div className="flex flex-wrap gap-2">
          {clothingLoRAs.map(lora => (
            <button
              key={lora.id}
              className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all hover:bg-white/10"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <span>{lora.thumbnail}</span>
              <span style={{ color: colors.textMuted }}>{lora.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductSwapPanel({ onSelectProduct }: { onSelectProduct: (sku: string) => void }) {
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = productSKUs.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium" style={{ color: colors.text }}>Product/Clothing Swap</h3>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search SKUs..."
        className="w-full p-3 rounded-xl text-sm"
        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
      />

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            onClick={() => { setSelectedSKU(product.id); onSelectProduct(product.sku) }}
            className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all"
            style={{
              background: selectedSKU === product.id ? `${colors.accent}22` : colors.bg,
              border: `1px solid ${selectedSKU === product.id ? colors.accent : colors.border}`,
            }}
          >
            <span className="text-2xl">{product.image}</span>
            <div className="flex-1">
              <div className="text-sm" style={{ color: colors.text }}>{product.name}</div>
              <div className="text-xs" style={{ color: colors.textDim }}>{product.sku}</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: colors.surface, color: colors.textMuted }}>
              {product.category}
            </span>
          </button>
        ))}
      </div>

      <div className="p-3 rounded-xl" style={{ background: `${colors.purple}11`, border: `1px solid ${colors.purple}33` }}>
        <div className="flex items-center gap-2 mb-2">
          <span>🔗</span>
          <span className="text-xs font-medium" style={{ color: colors.purple }}>Virtual Try-On Connection</span>
        </div>
        <p className="text-[10px]" style={{ color: colors.textDim }}>
          Connect to existing campaign models to swap products onto trained influencer identities
        </p>
      </div>
    </div>
  )
}

function ExportPanel({ onFormatSelect }: { onFormatSelect: (formats: string[]) => void }) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['instagram-feed'])

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      onFormatSelect(updated)
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium" style={{ color: colors.text }}>Export Formats</h3>

      <div className="grid grid-cols-2 gap-2">
        {outputFormats.map(format => (
          <button
            key={format.id}
            onClick={() => toggleFormat(format.id)}
            className="p-3 rounded-xl text-left transition-all"
            style={{
              background: selectedFormats.includes(format.id) ? `${colors.accent}22` : colors.bg,
              border: `1px solid ${selectedFormats.includes(format.id) ? colors.accent : colors.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{format.icon}</span>
              <span className="text-xs font-medium" style={{ color: colors.text }}>{format.name}</span>
            </div>
            <div className="text-[10px]" style={{ color: colors.textDim }}>
              {format.ratio} • {format.size}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 py-2 rounded-lg text-xs"
          style={{ background: colors.surface, color: colors.textMuted }}
          onClick={() => { setSelectedFormats(outputFormats.map(f => f.id)); onFormatSelect(outputFormats.map(f => f.id)) }}
        >
          Select All
        </button>
        <button
          className="flex-1 py-2 rounded-lg text-xs"
          style={{ background: colors.surface, color: colors.textMuted }}
          onClick={() => { setSelectedFormats([]); onFormatSelect([]) }}
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default function InfluencerSuiteWorkflow() {
  const [nodes, setNodes] = useState<NeuralNode[]>([
    // Identity section
    {
      id: 'identity_1',
      type: 'identity_select',
      title: 'Identity',
      subtitle: 'Nurse Jamie',
      icon: '👤',
      x: 100,
      y: 200,
      inputs: [],
      outputs: [{ id: 'identity_out', type: 'output', label: 'Identity', dataType: 'tensor' }],
      size: 'medium',
    },
    {
      id: 'lora_1',
      type: 'lora_loader',
      title: 'Face LoRA',
      subtitle: 'jamie_v2.safetensors',
      icon: '🎭',
      x: 100,
      y: 320,
      inputs: [],
      outputs: [{ id: 'lora_out', type: 'output', label: 'LoRA', dataType: 'tensor' }],
      size: 'medium',
    },
    // Product section
    {
      id: 'product_1',
      type: 'product_select',
      title: 'Product SKU',
      subtitle: 'Summer Dress',
      icon: '🏷️',
      x: 100,
      y: 440,
      inputs: [],
      outputs: [{ id: 'product_out', type: 'output', label: 'Product', dataType: 'image' }],
      size: 'medium',
    },
    // Central hub - Clothing Swap
    {
      id: 'swap_hub',
      type: 'clothing_swap',
      title: 'Clothing Swap',
      subtitle: 'Virtual Try-On',
      icon: '👗',
      x: 350,
      y: 280,
      inputs: [
        { id: 'identity_in', type: 'input', label: 'Identity', dataType: 'tensor' },
        { id: 'lora_in', type: 'input', label: 'LoRA', dataType: 'tensor' },
        { id: 'product_in', type: 'input', label: 'Product', dataType: 'image' },
      ],
      outputs: [{ id: 'swap_out', type: 'output', label: 'Swapped', dataType: 'image' }],
      size: 'hub',
    },
    // Generation
    {
      id: 'flux_1',
      type: 'flux_generate',
      title: 'Flux Pro',
      subtitle: 'Image Generation',
      icon: '🎨',
      x: 580,
      y: 200,
      inputs: [{ id: 'input_in', type: 'input', label: 'Input', dataType: 'image' }],
      outputs: [{ id: 'image_out', type: 'output', label: 'Image', dataType: 'image' }],
      size: 'hub',
    },
    {
      id: 'wan_1',
      type: 'wan_generate',
      title: 'Wan 2.2',
      subtitle: 'Video Generation',
      icon: '🎬',
      x: 580,
      y: 360,
      inputs: [{ id: 'input_in', type: 'input', label: 'Input', dataType: 'image' }],
      outputs: [{ id: 'video_out', type: 'output', label: 'Video', dataType: 'video' }],
      size: 'hub',
    },
    // Post-processing
    {
      id: 'upscale_1',
      type: 'upscale_4k',
      title: '4K Upscale',
      subtitle: 'Krea AI',
      icon: '📐',
      x: 810,
      y: 200,
      inputs: [{ id: 'image_in', type: 'input', label: 'Image', dataType: 'image' }],
      outputs: [{ id: 'upscaled_out', type: 'output', label: '4K', dataType: 'image' }],
      size: 'medium',
    },
    {
      id: 'rife_1',
      type: 'rife_interpolate',
      title: 'RIFE 60fps',
      subtitle: 'Frame Interpolation',
      icon: '🎞️',
      x: 810,
      y: 360,
      inputs: [{ id: 'video_in', type: 'input', label: 'Video', dataType: 'video' }],
      outputs: [{ id: 'smooth_out', type: 'output', label: '60fps', dataType: 'video' }],
      size: 'medium',
    },
    // Export
    {
      id: 'export_1',
      type: 'batch_render',
      title: 'Batch Export',
      subtitle: 'All Formats',
      icon: '⚡',
      x: 1020,
      y: 280,
      inputs: [
        { id: 'image_in', type: 'input', label: 'Image', dataType: 'image' },
        { id: 'video_in', type: 'input', label: 'Video', dataType: 'video' },
      ],
      outputs: [],
      size: 'hub',
    },
  ])

  const [connections, setConnections] = useState<NeuralConnection[]>([
    { id: 'c1', fromNode: 'identity_1', fromPort: 'identity_out', toNode: 'swap_hub', toPort: 'identity_in' },
    { id: 'c2', fromNode: 'lora_1', fromPort: 'lora_out', toNode: 'swap_hub', toPort: 'lora_in' },
    { id: 'c3', fromNode: 'product_1', fromPort: 'product_out', toNode: 'swap_hub', toPort: 'product_in' },
    { id: 'c4', fromNode: 'swap_hub', fromPort: 'swap_out', toNode: 'flux_1', toPort: 'input_in' },
    { id: 'c5', fromNode: 'swap_hub', fromPort: 'swap_out', toNode: 'wan_1', toPort: 'input_in' },
    { id: 'c6', fromNode: 'flux_1', fromPort: 'image_out', toNode: 'upscale_1', toPort: 'image_in' },
    { id: 'c7', fromNode: 'wan_1', fromPort: 'video_out', toNode: 'rife_1', toPort: 'video_in' },
    { id: 'c8', fromNode: 'upscale_1', fromPort: 'upscaled_out', toNode: 'export_1', toPort: 'image_in' },
    { id: 'c9', fromNode: 'rife_1', fromPort: 'smooth_out', toNode: 'export_1', toPort: 'video_in' },
  ])

  const [selectedNode, setSelectedNode] = useState<NeuralNode | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<'identity' | 'products' | 'export'>('identity')

  // Delete node function
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setConnections(prev => prev.filter(c => c.fromNode !== nodeId && c.toNode !== nodeId))
    setSelectedNodeId(null)
    setSelectedNode(null)
  }, [])

  // Keyboard delete support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        e.preventDefault()
        handleDeleteNode(selectedNodeId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, handleDeleteNode])

  const handleAddNode = (template: typeof nodeTemplates[0]) => {
    const newNode: NeuralNode = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
      icon: template.icon,
      x: 400 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      inputs: [{ id: 'in_1', type: 'input', label: 'Input', dataType: 'any' }],
      outputs: [{ id: 'out_1', type: 'output', label: 'Output', dataType: 'any' }],
      size: template.size,
    }
    setNodes([...nodes, newNode])
  }

  const templatesByCategory = useMemo(() => {
    return nodeTemplates.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = []
      acc[t.category].push(t)
      return acc
    }, {} as Record<string, typeof nodeTemplates>)
  }, [])

  return (
    <div className="flex gap-4 h-[800px]">
      {/* Left Panel - Node Palette & Config */}
      <div
        className="w-72 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        {/* Panel Tabs */}
        <div className="flex border-b" style={{ borderColor: colors.border }}>
          {[
            { id: 'identity' as const, label: 'Identity', icon: '👤' },
            { id: 'products' as const, label: 'Products', icon: '🏷️' },
            { id: 'export' as const, label: 'Export', icon: '📤' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className="flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1 transition-all"
              style={{
                background: activePanel === tab.id ? colors.bg : 'transparent',
                color: activePanel === tab.id ? colors.text : colors.textMuted,
                borderBottom: activePanel === tab.id ? `2px solid ${colors.accent}` : '2px solid transparent',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === 'identity' && <IdentityPanel onSelect={(id) => console.log('Selected:', id)} />}
          {activePanel === 'products' && <ProductSwapPanel onSelectProduct={(sku) => console.log('SKU:', sku)} />}
          {activePanel === 'export' && <ExportPanel onFormatSelect={(formats) => console.log('Formats:', formats)} />}
        </div>

        {/* Node Templates & Actions */}
        <div className="border-t p-4" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-medium" style={{ color: colors.textMuted }}>Add Nodes</h4>
            {/* Delete Button */}
            <motion.button
              onClick={() => selectedNodeId && handleDeleteNode(selectedNodeId)}
              disabled={!selectedNodeId}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
              style={{
                color: selectedNodeId ? '#FF5555' : colors.textDim,
                background: selectedNodeId ? '#FF555515' : 'transparent',
                border: `1px solid ${selectedNodeId ? '#FF555544' : colors.border}`,
                cursor: selectedNodeId ? 'pointer' : 'not-allowed',
                opacity: selectedNodeId ? 1 : 0.5,
              }}
              whileHover={selectedNodeId ? { scale: 1.05 } : {}}
              whileTap={selectedNodeId ? { scale: 0.95 } : {}}
            >
              🗑️ Delete
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(templatesByCategory).slice(0, 2).map(([category, templates]) => (
              templates.slice(0, 2).map(t => (
                <motion.button
                  key={t.type}
                  onClick={() => handleAddNode(t)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                  title={t.title}
                  whileHover={{ scale: 1.1, borderColor: colors.accent }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.icon}
                </motion.button>
              ))
            ))}
            {/* More nodes button */}
            <motion.button
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ background: `${colors.accent}22`, border: `1px solid ${colors.accent}44`, color: colors.accent }}
              title="More nodes..."
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ➕
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
        <NeuralNodeCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
          onNodeSelect={(node) => setSelectedNodeId(node?.id || null)}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNodeId}
          accentColor={colors.accent}
        />
      </div>

      {/* Right Panel - Generation Queue */}
      <div
        className="w-64 rounded-2xl p-4 flex flex-col gap-4"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <h3 className="text-sm font-medium" style={{ color: colors.text }}>Generation Queue</h3>

        {/* RunPod Status */}
        <div className="p-3 rounded-xl" style={{ background: colors.bg }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: colors.textMuted }}>RunPod GPU</span>
            <span className="flex items-center gap-1 text-xs" style={{ color: colors.green }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.green }} />
              Active
            </span>
          </div>
          <div className="text-xs" style={{ color: colors.textDim }}>RTX 4090 • 24GB VRAM</div>
        </div>

        {/* API Status */}
        <div className="space-y-2">
          {[
            { name: 'Replicate', status: 'ready', icon: '🔄' },
            { name: 'Krea AI', status: 'ready', icon: '✨' },
            { name: 'Runway', status: 'ready', icon: '🎥' },
          ].map(api => (
            <div key={api.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background: colors.bg }}>
              <div className="flex items-center gap-2">
                <span>{api.icon}</span>
                <span className="text-xs" style={{ color: colors.textMuted }}>{api.name}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${colors.green}22`, color: colors.green }}>
                {api.status}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* Generate Button */}
        <button
          className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.pink} 100%)`,
            color: colors.text,
            boxShadow: `0 0 30px ${colors.accent}44`,
          }}
        >
          <span>⚡</span>
          Generate All Formats
        </button>
      </div>
    </div>
  )
}
