'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'

// SSR-safe window dimensions hook
function useWindowSize() {
  const [size, setSize] = useState({ width: 1920, height: 1080 }) // Default for SSR

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

// Agent configurations with orbital positions
// Claude (Opus) = Solus - Strategic Oversight
// Claude (Haiku) = Quintus - Planner and workflow optimization
// Anthropic = Trion - Research and Discovery
// Claude (Sonnet) = Lathe - Quality control and reviewer
// Gemini = Alchemist - Creative Generation
// NotebookLM = Cortex - Archival, memory, context save
const agents = [
  {
    id: 'solus',
    name: 'Solus',
    fullName: 'Claude Opus',
    icon: '🔮',
    specialty: 'Strategic Oversight',
    description: 'Deep reasoning & executive decisions',
    orbitRadius: 280,
    orbitSpeed: 0.3,
    orbitOffset: 0,
    color: '#8B5CF6',
  },
  {
    id: 'quintus',
    name: 'Quintus',
    fullName: 'Claude Haiku',
    icon: '📐',
    specialty: 'Planner',
    description: 'Workflow optimization & routing',
    orbitRadius: 280,
    orbitSpeed: 0.3,
    orbitOffset: Math.PI / 3,
    color: '#06B6D4',
  },
  {
    id: 'trion',
    name: 'Trion',
    fullName: 'Anthropic',
    icon: '🔍',
    specialty: 'Research & Discovery',
    description: 'Web research & cited sources',
    orbitRadius: 280,
    orbitSpeed: 0.3,
    orbitOffset: (Math.PI * 2) / 3,
    color: '#10B981',
  },
  {
    id: 'lathe',
    name: 'Lathe',
    fullName: 'Claude Sonnet',
    icon: '⚖️',
    specialty: 'Quality Control',
    description: 'Review, validation & refinement',
    orbitRadius: 280,
    orbitSpeed: 0.3,
    orbitOffset: Math.PI,
    color: '#F59E0B',
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    fullName: 'Gemini',
    icon: '✨',
    specialty: 'Creative Generation',
    description: 'Multimodal synthesis & ideation',
    orbitRadius: 280,
    orbitSpeed: 0.3,
    orbitOffset: (Math.PI * 4) / 3,
    color: '#EC4899',
  },
  {
    id: 'cortex',
    name: 'Cortex',
    fullName: 'NotebookLM',
    icon: '🧠',
    specialty: 'Memory & Context',
    description: 'Archival & knowledge retrieval',
    orbitRadius: 280,
    orbitSpeed: 0.3,
    orbitOffset: (Math.PI * 5) / 3,
    color: '#EF4444',
  },
]

interface FloatingAgentProps {
  agent: typeof agents[0]
  scrollProgress: number
  time: number
  index: number
  isSelected: boolean
  onSelect: () => void
  searchBarRect: DOMRect | null
  windowSize: { width: number; height: number }
}

function FloatingAgent({
  agent,
  scrollProgress,
  time,
  index,
  isSelected,
  onSelect,
  searchBarRect,
  windowSize,
}: FloatingAgentProps) {
  // Calculate orbital position
  const angle = agent.orbitOffset + time * agent.orbitSpeed
  const orbitX = Math.cos(angle) * agent.orbitRadius
  const orbitY = Math.sin(angle) * agent.orbitRadius * 0.4 // Elliptical orbit

  // Target position in search bar (evenly distributed)
  const searchBarX = searchBarRect
    ? searchBarRect.left + (searchBarRect.width / (agents.length + 1)) * (index + 1) - windowSize.width / 2
    : 0
  const searchBarY = searchBarRect
    ? searchBarRect.top + searchBarRect.height / 2 - windowSize.height / 2
    : 200

  // Interpolate between orbit and search bar positions
  const x = orbitX * (1 - scrollProgress) + searchBarX * scrollProgress
  const y = orbitY * (1 - scrollProgress) + searchBarY * scrollProgress

  // Scale down as we approach search bar
  const scale = 1 - scrollProgress * 0.3

  // Opacity for labels
  const labelOpacity = 1 - scrollProgress * 2

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        x,
        y,
        scale,
        zIndex: isSelected ? 20 : 10,
      }}
      onClick={onSelect}
      whileHover={{ scale: scale * 1.1 }}
    >
      {/* Connection line to center */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          width: agent.orbitRadius * 2,
          height: agent.orbitRadius,
          transform: 'translate(-50%, -50%)',
          opacity: (1 - scrollProgress) * 0.2,
        }}
      >
        <line
          x1="50%"
          y1="50%"
          x2={agent.orbitRadius}
          y2={agent.orbitRadius / 2}
          stroke={colors.textDim}
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Agent node */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: 60 - scrollProgress * 20,
          height: 60 - scrollProgress * 20,
        }}
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${agent.color}33 0%, transparent 70%)`,
            transform: 'scale(1.5)',
          }}
        />

        {/* Main circle */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: colors.surface,
            border: `2px solid ${isSelected ? agent.color : colors.border}`,
            boxShadow: isSelected ? `0 0 20px ${agent.color}66` : 'none',
          }}
        >
          <span style={{ fontSize: 24 - scrollProgress * 8 }}>{agent.icon}</span>
        </div>

        {/* Label */}
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
          style={{ opacity: labelOpacity }}
        >
          <div className="text-xs font-medium" style={{ color: colors.text }}>
            {agent.name}
          </div>
          <div className="text-[10px]" style={{ color: colors.textDim }}>
            {agent.specialty}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

interface CrucibleLandingProps {
  onAgentSelect?: (agentId: string) => void
  onPromptSubmit?: (prompt: string) => void
  selectedAgents?: string[]
}

export default function CrucibleLanding({
  onAgentSelect,
  onPromptSubmit,
  selectedAgents = ['claude', 'perplexity'],
}: CrucibleLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [searchBarRect, setSearchBarRect] = useState<DOMRect | null>(null)
  const windowSize = useWindowSize() // SSR-safe window dimensions
  // Default to solus and trion selected
  const [localSelectedAgents, setLocalSelectedAgents] = useState<string[]>(
    selectedAgents.length > 0 ? selectedAgents : ['solus', 'trion']
  )

  // Scroll-based animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Transform scroll to our animation progress (0 to 1)
  const morphProgress = useTransform(smoothProgress, [0, 0.5], [0, 1])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = morphProgress.on('change', setProgress)
    return () => unsubscribe()
  }, [morphProgress])

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

  // Track search bar position
  useEffect(() => {
    const updateRect = () => {
      if (searchBarRef.current) {
        setSearchBarRect(searchBarRef.current.getBoundingClientRect())
      }
    }
    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
    }
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

  // Title text animation
  const titleOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0])
  const titleY = useTransform(smoothProgress, [0, 0.3], [0, -50])
  const titleScale = useTransform(smoothProgress, [0, 0.3], [1, 0.8])

  // Search bar animation
  const searchOpacity = useTransform(smoothProgress, [0.3, 0.5], [0, 1])
  const searchY = useTransform(smoothProgress, [0.3, 0.5], [50, 0])

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: '200vh', background: colors.bg }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background gradient mesh */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, ${colors.accent}22 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, #8B5CF622 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, ${colors.surface} 0%, ${colors.bg} 100%)
            `,
          }}
        />

        {/* Curved connection lines (decorative) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.1 * (1 - progress) }}
        >
          {agents.map((agent, i) => {
            const nextAgent = agents[(i + 1) % agents.length]
            const angle1 = agent.orbitOffset + time * agent.orbitSpeed
            const angle2 = nextAgent.orbitOffset + time * nextAgent.orbitSpeed
            const x1 = windowSize.width / 2 + Math.cos(angle1) * agent.orbitRadius
            const y1 = windowSize.height / 2 + Math.sin(angle1) * agent.orbitRadius * 0.4
            const x2 = windowSize.width / 2 + Math.cos(angle2) * nextAgent.orbitRadius
            const y2 = windowSize.height / 2 + Math.sin(angle2) * nextAgent.orbitRadius * 0.4
            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2 - 50

            return (
              <path
                key={`line-${i}`}
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                stroke={colors.textDim}
                strokeWidth="1"
                fill="none"
                strokeDasharray="8 8"
              />
            )
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* "Enter the Crucible" title */}
          <motion.div
            className="absolute text-center z-10"
            style={{
              opacity: titleOpacity,
              y: titleY,
              scale: titleScale,
            }}
          >
            <motion.h1
              className="text-6xl md:text-7xl font-bold mb-4 tracking-tight brand-text"
              style={{
                color: colors.text,
                textShadow: `0 0 60px ${colors.accent}44`,
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
            </motion.h1>
            <p className="text-lg md:text-xl max-w-md mx-auto" style={{ color: colors.textMuted }}>
              Where AI models converge to forge your vision
            </p>
            <motion.div
              className="mt-8 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-sm" style={{ color: colors.textDim }}>
                Scroll to begin
              </span>
              <motion.span
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ color: colors.accent }}
              >
                ↓
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Floating agents */}
          <div className="relative" style={{ width: 0, height: 0 }}>
            {agents.map((agent, index) => (
              <FloatingAgent
                key={agent.id}
                agent={agent}
                scrollProgress={progress}
                time={time}
                index={index}
                isSelected={localSelectedAgents.includes(agent.id)}
                onSelect={() => handleAgentSelect(agent.id)}
                searchBarRect={searchBarRect}
                windowSize={windowSize}
              />
            ))}
          </div>
        </div>

        {/* Search bar section (appears on scroll) */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: '50%',
            opacity: searchOpacity,
            y: searchY,
            width: '90%',
            maxWidth: 800,
          }}
        >
          {/* Agent overview */}
          <motion.div
            className="mb-6 text-center"
            style={{ opacity: progress > 0.4 ? 1 : 0 }}
          >
            <p className="text-sm mb-2" style={{ color: colors.textMuted }}>
              {localSelectedAgents.length} agents ready
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {agents.map(agent => {
                const isActive = localSelectedAgents.includes(agent.id)
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{
                      background: isActive ? `${agent.color}22` : colors.surface,
                      border: `1px solid ${isActive ? agent.color : colors.border}`,
                      color: isActive ? agent.color : colors.textMuted,
                    }}
                  >
                    <span>{agent.icon}</span>
                    <span>{agent.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Search bar */}
          <div
            ref={searchBarRef}
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
                className="flex-1 px-6 py-5 bg-transparent text-base focus:outline-none"
                style={{ color: colors.text }}
              />
              <button
                type="submit"
                className="px-6 py-3 m-2 rounded-xl font-medium transition-all"
                style={{
                  background: colors.accent,
                  color: colors.text,
                }}
              >
                Create →
              </button>
            </form>

            {/* Subtle gradient border animation */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.accent}33, transparent)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s infinite linear',
                opacity: 0.5,
              }}
            />
          </div>

          {/* Quick suggestions */}
          <motion.div
            className="mt-4 flex justify-center gap-2 flex-wrap"
            style={{ opacity: progress > 0.5 ? 1 : 0 }}
          >
            {['Generate product images', 'Research competitors', 'Create video ad', 'Build email campaign'].map(
              suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-white/10"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    color: colors.textMuted,
                  }}
                >
                  {suggestion}
                </button>
              )
            )}
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
