'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import GradientCircle from './GradientCircle'
import SpectraNoiseBackground from './SpectraNoiseBackground'

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

// Agent configurations with increased orbital radius
const agents = [
  {
    id: 'solus',
    name: 'Solus',
    fullName: 'Claude Opus',
    icon: '🔮',
    specialty: 'Strategic Oversight',
    role: 'Strategic Oversight',
    orbitRadius: 340,
    orbitSpeed: 0.25,
    orbitOffset: 0,
    color: '#8B5CF6',
  },
  {
    id: 'quintus',
    name: 'Quintus',
    fullName: 'Claude Haiku',
    icon: '📐',
    specialty: 'Planner',
    role: 'Planner/Optimization',
    orbitRadius: 340,
    orbitSpeed: 0.25,
    orbitOffset: Math.PI / 3,
    color: '#06B6D4',
  },
  {
    id: 'trion',
    name: 'Trion',
    fullName: 'Anthropic',
    icon: '🔍',
    specialty: 'Research & Discovery',
    role: 'Research & Discovery',
    orbitRadius: 340,
    orbitSpeed: 0.25,
    orbitOffset: (Math.PI * 2) / 3,
    color: '#10B981',
  },
  {
    id: 'lathe',
    name: 'Lathe',
    fullName: 'Claude Sonnet',
    icon: '⚖️',
    specialty: 'Quality Control',
    role: 'Quality Control/Reviewer',
    orbitRadius: 340,
    orbitSpeed: 0.25,
    orbitOffset: Math.PI,
    color: '#F59E0B',
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    fullName: 'Gemini',
    icon: '✨',
    specialty: 'Creative Generation',
    role: 'Creative Generation',
    orbitRadius: 340,
    orbitSpeed: 0.25,
    orbitOffset: (Math.PI * 4) / 3,
    color: '#EC4899',
  },
  {
    id: 'cortex',
    name: 'Cortex',
    fullName: 'NotebookLM',
    icon: '🧠',
    specialty: 'Memory & Context',
    role: 'Archival',
    orbitRadius: 340,
    orbitSpeed: 0.25,
    orbitOffset: (Math.PI * 5) / 3,
    color: '#EF4444',
  },
]

// Workflow cards data
const workflows = [
  { id: 'email_campaign', icon: '📧', title: 'Email Campaign', subtitle: 'Figma templates, copy, AI images', color: colors.accent },
  { id: 'video_production', icon: '🎬', title: 'Video Production', subtitle: 'AI video generation & editing', color: '#FF8C00' },
  { id: 'image_generation', icon: '🎨', title: 'Image Generation', subtitle: 'Concept art & product shots', color: '#F59E0B' },
  { id: 'influencer_suite', icon: '👤', title: 'Influencer Suite', subtitle: 'LoRA training & clothing swap', color: '#E1306C' },
  { id: 'social_paid_ads', icon: '📱', title: 'Social Paid Ads', subtitle: 'Multi-format ad creation', color: '#1877F2' },
  { id: 'audio', icon: '🎵', title: 'Audio Production', subtitle: 'Music, SFX & voiceover', color: '#10B981' },
  { id: '3d_assets', icon: '🎲', title: '3D Assets', subtitle: 'Models, textures & scenes', color: '#8B5CF6' },
  { id: 'research', icon: '🔬', title: 'Research', subtitle: 'Parallel AI research', color: '#06B6D4' },
]

interface FloatingAgentProps {
  agent: typeof agents[0]
  scrollProgress: number
  time: number
  index: number
  isSelected: boolean
  onSelect: () => void
  windowSize: { width: number; height: number }
}

function FloatingAgent({
  agent,
  scrollProgress,
  time,
  index,
  isSelected,
  onSelect,
  windowSize,
}: FloatingAgentProps) {
  const angle = agent.orbitOffset + time * agent.orbitSpeed
  const orbitX = Math.cos(angle) * agent.orbitRadius
  const orbitY = Math.sin(angle) * agent.orbitRadius * 0.4

  const scale = 1 - scrollProgress * 0.3
  const labelOpacity = Math.max(0, 1 - scrollProgress * 3)

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        x: orbitX,
        y: orbitY,
        scale,
        zIndex: isSelected ? 20 : 10,
      }}
      onClick={onSelect}
      whileHover={{ scale: scale * 1.1 }}
    >
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
        }}
      >
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${agent.color}33 0%, transparent 70%)`,
            transform: 'scale(1.5)',
          }}
        />
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: colors.surface,
            border: `2px solid ${isSelected ? agent.color : colors.border}`,
            boxShadow: isSelected ? `0 0 20px ${agent.color}66` : 'none',
          }}
        >
          <span className="text-xl">{agent.icon}</span>
        </div>
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
          style={{ opacity: labelOpacity }}
        >
          <div className="text-xs font-medium" style={{ color: colors.text }}>
            {agent.name}
          </div>
        </motion.div>
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

  // Orbital animation
  useEffect(() => {
    let animationFrame: number
    const animate = () => {
      setTime(prev => prev + 0.016)
      animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

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
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 1.5])
  const crucibleOpacity = useTransform(smoothProgress, [0.1, 0.25], [0, 1])
  const searchBarY = useTransform(smoothProgress, [0.2, 0.35], [100, 0])
  const workflowsOpacity = useTransform(smoothProgress, [0.5, 0.65], [0, 1])
  const workflowsY = useTransform(smoothProgress, [0.5, 0.65], [100, 0])

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

        {/* SECTION 1: Hero with Gradient Circle + Logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <GradientCircle scrollProgress={0}>
            <div className="text-center">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider mb-4 brand-text"
                style={{
                  color: colors.text,
                  textShadow: `0 0 60px ${colors.accent}66`,
                }}
              >
                SOLUS FORGE
              </h1>
              <p className="text-base md:text-lg" style={{ color: colors.textMuted }}>
                AI Creative Command Center
              </p>
              <motion.div
                className="mt-8"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="text-sm" style={{ color: colors.textDim }}>
                  Scroll to enter ↓
                </span>
              </motion.div>
            </div>
          </GradientCircle>
        </motion.div>

        {/* SECTION 2: Enter the Crucible with Orbiting Agents */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: crucibleOpacity }}
        >
          {/* Title */}
          <motion.div className="text-center mb-8 z-20">
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3"
              style={{
                color: colors.text,
                textShadow: `0 0 40px ${colors.accent}44`,
              }}
            >
              Enter the{' '}
              <span
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, #F59E0B 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Crucible
              </span>
            </h2>
            <p className="text-base md:text-lg" style={{ color: colors.textMuted }}>
              Where AI models converge to forge your vision
            </p>
          </motion.div>

          {/* Orbiting Agents */}
          <div className="relative" style={{ width: 0, height: 0 }}>
            {agents.map((agent, index) => (
              <FloatingAgent
                key={agent.id}
                agent={agent}
                scrollProgress={Math.max(0, (progress - 0.3) * 3)}
                time={time}
                index={index}
                isSelected={localSelectedAgents.includes(agent.id)}
                onSelect={() => handleAgentSelect(agent.id)}
                windowSize={windowSize}
              />
            ))}
          </div>

          {/* Search Bar Section - Centered */}
          <motion.div
            className="absolute w-full max-w-3xl px-4"
            style={{
              top: '55%',
              y: searchBarY,
            }}
          >
            {/* Agent selector chips with roles */}
            <div className="mb-4 flex justify-center gap-2 flex-wrap">
              <span className="text-sm mr-2" style={{ color: colors.textMuted }}>
                {localSelectedAgents.length} agents:
              </span>
              {agents.map(agent => {
                const isActive = localSelectedAgents.includes(agent.id)
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    className="flex flex-col items-center px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: isActive ? `${agent.color}22` : colors.surface,
                      border: `1px solid ${isActive ? agent.color : colors.border}`,
                      color: isActive ? agent.color : colors.textMuted,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{agent.icon}</span>
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

        {/* SECTION 3: Workflow Cards */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center pt-20"
          style={{ opacity: workflowsOpacity, y: workflowsY }}
        >
          <h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: colors.text }}
          >
            Choose Your Workflow
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl px-4">
            {workflows.map((workflow, index) => (
              <motion.button
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onWorkflowSelect?.(workflow.id)}
                className="flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
                whileHover={{
                  borderColor: workflow.color,
                  boxShadow: `0 0 30px ${workflow.color}33`,
                }}
              >
                <span className="text-3xl mb-2">{workflow.icon}</span>
                <span className="font-medium text-sm" style={{ color: colors.text }}>
                  {workflow.title}
                </span>
                <span className="text-[10px] text-center mt-1" style={{ color: colors.textDim }}>
                  {workflow.subtitle}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
