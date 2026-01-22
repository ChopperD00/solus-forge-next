'use client'

import { useState } from 'react'
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
  automation: '#E85D04',
}

// Trigger types
const triggers = [
  { id: 'manual', name: 'Manual Trigger', icon: '👆', description: 'Start manually', category: 'Basic' },
  { id: 'schedule', name: 'Schedule', icon: '⏰', description: 'Run on schedule', category: 'Basic' },
  { id: 'webhook', name: 'Webhook', icon: '🔗', description: 'HTTP endpoint trigger', category: 'Basic' },
  { id: 'file_watch', name: 'File Watch', icon: '📁', description: 'On file changes', category: 'Events' },
  { id: 'email_receive', name: 'Email Received', icon: '📧', description: 'On new email', category: 'Events' },
  { id: 'form_submit', name: 'Form Submit', icon: '📝', description: 'On form submission', category: 'Events' },
]

// AI/LLM nodes - SOLUS FORGE Agent Network
const aiNodes = [
  { id: 'solus', name: 'Solus', icon: '🔮', description: 'Strategic Oversight (Opus)' },
  { id: 'quintus', name: 'Quintus', icon: '📐', description: 'Planner & Optimizer (Haiku)' },
  { id: 'trion', name: 'Trion', icon: '🔍', description: 'Research & Discovery' },
  { id: 'lathe', name: 'Lathe', icon: '⚖️', description: 'Quality Control (Sonnet)' },
  { id: 'alchemist', name: 'Alchemist', icon: '✨', description: 'Creative Generation (Gemini)' },
  { id: 'cortex', name: 'Cortex', icon: '🧠', description: 'Memory & Context (NotebookLM)' },
]

// Integration nodes
const integrations = [
  { id: 'slack', name: 'Slack', icon: '💬', description: 'Send messages', category: 'Communication' },
  { id: 'email', name: 'Email', icon: '📧', description: 'Send emails', category: 'Communication' },
  { id: 'discord', name: 'Discord', icon: '🎮', description: 'Discord bot', category: 'Communication' },
  { id: 'notion', name: 'Notion', icon: '📓', description: 'Notion pages', category: 'Productivity' },
  { id: 'airtable', name: 'Airtable', icon: '📊', description: 'Database ops', category: 'Productivity' },
  { id: 'sheets', name: 'Google Sheets', icon: '📗', description: 'Spreadsheets', category: 'Productivity' },
  { id: 'drive', name: 'Google Drive', icon: '📁', description: 'File storage', category: 'Storage' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', description: 'Cloud files', category: 'Storage' },
  { id: 's3', name: 'AWS S3', icon: '☁️', description: 'Object storage', category: 'Storage' },
  { id: 'github', name: 'GitHub', icon: '🐙', description: 'Code repos', category: 'Dev' },
  { id: 'linear', name: 'Linear', icon: '📋', description: 'Issue tracking', category: 'Dev' },
  { id: 'figma', name: 'Figma', icon: '🎨', description: 'Design files', category: 'Design' },
]

// Logic nodes
const logicNodes = [
  { id: 'condition', name: 'If/Else', icon: '🔀', description: 'Conditional branch' },
  { id: 'switch', name: 'Switch', icon: '🔃', description: 'Multi-way branch' },
  { id: 'loop', name: 'Loop', icon: '🔁', description: 'Iterate items' },
  { id: 'delay', name: 'Delay', icon: '⏳', description: 'Wait time' },
  { id: 'parallel', name: 'Parallel', icon: '⚡', description: 'Run in parallel' },
  { id: 'merge', name: 'Merge', icon: '🔗', description: 'Combine branches' },
]

// Data nodes
const dataNodes = [
  { id: 'json_parse', name: 'Parse JSON', icon: '📋', description: 'Parse JSON data' },
  { id: 'json_build', name: 'Build JSON', icon: '🔨', description: 'Create JSON' },
  { id: 'text_template', name: 'Text Template', icon: '📝', description: 'Template strings' },
  { id: 'http_request', name: 'HTTP Request', icon: '🌐', description: 'API calls' },
  { id: 'code', name: 'Code Block', icon: '💻', description: 'Custom code' },
  { id: 'filter', name: 'Filter', icon: '🔍', description: 'Filter data' },
  { id: 'transform', name: 'Transform', icon: '🔄', description: 'Map/transform' },
]

// Node templates
const nodeTemplates = [
  // Triggers
  ...triggers.map(t => ({
    type: `trigger_${t.id}`,
    title: t.name,
    icon: t.icon,
    category: 'Triggers',
    inputs: [],
    outputs: [{ id: 'trigger_out', type: 'output' as const, label: 'Trigger', dataType: 'any' as const }],
  })),
  // AI Nodes
  ...aiNodes.map(ai => ({
    type: `ai_${ai.id}`,
    title: ai.name,
    icon: ai.icon,
    category: 'AI',
    inputs: [
      { id: 'prompt_in', type: 'input' as const, label: 'Prompt', dataType: 'text' as const },
      { id: 'context_in', type: 'input' as const, label: 'Context', dataType: 'any' as const },
    ],
    outputs: [{ id: 'response_out', type: 'output' as const, label: 'Response', dataType: 'text' as const }],
  })),
  // Integrations
  ...integrations.map(int => ({
    type: `int_${int.id}`,
    title: int.name,
    icon: int.icon,
    category: 'Integrations',
    inputs: [{ id: 'data_in', type: 'input' as const, label: 'Data', dataType: 'any' as const }],
    outputs: [{ id: 'result_out', type: 'output' as const, label: 'Result', dataType: 'any' as const }],
  })),
  // Logic
  ...logicNodes.map(logic => ({
    type: `logic_${logic.id}`,
    title: logic.name,
    icon: logic.icon,
    category: 'Logic',
    inputs: [{ id: 'input', type: 'input' as const, label: 'Input', dataType: 'any' as const }],
    outputs: logic.id === 'condition' || logic.id === 'switch'
      ? [
          { id: 'true_out', type: 'output' as const, label: 'True', dataType: 'any' as const },
          { id: 'false_out', type: 'output' as const, label: 'False', dataType: 'any' as const },
        ]
      : [{ id: 'output', type: 'output' as const, label: 'Output', dataType: 'any' as const }],
  })),
  // Data
  ...dataNodes.map(data => ({
    type: `data_${data.id}`,
    title: data.name,
    icon: data.icon,
    category: 'Data',
    inputs: [{ id: 'input', type: 'input' as const, label: 'Input', dataType: 'any' as const }],
    outputs: [{ id: 'output', type: 'output' as const, label: 'Output', dataType: 'any' as const }],
  })),
  // Output
  {
    type: 'output_log',
    title: 'Log Output',
    icon: '📋',
    category: 'Output',
    inputs: [{ id: 'data_in', type: 'input' as const, label: 'Data', dataType: 'any' as const }],
    outputs: [],
  },
  {
    type: 'output_response',
    title: 'Return Response',
    icon: '↩️',
    category: 'Output',
    inputs: [{ id: 'data_in', type: 'input' as const, label: 'Data', dataType: 'any' as const }],
    outputs: [],
  },
]

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}

function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [prompt, setPrompt] = useState(node?.data?.prompt || '')
  const [code, setCode] = useState(node?.data?.code || '')
  const [config, setConfig] = useState<Record<string, string>>(node?.data?.config || {})

  if (!node) return null

  const handleSave = () => {
    onUpdate(node.id, { prompt, code, config })
    onClose()
  }

  const isAINode = node.type.startsWith('ai_')
  const isCodeNode = node.type === 'data_code'
  const isIntegration = node.type.startsWith('int_')

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

        {/* AI Node config */}
        {isAINode && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>System Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-3 rounded-xl text-sm resize-none font-mono"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              placeholder="You are a helpful assistant..."
            />
          </div>
        )}

        {/* Code node config */}
        {isCodeNode && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>JavaScript Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-48 p-3 rounded-xl text-sm resize-none font-mono"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              placeholder="// Access input data via `input`
// Return output via `return`

const result = input.map(x => x * 2);
return result;"
            />
          </div>
        )}

        {/* Integration config */}
        {isIntegration && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>API Key / Token</label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full p-2 rounded-lg text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="Enter API key..."
              />
            </div>
            {node.type === 'int_slack' && (
              <div>
                <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>Channel</label>
                <input
                  value={config.channel || ''}
                  onChange={(e) => setConfig({ ...config, channel: e.target.value })}
                  className="w-full p-2 rounded-lg text-sm"
                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                  placeholder="#general"
                />
              </div>
            )}
            {node.type === 'int_email' && (
              <>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>To</label>
                  <input
                    value={config.to || ''}
                    onChange={(e) => setConfig({ ...config, to: e.target.value })}
                    className="w-full p-2 rounded-lg text-sm"
                    style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>Subject</label>
                  <input
                    value={config.subject || ''}
                    onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                    className="w-full p-2 rounded-lg text-sm"
                    style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                    placeholder="Email subject"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Schedule config */}
        {node.type === 'trigger_schedule' && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Cron Expression</label>
            <input
              value={config.cron || ''}
              onChange={(e) => setConfig({ ...config, cron: e.target.value })}
              className="w-full p-2 rounded-lg text-sm font-mono"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              placeholder="0 9 * * 1-5 (Mon-Fri 9am)"
            />
            <div className="mt-2 text-xs" style={{ color: colors.textDim }}>
              Presets:
              <button onClick={() => setConfig({ ...config, cron: '0 * * * *' })} className="ml-2 underline">Hourly</button>
              <button onClick={() => setConfig({ ...config, cron: '0 9 * * *' })} className="ml-2 underline">Daily 9am</button>
              <button onClick={() => setConfig({ ...config, cron: '0 9 * * 1' })} className="ml-2 underline">Weekly Mon</button>
            </div>
          </div>
        )}

        {/* Condition config */}
        {node.type === 'logic_condition' && (
          <div className="mb-4">
            <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Condition (JavaScript)</label>
            <input
              value={config.condition || ''}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              className="w-full p-2 rounded-lg text-sm font-mono"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              placeholder="input.status === 'success'"
            />
          </div>
        )}

        {/* HTTP Request config */}
        {node.type === 'data_http_request' && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>Method</label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => setConfig({ ...config, method: e.target.value })}
                className="w-full p-2 rounded-lg text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.textMuted }}>URL</label>
              <input
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full p-2 rounded-lg text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
          </div>
        )}

        <button onClick={handleSave} className="w-full py-3 rounded-xl font-medium" style={{ background: colors.automation, color: colors.text }}>
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function AutomationNodeWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'trigger_1',
      type: 'trigger_webhook',
      title: 'Webhook',
      subtitle: 'HTTP Endpoint',
      icon: '🔗',
      x: 100,
      y: 200,
      inputs: [],
      outputs: [{ id: 'trigger_out', type: 'output', label: 'Trigger', dataType: 'any' }],
      color: '#F39C12',
    },
    {
      id: 'ai_1',
      type: 'ai_solus',
      title: 'Solus',
      subtitle: 'Strategic Processing',
      icon: '🔮',
      x: 350,
      y: 200,
      inputs: [
        { id: 'prompt_in', type: 'input', label: 'Prompt', dataType: 'text' },
        { id: 'context_in', type: 'input', label: 'Context', dataType: 'any' },
      ],
      outputs: [{ id: 'response_out', type: 'output', label: 'Response', dataType: 'text' }],
      color: '#8B5CF6',
    },
    {
      id: 'slack_1',
      type: 'int_slack',
      title: 'Slack',
      subtitle: 'Send Message',
      icon: '💬',
      x: 600,
      y: 200,
      inputs: [{ id: 'data_in', type: 'input', label: 'Data', dataType: 'any' }],
      outputs: [{ id: 'result_out', type: 'output', label: 'Result', dataType: 'any' }],
      color: '#4A154B',
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'trigger_1', fromPort: 'trigger_out', toNode: 'ai_1', toPort: 'context_in', animated: true },
    { id: 'conn_2', fromNode: 'ai_1', fromPort: 'response_out', toNode: 'slack_1', toPort: 'data_in', animated: true },
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
      color: template.category === 'Triggers' ? '#F39C12'
        : template.category === 'AI' ? '#D4A574'
        : template.category === 'Integrations' ? '#3498DB'
        : template.category === 'Logic' ? '#9B59B6'
        : template.category === 'Data' ? '#1ABC9C'
        : '#6BCB77',
    }
    setNodes([...nodes, newNode])
  }

  const handleUpdateNode = (nodeId: string, data: Record<string, any>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
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
                <h3 className="font-medium text-sm" style={{ color: colors.text }}>Automation Nodes</h3>
                <button onClick={() => setShowPalette(false)} className="text-xs" style={{ color: colors.textMuted }}>Hide</button>
              </div>

              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="mb-4">
                  <div className="text-xs font-medium mb-2" style={{ color: colors.textDim }}>{category}</div>
                  <div className="grid grid-cols-2 gap-1">
                    {templates.slice(0, 6).map(template => (
                      <button
                        key={template.type}
                        onClick={() => handleAddNode(template)}
                        className="p-2 rounded-lg text-left transition-all hover:scale-[1.02]"
                        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg">{template.icon}</span>
                          <span className="text-[10px] text-center" style={{ color: colors.text }}>{template.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {templates.length > 6 && (
                    <button className="w-full mt-1 text-xs py-1" style={{ color: colors.textDim }}>
                      + {templates.length - 6} more
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showPalette && (
        <button onClick={() => setShowPalette(true)} className="absolute left-4 top-4 z-20 px-3 py-2 rounded-xl text-sm"
          style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}>+ Add Node</button>
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
          accentColor={colors.automation}
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
        <button className="px-3 py-1.5 rounded-lg text-sm" style={{ color: colors.textMuted }}>🗑️ Delete</button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm" style={{ color: colors.textMuted }}>💾 Save</button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm" style={{ color: colors.textMuted }}>🧪 Test</button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-4 py-1.5 rounded-lg text-sm font-medium" style={{ background: colors.automation, color: colors.text }}>
          ▶️ Deploy
        </button>
      </div>
    </div>
  )
}
