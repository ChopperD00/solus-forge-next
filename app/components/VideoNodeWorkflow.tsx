'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NodeWorkflowCanvas, { WorkflowNode, NodeConnection } from './NodeWorkflowCanvas'

// Color palette
const colors = {
  bg: '#141010',
  surface: '#1E1818',
  surfaceLight: '#2A2222',
  border: '#3A3030',
  text: '#FFFFFF',
  textMuted: '#B0A8A8',
  textDim: '#706868',
  accent: '#FF6B00',
  video: '#FF6B6B',
  audio: '#6BCB77',
  image: '#9B59B6',
}

// Video model definitions with LoRA support
const videoModels = [
  {
    id: 'wan-2.2',
    name: 'Wan 2.2',
    provider: 'Replicate',
    icon: '🎬',
    description: 'High-quality video generation with motion control',
    supportsLoRA: true,
    supportsTensor: true,
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
    color: '#FF6B6B',
  },
  {
    id: 'sora',
    name: 'Sora',
    provider: 'OpenAI',
    icon: '🌀',
    description: 'Photorealistic video from text prompts',
    supportsLoRA: false,
    supportsTensor: false,
    maxDuration: 60,
    resolutions: ['720p', '1080p', '4K'],
    color: '#10A37F',
  },
  {
    id: 'veo3',
    name: 'Veo 3',
    provider: 'Google',
    icon: '✨',
    description: 'Advanced video synthesis with style control',
    supportsLoRA: false,
    supportsTensor: false,
    maxDuration: 30,
    resolutions: ['720p', '1080p'],
    color: '#4285F4',
  },
  {
    id: 'qwen-video',
    name: 'Qwen Video',
    provider: 'Alibaba',
    icon: '🎥',
    description: 'Open-source video generation with fine-tuning',
    supportsLoRA: true,
    supportsTensor: true,
    maxDuration: 15,
    resolutions: ['480p', '720p', '1080p'],
    color: '#FF6A00',
  },
  {
    id: 'runway-gen3',
    name: 'Runway Gen-3',
    provider: 'Runway',
    icon: '🚀',
    description: 'Professional video generation & editing',
    supportsLoRA: false,
    supportsTensor: false,
    maxDuration: 10,
    resolutions: ['720p', '1080p'],
    color: '#6366F1',
  },
  {
    id: 'luma-dream',
    name: 'Luma Dream',
    provider: 'Luma AI',
    icon: '💫',
    description: '3D-consistent video with camera control',
    supportsLoRA: false,
    supportsTensor: false,
    maxDuration: 5,
    resolutions: ['720p', '1080p'],
    color: '#8B5CF6',
  },
]

// LoRA/Tensor definitions
const loraOptions = [
  { id: 'motion-lora', name: 'Motion LoRA', description: 'Enhanced motion coherence', icon: '🔄' },
  { id: 'style-transfer', name: 'Style Transfer', description: 'Artistic style adaptation', icon: '🎨' },
  { id: 'face-enhance', name: 'Face Enhance', description: 'Better facial details', icon: '👤' },
  { id: 'anime-style', name: 'Anime Style', description: 'Anime/cartoon aesthetics', icon: '🎌' },
  { id: 'cinematic', name: 'Cinematic', description: 'Film-quality color grading', icon: '🎬' },
  { id: 'custom', name: 'Custom LoRA', description: 'Upload your own LoRA', icon: '📤' },
]

// Node templates for the palette
const nodeTemplates = [
  {
    type: 'prompt',
    title: 'Text Prompt',
    icon: '💬',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'prompt_out', type: 'output' as const, label: 'Prompt', dataType: 'prompt' as const }],
  },
  {
    type: 'image_input',
    title: 'Image Input',
    icon: '🖼️',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'image_out', type: 'output' as const, label: 'Image', dataType: 'image' as const }],
  },
  {
    type: 'video_model',
    title: 'Video Model',
    icon: '🎬',
    category: 'Generation',
    inputs: [
      { id: 'prompt_in', type: 'input' as const, label: 'Prompt', dataType: 'prompt' as const },
      { id: 'image_in', type: 'input' as const, label: 'Reference', dataType: 'image' as const },
    ],
    outputs: [{ id: 'video_out', type: 'output' as const, label: 'Video', dataType: 'video' as const }],
  },
  {
    type: 'lora',
    title: 'LoRA Adapter',
    icon: '🔧',
    category: 'Modifier',
    inputs: [{ id: 'model_in', type: 'input' as const, label: 'Model', dataType: 'any' as const }],
    outputs: [{ id: 'model_out', type: 'output' as const, label: 'Enhanced', dataType: 'any' as const }],
  },
  {
    type: 'tensor',
    title: 'Tensor Control',
    icon: '📊',
    category: 'Modifier',
    inputs: [{ id: 'input', type: 'input' as const, label: 'Input', dataType: 'any' as const }],
    outputs: [{ id: 'output', type: 'output' as const, label: 'Output', dataType: 'any' as const }],
  },
  {
    type: 'upscale',
    title: 'Video Upscale',
    icon: '📈',
    category: 'Post-Process',
    inputs: [{ id: 'video_in', type: 'input' as const, label: 'Video', dataType: 'video' as const }],
    outputs: [{ id: 'video_out', type: 'output' as const, label: 'Upscaled', dataType: 'video' as const }],
  },
  {
    type: 'interpolate',
    title: 'Frame Interpolation',
    icon: '🔀',
    category: 'Post-Process',
    inputs: [{ id: 'video_in', type: 'input' as const, label: 'Video', dataType: 'video' as const }],
    outputs: [{ id: 'video_out', type: 'output' as const, label: 'Smooth', dataType: 'video' as const }],
  },
  {
    type: 'audio_sync',
    title: 'Audio Sync',
    icon: '🔊',
    category: 'Audio',
    inputs: [
      { id: 'video_in', type: 'input' as const, label: 'Video', dataType: 'video' as const },
      { id: 'audio_in', type: 'input' as const, label: 'Audio', dataType: 'audio' as const },
    ],
    outputs: [{ id: 'video_out', type: 'output' as const, label: 'Synced', dataType: 'video' as const }],
  },
  {
    type: 'output',
    title: 'Export',
    icon: '📤',
    category: 'Output',
    inputs: [{ id: 'video_in', type: 'input' as const, label: 'Video', dataType: 'video' as const }],
    outputs: [],
  },
]

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}

function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [selectedModel, setSelectedModel] = useState(node?.data?.model || videoModels[0].id)
  const [selectedLoRAs, setSelectedLoRAs] = useState<string[]>(node?.data?.loras || [])
  const [prompt, setPrompt] = useState(node?.data?.prompt || '')

  if (!node) return null

  const model = videoModels.find(m => m.id === selectedModel)

  const handleSave = () => {
    onUpdate(node.id, {
      model: selectedModel,
      loras: selectedLoRAs,
      prompt,
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-0 top-0 bottom-0 w-80 overflow-y-auto"
      style={{
        background: colors.surface,
        borderLeft: `1px solid ${colors.border}`,
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium" style={{ color: colors.text }}>Configure {node.title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: colors.textMuted }}
          >
            ✕
          </button>
        </div>

        {/* Prompt input for prompt nodes */}
        {node.type === 'prompt' && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-3 rounded-xl text-sm resize-none"
              style={{
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
              placeholder="Describe your video..."
            />
          </div>
        )}

        {/* Model selection for video model nodes */}
        {node.type === 'video_model' && (
          <>
            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Video Model</label>
              <div className="space-y-2">
                {videoModels.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className="w-full p-3 rounded-xl text-left transition-all"
                    style={{
                      background: selectedModel === m.id ? `${m.color}22` : colors.bg,
                      border: `1px solid ${selectedModel === m.id ? m.color : colors.border}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{m.icon}</span>
                      <div>
                        <div className="text-sm font-medium" style={{ color: colors.text }}>{m.name}</div>
                        <div className="text-xs" style={{ color: colors.textDim }}>{m.provider}</div>
                      </div>
                      {m.supportsLoRA && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: `${colors.accent}22`, color: colors.accent }}>
                          LoRA
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* LoRA selection if supported */}
            {model?.supportsLoRA && (
              <div className="mb-4">
                <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>LoRA Adapters</label>
                <div className="space-y-2">
                  {loraOptions.map(lora => (
                    <button
                      key={lora.id}
                      onClick={() => {
                        setSelectedLoRAs(prev =>
                          prev.includes(lora.id)
                            ? prev.filter(id => id !== lora.id)
                            : [...prev, lora.id]
                        )
                      }}
                      className="w-full p-3 rounded-xl text-left transition-all"
                      style={{
                        background: selectedLoRAs.includes(lora.id) ? `${colors.accent}22` : colors.bg,
                        border: `1px solid ${selectedLoRAs.includes(lora.id) ? colors.accent : colors.border}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span>{lora.icon}</span>
                        <div>
                          <div className="text-sm" style={{ color: colors.text }}>{lora.name}</div>
                          <div className="text-xs" style={{ color: colors.textDim }}>{lora.description}</div>
                        </div>
                        {selectedLoRAs.includes(lora.id) && (
                          <span className="ml-auto" style={{ color: colors.accent }}>✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-medium transition-all"
          style={{
            background: colors.accent,
            color: colors.text,
          }}
        >
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function VideoNodeWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'prompt_1',
      type: 'prompt',
      title: 'Text Prompt',
      subtitle: 'Describe your video',
      icon: '💬',
      x: 100,
      y: 200,
      inputs: [],
      outputs: [{ id: 'prompt_out', type: 'output', label: 'Prompt', dataType: 'prompt' }],
      color: '#F1C40F',
    },
    {
      id: 'model_1',
      type: 'video_model',
      title: 'Wan 2.2',
      subtitle: 'Video Generation',
      icon: '🎬',
      x: 400,
      y: 200,
      inputs: [
        { id: 'prompt_in', type: 'input', label: 'Prompt', dataType: 'prompt' },
        { id: 'image_in', type: 'input', label: 'Reference', dataType: 'image' },
      ],
      outputs: [{ id: 'video_out', type: 'output', label: 'Video', dataType: 'video' }],
      data: { model: 'wan-2.2' },
      color: '#FF6B6B',
    },
    {
      id: 'output_1',
      type: 'output',
      title: 'Export',
      subtitle: 'MP4 / WebM',
      icon: '📤',
      x: 700,
      y: 200,
      inputs: [{ id: 'video_in', type: 'input', label: 'Video', dataType: 'video' }],
      outputs: [],
      color: '#6BCB77',
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    {
      id: 'conn_1',
      fromNode: 'prompt_1',
      fromPort: 'prompt_out',
      toNode: 'model_1',
      toPort: 'prompt_in',
      animated: true,
    },
    {
      id: 'conn_2',
      fromNode: 'model_1',
      fromPort: 'video_out',
      toNode: 'output_1',
      toPort: 'video_in',
      animated: true,
    },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [showPalette, setShowPalette] = useState(true)

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
        : template.category === 'Generation' ? '#FF6B6B'
        : template.category === 'Modifier' ? '#9B59B6'
        : template.category === 'Post-Process' ? '#3498DB'
        : template.category === 'Audio' ? '#6BCB77'
        : '#888888',
    }
    setNodes([...nodes, newNode])
  }

  const handleUpdateNode = (nodeId: string, data: Record<string, any>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
  }

  const handleDeleteSelected = () => {
    if (!selectedNode) return
    setNodes(nodes.filter(n => n.id !== selectedNode.id))
    setConnections(connections.filter(c =>
      c.fromNode !== selectedNode.id && c.toNode !== selectedNode.id
    ))
    setSelectedNode(null)
  }

  // Group templates by category
  const templatesByCategory = nodeTemplates.reduce((acc, t) => {
    const cat = t.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(t)
    return acc
  }, {} as Record<string, typeof nodeTemplates>)

  return (
    <div className="relative w-full h-[700px] rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
      {/* Node Palette Sidebar */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="absolute left-0 top-0 bottom-0 w-64 z-20 overflow-y-auto"
            style={{
              background: colors.surface,
              borderRight: `1px solid ${colors.border}`,
            }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm" style={{ color: colors.text }}>Node Palette</h3>
                <button
                  onClick={() => setShowPalette(false)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: colors.textMuted }}
                >
                  Hide
                </button>
              </div>

              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="mb-4">
                  <div className="text-xs font-medium mb-2" style={{ color: colors.textDim }}>
                    {category}
                  </div>
                  <div className="space-y-2">
                    {templates.map(template => (
                      <button
                        key={template.type}
                        onClick={() => handleAddNode(template)}
                        className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                        style={{
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.accent
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border
                        }}
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

      {/* Toggle palette button */}
      {!showPalette && (
        <button
          onClick={() => setShowPalette(true)}
          className="absolute left-4 top-4 z-20 px-3 py-2 rounded-xl text-sm"
          style={{
            background: colors.surface,
            color: colors.textMuted,
            border: `1px solid ${colors.border}`,
          }}
        >
          + Add Node
        </button>
      )}

      {/* Main Canvas */}
      <div className={`absolute inset-0 ${showPalette ? 'left-64' : ''}`}>
        <NodeWorkflowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
          onNodeSelect={setSelectedNode}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNode?.id}
          accentColor={colors.accent}
        />
      </div>

      {/* Node Config Panel */}
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
        style={{
          background: `${colors.surface}ee`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={handleDeleteSelected}
          disabled={!selectedNode}
          className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-50"
          style={{ color: colors.textMuted }}
        >
          🗑️ Delete
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button
          className="px-3 py-1.5 rounded-lg text-sm"
          style={{ color: colors.textMuted }}
        >
          ↩️ Undo
        </button>
        <button
          className="px-3 py-1.5 rounded-lg text-sm"
          style={{ color: colors.textMuted }}
        >
          ↪️ Redo
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button
          className="px-4 py-1.5 rounded-lg text-sm font-medium"
          style={{ background: colors.accent, color: colors.text }}
        >
          ▶️ Generate
        </button>
      </div>
    </div>
  )
}
