'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NodeWorkflowCanvas, { WorkflowNode, NodeConnection } from './NodeWorkflowCanvas'

const colors = {
  bg: '#141010',
  surface: '#1E1818',
  surfaceLight: '#2A2222',
  border: '#3A3030',
  text: '#FFFFFF',
  textMuted: '#B0A8A8',
  textDim: '#706868',
  accent: '#FF6B00',
}

// Image models with LoRA/tensor support
const imageModels = [
  {
    id: 'flux-pro',
    name: 'Flux Pro',
    provider: 'Black Forest Labs',
    icon: '⚡',
    description: 'Ultra high-quality, fast generation',
    supportsLoRA: true,
    supportsTensor: true,
    baseModels: ['flux-1.0-pro', 'flux-1.1-pro'],
    color: '#9B59B6',
  },
  {
    id: 'flux-dev',
    name: 'Flux Dev',
    provider: 'Black Forest Labs',
    icon: '🔬',
    description: 'Development model with full control',
    supportsLoRA: true,
    supportsTensor: true,
    baseModels: ['flux-1.0-dev'],
    color: '#8E44AD',
  },
  {
    id: 'sdxl',
    name: 'SDXL 1.0',
    provider: 'Stability AI',
    icon: '🎨',
    description: 'Industry standard with huge LoRA ecosystem',
    supportsLoRA: true,
    supportsTensor: true,
    baseModels: ['sdxl-base', 'sdxl-turbo'],
    color: '#E74C3C',
  },
  {
    id: 'sd3',
    name: 'Stable Diffusion 3',
    provider: 'Stability AI',
    icon: '🌟',
    description: 'Latest SD with improved text rendering',
    supportsLoRA: true,
    supportsTensor: true,
    baseModels: ['sd3-medium', 'sd3-large'],
    color: '#C0392B',
  },
  {
    id: 'dalle3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    icon: '🖼️',
    description: 'Best prompt following, no LoRA',
    supportsLoRA: false,
    supportsTensor: false,
    baseModels: ['dall-e-3'],
    color: '#10A37F',
  },
  {
    id: 'midjourney',
    name: 'Midjourney v6',
    provider: 'Midjourney',
    icon: '🎭',
    description: 'Artistic style, aesthetic focus',
    supportsLoRA: false,
    supportsTensor: false,
    baseModels: ['mj-v6'],
    color: '#5865F2',
  },
  {
    id: 'ideogram',
    name: 'Ideogram 2.0',
    provider: 'Ideogram',
    icon: '📝',
    description: 'Excellent text in images',
    supportsLoRA: false,
    supportsTensor: false,
    baseModels: ['ideogram-2'],
    color: '#FF6B6B',
  },
]

// LoRA categories for images
const imageLoRAs = [
  { id: 'style-realistic', name: 'Photorealistic', description: 'Ultra-realistic photos', category: 'Style', icon: '📷' },
  { id: 'style-anime', name: 'Anime/Manga', description: 'Japanese animation style', category: 'Style', icon: '🎌' },
  { id: 'style-3d', name: '3D Render', description: 'CGI/3D rendering look', category: 'Style', icon: '🎮' },
  { id: 'style-watercolor', name: 'Watercolor', description: 'Traditional art medium', category: 'Style', icon: '🎨' },
  { id: 'style-cinematic', name: 'Cinematic', description: 'Movie poster aesthetic', category: 'Style', icon: '🎬' },
  { id: 'detail-face', name: 'Face Detail', description: 'Enhanced facial features', category: 'Detail', icon: '👤' },
  { id: 'detail-hands', name: 'Hand Fix', description: 'Better hand generation', category: 'Detail', icon: '✋' },
  { id: 'detail-texture', name: 'Texture Enhance', description: 'Rich material textures', category: 'Detail', icon: '🧱' },
  { id: 'concept-character', name: 'Character Sheet', description: 'Multi-view characters', category: 'Concept', icon: '👥' },
  { id: 'concept-product', name: 'Product Shot', description: 'E-commerce ready', category: 'Concept', icon: '📦' },
  { id: 'custom-upload', name: 'Upload LoRA', description: 'Your custom trained model', category: 'Custom', icon: '📤' },
]

// Tensor/ControlNet types
const tensorControls = [
  { id: 'canny', name: 'Canny Edge', description: 'Edge detection for structure', icon: '📐' },
  { id: 'depth', name: 'Depth Map', description: '3D depth estimation', icon: '🌊' },
  { id: 'pose', name: 'OpenPose', description: 'Human pose control', icon: '🧍' },
  { id: 'segment', name: 'Segmentation', description: 'Region-based control', icon: '🧩' },
  { id: 'lineart', name: 'Line Art', description: 'Clean line extraction', icon: '✏️' },
  { id: 'softedge', name: 'Soft Edge', description: 'Smooth edge detection', icon: '🔘' },
  { id: 'scribble', name: 'Scribble', description: 'Hand-drawn guidance', icon: '✍️' },
  { id: 'ipadapter', name: 'IP-Adapter', description: 'Image prompt injection', icon: '🖼️' },
]

// Node templates
const nodeTemplates = [
  {
    type: 'text_prompt',
    title: 'Text Prompt',
    icon: '💬',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'prompt_out', type: 'output' as const, label: 'Prompt', dataType: 'prompt' as const }],
  },
  {
    type: 'negative_prompt',
    title: 'Negative Prompt',
    icon: '🚫',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'neg_out', type: 'output' as const, label: 'Negative', dataType: 'prompt' as const }],
  },
  {
    type: 'image_ref',
    title: 'Reference Image',
    icon: '🖼️',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'image_out', type: 'output' as const, label: 'Image', dataType: 'image' as const }],
  },
  {
    type: 'image_model',
    title: 'Image Model',
    icon: '🎨',
    category: 'Generation',
    inputs: [
      { id: 'prompt_in', type: 'input' as const, label: 'Prompt', dataType: 'prompt' as const },
      { id: 'neg_in', type: 'input' as const, label: 'Negative', dataType: 'prompt' as const },
      { id: 'control_in', type: 'input' as const, label: 'Control', dataType: 'tensor' as const },
    ],
    outputs: [{ id: 'image_out', type: 'output' as const, label: 'Image', dataType: 'image' as const }],
  },
  {
    type: 'lora_stack',
    title: 'LoRA Stack',
    icon: '🔧',
    category: 'Modifier',
    inputs: [{ id: 'model_in', type: 'input' as const, label: 'Model', dataType: 'any' as const }],
    outputs: [{ id: 'model_out', type: 'output' as const, label: 'Enhanced', dataType: 'any' as const }],
  },
  {
    type: 'controlnet',
    title: 'ControlNet',
    icon: '📊',
    category: 'Control',
    inputs: [{ id: 'image_in', type: 'input' as const, label: 'Source', dataType: 'image' as const }],
    outputs: [{ id: 'control_out', type: 'output' as const, label: 'Control', dataType: 'tensor' as const }],
  },
  {
    type: 'ip_adapter',
    title: 'IP-Adapter',
    icon: '🎭',
    category: 'Control',
    inputs: [{ id: 'style_in', type: 'input' as const, label: 'Style Ref', dataType: 'image' as const }],
    outputs: [{ id: 'style_out', type: 'output' as const, label: 'Style', dataType: 'tensor' as const }],
  },
  {
    type: 'upscale',
    title: 'Upscale',
    icon: '📈',
    category: 'Post-Process',
    inputs: [{ id: 'image_in', type: 'input' as const, label: 'Image', dataType: 'image' as const }],
    outputs: [{ id: 'image_out', type: 'output' as const, label: 'Upscaled', dataType: 'image' as const }],
  },
  {
    type: 'face_restore',
    title: 'Face Restore',
    icon: '👤',
    category: 'Post-Process',
    inputs: [{ id: 'image_in', type: 'input' as const, label: 'Image', dataType: 'image' as const }],
    outputs: [{ id: 'image_out', type: 'output' as const, label: 'Fixed', dataType: 'image' as const }],
  },
  {
    type: 'inpaint',
    title: 'Inpaint',
    icon: '🖌️',
    category: 'Edit',
    inputs: [
      { id: 'image_in', type: 'input' as const, label: 'Image', dataType: 'image' as const },
      { id: 'mask_in', type: 'input' as const, label: 'Mask', dataType: 'image' as const },
    ],
    outputs: [{ id: 'image_out', type: 'output' as const, label: 'Result', dataType: 'image' as const }],
  },
  {
    type: 'outpaint',
    title: 'Outpaint',
    icon: '🔲',
    category: 'Edit',
    inputs: [{ id: 'image_in', type: 'input' as const, label: 'Image', dataType: 'image' as const }],
    outputs: [{ id: 'image_out', type: 'output' as const, label: 'Extended', dataType: 'image' as const }],
  },
  {
    type: 'remove_bg',
    title: 'Remove Background',
    icon: '✂️',
    category: 'Post-Process',
    inputs: [{ id: 'image_in', type: 'input' as const, label: 'Image', dataType: 'image' as const }],
    outputs: [{ id: 'image_out', type: 'output' as const, label: 'Cutout', dataType: 'image' as const }],
  },
  {
    type: 'batch_output',
    title: 'Batch Export',
    icon: '📤',
    category: 'Output',
    inputs: [{ id: 'images_in', type: 'input' as const, label: 'Images', dataType: 'image' as const }],
    outputs: [],
  },
]

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}

function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [selectedModel, setSelectedModel] = useState(node?.data?.model || imageModels[0].id)
  const [selectedLoRAs, setSelectedLoRAs] = useState<string[]>(node?.data?.loras || [])
  const [selectedControl, setSelectedControl] = useState(node?.data?.controlType || '')
  const [prompt, setPrompt] = useState(node?.data?.prompt || '')
  const [loraWeights, setLoraWeights] = useState<Record<string, number>>(node?.data?.loraWeights || {})

  if (!node) return null

  const model = imageModels.find(m => m.id === selectedModel)

  const handleSave = () => {
    onUpdate(node.id, {
      model: selectedModel,
      loras: selectedLoRAs,
      loraWeights,
      controlType: selectedControl,
      prompt,
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-0 top-0 bottom-0 w-96 overflow-y-auto z-30"
      style={{
        background: colors.surface,
        borderLeft: `1px solid ${colors.border}`,
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium" style={{ color: colors.text }}>Configure {node.title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: colors.textMuted }}>✕</button>
        </div>

        {/* Prompt nodes */}
        {(node.type === 'text_prompt' || node.type === 'negative_prompt') && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>
              {node.type === 'negative_prompt' ? 'Negative Prompt' : 'Prompt'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-3 rounded-xl text-sm resize-none"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              placeholder={node.type === 'negative_prompt' ? 'What to avoid...' : 'Describe your image...'}
            />
          </div>
        )}

        {/* Model selection */}
        {node.type === 'image_model' && (
          <>
            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Image Model</label>
              <div className="grid grid-cols-2 gap-2">
                {imageModels.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: selectedModel === m.id ? `${m.color}22` : colors.bg,
                      border: `1px solid ${selectedModel === m.id ? m.color : colors.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{m.icon}</span>
                      <div>
                        <div className="text-xs font-medium" style={{ color: colors.text }}>{m.name}</div>
                        <div className="text-[10px]" style={{ color: colors.textDim }}>{m.provider}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* LoRA selection */}
            {model?.supportsLoRA && (
              <div className="mb-4">
                <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>LoRA Adapters</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {imageLoRAs.map(lora => (
                    <div
                      key={lora.id}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={() => {
                          setSelectedLoRAs(prev =>
                            prev.includes(lora.id)
                              ? prev.filter(id => id !== lora.id)
                              : [...prev, lora.id]
                          )
                          if (!loraWeights[lora.id]) {
                            setLoraWeights(prev => ({ ...prev, [lora.id]: 0.7 }))
                          }
                        }}
                        className="flex-1 p-2 rounded-lg text-left text-xs"
                        style={{
                          background: selectedLoRAs.includes(lora.id) ? `${colors.accent}22` : colors.bg,
                          border: `1px solid ${selectedLoRAs.includes(lora.id) ? colors.accent : colors.border}`,
                        }}
                      >
                        <span className="mr-2">{lora.icon}</span>
                        {lora.name}
                      </button>
                      {selectedLoRAs.includes(lora.id) && (
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={loraWeights[lora.id] || 0.7}
                          onChange={(e) => setLoraWeights(prev => ({ ...prev, [lora.id]: parseFloat(e.target.value) }))}
                          className="w-20"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ControlNet selection */}
        {node.type === 'controlnet' && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Control Type</label>
            <div className="grid grid-cols-2 gap-2">
              {tensorControls.map(ctrl => (
                <button
                  key={ctrl.id}
                  onClick={() => setSelectedControl(ctrl.id)}
                  className="p-3 rounded-xl text-left"
                  style={{
                    background: selectedControl === ctrl.id ? `${colors.accent}22` : colors.bg,
                    border: `1px solid ${selectedControl === ctrl.id ? colors.accent : colors.border}`,
                  }}
                >
                  <span className="text-lg mr-2">{ctrl.icon}</span>
                  <span className="text-xs" style={{ color: colors.text }}>{ctrl.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-medium"
          style={{ background: colors.accent, color: colors.text }}
        >
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function ImageNodeWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'prompt_1',
      type: 'text_prompt',
      title: 'Text Prompt',
      subtitle: 'Main description',
      icon: '💬',
      x: 100,
      y: 150,
      inputs: [],
      outputs: [{ id: 'prompt_out', type: 'output', label: 'Prompt', dataType: 'prompt' }],
      color: '#F1C40F',
    },
    {
      id: 'model_1',
      type: 'image_model',
      title: 'Flux Pro',
      subtitle: 'Image Generation',
      icon: '⚡',
      x: 400,
      y: 200,
      inputs: [
        { id: 'prompt_in', type: 'input', label: 'Prompt', dataType: 'prompt' },
        { id: 'neg_in', type: 'input', label: 'Negative', dataType: 'prompt' },
        { id: 'control_in', type: 'input', label: 'Control', dataType: 'tensor' },
      ],
      outputs: [{ id: 'image_out', type: 'output', label: 'Image', dataType: 'image' }],
      data: { model: 'flux-pro' },
      color: '#9B59B6',
    },
    {
      id: 'output_1',
      type: 'batch_output',
      title: 'Export',
      subtitle: 'PNG / JPEG / WebP',
      icon: '📤',
      x: 700,
      y: 200,
      inputs: [{ id: 'images_in', type: 'input', label: 'Images', dataType: 'image' }],
      outputs: [],
      color: '#6BCB77',
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'prompt_1', fromPort: 'prompt_out', toNode: 'model_1', toPort: 'prompt_in', animated: true },
    { id: 'conn_2', fromNode: 'model_1', fromPort: 'image_out', toNode: 'output_1', toPort: 'images_in', animated: true },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(true)

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
    const newNode: WorkflowNode = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
      icon: template.icon,
      x: 300 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      inputs: template.inputs,
      outputs: template.outputs,
      color: template.category === 'Input' ? '#F1C40F'
        : template.category === 'Generation' ? '#9B59B6'
        : template.category === 'Control' ? '#3498DB'
        : template.category === 'Post-Process' ? '#1ABC9C'
        : template.category === 'Edit' ? '#E67E22'
        : '#888888',
    }
    setNodes([...nodes, newNode])
  }

  const handleUpdateNode = (nodeId: string, data: Record<string, any>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
  }

  const templatesByCategory = nodeTemplates.reduce((acc, t) => {
    const cat = t.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(t)
    return acc
  }, {} as Record<string, typeof nodeTemplates>)

  return (
    <div className="relative w-full h-[700px] rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
      {/* Node Palette */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="absolute left-0 top-0 bottom-0 w-64 z-20 overflow-y-auto"
            style={{ background: colors.surface, borderRight: `1px solid ${colors.border}` }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm" style={{ color: colors.text }}>Node Palette</h3>
                <button onClick={() => setShowPalette(false)} className="text-xs" style={{ color: colors.textMuted }}>Hide</button>
              </div>

              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="mb-4">
                  <div className="text-xs font-medium mb-2" style={{ color: colors.textDim }}>{category}</div>
                  <div className="space-y-2">
                    {templates.map(template => (
                      <button
                        key={template.type}
                        onClick={() => handleAddNode(template)}
                        className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{template.icon}</span>
                          <span className="text-sm" style={{ color: colors.text }}>{template.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showPalette && (
        <motion.button
          onClick={() => setShowPalette(true)}
          className="absolute left-4 top-4 z-20 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 20px #9B59B644, 0 0 30px #9B59B622',
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 6px 25px #9B59B666' }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ fontSize: '18px' }}>➕</span> Add Node
        </motion.button>
      )}

      {/* Canvas */}
      <div className={`absolute inset-0 ${showPalette ? 'left-64' : ''}`}>
        <NodeWorkflowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
          onNodeSelect={(node) => setSelectedNodeId(node?.id || null)}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNodeId}
          accentColor="#9B59B6"
        />
      </div>

      {/* Config Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
          />
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl z-20"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}
      >
        <button
          onClick={() => selectedNodeId && handleDeleteNode(selectedNodeId)}
          disabled={!selectedNodeId}
          className="px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{
            color: selectedNodeId ? '#FF5555' : colors.textDim,
            background: selectedNodeId ? '#FF555515' : 'transparent',
            cursor: selectedNodeId ? 'pointer' : 'not-allowed',
            opacity: selectedNodeId ? 1 : 0.5,
          }}
        >🗑️ Delete {selectedNodeId ? '' : '(select node)'}</button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm" style={{ color: colors.textMuted }}>↩️ Undo</button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-4 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#9B59B6', color: colors.text }}>
          ▶️ Generate
        </button>
      </div>
    </div>
  )
}
