'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import GradientCircle from './GradientCircle'
import SpectraNoiseBackground from './SpectraNoiseBackground'
import GlitchingTechEye from './GlitchingTechEye'
import ArcanaSplit from './ArcanaSplit'
import BorderBeam from './BorderBeam'
import MeltingText from './MeltingText'
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
  QrCode as QrCodeIcon,
  Circle as CircleIcon,
  Image as ImageIcon,
  VideoCamera as VideoCameraIcon,
  Waveform as WaveformIcon,
  Robot as RobotIcon,
  Plug as PlugIcon,
  FigmaLogo as FigmaLogoIcon,
} from '@phosphor-icons/react'

// Service status types
interface ServiceStatus {
  name: string
  configured: boolean
  description: string
  category: string
}

interface StatusResponse {
  services: Record<string, ServiceStatus>
  byCategory: Record<string, Array<ServiceStatus & { id: string }>>
  summary: {
    connected: number
    total: number
    status: 'all_connected' | 'partial' | 'none_connected'
  }
}

// Category icons and colors
const categoryConfig: Record<string, { icon: any; color: string; label: string }> = {
  image: { icon: ImageIcon, color: '#10B981', label: 'Image' },
  video: { icon: VideoCameraIcon, color: '#8B5CF6', label: 'Video' },
  audio: { icon: WaveformIcon, color: '#F59E0B', label: 'Audio' },
  llm: { icon: RobotIcon, color: '#06B6D4', label: 'LLM' },
  research: { icon: MagnifyingGlassIcon, color: '#EC4899', label: 'Research' },
  ml: { icon: BrainIcon, color: '#EF4444', label: 'ML' },
  integration: { icon: PlugIcon, color: '#84CC16', label: 'Apps' },
  design: { icon: FigmaLogoIcon, color: '#A855F7', label: 'Design' },
}

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
  { id: 'stylest_email', icon: EnvelopeIcon, title: 'Stylest Email', subtitle: 'Swimwear campaign studio', capabilities: ['Product Swap', 'Colorway System', 'Zone Editing', 'Founder Sections'], arcana: 'The Merchant' },
  { id: 'nurse_jamie_email', icon: EnvelopeIcon, title: 'Nurse Jamie Email', subtitle: 'Beauty device campaigns', capabilities: ['Product Catalog', 'Content Blocks', 'HTML Export', 'Platform Targeting'], arcana: 'The Merchant' },
  { id: 'automation', icon: LightningIcon, title: 'Automation', subtitle: 'Workflow triggers & sequences', capabilities: ['Trigger Events', 'Conditional Logic', 'API Integrations', 'Scheduled Tasks'], arcana: 'The Merchant' },
  // Intelligence
  { id: 'research', icon: FlaskIcon, title: 'Research', subtitle: 'Parallel AI research', capabilities: ['Multi-Source Search', 'Summarization', 'Fact Checking', 'Citation Tracking'], arcana: 'The Oracle' },
  { id: 'analytics', icon: ChartBarIcon, title: 'Analytics', subtitle: 'Performance insights', capabilities: ['Data Visualization', 'Trend Analysis', 'ROI Tracking', 'Custom Reports'], arcana: 'The Oracle' },
  { id: 'lupin_iii', icon: DetectiveIcon, title: 'Lupin III', subtitle: 'OSINT & Intelligence', capabilities: ['Social Recon', 'Domain Intel', 'Entity Mapping', 'Deep Web Search'], arcana: 'The Oracle' },
  // Misc / Arcane
  { id: 'audio', icon: MusicNotesIcon, title: 'Audio Production', subtitle: 'Music, SFX & voiceover', capabilities: ['Music Generation', 'Voice Synthesis', 'SFX Library', 'Audio Mastering'], arcana: 'The Alchemist' },
  { id: 'asset_vault', icon: VaultIcon, title: 'Asset Vault', subtitle: 'Organize & version control', capabilities: ['Version History', 'Smart Tagging', 'Quick Search', 'Team Sharing'], arcana: 'The Alchemist' },
  { id: 'qr_barcode', icon: QrCodeIcon, title: 'QR/Barcode Gen', subtitle: 'Generate scannable codes', capabilities: ['QR Code Creation', 'Barcode Formats', 'Batch Generation', 'Custom Styling'], arcana: 'The Alchemist' },
]

// Flat list for header icons
const workflows = tarotCards.map(card => ({ id: card.id, icon: card.icon, title: card.title, subtitle: card.subtitle }))

// Custom Automations - separated from main workflow cards
const customAutomations = tarotCards.filter(card =>
  card.id === 'stylest_email' || card.id === 'nurse_jamie_email'
)

// Merchant cards without custom automations
const merchantCards = tarotCards.slice(4, 10).filter(card =>
  card.id !== 'stylest_email' && card.id !== 'nurse_jamie_email'
)

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
  // Responsive orbit radius
  const [orbitRadius, setOrbitRadius] = useState(200)
  useEffect(() => {
    const updateRadius = () => setOrbitRadius(window.innerWidth < 768 ? 120 : 200)
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])
  const orbitSpeed = 0.5 // Faster orbit speed

  // Limit to 2 complete orbits (2 * 2π radians), then stop
  const maxOrbits = 2
  const maxAngle = maxOrbits * Math.PI * 2
  const currentAngle = Math.min(time * orbitSpeed, maxAngle)

  // Orbital position (around center)
  const angle = agent.orbitOffset + currentAngle
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

  // Fade out when landing in box (the static icon in box takes over) - fade faster
  const opacity = morphProgress > 0.7 ? 1 - (morphProgress - 0.7) / 0.3 : 1

  // Don't render if fully faded or morph is complete
  if (opacity <= 0 || morphProgress >= 1) return null

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
  initialScrollToWorkflows?: boolean
}

export default function CrucibleLanding({
  onAgentSelect,
  onPromptSubmit,
  onWorkflowSelect,
  selectedAgents = ['solus', 'trion'],
  initialScrollToWorkflows = false,
}: CrucibleLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll to workflows section on mount if requested
  useEffect(() => {
    if (initialScrollToWorkflows && containerRef.current) {
      // Use a longer delay to ensure content is fully rendered after transition
      // and use requestAnimationFrame for smooth scroll timing
      const scrollToWorkflows = () => {
        if (containerRef.current) {
          const scrollTarget = containerRef.current.scrollHeight * 0.70
          containerRef.current.scrollTo({ top: scrollTarget, behavior: 'instant' })
        }
      }

      // Wait for transition to complete and content to render
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(scrollToWorkflows)
      }, 350) // After radial wipe transition (0.8s duration / 2 + buffer)

      return () => clearTimeout(timeoutId)
    }
  }, [initialScrollToWorkflows])
  const [time, setTime] = useState(0)
  const [prompt, setPrompt] = useState('')
  const windowSize = useWindowSize()
  const [localSelectedAgents, setLocalSelectedAgents] = useState<string[]>(selectedAgents)
  const [serviceStatus, setServiceStatus] = useState<StatusResponse | null>(null)
  const [statusExpanded, setStatusExpanded] = useState(false)

  // Fetch API/MCP status on mount
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setServiceStatus(data))
      .catch(err => console.error('Failed to fetch status:', err))
  }, [])

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
      const morphProgress = Math.min(1, Math.max(0, (progress - 0.22) / 0.15))
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

  // Animation phases based on scroll (900vh total - smoother progression)
  // Section 1 (Hero): 0% - 12%
  const heroOpacity = useTransform(smoothProgress, [0, 0.08, 0.12], [1, 1, 0])
  const heroScale = useTransform(smoothProgress, [0, 0.12], [1, 1.2])
  const auroraOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0])

  // Section 2 (Orbit + Morph): 12% - 45%
  // Sub-phase 2a: Orbiting around Latin phrase (12% - 20%)
  // Sub-phase 2b: UI slides up, agents fly into boxes (20% - 32%)
  // Sub-phase 2c: Chat bar fully visible (32% - 45%)
  const section2Opacity = useTransform(smoothProgress, [0.08, 0.14, 0.42, 0.48], [0, 1, 1, 0])
  const orbitPhraseOpacity = useTransform(smoothProgress, [0.12, 0.16, 0.24, 0.30], [0, 1, 1, 0])

  // Orbit phrase moves UP as chat bar comes in
  const orbitPhraseY = useTransform(smoothProgress, [0.22, 0.32], [0, -150])

  // Chat bar slides up from below
  const chatBarY = useTransform(smoothProgress, [0.24, 0.34], [300, 0]) // Starts 300px below, moves to center
  const chatBarOpacity = useTransform(smoothProgress, [0.24, 0.30], [0, 1])

  // Morph progress - agents fly into boxes as UI slides up (complete earlier)
  const morphProgress = useTransform(smoothProgress, [0.18, 0.26], [0, 1])

  // "ex inferis" reveal and fade on scroll - appears then fades with glow
  const exInferisOpacity = useTransform(smoothProgress, [0.14, 0.18, 0.24, 0.30], [0, 1, 1, 0])
  const exInferisX = useTransform(smoothProgress, [0.14, 0.18], [20, 0])
  // Glow intensifies as it fades out
  const exInferisGlow = useTransform(smoothProgress, [0.18, 0.28], [0, 1])

  // Section 3 (Arcana Split Workflows): 45% - 88%
  // Smooth crossfade with prompt section
  // Unified symbols appear: 45% - 52%
  // Split animation: 52% - 65%
  // Cards fully revealed: 65% - 88%
  const workflowsOpacity = useTransform(smoothProgress, [0.44, 0.52], [0, 1])
  const workflowsY = useTransform(smoothProgress, [0.44, 0.52], [50, 0])

  // Get current morph progress and chatBarY values
  const [currentMorphProgress, setCurrentMorphProgress] = useState(0)
  const [currentChatBarY, setCurrentChatBarY] = useState(300)
  const [agentsLanded, setAgentsLanded] = useState<Record<string, boolean>>({})
  const [currentGlowProgress, setCurrentGlowProgress] = useState(0)
  const prevMorphProgress = useRef(0)

  useEffect(() => {
    const unsubscribe = morphProgress.on('change', setCurrentMorphProgress)
    return () => unsubscribe()
  }, [morphProgress])
  useEffect(() => {
    const unsubscribe = chatBarY.on('change', setCurrentChatBarY)
    return () => unsubscribe()
  }, [chatBarY])

  useEffect(() => {
    const unsubscribe = exInferisGlow.on('change', setCurrentGlowProgress)
    return () => unsubscribe()
  }, [exInferisGlow])

  // Detect when agents land in boxes (morph reaches threshold)
  useEffect(() => {
    const landingThreshold = 0.85
    if (currentMorphProgress >= landingThreshold && prevMorphProgress.current < landingThreshold) {
      // Stagger the landing glow effect for each agent
      agents.forEach((agent, index) => {
        setTimeout(() => {
          setAgentsLanded(prev => ({ ...prev, [agent.id]: true }))
          // Clear glow after animation
          setTimeout(() => {
            setAgentsLanded(prev => ({ ...prev, [agent.id]: false }))
          }, 2500)
        }, index * 80)
      })
    }
    prevMorphProgress.current = currentMorphProgress
  }, [currentMorphProgress])

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: '900vh', background: colors.bg }}
    >
      {/* SpectraNoise Background */}
      <SpectraNoiseBackground
        isExpanded={false}
        logoCenter={{ x: windowSize.width / 2, y: windowSize.height / 2 }}
        logoSize={200}
      />

      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen flex items-center justify-center">

        {/* Fixed Header */}
        <div className="absolute top-0 left-0 right-0 z-50 px-2 md:px-4 py-2 md:py-3 flex items-center justify-between">
          {/* Left: Workflow Icons - hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
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
          {/* Mobile spacer */}
          <div className="md:hidden w-1" />

          {/* Right: Version Badge + Status Dropdown */}
          <div className="relative flex flex-col items-end gap-2">
            <div
              className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide"
              style={{
                background: 'rgba(255, 107, 0, 0.15)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                color: colors.accent,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Pre-Alpha v3.5
            </div>

            {/* MCP/API Status Indicators - below version badge */}
            <motion.button
              className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all hover:bg-white/5"
              onClick={() => setStatusExpanded(!statusExpanded)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {serviceStatus ? (
                <>
                  {/* Category dots */}
                  <div className="flex items-center gap-1">
                    {Object.entries(serviceStatus.byCategory || {}).map(([cat, services]) => {
                      const config = categoryConfig[cat]
                      if (!config) return null
                      const connectedCount = services.filter((s: any) => s.configured).length
                      const isActive = connectedCount > 0
                      return (
                        <div
                          key={cat}
                          className="relative group"
                          title={`${config.label}: ${connectedCount}/${services.length} active`}
                        >
                          <div
                            className="w-2 h-2 rounded-full transition-all"
                            style={{
                              background: isActive ? config.color : colors.textDim,
                              boxShadow: isActive ? `0 0 6px ${config.color}` : 'none',
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                  {/* Summary text */}
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: colors.textMuted }}
                  >
                    {serviceStatus.summary.connected}/{serviceStatus.summary.total}
                  </span>
                </>
              ) : (
                <span className="text-[10px]" style={{ color: colors.textDim }}>Loading...</span>
              )}
            </motion.button>

            {/* Expanded dropdown */}
            <AnimatePresence>
              {statusExpanded && serviceStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 p-3 rounded-xl min-w-[280px] max-h-[400px] overflow-y-auto z-50"
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="text-xs font-semibold mb-3 flex items-center justify-between" style={{ color: colors.text }}>
                    <span>Service Status</span>
                    <span style={{ color: colors.textMuted }}>
                      {serviceStatus.summary.connected} connected
                    </span>
                  </div>
                  {Object.entries(serviceStatus.byCategory || {}).map(([cat, services]) => {
                    const config = categoryConfig[cat]
                    if (!config) return null
                    const CatIcon = config.icon
                    return (
                      <div key={cat} className="mb-3 last:mb-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <CatIcon size={14} weight="duotone" color={config.color} />
                          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: config.color }}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {services.map((service: any) => (
                            <div
                              key={service.id}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px]"
                              style={{
                                background: service.configured ? `${config.color}15` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${service.configured ? `${config.color}33` : colors.border}`,
                                color: service.configured ? colors.text : colors.textDim,
                              }}
                              title={service.description}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: service.configured ? config.color : colors.textDim,
                                  boxShadow: service.configured ? `0 0 4px ${config.color}` : 'none',
                                }}
                              />
                              {service.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SECTION 1: Hero with Gradient Circle + Glitching Tech Eye */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <div className="pointer-events-auto scale-50 md:scale-100">
            <GradientCircle scrollProgress={0}>
              <GlitchingTechEye
                size={windowSize.width < 768 ? 140 : 220}
                hueBase={25}
                rotationSpeed={0.6}
                glitchiness={0.4}
                grainStrength={0.25}
                eyeFollow={0.8}
              />
            </GradientCircle>
          </div>
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

          {/* Latin Phrase - Orbiting phase - moves UP behind agents as they land */}
          <motion.div
            className="absolute text-center z-10 px-4"
            style={{ opacity: orbitPhraseOpacity, y: orbitPhraseY }}
          >
            <h2
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-wide"
              style={{
                color: colors.text,
                fontFamily: "system-ui, -apple-system, sans-serif",
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
                  textShadow: `0 0 ${30 + currentGlowProgress * 50}px ${colors.accent}${Math.round(102 + currentGlowProgress * 100).toString(16).padStart(2, '0')}, 0 0 ${60 + currentGlowProgress * 80}px ${colors.accent}${Math.round(51 + currentGlowProgress * 150).toString(16).padStart(2, '0')}, 0 0 ${currentGlowProgress * 120}px ${colors.accent}`,
                  filter: currentGlowProgress > 0.3 ? `blur(${currentGlowProgress * 2}px)` : 'none',
                }}
              >
                ex inferis
              </motion.span>
            </h2>
          </motion.div>

          {/* Chat Bar Section - slides up from below */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{
              y: chatBarY,
              opacity: chatBarOpacity,
            }}
          >
            <div className="flex flex-col items-center w-full">
            {/* Agent selector chips - with BorderBeam glow when agents land */}
            <div className="mb-4 flex justify-center gap-2 pb-2 flex-wrap w-full max-w-2xl">
              {agents.map(agent => {
                const isActive = localSelectedAgents.includes(agent.id)
                const hasLanded = agentsLanded[agent.id] || false
                const IconComponent = agent.icon
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    className="relative flex flex-col items-center px-3 md:px-5 py-2 md:py-3 rounded-lg transition-all overflow-hidden"
                    style={{
                      background: isActive ? `${agent.color}22` : colors.surface,
                      border: `1px solid ${isActive ? agent.color : colors.border}`,
                      color: isActive ? agent.color : colors.textMuted,
                      boxShadow: hasLanded ? `0 0 25px ${agent.color}66, inset 0 0 15px ${agent.color}22` : 'none',
                    }}
                  >
                    {/* BorderBeam effect when agent lands */}
                    <BorderBeam color={agent.color} isActive={hasLanded} duration={1.2} size={60} />
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <IconComponent size={16} weight="duotone" color={isActive ? agent.color : colors.textMuted} />
                      <span className="font-medium text-xs md:text-sm">{agent.name}</span>
                    </div>
                    <span className="text-[9px] md:text-[10px] opacity-70 mt-0.5 md:mt-1">{agent.role}</span>
                  </button>
                )
              })}
            </div>

            {/* Search bar - bigger text for legibility */}
            <div
              className="relative rounded-2xl overflow-hidden w-full max-w-2xl"
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
                  className="flex-1 px-4 md:px-6 py-4 md:py-5 bg-transparent text-base md:text-lg focus:outline-none"
                  style={{ color: colors.text, fontFamily: "system-ui, -apple-system, sans-serif" }}
                />
                <button
                  type="submit"
                  className="px-4 md:px-8 py-3 md:py-4 m-2 rounded-xl font-semibold text-sm md:text-base transition-all hover:brightness-110"
                  style={{
                    background: colors.accent,
                    color: colors.text,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  Create →
                </button>
              </form>
            </div>

            {/* Quick suggestions - slightly bigger for legibility */}
            <div className="mt-4 flex justify-center gap-2 flex-wrap max-w-2xl w-full">
              {['Generate product images', 'Research competitors', 'Create video ad', 'Build email campaign'].map(
                suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-4 py-2 rounded-lg text-sm transition-all hover:bg-white/10"
                    style={{
                      background: `${colors.bg}cc`,
                      border: `1px solid ${colors.border}`,
                      color: colors.textMuted,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>

            {/* Scroll hint - simple text indicator */}
            <motion.div
              className="mt-8 flex flex-col items-center gap-1"
              style={{
                opacity: useTransform(smoothProgress, [0.30, 0.35, 0.42, 0.46], [0, 1, 1, 0]),
              }}
            >
              <motion.span
                className="text-xs tracking-widest uppercase font-medium"
                style={{ color: colors.textDim }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                Workflows Below
              </motion.span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ color: colors.textDim }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </motion.div>
            </motion.div>
            </div>

            {/* Multi-colored glow at bottom - scroll hint */}
            <motion.div
              className="absolute -bottom-32 left-0 right-0 mx-auto w-[90%] max-w-[600px] h-24 pointer-events-none"
              style={{
                opacity: useTransform(smoothProgress, [0.36, 0.40, 0.44], [0, 0.8, 0]),
              }}
            >
              {/* Animated gradient glow */}
              <div
                className="absolute inset-0 blur-3xl"
                style={{
                  background: `linear-gradient(90deg,
                    ${colors.accent}60 0%,
                    #10B98160 25%,
                    #8B5CF660 50%,
                    #EC489960 75%,
                    ${colors.accent}60 100%
                  )`,
                  animation: 'glowPulse 3s ease-in-out infinite',
                }}
              />
              {/* Downward arrow hint */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ color: colors.textDim }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
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

        {/* SECTION 3: Arcana Split Animation - Symbols fracture into workflow cards */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-start pt-16 overflow-y-auto"
          style={{ opacity: workflowsOpacity }}
        >
          {/* Subtle background overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 100% 60% at 50% 80%, ${colors.bg} 0%, transparent 70%)`,
            }}
          />

          {/* Section Title - fades in and stays */}
          <motion.div
            className="text-center relative z-10 mb-12 md:mb-16"
            style={{
              y: useTransform(smoothProgress, [0.46, 0.54, 0.70], [30, 0, -30]),
              opacity: useTransform(smoothProgress, [0.46, 0.52], [0, 1]),
            }}
          >
            <h3
              className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide mb-1 md:mb-2"
              style={{
                color: colors.text,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Select Your Workflow
            </h3>
            <p
              className="text-xs md:text-sm"
              style={{ color: colors.textDim }}
            >
              Choose a creative pathway to begin
            </p>
          </motion.div>

          {/* Arcana Split Columns - unified symbols that fracture into playing cards */}
          <div className="relative w-full z-10 px-4 md:px-8 lg:px-12">
            <div className="flex justify-center items-start gap-3 md:gap-5 lg:gap-8 flex-wrap">
              {/* The Visionary - Orange */}
              <ArcanaSplit
                arcanaName="The Visionary"
                arcanaColor={colors.accent}
                arcanaSymbol={
                  <EyeIcon size={48} weight="duotone" color={colors.accent} />
                }
                cards={tarotCards.slice(0, 4)}
                scrollProgress={smoothProgress}
                splitStart={0.50}
                splitEnd={0.65}
                columnIndex={0}
                onCardSelect={onWorkflowSelect}
              />

              {/* The Merchant - Green (without custom automations) */}
              <ArcanaSplit
                arcanaName="The Merchant"
                arcanaColor="#10B981"
                arcanaSymbol={
                  <ScalesIcon size={48} weight="duotone" color="#10B981" />
                }
                cards={merchantCards}
                scrollProgress={smoothProgress}
                splitStart={0.50}
                splitEnd={0.65}
                columnIndex={1}
                onCardSelect={onWorkflowSelect}
              />

              {/* The Oracle - Purple */}
              <ArcanaSplit
                arcanaName="The Oracle"
                arcanaColor="#8B5CF6"
                arcanaSymbol={
                  <BrainIcon size={48} weight="duotone" color="#8B5CF6" />
                }
                cards={tarotCards.slice(10, 13)}
                scrollProgress={smoothProgress}
                splitStart={0.50}
                splitEnd={0.65}
                columnIndex={2}
                onCardSelect={onWorkflowSelect}
              />

              {/* The Alchemist - Pink */}
              <ArcanaSplit
                arcanaName="The Alchemist"
                arcanaColor="#EC4899"
                arcanaSymbol={
                  <SparkleIcon size={48} weight="duotone" color="#EC4899" />
                }
                cards={tarotCards.slice(13, 16)}
                scrollProgress={smoothProgress}
                splitStart={0.50}
                splitEnd={0.65}
                columnIndex={3}
                onCardSelect={onWorkflowSelect}
              />
            </div>
          </div>

          {/* Custom Automations Section */}
          <motion.div
            className="relative z-10 mt-12 md:mt-16 w-full px-4 md:px-8"
            style={{
              opacity: useTransform(smoothProgress, [0.55, 0.62], [0, 1]),
              y: useTransform(smoothProgress, [0.55, 0.62], [40, 0]),
            }}
          >
            {/* Section Header */}
            <div className="text-center mb-6 md:mb-8">
              <h4
                className="text-sm md:text-base font-semibold tracking-wider uppercase mb-1"
                style={{ color: colors.textMuted }}
              >
                Custom Automations
              </h4>
              <p className="text-xs" style={{ color: colors.textDim }}>
                Client-specific workflow pipelines
              </p>
            </div>

            {/* Horizontal Cards */}
            <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
              {customAutomations.map((card) => {
                const IconComponent = card.icon
                return (
                  <motion.div
                    key={card.id}
                    className="relative cursor-pointer group"
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onWorkflowSelect?.(card.id)}
                    style={{
                      width: 280,
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 16,
                      padding: '20px 24px',
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, #10B98120 0%, transparent 70%)`,
                      }}
                    />

                    <div className="relative flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `#10B98115` }}
                      >
                        <IconComponent size={24} weight="duotone" color="#10B981" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h5
                          className="font-semibold text-sm md:text-base truncate"
                          style={{ color: colors.text }}
                        >
                          {card.title}
                        </h5>
                        <p
                          className="text-xs truncate mt-0.5"
                          style={{ color: colors.textMuted }}
                        >
                          {card.subtitle}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#10B981' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Capabilities pills */}
                    <div className="relative flex flex-wrap gap-1.5 mt-3">
                      {card.capabilities.slice(0, 3).map((cap, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            background: `#10B98110`,
                            color: '#10B981',
                            border: `1px solid #10B98130`,
                          }}
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

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

      {/* Aurora Borealis - Fixed to bottom of viewport */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 pointer-events-none z-50"
        style={{
          opacity: useTransform(smoothProgress, [0.30, 0.36, 0.44, 0.50], [0, 1, 1, 0]),
          height: 120,
        }}
      >
        {/* Fade gradient from transparent to aurora */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${colors.bg}40 100%)`,
          }}
        />

        {/* Aurora wave layers */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Layer 1 - Purple/violet wave */}
          <motion.div
            className="absolute h-24 blur-3xl"
            animate={{
              x: ['-10%', '10%', '-10%'],
              scaleX: [1, 1.3, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: '-10%',
              right: '-10%',
              bottom: '-20%',
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(139, 92, 246, 0.4) 15%,
                rgba(168, 85, 247, 0.55) 35%,
                rgba(139, 92, 246, 0.45) 55%,
                rgba(168, 85, 247, 0.35) 75%,
                transparent 100%
              )`,
            }}
          />

          {/* Layer 2 - Green/cyan wave */}
          <motion.div
            className="absolute h-20 blur-3xl"
            animate={{
              x: ['5%', '-15%', '5%'],
              scaleX: [1.2, 0.9, 1.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            style={{
              left: '-10%',
              right: '-10%',
              bottom: '-10%',
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(16, 185, 129, 0.3) 20%,
                rgba(6, 182, 212, 0.45) 45%,
                rgba(16, 185, 129, 0.4) 70%,
                transparent 100%
              )`,
            }}
          />

          {/* Layer 3 - Orange/amber accent wave */}
          <motion.div
            className="absolute h-16 blur-2xl"
            animate={{
              x: ['-8%', '12%', '-8%'],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{
              left: '-10%',
              right: '-10%',
              bottom: '0%',
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(255, 107, 0, 0.25) 25%,
                rgba(251, 191, 36, 0.4) 50%,
                rgba(255, 107, 0, 0.3) 75%,
                transparent 100%
              )`,
            }}
          />

          {/* Layer 4 - Pink/magenta wave */}
          <motion.div
            className="absolute h-14 blur-3xl"
            animate={{
              x: ['12%', '-8%', '12%'],
              scaleX: [0.85, 1.2, 0.85],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            style={{
              left: '-10%',
              right: '-10%',
              bottom: '5%',
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(236, 72, 153, 0.25) 15%,
                rgba(219, 39, 119, 0.4) 40%,
                rgba(236, 72, 153, 0.35) 65%,
                rgba(219, 39, 119, 0.25) 85%,
                transparent 100%
              )`,
            }}
          />

          {/* Traveling shimmer effect */}
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ['200% 50%', '-100% 50%'],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background: `linear-gradient(90deg,
                transparent 0%,
                transparent 40%,
                rgba(255, 255, 255, 0.1) 48%,
                rgba(255, 255, 255, 0.15) 50%,
                rgba(255, 255, 255, 0.1) 52%,
                transparent 60%,
                transparent 100%
              )`,
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
