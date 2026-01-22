'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SolusLogo from './components/SolusLogo'
import BlackHoleGate from './components/BlackHoleGate'
import HyperspeedTransition from './components/HyperspeedTransition'
import EmailCampaignWorkflow from './components/EmailCampaignWorkflow'
import VideoNodeWorkflow from './components/VideoNodeWorkflow'
import ImageNodeWorkflow from './components/ImageNodeWorkflow'
import AudioNodeWorkflow from './components/AudioNodeWorkflow'
import ThreeDWorkflow from './components/ThreeDWorkflow'
import ResearchWorkflow from './components/ResearchWorkflow'
import AutomationNodeWorkflow from './components/AutomationNodeWorkflow'
import PromptVaultWorkflow from './components/PromptVaultWorkflow'
import InfluencerSuiteWorkflow from './components/InfluencerSuiteWorkflow'
import SocialPaidAdsWorkflow from './components/SocialPaidAdsWorkflow'
import EmailAutomationWorkflow from './components/EmailAutomationWorkflow'
import SocialAdsAutomationWorkflow from './components/SocialAdsAutomationWorkflow'
import OSINTWorkflow from './components/OSINTWorkflow'
import CrucibleLanding from './components/CrucibleLanding'
import RadialWipeTransition, { useRadialWipe } from './components/RadialWipeTransition'
import {
  Eye as EyeIcon,
  Compass as CompassIcon,
  MagnifyingGlass as MagnifyingGlassIcon,
  Scales as ScalesIcon,
  Sparkle as SparkleIcon,
  Brain as BrainIcon,
  EnvelopeSimple as EnvelopeIcon,
  FilmSlate as FilmSlateIcon,
  PaintBrush as PaintBrushIcon,
  User as UserIcon,
  DeviceMobile as DeviceMobileIcon,
  MusicNotes as MusicNotesIcon,
  Cube as CubeIcon,
  Flask as FlaskIcon,
  Lightning as LightningIcon,
  ArrowsClockwise as ArrowsClockwiseIcon,
  ChartBar as ChartBarIcon,
  Vault as VaultIcon,
  Detective as DetectiveIcon,
  CaretDoubleLeft as CaretDoubleLeftIcon,
} from '@phosphor-icons/react'

type IntentId = 'email_campaign' | 'video_production' | 'image_generation' | 'audio' | '3d_assets' | 'research' | 'automation' | 'prompt_vault' | 'influencer_suite' | 'social_paid_ads' | 'email_automation' | 'social_ads_automation' | 'lupin_iii' | null

// SOLUS color palette - Darker, more cinematic
const colors = {
  bg: '#0A0A0A',
  bgWarm: '#141010',
  surface: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
  accent: '#FF6B00',
  accentCoral: '#FF8C00',
  accentAmber: '#F59E0B',
  accentTaupe: '#E85D04',
}

// Agent icon mapping for workspace header
const agentIcons: Record<string, typeof EyeIcon> = {
  solus: EyeIcon,
  quintus: CompassIcon,
  trion: MagnifyingGlassIcon,
  lathe: ScalesIcon,
  alchemist: SparkleIcon,
  cortex: BrainIcon,
}

const agentColors: Record<string, string> = {
  solus: '#8B5CF6',
  quintus: '#06B6D4',
  trion: '#10B981',
  lathe: '#F59E0B',
  alchemist: '#EC4899',
  cortex: '#EF4444',
}

const workflows = [
  { id: 'email_campaign', icon: EnvelopeIcon, title: 'Email Campaign', subtitle: 'Figma templates, copy, AI images', color: colors.accent },
  { id: 'video_production', icon: FilmSlateIcon, title: 'Video Production', subtitle: 'AI video generation & editing', color: colors.accentCoral },
  { id: 'image_generation', icon: PaintBrushIcon, title: 'Image Generation', subtitle: 'Concept art & product shots', color: colors.accentAmber },
  { id: 'influencer_suite', icon: UserIcon, title: 'Influencer Suite', subtitle: 'LoRA training & clothing swap', color: '#E1306C' },
  { id: 'social_paid_ads', icon: DeviceMobileIcon, title: 'Social Paid Ads', subtitle: 'Multi-format ad creation', color: '#1877F2' },
  { id: 'audio', icon: MusicNotesIcon, title: 'Audio Production', subtitle: 'Music, SFX & voiceover', color: colors.accent },
  { id: '3d_assets', icon: CubeIcon, title: '3D Assets', subtitle: 'Models, textures & scenes', color: colors.accentCoral },
  { id: 'research', icon: FlaskIcon, title: 'Research', subtitle: 'Parallel AI research', color: colors.accentAmber },
  { id: 'automation', icon: LightningIcon, title: 'Automation', subtitle: 'Custom workflows', color: colors.accentTaupe },
  { id: 'email_automation', icon: ArrowsClockwiseIcon, title: 'Email Automation', subtitle: 'Node-based email flows', color: '#3B82F6' },
  { id: 'social_ads_automation', icon: ChartBarIcon, title: 'Social Ads Automation', subtitle: 'Auto-optimize campaigns', color: '#EC4899' },
  { id: 'prompt_vault', icon: VaultIcon, title: 'Prompt Vault', subtitle: 'Pony, SDXL & LoRA prompts', color: '#FF69B4' },
  { id: 'lupin_iii', icon: DetectiveIcon, title: 'Lupin III', subtitle: 'OSINT & Intelligence Suite', color: '#8B5CF6' },
]

export default function Home() {
  const [authPhase, setAuthPhase] = useState<'gate' | 'hyperspeed' | 'authenticated'>('gate')
  const [selectedIntent, setSelectedIntent] = useState<IntentId>(null)
  const [showLanding, setShowLanding] = useState(true)
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['solus', 'trion'])
  const [scrollToWorkflows, setScrollToWorkflows] = useState(false)
  const { isTransitioning, transitionOrigin, triggerTransition, handleComplete } = useRadialWipe()

  // Password gate with hyperspeed transition
  if (authPhase === 'gate') {
    return (
      <BlackHoleGate
        password="liberateme"
        onUnlock={() => setAuthPhase('hyperspeed')}
      />
    )
  }

  // Hyperspeed transition after password
  if (authPhase === 'hyperspeed') {
    return (
      <HyperspeedTransition
        isActive={true}
        onComplete={() => setAuthPhase('authenticated')}
      />
    )
  }

  const handleSelectIntent = (intentId: string, event?: React.MouseEvent) => {
    // Get click position for radial wipe origin
    const origin = event
      ? {
          x: (event.clientX / window.innerWidth) * 100,
          y: (event.clientY / window.innerHeight) * 100,
        }
      : { x: 50, y: 50 }

    // Trigger transition, then switch view
    triggerTransition(origin, () => {
      setSelectedIntent(intentId as IntentId)
      setShowLanding(false)
    })
  }

  const handleBackToLanding = () => {
    triggerTransition({ x: 10, y: 5 }, () => {
      setSelectedIntent(null)
      setScrollToWorkflows(true)  // Return to workflow selection, not eye
      setShowLanding(true)
    })
  }

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const handlePromptSubmit = (prompt: string) => {
    console.log('Processing prompt:', prompt)
    // Could auto-detect intent and route to appropriate workflow
  }

  return (
    <div className="min-h-screen relative" style={{ background: colors.bg, color: colors.text }}>
      {/* Radial Wipe Transition */}
      <RadialWipeTransition
        isActive={isTransitioning}
        origin={transitionOrigin}
        color={colors.accent}
        duration={0.8}
        onComplete={handleComplete}
      />

      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header - handled by CrucibleLanding */}

            {/* Crucible Landing with floating agents */}
            <CrucibleLanding
              selectedAgents={selectedAgents}
              onAgentSelect={handleAgentSelect}
              onPromptSubmit={handlePromptSubmit}
              onWorkflowSelect={(workflowId) => handleSelectIntent(workflowId)}
              initialScrollToWorkflows={scrollToWorkflows}
            />
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {/* Workspace Header */}
            <header
              className="sticky top-0 z-50 backdrop-blur-xl border-b"
              style={{
                background: `${colors.bg}ee`,
                borderColor: colors.border,
              }}
            >
              <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Back button with arcana-colored icon */}
                {(() => {
                  const activeWorkflow = workflows.find(w => w.id === selectedIntent)
                  const arcanaColor = activeWorkflow?.color || colors.accent
                  return (
                    <button
                      onClick={handleBackToLanding}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
                      style={{ color: arcanaColor }}
                    >
                      <CaretDoubleLeftIcon size={20} weight="bold" color={arcanaColor} />
                    </button>
                  )
                })()}

                {/* Active workflow badge - right side only */}
                <div className="flex items-center gap-3">
                  {(() => {
                    const activeWorkflow = workflows.find(w => w.id === selectedIntent)
                    if (!activeWorkflow) return null
                    const WorkflowIcon = activeWorkflow.icon
                    return (
                      <div
                        className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                        style={{
                          background: `${activeWorkflow.color}22`,
                          color: activeWorkflow.color,
                          border: `1px solid ${activeWorkflow.color}44`,
                        }}
                      >
                        <WorkflowIcon size={18} weight="duotone" color={activeWorkflow.color} />
                        {activeWorkflow.title}
                      </div>
                    )
                  })()}

                  {/* Agent status */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: colors.surface }}
                  >
                    <div className="flex -space-x-2">
                      {selectedAgents.slice(0, 3).map(agentId => {
                        const AgentIcon = agentIcons[agentId] || EyeIcon
                        const agentColor = agentColors[agentId] || colors.textMuted
                        return (
                          <div
                            key={agentId}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                          >
                            <AgentIcon size={14} weight="duotone" color={agentColor} />
                          </div>
                        )
                      })}
                    </div>
                    <span className="text-xs" style={{ color: colors.textMuted }}>
                      {selectedAgents.length} active
                    </span>
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: colors.accent }}
                    />
                  </div>
                </div>
              </div>
            </header>

            {/* Workspace Content */}
            <main className="max-w-7xl mx-auto px-6 py-6">
              {selectedIntent === 'email_campaign' && <EmailCampaignWorkflow />}
              {selectedIntent === 'video_production' && <VideoNodeWorkflow />}
              {selectedIntent === 'image_generation' && <ImageNodeWorkflow />}
              {selectedIntent === 'influencer_suite' && <InfluencerSuiteWorkflow />}
              {selectedIntent === 'social_paid_ads' && <SocialPaidAdsWorkflow />}
              {selectedIntent === 'audio' && <AudioNodeWorkflow />}
              {selectedIntent === '3d_assets' && <ThreeDWorkflow />}
              {selectedIntent === 'research' && <ResearchWorkflow />}
              {selectedIntent === 'automation' && <AutomationNodeWorkflow />}
              {selectedIntent === 'email_automation' && <EmailAutomationWorkflow />}
              {selectedIntent === 'social_ads_automation' && <SocialAdsAutomationWorkflow />}
              {selectedIntent === 'prompt_vault' && <PromptVaultWorkflow />}
              {selectedIntent === 'lupin_iii' && <OSINTWorkflow />}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
