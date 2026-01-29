'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
      <div className="flex items-center gap-3">
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
          Export to Google Sheets
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>NEW</span>
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
