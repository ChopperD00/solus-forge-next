'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

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

export default function AnalyticsWorkflow() {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeMetric, setActiveMetric] = useState('all')

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
      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}
        >
          📊 Export Report
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
    </div>
  )
}
