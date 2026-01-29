'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIntelVault } from '../stores/intelVault'

const colors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
  accent: '#FF6B00',
  green: '#10B981',
  red: '#EF4444',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  yellow: '#F59E0B',
}

// Mock data for analytics
const performanceData = [
  { label: 'Email Campaigns', value: 42.3, change: 12.5, trend: 'up' },
  { label: 'Video Engagement', value: 68.7, change: -3.2, trend: 'down' },
  { label: 'Image Conversions', value: 24.1, change: 8.9, trend: 'up' },
  { label: 'Social Reach', value: 156000, change: 22.4, trend: 'up' },
]

const recentActivity = [
  { type: 'email', action: 'Campaign sent', time: '2h ago', metric: '4,521 recipients' },
  { type: 'video', action: 'Video published', time: '5h ago', metric: '1.2K views' },
  { type: 'image', action: 'Assets generated', time: '8h ago', metric: '24 images' },
  { type: 'automation', action: 'Workflow triggered', time: '12h ago', metric: '847 contacts' },
]

const workflowStats = [
  { name: 'Email Automation', runs: 156, success: 98.2 },
  { name: 'Video Pipeline', runs: 42, success: 95.5 },
  { name: 'Image Generation', runs: 312, success: 99.1 },
  { name: 'Social Ads', runs: 89, success: 94.8 },
]

// Deployment strategy mock data
const deploymentChannels = ['Email', 'Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube']
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hoursOfDay = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM']

// Generate mock heatmap data
const generateHeatmapData = () => {
  const data: Record<string, Record<string, number>> = {}
  deploymentChannels.forEach(channel => {
    data[channel] = {}
    daysOfWeek.forEach(day => {
      hoursOfDay.forEach(hour => {
        // Generate realistic engagement patterns
        let base = Math.random() * 40 + 20
        // Higher engagement on weekday mornings/evenings for business channels
        if (['Email', 'LinkedIn'].includes(channel)) {
          if (['Tue', 'Wed', 'Thu'].includes(day) && ['9AM', '12PM'].includes(hour)) base += 30
        }
        // Higher engagement on evenings/weekends for social
        if (['Instagram', 'TikTok', 'Facebook'].includes(channel)) {
          if (['Sat', 'Sun'].includes(day) || ['6PM', '9PM'].includes(hour)) base += 25
        }
        data[channel][`${day}-${hour}`] = Math.min(100, Math.round(base))
      })
    })
  })
  return data
}

// Strategy recommendations
const deploymentRecommendations = [
  {
    channel: 'Email',
    bestTime: 'Tuesday 9AM',
    engagement: 87,
    tip: 'Send newsletters mid-week morning for highest open rates',
    icon: '📧'
  },
  {
    channel: 'Instagram',
    bestTime: 'Saturday 6PM',
    engagement: 92,
    tip: 'Post carousel content during weekend evenings',
    icon: '📸'
  },
  {
    channel: 'LinkedIn',
    bestTime: 'Wednesday 12PM',
    engagement: 78,
    tip: 'Share thought leadership during lunch hours',
    icon: '💼'
  },
  {
    channel: 'TikTok',
    bestTime: 'Friday 9PM',
    engagement: 95,
    tip: 'Leverage weekend pre-gaming scroll behavior',
    icon: '🎵'
  },
  {
    channel: 'Twitter/X',
    bestTime: 'Weekday mornings',
    engagement: 71,
    tip: 'Join trending conversations early in the day',
    icon: '𝕏'
  },
]

// Google Sheets template options
const sheetsTemplates = [
  {
    id: 'executive_summary',
    name: 'Executive Summary',
    icon: '📊',
    description: 'High-level KPIs and trends for stakeholders',
    sheets: ['Overview', 'Key Metrics', 'Trends'],
  },
  {
    id: 'social_metrics',
    name: 'Social Media Metrics',
    icon: '📱',
    description: 'Detailed social platform performance breakdown',
    sheets: ['Engagement', 'Reach', 'Followers', 'Content Performance'],
  },
  {
    id: 'campaign_performance',
    name: 'Campaign Performance',
    icon: '🎯',
    description: 'Email, video, and ad campaign analytics',
    sheets: ['Email Stats', 'Video Stats', 'Ad Performance', 'ROI'],
  },
  {
    id: 'workflow_analytics',
    name: 'Workflow Analytics',
    icon: '⚡',
    description: 'Automation and workflow performance data',
    sheets: ['Runs', 'Success Rates', 'Errors', 'Time Analysis'],
  },
  {
    id: 'full_export',
    name: 'Full Data Export',
    icon: '📦',
    description: 'Complete data dump with all metrics',
    sheets: ['All Metrics', 'Raw Data', 'Pivot Tables', 'Charts Data'],
  },
]

export default function AnalyticsWorkflow() {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeMetric, setActiveMetric] = useState('all')

  // Deployment strategy state
  const [showDeploymentStrategy, setShowDeploymentStrategy] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const heatmapData = useMemo(() => generateHeatmapData(), [])

  // Intel Vault integration
  const { deploymentMetrics, setDeploymentMetrics, addAnalyticsInsight, analyticsInsights } = useIntelVault()

  // Google Sheets export state
  const [showSheetsExport, setShowSheetsExport] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('executive_summary')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')
  const [sheetsUrl, setSheetsUrl] = useState('')

  // Google Sheets export function
  const exportToGoogleSheets = async () => {
    setIsExporting(true)
    setExportStatus('exporting')
    setExportProgress(0)
    setSheetsUrl('')

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 200))
        setExportProgress(i)
      }

      // In production, this would call Google Sheets API
      // const response = await fetch('/api/export/google-sheets', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     template: selectedTemplate,
      //     timeRange,
      //     data: { performanceData, recentActivity, workflowStats }
      //   })
      // })

      // Simulate success with mock URL
      setSheetsUrl(`https://docs.google.com/spreadsheets/d/${Date.now().toString(36)}/edit`)
      setExportStatus('success')
    } catch (error) {
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: colors.text }}>Analytics Dashboard</h2>
          <p className="text-sm" style={{ color: colors.textMuted }}>Track performance across all your workflows</p>
        </div>
        <div className="flex items-center gap-2">
          {['24h', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: timeRange === range ? colors.accent : colors.surface,
                color: timeRange === range ? colors.bg : colors.textMuted,
                border: `1px solid ${timeRange === range ? colors.accent : colors.border}`,
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {performanceData.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <div className="text-xs mb-2" style={{ color: colors.textMuted }}>{metric.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-semibold" style={{ color: colors.text }}>
                {typeof metric.value === 'number' && metric.value > 1000
                  ? `${(metric.value / 1000).toFixed(1)}K`
                  : `${metric.value}%`}
              </div>
              <div
                className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{
                  background: metric.trend === 'up' ? `${colors.green}22` : `${colors.red}22`,
                  color: metric.trend === 'up' ? colors.green : colors.red,
                }}
              >
                {metric.trend === 'up' ? '↑' : '↓'} {Math.abs(metric.change)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chart placeholder */}
        <div
          className="col-span-2 p-6 rounded-xl"
          style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <h3 className="text-sm font-medium mb-4" style={{ color: colors.text }}>Performance Over Time</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {[65, 45, 78, 52, 89, 67, 73, 58, 82, 71, 68, 85].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="w-full rounded-t-lg"
                style={{
                  background: `linear-gradient(to top, ${colors.accent}44, ${colors.accent})`,
                  minWidth: 20,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: colors.textDim }}>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="p-4 rounded-xl"
          style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <h3 className="text-sm font-medium mb-4" style={{ color: colors.text }}>Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{ background: colors.bg }}
              >
                <span className="text-lg">
                  {activity.type === 'email' ? '📧' : activity.type === 'video' ? '🎥' : activity.type === 'image' ? '🖼️' : '⚡'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate" style={{ color: colors.text }}>{activity.action}</div>
                  <div className="text-[10px]" style={{ color: colors.textDim }}>{activity.time}</div>
                </div>
                <div className="text-xs" style={{ color: colors.accent }}>{activity.metric}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Stats */}
      <div
        className="p-6 rounded-xl"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <h3 className="text-sm font-medium mb-4" style={{ color: colors.text }}>Workflow Performance</h3>
        <div className="grid grid-cols-4 gap-4">
          {workflowStats.map((workflow, i) => (
            <motion.div
              key={workflow.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl"
              style={{ background: colors.bg }}
            >
              <div className="text-xs mb-3" style={{ color: colors.textMuted }}>{workflow.name}</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold" style={{ color: colors.text }}>{workflow.runs}</span>
                <span className="text-xs" style={{ color: colors.textDim }}>runs</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: colors.surfaceLight }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${workflow.success}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: colors.green }}
                />
              </div>
              <div className="text-[10px] mt-1 text-right" style={{ color: colors.green }}>
                {workflow.success}% success
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowDeploymentStrategy(!showDeploymentStrategy)}
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:opacity-80"
          style={{
            background: showDeploymentStrategy ? colors.purple : colors.surface,
            color: showDeploymentStrategy ? colors.text : colors.textMuted,
            border: `1px solid ${showDeploymentStrategy ? colors.purple : colors.border}`
          }}
        >
          🚀 Deployment Strategy
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${colors.green}22`, color: colors.green }}>NEW</span>
        </button>
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}
        >
          📊 Export Report
        </button>
        <button
          onClick={() => setShowSheetsExport(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:opacity-80"
          style={{ background: colors.green, color: colors.bg }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11V9h-4V5h-2v4H9V5H7v4H3v2h4v4H3v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4H9v-4h4v4z"/>
          </svg>
          Export to Sheets
        </button>
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}
        >
          📅 Schedule Report
        </button>
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}
        >
          🔔 Set Alerts
        </button>
      </div>

      {/* Deployment Strategy Section */}
      <AnimatePresence>
        {showDeploymentStrategy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-6 rounded-xl space-y-6"
              style={{ background: `${colors.purple}11`, border: `1px solid ${colors.purple}33` }}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: colors.text }}>Deployment Strategy Report</h3>
                    <p className="text-sm" style={{ color: colors.textMuted }}>Optimal posting times based on engagement data</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded" style={{ background: colors.purple, color: colors.text }}>
                    Intel Vault Connected
                  </span>
                </div>
              </div>

              {/* Engagement Heatmap */}
              <div className="p-4 rounded-xl" style={{ background: colors.surface }}>
                <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
                  📊 Engagement Heatmap by Channel & Time
                </h4>

                {/* Channel selector */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setSelectedChannel(null)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: selectedChannel === null ? colors.purple : colors.bg,
                      color: selectedChannel === null ? colors.text : colors.textMuted,
                      border: `1px solid ${selectedChannel === null ? colors.purple : colors.border}`
                    }}
                  >
                    All Channels
                  </button>
                  {deploymentChannels.map(channel => (
                    <button
                      key={channel}
                      onClick={() => setSelectedChannel(channel)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: selectedChannel === channel ? colors.accent : colors.bg,
                        color: selectedChannel === channel ? colors.text : colors.textMuted,
                        border: `1px solid ${selectedChannel === channel ? colors.accent : colors.border}`
                      }}
                    >
                      {channel}
                    </button>
                  ))}
                </div>

                {/* Heatmap Grid */}
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Header row */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-20 text-xs" style={{ color: colors.textDim }}></div>
                      {daysOfWeek.map(day => (
                        <div key={day} className="flex-1 text-center text-xs font-medium" style={{ color: colors.textMuted }}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Heatmap rows */}
                    {hoursOfDay.map(hour => (
                      <div key={hour} className="flex items-center gap-1 mb-1">
                        <div className="w-20 text-xs" style={{ color: colors.textDim }}>{hour}</div>
                        {daysOfWeek.map(day => {
                          // Calculate average if showing all channels, or show specific channel
                          let value = 0
                          if (selectedChannel) {
                            value = heatmapData[selectedChannel]?.[`${day}-${hour}`] || 0
                          } else {
                            const values = deploymentChannels.map(ch => heatmapData[ch]?.[`${day}-${hour}`] || 0)
                            value = values.reduce((a, b) => a + b, 0) / values.length
                          }

                          // Color gradient based on value
                          const intensity = value / 100
                          const bgColor = value > 75
                            ? `rgba(16, 185, 129, ${intensity})` // green for high
                            : value > 50
                              ? `rgba(245, 158, 11, ${intensity})` // yellow for medium
                              : `rgba(59, 130, 246, ${intensity * 0.5 + 0.2})` // blue for low

                          return (
                            <motion.div
                              key={`${day}-${hour}`}
                              className="flex-1 h-8 rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-transform hover:scale-105"
                              style={{
                                background: bgColor,
                                color: value > 60 ? colors.text : colors.textMuted,
                              }}
                              whileHover={{ scale: 1.1 }}
                              title={`${selectedChannel || 'Avg'}: ${Math.round(value)}% engagement`}
                            >
                              {Math.round(value)}
                            </motion.div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ background: `rgba(59, 130, 246, 0.5)` }}></div>
                    <span className="text-xs" style={{ color: colors.textMuted }}>Low (&lt;50%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ background: `rgba(245, 158, 11, 0.7)` }}></div>
                    <span className="text-xs" style={{ color: colors.textMuted }}>Medium (50-75%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ background: `rgba(16, 185, 129, 0.9)` }}></div>
                    <span className="text-xs" style={{ color: colors.textMuted }}>High (&gt;75%)</span>
                  </div>
                </div>
              </div>

              {/* Channel Recommendations */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {deploymentRecommendations.map((rec, i) => (
                  <motion.div
                    key={rec.channel}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl"
                    style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{rec.icon}</span>
                      <span className="font-medium text-sm" style={{ color: colors.text }}>{rec.channel}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs" style={{ color: colors.textMuted }}>Best Time</div>
                        <div className="text-sm font-semibold" style={{ color: colors.accent }}>{rec.bestTime}</div>
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: colors.textMuted }}>Engagement</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: colors.bg }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: colors.green }}
                              initial={{ width: 0 }}
                              animate={{ width: `${rec.engagement}%` }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                            />
                          </div>
                          <span className="text-xs font-medium" style={{ color: colors.green }}>{rec.engagement}%</span>
                        </div>
                      </div>
                      <p className="text-xs" style={{ color: colors.textDim }}>{rec.tip}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ROI Prediction */}
              <div className="p-4 rounded-xl" style={{ background: colors.surface }}>
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  📈 Predicted ROI Impact
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl text-center" style={{ background: colors.bg }}>
                    <div className="text-3xl font-bold" style={{ color: colors.green }}>+34%</div>
                    <div className="text-xs mt-1" style={{ color: colors.textMuted }}>Engagement Uplift</div>
                    <div className="text-xs" style={{ color: colors.textDim }}>Using optimal times</div>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: colors.bg }}>
                    <div className="text-3xl font-bold" style={{ color: colors.blue }}>-22%</div>
                    <div className="text-xs mt-1" style={{ color: colors.textMuted }}>Cost Per Click</div>
                    <div className="text-xs" style={{ color: colors.textDim }}>From better targeting</div>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: colors.bg }}>
                    <div className="text-3xl font-bold" style={{ color: colors.purple }}>2.4x</div>
                    <div className="text-xs mt-1" style={{ color: colors.textMuted }}>Reach Multiplier</div>
                    <div className="text-xs" style={{ color: colors.textDim }}>Cross-platform synergy</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: colors.textDim }}>
                  💡 Data aggregated from Intel Vault • Last updated: {new Date().toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                    style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}
                  >
                    📄 Export PDF
                  </button>
                  <button
                    onClick={() => setShowSheetsExport(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                    style={{ background: colors.green, color: colors.bg }}
                  >
                    📊 Export to Sheets
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sheets Export Modal */}
      <AnimatePresence>
        {showSheetsExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => !isExporting && setShowSheetsExport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-lg w-full p-6 rounded-2xl"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: colors.green }}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={colors.bg}>
                      <path d="M19 11V9h-4V5h-2v4H9V5H7v4H3v2h4v4H3v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4H9v-4h4v4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: colors.text }}>Export to Google Sheets</h3>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Create a visual report spreadsheet</p>
                  </div>
                </div>
                <button
                  onClick={() => !isExporting && setShowSheetsExport(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  disabled={isExporting}
                >
                  <span style={{ color: colors.textMuted }}>✕</span>
                </button>
              </div>

              {exportStatus === 'success' ? (
                /* Success State */
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h4 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>Export Complete!</h4>
                  <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                    Your Google Sheet has been created with all the selected data
                  </p>
                  <div className="space-y-3">
                    <a
                      href={sheetsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 rounded-xl font-medium text-center transition-all hover:opacity-90"
                      style={{ background: colors.green, color: colors.bg }}
                    >
                      📊 Open in Google Sheets
                    </a>
                    <button
                      onClick={() => {
                        setExportStatus('idle')
                        setShowSheetsExport(false)
                      }}
                      className="block w-full py-3 rounded-xl font-medium text-center"
                      style={{ background: colors.bg, color: colors.textMuted, border: `1px solid ${colors.border}` }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : exportStatus === 'error' ? (
                /* Error State */
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">❌</div>
                  <h4 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>Export Failed</h4>
                  <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                    Please check your Google account connection and try again
                  </p>
                  <button
                    onClick={() => setExportStatus('idle')}
                    className="px-6 py-2 rounded-lg font-medium"
                    style={{ background: colors.accent, color: colors.text }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                /* Selection State */
                <div className="space-y-4">
                  {/* Template Selection */}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: colors.text }}>Select Report Template</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {sheetsTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className="w-full p-3 rounded-xl text-left transition-all"
                          style={{
                            background: selectedTemplate === template.id ? `${colors.green}22` : colors.bg,
                            border: `1px solid ${selectedTemplate === template.id ? colors.green : colors.border}`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-sm" style={{ color: colors.text }}>{template.name}</div>
                              <div className="text-xs" style={{ color: colors.textMuted }}>{template.description}</div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {template.sheets.map(sheet => (
                                  <span
                                    key={sheet}
                                    className="text-xs px-1.5 py-0.5 rounded"
                                    style={{ background: colors.surfaceLight, color: colors.textDim }}
                                  >
                                    {sheet}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {selectedTemplate === template.id && (
                              <span style={{ color: colors.green }}>✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Range Info */}
                  <div className="p-3 rounded-xl" style={{ background: colors.bg }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.textMuted }}>Data Range:</span>
                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                        {timeRange === '24h' ? 'Last 24 Hours' :
                         timeRange === '7d' ? 'Last 7 Days' :
                         timeRange === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                      </span>
                    </div>
                  </div>

                  {/* Export Progress */}
                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: colors.textMuted }}>Exporting...</span>
                        <span style={{ color: colors.green }}>{exportProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: colors.bg }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: colors.green }}
                          initial={{ width: 0 }}
                          animate={{ width: `${exportProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Export Button */}
                  <button
                    onClick={exportToGoogleSheets}
                    disabled={isExporting}
                    className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: colors.green, color: colors.bg }}
                  >
                    {isExporting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Generating Spreadsheet...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 11V9h-4V5h-2v4H9V5H7v4H3v2h4v4H3v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4H9v-4h4v4z"/>
                        </svg>
                        Create Google Sheet
                      </>
                    )}
                  </button>

                  {/* Note */}
                  <p className="text-xs text-center" style={{ color: colors.textDim }}>
                    Sheet will be created in your Google Drive and shared with your team
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
