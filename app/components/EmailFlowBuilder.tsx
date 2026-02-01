'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NodeWorkflowCanvas, { WorkflowNode, NodeConnection } from './NodeWorkflowCanvas'

// Brand-aligned color palette
const colors = {
  bg: '#0A0A0F',
  surface: '#12121A',
  surfaceLight: '#1A1A24',
  border: '#2A2A3A',
  text: '#FFFFFF',
  textDim: '#888899',
  textMuted: '#666677',
  email: '#7C3AED',
  trigger: '#10B981',
  condition: '#F59E0B',
  action: '#3B82F6',
  delay: '#8B5CF6',
  gold: '#D4AF37',
  gradient: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #10B981 100%)',
}

// Email flow node types
const triggerNodes = [
  { id: 'list_subscribe', name: 'List Subscribe', icon: '📥', description: 'When someone joins a list' },
  { id: 'tag_added', name: 'Tag Added', icon: '🏷️', description: 'When a tag is applied' },
  { id: 'purchase', name: 'Purchase Made', icon: '🛒', description: 'After a purchase' },
  { id: 'form_submit', name: 'Form Submitted', icon: '📝', description: 'Form submission trigger' },
  { id: 'link_click', name: 'Link Clicked', icon: '🔗', description: 'Email link clicked' },
  { id: 'date_based', name: 'Date/Anniversary', icon: '📅', description: 'Date-based trigger' },
]

const conditionNodes = [
  { id: 'email_opened', name: 'Email Opened?', icon: '👁️', description: 'Check if opened' },
  { id: 'link_clicked', name: 'Link Clicked?', icon: '🔗', description: 'Check if clicked' },
  { id: 'has_tag', name: 'Has Tag?', icon: '🏷️', description: 'Check for tag' },
  { id: 'purchased', name: 'Made Purchase?', icon: '💰', description: 'Check purchase history' },
  { id: 'ab_split', name: 'A/B Split', icon: '⚡', description: 'Random split test' },
  { id: 'time_based', name: 'Time of Day', icon: '⏰', description: 'Check current time' },
]

const actionNodes = [
  { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send an email' },
  { id: 'add_tag', name: 'Add Tag', icon: '🏷️', description: 'Apply a tag' },
  { id: 'remove_tag', name: 'Remove Tag', icon: '❌', description: 'Remove a tag' },
  { id: 'subscribe_list', name: 'Add to List', icon: '📋', description: 'Subscribe to list' },
  { id: 'notify_team', name: 'Notify Team', icon: '🔔', description: 'Send notification' },
  { id: 'webhook', name: 'Webhook', icon: '🌐', description: 'Call external API' },
]

const flowNodes = [
  { id: 'delay', name: 'Wait/Delay', icon: '⏳', description: 'Wait before continuing' },
  { id: 'goal_check', name: 'Goal Check', icon: '🎯', description: 'Exit if goal met' },
  { id: 'end', name: 'End Flow', icon: '🏁', description: 'End automation' },
]

// Pre-built templates
const flowTemplates = [
  {
    id: 'welcome_series',
    name: 'Welcome Series',
    description: '3-email welcome sequence for new subscribers',
    emails: 3,
    duration: '7 days',
  },
  {
    id: 'abandoned_cart',
    name: 'Abandoned Cart',
    description: 'Recover lost sales with timed reminders',
    emails: 3,
    duration: '3 days',
  },
  {
    id: 'nurture_sequence',
    name: 'Lead Nurture',
    description: 'Build relationships with potential customers',
    emails: 5,
    duration: '14 days',
  },
  {
    id: 'post_purchase',
    name: 'Post-Purchase',
    description: 'Delight customers after their purchase',
    emails: 4,
    duration: '14 days',
  },
]

// Node Configuration Panel
function NodeConfigPanel({
  node,
  onClose,
  onUpdate
}: {
  node: WorkflowNode
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}) {
  const [config, setConfig] = useState<Record<string, any>>(node.data || {})

  const handleSave = () => {
    onUpdate(node.id, config)
    onClose()
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="absolute right-0 top-0 bottom-0 w-80 z-30 flex flex-col"
      style={{ background: colors.surface, borderLeft: `1px solid ${colors.border}` }}
    >
      <div className="p-4 border-b" style={{ borderColor: colors.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{node.icon}</span>
            <div>
              <div className="font-medium" style={{ color: colors.text }}>{node.title}</div>
              <div className="text-xs" style={{ color: colors.textDim }}>{node.subtitle}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ color: colors.textMuted }}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Send Email Config */}
        {node.type.includes('send_email') && (
          <>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Email Subject</label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="Enter subject line..."
              />
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>From Name</label>
              <input
                type="text"
                value={config.fromName || ''}
                onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="Sender name..."
              />
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Template</label>
              <select
                value={config.template || ''}
                onChange={(e) => setConfig({ ...config, template: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="">Select template...</option>
                <option value="welcome">Welcome Email</option>
                <option value="promotional">Promotional</option>
                <option value="newsletter">Newsletter</option>
                <option value="transactional">Transactional</option>
              </select>
            </div>
          </>
        )}

        {/* Delay Config */}
        {node.type.includes('delay') && (
          <div>
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Wait Duration</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={config.delayValue || 1}
                onChange={(e) => setConfig({ ...config, delayValue: parseInt(e.target.value) })}
                className="w-20 p-3 rounded-xl text-sm text-center"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                min="1"
              />
              <select
                value={config.delayUnit || 'days'}
                onChange={(e) => setConfig({ ...config, delayUnit: e.target.value })}
                className="flex-1 p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { value: 1, unit: 'hours' },
                { value: 1, unit: 'days' },
                { value: 3, unit: 'days' },
                { value: 1, unit: 'weeks' },
              ].map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setConfig({ ...config, delayValue: preset.value, delayUnit: preset.unit })}
                  className="p-2 rounded-lg text-xs"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.textMuted }}
                >
                  {preset.value} {preset.unit.slice(0, -1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Config */}
        {(node.type.includes('add_tag') || node.type.includes('has_tag')) && (
          <div>
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Tag Name</label>
            <input
              type="text"
              value={config.tagName || ''}
              onChange={(e) => setConfig({ ...config, tagName: e.target.value })}
              className="w-full p-3 rounded-xl text-sm"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              placeholder="Enter tag name..."
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {['VIP', 'Engaged', 'Hot Lead', 'Customer', 'Subscriber'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setConfig({ ...config, tagName: tag })}
                  className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
                  style={{ background: colors.surfaceLight, color: colors.textMuted }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Condition Config */}
        {node.type.includes('condition') && (
          <div>
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Check Condition</label>
            <div className="p-3 rounded-xl" style={{ background: colors.bg + '88' }}>
              <div className="text-sm" style={{ color: colors.text }}>
                This node splits the flow based on the condition
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: colors.trigger }} />
                  <span className="text-xs" style={{ color: colors.textDim }}>Yes path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF5555' }} />
                  <span className="text-xs" style={{ color: colors.textDim }}>No path</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* A/B Split Config */}
        {node.type.includes('ab_split') && (
          <div>
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Split Percentage</label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="10"
                max="90"
                value={config.splitPercent || 50}
                onChange={(e) => setConfig({ ...config, splitPercent: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-mono w-16" style={{ color: colors.text }}>
                {config.splitPercent || 50}%
              </span>
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: colors.textDim }}>
              <span>Variant A: {config.splitPercent || 50}%</span>
              <span>Variant B: {100 - (config.splitPercent || 50)}%</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-medium mt-6 transition-all hover:scale-[1.02]"
          style={{ background: colors.email, color: colors.text }}
        >
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function EmailFlowBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    // Default starter flow
    {
      id: 'trigger_1',
      type: 'trigger_list_subscribe',
      title: 'List Subscribe',
      subtitle: 'Newsletter signup',
      icon: '📥',
      x: 100,
      y: 280,
      inputs: [],
      outputs: [{ id: 'trigger_out', type: 'output', label: 'Contact', dataType: 'any' }],
      color: colors.trigger,
    },
    {
      id: 'email_1',
      type: 'action_send_email',
      title: 'Welcome Email',
      subtitle: 'Immediate',
      icon: '📧',
      x: 340,
      y: 280,
      inputs: [{ id: 'contact_in', type: 'input', label: 'Contact', dataType: 'any' }],
      outputs: [{ id: 'sent_out', type: 'output', label: 'Sent', dataType: 'any' }],
      color: colors.email,
    },
    {
      id: 'delay_1',
      type: 'flow_delay',
      title: 'Wait 2 Days',
      subtitle: '',
      icon: '⏳',
      x: 580,
      y: 280,
      inputs: [{ id: 'in', type: 'input', label: 'In', dataType: 'any' }],
      outputs: [{ id: 'out', type: 'output', label: 'Out', dataType: 'any' }],
      color: colors.delay,
    },
    {
      id: 'condition_1',
      type: 'condition_email_opened',
      title: 'Opened Email?',
      subtitle: 'Check engagement',
      icon: '👁️',
      x: 820,
      y: 280,
      inputs: [{ id: 'in', type: 'input', label: 'In', dataType: 'any' }],
      outputs: [
        { id: 'yes_out', type: 'output', label: 'Yes', dataType: 'any' },
        { id: 'no_out', type: 'output', label: 'No', dataType: 'any' },
      ],
      color: colors.condition,
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'trigger_1', fromPort: 'trigger_out', toNode: 'email_1', toPort: 'contact_in', animated: true },
    { id: 'conn_2', fromNode: 'email_1', fromPort: 'sent_out', toNode: 'delay_1', toPort: 'in', animated: true },
    { id: 'conn_3', fromNode: 'delay_1', fromPort: 'out', toNode: 'condition_1', toPort: 'in', animated: true },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(true)
  const [activeTab, setActiveTab] = useState<'nodes' | 'templates'>('nodes')

  // Delete node handler
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

  // Build node templates from definitions
  const nodeTemplates = [
    ...triggerNodes.map(t => ({
      type: `trigger_${t.id}`,
      title: t.name,
      icon: t.icon,
      description: t.description,
      category: 'Triggers',
      color: colors.trigger,
      inputs: [],
      outputs: [{ id: 'trigger_out', type: 'output' as const, label: 'Contact', dataType: 'any' as const }],
    })),
    ...conditionNodes.map(c => ({
      type: `condition_${c.id}`,
      title: c.name,
      icon: c.icon,
      description: c.description,
      category: 'Conditions',
      color: colors.condition,
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [
        { id: 'yes_out', type: 'output' as const, label: 'Yes', dataType: 'any' as const },
        { id: 'no_out', type: 'output' as const, label: 'No', dataType: 'any' as const },
      ],
    })),
    ...actionNodes.map(a => ({
      type: `action_${a.id}`,
      title: a.name,
      icon: a.icon,
      description: a.description,
      category: 'Actions',
      color: a.id === 'send_email' ? colors.email : colors.action,
      inputs: [{ id: 'contact_in', type: 'input' as const, label: 'Contact', dataType: 'any' as const }],
      outputs: [{ id: 'sent_out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...flowNodes.map(f => ({
      type: `flow_${f.id}`,
      title: f.name,
      icon: f.icon,
      description: f.description,
      category: 'Flow',
      color: colors.delay,
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: f.id === 'end' ? [] : [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
  ]

  const handleAddNode = (template: typeof nodeTemplates[0]) => {
    const newNode: WorkflowNode = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
      subtitle: template.description,
      icon: template.icon,
      x: 400 + Math.random() * 100,
      y: 280 + (Math.random() - 0.5) * 100,
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
    <div className="relative w-full h-[700px] rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 h-14 z-30 flex items-center justify-between px-4"
        style={{ background: `linear-gradient(180deg, ${colors.surface} 0%, ${colors.surface}00 100%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: colors.email + '22' }}
          >
            📧
          </div>
          <div>
            <div className="font-medium" style={{ color: colors.text }}>Email Flow Builder</div>
            <div className="text-xs" style={{ color: colors.textDim }}>Visual automation editor</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: colors.surfaceLight, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            Save Draft
          </button>
          <button
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: colors.email, color: colors.text }}
          >
            Publish Flow
          </button>
        </div>
      </div>

      {/* Node Palette */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="absolute left-0 top-14 bottom-0 w-72 z-20 flex flex-col"
            style={{ background: colors.surface, borderRight: `1px solid ${colors.border}` }}
          >
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setActiveTab('nodes')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'nodes' ? '' : 'opacity-50'}`}
                style={{ color: colors.text, background: activeTab === 'nodes' ? colors.surfaceLight : 'transparent' }}
              >
                Nodes
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'templates' ? '' : 'opacity-50'}`}
                style={{ color: colors.text, background: activeTab === 'templates' ? colors.surfaceLight : 'transparent' }}
              >
                Templates
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'nodes' ? (
                <>
                  {Object.entries(templatesByCategory).map(([category, templates]) => (
                    <div key={category} className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: category === 'Triggers' ? colors.trigger
                              : category === 'Conditions' ? colors.condition
                              : category === 'Actions' ? colors.action
                              : colors.delay
                          }}
                        />
                        <span className="text-xs font-medium" style={{ color: colors.textDim }}>{category}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {templates.map(template => (
                          <button
                            key={template.type}
                            onClick={() => handleAddNode(template)}
                            className="p-2 rounded-lg text-left transition-all hover:scale-[1.02] hover:ring-1"
                            style={{
                              background: colors.bg,
                              border: `1px solid ${colors.border}`,
                              '--tw-ring-color': template.color,
                            } as React.CSSProperties}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-lg">{template.icon}</span>
                              <span className="text-[10px] text-center leading-tight" style={{ color: colors.text }}>{template.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs mb-4" style={{ color: colors.textDim }}>
                    Start with a pre-built automation template
                  </p>
                  {flowTemplates.map(template => (
                    <button
                      key={template.id}
                      className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <div className="font-medium text-sm mb-1" style={{ color: colors.text }}>{template.name}</div>
                      <div className="text-xs mb-2" style={{ color: colors.textDim }}>{template.description}</div>
                      <div className="flex gap-3 text-xs" style={{ color: colors.textMuted }}>
                        <span>📧 {template.emails} emails</span>
                        <span>⏱️ {template.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPalette(false)}
              className="p-2 text-xs border-t"
              style={{ borderColor: colors.border, color: colors.textMuted }}
            >
              ← Hide Panel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showPalette && (
        <motion.button
          onClick={() => setShowPalette(true)}
          className="absolute left-4 top-20 z-20 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${colors.email} 0%, #2563EB 100%)`,
            color: '#fff',
            boxShadow: `0 4px 20px ${colors.email}44`,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ fontSize: '18px' }}>➕</span> Add Node
        </motion.button>
      )}

      {/* Canvas */}
      <div className={`absolute top-14 bottom-0 right-0 ${showPalette ? 'left-72' : 'left-0'}`}>
        <NodeWorkflowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
          onNodeSelect={(node) => setSelectedNodeId(node?.id || null)}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNodeId}
          accentColor={colors.email}
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

      {/* Stats Bar */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-xl z-10"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📧</span>
          <div>
            <div className="text-xs" style={{ color: colors.textDim }}>Nodes</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>{nodes.length}</div>
          </div>
        </div>
        <div className="w-px h-8" style={{ background: colors.border }} />
        <div className="flex items-center gap-2">
          <span className="text-lg">🔗</span>
          <div>
            <div className="text-xs" style={{ color: colors.textDim }}>Connections</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>{connections.length}</div>
          </div>
        </div>
        <div className="w-px h-8" style={{ background: colors.border }} />
        <button
          onClick={() => selectedNodeId && handleDeleteNode(selectedNodeId)}
          disabled={!selectedNodeId}
          className="px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{
            color: selectedNodeId ? '#FF5555' : colors.textDim,
            background: selectedNodeId ? '#FF555515' : 'transparent',
            cursor: selectedNodeId ? 'pointer' : 'not-allowed',
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}
