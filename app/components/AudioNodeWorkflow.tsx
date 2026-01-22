'use client'

import { useState, useEffect, useCallback } from 'react'
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
  audio: '#6BCB77',
}

// Audio generation models
const audioModels = [
  { id: 'suno-v4', name: 'Suno v4', provider: 'Suno', icon: '🎵', description: 'Full song generation with vocals', type: 'music', color: '#1DB954' },
  { id: 'udio', name: 'Udio', provider: 'Udio', icon: '🎶', description: 'High-quality music generation', type: 'music', color: '#FF6B6B' },
  { id: 'stable-audio', name: 'Stable Audio', provider: 'Stability AI', icon: '🎹', description: 'Instrumental & SFX', type: 'music', color: '#E74C3C' },
  { id: 'elevenlabs', name: 'ElevenLabs', provider: 'ElevenLabs', icon: '🗣️', description: 'Voice synthesis & cloning', type: 'voice', color: '#3498DB' },
  { id: 'bark', name: 'Bark', provider: 'Suno', icon: '🐕', description: 'Expressive TTS with emotion', type: 'voice', color: '#9B59B6' },
  { id: 'musicgen', name: 'MusicGen', provider: 'Meta', icon: '🎼', description: 'Open-source music model', type: 'music', color: '#0084FF' },
  { id: 'audiogen', name: 'AudioGen', provider: 'Meta', icon: '🔊', description: 'Sound effects generation', type: 'sfx', color: '#E67E22' },
  { id: 'riffusion', name: 'Riffusion', provider: 'Riffusion', icon: '🎸', description: 'Spectrogram-based music', type: 'music', color: '#F39C12' },
]

// Recipe components - drag & drop building blocks
const recipeComponents = {
  genres: [
    { id: 'genre-pop', name: 'Pop', emoji: '🎤', prompt: 'catchy pop music' },
    { id: 'genre-rock', name: 'Rock', emoji: '🎸', prompt: 'energetic rock music' },
    { id: 'genre-electronic', name: 'Electronic', emoji: '🎧', prompt: 'electronic dance music' },
    { id: 'genre-hiphop', name: 'Hip-Hop', emoji: '🎤', prompt: 'hip-hop beats' },
    { id: 'genre-jazz', name: 'Jazz', emoji: '🎷', prompt: 'smooth jazz' },
    { id: 'genre-classical', name: 'Classical', emoji: '🎻', prompt: 'orchestral classical' },
    { id: 'genre-ambient', name: 'Ambient', emoji: '🌊', prompt: 'ambient atmospheric' },
    { id: 'genre-lofi', name: 'Lo-Fi', emoji: '📻', prompt: 'lo-fi chill beats' },
    { id: 'genre-cinematic', name: 'Cinematic', emoji: '🎬', prompt: 'epic cinematic score' },
    { id: 'genre-country', name: 'Country', emoji: '🤠', prompt: 'country western' },
  ],
  instruments: [
    { id: 'inst-piano', name: 'Piano', emoji: '🎹', prompt: 'piano' },
    { id: 'inst-guitar', name: 'Guitar', emoji: '🎸', prompt: 'acoustic guitar' },
    { id: 'inst-drums', name: 'Drums', emoji: '🥁', prompt: 'drums and percussion' },
    { id: 'inst-bass', name: 'Bass', emoji: '🎸', prompt: 'bass guitar' },
    { id: 'inst-synth', name: 'Synthesizer', emoji: '🎛️', prompt: 'synthesizer' },
    { id: 'inst-strings', name: 'Strings', emoji: '🎻', prompt: 'string orchestra' },
    { id: 'inst-brass', name: 'Brass', emoji: '🎺', prompt: 'brass section' },
    { id: 'inst-vocals', name: 'Vocals', emoji: '🎤', prompt: 'vocals' },
    { id: 'inst-808', name: '808', emoji: '💥', prompt: '808 bass' },
    { id: 'inst-choir', name: 'Choir', emoji: '👼', prompt: 'choir' },
  ],
  moods: [
    { id: 'mood-happy', name: 'Happy', emoji: '😊', prompt: 'happy uplifting' },
    { id: 'mood-sad', name: 'Sad', emoji: '😢', prompt: 'sad melancholic' },
    { id: 'mood-energetic', name: 'Energetic', emoji: '⚡', prompt: 'energetic upbeat' },
    { id: 'mood-calm', name: 'Calm', emoji: '😌', prompt: 'calm relaxing' },
    { id: 'mood-dark', name: 'Dark', emoji: '🌑', prompt: 'dark mysterious' },
    { id: 'mood-romantic', name: 'Romantic', emoji: '💕', prompt: 'romantic emotional' },
    { id: 'mood-epic', name: 'Epic', emoji: '🏔️', prompt: 'epic powerful' },
    { id: 'mood-playful', name: 'Playful', emoji: '🎪', prompt: 'playful fun' },
  ],
  tempos: [
    { id: 'tempo-slow', name: 'Slow (60-80 BPM)', emoji: '🐢', prompt: 'slow tempo 70 bpm' },
    { id: 'tempo-moderate', name: 'Moderate (90-110 BPM)', emoji: '🚶', prompt: 'moderate tempo 100 bpm' },
    { id: 'tempo-upbeat', name: 'Upbeat (120-140 BPM)', emoji: '🏃', prompt: 'upbeat tempo 130 bpm' },
    { id: 'tempo-fast', name: 'Fast (150+ BPM)', emoji: '🚀', prompt: 'fast tempo 160 bpm' },
  ],
  voiceStyles: [
    { id: 'voice-narrator', name: 'Narrator', emoji: '📖', prompt: 'professional narrator voice' },
    { id: 'voice-conversational', name: 'Conversational', emoji: '💬', prompt: 'natural conversational' },
    { id: 'voice-excited', name: 'Excited', emoji: '🎉', prompt: 'excited enthusiastic' },
    { id: 'voice-calm', name: 'Calm', emoji: '🧘', prompt: 'calm soothing' },
    { id: 'voice-dramatic', name: 'Dramatic', emoji: '🎭', prompt: 'dramatic intense' },
    { id: 'voice-whisper', name: 'Whisper', emoji: '🤫', prompt: 'soft whisper' },
  ],
  sfxCategories: [
    { id: 'sfx-nature', name: 'Nature', emoji: '🌿', prompt: 'nature sounds' },
    { id: 'sfx-urban', name: 'Urban', emoji: '🏙️', prompt: 'city ambient sounds' },
    { id: 'sfx-scifi', name: 'Sci-Fi', emoji: '🚀', prompt: 'futuristic sci-fi sounds' },
    { id: 'sfx-horror', name: 'Horror', emoji: '👻', prompt: 'creepy horror sounds' },
    { id: 'sfx-action', name: 'Action', emoji: '💥', prompt: 'action impact sounds' },
    { id: 'sfx-ui', name: 'UI/UX', emoji: '📱', prompt: 'interface ui sounds' },
  ],
}

// Node templates
const nodeTemplates = [
  {
    type: 'music_prompt',
    title: 'Music Prompt',
    icon: '🎵',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'prompt_out', type: 'output' as const, label: 'Prompt', dataType: 'prompt' as const }],
  },
  {
    type: 'recipe_builder',
    title: 'Recipe Builder',
    icon: '📋',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'recipe_out', type: 'output' as const, label: 'Recipe', dataType: 'prompt' as const }],
  },
  {
    type: 'lyrics_input',
    title: 'Lyrics Input',
    icon: '📝',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'lyrics_out', type: 'output' as const, label: 'Lyrics', dataType: 'text' as const }],
  },
  {
    type: 'voice_text',
    title: 'Voice Script',
    icon: '🗣️',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'text_out', type: 'output' as const, label: 'Script', dataType: 'text' as const }],
  },
  {
    type: 'reference_audio',
    title: 'Reference Audio',
    icon: '🎧',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'audio_out', type: 'output' as const, label: 'Audio', dataType: 'audio' as const }],
  },
  {
    type: 'music_gen',
    title: 'Music Generator',
    icon: '🎼',
    category: 'Generation',
    inputs: [
      { id: 'prompt_in', type: 'input' as const, label: 'Prompt', dataType: 'prompt' as const },
      { id: 'lyrics_in', type: 'input' as const, label: 'Lyrics', dataType: 'text' as const },
    ],
    outputs: [{ id: 'audio_out', type: 'output' as const, label: 'Music', dataType: 'audio' as const }],
  },
  {
    type: 'voice_gen',
    title: 'Voice Generator',
    icon: '🗣️',
    category: 'Generation',
    inputs: [
      { id: 'text_in', type: 'input' as const, label: 'Script', dataType: 'text' as const },
      { id: 'voice_ref', type: 'input' as const, label: 'Voice Ref', dataType: 'audio' as const },
    ],
    outputs: [{ id: 'audio_out', type: 'output' as const, label: 'Voice', dataType: 'audio' as const }],
  },
  {
    type: 'sfx_gen',
    title: 'SFX Generator',
    icon: '🔊',
    category: 'Generation',
    inputs: [{ id: 'prompt_in', type: 'input' as const, label: 'Description', dataType: 'prompt' as const }],
    outputs: [{ id: 'audio_out', type: 'output' as const, label: 'SFX', dataType: 'audio' as const }],
  },
  {
    type: 'audio_mix',
    title: 'Audio Mixer',
    icon: '🎚️',
    category: 'Processing',
    inputs: [
      { id: 'track_1', type: 'input' as const, label: 'Track 1', dataType: 'audio' as const },
      { id: 'track_2', type: 'input' as const, label: 'Track 2', dataType: 'audio' as const },
      { id: 'track_3', type: 'input' as const, label: 'Track 3', dataType: 'audio' as const },
    ],
    outputs: [{ id: 'mix_out', type: 'output' as const, label: 'Mix', dataType: 'audio' as const }],
  },
  {
    type: 'stem_split',
    title: 'Stem Separator',
    icon: '✂️',
    category: 'Processing',
    inputs: [{ id: 'audio_in', type: 'input' as const, label: 'Audio', dataType: 'audio' as const }],
    outputs: [
      { id: 'vocals', type: 'output' as const, label: 'Vocals', dataType: 'audio' as const },
      { id: 'drums', type: 'output' as const, label: 'Drums', dataType: 'audio' as const },
      { id: 'bass', type: 'output' as const, label: 'Bass', dataType: 'audio' as const },
      { id: 'other', type: 'output' as const, label: 'Other', dataType: 'audio' as const },
    ],
  },
  {
    type: 'audio_effect',
    title: 'Audio Effects',
    icon: '✨',
    category: 'Processing',
    inputs: [{ id: 'audio_in', type: 'input' as const, label: 'Audio', dataType: 'audio' as const }],
    outputs: [{ id: 'audio_out', type: 'output' as const, label: 'Processed', dataType: 'audio' as const }],
  },
  {
    type: 'audio_output',
    title: 'Export Audio',
    icon: '📤',
    category: 'Output',
    inputs: [{ id: 'audio_in', type: 'input' as const, label: 'Audio', dataType: 'audio' as const }],
    outputs: [],
  },
]

// Recipe Builder Panel
interface RecipeBuilderProps {
  onRecipeChange: (recipe: string[]) => void
  currentRecipe: string[]
}

function RecipeBuilder({ onRecipeChange, currentRecipe }: RecipeBuilderProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof recipeComponents>('genres')

  const categories: { key: keyof typeof recipeComponents; label: string; icon: string }[] = [
    { key: 'genres', label: 'Genres', icon: '🎵' },
    { key: 'instruments', label: 'Instruments', icon: '🎹' },
    { key: 'moods', label: 'Moods', icon: '😊' },
    { key: 'tempos', label: 'Tempo', icon: '⏱️' },
    { key: 'voiceStyles', label: 'Voice', icon: '🗣️' },
    { key: 'sfxCategories', label: 'SFX', icon: '🔊' },
  ]

  const toggleItem = (itemId: string) => {
    if (currentRecipe.includes(itemId)) {
      onRecipeChange(currentRecipe.filter(id => id !== itemId))
    } else {
      onRecipeChange([...currentRecipe, itemId])
    }
  }

  const getPromptFromRecipe = () => {
    const allItems = Object.values(recipeComponents).flat()
    return currentRecipe
      .map(id => allItems.find(item => item.id === id)?.prompt)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium mb-3" style={{ color: colors.text }}>Recipe Builder</h4>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-2 py-1 rounded-lg text-xs transition-all"
            style={{
              background: activeCategory === cat.key ? colors.audio : colors.bg,
              color: activeCategory === cat.key ? colors.bg : colors.textMuted,
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 max-h-40 overflow-y-auto">
        {recipeComponents[activeCategory].map(item => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className="p-2 rounded-lg text-xs text-left transition-all"
            style={{
              background: currentRecipe.includes(item.id) ? `${colors.audio}33` : colors.bg,
              border: `1px solid ${currentRecipe.includes(item.id) ? colors.audio : colors.border}`,
              color: colors.text,
            }}
          >
            <span className="mr-1">{item.emoji}</span>
            {item.name}
          </button>
        ))}
      </div>

      {/* Current recipe */}
      {currentRecipe.length > 0 && (
        <div className="mb-3">
          <div className="text-xs mb-1" style={{ color: colors.textDim }}>Current Recipe:</div>
          <div className="flex flex-wrap gap-1">
            {currentRecipe.map(id => {
              const item = Object.values(recipeComponents).flat().find(i => i.id === id)
              return item ? (
                <span
                  key={id}
                  className="px-2 py-0.5 rounded text-xs cursor-pointer"
                  style={{ background: `${colors.audio}33`, color: colors.audio }}
                  onClick={() => toggleItem(id)}
                >
                  {item.emoji} {item.name} ✕
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Generated prompt preview */}
      <div className="p-2 rounded-lg text-xs" style={{ background: colors.bg, color: colors.textMuted }}>
        <strong>Generated Prompt:</strong> {getPromptFromRecipe() || 'Add items to build your prompt'}
      </div>
    </div>
  )
}

// Node config panel
interface NodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}

function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [selectedModel, setSelectedModel] = useState(node?.data?.model || audioModels[0].id)
  const [prompt, setPrompt] = useState(node?.data?.prompt || '')
  const [recipe, setRecipe] = useState<string[]>(node?.data?.recipe || [])

  if (!node) return null

  const handleSave = () => {
    onUpdate(node.id, { model: selectedModel, prompt, recipe })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-0 top-0 bottom-0 w-96 overflow-y-auto z-30"
      style={{ background: colors.surface, borderLeft: `1px solid ${colors.border}` }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium" style={{ color: colors.text }}>Configure {node.title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: colors.textMuted }}>✕</button>
        </div>

        {/* Recipe builder for recipe nodes */}
        {node.type === 'recipe_builder' && (
          <RecipeBuilder
            currentRecipe={recipe}
            onRecipeChange={setRecipe}
          />
        )}

        {/* Prompt input */}
        {(node.type === 'music_prompt' || node.type === 'voice_text' || node.type === 'lyrics_input') && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>
              {node.type === 'lyrics_input' ? 'Lyrics' : node.type === 'voice_text' ? 'Script' : 'Prompt'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-3 rounded-xl text-sm resize-none"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              placeholder={node.type === 'lyrics_input' ? 'Write your lyrics...' : 'Describe the audio...'}
            />
          </div>
        )}

        {/* Model selection for generator nodes */}
        {(node.type === 'music_gen' || node.type === 'voice_gen' || node.type === 'sfx_gen') && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Model</label>
            <div className="space-y-2">
              {audioModels
                .filter(m =>
                  node.type === 'music_gen' ? m.type === 'music' :
                  node.type === 'voice_gen' ? m.type === 'voice' :
                  m.type === 'sfx'
                )
                .map(m => (
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
                        <div className="text-xs" style={{ color: colors.textDim }}>{m.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        <button onClick={handleSave} className="w-full py-3 rounded-xl font-medium" style={{ background: colors.audio, color: colors.bg }}>
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function AudioNodeWorkflow() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'recipe_1',
      type: 'recipe_builder',
      title: 'Recipe Builder',
      subtitle: 'Drag & drop',
      icon: '📋',
      x: 100,
      y: 200,
      inputs: [],
      outputs: [{ id: 'recipe_out', type: 'output', label: 'Recipe', dataType: 'prompt' }],
      color: '#F1C40F',
    },
    {
      id: 'music_1',
      type: 'music_gen',
      title: 'Suno v4',
      subtitle: 'Music Generation',
      icon: '🎵',
      x: 400,
      y: 200,
      inputs: [
        { id: 'prompt_in', type: 'input', label: 'Prompt', dataType: 'prompt' },
        { id: 'lyrics_in', type: 'input', label: 'Lyrics', dataType: 'text' },
      ],
      outputs: [{ id: 'audio_out', type: 'output', label: 'Music', dataType: 'audio' }],
      data: { model: 'suno-v4' },
      color: '#1DB954',
    },
    {
      id: 'output_1',
      type: 'audio_output',
      title: 'Export',
      subtitle: 'MP3 / WAV / FLAC',
      icon: '📤',
      x: 700,
      y: 200,
      inputs: [{ id: 'audio_in', type: 'input', label: 'Audio', dataType: 'audio' }],
      outputs: [],
      color: '#6BCB77',
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'recipe_1', fromPort: 'recipe_out', toNode: 'music_1', toPort: 'prompt_in', animated: true },
    { id: 'conn_2', fromNode: 'music_1', fromPort: 'audio_out', toNode: 'output_1', toPort: 'audio_in', animated: true },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [showPalette, setShowPalette] = useState(true)

  // Delete node function
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Remove the node
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    // Remove any connections to/from this node
    setConnections(prev => prev.filter(c => c.fromNode !== nodeId && c.toNode !== nodeId))
    // Clear selection
    setSelectedNodeId(null)
    setSelectedNode(null)
  }, [])

  // Keyboard event handler for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Delete or Backspace is pressed and a node is selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        // Don't delete if user is typing in an input/textarea
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
        : template.category === 'Generation' ? '#1DB954'
        : template.category === 'Processing' ? '#3498DB'
        : '#6BCB77',
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
                <h3 className="font-medium text-sm flex items-center gap-2" style={{ color: colors.text }}>
                  <span style={{ color: colors.audio }}>🎵</span> Audio Nodes
                </h3>
                <button
                  onClick={() => setShowPalette(false)}
                  className="text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{ color: colors.textMuted, background: colors.bg }}
                >
                  Hide ✕
                </button>
              </div>

              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="mb-4">
                  <div className="text-xs font-medium mb-2" style={{ color: colors.textDim }}>{category}</div>
                  <div className="space-y-2">
                    {templates.map(template => (
                      <motion.button
                        key={template.type}
                        onClick={() => handleAddNode(template)}
                        className="w-full p-3 rounded-xl text-left transition-all group"
                        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                        whileHover={{
                          scale: 1.02,
                          borderColor: colors.audio,
                          boxShadow: `0 0 15px ${colors.audio}22`,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{template.icon}</span>
                          <span className="text-sm flex-1" style={{ color: colors.text }}>{template.title}</span>
                          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.audio }}>+ Add</span>
                        </div>
                      </motion.button>
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
            background: `linear-gradient(135deg, ${colors.audio} 0%, #4CAF50 100%)`,
            color: colors.bg,
            border: 'none',
            boxShadow: `0 4px 20px ${colors.audio}44, 0 0 30px ${colors.audio}22`,
          }}
          whileHover={{ scale: 1.05, boxShadow: `0 6px 25px ${colors.audio}66` }}
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
          onNodeSelect={(node) => {
            setSelectedNodeId(node?.id || null)
          }}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNodeId}
          accentColor={colors.audio}
        />
      </div>

      {/* Config Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeConfigPanel node={selectedNode} onClose={() => setSelectedNode(null)} onUpdate={handleUpdateNode} />
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl z-20"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}>
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
        >
          🗑️ Delete {selectedNodeId ? '' : '(select node)'}
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm" style={{ color: colors.textMuted }}>↩️ Undo</button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-4 py-1.5 rounded-lg text-sm font-medium" style={{ background: colors.audio, color: colors.bg }}>
          ▶️ Generate
        </button>
      </div>
    </div>
  )
}
