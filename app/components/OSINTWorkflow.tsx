'use client'

import { useState, useCallback } from 'react'
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
  accentGlow: 'rgba(255, 107, 0, 0.3)',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
}

// Investigation types
type InvestigationType = 'competitive_intel' | 'due_diligence'
type OutputFormat = 'graph' | 'report' | 'json'
type ScanDepth = 'quick' | 'standard' | 'deep'
type TargetType = 'person' | 'company' | 'domain' | 'phone'

// OSINT Module definitions
interface OSINTModule {
  id: string
  name: string
  icon: string
  description: string
  category: 'identity' | 'corporate' | 'social' | 'technical' | 'legal' | 'financial'
  sources: string[]
  color: string
  estimatedTime: string
  forTypes: InvestigationType[]
}

const osintModules: OSINTModule[] = [
  // Identity & Verification
  {
    id: 'email_intel',
    name: 'Email Intelligence',
    icon: '📧',
    description: 'Validate email, find associated accounts, breach exposure',
    category: 'identity',
    sources: ['Hunter.io', 'EmailRep', 'HaveIBeenPwned'],
    color: colors.blue,
    estimatedTime: '15s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'phone_intel',
    name: 'Phone Intelligence',
    icon: '📱',
    description: 'Carrier lookup, caller ID, spam reports, linked accounts',
    category: 'identity',
    sources: ['NumVerify', 'Twilio Lookup', 'CallerID'],
    color: colors.cyan,
    estimatedTime: '20s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'username_enum',
    name: 'Username Enumeration',
    icon: '👤',
    description: 'Find accounts across 300+ platforms',
    category: 'identity',
    sources: ['Sherlock', 'WhatsMyName', 'Namechk'],
    color: colors.purple,
    estimatedTime: '30s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'reverse_image',
    name: 'Reverse Image Search',
    icon: '🖼️',
    description: 'Find image origins and duplicates',
    category: 'identity',
    sources: ['TinEye', 'Google Vision', 'Yandex'],
    color: colors.cyan,
    estimatedTime: '20s',
    forTypes: ['due_diligence'],
  },
  // Corporate Intelligence
  {
    id: 'company_records',
    name: 'Corporate Records',
    icon: '🏢',
    description: 'Business filings, officers, registered agents',
    category: 'corporate',
    sources: ['OpenCorporates', 'SEC EDGAR', 'State SOS'],
    color: colors.green,
    estimatedTime: '25s',
    forTypes: ['due_diligence', 'competitive_intel'],
  },
  {
    id: 'domain_intel',
    name: 'Domain Intelligence',
    icon: '🌐',
    description: 'WHOIS, DNS, SSL, subdomains, hosting',
    category: 'technical',
    sources: ['WHOIS', 'SecurityTrails', 'crt.sh'],
    color: colors.accent,
    estimatedTime: '20s',
    forTypes: ['due_diligence', 'competitive_intel'],
  },
  {
    id: 'tech_stack',
    name: 'Technology Stack',
    icon: '⚙️',
    description: 'CMS, frameworks, analytics, marketing tools',
    category: 'technical',
    sources: ['BuiltWith', 'Wappalyzer', 'PublicWWW'],
    color: colors.yellow,
    estimatedTime: '15s',
    forTypes: ['competitive_intel'],
  },
  // Social & Marketing Intel
  {
    id: 'social_presence',
    name: 'Social Presence',
    icon: '📱',
    description: 'Profile analysis, follower metrics, engagement',
    category: 'social',
    sources: ['Social Blade', 'Socialbakers', 'Public APIs'],
    color: '#E1306C',
    estimatedTime: '30s',
    forTypes: ['competitive_intel', 'due_diligence'],
  },
  {
    id: 'ad_intelligence',
    name: 'Ad Intelligence',
    icon: '📊',
    description: 'Active campaigns, creative assets, spend estimates',
    category: 'social',
    sources: ['Meta Ad Library', 'Google Ads Transparency'],
    color: '#1877F2',
    estimatedTime: '20s',
    forTypes: ['competitive_intel'],
  },
  {
    id: 'seo_analysis',
    name: 'SEO & Content',
    icon: '🔍',
    description: 'Keywords, backlinks, traffic estimates, content strategy',
    category: 'social',
    sources: ['Ubersuggest', 'SimilarWeb', 'Moz'],
    color: colors.green,
    estimatedTime: '25s',
    forTypes: ['competitive_intel'],
  },
  // Legal & Financial
  {
    id: 'court_records',
    name: 'Court Records',
    icon: '⚖️',
    description: 'Lawsuits, judgments, bankruptcies, liens',
    category: 'legal',
    sources: ['PACER', 'CourtListener', 'State Courts'],
    color: colors.red,
    estimatedTime: '45s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'news_sentiment',
    name: 'News & Sentiment',
    icon: '📰',
    description: 'Media coverage, press releases, sentiment analysis',
    category: 'social',
    sources: ['Google News', 'NewsAPI', 'Reddit'],
    color: colors.purple,
    estimatedTime: '20s',
    forTypes: ['due_diligence', 'competitive_intel'],
  },
  {
    id: 'breach_check',
    name: 'Breach Exposure',
    icon: '🔓',
    description: 'Check for compromised credentials and data leaks',
    category: 'identity',
    sources: ['HaveIBeenPwned', 'DeHashed', 'IntelX'],
    color: colors.red,
    estimatedTime: '10s',
    forTypes: ['due_diligence'],
  },
]

// Risk assessment interface
interface RiskFactor {
  category: string
  level: 'low' | 'medium' | 'high'
  description: string
  source: string
}

interface ScanResult {
  moduleId: string
  status: 'pending' | 'running' | 'complete' | 'error'
  data?: Record<string, unknown>
  riskFactors?: RiskFactor[]
  timestamp?: string
}

export default function OSINTWorkflow() {
  // State
  const [investigationType, setInvestigationType] = useState<InvestigationType>('competitive_intel')
  const [targetType, setTargetType] = useState<TargetType>('company')
  const [targetValue, setTargetValue] = useState('')
  const [scanDepth, setScanDepth] = useState<ScanDepth>('standard')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('graph')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<Record<string, ScanResult>>({})
  const [complianceAcknowledged, setComplianceAcknowledged] = useState(false)
  const [showComplianceModal, setShowComplianceModal] = useState(false)
  const [showReportViewer, setShowReportViewer] = useState(false)
  const [savedToVault, setSavedToVault] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Filter modules based on investigation type
  const availableModules = osintModules.filter(m => m.forTypes.includes(investigationType))

  // Auto-select modules based on depth
  const getModulesForDepth = useCallback((depth: ScanDepth): string[] => {
    const modules = availableModules
    if (depth === 'quick') return modules.slice(0, 3).map(m => m.id)
    if (depth === 'standard') return modules.slice(0, 6).map(m => m.id)
    return modules.map(m => m.id) // deep = all
  }, [availableModules])

  // Handle depth change
  const handleDepthChange = (depth: ScanDepth) => {
    setScanDepth(depth)
    setSelectedModules(getModulesForDepth(depth))
  }

  // Toggle module selection
  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  // Simulate scan execution
  const executeScan = async () => {
    if (!complianceAcknowledged) {
      setShowComplianceModal(true)
      return
    }

    if (!targetValue.trim()) return

    setIsScanning(true)
    setScanResults({})

    // Initialize all selected modules as pending
    const initialResults: Record<string, ScanResult> = {}
    selectedModules.forEach(id => {
      initialResults[id] = { moduleId: id, status: 'pending' }
    })
    setScanResults(initialResults)

    // Simulate sequential execution with delays
    for (const moduleId of selectedModules) {
      // Set to running
      setScanResults(prev => ({
        ...prev,
        [moduleId]: { ...prev[moduleId], status: 'running' }
      }))

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Generate mock results
      const mockRiskFactors: RiskFactor[] = Math.random() > 0.7
        ? [{
            category: osintModules.find(m => m.id === moduleId)?.category || 'general',
            level: Math.random() > 0.5 ? 'medium' : 'low',
            description: 'Sample finding for demonstration',
            source: osintModules.find(m => m.id === moduleId)?.sources[0] || 'Unknown'
          }]
        : []

      // Set to complete
      setScanResults(prev => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          status: 'complete',
          data: { target: targetValue, moduleId },
          riskFactors: mockRiskFactors,
          timestamp: new Date().toISOString()
        }
      }))
    }

    setIsScanning(false)
  }

  // Calculate overall risk
  const calculateOverallRisk = (): 'low' | 'medium' | 'high' => {
    const allRisks = Object.values(scanResults)
      .flatMap(r => r.riskFactors || [])

    if (allRisks.some(r => r.level === 'high')) return 'high'
    if (allRisks.filter(r => r.level === 'medium').length >= 2) return 'high'
    if (allRisks.some(r => r.level === 'medium')) return 'medium'
    return 'low'
  }

  const riskColors = {
    low: colors.green,
    medium: colors.yellow,
    high: colors.red,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: colors.text }}>
            <span className="text-3xl">🎩</span>
            <span>
              Lupin III
              <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded" style={{ background: `${colors.purple}22`, color: colors.purple }}>
                Intelligence Suite
              </span>
            </span>
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
            Open Source Intelligence • "In the name of the moon, I'll find it!" • Powered by Trion
          </p>
        </div>

        {/* Output Format Toggle */}
        <div className="flex items-center gap-2 p-1 rounded-lg" style={{ background: colors.surface }}>
          {[
            { id: 'graph', icon: '🕸️', label: 'Graph' },
            { id: 'report', icon: '📄', label: 'Report' },
            { id: 'json', icon: '{ }', label: 'JSON' },
          ].map(format => (
            <button
              key={format.id}
              onClick={() => setOutputFormat(format.id as OutputFormat)}
              className="px-3 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                background: outputFormat === format.id ? colors.accent : 'transparent',
                color: outputFormat === format.id ? colors.text : colors.textMuted,
              }}
            >
              {format.icon} {format.label}
            </button>
          ))}
        </div>
      </div>

      {/* Investigation Type Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setInvestigationType('competitive_intel')
            setSelectedModules([])
          }}
          className="p-4 rounded-xl text-left transition-all"
          style={{
            background: investigationType === 'competitive_intel' ? `${colors.blue}22` : colors.surface,
            border: `2px solid ${investigationType === 'competitive_intel' ? colors.blue : colors.border}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📈</span>
            <span className="font-semibold" style={{ color: colors.text }}>Competitive Intelligence</span>
          </div>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Marketing strategy, tech stack, ad campaigns, SEO analysis, social presence
          </p>
        </button>

        <button
          onClick={() => {
            setInvestigationType('due_diligence')
            setSelectedModules([])
          }}
          className="p-4 rounded-xl text-left transition-all"
          style={{
            background: investigationType === 'due_diligence' ? `${colors.purple}22` : colors.surface,
            border: `2px solid ${investigationType === 'due_diligence' ? colors.purple : colors.border}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔎</span>
            <span className="font-semibold" style={{ color: colors.text }}>Due Diligence</span>
          </div>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Identity verification, court records, breach exposure, corporate filings, risk assessment
          </p>
        </button>
      </div>

      {/* Target Input */}
      <div className="p-4 rounded-xl" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium" style={{ color: colors.textMuted }}>Target Type:</span>
          {[
            { id: 'person', icon: '👤', label: 'Person' },
            { id: 'company', icon: '🏢', label: 'Company' },
            { id: 'domain', icon: '🌐', label: 'Domain' },
            { id: 'phone', icon: '📞', label: 'Phone' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setTargetType(type.id as TargetType)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: targetType === type.id ? `${colors.accent}22` : 'transparent',
                border: `1px solid ${targetType === type.id ? colors.accent : colors.border}`,
                color: targetType === type.id ? colors.accent : colors.textMuted,
              }}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={
              targetType === 'person' ? 'Enter name or email...' :
              targetType === 'company' ? 'Enter company name...' :
              targetType === 'phone' ? 'Enter phone number (e.g., +1 555-123-4567)...' :
              'Enter domain (e.g., example.com)...'
            }
            className="flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
          <button
            onClick={executeScan}
            disabled={isScanning || !targetValue.trim() || selectedModules.length === 0}
            className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{
              background: colors.accent,
              color: colors.text,
            }}
          >
            {isScanning ? '🔄 Scanning...' : '🚀 Execute Scan'}
          </button>
        </div>
      </div>

      {/* Scan Depth */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium" style={{ color: colors.textMuted }}>Scan Depth:</span>
        {[
          { id: 'quick', label: 'Quick Scan', time: '~30s', modules: 3 },
          { id: 'standard', label: 'Standard', time: '~2min', modules: 6 },
          { id: 'deep', label: 'Deep Dive', time: '~5min', modules: 'All' },
        ].map(depth => (
          <button
            key={depth.id}
            onClick={() => handleDepthChange(depth.id as ScanDepth)}
            className="px-4 py-2 rounded-lg text-sm transition-all"
            style={{
              background: scanDepth === depth.id ? `${colors.accent}22` : colors.surface,
              border: `1px solid ${scanDepth === depth.id ? colors.accent : colors.border}`,
              color: scanDepth === depth.id ? colors.accent : colors.textMuted,
            }}
          >
            <div className="font-medium">{depth.label}</div>
            <div className="text-xs opacity-70">{depth.time} • {depth.modules} modules</div>
          </button>
        ))}
      </div>

      {/* Module Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
            Intelligence Modules ({selectedModules.length} selected)
          </h3>
          <button
            onClick={() => setSelectedModules(selectedModules.length === availableModules.length ? [] : availableModules.map(m => m.id))}
            className="text-xs px-2 py-1 rounded"
            style={{ color: colors.accent }}
          >
            {selectedModules.length === availableModules.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableModules.map(module => {
            const isSelected = selectedModules.includes(module.id)
            const result = scanResults[module.id]

            return (
              <motion.button
                key={module.id}
                onClick={() => !isScanning && toggleModule(module.id)}
                className="p-3 rounded-xl text-left transition-all relative overflow-hidden"
                style={{
                  background: isSelected ? `${module.color}15` : colors.surface,
                  border: `1px solid ${isSelected ? module.color : colors.border}`,
                  opacity: isScanning && !isSelected ? 0.5 : 1,
                }}
                whileHover={{ scale: isScanning ? 1 : 1.02 }}
              >
                {/* Status indicator */}
                {result && (
                  <div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{
                      background: result.status === 'complete' ? colors.green :
                                result.status === 'running' ? colors.yellow :
                                result.status === 'error' ? colors.red : colors.textDim,
                      boxShadow: result.status === 'running' ? `0 0 8px ${colors.yellow}` : 'none',
                    }}
                  />
                )}

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{module.icon}</span>
                  <span className="font-medium text-sm" style={{ color: colors.text }}>
                    {module.name}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: colors.textDim }}>
                  {module.description}
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
                  <span>⏱️ {module.estimatedTime}</span>
                  <span>•</span>
                  <span>{module.sources[0]}</span>
                </div>

                {/* Progress bar for running state */}
                {result?.status === 'running' && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1"
                    style={{ background: module.color }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {Object.keys(scanResults).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                {outputFormat === 'graph' && '🕸️ Intelligence Graph'}
                {outputFormat === 'report' && '📄 Intelligence Report'}
                {outputFormat === 'json' && '{ } Raw Data'}
              </h3>

              {!isScanning && Object.values(scanResults).every(r => r.status === 'complete') && (
                <div className="flex items-center gap-3">
                  <div
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      background: `${riskColors[calculateOverallRisk()]}22`,
                      color: riskColors[calculateOverallRisk()],
                      border: `1px solid ${riskColors[calculateOverallRisk()]}44`,
                    }}
                  >
                    Risk: {calculateOverallRisk().toUpperCase()}
                  </div>
                  <button
                    onClick={() => setShowReportViewer(true)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{ background: colors.blue, color: colors.text }}
                  >
                    📄 View Report
                  </button>
                  <button
                    onClick={() => {
                      setSavedToVault(true)
                      setTimeout(() => setSavedToVault(false), 2000)
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{
                      background: savedToVault ? colors.green : colors.purple,
                      color: colors.text
                    }}
                  >
                    {savedToVault ? '✓ Saved!' : '🏛️ Save to Vault'}
                  </button>
                  <button
                    onClick={() => setShowReportViewer(true)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{ background: colors.accent, color: colors.text }}
                  >
                    📥 Export Doc
                  </button>
                </div>
              )}
            </div>

            {/* Graph View */}
            {outputFormat === 'graph' && (
              <div
                className="h-64 rounded-lg flex items-center justify-center"
                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🕸️</div>
                  <p style={{ color: colors.textMuted }}>
                    {isScanning ? 'Building intelligence graph...' : 'Interactive node graph visualization'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textDim }}>
                    Target: {targetValue} • {Object.values(scanResults).filter(r => r.status === 'complete').length} modules complete
                  </p>
                </div>
              </div>
            )}

            {/* Report View */}
            {outputFormat === 'report' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ background: colors.bg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium" style={{ color: colors.accent }}>📋 Executive Summary</span>
                  </div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    Investigation of <strong style={{ color: colors.text }}>{targetValue}</strong> using {selectedModules.length} intelligence modules.
                    {!isScanning && ` Overall risk assessment: ${calculateOverallRisk().toUpperCase()}.`}
                  </p>
                </div>

                {/* Findings by module */}
                {Object.entries(scanResults)
                  .filter(([_, result]) => result.status === 'complete')
                  .map(([moduleId, result]) => {
                    const module = osintModules.find(m => m.id === moduleId)
                    return (
                      <div key={moduleId} className="p-3 rounded-lg" style={{ background: colors.bg }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{module?.icon}</span>
                          <span className="text-sm font-medium" style={{ color: colors.text }}>{module?.name}</span>
                          <span className="text-xs" style={{ color: colors.textDim }}>via {module?.sources[0]}</span>
                        </div>
                        {result.riskFactors && result.riskFactors.length > 0 ? (
                          result.riskFactors.map((risk, i) => (
                            <div key={i} className="flex items-center gap-2 mt-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: riskColors[risk.level] }}
                              />
                              <span className="text-xs" style={{ color: colors.textMuted }}>
                                {risk.description}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs" style={{ color: colors.textDim }}>No significant findings</p>
                        )}
                      </div>
                    )
                  })}

                {/* Compliance Footer */}
                <div className="pt-3 border-t text-center" style={{ borderColor: colors.border }}>
                  <p className="text-xs" style={{ color: colors.textDim }}>
                    ⚠️ NOT FOR FCRA PURPOSES • Generated {new Date().toLocaleString()} • Data from public sources only
                  </p>
                </div>
              </div>
            )}

            {/* JSON View */}
            {outputFormat === 'json' && (
              <pre
                className="p-4 rounded-lg text-xs overflow-auto max-h-64"
                style={{ background: colors.bg, color: colors.green }}
              >
                {JSON.stringify({
                  target: targetValue,
                  targetType,
                  investigationType,
                  timestamp: new Date().toISOString(),
                  results: scanResults,
                  riskAssessment: {
                    overall: calculateOverallRisk(),
                    factors: Object.values(scanResults).flatMap(r => r.riskFactors || [])
                  },
                  compliance: {
                    fcraDisclaimer: 'NOT FOR FCRA PURPOSES',
                    dataRetention: '90 days',
                    sources: 'Public records only'
                  }
                }, null, 2)}
              </pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Modal */}
      <AnimatePresence>
        {showComplianceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setShowComplianceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-lg w-full p-6 rounded-2xl"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚖️</span>
                <h3 className="text-xl font-bold" style={{ color: colors.text }}>Compliance Acknowledgment</h3>
              </div>

              <div className="space-y-3 mb-6 text-sm" style={{ color: colors.textMuted }}>
                <p>Before proceeding, please confirm:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span style={{ color: colors.green }}>✓</span>
                    This investigation is for <strong>legitimate business purposes</strong> (competitive intel, partner vetting, fraud prevention)
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: colors.green }}>✓</span>
                    Results will <strong>NOT</strong> be used for FCRA-regulated decisions (employment, credit, housing, insurance)
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: colors.green }}>✓</span>
                    Data collection is limited to <strong>publicly available sources</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: colors.green }}>✓</span>
                    An audit log will be maintained for compliance purposes
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowComplianceModal(false)}
                  className="flex-1 py-3 rounded-lg font-medium"
                  style={{ background: colors.bg, color: colors.textMuted, border: `1px solid ${colors.border}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setComplianceAcknowledged(true)
                    setShowComplianceModal(false)
                    executeScan()
                  }}
                  className="flex-1 py-3 rounded-lg font-medium"
                  style={{ background: colors.accent, color: colors.text }}
                >
                  I Acknowledge & Proceed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Viewer Modal */}
      <AnimatePresence>
        {showReportViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)' }}
            onClick={() => setShowReportViewer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              onClick={e => e.stopPropagation()}
            >
              {/* Report Header */}
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: colors.text }}>Intelligence Report</h3>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      {targetType === 'person' ? '👤' : targetType === 'company' ? '🏢' : targetType === 'phone' ? '📞' : '🌐'} {targetValue}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsExporting(true)
                      setTimeout(() => {
                        setIsExporting(false)
                        // Simulate doc generation
                        alert('Report exported to Document! (In production, this would generate a DOCX file)')
                      }, 1500)
                    }}
                    disabled={isExporting}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                    style={{ background: colors.accent, color: colors.text }}
                  >
                    {isExporting ? '⏳ Generating...' : '📄 Export as Doc'}
                  </button>
                  <button
                    onClick={() => {
                      setSavedToVault(true)
                      setTimeout(() => setSavedToVault(false), 2000)
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                    style={{ background: savedToVault ? colors.green : colors.purple, color: colors.text }}
                  >
                    {savedToVault ? '✓ Saved!' : '🏛️ Save to Vault'}
                  </button>
                  <button
                    onClick={() => setShowReportViewer(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <span style={{ color: colors.textMuted }}>✕</span>
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Executive Summary */}
                <section className="p-4 rounded-xl" style={{ background: colors.bg }}>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: colors.accent }}>
                    <span>📋</span> Executive Summary
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
                    This report presents the findings of an intelligence investigation conducted on <strong style={{ color: colors.text }}>{targetValue}</strong>
                    {' '}({targetType}). The investigation utilized {selectedModules.length} intelligence modules across{' '}
                    {Array.from(new Set(selectedModules.map(id => osintModules.find(m => m.id === id)?.category))).length} categories.
                    The overall risk assessment is rated as <strong style={{ color: riskColors[calculateOverallRisk()] }}>{calculateOverallRisk().toUpperCase()}</strong>.
                  </p>
                </section>

                {/* Risk Overview */}
                <section className="p-4 rounded-xl" style={{ background: colors.bg }}>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: colors.red }}>
                    <span>⚠️</span> Risk Assessment
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {(['low', 'medium', 'high'] as const).map(level => {
                      const count = Object.values(scanResults)
                        .flatMap(r => r.riskFactors || [])
                        .filter(f => f.level === level).length
                      return (
                        <div
                          key={level}
                          className="p-3 rounded-lg text-center"
                          style={{ background: `${riskColors[level]}15`, border: `1px solid ${riskColors[level]}33` }}
                        >
                          <div className="text-2xl font-bold" style={{ color: riskColors[level] }}>{count}</div>
                          <div className="text-xs uppercase" style={{ color: colors.textMuted }}>{level} Risk</div>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Module Findings */}
                <section className="p-4 rounded-xl" style={{ background: colors.bg }}>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.blue }}>
                    <span>🔍</span> Detailed Findings by Module
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(scanResults)
                      .filter(([_, result]) => result.status === 'complete')
                      .map(([moduleId, result]) => {
                        const module = osintModules.find(m => m.id === moduleId)
                        return (
                          <div
                            key={moduleId}
                            className="p-4 rounded-lg"
                            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{module?.icon}</span>
                                <span className="font-medium" style={{ color: colors.text }}>{module?.name}</span>
                              </div>
                              <span className="text-xs px-2 py-1 rounded" style={{ background: `${module?.color}22`, color: module?.color }}>
                                {module?.category}
                              </span>
                            </div>
                            <p className="text-sm mb-2" style={{ color: colors.textDim }}>{module?.description}</p>
                            <div className="text-xs mb-3" style={{ color: colors.textMuted }}>
                              Sources: {module?.sources.join(', ')}
                            </div>
                            {result.riskFactors && result.riskFactors.length > 0 ? (
                              <div className="space-y-2">
                                {result.riskFactors.map((risk, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-2 p-2 rounded"
                                    style={{ background: `${riskColors[risk.level]}10` }}
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                      style={{ background: riskColors[risk.level] }}
                                    />
                                    <div>
                                      <span className="text-xs font-medium uppercase" style={{ color: riskColors[risk.level] }}>
                                        {risk.level} risk
                                      </span>
                                      <p className="text-sm" style={{ color: colors.textMuted }}>{risk.description}</p>
                                      <span className="text-xs" style={{ color: colors.textDim }}>Source: {risk.source}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm italic" style={{ color: colors.green }}>
                                ✓ No significant findings
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </section>

                {/* Methodology */}
                <section className="p-4 rounded-xl" style={{ background: colors.bg }}>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: colors.purple }}>
                    <span>🔬</span> Methodology
                  </h4>
                  <p className="text-sm mb-3" style={{ color: colors.textMuted }}>
                    This investigation was conducted using the Lupin III Intelligence Suite, which aggregates data from multiple
                    open-source intelligence (OSINT) providers. The scan depth was set to <strong style={{ color: colors.text }}>{scanDepth}</strong>,
                    which engaged {selectedModules.length} modules.
                  </p>
                  <div className="text-xs" style={{ color: colors.textDim }}>
                    <strong>Modules Used:</strong> {selectedModules.map(id => osintModules.find(m => m.id === id)?.name).join(', ')}
                  </div>
                </section>

                {/* Compliance Footer */}
                <section className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: colors.yellow }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: colors.yellow }}>Compliance Disclaimer</h4>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        <strong>NOT FOR FCRA PURPOSES.</strong> This report is intended for legitimate business intelligence
                        purposes only, including competitive analysis, partner vetting, and fraud prevention. This report
                        should NOT be used for employment screening, tenant screening, credit decisions, or insurance
                        underwriting. Data sourced exclusively from publicly available records.
                      </p>
                      <p className="text-xs mt-2" style={{ color: colors.textDim }}>
                        Generated: {new Date().toLocaleString()} • Report ID: LUPIN-{Date.now().toString(36).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
