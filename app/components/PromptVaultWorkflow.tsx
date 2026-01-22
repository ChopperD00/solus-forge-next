'use client'

import { useState, useMemo } from 'react'
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
  pony: '#FF69B4',
  positive: '#6BCB77',
  negative: '#E74C3C',
}

// Prompt categories from AI Prompt Vault
const promptCategories = [
  { id: 'character', name: 'Character', icon: '👤', description: 'Character designs and portraits' },
  { id: 'landscape', name: 'Landscape', icon: '🏞️', description: 'Scenery and environments' },
  { id: 'abstract', name: 'Abstract', icon: '🎨', description: 'Abstract and conceptual art' },
  { id: 'anime', name: 'Anime', icon: '🎌', description: 'Anime and manga style' },
  { id: 'realistic', name: 'Realistic', icon: '📷', description: 'Photorealistic images' },
  { id: 'fantasy', name: 'Fantasy', icon: '🐉', description: 'Fantasy and mythical themes' },
  { id: 'scifi', name: 'Sci-Fi', icon: '🚀', description: 'Science fiction themes' },
  { id: 'portrait', name: 'Portrait', icon: '🖼️', description: 'Portraits and headshots' },
  { id: 'nsfw', name: 'NSFW', icon: '🔞', description: 'Adult content (18+)' },
  { id: 'custom', name: 'Custom', icon: '✨', description: 'User-defined categories' },
]

// Tag presets
const tagPresets = {
  quality: [
    { id: 'masterpiece', label: 'masterpiece', color: '#FFD700' },
    { id: 'best-quality', label: 'best quality', color: '#FFD700' },
    { id: 'high-res', label: 'high resolution', color: '#FFD700' },
    { id: 'detailed', label: 'highly detailed', color: '#FFD700' },
    { id: '4k', label: '4k', color: '#C0C0C0' },
    { id: '8k', label: '8k', color: '#C0C0C0' },
  ],
  style: [
    { id: 'digital-art', label: 'digital art', color: '#9B59B6' },
    { id: 'oil-painting', label: 'oil painting', color: '#E67E22' },
    { id: 'watercolor', label: 'watercolor', color: '#3498DB' },
    { id: 'pencil-sketch', label: 'pencil sketch', color: '#7F8C8D' },
    { id: 'concept-art', label: 'concept art', color: '#1ABC9C' },
    { id: 'anime-style', label: 'anime style', color: '#E91E63' },
  ],
  lighting: [
    { id: 'dramatic-lighting', label: 'dramatic lighting', color: '#F39C12' },
    { id: 'soft-lighting', label: 'soft lighting', color: '#F5B041' },
    { id: 'cinematic-lighting', label: 'cinematic lighting', color: '#D35400' },
    { id: 'golden-hour', label: 'golden hour', color: '#F1C40F' },
    { id: 'studio-lighting', label: 'studio lighting', color: '#ECF0F1' },
    { id: 'natural-light', label: 'natural light', color: '#27AE60' },
  ],
  composition: [
    { id: 'close-up', label: 'close-up', color: '#8E44AD' },
    { id: 'full-body', label: 'full body', color: '#8E44AD' },
    { id: 'portrait-shot', label: 'portrait shot', color: '#8E44AD' },
    { id: 'wide-angle', label: 'wide angle', color: '#8E44AD' },
    { id: 'birds-eye', label: "bird's eye view", color: '#8E44AD' },
    { id: 'low-angle', label: 'low angle', color: '#8E44AD' },
  ],
}

// Pony Diffusion score tags
const ponyScoreTags = {
  positive: [
    { id: 'score9', label: 'score_9', weight: 1.0, description: 'Highest quality' },
    { id: 'score8up', label: 'score_8_up', weight: 0.9, description: 'Excellent quality' },
    { id: 'score7up', label: 'score_7_up', weight: 0.8, description: 'Great quality' },
    { id: 'score6up', label: 'score_6_up', weight: 0.7, description: 'Good quality' },
    { id: 'score5up', label: 'score_5_up', weight: 0.6, description: 'Decent quality' },
    { id: 'score4up', label: 'score_4_up', weight: 0.5, description: 'Average quality' },
  ],
  negative: [
    { id: 'score4', label: 'score_4', weight: 0.5, description: 'Below average' },
    { id: 'score3', label: 'score_3', weight: 0.6, description: 'Low quality' },
    { id: 'score2', label: 'score_2', weight: 0.7, description: 'Poor quality' },
    { id: 'score1', label: 'score_1', weight: 0.8, description: 'Very poor quality' },
  ],
}

// Common negative prompts
const negativePresets = [
  { id: 'low-quality', label: 'low quality, worst quality', category: 'Quality' },
  { id: 'bad-anatomy', label: 'bad anatomy, bad hands, missing fingers', category: 'Anatomy' },
  { id: 'deformed', label: 'deformed, distorted, disfigured', category: 'Quality' },
  { id: 'watermark', label: 'watermark, signature, text', category: 'Artifacts' },
  { id: 'blurry', label: 'blurry, out of focus', category: 'Quality' },
  { id: 'ugly', label: 'ugly, mutated', category: 'Quality' },
  { id: 'cropped', label: 'cropped, cut off', category: 'Composition' },
  { id: 'jpeg-artifacts', label: 'jpeg artifacts, compression artifacts', category: 'Artifacts' },
]

// Sample saved prompts (simulating vault database)
const sampleVaultPrompts = [
  {
    id: 'vault-1',
    title: 'Ethereal Forest Spirit',
    category: 'fantasy',
    tags: ['character', 'fantasy', 'nature'],
    positive: 'ethereal forest spirit, glowing eyes, flowing translucent robes, surrounded by magical particles, ancient trees, mystical atmosphere, masterpiece, best quality',
    negative: 'low quality, blurry, bad anatomy',
    ponyMode: false,
    createdAt: '2024-01-15',
  },
  {
    id: 'vault-2',
    title: 'Cyberpunk Street Scene',
    category: 'scifi',
    tags: ['landscape', 'cyberpunk', 'city'],
    positive: 'cyberpunk city street, neon signs, rain reflections, holographic advertisements, flying cars, detailed architecture, cinematic lighting, 8k',
    negative: 'low quality, watermark, text',
    ponyMode: false,
    createdAt: '2024-01-20',
  },
  {
    id: 'vault-3',
    title: 'Anime Warrior Princess',
    category: 'anime',
    tags: ['character', 'anime', 'warrior'],
    positive: 'score_9, score_8_up, anime warrior princess, long flowing hair, ornate armor, magical sword, dramatic pose, detailed eyes, vibrant colors',
    negative: 'score_4, score_3, low quality, bad anatomy',
    ponyMode: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'vault-4',
    title: 'Realistic Portrait',
    category: 'realistic',
    tags: ['portrait', 'realistic', 'studio'],
    positive: 'professional portrait photograph, studio lighting, sharp focus, detailed skin texture, catchlight in eyes, 85mm lens, f/1.8, bokeh background',
    negative: 'cartoon, anime, painting, drawing, illustration',
    ponyMode: false,
    createdAt: '2024-02-10',
  },
]

// Node templates for Prompt Vault workflow
const nodeTemplates = [
  {
    type: 'vault_browser',
    title: 'Prompt Vault',
    icon: '🗄️',
    category: 'Source',
    inputs: [],
    outputs: [
      { id: 'positive_out', type: 'output' as const, label: 'Positive', dataType: 'prompt' as const },
      { id: 'negative_out', type: 'output' as const, label: 'Negative', dataType: 'prompt' as const },
    ],
  },
  {
    type: 'tag_builder',
    title: 'Tag Builder',
    icon: '🏷️',
    category: 'Builder',
    inputs: [{ id: 'base_in', type: 'input' as const, label: 'Base', dataType: 'prompt' as const }],
    outputs: [{ id: 'enhanced_out', type: 'output' as const, label: 'Enhanced', dataType: 'prompt' as const }],
  },
  {
    type: 'pony_enhancer',
    title: 'Pony Enhancer',
    icon: '🦄',
    category: 'Builder',
    inputs: [{ id: 'prompt_in', type: 'input' as const, label: 'Prompt', dataType: 'prompt' as const }],
    outputs: [{ id: 'pony_out', type: 'output' as const, label: 'Pony', dataType: 'prompt' as const }],
  },
  {
    type: 'negative_builder',
    title: 'Negative Builder',
    icon: '🚫',
    category: 'Builder',
    inputs: [],
    outputs: [{ id: 'negative_out', type: 'output' as const, label: 'Negative', dataType: 'prompt' as const }],
  },
  {
    type: 'prompt_combiner',
    title: 'Prompt Combiner',
    icon: '🔗',
    category: 'Utility',
    inputs: [
      { id: 'prompt_a', type: 'input' as const, label: 'Prompt A', dataType: 'prompt' as const },
      { id: 'prompt_b', type: 'input' as const, label: 'Prompt B', dataType: 'prompt' as const },
    ],
    outputs: [{ id: 'combined_out', type: 'output' as const, label: 'Combined', dataType: 'prompt' as const }],
  },
  {
    type: 'weight_adjuster',
    title: 'Weight Adjuster',
    icon: '⚖️',
    category: 'Utility',
    inputs: [{ id: 'prompt_in', type: 'input' as const, label: 'Prompt', dataType: 'prompt' as const }],
    outputs: [{ id: 'weighted_out', type: 'output' as const, label: 'Weighted', dataType: 'prompt' as const }],
  },
  {
    type: 'lora_trigger',
    title: 'LoRA Trigger',
    icon: '🎯',
    category: 'Utility',
    inputs: [],
    outputs: [{ id: 'trigger_out', type: 'output' as const, label: 'Triggers', dataType: 'prompt' as const }],
  },
  {
    type: 'prompt_output',
    title: 'Final Prompt',
    icon: '📤',
    category: 'Output',
    inputs: [
      { id: 'positive_in', type: 'input' as const, label: 'Positive', dataType: 'prompt' as const },
      { id: 'negative_in', type: 'input' as const, label: 'Negative', dataType: 'prompt' as const },
    ],
    outputs: [
      { id: 'final_positive', type: 'output' as const, label: 'Positive', dataType: 'prompt' as const },
      { id: 'final_negative', type: 'output' as const, label: 'Negative', dataType: 'prompt' as const },
    ],
  },
  {
    type: 'save_to_vault',
    title: 'Save to Vault',
    icon: '💾',
    category: 'Output',
    inputs: [
      { id: 'positive_in', type: 'input' as const, label: 'Positive', dataType: 'prompt' as const },
      { id: 'negative_in', type: 'input' as const, label: 'Negative', dataType: 'prompt' as const },
    ],
    outputs: [],
  },
]

interface SavedPrompt {
  id: string
  title: string
  category: string
  tags: string[]
  positive: string
  negative: string
  ponyMode: boolean
  createdAt: string
}

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
  savedPrompts: SavedPrompt[]
}

function NodeConfigPanel({ node, onClose, onUpdate, savedPrompts }: NodeConfigPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(node?.data?.tags || [])
  const [ponyEnabled, setPonyEnabled] = useState(node?.data?.ponyMode || false)
  const [selectedScores, setSelectedScores] = useState<string[]>(node?.data?.ponyScores || ['score9', 'score8up'])
  const [selectedNegatives, setSelectedNegatives] = useState<string[]>(node?.data?.negatives || [])
  const [customPrompt, setCustomPrompt] = useState(node?.data?.customPrompt || '')
  const [promptTitle, setPromptTitle] = useState(node?.data?.title || '')

  if (!node) return null

  const filteredPrompts = savedPrompts.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.positive.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleSave = () => {
    onUpdate(node.id, {
      tags: selectedTags,
      ponyMode: ponyEnabled,
      ponyScores: selectedScores,
      negatives: selectedNegatives,
      customPrompt,
      title: promptTitle,
    })
    onClose()
  }

  const handleSelectVaultPrompt = (prompt: SavedPrompt) => {
    onUpdate(node.id, {
      selectedPrompt: prompt,
      title: prompt.title,
      ponyMode: prompt.ponyMode,
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-0 top-0 bottom-0 w-[420px] overflow-y-auto z-30"
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

        {/* Vault Browser Node */}
        {node.type === 'vault_browser' && (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              />
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                style={{
                  background: selectedCategory === 'all' ? colors.accent : colors.bg,
                  color: colors.text,
                }}
              >
                All
              </button>
              {promptCategories.slice(0, 6).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                  style={{
                    background: selectedCategory === cat.id ? colors.accent : colors.bg,
                    color: colors.text,
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredPrompts.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelectVaultPrompt(prompt)}
                  className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm" style={{ color: colors.text }}>{prompt.title}</span>
                    {prompt.ponyMode && <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${colors.pony}33`, color: colors.pony }}>🦄 Pony</span>}
                  </div>
                  <div className="text-xs mb-2 line-clamp-2" style={{ color: colors.textMuted }}>
                    {prompt.positive.substring(0, 100)}...
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {prompt.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded" style={{ background: colors.surfaceLight, color: colors.textDim }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Tag Builder Node */}
        {node.type === 'tag_builder' && (
          <>
            {Object.entries(tagPresets).map(([category, tags]) => (
              <div key={category} className="mb-4">
                <label className="text-xs font-medium mb-2 block capitalize" style={{ color: colors.textMuted }}>
                  {category} Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTags(prev =>
                        prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
                      )}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: selectedTags.includes(tag.id) ? `${tag.color}33` : colors.bg,
                        border: `1px solid ${selectedTags.includes(tag.id) ? tag.color : colors.border}`,
                        color: selectedTags.includes(tag.id) ? tag.color : colors.textMuted,
                      }}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Pony Enhancer Node */}
        {node.type === 'pony_enhancer' && (
          <>
            <div className="mb-4 p-4 rounded-xl" style={{ background: `${colors.pony}11`, border: `1px solid ${colors.pony}44` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🦄</span>
                  <span className="font-medium" style={{ color: colors.text }}>Pony Diffusion Mode</span>
                </div>
                <button
                  onClick={() => setPonyEnabled(!ponyEnabled)}
                  className="w-12 h-6 rounded-full relative transition-all"
                  style={{ background: ponyEnabled ? colors.pony : colors.bg }}
                >
                  <div
                    className="w-5 h-5 rounded-full absolute top-0.5 transition-all"
                    style={{
                      background: colors.text,
                      left: ponyEnabled ? '26px' : '2px',
                    }}
                  />
                </button>
              </div>
              <p className="text-xs" style={{ color: colors.textMuted }}>
                Automatically adds Pony Diffusion score tags for optimal quality
              </p>
            </div>

            {ponyEnabled && (
              <>
                <div className="mb-4">
                  <label className="text-xs font-medium mb-2 block" style={{ color: colors.positive }}>
                    Positive Score Tags
                  </label>
                  <div className="space-y-2">
                    {ponyScoreTags.positive.map(score => (
                      <button
                        key={score.id}
                        onClick={() => setSelectedScores(prev =>
                          prev.includes(score.id) ? prev.filter(s => s !== score.id) : [...prev, score.id]
                        )}
                        className="w-full p-3 rounded-xl text-left flex items-center justify-between"
                        style={{
                          background: selectedScores.includes(score.id) ? `${colors.positive}22` : colors.bg,
                          border: `1px solid ${selectedScores.includes(score.id) ? colors.positive : colors.border}`,
                        }}
                      >
                        <div>
                          <span className="text-sm font-mono" style={{ color: colors.text }}>{score.label}</span>
                          <span className="text-xs ml-2" style={{ color: colors.textDim }}>{score.description}</span>
                        </div>
                        {selectedScores.includes(score.id) && <span style={{ color: colors.positive }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-medium mb-2 block" style={{ color: colors.negative }}>
                    Negative Score Tags (Auto-added)
                  </label>
                  <div className="p-3 rounded-xl" style={{ background: `${colors.negative}11`, border: `1px solid ${colors.negative}33` }}>
                    <p className="text-xs font-mono" style={{ color: colors.textMuted }}>
                      {ponyScoreTags.negative.map(s => s.label).join(', ')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Negative Builder Node */}
        {node.type === 'negative_builder' && (
          <>
            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: colors.textMuted }}>
                Common Negative Prompts
              </label>
              <div className="space-y-2">
                {negativePresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedNegatives(prev =>
                      prev.includes(preset.id) ? prev.filter(n => n !== preset.id) : [...prev, preset.id]
                    )}
                    className="w-full p-3 rounded-xl text-left"
                    style={{
                      background: selectedNegatives.includes(preset.id) ? `${colors.negative}22` : colors.bg,
                      border: `1px solid ${selectedNegatives.includes(preset.id) ? colors.negative : colors.border}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono" style={{ color: colors.text }}>{preset.label}</span>
                        <span className="text-[10px] ml-2 px-2 py-0.5 rounded" style={{ background: colors.surfaceLight, color: colors.textDim }}>
                          {preset.category}
                        </span>
                      </div>
                      {selectedNegatives.includes(preset.id) && <span style={{ color: colors.negative }}>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Save to Vault Node */}
        {node.type === 'save_to_vault' && (
          <>
            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: colors.textMuted }}>
                Prompt Title
              </label>
              <input
                type="text"
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
                placeholder="My awesome prompt..."
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: colors.textMuted }}>
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {promptCategories.slice(0, 9).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="p-2 rounded-xl text-center"
                    style={{
                      background: selectedCategory === cat.id ? `${colors.accent}22` : colors.bg,
                      border: `1px solid ${selectedCategory === cat.id ? colors.accent : colors.border}`,
                    }}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-medium mt-4"
          style={{ background: colors.accent, color: colors.text }}
        >
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function PromptVaultWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'vault_1',
      type: 'vault_browser',
      title: 'Prompt Vault',
      subtitle: 'Browse saved prompts',
      icon: '🗄️',
      x: 100,
      y: 150,
      inputs: [],
      outputs: [
        { id: 'positive_out', type: 'output', label: 'Positive', dataType: 'prompt' },
        { id: 'negative_out', type: 'output', label: 'Negative', dataType: 'prompt' },
      ],
      color: '#FF6B00',
    },
    {
      id: 'pony_1',
      type: 'pony_enhancer',
      title: 'Pony Enhancer',
      subtitle: 'Add score tags',
      icon: '🦄',
      x: 400,
      y: 100,
      inputs: [{ id: 'prompt_in', type: 'input', label: 'Prompt', dataType: 'prompt' }],
      outputs: [{ id: 'pony_out', type: 'output', label: 'Pony', dataType: 'prompt' }],
      color: '#FF69B4',
    },
    {
      id: 'tags_1',
      type: 'tag_builder',
      title: 'Tag Builder',
      subtitle: 'Quality & style tags',
      icon: '🏷️',
      x: 400,
      y: 280,
      inputs: [{ id: 'base_in', type: 'input', label: 'Base', dataType: 'prompt' }],
      outputs: [{ id: 'enhanced_out', type: 'output', label: 'Enhanced', dataType: 'prompt' }],
      color: '#9B59B6',
    },
    {
      id: 'output_1',
      type: 'prompt_output',
      title: 'Final Prompt',
      subtitle: 'Ready to generate',
      icon: '📤',
      x: 700,
      y: 180,
      inputs: [
        { id: 'positive_in', type: 'input', label: 'Positive', dataType: 'prompt' },
        { id: 'negative_in', type: 'input', label: 'Negative', dataType: 'prompt' },
      ],
      outputs: [
        { id: 'final_positive', type: 'output', label: 'Positive', dataType: 'prompt' },
        { id: 'final_negative', type: 'output', label: 'Negative', dataType: 'prompt' },
      ],
      color: '#6BCB77',
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'vault_1', fromPort: 'positive_out', toNode: 'pony_1', toPort: 'prompt_in', animated: true },
    { id: 'conn_2', fromNode: 'pony_1', fromPort: 'pony_out', toNode: 'output_1', toPort: 'positive_in', animated: true },
    { id: 'conn_3', fromNode: 'vault_1', fromPort: 'negative_out', toNode: 'output_1', toPort: 'negative_in', animated: true },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [showPalette, setShowPalette] = useState(true)
  const [savedPrompts] = useState<SavedPrompt[]>(sampleVaultPrompts)

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
      color: template.category === 'Source' ? '#FF6B00'
        : template.category === 'Builder' ? '#9B59B6'
        : template.category === 'Utility' ? '#3498DB'
        : template.category === 'Output' ? '#6BCB77'
        : '#888888',
    }
    setNodes([...nodes, newNode])
  }

  const handleUpdateNode = (nodeId: string, data: Record<string, any>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
  }

  const templatesByCategory = useMemo(() => {
    return nodeTemplates.reduce((acc, t) => {
      const cat = t.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(t)
      return acc
    }, {} as Record<string, typeof nodeTemplates>)
  }, [])

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
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗄️</span>
                  <h3 className="font-medium text-sm" style={{ color: colors.text }}>Prompt Vault</h3>
                </div>
                <button onClick={() => setShowPalette(false)} className="text-xs" style={{ color: colors.textMuted }}>Hide</button>
              </div>

              <div className="mb-4 p-3 rounded-xl" style={{ background: `${colors.pony}11`, border: `1px solid ${colors.pony}33` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span>🦄</span>
                  <span className="text-xs font-medium" style={{ color: colors.pony }}>Pony Mode Ready</span>
                </div>
                <p className="text-[10px]" style={{ color: colors.textDim }}>
                  Auto score tags for Pony, SDXL & LoRA
                </p>
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

              <div className="mt-4 p-3 rounded-xl" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                <div className="text-xs font-medium mb-2" style={{ color: colors.text }}>Vault Stats</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div style={{ color: colors.textMuted }}>Saved Prompts: <span style={{ color: colors.text }}>{savedPrompts.length}</span></div>
                  <div style={{ color: colors.textMuted }}>Categories: <span style={{ color: colors.text }}>{promptCategories.length}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showPalette && (
        <button
          onClick={() => setShowPalette(true)}
          className="absolute left-4 top-4 z-20 px-3 py-2 rounded-xl text-sm"
          style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}
        >
          🗄️ Prompt Vault
        </button>
      )}

      {/* Canvas */}
      <div className={`absolute inset-0 ${showPalette ? 'left-64' : ''}`}>
        <NodeWorkflowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
          onNodeSelect={setSelectedNode}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNode?.id}
          accentColor="#FF6B00"
        />
      </div>

      {/* Config Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
            savedPrompts={savedPrompts}
          />
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl z-20"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}
      >
        <button className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2" style={{ color: colors.textMuted }}>
          <span>🗑️</span> Delete
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2" style={{ color: colors.textMuted }}>
          <span>💾</span> Save to Vault
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: colors.accent, color: colors.text }}>
          <span>📋</span> Copy Prompt
        </button>
      </div>
    </div>
  )
}
