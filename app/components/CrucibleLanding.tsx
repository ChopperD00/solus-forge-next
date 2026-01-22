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

// Workflow cards data with Phosphor duotone icons
const workflows = [
  { id: 'email_campaign', icon: EnvelopeIcon, title: 'Email Campaign', subtitle: 'Figma templates, copy, AI images', color: colors.accent },
  { id: 'video_production', icon: FilmSlateIcon, title: 'Video Production', subtitle: 'AI video generation & editing', color: '#FF8C00' },
  { id: 'image_generation', icon: PaintBrushIcon, title: 'Image Generation', subtitle: 'Concept art & product shots', color: '#F59E0B' },
  { id: 'influencer_suite', icon: UserIcon, title: 'Influencer Suite', subtitle: 'LoRA training & clothing swap', color: '#E1306C' },
  { id: 'social_paid_ads', icon: DeviceMobileIcon, title: 'Social Paid Ads', subtitle: 'Multi-format ad creation', color: '#1877F2' },
  { id: 'audio', icon: MusicNotesIcon, title: 'Audio Production', subtitle: 'Music, SFX & voiceover', color: '#10B981' },
  { id: '3d_assets', icon: CubeIcon, title: '3D Assets', subtitle: 'Models, textures & scenes', color: '#8B5CF6' },
  { id: 'research', icon: FlaskIcon, title: 'Research', subtitle: 'Parallel AI research', color: '#06B6D4' },
]

// Icon component type
type IconComponent = React.ForwardRefExoticComponent<React.PropsWithoutRef<{ size?: number | string; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'; color?: string }> & React.RefAttributes<SVGSVGElement>>

// Morphing Agent Component - orbits then morphs to final position
interface MorphingAgentProps {
  agent: typeof agents[0]
  index: number
  morphProgress: number // 0 = orbiting, 1 = in final position
  time: number
  isSelected: boolean
  onSelect: () => void
  totalAgents: number
}

function MorphingAgent({
  agent,
  index,
  morphProgress,
  time,
  isSelected,
  onSelect,
  totalAgents,
}: MorphingAgentProps) {
  const orbitRadius = 200
  const orbitSpeed = 0.3

  // Orbital position
  const angle = agent.orbitOffset + time * orbitSpeed
  const orbitX = Math.cos(angle) * orbitRadius
  const orbitY = Math.sin(angle) * orbitRadius * 0.4

  // Dissolve phase: agents scatter outward and fade like particles
  // morphProgress 0-0.5: orbit to scatter, 0.5-1: fade out completely
  const scatterProgress = Math.min(1, morphProgress * 2) // 0 to 1 over first half
  const fadeProgress = Math.max(0, (morphProgress - 0.3) / 0.7) // 0 to 1 over last 70%

  // Scatter outward in random-ish directions based on agent index
  const scatterAngle = agent.orbitOffset + (index * 0.7) // Unique scatter angle per agent
  const scatterDistance = 300 + (index % 3) * 100 // Varied distances
  const scatterX = orbitX + Math.cos(scatterAngle) * scatterDistance * scatterProgress
  const scatterY = orbitY + Math.sin(scatterAngle) * scatterDistance * scatterProgress - (scatterProgress * 200)

  // Final position is scattered outward
  const currentX = scatterX
  const currentY = scatterY

  // Scale down as they dissolve
  const scale = Math.max(0.1, 1 - morphProgress * 0.8)

  // Fade out completely
  const opacity = 1 - fadeProgress

  // Don't render if fully faded
  if (opacity <= 0) return null

  return (
    <motion.div
      className="absolute cursor-pointer pointer-events-none"
      style={{
        x: currentX,
        y: currentY,
        scale,
        opacity,
        zIndex: 10,
      }}
    >
      <motion.div
        className="relative flex flex-col items-center"
        style={{ width: 56, height: 56 }}
      >
        {/* Glow - becomes more orange/particle-like as it dissolves */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${morphProgress > 0.3 ? colors.accent : agent.color}${Math.round((1 - fadeProgress) * 50).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            transform: `scale(${1.5 + morphProgress * 2})`,
            opacity: 0.8,
          }}
        />
        {/* Icon container - fades to just a glowing orb */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center transition-all"
          style={{
            background: morphProgress > 0.5
              ? `radial-gradient(circle, ${colors.accent}66 0%, ${colors.accent}22 100%)`
              : colors.surface,
            border: `2px solid ${morphProgress > 0.5 ? colors.accent : colors.border}`,
            boxShadow: `0 0 ${20 + morphProgress * 30}px ${colors.accent}${Math.round((morphProgress) * 99).toString(16).padStart(2, '0')}`,
          }}
        >
          <div
            className="transition-opacity"
            style={{ opacity: 1 - morphProgress * 1.5 }}
          >
            <agent.icon size={24} weight="duotone" color={agent.color} />
          </div>
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
  // Sub-phase 2b: Morphing to chat bar (35% - 45%)
  // Sub-phase 2c: Chat bar fully visible (45% - 55%)
  const section2Opacity = useTransform(smoothProgress, [0.15, 0.25, 0.5, 0.55], [0, 1, 1, 0])
  const orbitPhraseOpacity = useTransform(smoothProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0])
  const morphProgress = useTransform(smoothProgress, [0.35, 0.45], [0, 1])
  const chatBarOpacity = useTransform(smoothProgress, [0.38, 0.45], [0, 1])

  // Section 3 (Workflows): 55% - 100%
  const workflowsOpacity = useTransform(smoothProgress, [0.5, 0.6], [0, 1])
  const workflowsY = useTransform(smoothProgress, [0.5, 0.6], [50, 0])

  // Get current morph progress value
  const [currentMorphProgress, setCurrentMorphProgress] = useState(0)
  useEffect(() => {
    const unsubscribe = morphProgress.on('change', setCurrentMorphProgress)
    return () => unsubscribe()
  }, [morphProgress])

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

        {/* Version Badge - Fixed Header */}
        <div className="absolute top-4 right-4 z-50">
          <div
            className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide"
            style={{
              background: 'rgba(255, 107, 0, 0.15)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              color: colors.accent,
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
            <div className="text-center flex flex-col items-center">
              <SolusForgeIcon
                size={180}
                color={colors.text}
                glowColor={colors.accentGlow}
                animated={true}
              />
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider mt-6 brand-text"
                style={{
                  color: colors.text,
                  textShadow: `0 0 60px ${colors.accent}66`,
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
          {/* Latin Phrase - Orbiting phase */}
          <motion.div
            className="absolute text-center"
            style={{ opacity: orbitPhraseOpacity }}
          >
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-light italic tracking-wide brand-text"
              style={{
                color: colors.textMuted,
                textShadow: `0 0 30px ${colors.accent}33`,
              }}
            >
              Libera te tutemet ex inferis
            </h2>
          </motion.div>

          {/* Morphing Agents */}
          <div className="relative" style={{ width: 0, height: 0 }}>
            {agents.map((agent, index) => (
              <MorphingAgent
                key={agent.id}
                agent={agent}
                index={index}
                morphProgress={currentMorphProgress}
                time={time}
                isSelected={localSelectedAgents.includes(agent.id)}
                onSelect={() => handleAgentSelect(agent.id)}
                totalAgents={agents.length}
              />
            ))}
          </div>

          {/* Chat Bar Section - appears after morph */}
          <motion.div
            className="absolute w-full max-w-3xl px-4"
            style={{
              top: '50%',
              opacity: chatBarOpacity,
            }}
          >
            {/* Latin Phrase for chat phase */}
            <div className="text-center mb-6">
              <h2
                className="text-xl md:text-2xl lg:text-3xl font-light italic tracking-wide brand-text"
                style={{
                  color: colors.textMuted,
                  textShadow: `0 0 20px ${colors.accent}22`,
                }}
              >
                Aut viam inveniam aut faciam
              </h2>
            </div>

            {/* Agent selector chips - single line */}
            <div className="mb-4 flex justify-center gap-3 overflow-x-auto pb-2">
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

        {/* SECTION 3: Workflow Cards */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center pt-20"
          style={{ opacity: workflowsOpacity, y: workflowsY }}
        >
          {/* Subtle background overlay for workflows section */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 100% 60% at 50% 80%, ${colors.bg} 0%, transparent 70%)`,
            }}
          />

          <h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center relative z-10 font-expanded"
            style={{ color: colors.text }}
          >
            Choose Your Workflow
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl px-4 relative z-10">
            {workflows.map((workflow, index) => {
              const IconComponent = workflow.icon
              return (
                <motion.button
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onWorkflowSelect?.(workflow.id)}
                  className="flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: `${colors.surface}ee`,
                    border: `1px solid ${colors.border}`,
                    backdropFilter: 'blur(8px)',
                  }}
                  whileHover={{
                    borderColor: workflow.color,
                    boxShadow: `0 0 30px ${workflow.color}33`,
                  }}
                >
                  <div className="mb-2">
                    <IconComponent size={32} weight="duotone" color={workflow.color} />
                  </div>
                  <span className="font-medium text-sm" style={{ color: colors.text }}>
                    {workflow.title}
                  </span>
                  <span className="text-[10px] text-center mt-1" style={{ color: colors.textDim }}>
                    {workflow.subtitle}
                  </span>
                </motion.button>
              )
            })}
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
