'use client'

import { useState, useMemo } from 'react'
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
  blue: '#3B82F6',
  pink: '#EC4899',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
}

// Platform configurations
const platforms = [
  {
    id: 'meta',
    name: 'Meta Ads',
    icon: '📘',
    color: colors.blue,
    formats: [
      { id: 'fb-feed', name: 'Facebook Feed', ratio: '1:1', size: '1080x1080', type: 'image' },
      { id: 'fb-story', name: 'Facebook Story', ratio: '9:16', size: '1080x1920', type: 'image' },
      { id: 'fb-video', name: 'Facebook Video', ratio: '16:9', size: '1920x1080', type: 'video' },
      { id: 'ig-feed', name: 'Instagram Feed', ratio: '1:1', size: '1080x1080', type: 'image' },
      { id: 'ig-post', name: 'Instagram Post', ratio: '4:5', size: '1080x1350', type: 'image' },
      { id: 'ig-story', name: 'Instagram Story', ratio: '9:16', size: '1080x1920', type: 'both' },
      { id: 'ig-reels', name: 'Instagram Reels', ratio: '9:16', size: '1080x1920', type: 'video' },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    icon: '🎵',
    color: colors.pink,
    formats: [
      { id: 'tt-infeed', name: 'In-Feed Ad', ratio: '9:16', size: '1080x1920', type: 'video' },
      { id: 'tt-topview', name: 'TopView', ratio: '9:16', size: '1080x1920', type: 'video' },
      { id: 'tt-spark', name: 'Spark Ad', ratio: '9:16', size: '1080x1920', type: 'video' },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube Ads',
    icon: '▶️',
    color: colors.red,
    formats: [
      { id: 'yt-bumper', name: 'Bumper (6s)', ratio: '16:9', size: '1920x1080', type: 'video' },
      { id: 'yt-skippable', name: 'Skippable', ratio: '16:9', size: '1920x1080', type: 'video' },
      { id: 'yt-discovery', name: 'Discovery Thumbnail', ratio: '16:9', size: '1280x720', type: 'image' },
      { id: 'yt-shorts', name: 'Shorts', ratio: '9:16', size: '1080x1920', type: 'video' },
    ],
  },
  {
    id: 'pinterest',
    name: 'Pinterest Ads',
    icon: '📌',
    color: colors.red,
    formats: [
      { id: 'pin-standard', name: 'Standard Pin', ratio: '2:3', size: '1000x1500', type: 'image' },
      { id: 'pin-video', name: 'Video Pin', ratio: '1:1', size: '1080x1080', type: 'video' },
      { id: 'pin-idea', name: 'Idea Pin', ratio: '9:16', size: '1080x1920', type: 'both' },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    icon: '💼',
    color: colors.blue,
    formats: [
      { id: 'li-single', name: 'Single Image', ratio: '1.91:1', size: '1200x627', type: 'image' },
      { id: 'li-video', name: 'Video Ad', ratio: '16:9', size: '1920x1080', type: 'video' },
      { id: 'li-carousel', name: 'Carousel', ratio: '1:1', size: '1080x1080', type: 'image' },
    ],
  },
]

// Design tool integrations
const designTools = [
  { id: 'figma', name: 'Figma', icon: '🎨', connected: true },
  { id: 'photoshop', name: 'Photoshop', icon: '📷', connected: true },
  { id: 'canva', name: 'Canva', icon: '🖼️', connected: false },
  { id: 'aftereffects', name: 'After Effects', icon: '🎬', connected: true },
]

// Ad templates
const adTemplates = [
  { id: 'product-showcase', name: 'Product Showcase', category: 'Product', preview: '📦' },
  { id: 'lifestyle-hero', name: 'Lifestyle Hero', category: 'Lifestyle', preview: '🏖️' },
  { id: 'testimonial', name: 'Testimonial', category: 'Social Proof', preview: '💬' },
  { id: 'before-after', name: 'Before/After', category: 'Transformation', preview: '↔️' },
  { id: 'unboxing', name: 'Unboxing', category: 'Product', preview: '📦' },
  { id: 'ugc-style', name: 'UGC Style', category: 'Authentic', preview: '📱' },
]

// Node templates
const nodeTemplates = [
  // Source nodes
  { type: 'creative_asset', title: 'Creative Asset', icon: '🎨', category: 'Source', size: 'medium' as const },
  { type: 'video_source', title: 'Video Source', icon: '🎬', category: 'Source', size: 'medium' as const },
  { type: 'copy_source', title: 'Ad Copy', icon: '✍️', category: 'Source', size: 'medium' as const },
  { type: 'cta_source', title: 'CTA Button', icon: '👆', category: 'Source', size: 'small' as const },

  // Processing
  { type: 'ai_resize', title: 'AI Resize', icon: '📐', category: 'Process', size: 'hub' as const },
  { type: 'format_adapt', title: 'Format Adapt', icon: '🔄', category: 'Process', size: 'hub' as const },
  { type: 'text_overlay', title: 'Text Overlay', icon: '📝', category: 'Process', size: 'medium' as const },
  { type: 'brand_apply', title: 'Brand Kit', icon: '🎨', category: 'Process', size: 'medium' as const },

  // Export
  { type: 'figma_export', title: 'Figma Export', icon: '🎨', category: 'Export', size: 'medium' as const },
  { type: 'photoshop_export', title: 'Photoshop Export', icon: '📷', category: 'Export', size: 'medium' as const },
  { type: 'direct_export', title: 'Direct Export', icon: '📤', category: 'Export', size: 'medium' as const },
  { type: 'batch_export', title: 'Batch Export', icon: '⚡', category: 'Export', size: 'hub' as const },
]

// Platform format selector component
function PlatformFormatSelector({
  selectedFormats,
  onToggleFormat,
}: {
  selectedFormats: string[]
  onToggleFormat: (formatId: string) => void
}) {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('meta')

  return (
    <div className="space-y-2">
      {platforms.map(platform => (
        <div key={platform.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
          <button
            onClick={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
            className="w-full p-3 flex items-center justify-between"
            style={{ background: colors.bg }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{platform.icon}</span>
              <span className="text-sm font-medium" style={{ color: colors.text }}>{platform.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${platform.color}22`, color: platform.color }}>
                {platform.formats.filter(f => selectedFormats.includes(f.id)).length}/{platform.formats.length}
              </span>
              <span style={{ color: colors.textMuted }}>{expandedPlatform === platform.id ? '▼' : '▶'}</span>
            </div>
          </button>

          <AnimatePresence>
            {expandedPlatform === platform.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-2" style={{ background: colors.surface }}>
                  {platform.formats.map(format => (
                    <button
                      key={format.id}
                      onClick={() => onToggleFormat(format.id)}
                      className="w-full p-2 rounded-lg flex items-center justify-between text-left transition-all"
                      style={{
                        background: selectedFormats.includes(format.id) ? `${platform.color}22` : colors.bg,
                        border: `1px solid ${selectedFormats.includes(format.id) ? platform.color : 'transparent'}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs">{format.type === 'video' ? '🎬' : format.type === 'both' ? '📱' : '🖼️'}</span>
                        <div>
                          <div className="text-xs font-medium" style={{ color: colors.text }}>{format.name}</div>
                          <div className="text-[10px]" style={{ color: colors.textDim }}>{format.ratio} • {format.size}</div>
                        </div>
                      </div>
                      {selectedFormats.includes(format.id) && (
                        <span style={{ color: platform.color }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// Design tool connection panel
function DesignToolPanel() {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium" style={{ color: colors.textMuted }}>Connected Tools</h4>
      {designTools.map(tool => (
        <div
          key={tool.id}
          className="flex items-center justify-between p-3 rounded-xl"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{tool.icon}</span>
            <span className="text-sm" style={{ color: colors.text }}>{tool.name}</span>
          </div>
          {tool.connected ? (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${colors.green}22`, color: colors.green }}>
              Connected
            </span>
          ) : (
            <button className="text-xs px-2 py-1 rounded" style={{ background: colors.accent, color: colors.text }}>
              Connect
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// Template gallery
function TemplateGallery({ onSelect }: { onSelect: (templateId: string) => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium" style={{ color: colors.textMuted }}>Ad Templates</h4>
      <div className="grid grid-cols-2 gap-2">
        {adTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => { setSelectedTemplate(template.id); onSelect(template.id) }}
            className="p-3 rounded-xl text-left transition-all"
            style={{
              background: selectedTemplate === template.id ? `${colors.accent}22` : colors.bg,
              border: `1px solid ${selectedTemplate === template.id ? colors.accent : colors.border}`,
            }}
          >
            <span className="text-2xl mb-2 block">{template.preview}</span>
            <div className="text-xs font-medium" style={{ color: colors.text }}>{template.name}</div>
            <div className="text-[10px]" style={{ color: colors.textDim }}>{template.category}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SocialPaidAdsWorkflow() {
  const [nodes, setNodes] = useState<NeuralNode[]>([
    // Source section
    {
      id: 'asset_1',
      type: 'creative_asset',
      title: 'Hero Image',
      subtitle: 'Product shot',
      icon: '🎨',
      x: 100,
      y: 150,
      inputs: [],
      outputs: [{ id: 'asset_out', type: 'output', label: 'Image', dataType: 'image' }],
      size: 'medium',
    },
    {
      id: 'video_1',
      type: 'video_source',
      title: 'Video Clip',
      subtitle: '15s promo',
      icon: '🎬',
      x: 100,
      y: 280,
      inputs: [],
      outputs: [{ id: 'video_out', type: 'output', label: 'Video', dataType: 'video' }],
      size: 'medium',
    },
    {
      id: 'copy_1',
      type: 'copy_source',
      title: 'Ad Copy',
      subtitle: 'Headlines & body',
      icon: '✍️',
      x: 100,
      y: 410,
      inputs: [],
      outputs: [{ id: 'copy_out', type: 'output', label: 'Text', dataType: 'text' }],
      size: 'medium',
    },
    // Processing hub
    {
      id: 'resize_hub',
      type: 'ai_resize',
      title: 'AI Resize Hub',
      subtitle: 'Smart crop & fill',
      icon: '📐',
      x: 380,
      y: 200,
      inputs: [
        { id: 'image_in', type: 'input', label: 'Image', dataType: 'image' },
        { id: 'video_in', type: 'input', label: 'Video', dataType: 'video' },
      ],
      outputs: [
        { id: 'resized_out', type: 'output', label: 'Resized', dataType: 'any' },
      ],
      size: 'hub',
    },
    {
      id: 'overlay_1',
      type: 'text_overlay',
      title: 'Text Overlay',
      subtitle: 'CTA & headlines',
      icon: '📝',
      x: 380,
      y: 360,
      inputs: [
        { id: 'media_in', type: 'input', label: 'Media', dataType: 'any' },
        { id: 'text_in', type: 'input', label: 'Text', dataType: 'text' },
      ],
      outputs: [{ id: 'composed_out', type: 'output', label: 'Composed', dataType: 'any' }],
      size: 'medium',
    },
    // Format adapters
    {
      id: 'format_1x1',
      type: 'format_adapt',
      title: '1:1 Square',
      subtitle: 'Feed formats',
      icon: '⬛',
      x: 620,
      y: 100,
      inputs: [{ id: 'input_in', type: 'input', label: 'Input', dataType: 'any' }],
      outputs: [{ id: 'format_out', type: 'output', label: '1:1', dataType: 'any' }],
      size: 'medium',
    },
    {
      id: 'format_9x16',
      type: 'format_adapt',
      title: '9:16 Vertical',
      subtitle: 'Stories & Reels',
      icon: '📱',
      x: 620,
      y: 220,
      inputs: [{ id: 'input_in', type: 'input', label: 'Input', dataType: 'any' }],
      outputs: [{ id: 'format_out', type: 'output', label: '9:16', dataType: 'any' }],
      size: 'medium',
    },
    {
      id: 'format_4x5',
      type: 'format_adapt',
      title: '4:5 Portrait',
      subtitle: 'IG posts',
      icon: '🖼️',
      x: 620,
      y: 340,
      inputs: [{ id: 'input_in', type: 'input', label: 'Input', dataType: 'any' }],
      outputs: [{ id: 'format_out', type: 'output', label: '4:5', dataType: 'any' }],
      size: 'medium',
    },
    {
      id: 'format_16x9',
      type: 'format_adapt',
      title: '16:9 Landscape',
      subtitle: 'YouTube & Video',
      icon: '🎥',
      x: 620,
      y: 460,
      inputs: [{ id: 'input_in', type: 'input', label: 'Input', dataType: 'any' }],
      outputs: [{ id: 'format_out', type: 'output', label: '16:9', dataType: 'any' }],
      size: 'medium',
    },
    // Export hub
    {
      id: 'batch_export',
      type: 'batch_export',
      title: 'Batch Export',
      subtitle: 'All platforms',
      icon: '⚡',
      x: 880,
      y: 280,
      inputs: [
        { id: 'in_1x1', type: 'input', label: '1:1', dataType: 'any' },
        { id: 'in_9x16', type: 'input', label: '9:16', dataType: 'any' },
        { id: 'in_4x5', type: 'input', label: '4:5', dataType: 'any' },
        { id: 'in_16x9', type: 'input', label: '16:9', dataType: 'any' },
      ],
      outputs: [],
      size: 'hub',
    },
  ])

  const [connections, setConnections] = useState<NeuralConnection[]>([
    { id: 'c1', fromNode: 'asset_1', fromPort: 'asset_out', toNode: 'resize_hub', toPort: 'image_in' },
    { id: 'c2', fromNode: 'video_1', fromPort: 'video_out', toNode: 'resize_hub', toPort: 'video_in' },
    { id: 'c3', fromNode: 'copy_1', fromPort: 'copy_out', toNode: 'overlay_1', toPort: 'text_in' },
    { id: 'c4', fromNode: 'resize_hub', fromPort: 'resized_out', toNode: 'overlay_1', toPort: 'media_in' },
    { id: 'c5', fromNode: 'overlay_1', fromPort: 'composed_out', toNode: 'format_1x1', toPort: 'input_in' },
    { id: 'c6', fromNode: 'overlay_1', fromPort: 'composed_out', toNode: 'format_9x16', toPort: 'input_in' },
    { id: 'c7', fromNode: 'overlay_1', fromPort: 'composed_out', toNode: 'format_4x5', toPort: 'input_in' },
    { id: 'c8', fromNode: 'overlay_1', fromPort: 'composed_out', toNode: 'format_16x9', toPort: 'input_in' },
    { id: 'c9', fromNode: 'format_1x1', fromPort: 'format_out', toNode: 'batch_export', toPort: 'in_1x1' },
    { id: 'c10', fromNode: 'format_9x16', fromPort: 'format_out', toNode: 'batch_export', toPort: 'in_9x16' },
    { id: 'c11', fromNode: 'format_4x5', fromPort: 'format_out', toNode: 'batch_export', toPort: 'in_4x5' },
    { id: 'c12', fromNode: 'format_16x9', fromPort: 'format_out', toNode: 'batch_export', toPort: 'in_16x9' },
  ])

  const [selectedNode, setSelectedNode] = useState<NeuralNode | null>(null)
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['fb-feed', 'ig-feed', 'ig-story', 'ig-reels'])
  const [activeTab, setActiveTab] = useState<'formats' | 'tools' | 'templates'>('formats')

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatId) ? prev.filter(f => f !== formatId) : [...prev, formatId]
    )
  }

  const totalSelected = selectedFormats.length

  return (
    <div className="flex gap-4 h-[800px]">
      {/* Left Panel */}
      <div
        className="w-80 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: colors.border }}>
          {[
            { id: 'formats' as const, label: 'Formats', icon: '📐' },
            { id: 'tools' as const, label: 'Tools', icon: '🔧' },
            { id: 'templates' as const, label: 'Templates', icon: '📋' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1"
              style={{
                background: activeTab === tab.id ? colors.bg : 'transparent',
                color: activeTab === tab.id ? colors.text : colors.textMuted,
                borderBottom: activeTab === tab.id ? `2px solid ${colors.accent}` : '2px solid transparent',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'formats' && (
            <PlatformFormatSelector
              selectedFormats={selectedFormats}
              onToggleFormat={toggleFormat}
            />
          )}
          {activeTab === 'tools' && <DesignToolPanel />}
          {activeTab === 'templates' && <TemplateGallery onSelect={(id) => console.log('Template:', id)} />}
        </div>

        {/* Summary */}
        <div className="p-4 border-t" style={{ borderColor: colors.border, background: colors.bg }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: colors.text }}>Export Summary</span>
            <span className="text-xs px-2 py-1 rounded" style={{ background: `${colors.accent}22`, color: colors.accent }}>
              {totalSelected} formats
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {platforms.map(p => {
              const count = p.formats.filter(f => selectedFormats.includes(f.id)).length
              if (count === 0) return null
              return (
                <span key={p.id} className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${p.color}22`, color: p.color }}>
                  {p.icon} {count}
                </span>
              )
            })}
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
          onNodeSelect={setSelectedNode}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNode?.id}
          accentColor={colors.accent}
        />
      </div>

      {/* Right Panel - Export Preview */}
      <div
        className="w-64 rounded-2xl p-4 flex flex-col gap-4"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <h3 className="text-sm font-medium" style={{ color: colors.text }}>Export Preview</h3>

        {/* Format previews */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { ratio: '1:1', icon: '⬛', w: 60, h: 60 },
            { ratio: '9:16', icon: '📱', w: 40, h: 71 },
            { ratio: '4:5', icon: '🖼️', w: 48, h: 60 },
            { ratio: '16:9', icon: '🎥', w: 71, h: 40 },
          ].map(preview => (
            <div
              key={preview.ratio}
              className="rounded-lg flex flex-col items-center justify-center p-3"
              style={{ background: colors.bg }}
            >
              <div
                className="rounded flex items-center justify-center mb-2"
                style={{
                  width: preview.w,
                  height: preview.h,
                  background: colors.surfaceLight,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <span className="text-lg opacity-50">{preview.icon}</span>
              </div>
              <span className="text-[10px]" style={{ color: colors.textMuted }}>{preview.ratio}</span>
            </div>
          ))}
        </div>

        {/* Export options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: colors.bg }}>
            <span className="text-xs" style={{ color: colors.textMuted }}>Figma Sync</span>
            <input type="checkbox" defaultChecked className="accent-orange-500" />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: colors.bg }}>
            <span className="text-xs" style={{ color: colors.textMuted }}>PSD Layers</span>
            <input type="checkbox" defaultChecked className="accent-orange-500" />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: colors.bg }}>
            <span className="text-xs" style={{ color: colors.textMuted }}>Video MP4</span>
            <input type="checkbox" defaultChecked className="accent-orange-500" />
          </div>
        </div>

        <div className="flex-1" />

        {/* Export buttons */}
        <div className="space-y-2">
          <button
            className="w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
            style={{ background: colors.bg, color: colors.textMuted, border: `1px solid ${colors.border}` }}
          >
            <span>🎨</span> Export to Figma
          </button>
          <button
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.yellow} 100%)`,
              color: colors.text,
              boxShadow: `0 0 30px ${colors.accent}44`,
            }}
          >
            <span>⚡</span> Export All ({totalSelected})
          </button>
        </div>
      </div>
    </div>
  )
}
