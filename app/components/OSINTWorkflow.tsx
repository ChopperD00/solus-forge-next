'use client'

import { useState, useCallback } from 'react'
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

// TIER 1 - FREE/Open-Source OSINT Tools
const osintModules: OSINTModule[] = [
  // Identity & Verification - TIER 1 FREE
  {
    id: 'maigret_search',
    name: 'Maigret Search',
    icon: '🔎',
    description: 'Username search across 1,366+ sites (open-source)',
    category: 'identity',
    sources: ['Maigret (OSS)', '1,366 sites'],
    color: colors.purple,
    estimatedTime: '45s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'social_analyzer',
    name: 'Social Analyzer',
    icon: '📊',
    description: 'Profile analysis across 1,000+ sites with detection',
    category: 'identity',
    sources: ['Social Analyzer (OSS)', '1,000+ sites'],
    color: colors.blue,
    estimatedTime: '60s',
    forTypes: ['due_diligence', 'competitive_intel'],
  },
  {
    id: 'holehe_email',
    name: 'Holehe Email Recon',
    icon: '📧',
    description: 'Check if email is registered on 120+ sites',
    category: 'identity',
    sources: ['Holehe (OSS)', '120+ sites'],
    color: colors.cyan,
    estimatedTime: '30s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'phoneinfoga',
    name: 'PhoneInfoga',
    icon: '📱',
    description: 'Phone number OSINT - carrier, location, reputation',
    category: 'identity',
    sources: ['PhoneInfoga (OSS)', 'NumVerify'],
    color: colors.green,
    estimatedTime: '25s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'face_search',
    name: 'Face/Image Intel',
    icon: '🖼️',
    description: 'Reverse image search via Yandex, Google, TinEye',
    category: 'identity',
    sources: ['Yandex Images', 'Google Images', 'TinEye'],
    color: '#E1306C',
    estimatedTime: '20s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'breach_check',
    name: 'HIBP Breach Check',
    icon: '🔓',
    description: 'Check for compromised credentials (HaveIBeenPwned)',
    category: 'identity',
    sources: ['HaveIBeenPwned (Free API)'],
    color: colors.red,
    estimatedTime: '10s',
    forTypes: ['due_diligence'],
  },
  // Technical & Domain - TIER 1 FREE
  {
    id: 'dnsdumpster',
    name: 'DNSDumpster',
    icon: '🌐',
    description: 'DNS recon, subdomains, MX records, hosting',
    category: 'technical',
    sources: ['DNSDumpster (Free)', 'DNS Records'],
    color: colors.accent,
    estimatedTime: '20s',
    forTypes: ['due_diligence', 'competitive_intel'],
  },
  {
    id: 'crtsh_ssl',
    name: 'SSL Certificate Search',
    icon: '🔒',
    description: 'Certificate transparency logs, subdomains via crt.sh',
    category: 'technical',
    sources: ['crt.sh (Free)', 'CT Logs'],
    color: colors.yellow,
    estimatedTime: '15s',
    forTypes: ['due_diligence', 'competitive_intel'],
  },
  {
    id: 'tech_stack',
    name: 'Technology Stack',
    icon: '⚙️',
    description: 'CMS, frameworks, analytics, marketing tools',
    category: 'technical',
    sources: ['Wappalyzer (OSS)', 'BuiltWith'],
    color: colors.yellow,
    estimatedTime: '15s',
    forTypes: ['competitive_intel'],
  },
  // Corporate & Legal - TIER 1 FREE
  {
    id: 'company_records',
    name: 'Corporate Records',
    icon: '🏢',
    description: 'Business filings, officers, registered agents',
    category: 'corporate',
    sources: ['OpenCorporates (Free)', 'SEC EDGAR'],
    color: colors.green,
    estimatedTime: '25s',
    forTypes: ['due_diligence', 'competitive_intel'],
  },
  {
    id: 'judyrecords',
    name: 'Judyrecords Search',
    icon: '⚖️',
    description: 'Search 630M+ US court cases (free)',
    category: 'legal',
    sources: ['Judyrecords (Free)', '630M+ records'],
    color: colors.red,
    estimatedTime: '35s',
    forTypes: ['due_diligence'],
  },
  {
    id: 'open_sanctions',
    name: 'OpenSanctions',
    icon: '🚫',
    description: 'Sanctions lists, PEPs, watchlists (open database)',
    category: 'legal',
    sources: ['OpenSanctions (OSS)', 'Global Lists'],
    color: colors.red,
    estimatedTime: '15s',
    forTypes: ['due_diligence'],
  },
  // Social & Marketing Intel - FREE
  {
    id: 'social_presence',
    name: 'Social Presence',
    icon: '📱',
    description: 'Profile analysis, follower metrics, engagement',
    category: 'social',
    sources: ['Social Blade', 'Public APIs'],
    color: '#E1306C',
    estimatedTime: '30s',
    forTypes: ['competitive_intel', 'due_diligence'],
  },
  {
    id: 'ad_intelligence',
    name: 'Ad Library Search',
    icon: '📊',
    description: 'Active ad campaigns from Meta & Google (free)',
    category: 'social',
    sources: ['Meta Ad Library', 'Google Ads Transparency'],
    color: '#1877F2',
    estimatedTime: '20s',
    forTypes: ['competitive_intel'],
  },
  {
    id: 'news_sentiment',
    name: 'News & Sentiment',
    icon: '📰',
    description: 'Media coverage, press releases, sentiment analysis',
    category: 'social',
    sources: ['Google News', 'Reddit'],
    color: colors.purple,
    estimatedTime: '20s',
    forTypes: ['due_diligence', 'competitive_intel'],
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

// Social media platforms for handle search
const socialPlatforms = [
  { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: '#000000', urlFormat: 'twitter.com/' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E1306C', urlFormat: 'instagram.com/' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000', urlFormat: 'tiktok.com/@' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', urlFormat: 'linkedin.com/in/' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: '#1877F2', urlFormat: 'facebook.com/' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000', urlFormat: 'youtube.com/@' },
  { id: 'threads', name: 'Threads', icon: '🧵', color: '#000000', urlFormat: 'threads.net/@' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#E60023', urlFormat: 'pinterest.com/' },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', color: '#FFFC00', urlFormat: 'snapchat.com/add/' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', color: '#FF4500', urlFormat: 'reddit.com/user/' },
  { id: 'twitch', name: 'Twitch', icon: '🎮', color: '#9146FF', urlFormat: 'twitch.tv/' },
  { id: 'github', name: 'GitHub', icon: '💻', color: '#333333', urlFormat: 'github.com/' },
]

interface SocialHandleResult {
  platform: string
  found: boolean
  url?: string
  followers?: string
  posts?: string
  verified?: boolean
  lastActive?: string
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

  // Social media handle search state
  const [showHandleSearch, setShowHandleSearch] = useState(false)
  const [handleSearchQuery, setHandleSearchQuery] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(socialPlatforms.map(p => p.id))
  const [isSearchingHandles, setIsSearchingHandles] = useState(false)
  const [handleResults, setHandleResults] = useState<SocialHandleResult[]>([])

  // Face/Image search state
  const [showFaceSearch, setShowFaceSearch] = useState(false)
  const [faceSearchUrl, setFaceSearchUrl] = useState('')
  const [isSearchingFace, setIsSearchingFace] = useState(false)
  const [faceSearchResults, setFaceSearchResults] = useState<{ engine: string; url: string; status: 'pending' | 'ready' }[]>([])
  const [activeImageEngine, setActiveImageEngine] = useState<string | null>(null)
  const [imageFindings, setImageFindings] = useState<{ engine: string; note: string; matches: number }[]>([])

  // Judyrecords search state
  const [showJudyrecords, setShowJudyrecords] = useState(false)
  const [judyQuery, setJudyQuery] = useState('')
  const [judyState, setJudyState] = useState('all')
  const [isSearchingJudy, setIsSearchingJudy] = useState(false)
  const [judyResults, setJudyResults] = useState<{ caseNumber: string; court: string; parties: string; date: string; type: string; summary?: string; amount?: string }[]>([])

  // Intel Vault integration
  const { addTarget, addSocialProfile, addBreachResult, addCourtRecord, addFaceMatch, getFullIntelForTarget } = useIntelVault()
  const [currentTargetId, setCurrentTargetId] = useState<string | null>(null)

  // Inline report viewer state
  const [showInlineReport, setShowInlineReport] = useState(false)

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

  // Social media handle search function
  const searchSocialHandles = async () => {
    if (!handleSearchQuery.trim()) return

    setIsSearchingHandles(true)
    setHandleResults([])

    // Simulate searching each platform
    const results: SocialHandleResult[] = []

    // Platform-specific realistic ranges
    const platformMetrics: Record<string, { followersRange: [number, number], postsRange: [number, number], activeWeight: number }> = {
      twitter: { followersRange: [100, 50000], postsRange: [50, 10000], activeWeight: 0.8 },
      instagram: { followersRange: [200, 100000], postsRange: [20, 2000], activeWeight: 0.9 },
      tiktok: { followersRange: [500, 500000], postsRange: [10, 500], activeWeight: 0.95 },
      linkedin: { followersRange: [50, 5000], postsRange: [5, 200], activeWeight: 0.6 },
      facebook: { followersRange: [100, 10000], postsRange: [30, 1000], activeWeight: 0.5 },
      youtube: { followersRange: [100, 100000], postsRange: [10, 500], activeWeight: 0.7 },
      threads: { followersRange: [50, 20000], postsRange: [5, 300], activeWeight: 0.85 },
      pinterest: { followersRange: [50, 50000], postsRange: [100, 5000], activeWeight: 0.4 },
      snapchat: { followersRange: [100, 10000], postsRange: [0, 0], activeWeight: 0.7 },
      reddit: { followersRange: [10, 50000], postsRange: [5, 2000], activeWeight: 0.6 },
      twitch: { followersRange: [50, 100000], postsRange: [10, 1000], activeWeight: 0.5 },
      github: { followersRange: [5, 5000], postsRange: [10, 500], activeWeight: 0.4 },
    }

    for (const platformId of selectedPlatforms) {
      const platform = socialPlatforms.find(p => p.id === platformId)
      if (!platform) continue

      // Simulate API delay
      await new Promise(r => setTimeout(r, 150 + Math.random() * 250))

      const metrics = platformMetrics[platformId] || { followersRange: [100, 10000], postsRange: [10, 500], activeWeight: 0.5 }

      // More realistic found probability based on platform
      const foundProbability = platformId === 'linkedin' ? 0.6 :
                              platformId === 'github' ? 0.5 :
                              platformId === 'snapchat' ? 0.4 : 0.7
      const found = Math.random() < foundProbability

      // Generate realistic follower counts with proper formatting
      const generateCount = (range: [number, number]) => {
        const value = range[0] + Math.floor(Math.random() * (range[1] - range[0]))
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
        return value.toString()
      }

      // Generate realistic activity
      const activityOptions = metrics.activeWeight > 0.7
        ? ['Today', 'Today', 'Yesterday', '2 days ago', '3 days ago']
        : metrics.activeWeight > 0.5
          ? ['Yesterday', '3 days ago', 'Last week', 'Last week', '2 weeks ago']
          : ['Last week', '2 weeks ago', 'Last month', 'Last month', '2 months ago']

      const result: SocialHandleResult = {
        platform: platformId,
        found,
        ...(found && {
          url: `https://${platform.urlFormat}${handleSearchQuery}`,
          followers: generateCount(metrics.followersRange),
          posts: metrics.postsRange[1] > 0 ? generateCount(metrics.postsRange) : '-',
          verified: Math.random() > 0.92, // Only ~8% verified
          lastActive: activityOptions[Math.floor(Math.random() * activityOptions.length)],
        }),
      }

      results.push(result)
      setHandleResults([...results])
    }

    setIsSearchingHandles(false)
  }

  // Toggle platform selection
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  // Face/Image reverse search function
  const searchFaceImage = async () => {
    if (!faceSearchUrl.trim()) return

    setIsSearchingFace(true)
    setFaceSearchResults([])

    const engines = [
      { name: 'Yandex Images', urlBase: 'https://yandex.com/images/search?rpt=imageview&url=' },
      { name: 'Google Images', urlBase: 'https://www.google.com/searchbyimage?image_url=' },
      { name: 'TinEye', urlBase: 'https://tineye.com/search?url=' },
    ]

    // Generate search URLs for each engine
    const results = engines.map(engine => ({
      engine: engine.name,
      url: `${engine.urlBase}${encodeURIComponent(faceSearchUrl)}`,
      status: 'ready' as const
    }))

    setFaceSearchResults(results)
    setIsSearchingFace(false)

    // Store in Intel Vault if we have a target
    if (currentTargetId) {
      results.forEach(result => {
        addFaceMatch({
          targetId: currentTargetId,
          sourceImage: faceSearchUrl,
          matchedUrl: result.url,
          platform: result.engine,
          confidence: 0, // User will verify manually
          timestamp: new Date().toISOString()
        })
      })
    }
  }

  // Judyrecords search function
  const searchJudyrecords = async () => {
    if (!judyQuery.trim()) return

    setIsSearchingJudy(true)
    setJudyResults([])

    // Simulate API call (in production, this would call Judyrecords API)
    await new Promise(r => setTimeout(r, 1500))

    // More detailed mock results
    const caseTypes = ['Civil', 'Criminal', 'Bankruptcy', 'Family', 'Small Claims', 'Traffic']
    const courts = [
      'US District Court',
      'Superior Court',
      'Municipal Court',
      'US Bankruptcy Court',
      'Circuit Court',
      'County Court'
    ]
    const stateCode = judyState === 'all' ? ['CA', 'NY', 'TX', 'FL'][Math.floor(Math.random() * 4)] : judyState.toUpperCase()

    const numResults = 3 + Math.floor(Math.random() * 5)
    const mockResults = Array.from({ length: numResults }, (_, i) => {
      const caseType = caseTypes[Math.floor(Math.random() * caseTypes.length)]
      const year = 2020 + Math.floor(Math.random() * 5)
      return {
        caseNumber: `${stateCode}-${year}-${caseType.substring(0, 2).toUpperCase()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
        court: `${stateCode} ${courts[Math.floor(Math.random() * courts.length)]}`,
        parties: i === 0 ? `${judyQuery} vs. State of ${stateCode}` :
                 i === 1 ? `${judyQuery} vs. Various Defendants` :
                 `In re: ${judyQuery}`,
        date: `${year}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
        type: caseType,
        summary: [
          'Contract dispute regarding service agreement',
          'Personal injury claim - motor vehicle accident',
          'Debt collection matter',
          'Landlord-tenant dispute',
          'Employment discrimination complaint',
          'Chapter 7 bankruptcy filing',
          'Breach of fiduciary duty'
        ][Math.floor(Math.random() * 7)],
        amount: caseType === 'Bankruptcy' ? `$${(Math.random() * 500000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` :
                caseType === 'Small Claims' ? `$${(Math.random() * 10000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` :
                Math.random() > 0.5 ? `$${(Math.random() * 100000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : undefined
      }
    })

    setJudyResults(mockResults)
    setIsSearchingJudy(false)

    // Store in Intel Vault if we have a target
    if (currentTargetId) {
      mockResults.forEach(record => {
        addCourtRecord({
          targetId: currentTargetId,
          caseNumber: record.caseNumber,
          court: record.court,
          caseType: record.type,
          filingDate: record.date,
          status: 'Active',
          parties: record.parties.split(' vs. ')
        })
      })
    }
  }

  // Save target to Intel Vault
  const saveToVault = () => {
    if (!targetValue.trim()) return

    // Create target in vault if not exists
    const targetId = addTarget({
      type: targetType,
      value: targetValue,
      displayName: targetValue,
      tags: [investigationType]
    })

    setCurrentTargetId(targetId)
    setSavedToVault(true)
    setTimeout(() => setSavedToVault(false), 2000)
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

      {/* Quick Tools Toggle Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowHandleSearch(!showHandleSearch)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          style={{
            background: showHandleSearch ? `${colors.purple}22` : colors.surface,
            border: `1px solid ${showHandleSearch ? colors.purple : colors.border}`,
            color: showHandleSearch ? colors.purple : colors.textMuted,
          }}
        >
          <span>🔍</span> Username Search
        </button>
        <button
          onClick={() => setShowFaceSearch(!showFaceSearch)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          style={{
            background: showFaceSearch ? `${colors.cyan}22` : colors.surface,
            border: `1px solid ${showFaceSearch ? colors.cyan : colors.border}`,
            color: showFaceSearch ? colors.cyan : colors.textMuted,
          }}
        >
          <span>🖼️</span> Face/Image Search
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${colors.green}22`, color: colors.green }}>NEW</span>
        </button>
        <button
          onClick={() => setShowJudyrecords(!showJudyrecords)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          style={{
            background: showJudyrecords ? `${colors.red}22` : colors.surface,
            border: `1px solid ${showJudyrecords ? colors.red : colors.border}`,
            color: showJudyrecords ? colors.red : colors.textMuted,
          }}
        >
          <span>⚖️</span> Judyrecords
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${colors.green}22`, color: colors.green }}>NEW</span>
        </button>
        {Object.keys(scanResults).length > 0 && !isScanning && (
          <button
            onClick={() => setShowInlineReport(!showInlineReport)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: showInlineReport ? `${colors.blue}22` : colors.surface,
              border: `1px solid ${showInlineReport ? colors.blue : colors.border}`,
              color: showInlineReport ? colors.blue : colors.textMuted,
            }}
          >
            <span>📋</span> {showInlineReport ? 'Hide Report' : 'Preview Report'}
          </button>
        )}
      </div>

      {/* Social Media Handle Search Panel */}
      <AnimatePresence>
        {showHandleSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl" style={{ background: `${colors.purple}11`, border: `1px solid ${colors.purple}33` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔎</span>
                <div>
                  <h3 className="font-semibold" style={{ color: colors.text }}>Social Media Handle Search</h3>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Search for a username across multiple platforms simultaneously</p>
                </div>
              </div>

              {/* Search Input */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">@</span>
                  <input
                    type="text"
                    value={handleSearchQuery}
                    onChange={(e) => setHandleSearchQuery(e.target.value.replace(/^@/, ''))}
                    placeholder="Enter username (without @)"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none"
                    style={{
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && searchSocialHandles()}
                  />
                </div>
                <button
                  onClick={searchSocialHandles}
                  disabled={isSearchingHandles || !handleSearchQuery.trim()}
                  className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{ background: colors.purple, color: colors.text }}
                >
                  {isSearchingHandles ? '🔄 Searching...' : '🔍 Search All'}
                </button>
              </div>

              {/* Platform Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Select Platforms ({selectedPlatforms.length}/{socialPlatforms.length})</span>
                  <button
                    onClick={() => setSelectedPlatforms(selectedPlatforms.length === socialPlatforms.length ? [] : socialPlatforms.map(p => p.id))}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: colors.purple }}
                  >
                    {selectedPlatforms.length === socialPlatforms.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {socialPlatforms.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5"
                      style={{
                        background: selectedPlatforms.includes(platform.id) ? `${platform.color}22` : colors.surface,
                        border: `1px solid ${selectedPlatforms.includes(platform.id) ? platform.color : colors.border}`,
                        color: selectedPlatforms.includes(platform.id) ? colors.text : colors.textMuted,
                      }}
                    >
                      <span>{platform.icon}</span>
                      <span>{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              {handleResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3" style={{ color: colors.text }}>
                    Results for @{handleSearchQuery}
                    <span className="ml-2 text-xs font-normal" style={{ color: colors.textMuted }}>
                      ({handleResults.filter(r => r.found).length} found / {handleResults.length} checked)
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {handleResults.map(result => {
                      const platform = socialPlatforms.find(p => p.id === result.platform)
                      return (
                        <motion.div
                          key={result.platform}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 rounded-lg"
                          style={{
                            background: result.found ? `${colors.green}11` : colors.surface,
                            border: `1px solid ${result.found ? colors.green : colors.border}33`,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span>{platform?.icon}</span>
                            <span className="text-sm font-medium" style={{ color: colors.text }}>{platform?.name}</span>
                            {result.verified && <span className="text-blue-400 text-xs">✓</span>}
                          </div>
                          {result.found ? (
                            <div className="space-y-1">
                              <div className="text-xs" style={{ color: colors.green }}>✓ Found</div>
                              <div className="text-xs" style={{ color: colors.textMuted }}>
                                {result.followers} followers • {result.posts} posts
                              </div>
                              <div className="text-xs" style={{ color: colors.textDim }}>Active: {result.lastActive}</div>
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs hover:underline"
                                style={{ color: colors.purple }}
                              >
                                View Profile →
                              </a>
                            </div>
                          ) : (
                            <div className="text-xs" style={{ color: colors.textDim }}>Not found</div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face/Image Search Panel */}
      <AnimatePresence>
        {showFaceSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl" style={{ background: `${colors.cyan}11`, border: `1px solid ${colors.cyan}33` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🖼️</span>
                <div>
                  <h3 className="font-semibold" style={{ color: colors.text }}>Face/Image Reverse Search</h3>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Search for image matches across Yandex, Google, and TinEye</p>
                </div>
              </div>

              {/* Image URL Input */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔗</span>
                  <input
                    type="text"
                    value={faceSearchUrl}
                    onChange={(e) => setFaceSearchUrl(e.target.value)}
                    placeholder="Enter image URL (paste direct link to image)"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none"
                    style={{
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && searchFaceImage()}
                  />
                </div>
                <button
                  onClick={searchFaceImage}
                  disabled={isSearchingFace || !faceSearchUrl.trim()}
                  className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{ background: colors.cyan, color: colors.text }}
                >
                  {isSearchingFace ? '🔄 Searching...' : '🔍 Search'}
                </button>
              </div>

              {/* Image Preview */}
              {faceSearchUrl && (
                <div className="mb-4 p-3 rounded-lg" style={{ background: colors.surface }}>
                  <div className="flex items-start gap-4">
                    <img
                      src={faceSearchUrl}
                      alt="Search target"
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="flex-1">
                      <div className="text-xs mb-1" style={{ color: colors.textMuted }}>Target Image</div>
                      <div className="text-xs truncate" style={{ color: colors.textDim }}>{faceSearchUrl}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results with Inline Viewer */}
              {faceSearchResults.length > 0 && (
                <div className="mt-4 space-y-4">
                  {/* Engine Tabs */}
                  <div className="flex gap-2">
                    {faceSearchResults.map(result => (
                      <button
                        key={result.engine}
                        onClick={() => setActiveImageEngine(activeImageEngine === result.engine ? null : result.engine)}
                        className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                        style={{
                          background: activeImageEngine === result.engine ? colors.cyan : colors.surface,
                          color: activeImageEngine === result.engine ? colors.bg : colors.text,
                          border: `1px solid ${activeImageEngine === result.engine ? colors.cyan : colors.border}`,
                        }}
                      >
                        <span>
                          {result.engine === 'Yandex Images' ? '🔴' : result.engine === 'Google Images' ? '🟢' : '🟡'}
                        </span>
                        {result.engine}
                      </button>
                    ))}
                  </div>

                  {/* Embedded Viewer */}
                  {activeImageEngine && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-xl overflow-hidden"
                      style={{ border: `1px solid ${colors.border}` }}
                    >
                      <div className="p-2 flex items-center justify-between" style={{ background: colors.surface }}>
                        <span className="text-xs font-medium" style={{ color: colors.text }}>
                          {activeImageEngine} Results
                        </span>
                        <a
                          href={faceSearchResults.find(r => r.engine === activeImageEngine)?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded hover:opacity-80"
                          style={{ background: colors.cyan, color: colors.bg }}
                        >
                          Open Full Page ↗
                        </a>
                      </div>
                      <iframe
                        src={faceSearchResults.find(r => r.engine === activeImageEngine)?.url}
                        className="w-full h-96 bg-white"
                        sandbox="allow-scripts allow-same-origin"
                        title={`${activeImageEngine} results`}
                      />
                      <div className="p-3" style={{ background: colors.surface }}>
                        <div className="text-xs mb-2" style={{ color: colors.textMuted }}>
                          ⚠️ If results don't load, the site may block embedding. Use "Open Full Page" above.
                        </div>
                        {/* Log Findings */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="# matches"
                            className="w-24 px-3 py-2 rounded text-sm"
                            style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
                            onChange={(e) => {
                              const existing = imageFindings.find(f => f.engine === activeImageEngine)
                              if (existing) {
                                setImageFindings(imageFindings.map(f =>
                                  f.engine === activeImageEngine ? { ...f, matches: parseInt(e.target.value) || 0 } : f
                                ))
                              } else {
                                setImageFindings([...imageFindings, { engine: activeImageEngine, note: '', matches: parseInt(e.target.value) || 0 }])
                              }
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Add notes about findings..."
                            className="flex-1 px-3 py-2 rounded text-sm"
                            style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
                            onChange={(e) => {
                              const existing = imageFindings.find(f => f.engine === activeImageEngine)
                              if (existing) {
                                setImageFindings(imageFindings.map(f =>
                                  f.engine === activeImageEngine ? { ...f, note: e.target.value } : f
                                ))
                              } else {
                                setImageFindings([...imageFindings, { engine: activeImageEngine, note: e.target.value, matches: 0 }])
                              }
                            }}
                          />
                          <button
                            className="px-4 py-2 rounded text-sm font-medium"
                            style={{ background: colors.green, color: colors.bg }}
                            onClick={() => {
                              const finding = imageFindings.find(f => f.engine === activeImageEngine)
                              if (finding && currentTargetId) {
                                addFaceMatch({
                                  targetId: currentTargetId,
                                  sourceImage: faceSearchUrl,
                                  matchedUrl: faceSearchResults.find(r => r.engine === activeImageEngine)?.url || '',
                                  platform: activeImageEngine,
                                  confidence: finding.matches > 0 ? 80 : 0,
                                  timestamp: new Date().toISOString()
                                })
                              }
                            }}
                          >
                            Save Finding
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Findings Summary */}
                  {imageFindings.length > 0 && (
                    <div className="p-3 rounded-lg" style={{ background: colors.surface }}>
                      <h5 className="text-xs font-medium mb-2" style={{ color: colors.text }}>📋 Logged Findings</h5>
                      <div className="space-y-1">
                        {imageFindings.map(f => (
                          <div key={f.engine} className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
                            <span>{f.engine}:</span>
                            <span style={{ color: f.matches > 0 ? colors.green : colors.textDim }}>
                              {f.matches} matches
                            </span>
                            {f.note && <span>• {f.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Judyrecords Search Panel */}
      <AnimatePresence>
        {showJudyrecords && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl" style={{ background: `${colors.red}11`, border: `1px solid ${colors.red}33` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚖️</span>
                <div>
                  <h3 className="font-semibold" style={{ color: colors.text }}>Judyrecords Court Search</h3>
                  <p className="text-xs" style={{ color: colors.textMuted }}>Search 630M+ US court records (free)</p>
                </div>
              </div>

              {/* Search Input */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">👤</span>
                  <input
                    type="text"
                    value={judyQuery}
                    onChange={(e) => setJudyQuery(e.target.value)}
                    placeholder="Enter name, company, or case number"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none"
                    style={{
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && searchJudyrecords()}
                  />
                </div>
                <select
                  value={judyState}
                  onChange={(e) => setJudyState(e.target.value)}
                  className="px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                >
                  <option value="all">All States</option>
                  <option value="ca">California</option>
                  <option value="ny">New York</option>
                  <option value="tx">Texas</option>
                  <option value="fl">Florida</option>
                  <option value="il">Illinois</option>
                </select>
                <button
                  onClick={searchJudyrecords}
                  disabled={isSearchingJudy || !judyQuery.trim()}
                  className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{ background: colors.red, color: colors.text }}
                >
                  {isSearchingJudy ? '🔄 Searching...' : '⚖️ Search'}
                </button>
              </div>

              {/* Results */}
              {judyResults.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium" style={{ color: colors.text }}>
                      Court Records Found
                      <span className="ml-2 text-xs font-normal" style={{ color: colors.textMuted }}>
                        ({judyResults.length} results for "{judyQuery}")
                      </span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: colors.textDim }}>
                        Source: Judyrecords.com
                      </span>
                    </div>
                  </div>

                  {/* Results Summary Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['Civil', 'Criminal', 'Bankruptcy', 'Other'].map(type => {
                      const count = type === 'Other'
                        ? judyResults.filter(r => !['Civil', 'Criminal', 'Bankruptcy'].includes(r.type)).length
                        : judyResults.filter(r => r.type === type).length
                      return (
                        <div key={type} className="p-2 rounded-lg text-center" style={{ background: colors.surface }}>
                          <div className="text-lg font-bold" style={{ color: count > 0 ? colors.text : colors.textDim }}>{count}</div>
                          <div className="text-xs" style={{ color: colors.textMuted }}>{type}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {judyResults.map((record, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-lg"
                        style={{
                          background: colors.surface,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-sm font-semibold" style={{ color: colors.text }}>{record.caseNumber}</span>
                            <div className="text-xs mt-0.5" style={{ color: colors.textDim }}>{record.court}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.amount && (
                              <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${colors.green}22`, color: colors.green }}>
                                {record.amount}
                              </span>
                            )}
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                background: record.type === 'Bankruptcy' ? `${colors.yellow}22` :
                                           record.type === 'Criminal' ? `${colors.red}22` :
                                           record.type === 'Civil' ? `${colors.blue}22` : `${colors.purple}22`,
                                color: record.type === 'Bankruptcy' ? colors.yellow :
                                       record.type === 'Criminal' ? colors.red :
                                       record.type === 'Civil' ? colors.blue : colors.purple
                              }}
                            >
                              {record.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs mb-2" style={{ color: colors.textMuted }}>
                          👥 {record.parties}
                        </div>
                        {record.summary && (
                          <div className="text-xs p-2 rounded" style={{ background: colors.bg, color: colors.textMuted }}>
                            📄 {record.summary}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs" style={{ color: colors.textDim }}>📅 Filed: {record.date}</span>
                          <button
                            onClick={() => {
                              if (currentTargetId) {
                                addCourtRecord({
                                  targetId: currentTargetId,
                                  caseNumber: record.caseNumber,
                                  court: record.court,
                                  caseType: record.type,
                                  filingDate: record.date,
                                  status: 'Active',
                                  parties: record.parties.split(' vs. ')
                                })
                              }
                            }}
                            className="text-xs px-2 py-1 rounded hover:opacity-80"
                            style={{ background: `${colors.purple}22`, color: colors.purple }}
                          >
                            + Save to Vault
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
                    <span className="text-xs" style={{ color: colors.textDim }}>
                      ⚠️ Results are for informational purposes only
                    </span>
                    <a
                      href={`https://www.judyrecords.com/search?q=${encodeURIComponent(judyQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded hover:opacity-80"
                      style={{ background: colors.red, color: colors.text }}
                    >
                      View on Judyrecords ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    onClick={saveToVault}
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

      {/* Inline Report Preview */}
      <AnimatePresence>
        {showInlineReport && Object.keys(scanResults).length > 0 && !isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-6 rounded-xl"
              style={{ background: colors.surface, border: `2px solid ${colors.blue}44` }}
            >
              {/* Report Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: colors.text }}>Intelligence Report Preview</h3>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      {targetType === 'person' ? '👤' : targetType === 'company' ? '🏢' : targetType === 'phone' ? '📞' : '🌐'} {targetValue}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                    style={{ background: colors.accent, color: colors.text }}
                  >
                    📄 Full Report
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="mb-6 p-4 rounded-xl" style={{ background: colors.bg }}>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: colors.accent }}>
                  <span>📋</span> Executive Summary
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
                  Investigation of <strong style={{ color: colors.text }}>{targetValue}</strong> ({targetType}) completed using{' '}
                  {selectedModules.length} intelligence modules. Overall risk: <strong style={{ color: riskColors[calculateOverallRisk()] }}>
                  {calculateOverallRisk().toUpperCase()}</strong>.
                  {Object.values(scanResults).flatMap(r => r.riskFactors || []).length > 0
                    ? ` Found ${Object.values(scanResults).flatMap(r => r.riskFactors || []).length} risk factor(s) requiring attention.`
                    : ' No significant risk factors identified.'}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-3 rounded-lg text-center" style={{ background: colors.bg }}>
                  <div className="text-2xl font-bold" style={{ color: colors.text }}>{selectedModules.length}</div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>Modules Used</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: `${colors.green}11` }}>
                  <div className="text-2xl font-bold" style={{ color: colors.green }}>
                    {Object.values(scanResults).filter(r => r.status === 'complete').length}
                  </div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>Completed</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: `${colors.yellow}11` }}>
                  <div className="text-2xl font-bold" style={{ color: colors.yellow }}>
                    {Object.values(scanResults).flatMap(r => r.riskFactors || []).filter(f => f.level === 'medium').length}
                  </div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>Medium Risks</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: `${colors.red}11` }}>
                  <div className="text-2xl font-bold" style={{ color: colors.red }}>
                    {Object.values(scanResults).flatMap(r => r.riskFactors || []).filter(f => f.level === 'high').length}
                  </div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>High Risks</div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: colors.text }}>
                  <span>🔍</span> Key Findings
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {Object.entries(scanResults)
                    .filter(([_, result]) => result.status === 'complete' && result.riskFactors && result.riskFactors.length > 0)
                    .map(([moduleId, result]) => {
                      const module = osintModules.find(m => m.id === moduleId)
                      return result.riskFactors?.map((risk, i) => (
                        <div
                          key={`${moduleId}-${i}`}
                          className="flex items-start gap-3 p-3 rounded-lg"
                          style={{ background: `${riskColors[risk.level]}11`, border: `1px solid ${riskColors[risk.level]}22` }}
                        >
                          <span
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: riskColors[risk.level] }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium" style={{ color: colors.text }}>{module?.name}</span>
                              <span className="text-xs uppercase px-1.5 py-0.5 rounded" style={{ background: `${riskColors[risk.level]}22`, color: riskColors[risk.level] }}>
                                {risk.level}
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: colors.textMuted }}>{risk.description}</p>
                          </div>
                        </div>
                      ))
                    })}
                  {Object.values(scanResults).flatMap(r => r.riskFactors || []).length === 0 && (
                    <div className="text-center py-6" style={{ color: colors.green }}>
                      <span className="text-2xl">✓</span>
                      <p className="mt-2 text-sm">No significant risk factors identified</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
                <p className="text-xs" style={{ color: colors.textDim }}>
                  ⚠️ NOT FOR FCRA PURPOSES • Generated {new Date().toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveToVault}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{ background: savedToVault ? colors.green : colors.purple, color: colors.text }}
                  >
                    {savedToVault ? '✓ Saved!' : '🏛️ Save to Vault'}
                  </button>
                  <button
                    onClick={() => setShowReportViewer(true)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{ background: colors.blue, color: colors.text }}
                  >
                    📥 Export Doc
                  </button>
                </div>
              </div>
            </div>
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
                    onClick={saveToVault}
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
