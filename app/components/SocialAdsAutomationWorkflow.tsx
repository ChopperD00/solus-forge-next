'use client'

import { useState } from 'react'
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
  social: '#E1306C',
  meta: '#1877F2',
  tiktok: '#FF0050',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  trigger: '#F59E0B',
  condition: '#8B5CF6',
  action: '#10B981',
  creative: '#EC4899',
}

// Platform-specific triggers
const socialTriggers = [
  { id: 'campaign_start', name: 'Campaign Start', icon: '🚀', description: 'When campaign launches', platforms: ['all'] },
  { id: 'budget_threshold', name: 'Budget Threshold', icon: '💰', description: 'When spend reaches limit', platforms: ['all'] },
  { id: 'performance_alert', name: 'Performance Alert', icon: '📊', description: 'When metrics change', platforms: ['all'] },
  { id: 'schedule', name: 'Scheduled', icon: '📅', description: 'Run on schedule', platforms: ['all'] },
  { id: 'creative_approved', name: 'Creative Approved', icon: '✅', description: 'When asset is approved', platforms: ['all'] },
  { id: 'audience_change', name: 'Audience Change', icon: '👥', description: 'When audience updates', platforms: ['all'] },
]

// Performance conditions
const socialConditions = [
  { id: 'ctr_check', name: 'CTR Check', icon: '🖱️', description: 'Check click-through rate' },
  { id: 'cpm_check', name: 'CPM Check', icon: '💵', description: 'Check cost per mille' },
  { id: 'roas_check', name: 'ROAS Check', icon: '📈', description: 'Return on ad spend' },
  { id: 'frequency_check', name: 'Frequency Check', icon: '🔄', description: 'Check ad frequency' },
  { id: 'spend_check', name: 'Spend Check', icon: '💰', description: 'Check daily spend' },
  { id: 'time_check', name: 'Time Check', icon: '⏰', description: 'Check time of day' },
  { id: 'ab_winner', name: 'A/B Winner', icon: '🏆', description: 'Determine winning variant' },
  { id: 'platform_check', name: 'Platform Check', icon: '📱', description: 'Route by platform' },
]

// Ad management actions
const socialActions = [
  { id: 'pause_ad', name: 'Pause Ad', icon: '⏸️', description: 'Pause underperforming ads' },
  { id: 'enable_ad', name: 'Enable Ad', icon: '▶️', description: 'Enable paused ads' },
  { id: 'adjust_budget', name: 'Adjust Budget', icon: '💰', description: 'Change ad budget' },
  { id: 'adjust_bid', name: 'Adjust Bid', icon: '🎯', description: 'Change bid strategy' },
  { id: 'swap_creative', name: 'Swap Creative', icon: '🔄', description: 'Replace ad creative' },
  { id: 'scale_winner', name: 'Scale Winner', icon: '📈', description: 'Increase winning ad spend' },
  { id: 'create_lookalike', name: 'Create Lookalike', icon: '👥', description: 'Build lookalike audience' },
  { id: 'notify_team', name: 'Notify Team', icon: '🔔', description: 'Send Slack/email alert' },
  { id: 'export_report', name: 'Export Report', icon: '📊', description: 'Generate report' },
  { id: 'sync_to_crm', name: 'Sync to CRM', icon: '🔗', description: 'Push leads to CRM' },
]

// Creative generation nodes
const creativeNodes = [
  { id: 'generate_image', name: 'Generate Image', icon: '🎨', description: 'AI image generation' },
  { id: 'generate_video', name: 'Generate Video', icon: '🎬', description: 'AI video generation' },
  { id: 'resize_asset', name: 'Resize Asset', icon: '📐', description: 'Adapt to format' },
  { id: 'add_text', name: 'Add Text Overlay', icon: '✏️', description: 'Dynamic text overlay' },
  { id: 'ab_variant', name: 'A/B Variant', icon: '🔀', description: 'Create test variant' },
]

// Flow nodes
const flowNodes = [
  { id: 'delay', name: 'Wait', icon: '⏳', description: 'Wait for specified time' },
  { id: 'loop', name: 'Loop', icon: '🔁', description: 'Iterate over items' },
  { id: 'parallel', name: 'Parallel', icon: '⚡', description: 'Run in parallel' },
  { id: 'end', name: 'End', icon: '🏁', description: 'End automation' },
]

// Platform integrations
const platformIntegrations = [
  { id: 'meta', name: 'Meta Ads', icon: '📘', color: colors.meta },
  { id: 'tiktok', name: 'TikTok Ads', icon: '🎵', color: colors.tiktok },
  { id: 'youtube', name: 'YouTube Ads', icon: '📺', color: colors.youtube },
  { id: 'linkedin', name: 'LinkedIn Ads', icon: '💼', color: colors.linkedin },
  { id: 'pinterest', name: 'Pinterest Ads', icon: '📌', color: '#E60023' },
  { id: 'snapchat', name: 'Snapchat Ads', icon: '👻', color: '#FFFC00' },
]

// Automation templates
const automationTemplates = [
  { id: 'budget_optimizer', name: 'Budget Optimizer', description: 'Auto-reallocate budget to top performers', actions: 4 },
  { id: 'creative_rotation', name: 'Creative Rotation', description: 'Rotate creatives based on fatigue', actions: 5 },
  { id: 'performance_alerts', name: 'Performance Alerts', description: 'Alert on metric thresholds', actions: 3 },
  { id: 'ab_auto_winner', name: 'A/B Auto-Winner', description: 'Automatically select winning variant', actions: 6 },
  { id: 'retargeting_flow', name: 'Retargeting Flow', description: 'Sequential retargeting based on engagement', actions: 7 },
  { id: 'cross_platform_sync', name: 'Cross-Platform Sync', description: 'Sync campaigns across platforms', actions: 5 },
]

interface SocialNodeConfigPanelProps {
  node: WorkflowNode | null
  onClose: () => void
  onUpdate: (nodeId: string, data: Record<string, any>) => void
}

function SocialNodeConfigPanel({ node, onClose, onUpdate }: SocialNodeConfigPanelProps) {
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

        {/* Budget threshold trigger */}
        {node.type === 'trigger_budget_threshold' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Threshold Type</label>
              <select
                value={config.thresholdType || 'daily'}
                onChange={(e) => setConfig({ ...config, thresholdType: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="daily">Daily Spend</option>
                <option value="weekly">Weekly Spend</option>
                <option value="monthly">Monthly Spend</option>
                <option value="lifetime">Lifetime Budget</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Threshold Amount ($)</label>
              <input
                type="number"
                value={config.amount || ''}
                onChange={(e) => setConfig({ ...config, amount: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Trigger When</label>
              <select
                value={config.comparison || 'exceeds'}
                onChange={(e) => setConfig({ ...config, comparison: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="exceeds">Exceeds threshold</option>
                <option value="reaches_80">Reaches 80%</option>
                <option value="reaches_50">Reaches 50%</option>
              </select>
            </div>
          </div>
        )}

        {/* Performance alert trigger */}
        {node.type === 'trigger_performance_alert' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Metric</label>
              <select
                value={config.metric || 'ctr'}
                onChange={(e) => setConfig({ ...config, metric: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="ctr">Click-Through Rate (CTR)</option>
                <option value="cpm">Cost per Mille (CPM)</option>
                <option value="cpc">Cost per Click (CPC)</option>
                <option value="cpa">Cost per Acquisition (CPA)</option>
                <option value="roas">Return on Ad Spend (ROAS)</option>
                <option value="frequency">Ad Frequency</option>
                <option value="impressions">Impressions</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Condition</label>
              <div className="flex gap-2">
                <select
                  value={config.condition || 'drops_below'}
                  onChange={(e) => setConfig({ ...config, condition: e.target.value })}
                  className="flex-1 p-3 rounded-xl text-sm"
                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="drops_below">Drops below</option>
                  <option value="exceeds">Exceeds</option>
                  <option value="changes_by">Changes by</option>
                </select>
                <input
                  type="text"
                  value={config.value || ''}
                  onChange={(e) => setConfig({ ...config, value: e.target.value })}
                  className="w-24 p-3 rounded-xl text-sm text-center"
                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                  placeholder="2%"
                />
              </div>
            </div>
          </div>
        )}

        {/* ROAS condition */}
        {node.type === 'condition_roas_check' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>ROAS Threshold</label>
              <input
                type="number"
                step="0.1"
                value={config.roasThreshold || 2.0}
                onChange={(e) => setConfig({ ...config, roasThreshold: parseFloat(e.target.value) })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="2.0"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: colors.action + '22' }}>
                <div className="text-xs" style={{ color: colors.textDim }}>Above {config.roasThreshold || 2.0}x</div>
                <div className="text-sm font-medium" style={{ color: colors.action }}>✓ Profitable</div>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: colors.tiktok + '22' }}>
                <div className="text-xs" style={{ color: colors.textDim }}>Below {config.roasThreshold || 2.0}x</div>
                <div className="text-sm font-medium" style={{ color: colors.tiktok }}>✗ Unprofitable</div>
              </div>
            </div>
          </div>
        )}

        {/* A/B Winner condition */}
        {node.type === 'condition_ab_winner' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Winning Metric</label>
              <select
                value={config.winningMetric || 'ctr'}
                onChange={(e) => setConfig({ ...config, winningMetric: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="ctr">Highest CTR</option>
                <option value="conversions">Most Conversions</option>
                <option value="roas">Best ROAS</option>
                <option value="cpa">Lowest CPA</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Min Data Required</label>
              <select
                value={config.minData || '1000'}
                onChange={(e) => setConfig({ ...config, minData: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="500">500 impressions</option>
                <option value="1000">1,000 impressions</option>
                <option value="5000">5,000 impressions</option>
                <option value="10000">10,000 impressions</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Statistical Confidence</label>
              <select
                value={config.confidence || '95'}
                onChange={(e) => setConfig({ ...config, confidence: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="90">90% confidence</option>
                <option value="95">95% confidence</option>
                <option value="99">99% confidence</option>
              </select>
            </div>
          </div>
        )}

        {/* Adjust budget action */}
        {node.type === 'action_adjust_budget' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Adjustment Type</label>
              <select
                value={config.adjustType || 'increase_percent'}
                onChange={(e) => setConfig({ ...config, adjustType: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="increase_percent">Increase by %</option>
                <option value="decrease_percent">Decrease by %</option>
                <option value="set_amount">Set to amount</option>
                <option value="reallocate">Reallocate from losers</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>
                {config.adjustType === 'set_amount' ? 'Amount ($)' : 'Percentage (%)'}
              </label>
              <input
                type="number"
                value={config.adjustValue || ''}
                onChange={(e) => setConfig({ ...config, adjustValue: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder={config.adjustType === 'set_amount' ? '500' : '20'}
              />
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Max Daily Limit ($)</label>
              <input
                type="number"
                value={config.maxLimit || ''}
                onChange={(e) => setConfig({ ...config, maxLimit: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="No limit"
              />
            </div>
          </div>
        )}

        {/* Scale winner action */}
        {node.type === 'action_scale_winner' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Scale Method</label>
              <select
                value={config.scaleMethod || 'gradual'}
                onChange={(e) => setConfig({ ...config, scaleMethod: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="gradual">Gradual (20% daily)</option>
                <option value="moderate">Moderate (50% daily)</option>
                <option value="aggressive">Aggressive (100% daily)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Target Daily Spend ($)</label>
              <input
                type="number"
                value={config.targetSpend || ''}
                onChange={(e) => setConfig({ ...config, targetSpend: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="1000"
              />
            </div>
            <div className="p-3 rounded-xl" style={{ background: colors.action + '22' }}>
              <div className="text-xs" style={{ color: colors.action }}>
                📈 Will pause losers and reallocate budget to winner
              </div>
            </div>
          </div>
        )}

        {/* Generate image creative */}
        {node.type === 'creative_generate_image' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>AI Model</label>
              <select
                value={config.model || 'flux-pro'}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full p-3 rounded-xl text-sm"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="flux-pro">Flux Pro 1.1</option>
                <option value="flux-ultra">Flux Ultra</option>
                <option value="ideogram">Ideogram v2</option>
                <option value="midjourney">Midjourney v6</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Prompt Template</label>
              <textarea
                value={config.promptTemplate || ''}
                onChange={(e) => setConfig({ ...config, promptTemplate: e.target.value })}
                className="w-full h-24 p-3 rounded-xl text-sm resize-none"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                placeholder="Professional product shot of {{product_name}}, studio lighting, white background..."
              />
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: colors.textMuted }}>Output Formats</label>
              <div className="flex flex-wrap gap-2">
                {['1:1', '4:5', '9:16', '16:9'].map(format => (
                  <label key={format} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(config.formats || ['1:1']).includes(format)}
                      onChange={(e) => {
                        const formats = config.formats || ['1:1']
                        setConfig({
                          ...config,
                          formats: e.target.checked
                            ? [...formats, format]
                            : formats.filter((f: string) => f !== format)
                        })
                      }}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colors.text }}>{format}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delay/Wait */}
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
                  value={config.delayUnit || 'hours'}
                  onChange={(e) => setConfig({ ...config, delayUnit: e.target.value })}
                  className="flex-1 p-3 rounded-xl text-sm"
                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 1, unit: 'hours' },
                { value: 24, unit: 'hours' },
                { value: 7, unit: 'days' },
              ].map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setConfig({ ...config, delayValue: preset.value, delayUnit: preset.unit })}
                  className="p-2 rounded-lg text-xs"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.textMuted }}
                >
                  {preset.value} {preset.unit}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-medium mt-6 transition-all hover:scale-[1.02]"
          style={{ background: colors.social, color: colors.text }}
        >
          Save Configuration
        </button>
      </div>
    </motion.div>
  )
}

export default function SocialAdsAutomationWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    // Performance trigger
    {
      id: 'trigger_1',
      type: 'trigger_performance_alert',
      title: 'Performance Alert',
      subtitle: 'CTR drops below 1%',
      icon: '📊',
      x: 100,
      y: 200,
      inputs: [],
      outputs: [{ id: 'trigger_out', type: 'output', label: 'Ads', dataType: 'any' }],
      color: colors.trigger,
    },
    // ROAS check
    {
      id: 'condition_1',
      type: 'condition_roas_check',
      title: 'ROAS Check',
      subtitle: 'Above 2x?',
      icon: '📈',
      x: 340,
      y: 200,
      inputs: [{ id: 'in', type: 'input', label: 'In', dataType: 'any' }],
      outputs: [
        { id: 'yes_out', type: 'output', label: 'Profitable', dataType: 'any' },
        { id: 'no_out', type: 'output', label: 'Unprofitable', dataType: 'any' },
      ],
      color: colors.condition,
    },
    // Scale winner (profitable branch)
    {
      id: 'action_1',
      type: 'action_scale_winner',
      title: 'Scale Winner',
      subtitle: 'Increase budget 20%',
      icon: '📈',
      x: 580,
      y: 100,
      inputs: [{ id: 'in', type: 'input', label: 'In', dataType: 'any' }],
      outputs: [{ id: 'out', type: 'output', label: 'Out', dataType: 'any' }],
      color: colors.action,
    },
    // Pause ad (unprofitable branch)
    {
      id: 'action_2',
      type: 'action_pause_ad',
      title: 'Pause Ad',
      subtitle: 'Stop spending',
      icon: '⏸️',
      x: 580,
      y: 300,
      inputs: [{ id: 'in', type: 'input', label: 'In', dataType: 'any' }],
      outputs: [{ id: 'out', type: 'output', label: 'Out', dataType: 'any' }],
      color: colors.tiktok,
    },
    // Notify team
    {
      id: 'action_3',
      type: 'action_notify_team',
      title: 'Notify Team',
      subtitle: 'Slack alert',
      icon: '🔔',
      x: 820,
      y: 200,
      inputs: [
        { id: 'in_1', type: 'input', label: 'In', dataType: 'any' },
        { id: 'in_2', type: 'input', label: 'In', dataType: 'any' },
      ],
      outputs: [{ id: 'out', type: 'output', label: 'Out', dataType: 'any' }],
      color: colors.meta,
    },
  ])

  const [connections, setConnections] = useState<NodeConnection[]>([
    { id: 'conn_1', fromNode: 'trigger_1', fromPort: 'trigger_out', toNode: 'condition_1', toPort: 'in', animated: true },
    { id: 'conn_2', fromNode: 'condition_1', fromPort: 'yes_out', toNode: 'action_1', toPort: 'in', animated: true },
    { id: 'conn_3', fromNode: 'condition_1', fromPort: 'no_out', toNode: 'action_2', toPort: 'in', animated: true },
    { id: 'conn_4', fromNode: 'action_1', fromPort: 'out', toNode: 'action_3', toPort: 'in_1', animated: true },
    { id: 'conn_5', fromNode: 'action_2', fromPort: 'out', toNode: 'action_3', toPort: 'in_2', animated: true },
  ])

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [showPalette, setShowPalette] = useState(true)
  const [activeTab, setActiveTab] = useState<'nodes' | 'templates' | 'platforms'>('nodes')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['meta', 'tiktok'])

  // Node templates
  const nodeTemplates = [
    ...socialTriggers.map(t => ({
      type: `trigger_${t.id}`,
      title: t.name,
      icon: t.icon,
      category: 'Triggers',
      color: colors.trigger,
      inputs: [],
      outputs: [{ id: 'trigger_out', type: 'output' as const, label: 'Ads', dataType: 'any' as const }],
    })),
    ...socialConditions.map(c => ({
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
    ...socialActions.map(a => ({
      type: `action_${a.id}`,
      title: a.name,
      icon: a.icon,
      category: 'Actions',
      color: colors.action,
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...creativeNodes.map(c => ({
      type: `creative_${c.id}`,
      title: c.name,
      icon: c.icon,
      category: 'Creative',
      color: colors.creative,
      inputs: [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
    })),
    ...flowNodes.map(f => ({
      type: `flow_${f.id}`,
      title: f.name,
      icon: f.icon,
      category: 'Flow',
      color: colors.textDim,
      inputs: f.id === 'end' ? [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }] : [{ id: 'in', type: 'input' as const, label: 'In', dataType: 'any' as const }],
      outputs: f.id === 'end' ? [] : [{ id: 'out', type: 'output' as const, label: 'Out', dataType: 'any' as const }],
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

  const handleLoadTemplate = (templateId: string) => {
    console.log('Loading template:', templateId)
  }

  const handleUpdateNode = (nodeId: string, data: Record<string, any>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
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
              {['nodes', 'templates', 'platforms'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`flex-1 py-3 text-xs font-medium transition-colors capitalize ${activeTab === tab ? '' : 'opacity-50'}`}
                  style={{ color: colors.text, background: activeTab === tab ? colors.surfaceLight : 'transparent' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'nodes' && (
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
                              : category === 'Creative' ? colors.creative
                              : colors.textDim
                          }}
                        />
                        <span className="text-xs font-medium" style={{ color: colors.textDim }}>{category}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {templates.slice(0, 8).map(template => (
                          <button
                            key={template.type}
                            onClick={() => handleAddNode(template)}
                            className="p-2 rounded-lg text-left transition-all hover:scale-[1.02]"
                            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-lg">{template.icon}</span>
                              <span className="text-[10px] text-center leading-tight" style={{ color: colors.text }}>{template.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      {templates.length > 8 && (
                        <button className="w-full mt-1 text-xs py-1" style={{ color: colors.textDim }}>
                          + {templates.length - 8} more
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <p className="text-xs mb-4" style={{ color: colors.textDim }}>
                    Start with a pre-built automation
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
                      <div className="text-xs" style={{ color: colors.textMuted }}>
                        ⚡ {template.actions} actions
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'platforms' && (
                <div className="space-y-4">
                  <p className="text-xs" style={{ color: colors.textDim }}>
                    Select platforms to manage
                  </p>
                  <div className="space-y-2">
                    {platformIntegrations.map(platform => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${selectedPlatforms.includes(platform.id) ? 'ring-2 ring-pink-500' : ''}`}
                        style={{
                          background: colors.bg,
                          border: `1px solid ${selectedPlatforms.includes(platform.id) ? platform.color : colors.border}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{platform.icon}</span>
                          <span className="text-sm" style={{ color: colors.text }}>{platform.name}</span>
                        </div>
                        {selectedPlatforms.includes(platform.id) && (
                          <span style={{ color: platform.color }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: colors.surfaceLight }}>
                    <div className="text-xs" style={{ color: colors.textMuted }}>
                      {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
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
        <button
          onClick={() => setShowPalette(true)}
          className="absolute left-4 top-4 z-20 px-3 py-2 rounded-xl text-sm"
          style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}
        >
          + Add Node
        </button>
      )}

      {/* Canvas */}
      <div className={`absolute inset-0 ${showPalette ? 'left-72' : ''}`}>
        <NodeWorkflowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
          onNodeSelect={setSelectedNode}
          onNodeDoubleClick={setSelectedNode}
          selectedNodeId={selectedNode?.id}
          accentColor={colors.social}
        />
      </div>

      {/* Config Panel */}
      <AnimatePresence>
        {selectedNode && (
          <SocialNodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
          />
        )}
      </AnimatePresence>

      {/* Platform Badges */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl z-10"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}
      >
        <span className="text-xs" style={{ color: colors.textDim }}>Active:</span>
        {selectedPlatforms.map(platformId => {
          const platform = platformIntegrations.find(p => p.id === platformId)
          return (
            <div
              key={platformId}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${platform?.color}22` }}
              title={platform?.name}
            >
              {platform?.icon}
            </div>
          )
        })}
      </div>

      {/* Stats Bar */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-xl z-10"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <div>
            <div className="text-xs" style={{ color: colors.textDim }}>Daily Spend</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>$2,450</div>
          </div>
        </div>
        <div className="w-px h-8" style={{ background: colors.border }} />
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <div>
            <div className="text-xs" style={{ color: colors.textDim }}>Avg ROAS</div>
            <div className="text-sm font-medium" style={{ color: colors.action }}>3.2x</div>
          </div>
        </div>
        <div className="w-px h-8" style={{ background: colors.border }} />
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div>
            <div className="text-xs" style={{ color: colors.textDim }}>Active Ads</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>47</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl z-20"
        style={{ background: `${colors.surface}ee`, border: `1px solid ${colors.border}` }}
      >
        <button className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: colors.textMuted }}>
          🗑️ Delete
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
          🧪 Simulate
        </button>
        <div className="w-px h-6" style={{ background: colors.border }} />
        <button
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
          style={{ background: colors.social, color: colors.text }}
        >
          ▶️ Activate
        </button>
      </div>
    </div>
  )
}
