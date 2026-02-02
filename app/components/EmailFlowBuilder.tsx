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
}

// Node type definitions
const nodeTypes = {
  triggers: [
    { id: 'list_subscribe', name: 'List Subscribe', icon: '📥', description: 'When someone joins a list', color: colors.trigger },
    { id: 'tag_added', name: 'Tag Added', icon: '🏷️', description: 'When a tag is applied', color: colors.trigger },
    { id: 'purchase', name: 'Purchase Made', icon: '🛒', description: 'After a purchase', color: colors.trigger },
    { id: 'form_submit', name: 'Form Submitted', icon: '📝', description: 'Form submission trigger', color: colors.trigger },
    { id: 'link_click', name: 'Link Clicked', icon: '🔗', description: 'Email link clicked', color: colors.trigger },
    { id: 'date_based', name: 'Date/Anniversary', icon: '📅', description: 'Date-based trigger', color: colors.trigger },
  ],
  conditions: [
    { id: 'email_opened', name: 'Email Opened?', icon: '👁️', description: 'Check if opened', color: colors.condition },
    { id: 'link_clicked', name: 'Link Clicked?', icon: '🔗', description: 'Check if clicked', color: colors.condition },
    { id: 'has_tag', name: 'Has Tag?', icon: '🏷️', description: 'Check for tag', color: colors.condition },
    { id: 'purchased', name: 'Made Purchase?', icon: '💰', description: 'Check purchase history', color: colors.condition },
    { id: 'ab_split', name: 'A/B Split', icon: '⚡', description: 'Random split test', color: colors.condition },
    { id: 'time_based', name: 'Time of Day', icon: '⏰', description: 'Check current time', color: colors.condition },
  ],
  actions: [
    { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send an email', color: colors.action },
    { id: 'add_tag', name: 'Add Tag', icon: '🏷️', description: 'Apply a tag', color: colors.action },
    { id: 'remove_tag', name: 'Remove Tag', icon: '❌', description: 'Remove a tag', color: colors.action },
    { id: 'subscribe_list', name: 'Add to List', icon: '📋', description: 'Subscribe to list', color: colors.action },
    { id: 'notify_team', name: 'Notify Team', icon: '🔔', description: 'Send notification', color: colors.action },
    { id: 'webhook', name: 'Webhook', icon: '🌐', description: 'Call external API', color: colors.action },
  ],
  flow: [
    { id: 'delay', name: 'Wait/Delay', icon: '⏳', description: 'Wait before continuing', color: colors.delay },
    { id: 'goal_check', name: 'Goal Check', icon: '🎯', description: 'Exit if goal met', color: colors.delay },
    { id: 'end', name: 'End Flow', icon: '🏁', description: 'End automation', color: colors.delay },
  ],
}

// Create a workflow node from a node type
const createNode = (type: typeof nodeTypes.triggers[0], x: number, y: number, category: string): WorkflowNode => ({
  id: `${type.id}_${Date.now()}`,
  type: type.id,
  title: type.name,
  subtitle: type.description,
  icon: type.icon,
  x,
  y,
  width: 200,
  height: 80,
  inputs: category === 'triggers' ? [] : [{ id: 'in', type: 'input', label: 'Input', dataType: 'any' }],
  outputs: category === 'flow' && type.id === 'end' ? [] : [{ id: 'out', type: 'output', label: 'Output', dataType: 'any' }],
  data: {},
  color: type.color,
  category,
})

export default function EmailFlowBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [flowName, setFlowName] = useState('New Email Flow')
  const [isSaving, setIsSaving] = useState(false)
  const [savedFlows, setSavedFlows] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<'triggers' | 'conditions' | 'actions' | 'flow'>('triggers')

  // Load saved flows from localStorage
  useEffect(() => {
    const flows = localStorage.getItem('emailFlows')
    if (flows) {
      setSavedFlows(Object.keys(JSON.parse(flows)))
    }
  }, [])

  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setNodes(newNodes)
  }, [])

  const handleConnectionsChange = useCallback((newConnections: NodeConnection[]) => {
    setConnections(newConnections)
  }, [])

  const handleNodeSelect = useCallback((node: WorkflowNode | null) => {
    setSelectedNode(node)
  }, [])

  const handleDragStart = (e: React.DragEvent, nodeType: typeof nodeTypes.triggers[0], category: string) => {
    e.dataTransfer.setData('nodeType', JSON.stringify({ ...nodeType, category }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('nodeType')
    if (!data) return

    const { category, ...nodeType } = JSON.parse(data)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - 100
    const y = e.clientY - rect.top - 40

    const newNode = createNode(nodeType, x, y, category)
    setNodes(prev => [...prev, newNode])
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    const flowData = { nodes, connections, name: flowName, updatedAt: new Date().toISOString() }
    const flows = JSON.parse(localStorage.getItem('emailFlows') || '{}')
    flows[flowName] = flowData
    localStorage.setItem('emailFlows', JSON.stringify(flows))
    setSavedFlows(Object.keys(flows))
    setTimeout(() => setIsSaving(false), 500)
  }

  const handleLoad = (name: string) => {
    const flows = JSON.parse(localStorage.getItem('emailFlows') || '{}')
    if (flows[name]) {
      setNodes(flows[name].nodes)
      setConnections(flows[name].connections)
      setFlowName(name)
    }
  }

  const handleExport = () => {
    const flowData = { nodes, connections, name: flowName, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${flowName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setNodes([])
    setConnections([])
    setSelectedNode(null)
  }

  const categories = [
    { key: 'triggers', label: 'Triggers', color: colors.trigger },
    { key: 'conditions', label: 'Conditions', color: colors.condition },
    { key: 'actions', label: 'Actions', color: colors.action },
    { key: 'flow', label: 'Flow', color: colors.delay },
  ] as const

  return (
    <div className="relative w-full h-[700px] rounded-2xl overflow-hidden flex" style={{ border: '1px solid #2A2A3A', background: colors.bg }}>
      {/* Left Sidebar - Node Palette */}
      <div className="w-64 border-r flex flex-col" style={{ borderColor: colors.border, background: colors.surface }}>
        <div className="p-4 border-b" style={{ borderColor: colors.border }}>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium"
            style={{ background: colors.surfaceLight, border: `1px solid ${colors.border}`, color: colors.text }}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex border-b" style={{ borderColor: colors.border }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="flex-1 py-2 text-xs font-medium transition-colors"
              style={{
                color: activeCategory === cat.key ? cat.color : colors.textMuted,
                borderBottom: activeCategory === cat.key ? `2px solid ${cat.color}` : '2px solid transparent',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Node List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {nodeTypes[activeCategory].map(node => (
            <div
              key={node.id}
              draggable
              onDragStart={(e) => handleDragStart(e, node, activeCategory)}
              className="p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
              style={{ background: colors.surfaceLight, border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{node.icon}</span>
                <div>
                  <div className="text-sm font-medium" style={{ color: colors.text }}>{node.name}</div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>{node.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Saved Flows */}
        {savedFlows.length > 0 && (
          <div className="border-t p-3" style={{ borderColor: colors.border }}>
            <div className="text-xs font-medium mb-2" style={{ color: colors.textMuted }}>Saved Flows</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {savedFlows.map(name => (
                <button
                  key={name}
                  onClick={() => handleLoad(name)}
                  className="w-full text-left px-2 py-1 rounded text-xs truncate hover:bg-white/5"
                  style={{ color: colors.textDim }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div
        className="flex-1 relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <NodeWorkflowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={handleNodesChange}
          onConnectionsChange={handleConnectionsChange}
          onNodeSelect={handleNodeSelect}
          selectedNodeId={selectedNode?.id}
          accentColor={colors.email}
        />

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <div className="text-lg font-medium" style={{ color: colors.text }}>Drag nodes here to build your flow</div>
              <div className="text-sm mt-2" style={{ color: colors.textMuted }}>Start with a trigger from the left panel</div>
            </div>
          </div>
        )}

        {/* Bottom Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{ background: colors.email, color: 'white' }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: colors.text }}
          >
            Export
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: colors.textMuted }}
          >
            Clear
          </button>
          <div className="w-px h-4" style={{ background: colors.border }} />
          <span className="text-xs" style={{ color: colors.textMuted }}>{nodes.length} nodes</span>
        </div>
      </div>

      {/* Right Panel - Node Config */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l overflow-hidden"
            style={{ borderColor: colors.border, background: colors.surface }}
          >
            <div className="p-4 w-[280px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedNode.icon}</span>
                  <span className="font-medium" style={{ color: colors.text }}>{selectedNode.title}</span>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Node ID</label>
                  <div className="px-3 py-2 rounded text-xs font-mono" style={{ background: colors.surfaceLight, color: colors.textDim }}>
                    {selectedNode.id}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Type</label>
                  <div className="px-3 py-2 rounded text-sm" style={{ background: colors.surfaceLight, color: colors.text }}>
                    {selectedNode.type}
                  </div>
                </div>

                {selectedNode.type === 'send_email' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Subject Line</label>
                      <input
                        type="text"
                        placeholder="Enter subject..."
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{ background: colors.surfaceLight, border: `1px solid ${colors.border}`, color: colors.text }}
                        onChange={(e) => {
                          const updated = nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, subject: e.target.value } } : n)
                          setNodes(updated)
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Template</label>
                      <select
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{ background: colors.surfaceLight, border: `1px solid ${colors.border}`, color: colors.text }}
                      >
                        <option>Welcome Email</option>
                        <option>Promotional</option>
                        <option>Follow-up</option>
                        <option>Abandoned Cart</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedNode.type === 'delay' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Wait Duration</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        defaultValue={1}
                        min={1}
                        className="flex-1 px-3 py-2 rounded text-sm"
                        style={{ background: colors.surfaceLight, border: `1px solid ${colors.border}`, color: colors.text }}
                      />
                      <select
                        className="px-3 py-2 rounded text-sm"
                        style={{ background: colors.surfaceLight, border: `1px solid ${colors.border}`, color: colors.text }}
                      >
                        <option>Minutes</option>
                        <option>Hours</option>
                        <option>Days</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'ab_split' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Split Ratio</label>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      defaultValue={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: colors.textMuted }}>
                      <span>Path A: 50%</span>
                      <span>Path B: 50%</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setNodes(nodes.filter(n => n.id !== selectedNode.id))
                    setConnections(connections.filter(c => c.fromNode !== selectedNode.id && c.toNode !== selectedNode.id))
                    setSelectedNode(null)
                  }}
                  className="w-full py-2 rounded text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Delete Node
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
