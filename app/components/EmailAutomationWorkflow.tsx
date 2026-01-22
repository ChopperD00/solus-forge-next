'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NodeWorkflowCanvas, { WorkflowNode, NodeConnection } from './NodeWorkflowCanvas'

const colors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  border: '#3A3030',
  text: '#FFFFFF',
  textMuted: '#B0A8A8',
  textDim: '#706868',
  accent: '#FF6B00',
  email: '#3B82F6',
  trigger: '#F59E0B',
  condition: '#8B5CF6',
  action: '#10B981',
  delay: '#EC4899',
}

// Email-specific triggers
const emailTriggers = [
  { id: 'list_subscribe', name: 'List Subscribe', icon: '📥', description: 'When user subscribes to list' },
  { id: 'form_submit', name: 'Form Submit', icon: '📝', description: 'When form is submitted' },
  { id: 'tag_added', name: 'Tag Added', icon: '🏷️', description: 'When tag is added to contact' },
  { id: 'email_opened', name: 'Email Opened', icon: '👁️', description: 'When email is opened' },
  { id: 'link_clicked', name: 'Link Clicked', icon: '🔗', description: 'When link is clicked' },
  { id: 'purchase', name: 'Purchase Made', icon: '💳', description: 'When purchase is completed' },
  { id: 'cart_abandoned', name: 'Cart Abandoned', icon: '🛒', description: 'When cart is abandoned' },
  { id: 'date_trigger', name: 'Date Based', icon: '📅', description: 'On specific date/anniversary' },
  { id: 'segment_enter', name: 'Segment Enter', icon: '👥', description: 'When contact enters segment' },
]

// Email conditions/filters
const emailConditions = [
  { id: 'has_tag', name: 'Has Tag', icon: '🏷️', description: 'Check if contact has tag' },
  { id: 'field_match', name: 'Field Match', icon: '📋', description: 'Check contact field value' },
  { id: 'email_engagement', name: 'Email Engagement', icon: '📊', description: 'Based on open/click rate' },
  { id: 'purchase_history', name: 'Purchase History', icon: '💰', description: 'Based on purchase behavior' },
  { id: 'time_since', name: 'Time Since', icon: '⏱️', description: 'Time since last action' },
  { id: 'ab_split', name: 'A/B Split', icon: '🔀', description: 'Random split for testing' },
  { id: 'segment_check', name: 'In Segment', icon: '👥', description: 'Check segment membership' },
]

// Email actions
const emailActions = [
  { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send email from template' },
  { id: 'send_sequence', name: 'Start Sequence', icon: '📚', description: 'Enroll in email sequence' },
  { id: 'add_tag', name: 'Add Tag', icon: '➕', description: 'Add tag to contact' },
  { id: 'remove_tag', name: 'Remove Tag', icon: '➖', description: 'Remove tag from contact' },
  { id: 'update_field', name: 'Update Field', icon: '✏️', description: 'Update contact field' },
  { id: 'add_to_list', name: 'Add to List', icon: '📋', description: 'Add to mailing list' },
  { id: 'remove_from_list', name: 'Remove from List', icon: '🗑️', description: 'Remove from list' },
  { id: 'notify_team', name: 'Notify Team', icon: '🔔', description: 'Send internal notification' },
  { id: 'webhook', name: 'Webhook', icon: '🔗', description: 'Call external webhook' },
  { id: 'score_lead', name: 'Score Lead', icon: '⭐', description: 'Adjust lead score' },
]

// Timing/flow nodes
const flowNodes = [
  { id: 'delay', name: 'Wait', icon: '⏳', description: 'Wait for specified time' },
  { id: 'wait_until', name: 'Wait Until', icon: '📅', description: 'Wait until date/time' },
  { id: 'wait_for_event', name: 'Wait for Event', icon: '👀', description: 'Wait for specific action' },
  { id: 'goal_check', name: 'Goal Check', icon: '🎯', description: 'Exit if goal achieved' },
  { id: 'end_sequence', name: 'End', icon: '🏁', description: 'End the automation' },
]

// Email templates
const emailTemplates = [
  { id: 'welcome_1', name: 'Welcome Email', category: 'Onboarding', openRate: 68 },
  { id: 'welcome_2', name: 'Getting Started', category: 'Onboarding', openRate: 45 },
  { id: 'nurture_1', name: 'Value Proposition', category: 'Nurture', openRate: 32 },
  { id: 'nurture_2', name: 'Social Proof', category: 'Nurture', openRate: 28 },
  { id: 'promo_1', name: 'Limited Offer', category: 'Sales', openRate: 24 },
  { id: 'abandon_1', name: 'Cart Reminder', category: 'Recovery', openRate: 41 },
  { id: 'abandon_2', name: 'Final Chance', category: 'Recovery', openRate: 35 },
  { id: 'reengagement', name: 'We Miss You', category: 'Win-back', openRate: 22 },
]

// Automation templates
const automationTemplates = [
  { id: 'welcome_series', name: 'Welcome Series', description: '5-email onboarding sequence', emails: 5, duration: '14 days' },
  { id: 'abandoned_cart', name: 'Abandoned Cart', description: '3-email recovery flow', emails: 3, duration: '3 days' },
  { id: 'lead_nurture', name: 'Lead Nurture', description: 'Educational drip campaign', emails: 7, duration: '30 days' },
  { id: 'post_purchase', name: 'Post-Purchase', description: 'Thank you & upsell flow', emails: 4, duration: '21 days' },
  { id: 're_engagement', name: 'Re-engagement', description: 'Win back inactive contacts', emails: 3, duration: '7 days' },
]

interface EmailNodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}

function EmailNodeConfigPanel({ node, onClose, onUpdate }: EmailNodeConfigPanelProps) {
  const [config, setConfig] = useState<Record<string, any>>(node?.data || {})

  if (!node) return null

  const handleSave = () => {
    onUpdate(node.id, config)
    onClose()
  }

  const isTrigger = node.type.startsWith('trigger_')
  const isCondition = node.type.startsWith('condition_')
  const isAction = node.type.startsWith('action_')
  const isFlow = node.type.startsWith('flow_')

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
          <div className="flex items-center gap-2">
            <span className="text-xl">{node.icon}</span>
            <h3 className="font-medium" style={{ color: colors.text }}>{node.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: colors.textMuted }}>✕</button>
        </div>

        {/* Trigger configs */}
        {node.type === 'trigger_list_subscribe' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Select List</label>
              <select
                value={config.listId || ''}
                onChange={(e) => setConfig({ ...config, listId: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="">Choose a list...</option>
                <option value="newsletter">Newsletter</option>
                <option value="customers">Customers</option>
                <option value="leads">Leads</option>
                <option value="vip">VIP Members</option>
              </select>
            </div>
            <div className="p-3 rounded-xl" style={{ background: colors.bg }}>
              <div className="text-xs mb-1" style={{ color: colors.textDim }}>Double Opt-in</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.doubleOptIn || false}
                  onChange={(e) => setConfig({ ...config, doubleOptIn: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: colors.text }}>Require email confirmation</span>
              </label>
            </div>
          </div>
        )}

        {node.type === 'trigger_cart_abandoned' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Abandon Timeout</label>
              <select
                value={config.timeout || '1h'}
                onChange={(e) => setConfig({ ...config, timeout: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="30m">30 minutes</option>
                <option value="1h">1 hour</option>
                <option value="2h">2 hours</option>
                <option value="4h">4 hours</option>
                <option value="24h">24 hours</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Minimum Cart Value</label>
              <input
                type="number"
                value={config.minValue || ''}
                onChange={(e) => setConfig({ ...config, minValue: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="$0.00"
              />
            </div>
          </div>
        )}

        {/* Condition configs */}
        {node.type === 'condition_has_tag' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Tag Name</label>
              <input
                value={config.tagName || ''}
                onChange={(e) => setConfig({ ...config, tagName: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="Enter tag name..."
              />
            </div>
            <div className="text-xs p-3 rounded-xl" style={{ background: colors.condition + '22', color: colors.condition }}>
              💡 Contacts WITH this tag go to "Yes" branch, without go to "No" branch
            </div>
          </div>
        )}

        {node.type === 'condition_ab_split' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Split Percentage</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={config.splitPercent || 50}
                  onChange={(e) => setConfig({ ...config, splitPercent: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm font-mono" style={{ color: colors.text }}>{config.splitPercent || 50}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: colors.action + '22' }}>
                <div className="text-xs" style={{ color: colors.textDim }}>Path A</div>
                <div className="text-lg font-medium" style={{ color: colors.action }}>{config.splitPercent || 50}%</div>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: colors.delay + '22' }}>
                <div className="text-xs" style={{ color: colors.textDim }}>Path B</div>
                <div className="text-lg font-medium" style={{ color: colors.delay }}>{100 - (config.splitPercent || 50)}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Action configs */}
        {node.type === 'action_send_email' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Email Template</label>
              <div className="space-y-2">
                {emailTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setConfig({ ...config, templateId: template.id, templateName: template.name })}
                    className={`w-full p-3 rounded-xl text-left transition-all ${config.templateId === template.id ? 'ring-2 ring-blue-500' : ''}`}
                    style={{
                      background: colors.bg,
                      border: `1px solid ${config.templateId === template.id ? colors.email : colors.border}`,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: colors.text }}>{template.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: colors.surfaceLight, color: colors.textMuted }}>
                        {template.openRate}% open
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: colors.textDim }}>{template.category}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Send Time</label>
              <select
                value={config.sendTime || 'immediate'}
                onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="immediate">Send Immediately</option>
                <option value="optimal">Optimal Send Time (AI)</option>
                <option value="morning">Morning (9am)</option>
                <option value="afternoon">Afternoon (2pm)</option>
                <option value="evening">Evening (7pm)</option>
              </select>
            </div>
          </div>
        )}

        {node.type === 'action_add_tag' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Tag to Add</label>
              <input
                value={config.tagName || ''}
                onChange={(e) => setConfig({ ...config, tagName: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="Enter tag name..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['engaged', 'customer', 'vip', 'at-risk', 'converted'].map(tag => (
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

        {/* Flow configs */}
        {node.type === 'flow_delay' && (
          <div className="space-y-4">
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
            </div>
            <div className="grid grid-cols-4 gap-2">
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

        {node.type === 'flow_goal_check' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Goal Event</label>
              <select
                value={config.goalEvent || ''}
                onChange={(e) => setConfig({ ...config, goalEvent: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="">Select goal...</option>
                <option value="purchase">Made Purchase</option>
                <option value="signup">Signed Up</option>
                <option value="clicked_cta">Clicked CTA</option>
                <option value="replied">Replied to Email</option>
                <option value="booked_call">Booked a Call</option>
              </select>
            </div>
            <div className="p-3 rounded-xl" style={{ background: colors.action + '22' }}>
              <div className="text-xs" style={{ color: colors.action }}>
                🎯 Contact exits automation when goal is achieved
              </div>
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

export default function EmailAutomationWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    // Trigger
    {
      id: 'trigger_1',
      type: 'trigger_list_subscribe',
      title: 'List Subscribe',
      subtitle: 'Newsletter signup',
      icon: '📥',
      x: 100,
      y: 250,
      inputs: [],
      outputs: [{ id: 'trigger_out', type: 'output', label: 'Contact', dataType: 'any' }],
      color: colors.trigger,
    },
    // First email
    {
      id: 'email_1',
      type: 'action_send_email',
      title: 'Welcome Email',
      subtitle: 'Immediate',
      icon: '📧',
      x: 320,
      y: 250,
      inputs: [{ id: 'contact_in', type: 'input', label: 'Contact', dataType: 'any' }],
      outputs: [{ id: 'sent_out', type: 'output', label: 'Sent', dataType: 'any' }],
      color: colors.email,
    },
    // Delay
    {
      id: 'delay_1',
      type: 'flow_delay',
      title: 'Wait 2 Days',
      subtitle: '',
      icon: '⏳',
      x: 540,
      y: 250,
      inputs: [{ id: 'in', type: 'input', label: 'In', dataType: 'any' }],
      outputs: [{ id: 'out', type: 'output', label: 'Out', dataType: 'any' }],
      color: colors.delay,
    },
    // Condition
    {
      id: 'condition_1',
      type: 'condition_email_engagement',
      title: 'Opened Email?',
      subtitle: 'Check engagement',
      icon: '📊',
      x: 760,
      y: 250,
      inputs: [{ id: 'in', type: 'input', label: 'In', dataType: 'any' }],
      outputs: [
        { id: 'yes_out', type: 'output', label: 'Yes', dataType: 'any' },
        { id: 'no_out', type: 'output', label: 'No', dataType: 'any' },
      ],
      color: colors.condition,
    },
    // Yes branch email
    {
      id: 'email_2',
      type: 'action_send_email',
      title: 'Getting Started',
      subtitle: 'For engaged users',
      icon: '📧',
      x: 1000,
      y: 150,
      inputs: [{ id: 'contact_in', type: 'input', label: 'Contact', dataType: 'any' }],
      outputs: [{ id: 'sent_out', type: 'output', label: 'Sent', dataType: 'any' }],
      color: colors.email,
    },
    // No branch email
    {
      id: 'email_3',
      type: 'action_send_email',
      title: 'Re-engagement',
      subtitle: 'For inactive users',
      icon: '📧',
      x: 1000,
      y: 350,
      inputs: [{ id: 'contact_in', type: 'input', label: 'Contact', dataType: 'any' }],
      outputs: [{ id: 'sent_out', type: 'output', label: 'Sent', dataType: 'any' }],
      color: colors.email,
    },
    // Add tag
    {
      id: 'tag_1',
      type: 'action_add_tag',
      title: 'Tag: Onboarded',
      subtitle: '',
      icon: '🏷️',
      x: 1220,
      y: 250,
      inputs: [
        { id: 'in_1', type: 'input', label: 'In', dataType: 'any' },
        { id: 'in_2', type: 'input', label: 'In', dataType: 'any' },
      ],
      outputs: [{ id: 'out', type: 'output', label: 'Out', dataType: 'any' }],
      color: colors.action,
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'trigger_1', fromPort: 'trigger_out', toNode: 'email_1', toPort: 'contact_in', animated: true },
    { id: 'conn_2', fromNode: 'email_1', fromPort: 'sent_out', toNode: 'delay_1', toPort: 'in', animated: true },
    { id: 'conn_3', fromNode: 'delay_1', fromPort: 'out', toNode: 'condition_1', toPort: 'in', animated: true },
    { id: 'conn_4', fromNode: 'condition_1', fromPort: 'yes_out', toNode: 'email_2', toPort: 'contact_in', animated: true },
    { id: 'conn_5', fromNode: 'condition_1', fromPort: 'no_out', toNode: 'email_3', toPort: 'contact_in', animated: true },
    { id: 'conn_6', fromNode: 'email_2', fromPort: 'sent_out', toNode: 'tag_1', toPort: 'in_1', animated: true },
    { id: 'conn_7', fromNode: 'email_3', fromPort: 'sent_out', toNode: 'tag_1', toPort: 'in_2', animated: true },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(true)
  const [activeTab, setActiveTab] = useState<'nodes' | 'templates'>('nodes')

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

  // Node templates for palette
  const nodeTemplates = [
    ...emailTriggers.map(t => ({
      type: `trigger_${t.id}`,
      title: t.name,
      icon: t.icon,
      category: 'Triggers',
      color: colors.trigger,
      inputs: [],
      outputs: [{ id: 'trigger_out', type: 'output' as const, label: 'Contact', dataType: 'any' as const }],
    })),
    ...emailConditions.map(c => ({
      type: `condition_${c.id}`,
      title: c.name,
      icon: c.icon,
      category: 'Conditions',
      color: colors.condition,
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [
        { id: 'yes_out', type: 'output' as const, label: 'Yes', dataType: 'any' as const },
        { id: 'no_out', type: 'output' as const, label: 'No', dataType: 'any' as const },
      ],
    })),
    ...emailActions.map(a => ({
      type: `action_${a.id}`,
      title: a.name,
      icon: a.icon,
      category: 'Actions',
      color: a.id === 'send_email' || a.id === 'send_sequence' ? colors.email : colors.action,
      inputs: [{ id: 'contact_in', type: 'input' as const, label: 'Contact', dataType: 'any' as const }],
      outputs: [{ id: 'sent_out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...flowNodes.map(f => ({
      type: `flow_${f.id}`,
      title: f.name,
      icon: f.icon,
      category: 'Flow',
      color: colors.delay,
      inputs: f.id === 'end_sequence' ? [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }] : [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: f.id === 'end_sequence' ? [] : [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
  ]

  const handleAddNode = (template: typeof nodeTemplates[0]) => {
    const newNode: WorkflowNode = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
      icon: template.icon,
      x: 400 + Math.random() * 100,
      y: 250 + Math.random() * 100,
      inputs: template.inputs,
      outputs: template.outputs,
      color: template.color,
    }
    setNodes([...nodes, newNode])
  }

  const handleLoadTemplate = (templateId: string) => {
    // Load pre-built automation template
    console.log('Loading template:', templateId)
    // This would load a pre-configured set of nodes and connections
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
            className="absolute left-0 top-0 bottom-0 w-72 z-20 flex flex-col"
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
                  {automationTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleLoadTemplate(template.id)}
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
          className="absolute left-4 top-4 z-20 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${colors.email} 0%, #2563EB 100%)`,
            color: '#fff',
            border: 'none',
            boxShadow: `0 4px 20px ${colors.email}44, 0 0 30px ${colors.email}22`,
          }}
          whileHover={{ scale: 1.05, boxShadow: `0 6px 25px ${colors.email}66` }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ fontSize: '18px' }}>➕</span> Add Node
        </motion.button>
      )}

      {/* Canvas */}
      <div className={`absolute inset-0 ${showPalette ? 'left-72' : ''}`}>
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
          <EmailNodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
          />
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-xl z-10"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📧</span>
          <div>
            <div className="text-xs" style={{ color: colors.textDim }}>Emails in Flow</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>4</div>
          </div>
        </div>
        <div className="w-px h-8" style={{ background: colors.border }} />
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <div>
            <div className="text-xs" style={{ color: colors.textDim }}>Active Contacts</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>1,247</div>
          </div>
        </div>
        <div className="w-px h-8" style={{ background: colors.border }} />
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <div>
            <div className="text-xs" style={{ color: colors.textDim }}>Avg Open Rate</div>
            <div className="text-sm font-medium" style={{ color: colors.action }}>42.3%</div>
          </div>
        </div>
      </div>

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
        >
          🗑️ Delete {selectedNodeId ? '' : '(select)'}
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: colors.textMuted }}>
          📋 Duplicate
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: colors.textMuted }}>
          💾 Save Draft
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: colors.textMuted }}>
          🧪 Test
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
          style={{ background: colors.email, color: colors.text }}
        >
          ▶️ Activate
        </button>
      </div>
    </div>
  )
}
