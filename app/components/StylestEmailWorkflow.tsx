'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NodeWorkflowCanvas, { WorkflowNode, NodeConnection } from './NodeWorkflowCanvas'

// Stylest Brand Colors
const stylestColors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  border: '#3A3030',
  text: '#FFFFFF',
  textMuted: '#B0A8A8',
  textDim: '#706868',
  accent: '#F97316', // Stylest Orange (matches their brand)
  // Product Colorways
  caviar: '#1a1a1a',
  hotPepper: '#dc2626',
  blanc: '#f5f5f4',
  pageantBlue: '#3b82f6',
  navy: '#1e3a5f',
  ultraPink: '#ec4899',
  tangerine: '#f97316',
  azure: '#0ea5e9',
}

// Stylest Product Catalog
const stylestProducts = [
  { sku: 'STY072', name: 'Sculpting Puff Sleeve Zip', colorways: ['Caviar', 'Navy'], views: ['LAY_FRONT', 'ON_FIGURE'] },
  { sku: 'STY076', name: 'Sculpting Plunge One Piece', colorways: ['Caviar', 'Blanc'], views: ['LAY_FRONT', 'ON_FIGURE'] },
  { sku: 'STY078', name: 'Sculpting Tummy Control Bottom', colorways: ['Caviar', 'Hot Pepper'], views: ['LAY_FRONT'] },
  { sku: 'STY080', name: 'Sculpting Square Neck Top', colorways: ['Caviar', 'Blanc'], views: ['LAY_FRONT', 'ON_FIGURE'] },
  { sku: 'STY088', name: 'Sculpting Swim Sarong', colorways: ['Caviar', 'Hot Pepper', 'Tangerine'], views: ['LAY_FRONT'] },
  { sku: 'STY128', name: 'Aqualace Quick-Dry Pant', colorways: ['Blanc', 'Navy'], views: ['LAY_FRONT', 'ON_FIGURE'] },
  { sku: 'STY165', name: 'DreamSculpt Swim Sarong', colorways: ['Tangerine', 'Caviar'], views: ['LAY_FRONT'] },
  { sku: 'STY170', name: 'DreamSculpt Piped Swim Belt', colorways: ['Caviar', 'Hot Pepper'], views: ['LAY_FRONT', 'DETAIL'] },
  { sku: 'STY175', name: 'Snapped Bodysuit', colorways: ['Tangerine', 'Blanc'], views: ['LAY_FRONT', 'ON_FIGURE'] },
  { sku: 'STY180', name: 'Bandeau Top', colorways: ['Pageant Blue', 'Hot Pepper'], views: ['LAY_FRONT'] },
  { sku: 'STY192', name: 'Lace-Up Grommet Tank', colorways: ['Hot Pepper', 'Caviar'], views: ['LAY_FRONT', 'ON_FIGURE'] },
  { sku: 'STY203', name: 'Geo Wave Lace Shift', colorways: ['Blanc', 'Navy'], views: ['LAY_FRONT', 'ON_FIGURE'] },
  { sku: 'STY207', name: 'High Waist Bottom', colorways: ['Azure', 'Caviar'], views: ['LAY_FRONT'] },
  { sku: 'STY209', name: 'Push-Up Top', colorways: ['Azure', 'Hot Pepper'], views: ['LAY_FRONT'] },
  { sku: 'STY212', name: 'Grommet Push-Up Bra', colorways: ['Caviar', 'Hot Pepper'], views: ['LAY_FRONT'] },
  { sku: 'STY213', name: 'Grommet High Waist Bottom', colorways: ['Caviar', 'Hot Pepper'], views: ['LAY_FRONT'] },
  { sku: 'STY268', name: 'Striped Crop Top Set', colorways: ['Blanc', 'Navy'], views: ['LAY_FRONT', 'ON_FIGURE'] },
  { sku: 'STY1562', name: 'Convertible Bra', colorways: ['Caviar', 'Hot Pepper', 'Blanc'], views: ['LAY_FRONT', 'DETAIL'] },
  { sku: 'STY1671', name: 'Sculpting Square Neck Tank', colorways: ['Ultra Pink', 'Caviar'], views: ['LAY_FRONT', 'DETAIL'] },
]

// Stylest Founders/Models
const stylestFounders = [
  { id: 'alia', name: 'Alia', section: 'Petite - Short Torso Challenge', image: 'alia_lil.jpg' },
  { id: 'joyann', name: 'Joyann', section: 'Busty Challenge', image: 'joyann.jpg' },
  { id: 'chrissy', name: 'Chrissy', section: 'Active Mom', image: 'chrissy.JPG' },
]

// Email template sections
const emailSections = [
  { id: 'header', name: 'Header', description: 'Logo and navigation' },
  { id: 'hero', name: 'Hero Banner', description: 'Main feature image' },
  { id: 'alia_section', name: 'Alia Section', description: 'Petite/Short Torso products' },
  { id: 'joyann_section', name: 'Joyann Section', description: 'Busty Challenge products' },
  { id: 'chrissy_section', name: 'Chrissy Section', description: 'Active Mom products' },
  { id: 'footer_products', name: 'Footer Products', description: 'Additional product grid' },
  { id: 'footer', name: 'Footer', description: 'Social links and legal' },
]

// Swap action types
const swapActions = [
  { id: 'add', name: 'ADD', icon: '➕', color: '#10B981', description: 'Add new product to zone' },
  { id: 'change', name: 'CHANGE', icon: '🔄', color: '#3B82F6', description: 'Replace existing product' },
  { id: 'remove', name: 'REMOVE', icon: '➖', color: '#EF4444', description: 'Remove product from zone' },
  { id: 'reference', name: 'REFERENCE', icon: '📌', color: '#8B5CF6', description: 'Keep as style reference' },
]

// Stylest workflow node types
const stylestNodes = {
  triggers: [
    { id: 'template_upload', name: 'Email Template', icon: '📧', description: 'Upload email template (PSD/GIF/PNG)' },
    { id: 'asset_library', name: 'Asset Library', icon: '📦', description: 'Connect to product catalog' },
  ],
  zones: [
    { id: 'swap_zone', name: 'Swap Zone', icon: '🎯', description: 'Define product swap area' },
    { id: 'model_zone', name: 'Model Zone', icon: '👤', description: 'Define model swap area' },
    { id: 'text_zone', name: 'Text Zone', icon: '✏️', description: 'Define text swap area' },
  ],
  assets: [
    { id: 'product_select', name: 'Product Select', icon: '👗', description: 'Choose product from catalog' },
    { id: 'colorway_select', name: 'Colorway', icon: '🎨', description: 'Select product colorway' },
    { id: 'view_select', name: 'View Type', icon: '📸', description: 'Choose product view' },
  ],
  output: [
    { id: 'composite', name: 'Generate Composite', icon: '🖼️', description: 'Create final email image' },
    { id: 'export_config', name: 'Export Config', icon: '📋', description: 'Export swap configuration' },
    { id: 'batch_generate', name: 'Batch Generate', icon: '📊', description: 'Generate multiple variants' },
  ],
}

interface StylestNodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}

function StylestNodeConfigPanel({ node, onClose, onUpdate }: StylestNodeConfigPanelProps) {
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
      style={{ background: stylestColors.surface, borderLeft: `1px solid ${stylestColors.border}` }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{node.icon}</span>
            <h3 className="font-medium" style={{ color: stylestColors.text }}>{node.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: stylestColors.textMuted }}>✕</button>
        </div>

        {/* Template Upload Node */}
        {node.type === 'template_upload' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Email Template</label>
              <div
                className="w-full h-40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-opacity-100"
                style={{ background: stylestColors.bg, border: `2px dashed ${stylestColors.border}` }}
              >
                <span className="text-3xl mb-2">📧</span>
                <span className="text-sm" style={{ color: stylestColors.textMuted }}>Drop template or click to upload</span>
                <span className="text-xs mt-1" style={{ color: stylestColors.textDim }}>PSD, GIF, PNG supported</span>
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Template Name</label>
              <input
                value={config.templateName || ''}
                onChange={(e) => setConfig({ ...config, templateName: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                placeholder="Founders Email 2034"
              />
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Dimensions</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={config.width || 600}
                  onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) })}
                  className="w-1/2 p-3 rounded-xl text-sm"
                  style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                  placeholder="Width"
                />
                <input
                  type="number"
                  value={config.height || 6234}
                  onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value) })}
                  className="w-1/2 p-3 rounded-xl text-sm"
                  style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                  placeholder="Height"
                />
              </div>
            </div>
          </div>
        )}

        {/* Swap Zone Node */}
        {node.type === 'swap_zone' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Zone Name</label>
              <input
                value={config.zoneName || ''}
                onChange={(e) => setConfig({ ...config, zoneName: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                placeholder="Product Zone 1"
              />
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Section</label>
              <select
                value={config.section || ''}
                onChange={(e) => setConfig({ ...config, section: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
              >
                <option value="">Select section...</option>
                {emailSections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Action</label>
              <div className="grid grid-cols-2 gap-2">
                {swapActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => setConfig({ ...config, action: action.id })}
                    className={`p-3 rounded-xl text-left transition-all ${config.action === action.id ? 'ring-2' : ''}`}
                    style={{
                      background: stylestColors.bg,
                      border: `1px solid ${config.action === action.id ? action.color : stylestColors.border}`,
                      '--tw-ring-color': action.color,
                    } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-2">
                      <span>{action.icon}</span>
                      <span className="text-sm" style={{ color: stylestColors.text }}>{action.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Zone Bounds</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={config.x || 0}
                  onChange={(e) => setConfig({ ...config, x: parseInt(e.target.value) })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                  placeholder="X"
                />
                <input
                  type="number"
                  value={config.y || 0}
                  onChange={(e) => setConfig({ ...config, y: parseInt(e.target.value) })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                  placeholder="Y"
                />
                <input
                  type="number"
                  value={config.w || 200}
                  onChange={(e) => setConfig({ ...config, w: parseInt(e.target.value) })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                  placeholder="Width"
                />
                <input
                  type="number"
                  value={config.h || 300}
                  onChange={(e) => setConfig({ ...config, h: parseInt(e.target.value) })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                  placeholder="Height"
                />
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Target Layer</label>
              <input
                value={config.targetLayer || ''}
                onChange={(e) => setConfig({ ...config, targetLayer: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                placeholder="Layer name in PSD"
              />
            </div>
          </div>
        )}

        {/* Product Select Node */}
        {node.type === 'product_select' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Search Products</label>
              <input
                value={config.search || ''}
                onChange={(e) => setConfig({ ...config, search: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                placeholder="Search by SKU or name..."
              />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {stylestProducts
                .filter(p =>
                  !config.search ||
                  p.sku.toLowerCase().includes(config.search.toLowerCase()) ||
                  p.name.toLowerCase().includes(config.search.toLowerCase())
                )
                .map(product => (
                  <button
                    key={product.sku}
                    onClick={() => setConfig({ ...config, selectedProduct: product.sku, productName: product.name })}
                    className={`w-full p-3 rounded-xl text-left transition-all ${config.selectedProduct === product.sku ? 'ring-2 ring-orange-500' : ''}`}
                    style={{
                      background: stylestColors.bg,
                      border: `1px solid ${config.selectedProduct === product.sku ? stylestColors.accent : stylestColors.border}`,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium" style={{ color: stylestColors.text }}>{product.sku}</div>
                        <div className="text-xs" style={{ color: stylestColors.textMuted }}>{product.name}</div>
                      </div>
                      <div className="flex gap-1">
                        {product.colorways.slice(0, 3).map(cw => (
                          <div
                            key={cw}
                            className="w-4 h-4 rounded-full border"
                            style={{
                              background: stylestColors[cw.toLowerCase().replace(' ', '') as keyof typeof stylestColors] || '#888',
                              borderColor: stylestColors.border
                            }}
                            title={cw}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Colorway Select Node */}
        {node.type === 'colorway_select' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Select Colorway</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Caviar', color: stylestColors.caviar },
                  { name: 'Hot Pepper', color: stylestColors.hotPepper },
                  { name: 'Blanc', color: stylestColors.blanc },
                  { name: 'Pageant Blue', color: stylestColors.pageantBlue },
                  { name: 'Navy', color: stylestColors.navy },
                  { name: 'Ultra Pink', color: stylestColors.ultraPink },
                  { name: 'Tangerine', color: stylestColors.tangerine },
                  { name: 'Azure', color: stylestColors.azure },
                ].map(cw => (
                  <button
                    key={cw.name}
                    onClick={() => setConfig({ ...config, colorway: cw.name })}
                    className={`p-3 rounded-xl flex items-center gap-3 transition-all ${config.colorway === cw.name ? 'ring-2 ring-orange-500' : ''}`}
                    style={{
                      background: stylestColors.bg,
                      border: `1px solid ${config.colorway === cw.name ? stylestColors.accent : stylestColors.border}`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ background: cw.color, borderColor: stylestColors.border }}
                    />
                    <span className="text-sm" style={{ color: stylestColors.text }}>{cw.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View Select Node */}
        {node.type === 'view_select' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>View Type</label>
              <div className="space-y-2">
                {[
                  { id: 'LAY_FRONT', name: 'Flat Lay Front', icon: '📐', description: 'Product laid flat, front view' },
                  { id: 'ON_FIGURE', name: 'On Figure', icon: '👤', description: 'Product worn by model' },
                  { id: 'DETAIL', name: 'Detail Shot', icon: '🔍', description: 'Close-up detail view' },
                  { id: 'STYLED', name: 'Styled Shot', icon: '✨', description: 'Lifestyle/styled image' },
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setConfig({ ...config, viewType: view.id })}
                    className={`w-full p-3 rounded-xl text-left transition-all ${config.viewType === view.id ? 'ring-2 ring-orange-500' : ''}`}
                    style={{
                      background: stylestColors.bg,
                      border: `1px solid ${config.viewType === view.id ? stylestColors.accent : stylestColors.border}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{view.icon}</span>
                      <div>
                        <div className="text-sm" style={{ color: stylestColors.text }}>{view.name}</div>
                        <div className="text-xs" style={{ color: stylestColors.textDim }}>{view.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Composite Generate Node */}
        {node.type === 'composite' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Output Format</label>
              <select
                value={config.format || 'png'}
                onChange={(e) => setConfig({ ...config, format: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
              >
                <option value="png">PNG (Lossless)</option>
                <option value="jpg">JPEG (Compressed)</option>
                <option value="gif">GIF (Animated)</option>
                <option value="webp">WebP (Modern)</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Output Quality</label>
              <input
                type="range"
                min="1"
                max="100"
                value={config.quality || 95}
                onChange={(e) => setConfig({ ...config, quality: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs" style={{ color: stylestColors.textDim }}>
                <span>Low</span>
                <span>{config.quality || 95}%</span>
                <span>High</span>
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: stylestColors.textMuted }}>Output Name</label>
              <input
                value={config.outputName || ''}
                onChange={(e) => setConfig({ ...config, outputName: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: stylestColors.bg, color: stylestColors.text, border: `1px solid ${stylestColors.border}` }}
                placeholder="email_composite_{date}"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-medium mt-6 transition-all hover:scale-[1.02]"
          style={{ background: stylestColors.accent, color: stylestColors.text }}
        >
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function StylestEmailWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    // Template Upload
    {
      id: 'template_1',
      type: 'template_upload',
      title: 'Founders Email',
      subtitle: '600×6234px',
      icon: '📧',
      x: 80,
      y: 200,
      inputs: [],
      outputs: [{ id: 'template_out', type: 'output', label: 'Template', dataType: 'image' }],
      color: stylestColors.accent,
    },
    // Asset Library
    {
      id: 'library_1',
      type: 'asset_library',
      title: 'Stylest Catalog',
      subtitle: '19 products',
      icon: '📦',
      x: 80,
      y: 380,
      inputs: [],
      outputs: [{ id: 'catalog_out', type: 'output', label: 'Catalog', dataType: 'any' }],
      color: '#8B5CF6',
    },
    // Joyann Swap Zone
    {
      id: 'zone_joyann',
      type: 'swap_zone',
      title: 'Joyann Section',
      subtitle: 'Busty Challenge',
      icon: '🎯',
      x: 320,
      y: 150,
      inputs: [{ id: 'template_in', type: 'input', label: 'Template', dataType: 'image' }],
      outputs: [{ id: 'zone_out', type: 'output', label: 'Zone', dataType: 'any' }],
      color: '#3B82F6',
    },
    // Product Select
    {
      id: 'product_1',
      type: 'product_select',
      title: 'STY192',
      subtitle: 'Grommet Tank',
      icon: '👗',
      x: 320,
      y: 330,
      inputs: [{ id: 'catalog_in', type: 'input', label: 'Catalog', dataType: 'any' }],
      outputs: [{ id: 'product_out', type: 'output', label: 'Product', dataType: 'any' }],
      color: '#EC4899',
    },
    // Colorway
    {
      id: 'colorway_1',
      type: 'colorway_select',
      title: 'Hot Pepper',
      subtitle: '',
      icon: '🎨',
      x: 540,
      y: 330,
      inputs: [{ id: 'product_in', type: 'input', label: 'Product', dataType: 'any' }],
      outputs: [{ id: 'styled_out', type: 'output', label: 'Styled', dataType: 'any' }],
      color: stylestColors.hotPepper,
    },
    // View Type
    {
      id: 'view_1',
      type: 'view_select',
      title: 'Flat Lay',
      subtitle: 'LAY_FRONT',
      icon: '📸',
      x: 540,
      y: 150,
      inputs: [
        { id: 'zone_in', type: 'input', label: 'Zone', dataType: 'any' },
        { id: 'asset_in', type: 'input', label: 'Asset', dataType: 'any' },
      ],
      outputs: [{ id: 'ready_out', type: 'output', label: 'Ready', dataType: 'any' }],
      color: '#10B981',
    },
    // Composite
    {
      id: 'composite_1',
      type: 'composite',
      title: 'Generate',
      subtitle: 'PNG Export',
      icon: '🖼️',
      x: 760,
      y: 200,
      inputs: [{ id: 'final_in', type: 'input', label: 'Final', dataType: 'any' }],
      outputs: [{ id: 'export_out', type: 'output', label: 'Export', dataType: 'image' }],
      color: stylestColors.accent,
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'template_1', fromPort: 'template_out', toNode: 'zone_joyann', toPort: 'template_in', animated: true },
    { id: 'conn_2', fromNode: 'library_1', fromPort: 'catalog_out', toNode: 'product_1', toPort: 'catalog_in', animated: true },
    { id: 'conn_3', fromNode: 'product_1', fromPort: 'product_out', toNode: 'colorway_1', toPort: 'product_in', animated: true },
    { id: 'conn_4', fromNode: 'zone_joyann', fromPort: 'zone_out', toNode: 'view_1', toPort: 'zone_in', animated: true },
    { id: 'conn_5', fromNode: 'colorway_1', fromPort: 'styled_out', toNode: 'view_1', toPort: 'asset_in', animated: true },
    { id: 'conn_6', fromNode: 'view_1', fromPort: 'ready_out', toNode: 'composite_1', toPort: 'final_in', animated: true },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [showPalette, setShowPalette] = useState(true)

  // Node templates for palette
  const nodeTemplates = [
    ...stylestNodes.triggers.map(t => ({
      type: t.id,
      title: t.name,
      icon: t.icon,
      category: 'Input',
      color: stylestColors.accent,
      inputs: [],
      outputs: [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...stylestNodes.zones.map(z => ({
      type: z.id,
      title: z.name,
      icon: z.icon,
      category: 'Zones',
      color: '#3B82F6',
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...stylestNodes.assets.map(a => ({
      type: a.id,
      title: a.name,
      icon: a.icon,
      category: 'Assets',
      color: '#EC4899',
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...stylestNodes.output.map(o => ({
      type: o.id,
      title: o.name,
      icon: o.icon,
      category: 'Output',
      color: '#10B981',
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: o.id === 'export_config' ? [] : [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
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
    <div className="relative w-full h-[700px] rounded-2xl overflow-hidden" style={{ border: `1px solid ${stylestColors.border}` }}>
      {/* Stylest Brand Header */}
      <div
        className="absolute top-0 left-0 right-0 z-20 px-6 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(180deg, ${stylestColors.surface} 0%, transparent 100%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ background: `linear-gradient(135deg, ${stylestColors.accent} 0%, ${stylestColors.hotPepper} 100%)`, color: 'white' }}
          >
            S
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: stylestColors.text }}>Stylest Email Studio</h2>
            <p className="text-xs" style={{ color: stylestColors.textDim }}>Asset Swap Automation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stylestFounders.map(founder => (
            <div
              key={founder.id}
              className="px-3 py-1 rounded-full text-xs"
              style={{ background: stylestColors.surfaceLight, color: stylestColors.textMuted }}
            >
              {founder.name}
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
            style={{ background: stylestColors.surface, borderRight: `1px solid ${stylestColors.border}` }}
          >
            <div className="flex-1 overflow-y-auto p-4">
              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="mb-5">
                  <div className="text-xs font-medium mb-2" style={{ color: stylestColors.textDim }}>{category}</div>
                  <div className="space-y-1">
                    {templates.map(template => (
                      <button
                        key={template.type}
                        onClick={() => handleAddNode(template)}
                        className="w-full p-2 rounded-lg text-left transition-all hover:scale-[1.02] flex items-center gap-2"
                        style={{ background: stylestColors.bg, border: `1px solid ${stylestColors.border}` }}
                      >
                        <span className="text-lg">{template.icon}</span>
                        <span className="text-sm" style={{ color: stylestColors.text }}>{template.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPalette(false)}
              className="p-2 text-xs border-t"
              style={{ borderColor: stylestColors.border, color: stylestColors.textMuted }}
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
          style={{ background: stylestColors.surface, color: stylestColors.textMuted, border: `1px solid ${stylestColors.border}` }}
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
          accentColor={stylestColors.accent}
        />
      </div>

      {/* Config Panel */}
      <AnimatePresence>
        {selectedNode && (
          <StylestNodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
          />
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl z-20"
        style={{ background: `${stylestColors.surface}ee`, border: `1px solid ${stylestColors.border}` }}
      >
        <button className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: stylestColors.textMuted }}>
          📋 Export Config
        </button>
        <div className="w-px h-6" style={{ background: stylestColors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: stylestColors.textMuted }}>
          👁️ Preview
        </button>
        <div className="w-px h-6" style={{ background: stylestColors.border }} />
        <button
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
          style={{ background: stylestColors.accent, color: stylestColors.text }}
        >
          🖼️ Generate Composite
        </button>
      </div>
    </div>
  )
}
