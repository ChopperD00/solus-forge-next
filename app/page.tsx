'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SolusLogo from './components/SolusLogo'
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
import CrucibleLanding from './components/CrucibleLanding'
import RadialWipeTransition, { useRadialWipe } from './components/RadialWipeTransition'

type IntentId = 'email_campaign' | 'video_production' | 'image_generation' | 'audio' | '3d_assets' | 'research' | 'automation' | 'prompt_vault' | 'influencer_suite' | 'social_paid_ads' | 'email_automation' | 'social_ads_automation' | null

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

const workflows = [
  { id: 'email_campaign', icon: '📧', title: 'Email Campaign', subtitle: 'Figma templates, copy, AI images', color: colors.accent },
  { id: 'video_production', icon: '🎬', title: 'Video Production', subtitle: 'AI video generation & editing', color: colors.accentCoral },
  { id: 'image_generation', icon: '🎨', title: 'Image Generation', subtitle: 'Concept art & product shots', color: colors.accentAmber },
  { id: 'influencer_suite', icon: '👤', title: 'Influencer Suite', subtitle: 'LoRA training & clothing swap', color: '#E1306C' },
  { id: 'social_paid_ads', icon: '📱', title: 'Social Paid Ads', subtitle: 'Multi-format ad creation', color: '#1877F2' },
  { id: 'audio', icon: '🎵', title: 'Audio Production', subtitle: 'Music, SFX & voiceover', color: colors.accent },
  { id: '3d_assets', icon: '🎲', title: '3D Assets', subtitle: 'Models, textures & scenes', color: colors.accentCoral },
  { id: 'research', icon: '🔬', title: 'Research', subtitle: 'Parallel AI research', color: colors.accentAmber },
  { id: 'automation', icon: '⚡', title: 'Automation', subtitle: 'Custom workflows', color: colors.accentTaupe },
  { id: 'email_automation', icon: '🔄', title: 'Email Automation', subtitle: 'Node-based email flows', color: '#3B82F6' },
  { id: 'social_ads_automation', icon: '📊', title: 'Social Ads Automation', subtitle: 'Auto-optimize campaigns', color: '#EC4899' },
  { id: 'prompt_vault', icon: '🗄️', title: 'Prompt Vault', subtitle: 'Pony, SDXL & LoRA prompts', color: '#FF69B4' },
]

export default function Home() {
  const [selectedIntent, setSelectedIntent] = useState<IntentId>(null)
  const [showLanding, setShowLanding] = useState(true)
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['solus', 'trion'])
  const { isTransitioning, transitionOrigin, triggerTransition, handleComplete } = useRadialWipe()

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
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className="text-xl tracking-wide font-bold brand-text"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentAmber} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    SOLUS FORGE
                  </span>
                  <span
                    className="text-[10px] px-2 py-1 rounded-full"
                    style={{ background: `${colors.accent}22`, color: colors.accent, border: `1px solid ${colors.accent}44` }}
                  >
                    PRE-ALPHA v3.0
                  </span>
                </motion.div>

                {/* Workflow quick access */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  {workflows.slice(0, 4).map((workflow) => (
                    <button
                      key={workflow.id}
                      onClick={(e) => handleSelectIntent(workflow.id, e)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110"
                      style={{
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                      }}
                      title={workflow.title}
                    >
                      {workflow.icon}
                    </button>
                  ))}
                  <div
                    className="px-3 py-2 rounded-xl text-xs"
                    style={{ background: colors.surface, color: colors.textMuted }}
                  >
                    +{workflows.length - 4} more
                  </div>
                </motion.div>
              </div>
            </header>

            {/* Crucible Landing with floating agents */}
            <CrucibleLanding
              selectedAgents={selectedAgents}
              onAgentSelect={handleAgentSelect}
              onPromptSubmit={handlePromptSubmit}
            />

            {/* Workflow Grid (appears after scroll) */}
            <section className="relative z-10 py-20 px-6" style={{ background: colors.bg }}>
              <div className="max-w-6xl mx-auto">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold mb-4 text-center"
                >
                  Choose Your{' '}
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentAmber} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Workflow
                  </span>
                </motion.h2>
                <p className="text-center mb-12" style={{ color: colors.textMuted }}>
                  Select a specialized pipeline or let the AI agents guide you
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {workflows.map((workflow, index) => (
                    <motion.button
                      key={workflow.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      onClick={(e) => handleSelectIntent(workflow.id, e)}
                      className="group p-6 rounded-2xl text-left transition-all duration-300"
                      style={{
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                      }}
                      whileHover={{
                        scale: 1.02,
                        borderColor: workflow.color,
                        boxShadow: `0 0 30px ${workflow.color}33`,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                        style={{
                          background: `${workflow.color}22`,
                        }}
                      >
                        {workflow.icon}
                      </div>
                      <h3 className="font-medium mb-1" style={{ color: colors.text }}>
                        {workflow.title}
                      </h3>
                      <p className="text-xs" style={{ color: colors.textDim }}>
                        {workflow.subtitle}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </section>
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
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToLanding}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-white/5"
                    style={{ color: colors.textMuted }}
                  >
                    ← Back
                  </button>
                  <div className="flex items-center gap-3">
                    <SolusLogo size={36} animated={false} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h1
                          className="text-lg tracking-wide font-bold brand-text"
                          style={{ color: colors.text }}
                        >
                          SOLUS FORGE
                        </h1>
                        <span
                          className="text-[8px] px-1.5 py-0.5 rounded"
                          style={{ background: `${colors.accent}22`, color: colors.accent }}
                        >
                          PRE-α
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: colors.textMuted }}>
                        {workflows.find(w => w.id === selectedIntent)?.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active workflow badge */}
                <div className="flex items-center gap-3">
                  <div
                    className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                    style={{
                      background: `${workflows.find(w => w.id === selectedIntent)?.color}22`,
                      color: workflows.find(w => w.id === selectedIntent)?.color,
                      border: `1px solid ${workflows.find(w => w.id === selectedIntent)?.color}44`,
                    }}
                  >
                    {workflows.find(w => w.id === selectedIntent)?.icon}
                    {workflows.find(w => w.id === selectedIntent)?.title}
                  </div>

                  {/* Agent status */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: colors.surface }}
                  >
                    <div className="flex -space-x-2">
                      {selectedAgents.slice(0, 3).map(agentId => {
                        const icons: Record<string, string> = {
                          solus: '🔮',      // Claude Opus - Strategic Oversight
                          quintus: '📐',    // Claude Haiku - Planner
                          trion: '🔍',      // Anthropic - Research & Discovery
                          lathe: '⚖️',      // Claude Sonnet - Quality Control
                          alchemist: '✨',  // Gemini - Creative Generation
                          cortex: '🧠',     // NotebookLM - Memory & Context
                        }
                        return (
                          <div
                            key={agentId}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                          >
                            {icons[agentId]}
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
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
