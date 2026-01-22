'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import GradientCircle from './GradientCircle'
import SpectraNoiseBackground from './SpectraNoiseBackground'
import SolusForgeIcon from './SolusForgeIcon'
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
} from '@phosphor-icons/react'

// SSR-safe window dimensions hook
function useWindowSize() {
  const [size, setSize] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}

const colors = {
  bg: '#0A0A0A',
  bgWarm: '#141010',
  surface: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
  accent: '#FF6B00',
  accentGlow: 'rgba(255, 107, 0, 0.3)',
}

// Agent configurations with Phosphor duotone icons
const agents = [
  {
    id: 'solus',
    name: 'Solus',
    icon: EyeIcon,
    role: 'Strategic Oversight',
    orbitOffset: 0,
    color: '#8B5CF6',
  },
  {
    id: 'quintus',
    name: 'Quintus',
    icon: CompassIcon,
    role: 'Planner/Optimization',
    orbitOffset: Math.PI / 3,
    color: '#06B6D4',
  },
  {
    id: 'trion',
    name: 'Trion',
    icon: MagnifyingGlassIcon,
    role: 'Research & Discovery',
    orbitOffset: (Math.PI * 2) / 3,
    color: '#10B981',
  },
  {
    id: 'lathe',
    name: 'Lathe',
    icon: ScalesIcon,
    role: 'Quality Control/Reviewer',
    orbitOffset: Math.PI,
    color: '#F59E0B',
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    icon: SparkleIcon,
    role: 'Creative Generation',
    orbitOffset: (Math.PI * 4) / 3,
    color: '#EC4899',
  },
  {
    id: 'cortex',
    name: 'Cortex',
    icon: BrainIcon,
    role: 'Archival',
    orbitOffset: (Math.PI * 5) / 3,
    color: '#EF4444',
  },
]

// All tarot cards with front (icon) and back (details) content
const tarotCards = [
  // Visual / Creative
  { id: 'video_production', icon: FilmSlateIcon, title: 'Video Production', subtitle: 'AI video generation & editing', capabilities: ['AI Video Generation', 'Motion Graphics', 'Auto-Editing', 'B-Roll Assembly'], arcana: 'The Visionary' },
  { id: 'image_generation', icon: PaintBrushIcon, title: 'Image Generation', subtitle: 'Concept art & product shots', capabilities: ['Product Photography', 'Concept Art', 'Style Transfer', 'Batch Generation'], arcana: 'The Visionary' },
  { id: '3d_assets', icon: CubeIcon, title: '3D Assets', subtitle: 'Models, textures & scenes', capabilities: ['Model Generation', 'Texture Synthesis', 'Scene Composition', 'Asset Export'], arcana: 'The Visionary' },
  { id: 'repurposing', icon: ArrowsClockwiseIcon, title: 'Content Repurpose', subtitle: 'Transform across formats', capabilities: ['Format Conversion', 'Platform Optimization', 'Aspect Ratios', 'Content Slicing'], arcana: 'The Visionary' },
  // Marketing
  { id: 'email_campaign', icon: EnvelopeIcon, title: 'Email Campaign', subtitle: 'Figma templates, copy, AI images', capabilities: ['Template Design', 'Copy Generation', 'A/B Testing', 'Send Automation'], arcana: 'The Merchant' },
  { id: 'social_paid_ads', icon: DeviceMobileIcon, title: 'Social Paid Ads', subtitle: 'Multi-format ad creation', capabilities: ['Ad Creative', 'Audience Targeting', 'Budget Optimization', 'Performance Tracking'], arcana: 'The Merchant' },
  { id: 'influencer_suite', icon: UserIcon, title: 'Influencer Suite', subtitle: 'LoRA training & clothing swap', capabilities: ['LoRA Training', 'Face Swap', 'Clothing Transfer', 'Brand Consistency'], arcana: 'The Merchant' },
  { id: 'automation', icon: LightningIcon, title: 'Automation', subtitle: 'Workflow triggers & sequences', capabilities: ['Trigger Events', 'Conditional Logic', 'API Integrations', 'Scheduled Tasks'], arcana: 'The Merchant' },
  // Intelligence
  { id: 'research', icon: FlaskIcon, title: 'Research', subtitle: 'Parallel AI research', capabilities: ['Multi-Source Search', 'Summarization', 'Fact Checking', 'Citation Tracking'], arcana: 'The Oracle' },
  { id: 'analytics', icon: ChartBarIcon, title: 'Analytics', subtitle: 'Performance insights', capabilities: ['Data Visualization', 'Trend Analysis', 'ROI Tracking', 'Custom Reports'], arcana: 'The Oracle' },
  { id: 'lupin_iii', icon: DetectiveIcon, title: 'Lupin III', subtitle: 'OSINT & Intelligence', capabilities: ['Social Recon', 'Domain Intel', 'Entity Mapping', 'Deep Web Search'], arcana: 'The Oracle' },
  // Misc / Arcane
  { id: 'audio', icon: MusicNotesIcon, title: 'Audio Production', subtitle: 'Music, SFX & voiceover', capabilities: ['Music Generation', 'Voice Synthesis', 'SFX Library', 'Audio Mastering'], arcana: 'The Alchemist' },
  { id: 'asset_vault', icon: VaultIcon, title: 'Asset Vault', subtitle: 'Organize & version control', capabilities: ['Version History', 'Smart Tagging', 'Quick Search', 'Team Sharing'], arcana: 'The Alchemist' },
]

// Flat list for header icons
const workflows = tarotCards.map(card => ({ id: card.id, icon: card.icon, title: card.title, subtitle: card.subtitle }))

// Icon component type
type IconComponent = React.ForwardRefExoticComponent<React.PropsWithoutRef<{ size?: number | string; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'; color?: string }> & React.RefAttributes<SVGSVGElement>>

// Morphing Agent Component - orbits then flies into sliding UI boxes
interface MorphingAgentProps {
  agent: typeof agents[0]
  index: number
  morphProgress: number // 0 = orbiting, 1 = in final position (inside box)
  chatBarY: number // Current Y position of chat bar (for targeting)
  time: number
  isSelected: boolean
  onSelect: () => void
  totalAgents: number
}

function MorphingAgent({
  agent,
  index,
  morphProgress,
  chatBarY,
  time,
  isSelected,
  onSelect,
  totalAgents,
}: MorphingAgentProps) {
  const orbitRadius = 200
  const orbitSpeed = 0.3

  // Orbital position (around center)
  const angle = agent.orbitOffset + time * orbitSpeed
  const orbitX = Math.cos(angle) * orbitRadius
  const orbitY = Math.sin(angle) * orbitRadius * 0.4

  // Target position: the agent selector box in the sliding UI
  // Boxes are arranged horizontally, roughly 105px apart
  const buttonSpacing = 105
  const targetX = (index - (totalAgents - 1) / 2) * buttonSpacing
  // Target Y follows the chat bar as it slides up, offset to hit the box center
  const targetY = -85 + chatBarY // Boxes are above the search bar

  // Morph from orbit to button position
  const easeOutBack = (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }
  const easedProgress = easeOutBack(Math.min(1, morphProgress))

  // Interpolate position from orbit to target
  const currentX = orbitX * (1 - easedProgress) + targetX * easedProgress
  const currentY = orbitY * (1 - easedProgress) + targetY * easedProgress

  // Scale down slightly as it lands in the box
  const scale = 1 - easedProgress * 0.3

  // Color transition: white -> agent color as morphProgress increases
  const colorProgress = Math.min(1, morphProgress * 1.2)

  // Interpolate from white (#FFFFFF) to agent color
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 }
  }

  const agentRgb = hexToRgb(agent.color)
  const currentR = Math.round(255 * (1 - colorProgress) + agentRgb.r * colorProgress)
  const currentG = Math.round(255 * (1 - colorProgress) + agentRgb.g * colorProgress)
  const currentB = Math.round(255 * (1 - colorProgress) + agentRgb.b * colorProgress)
  const currentColor = `rgb(${currentR}, ${currentG}, ${currentB})`

  // Glow color also transitions
  const glowColor = colorProgress > 0.5 ? agent.color : '#FFFFFF'

  // Fade out when landing in box (the static icon in box takes over)
  const opacity = morphProgress > 0.85 ? 1 - (morphProgress - 0.85) / 0.15 : 1

  // Don't render if fully faded
  if (opacity <= 0) return null

  // Calculate z-index based on Y position for depth effect
  const zIndex = Math.round(orbitY + 100)

  return (
    <motion.div
      className="absolute cursor-pointer pointer-events-none"
      style={{
        x: currentX,
        y: currentY,
        scale,
        opacity,
        zIndex: morphProgress > 0.1 ? 50 : zIndex,
      }}
    >
      <motion.div
        className="relative flex flex-col items-center"
        style={{ width: 48, height: 48 }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor}50 0%, transparent 70%)`,
            transform: 'scale(1.8)',
            opacity: 0.5 + morphProgress * 0.5,
          }}
        />
        {/* Icon container */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: `${colors.surface}dd`,
            border: `2px solid ${morphProgress > 0.3 ? agent.color : colors.border}`,
            boxShadow: `0 0 ${10 + morphProgress * 25}px ${glowColor}66`,
          }}
        >
          <agent.icon size={22} weight="duotone" color={currentColor} />
        </div>
      </motion.div>
    </motion.div>
  )
}

interface CrucibleLandingProps {
  onAgentSelect?: (agentId: string) => void
  onPromptSubmit?: (prompt: string) => void
  onWorkflowSelect?: (workflowId: string) => void
  selectedAgents?: string[]
}

export default function CrucibleLanding({
  onAgentSelect,
  onPromptSubmit,
  onWorkflowSelect,
  selectedAgents = ['solus', 'trion'],
}: CrucibleLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(0)
  const [prompt, setPrompt] = useState('')
  const windowSize = useWindowSize()
  const [localSelectedAgents, setLocalSelectedAgents] = useState<string[]>(selectedAgents)

  // Scroll-based animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', setProgress)
    return () => unsubscribe()
  }, [smoothProgress])

  // Orbital animation - slows down as morph progresses
  useEffect(() => {
    let animationFrame: number
    const animate = () => {
      const morphProgress = Math.min(1, Math.max(0, (progress - 0.25) / 0.2))
      const speedMultiplier = 1 - morphProgress * 0.9 // Slow to 10% speed when morphed
      setTime(prev => prev + 0.016 * speedMultiplier)
      animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [progress])

  const handleAgentSelect = (agentId: string) => {
    setLocalSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
    onAgentSelect?.(agentId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onPromptSubmit?.(prompt)
    }
  }

  // Animation phases based on scroll
  // Section 1 (Hero): 0% - 20%
  const heroOpacity = useTransform(smoothProgress, [0, 0.15, 0.2], [1, 1, 0])
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 1.2])
  const auroraOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0])

  // Section 2 (Orbit + Morph): 20% - 55%
  // Sub-phase 2a: Orbiting around Latin phrase (20% - 35%)
  // Sub-phase 2b: UI slides up, agents fly into boxes (35% - 48%)
  // Sub-phase 2c: Chat bar fully visible (48% - 55%)
  const section2Opacity = useTransform(smoothProgress, [0.15, 0.25, 0.5, 0.55], [0, 1, 1, 0])
  const orbitPhraseOpacity = useTransform(smoothProgress, [0.2, 0.25, 0.35, 0.40], [0, 1, 1, 0])

  // Chat bar slides up from below
  const chatBarY = useTransform(smoothProgress, [0.35, 0.48], [300, 0]) // Starts 300px below, moves to center
  const chatBarOpacity = useTransform(smoothProgress, [0.35, 0.42], [0, 1])

  // Morph progress - agents fly into boxes as UI slides up
  const morphProgress = useTransform(smoothProgress, [0.38, 0.50], [0, 1])

  // "ex inferis" reveal on scroll - appears after initial phrase is visible
  const exInferisOpacity = useTransform(smoothProgress, [0.25, 0.30], [0, 1])
  const exInferisX = useTransform(smoothProgress, [0.25, 0.30], [20, 0])

  // Section 3 (Workflows): 55% - 100%
  const workflowsOpacity = useTransform(smoothProgress, [0.5, 0.6], [0, 1])
  const workflowsY = useTransform(smoothProgress, [0.5, 0.6], [50, 0])

  // Get current morph progress and chatBarY values
  const [currentMorphProgress, setCurrentMorphProgress] = useState(0)
  const [currentChatBarY, setCurrentChatBarY] = useState(300)
  useEffect(() => {
    const unsubscribe = morphProgress.on('change', setCurrentMorphProgress)
    return () => unsubscribe()
  }, [morphProgress])
  useEffect(() => {
    const unsubscribe = chatBarY.on('change', setCurrentChatBarY)
    return () => unsubscribe()
  }, [chatBarY])

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: '400vh', background: colors.bg }}
    >
      {/* SpectraNoise Background */}
      <SpectraNoiseBackground
        isExpanded={false}
        logoCenter={{ x: windowSize.width / 2, y: windowSize.height / 2 }}
        logoSize={200}
      />

      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">

        {/* Fixed Header */}
        <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
          {/* Left: Workflow Icons */}
          <div className="flex items-center gap-1">
            {workflows.map((workflow) => {
              const IconComponent = workflow.icon
              return (
                <motion.button
                  key={workflow.id}
                  className="p-2 rounded-lg transition-all hover:bg-white/5"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={workflow.title}
                  onClick={() => onWorkflowSelect?.(workflow.id)}
                >
                  <IconComponent
                    size={20}
                    weight="duotone"
                    className="transition-colors"
                    style={{ color: '#666666' }}
                  />
                </motion.button>
              )
            })}
          </div>

          {/* Right: Version Badge */}
          <div
            className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide"
            style={{
              background: 'rgba(255, 107, 0, 0.15)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              color: colors.accent,
              fontFamily: "'Dobla Sans', system-ui, sans-serif",
            }}
          >
            Pre-Alpha v3.4
          </div>
        </div>

        {/* SECTION 1: Hero with Gradient Circle + Logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <GradientCircle scrollProgress={0}>
            <div className="text-center flex flex-col items-center justify-center">
              <SolusForgeIcon
                size={160}
                color={colors.text}
                glowColor={colors.accentGlow}
                animated={true}
              />
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider mt-8"
                style={{
                  color: colors.text,
                  textShadow: `0 0 60px ${colors.accent}66`,
                  fontFamily: "var(--font-futuriata), 'Futuriata', system-ui, sans-serif",
                  letterSpacing: '0.15em',
                }}
              >
                SOLUS FORGE
              </h1>
            </div>
          </GradientCircle>
        </motion.div>

        {/* Aurora Borealis bottom glow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ opacity: auroraOpacity }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 20% 100%, rgba(255, 107, 0, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 50% 100%, rgba(249, 158, 11, 0.12) 0%, transparent 45%),
                radial-gradient(ellipse 70% 45% at 80% 100%, rgba(255, 140, 0, 0.1) 0%, transparent 50%)
              `,
            }}
          />
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: `
                radial-gradient(ellipse 50% 30% at 35% 100%, rgba(255, 107, 0, 0.2) 0%, transparent 40%),
                radial-gradient(ellipse 40% 25% at 65% 100%, rgba(251, 191, 36, 0.15) 0%, transparent 35%)
              `,
            }}
          />
        </motion.div>

        {/* SECTION 2: Orbiting Agents + Morph to Chat Bar */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: section2Opacity }}
        >
          {/* Morphing Agents - rendered BEHIND text (z-index controlled per agent based on Y) */}
          <div className="absolute" style={{ width: 0, height: 0, zIndex: 5 }}>
            {agents.map((agent, index) => (
              <MorphingAgent
                key={agent.id}
                agent={agent}
                index={index}
                morphProgress={currentMorphProgress}
                chatBarY={currentChatBarY}
                time={time}
                isSelected={localSelectedAgents.includes(agent.id)}
                onSelect={() => handleAgentSelect(agent.id)}
                totalAgents={agents.length}
              />
            ))}
          </div>

          {/* Latin Phrase - Orbiting phase - rendered IN FRONT of orbiting agents */}
          <motion.div
            className="absolute text-center z-20"
            style={{ opacity: orbitPhraseOpacity }}
          >
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide"
              style={{
                color: colors.text,
                fontFamily: "'Dobla Sans', system-ui, sans-serif",
              }}
            >
              <span style={{ textShadow: `0 0 30px ${colors.accent}44` }}>
                Libera te tutemet{' '}
              </span>
              <motion.span
                style={{
                  color: colors.accent,
                  display: 'inline-block',
                  opacity: exInferisOpacity,
                  x: exInferisX,
                }}
                animate={{
                  textShadow: [
                    `0 0 20px ${colors.accent}66, 0 0 40px ${colors.accent}33`,
                    `0 0 30px ${colors.accent}99, 0 0 60px ${colors.accent}55, 0 0 80px ${colors.accent}22`,
                    `0 0 20px ${colors.accent}66, 0 0 40px ${colors.accent}33`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ex inferis
              </motion.span>
            </h2>
          </motion.div>

          {/* Chat Bar Section - slides up from below */}
          <motion.div
            className="absolute w-full max-w-3xl px-4"
            style={{
              top: '50%',
              y: chatBarY,
              opacity: chatBarOpacity,
            }}
          >
            {/* Latin Phrase for chat phase */}
            <div className="text-center mb-6">
              <h2
                className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide"
                style={{
                  color: colors.textMuted,
                  textShadow: `0 0 20px ${colors.accent}22`,
                  fontFamily: "'Dobla Sans', system-ui, sans-serif",
                }}
              >
                Aut viam inveniam aut faciam
              </h2>
            </div>

            {/* Agent selector chips - single line, no overflow clipping */}
            <div className="mb-4 flex justify-center gap-3 pb-2 px-4">
              {agents.map(agent => {
                const isActive = localSelectedAgents.includes(agent.id)
                const IconComponent = agent.icon
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    className="flex flex-col items-center px-4 py-2 rounded-lg text-xs transition-all shrink-0"
                    style={{
                      background: isActive ? `${agent.color}22` : colors.surface,
                      border: `1px solid ${isActive ? agent.color : colors.border}`,
                      color: isActive ? agent.color : colors.textMuted,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconComponent size={16} weight="duotone" color={isActive ? agent.color : colors.textMuted} />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    <span className="text-[9px] opacity-70 mt-0.5">{agent.role}</span>
                  </button>
                )
              })}
            </div>

            {/* Search bar */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 0 60px ${colors.accent}22`,
              }}
            >
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like to create today?"
                  className="flex-1 px-6 py-4 bg-transparent text-base focus:outline-none"
                  style={{ color: colors.text }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 m-2 rounded-xl font-medium transition-all hover:brightness-110"
                  style={{
                    background: colors.accent,
                    color: colors.text,
                  }}
                >
                  Create →
                </button>
              </form>
            </div>

            {/* Quick suggestions */}
            <div className="mt-3 flex justify-center gap-2 flex-wrap">
              {['Generate product images', 'Research competitors', 'Create video ad', 'Build email campaign'].map(
                suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-1 rounded-lg text-xs transition-all hover:bg-white/10"
                    style={{
                      background: `${colors.bg}cc`,
                      border: `1px solid ${colors.border}`,
                      color: colors.textMuted,
                    }}
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Transition fade overlay - feathers from animated background to workflow section */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: workflowsOpacity,
            background: `linear-gradient(to bottom,
              transparent 0%,
              ${colors.bg}00 30%,
              ${colors.bg}40 50%,
              ${colors.bg}90 70%,
              ${colors.bg} 85%,
              ${colors.bg} 100%
            )`,
          }}
        />

        {/* SECTION 3: Tarot Card Arc Animation */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: workflowsOpacity }}
        >
          {/* Subtle background overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 100% 60% at 50% 80%, ${colors.bg} 0%, transparent 70%)`,
            }}
          />

          {/* Section Title */}
          <motion.div
            className="text-center relative z-10 mb-6"
            style={{ y: workflowsY }}
          >
            <h3
              className="text-xl md:text-2xl font-semibold tracking-wide mb-2"
              style={{
                color: colors.text,
                fontFamily: "var(--font-futuriata), system-ui, sans-serif",
              }}
            >
              Select Your Workflow
            </h3>
            <p
              className="text-sm"
              style={{ color: colors.textDim }}
            >
              Choose a creative pathway to begin
            </p>
          </motion.div>

          {/* Cards laid out in 4 arcana columns - simple grid, no arc animation */}
          <div className="relative w-full max-w-5xl mx-auto z-10 px-8">
            <div className="flex justify-center gap-6">
              {/* The Visionary Column */}
              <motion.div
                className="flex flex-col items-center gap-3"
                style={{ opacity: useTransform(smoothProgress, [0.55, 0.65], [0, 1]) }}
              >
                <span
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: colors.accent, opacity: 0.7 }}
                >
                  The Visionary
                </span>
                {tarotCards.slice(0, 4).map((card) => {
                  const IconComponent = card.icon
                  return (
                    <motion.button
                      key={card.id}
                      className="w-[130px] h-[60px] rounded-xl flex items-center gap-3 px-3 transition-all"
                      style={{
                        background: 'transparent',
                        border: `1px solid ${colors.accent}66`,
                        boxShadow: `0 0 15px ${colors.accent}22`,
                      }}
                      whileHover={{
                        background: `${colors.accent}15`,
                        boxShadow: `0 0 25px ${colors.accent}44`,
                        scale: 1.02,
                      }}
                      onClick={() => onWorkflowSelect?.(card.id)}
                    >
                      <IconComponent size={24} weight="duotone" color={colors.text} />
                      <span className="text-xs text-left leading-tight" style={{ color: colors.text }}>
                        {card.title}
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>

              {/* The Merchant Column */}
              <motion.div
                className="flex flex-col items-center gap-3"
                style={{ opacity: useTransform(smoothProgress, [0.58, 0.68], [0, 1]) }}
              >
                <span
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: '#10B981', opacity: 0.7 }}
                >
                  The Merchant
                </span>
                {tarotCards.slice(4, 8).map((card) => {
                  const IconComponent = card.icon
                  return (
                    <motion.button
                      key={card.id}
                      className="w-[130px] h-[60px] rounded-xl flex items-center gap-3 px-3 transition-all"
                      style={{
                        background: 'transparent',
                        border: `1px solid #10B98166`,
                        boxShadow: `0 0 15px #10B98122`,
                      }}
                      whileHover={{
                        background: `#10B98115`,
                        boxShadow: `0 0 25px #10B98144`,
                        scale: 1.02,
                      }}
                      onClick={() => onWorkflowSelect?.(card.id)}
                    >
                      <IconComponent size={24} weight="duotone" color={colors.text} />
                      <span className="text-xs text-left leading-tight" style={{ color: colors.text }}>
                        {card.title}
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>

              {/* The Oracle Column */}
              <motion.div
                className="flex flex-col items-center gap-3"
                style={{ opacity: useTransform(smoothProgress, [0.61, 0.71], [0, 1]) }}
              >
                <span
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: '#8B5CF6', opacity: 0.7 }}
                >
                  The Oracle
                </span>
                {tarotCards.slice(8, 11).map((card) => {
                  const IconComponent = card.icon
                  return (
                    <motion.button
                      key={card.id}
                      className="w-[130px] h-[60px] rounded-xl flex items-center gap-3 px-3 transition-all"
                      style={{
                        background: 'transparent',
                        border: `1px solid #8B5CF666`,
                        boxShadow: `0 0 15px #8B5CF622`,
                      }}
                      whileHover={{
                        background: `#8B5CF615`,
                        boxShadow: `0 0 25px #8B5CF644`,
                        scale: 1.02,
                      }}
                      onClick={() => onWorkflowSelect?.(card.id)}
                    >
                      <IconComponent size={24} weight="duotone" color={colors.text} />
                      <span className="text-xs text-left leading-tight" style={{ color: colors.text }}>
                        {card.title}
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>

              {/* The Alchemist Column */}
              <motion.div
                className="flex flex-col items-center gap-3"
                style={{ opacity: useTransform(smoothProgress, [0.64, 0.74], [0, 1]) }}
              >
                <span
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: '#EC4899', opacity: 0.7 }}
                >
                  The Alchemist
                </span>
                {tarotCards.slice(11, 13).map((card) => {
                  const IconComponent = card.icon
                  return (
                    <motion.button
                      key={card.id}
                      className="w-[130px] h-[60px] rounded-xl flex items-center gap-3 px-3 transition-all"
                      style={{
                        background: 'transparent',
                        border: `1px solid #EC489966`,
                        boxShadow: `0 0 15px #EC489922`,
                      }}
                      whileHover={{
                        background: `#EC489915`,
                        boxShadow: `0 0 25px #EC489944`,
                        scale: 1.02,
                      }}
                      onClick={() => onWorkflowSelect?.(card.id)}
                    >
                      <IconComponent size={24} weight="duotone" color={colors.text} />
                      <span className="text-xs text-left leading-tight" style={{ color: colors.text }}>
                        {card.title}
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.footer
            className="absolute bottom-6 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a
              href="mailto:phil@secretme.nu?subject=SOLUS%20FORGE%20-%20Bug%20Report%2FFeature%20Request"
              className="px-4 py-2 rounded-lg text-xs transition-all hover:bg-white/5 flex items-center gap-2"
              style={{
                color: colors.textDim,
                border: `1px solid ${colors.border}`,
                background: `${colors.surface}80`,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Bug Report / Feature Request
            </a>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  )
}
