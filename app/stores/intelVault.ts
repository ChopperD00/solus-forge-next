'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ==================== TYPES ====================

export interface Target {
  id: string
  type: 'person' | 'company' | 'domain' | 'phone' | 'email' | 'username'
  value: string
  displayName?: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface SocialProfile {
  targetId: string
  platform: string
  username: string
  url: string
  followers?: number
  posts?: number
  verified?: boolean
  lastActive?: string
  profileImage?: string
  bio?: string
}

export interface BreachResult {
  targetId: string
  source: string
  breachName: string
  breachDate: string
  dataTypes: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface DomainIntel {
  targetId: string
  domain: string
  registrar?: string
  createdDate?: string
  expiryDate?: string
  nameservers: string[]
  technologies: string[]
  ipAddresses: string[]
  subdomains: string[]
  sslInfo?: {
    issuer: string
    validFrom: string
    validTo: string
  }
}

export interface FaceMatch {
  targetId: string
  sourceImage: string
  matchedUrl: string
  platform: string
  confidence: number
  timestamp: string
}

export interface CourtRecord {
  targetId: string
  caseNumber: string
  court: string
  caseType: string
  filingDate: string
  status: string
  parties: string[]
  summary?: string
}

export interface ResearchFinding {
  id: string
  targetId: string
  type: 'news' | 'publication' | 'social' | 'legal' | 'financial'
  title: string
  source: string
  url?: string
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  relevanceScore: number
  timestamp: string
}

export interface DeploymentMetric {
  channel: string
  dayOfWeek: number
  hour: number
  engagementRate: number
  conversionRate: number
  reachMultiplier: number
  costEfficiency: number
  sampleSize: number
}

export interface AnalyticsInsight {
  id: string
  type: 'deployment' | 'audience' | 'content' | 'timing'
  title: string
  description: string
  recommendation: string
  impact: 'low' | 'medium' | 'high'
  confidence: number
  dataPoints: number
}

// ==================== STORE ====================

interface IntelVaultState {
  // Targets
  targets: Target[]
  addTarget: (target: Omit<Target, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateTarget: (id: string, updates: Partial<Target>) => void
  removeTarget: (id: string) => void

  // Social Profiles
  socialProfiles: SocialProfile[]
  addSocialProfile: (profile: SocialProfile) => void
  getSocialProfilesForTarget: (targetId: string) => SocialProfile[]

  // Breach Data
  breachResults: BreachResult[]
  addBreachResult: (breach: BreachResult) => void
  getBreachesForTarget: (targetId: string) => BreachResult[]

  // Domain Intel
  domainIntel: DomainIntel[]
  addDomainIntel: (intel: DomainIntel) => void
  getDomainIntelForTarget: (targetId: string) => DomainIntel[]

  // Face Matches
  faceMatches: FaceMatch[]
  addFaceMatch: (match: FaceMatch) => void
  getFaceMatchesForTarget: (targetId: string) => FaceMatch[]

  // Court Records
  courtRecords: CourtRecord[]
  addCourtRecord: (record: CourtRecord) => void
  getCourtRecordsForTarget: (targetId: string) => CourtRecord[]

  // Research Findings
  researchFindings: ResearchFinding[]
  addResearchFinding: (finding: Omit<ResearchFinding, 'id' | 'timestamp'>) => void
  getResearchForTarget: (targetId: string) => ResearchFinding[]

  // Deployment Metrics
  deploymentMetrics: DeploymentMetric[]
  setDeploymentMetrics: (metrics: DeploymentMetric[]) => void
  getBestDeploymentTimes: (channel: string) => { day: number; hour: number; score: number }[]

  // Analytics Insights
  analyticsInsights: AnalyticsInsight[]
  addAnalyticsInsight: (insight: Omit<AnalyticsInsight, 'id'>) => void

  // Cross-workflow utilities
  getFullIntelForTarget: (targetId: string) => {
    target: Target | undefined
    socialProfiles: SocialProfile[]
    breaches: BreachResult[]
    domainIntel: DomainIntel[]
    faceMatches: FaceMatch[]
    courtRecords: CourtRecord[]
    research: ResearchFinding[]
  }

  // Clear all data
  clearAll: () => void
}

export const useIntelVault = create<IntelVaultState>()(
  persist(
    (set, get) => ({
      // Initial state
      targets: [],
      socialProfiles: [],
      breachResults: [],
      domainIntel: [],
      faceMatches: [],
      courtRecords: [],
      researchFindings: [],
      deploymentMetrics: [],
      analyticsInsights: [],

      // Target methods
      addTarget: (target) => {
        const id = `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()
        set(state => ({
          targets: [...state.targets, { ...target, id, createdAt: now, updatedAt: now }]
        }))
        return id
      },

      updateTarget: (id, updates) => {
        set(state => ({
          targets: state.targets.map(t =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          )
        }))
      },

      removeTarget: (id) => {
        set(state => ({
          targets: state.targets.filter(t => t.id !== id),
          socialProfiles: state.socialProfiles.filter(p => p.targetId !== id),
          breachResults: state.breachResults.filter(b => b.targetId !== id),
          domainIntel: state.domainIntel.filter(d => d.targetId !== id),
          faceMatches: state.faceMatches.filter(f => f.targetId !== id),
          courtRecords: state.courtRecords.filter(c => c.targetId !== id),
          researchFindings: state.researchFindings.filter(r => r.targetId !== id),
        }))
      },

      // Social Profiles
      addSocialProfile: (profile) => {
        set(state => ({
          socialProfiles: [...state.socialProfiles.filter(
            p => !(p.targetId === profile.targetId && p.platform === profile.platform)
          ), profile]
        }))
      },

      getSocialProfilesForTarget: (targetId) => {
        return get().socialProfiles.filter(p => p.targetId === targetId)
      },

      // Breach Data
      addBreachResult: (breach) => {
        set(state => ({
          breachResults: [...state.breachResults, breach]
        }))
      },

      getBreachesForTarget: (targetId) => {
        return get().breachResults.filter(b => b.targetId === targetId)
      },

      // Domain Intel
      addDomainIntel: (intel) => {
        set(state => ({
          domainIntel: [...state.domainIntel.filter(
            d => d.targetId !== intel.targetId
          ), intel]
        }))
      },

      getDomainIntelForTarget: (targetId) => {
        return get().domainIntel.filter(d => d.targetId === targetId)
      },

      // Face Matches
      addFaceMatch: (match) => {
        set(state => ({
          faceMatches: [...state.faceMatches, match]
        }))
      },

      getFaceMatchesForTarget: (targetId) => {
        return get().faceMatches.filter(f => f.targetId === targetId)
      },

      // Court Records
      addCourtRecord: (record) => {
        set(state => ({
          courtRecords: [...state.courtRecords, record]
        }))
      },

      getCourtRecordsForTarget: (targetId) => {
        return get().courtRecords.filter(c => c.targetId === targetId)
      },

      // Research Findings
      addResearchFinding: (finding) => {
        const id = `finding_${Date.now()}`
        set(state => ({
          researchFindings: [...state.researchFindings, {
            ...finding,
            id,
            timestamp: new Date().toISOString()
          }]
        }))
      },

      getResearchForTarget: (targetId) => {
        return get().researchFindings.filter(r => r.targetId === targetId)
      },

      // Deployment Metrics
      setDeploymentMetrics: (metrics) => {
        set({ deploymentMetrics: metrics })
      },

      getBestDeploymentTimes: (channel) => {
        const metrics = get().deploymentMetrics.filter(m => m.channel === channel)
        return metrics
          .map(m => ({
            day: m.dayOfWeek,
            hour: m.hour,
            score: (m.engagementRate * 0.3) + (m.conversionRate * 0.4) + (m.reachMultiplier * 0.2) + (m.costEfficiency * 0.1)
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
      },

      // Analytics Insights
      addAnalyticsInsight: (insight) => {
        const id = `insight_${Date.now()}`
        set(state => ({
          analyticsInsights: [...state.analyticsInsights, { ...insight, id }]
        }))
      },

      // Cross-workflow utility
      getFullIntelForTarget: (targetId) => {
        const state = get()
        return {
          target: state.targets.find(t => t.id === targetId),
          socialProfiles: state.socialProfiles.filter(p => p.targetId === targetId),
          breaches: state.breachResults.filter(b => b.targetId === targetId),
          domainIntel: state.domainIntel.filter(d => d.targetId === targetId),
          faceMatches: state.faceMatches.filter(f => f.targetId === targetId),
          courtRecords: state.courtRecords.filter(c => c.targetId === targetId),
          research: state.researchFindings.filter(r => r.targetId === targetId),
        }
      },

      // Clear all
      clearAll: () => {
        set({
          targets: [],
          socialProfiles: [],
          breachResults: [],
          domainIntel: [],
          faceMatches: [],
          courtRecords: [],
          researchFindings: [],
          deploymentMetrics: [],
          analyticsInsights: [],
        })
      },
    }),
    {
      name: 'solus-intel-vault',
    }
  )
)

export default useIntelVault
