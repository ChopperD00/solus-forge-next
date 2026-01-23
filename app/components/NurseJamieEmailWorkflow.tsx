'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NodeWorkflowCanvas, { WorkflowNode, NodeConnection } from './NodeWorkflowCanvas'

// Nurse Jamie Brand Colors - Clean, Professional Skincare Aesthetic
const njColors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  border: '#3A3030',
  text: '#FFFFFF',
  textMuted: '#B0A8A8',
  textDim: '#706868',
  // Nurse Jamie Brand Palette
  accent: '#D4AF37', // Gold - luxury beauty
  rosegold: '#B76E79',
  blush: '#E8B4B8',
  cream: '#FFF8E7',
  navy: '#1E3A5F',
  white: '#FFFFFF',
  charcoal: '#2D2D2D',
}

// Nurse Jamie Product Catalog - Skincare Tools & Products
const njProducts = [
  // Beauty Devices
  { sku: 'NJ001', name: 'Beauty Bear Pillow', category: 'Sleep Beauty', type: 'Device', videoFile: 'BEAUTYBEARPILLOW.mp4' },
  { sku: 'NJ002', name: 'Beauty Stamp', category: 'Micro-Needling', type: 'Device', videoFile: 'BEAUTYSTAMP.mp4' },
  { sku: 'NJ003', name: 'Brightening Bar', category: 'Cleansing', type: 'Skincare', videoFile: 'BRIGHTENINGBAR.mp4' },
  { sku: 'NJ004', name: 'Eyeonix', category: 'Eye Care', type: 'Device', videoFile: 'EYEONIX.mp4' },
  { sku: 'NJ005', name: 'Face Wrap', category: 'Masks', type: 'Device', videoFile: 'FACEWRAP.mp4' },
  { sku: 'NJ006', name: 'Neck Wrap', category: 'Neck Care', type: 'Device', videoFile: 'NECKWRAP.mp4' },
  { sku: 'NJ007', name: 'NuVibe', category: 'Massage', type: 'Device', videoFile: 'NUVIBE.mp4' },
  { sku: 'NJ008', name: 'Rose All Night', category: 'Serums', type: 'Skincare', videoFile: 'ROSEALLNIGHT.mp4' },
  { sku: 'NJ009', name: 'Super Cryo', category: 'Cryo Therapy', type: 'Device', videoFile: 'SUPERCRYO.mp4' },
  { sku: 'NJ010', name: 'Uplift & Glow', category: 'Face Sculpting', type: 'Device', videoFile: 'UPLIFTNGLOW_V3.mp4' },
  { sku: 'NJ011', name: 'Uplift Roller', category: 'Face Sculpting', type: 'Device', videoFile: 'UPLIFTROLLER.mp4' },
]

// Product Categories
const njCategories = [
  { id: 'sleep_beauty', name: 'Sleep Beauty', icon: '😴', description: 'Beauty while you sleep' },
  { id: 'micro_needling', name: 'Micro-Needling', icon: '💉', description: 'Professional micro-needling' },
  { id: 'cleansing', name: 'Cleansing', icon: '🧼', description: 'Deep cleansing products' },
  { id: 'eye_care', name: 'Eye Care', icon: '👁️', description: 'Eye treatment devices' },
  { id: 'masks', name: 'Masks & Wraps', icon: '🎭', description: 'Face & body masks' },
  { id: 'massage', name: 'Massage Tools', icon: '💆', description: 'Massage & relaxation' },
  { id: 'serums', name: 'Serums', icon: '💧', description: 'Treatment serums' },
  { id: 'cryo', name: 'Cryo Therapy', icon: '❄️', description: 'Cold therapy devices' },
  { id: 'sculpting', name: 'Face Sculpting', icon: '✨', description: 'Lifting & contouring' },
]

// Email Template Types for NJ
const njEmailTypes = [
  { id: 'product_launch', name: 'Product Launch', icon: '🚀', description: 'New product announcements' },
  { id: 'promotional', name: 'Promotional', icon: '🏷️', description: 'Sales and offers' },
  { id: 'educational', name: 'Educational', icon: '📚', description: 'How-to and tips' },
  { id: 'testimonial', name: 'Testimonial', icon: '⭐', description: 'Customer reviews' },
  { id: 'newsletter', name: 'Newsletter', icon: '📰', description: 'Regular updates' },
]

// Content block types
const contentBlocks = [
  { id: 'hero_video', name: 'Hero Video', icon: '🎬', description: 'Full-width product video' },
  { id: 'hero_image', name: 'Hero Image', icon: '🖼️', description: 'Full-width feature image' },
  { id: 'product_grid', name: 'Product Grid', icon: '📦', description: '2-4 product showcase' },
  { id: 'before_after', name: 'Before/After', icon: '↔️', description: 'Results comparison' },
  { id: 'testimonial', name: 'Testimonial', icon: '💬', description: 'Customer quote block' },
  { id: 'cta_button', name: 'CTA Button', icon: '👆', description: 'Call-to-action button' },
  { id: 'text_block', name: 'Text Block', icon: '📝', description: 'Body copy section' },
  { id: 'social_proof', name: 'Social Proof', icon: '👥', description: 'Press/celebrity mentions' },
]

// Nurse Jamie workflow node types
const njNodes = {
  triggers: [
    { id: 'template_select', name: 'Email Template', icon: '📧', description: 'Select email template type' },
    { id: 'product_library', name: 'Product Library', icon: '📦', description: 'Connect to NJ catalog' },
    { id: 'video_library', name: 'Video Library', icon: '🎬', description: 'Connect to video assets' },
  ],
  content: [
    { id: 'hero_block', name: 'Hero Block', icon: '🌟', description: 'Main feature section' },
    { id: 'product_block', name: 'Product Block', icon: '💎', description: 'Product showcase' },
    { id: 'video_embed', name: 'Video Embed', icon: '▶️', description: 'Embedded video section' },
    { id: 'results_block', name: 'Results Block', icon: '📊', description: 'Before/after results' },
  ],
  styling: [
    { id: 'brand_style', name: 'Brand Style', icon: '🎨', description: 'Apply NJ brand styling' },
    { id: 'layout_select', name: 'Layout', icon: '📐', description: 'Choose email layout' },
    { id: 'color_override', name: 'Color Override', icon: '🖌️', description: 'Custom color scheme' },
  ],
  output: [
    { id: 'html_export', name: 'HTML Export', icon: '🌐', description: 'Export email HTML' },
    { id: 'image_export', name: 'Image Export', icon: '🖼️', description: 'Export as image' },
    { id: 'gif_export', name: 'GIF Export', icon: '🎞️', description: 'Export animated GIF' },
    { id: 'send_test', name: 'Send Test', icon: '📤', description: 'Send test email' },
  ],
}

interface NJNodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}

function NJNodeConfigPanel({ node, onClose, onUpdate }: NJNodeConfigPanelProps) {
  const [config, setConfig] = useState<Record<string, any>>(node?.data || {})

  if (!node) return null

  const handleSave = () => {
    onUpdate(node.id, config)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-0 top-0 bottom-0 w-96 overflow-y-auto z-30"
      style={{ background: njColors.surface, borderLeft: `1px solid ${njColors.border}` }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{node.icon}</span>
            <h3 className="font-medium" style={{ color: njColors.text }}>{node.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: njColors.textMuted }}>✕</button>
        </div>

        {/* Template Select Node */}
        {node.type === 'template_select' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Email Type</label>
              <div className="space-y-2">
                {njEmailTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setConfig({ ...config, emailType: type.id, emailTypeName: type.name })}
                    className={`w-full p-3 rounded-xl text-left transition-all ${config.emailType === type.id ? 'ring-2' : ''}`}
                    style={{
                      background: njColors.bg,
                      border: `1px solid ${config.emailType === type.id ? njColors.accent : njColors.border}`,
                      '--tw-ring-color': njColors.accent,
                    } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{type.icon}</span>
                      <div>
                        <div className="text-sm" style={{ color: njColors.text }}>{type.name}</div>
                        <div className="text-xs" style={{ color: njColors.textDim }}>{type.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Campaign Name</label>
              <input
                value={config.campaignName || ''}
                onChange={(e) => setConfig({ ...config, campaignName: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: njColors.bg, color: njColors.text, border: `1px solid ${njColors.border}` }}
                placeholder="January Product Launch"
              />
            </div>
          </div>
        )}

        {/* Product Library Node */}
        {node.type === 'product_library' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Filter by Category</label>
              <select
                value={config.category || ''}
                onChange={(e) => setConfig({ ...config, category: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: njColors.bg, color: njColors.text, border: `1px solid ${njColors.border}` }}
              >
                <option value="">All Categories</option>
                {njCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Products</label>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {njProducts
                  .filter(p => !config.category || p.category.toLowerCase().replace(/[- ]/g, '_') === config.category)
                  .map(product => (
                    <button
                      key={product.sku}
                      onClick={() => {
                        const selected = config.selectedProducts || []
                        const isSelected = selected.includes(product.sku)
                        setConfig({
                          ...config,
                          selectedProducts: isSelected
                            ? selected.filter((s: string) => s !== product.sku)
                            : [...selected, product.sku]
                        })
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all ${(config.selectedProducts || []).includes(product.sku) ? 'ring-2' : ''}`}
                      style={{
                        background: njColors.bg,
                        border: `1px solid ${(config.selectedProducts || []).includes(product.sku) ? njColors.accent : njColors.border}`,
                        '--tw-ring-color': njColors.accent,
                      } as React.CSSProperties}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium" style={{ color: njColors.text }}>{product.name}</div>
                          <div className="text-xs" style={{ color: njColors.textDim }}>{product.category} • {product.type}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: njColors.surfaceLight, color: njColors.textMuted }}>
                          {product.sku}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Video Library Node */}
        {node.type === 'video_library' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Available Videos</label>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {njProducts.filter(p => p.videoFile).map(product => (
                  <button
                    key={product.sku}
                    onClick={() => setConfig({ ...config, selectedVideo: product.videoFile, videoProduct: product.name })}
                    className={`w-full p-3 rounded-xl text-left transition-all ${config.selectedVideo === product.videoFile ? 'ring-2' : ''}`}
                    style={{
                      background: njColors.bg,
                      border: `1px solid ${config.selectedVideo === product.videoFile ? njColors.accent : njColors.border}`,
                      '--tw-ring-color': njColors.accent,
                    } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ background: njColors.surfaceLight }}>
                        🎬
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: njColors.text }}>{product.name}</div>
                        <div className="text-xs" style={{ color: njColors.textDim }}>{product.videoFile}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hero Block Node */}
        {node.type === 'hero_block' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Hero Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'video', name: 'Video', icon: '🎬' },
                  { id: 'image', name: 'Image', icon: '🖼️' },
                  { id: 'animated', name: 'Animated', icon: '🎞️' },
                  { id: 'carousel', name: 'Carousel', icon: '🎠' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setConfig({ ...config, heroType: type.id })}
                    className={`p-3 rounded-xl transition-all ${config.heroType === type.id ? 'ring-2' : ''}`}
                    style={{
                      background: njColors.bg,
                      border: `1px solid ${config.heroType === type.id ? njColors.accent : njColors.border}`,
                      '--tw-ring-color': njColors.accent,
                    } as React.CSSProperties}
                  >
                    <div className="text-center">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="text-xs mt-1" style={{ color: njColors.text }}>{type.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Headline</label>
              <input
                value={config.headline || ''}
                onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: njColors.bg, color: njColors.text, border: `1px solid ${njColors.border}` }}
                placeholder="Discover Your Best Skin Yet"
              />
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Subheadline</label>
              <input
                value={config.subheadline || ''}
                onChange={(e) => setConfig({ ...config, subheadline: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: njColors.bg, color: njColors.text, border: `1px solid ${njColors.border}` }}
                placeholder="Professional results at home"
              />
            </div>
          </div>
        )}

        {/* Product Block Node */}
        {node.type === 'product_block' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Layout Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'single', name: 'Single', cols: 1 },
                  { id: 'two_col', name: '2 Column', cols: 2 },
                  { id: 'three_col', name: '3 Column', cols: 3 },
                  { id: 'featured', name: 'Featured', cols: 1 },
                ].map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => setConfig({ ...config, layout: layout.id })}
                    className={`p-3 rounded-xl transition-all ${config.layout === layout.id ? 'ring-2' : ''}`}
                    style={{
                      background: njColors.bg,
                      border: `1px solid ${config.layout === layout.id ? njColors.accent : njColors.border}`,
                      '--tw-ring-color': njColors.accent,
                    } as React.CSSProperties}
                  >
                    <div className="text-center">
                      <div className="flex gap-1 justify-center mb-1">
                        {Array(layout.cols).fill(0).map((_, i) => (
                          <div key={i} className="w-4 h-6 rounded" style={{ background: njColors.accent + '44' }} />
                        ))}
                      </div>
                      <div className="text-xs" style={{ color: njColors.text }}>{layout.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Show Price</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showPrice || false}
                  onChange={(e) => setConfig({ ...config, showPrice: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: njColors.text }}>Display product prices</span>
              </label>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>CTA Text</label>
              <input
                value={config.ctaText || 'Shop Now'}
                onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: njColors.bg, color: njColors.text, border: `1px solid ${njColors.border}` }}
              />
            </div>
          </div>
        )}

        {/* Brand Style Node */}
        {node.type === 'brand_style' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Color Scheme</label>
              <div className="space-y-2">
                {[
                  { id: 'gold_luxury', name: 'Gold Luxury', primary: njColors.accent, secondary: njColors.charcoal },
                  { id: 'rose_soft', name: 'Rose Soft', primary: njColors.rosegold, secondary: njColors.cream },
                  { id: 'clean_white', name: 'Clean White', primary: njColors.navy, secondary: njColors.white },
                  { id: 'blush_glow', name: 'Blush Glow', primary: njColors.blush, secondary: njColors.charcoal },
                ].map(scheme => (
                  <button
                    key={scheme.id}
                    onClick={() => setConfig({ ...config, colorScheme: scheme.id })}
                    className={`w-full p-3 rounded-xl text-left transition-all ${config.colorScheme === scheme.id ? 'ring-2' : ''}`}
                    style={{
                      background: njColors.bg,
                      border: `1px solid ${config.colorScheme === scheme.id ? njColors.accent : njColors.border}`,
                      '--tw-ring-color': njColors.accent,
                    } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 rounded-full border-2" style={{ background: scheme.primary, borderColor: njColors.bg }} />
                        <div className="w-6 h-6 rounded-full border-2" style={{ background: scheme.secondary, borderColor: njColors.bg }} />
                      </div>
                      <span className="text-sm" style={{ color: njColors.text }}>{scheme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Font Style</label>
              <select
                value={config.fontStyle || 'elegant'}
                onChange={(e) => setConfig({ ...config, fontStyle: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: njColors.bg, color: njColors.text, border: `1px solid ${njColors.border}` }}
              >
                <option value="elegant">Elegant Serif</option>
                <option value="modern">Modern Sans</option>
                <option value="minimal">Minimal Clean</option>
                <option value="bold">Bold Statement</option>
              </select>
            </div>
          </div>
        )}

        {/* HTML Export Node */}
        {node.type === 'html_export' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Export Format</label>
              <select
                value={config.exportFormat || 'responsive'}
                onChange={(e) => setConfig({ ...config, exportFormat: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: njColors.bg, color: njColors.text, border: `1px solid ${njColors.border}` }}
              >
                <option value="responsive">Responsive HTML</option>
                <option value="fixed">Fixed Width (600px)</option>
                <option value="amp">AMP Email</option>
                <option value="plain">Plain Text Fallback</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Email Platform</label>
              <select
                value={config.platform || 'generic'}
                onChange={(e) => setConfig({ ...config, platform: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: njColors.bg, color: njColors.text, border: `1px solid ${njColors.border}` }}
              >
                <option value="generic">Generic HTML</option>
                <option value="klaviyo">Klaviyo</option>
                <option value="mailchimp">Mailchimp</option>
                <option value="sendgrid">SendGrid</option>
                <option value="hubspot">HubSpot</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: njColors.textMuted }}>Include</label>
              <div className="space-y-2">
                {[
                  { id: 'tracking', name: 'Tracking Pixels' },
                  { id: 'preheader', name: 'Preheader Text' },
                  { id: 'unsubscribe', name: 'Unsubscribe Link' },
                  { id: 'viewbrowser', name: 'View in Browser Link' },
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config[option.id] !== false}
                      onChange={(e) => setConfig({ ...config, [option.id]: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: njColors.text }}>{option.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-medium mt-6 transition-all hover:scale-[1.02]"
          style={{ background: njColors.accent, color: njColors.charcoal }}
        >
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function NurseJamieEmailWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    // Template Select
    {
      id: 'template_1',
      type: 'template_select',
      title: 'Product Launch',
      subtitle: 'Email Template',
      icon: '📧',
      x: 80,
      y: 150,
      inputs: [],
      outputs: [{ id: 'template_out', type: 'output', label: 'Template', dataType: 'any' }],
      color: njColors.accent,
    },
    // Product Library
    {
      id: 'library_1',
      type: 'product_library',
      title: 'NJ Products',
      subtitle: '11 products',
      icon: '📦',
      x: 80,
      y: 320,
      inputs: [],
      outputs: [{ id: 'products_out', type: 'output', label: 'Products', dataType: 'any' }],
      color: njColors.rosegold,
    },
    // Video Library
    {
      id: 'video_1',
      type: 'video_library',
      title: 'Video Assets',
      subtitle: '11 videos',
      icon: '🎬',
      x: 80,
      y: 490,
      inputs: [],
      outputs: [{ id: 'video_out', type: 'output', label: 'Video', dataType: 'any' }],
      color: '#EF4444',
    },
    // Hero Block
    {
      id: 'hero_1',
      type: 'hero_block',
      title: 'Hero Section',
      subtitle: 'Video Feature',
      icon: '🌟',
      x: 320,
      y: 200,
      inputs: [
        { id: 'template_in', type: 'input', label: 'Template', dataType: 'any' },
        { id: 'video_in', type: 'input', label: 'Video', dataType: 'any' },
      ],
      outputs: [{ id: 'hero_out', type: 'output', label: 'Hero', dataType: 'any' }],
      color: '#8B5CF6',
    },
    // Product Block
    {
      id: 'products_1',
      type: 'product_block',
      title: 'Product Grid',
      subtitle: '3 Column',
      icon: '💎',
      x: 320,
      y: 380,
      inputs: [{ id: 'products_in', type: 'input', label: 'Products', dataType: 'any' }],
      outputs: [{ id: 'block_out', type: 'output', label: 'Block', dataType: 'any' }],
      color: '#10B981',
    },
    // Brand Style
    {
      id: 'style_1',
      type: 'brand_style',
      title: 'Gold Luxury',
      subtitle: 'Brand Style',
      icon: '🎨',
      x: 540,
      y: 290,
      inputs: [
        { id: 'hero_in', type: 'input', label: 'Hero', dataType: 'any' },
        { id: 'content_in', type: 'input', label: 'Content', dataType: 'any' },
      ],
      outputs: [{ id: 'styled_out', type: 'output', label: 'Styled', dataType: 'any' }],
      color: njColors.accent,
    },
    // HTML Export
    {
      id: 'export_1',
      type: 'html_export',
      title: 'Klaviyo Export',
      subtitle: 'Responsive',
      icon: '🌐',
      x: 760,
      y: 290,
      inputs: [{ id: 'final_in', type: 'input', label: 'Final', dataType: 'any' }],
      outputs: [],
      color: '#3B82F6',
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'template_1', fromPort: 'template_out', toNode: 'hero_1', toPort: 'template_in', animated: true },
    { id: 'conn_2', fromNode: 'video_1', fromPort: 'video_out', toNode: 'hero_1', toPort: 'video_in', animated: true },
    { id: 'conn_3', fromNode: 'library_1', fromPort: 'products_out', toNode: 'products_1', toPort: 'products_in', animated: true },
    { id: 'conn_4', fromNode: 'hero_1', fromPort: 'hero_out', toNode: 'style_1', toPort: 'hero_in', animated: true },
    { id: 'conn_5', fromNode: 'products_1', fromPort: 'block_out', toNode: 'style_1', toPort: 'content_in', animated: true },
    { id: 'conn_6', fromNode: 'style_1', fromPort: 'styled_out', toNode: 'export_1', toPort: 'final_in', animated: true },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [showPalette, setShowPalette] = useState(true)

  // Node templates for palette
  const nodeTemplates = [
    ...njNodes.triggers.map(t => ({
      type: t.id,
      title: t.name,
      icon: t.icon,
      category: 'Input',
      color: njColors.accent,
      inputs: [],
      outputs: [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...njNodes.content.map(c => ({
      type: c.id,
      title: c.name,
      icon: c.icon,
      category: 'Content',
      color: '#8B5CF6',
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...njNodes.styling.map(s => ({
      type: s.id,
      title: s.name,
      icon: s.icon,
      category: 'Styling',
      color: njColors.rosegold,
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...njNodes.output.map(o => ({
      type: o.id,
      title: o.name,
      icon: o.icon,
      category: 'Output',
      color: '#3B82F6',
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [],
    })),
  ]

  const handleAddNode = (template: typeof nodeTemplates[0]) => {
    const newNode: WorkflowNode = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
      icon: template.icon,
      x: 400 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      inputs: template.inputs,
      outputs: template.outputs,
      color: template.color,
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
    <div className="relative w-full h-[700px] rounded-2xl overflow-hidden" style={{ border: `1px solid ${njColors.border}` }}>
      {/* Nurse Jamie Brand Header */}
      <div
        className="absolute top-0 left-0 right-0 z-20 px-6 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(180deg, ${njColors.surface} 0%, transparent 100%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ background: `linear-gradient(135deg, ${njColors.accent} 0%, ${njColors.rosegold} 100%)`, color: njColors.charcoal }}
          >
            NJ
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: njColors.text }}>Nurse Jamie Email Studio</h2>
            <p className="text-xs" style={{ color: njColors.textDim }}>Beauty Device Marketing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {njCategories.slice(0, 4).map(cat => (
            <div
              key={cat.id}
              className="px-3 py-1 rounded-full text-xs"
              style={{ background: njColors.surfaceLight, color: njColors.textMuted }}
            >
              {cat.icon} {cat.name}
            </div>
          ))}
        </div>
      </div>

      {/* Node Palette */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="absolute left-0 top-14 bottom-0 w-64 z-20 flex flex-col"
            style={{ background: njColors.surface, borderRight: `1px solid ${njColors.border}` }}
          >
            <div className="flex-1 overflow-y-auto p-4">
              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="mb-5">
                  <div className="text-xs font-medium mb-2" style={{ color: njColors.textDim }}>{category}</div>
                  <div className="space-y-1">
                    {templates.map(template => (
                      <button
                        key={template.type}
                        onClick={() => handleAddNode(template)}
                        className="w-full p-2 rounded-lg text-left transition-all hover:scale-[1.02] flex items-center gap-2"
                        style={{ background: njColors.bg, border: `1px solid ${njColors.border}` }}
                      >
                        <span className="text-lg">{template.icon}</span>
                        <span className="text-sm" style={{ color: njColors.text }}>{template.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPalette(false)}
              className="p-2 text-xs border-t"
              style={{ borderColor: njColors.border, color: njColors.textMuted }}
            >
              ← Hide
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showPalette && (
        <button
          onClick={() => setShowPalette(true)}
          className="absolute left-4 top-16 z-20 px-3 py-2 rounded-xl text-sm"
          style={{ background: njColors.surface, color: njColors.textMuted, border: `1px solid ${njColors.border}` }}
        >
          + Nodes
        </button>
      )}

      {/* Canvas */}
      <div className={`absolute inset-0 top-14 ${showPalette ? 'left-64' : ''}`}>
        <NodeWorkflowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
          onNodeSelect={setSelectedNode}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNode?.id}
          accentColor={njColors.accent}
        />
      </div>

      {/* Config Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NJNodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
          />
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl z-20"
        style={{ background: `${njColors.surface}ee`, border: `1px solid ${njColors.border}` }}
      >
        <button className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: njColors.textMuted }}>
          👁️ Preview
        </button>
        <div className="w-px h-6" style={{ background: njColors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: njColors.textMuted }}>
          📤 Send Test
        </button>
        <div className="w-px h-6" style={{ background: njColors.border }} />
        <button
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
          style={{ background: njColors.accent, color: njColors.charcoal }}
        >
          🌐 Export HTML
        </button>
      </div>
    </div>
  )
}
