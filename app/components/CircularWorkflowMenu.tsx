'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'

interface WorkflowCube {
  id: string
  icon: string
  title: string
  subtitle: string
  color: string
}

interface CircularWorkflowMenuProps {
  workflows: WorkflowCube[]
  onSelect: (id: string) => void
  commandPrompt: string
  onCommandChange: (value: string) => void
  onCommandSubmit: () => void
  isProcessing: boolean
}

export default function CircularWorkflowMenu({
  workflows,
  onSelect,
  commandPrompt,
  onCommandChange,
  onCommandSubmit,
  isProcessing
}: CircularWorkflowMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cubesRef = useRef<(HTMLDivElement | null)[]>([])
  const logoRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredCube, setHoveredCube] = useState<string | null>(null)

  // Calculate positions for cubes in a circle
  const getPositionForIndex = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start from top
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    }
  }

  // Animate cubes expanding from center
  useEffect(() => {
    if (!containerRef.current) return

    const radius = 200 // Distance from center
    const cubes = cubesRef.current.filter(Boolean)

    if (isExpanded) {
      // Expand animation - cubes fly out from center
      cubes.forEach((cube, index) => {
        if (!cube) return
        const pos = getPositionForIndex(index, workflows.length, radius)

        gsap.fromTo(cube,
          {
            x: 0,
            y: 0,
            scale: 0,
            rotation: -180,
            opacity: 0
          },
          {
            x: pos.x,
            y: pos.y,
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.08,
            ease: 'back.out(1.7)'
          }
        )
      })

      // Logo pulse
      gsap.to(logoRef.current, {
        scale: 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      })
    } else {
      // Collapse animation - cubes return to center
      cubes.forEach((cube, index) => {
        if (!cube) return

        gsap.to(cube, {
          x: 0,
          y: 0,
          scale: 0,
          rotation: 180,
          opacity: 0,
          duration: 0.5,
          delay: (workflows.length - index - 1) * 0.05,
          ease: 'back.in(1.7)'
        })
      })
    }
  }, [isExpanded, workflows.length])

  // Hover effect on cubes
  const handleCubeHover = (cube: HTMLDivElement | null, isEntering: boolean, cubeId: string) => {
    if (!cube) return

    if (isEntering) {
      setHoveredCube(cubeId)
      gsap.to(cube, {
        scale: 1.15,
        duration: 0.3,
        ease: 'power2.out'
      })
    } else {
      setHoveredCube(null)
      gsap.to(cube, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
  }

  // Continuous subtle rotation animation for idle state
  useEffect(() => {
    if (!isExpanded) return

    const cubes = cubesRef.current.filter(Boolean)

    // Gentle floating animation
    cubes.forEach((cube, index) => {
      if (!cube) return

      gsap.to(cube, {
        y: `+=${Math.sin(index) * 5}`,
        duration: 2 + index * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    })

    return () => {
      cubes.forEach(cube => {
        if (cube) gsap.killTweensOf(cube)
      })
    }
  }, [isExpanded])

  return (
    <div className="relative flex items-center justify-center min-h-[600px]">
      {/* Central Logo / Expand Button */}
      <motion.div
        ref={logoRef}
        className="absolute z-20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#223307] to-[#1a2805] border-2 border-[#3a5510] flex items-center justify-center shadow-2xl shadow-[#223307]/50">
          <div className="text-center">
            <div className="text-4xl mb-1">⚡</div>
            <div className="text-[#E7FFD9] text-xs font-bold tracking-wider">
              {isExpanded ? 'CLOSE' : 'FORGE'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Workflow Cubes Container */}
      <div ref={containerRef} className="relative w-[500px] h-[500px]">
        {workflows.map((workflow, index) => (
          <div
            key={workflow.id}
            ref={el => { cubesRef.current[index] = el }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => {
              if (isExpanded) onSelect(workflow.id)
            }}
            onMouseEnter={(e) => handleCubeHover(e.currentTarget, true, workflow.id)}
            onMouseLeave={(e) => handleCubeHover(e.currentTarget, false, workflow.id)}
            style={{ opacity: 0 }}
          >
            <div
              className="w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all duration-300 border-2"
              style={{
                background: `linear-gradient(135deg, ${workflow.color}22, ${workflow.color}44)`,
                borderColor: hoveredCube === workflow.id ? workflow.color : `${workflow.color}66`,
                boxShadow: hoveredCube === workflow.id
                  ? `0 0 30px ${workflow.color}44, 0 0 60px ${workflow.color}22`
                  : `0 4px 20px ${workflow.color}22`
              }}
            >
              <span className="text-2xl mb-1">{workflow.icon}</span>
              <span className="text-[10px] text-[#E7FFD9] font-medium text-center px-1 leading-tight">
                {workflow.title.split(' ')[0]}
              </span>
            </div>

            {/* Tooltip on hover */}
            <AnimatePresence>
              {hoveredCube === workflow.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-2 bg-[#1a2805] border border-[#3a5510] rounded-lg whitespace-nowrap z-30"
                >
                  <div className="text-[#E7FFD9] text-sm font-semibold">{workflow.title}</div>
                  <div className="text-[#9AB88A] text-xs">{workflow.subtitle}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Central Chat Prompt (shows when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.3 }}
            className="absolute z-10 w-80"
            style={{ top: '60%' }}
          >
            <div className="bg-[#1a2805]/90 backdrop-blur-xl border border-[#3a5510] rounded-2xl p-4 shadow-2xl">
              <textarea
                value={commandPrompt}
                onChange={(e) => onCommandChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    onCommandSubmit()
                  }
                }}
                placeholder="Command your agents..."
                className="w-full h-20 bg-transparent text-[#E7FFD9] placeholder-[#5a7a4a] text-sm resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  <span className="text-[10px] text-[#5a7a4a]">⌘ + Enter</span>
                </div>
                <button
                  onClick={onCommandSubmit}
                  disabled={isProcessing || !commandPrompt.trim()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isProcessing || !commandPrompt.trim()
                      ? 'bg-[#2a3a1a] text-[#5a7a4a] cursor-not-allowed'
                      : 'bg-[#3a5510] text-[#E7FFD9] hover:bg-[#4a6520]'
                  }`}
                >
                  {isProcessing ? '...' : '⚡ Execute'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative ring */}
      <div
        className="absolute w-[450px] h-[450px] rounded-full border border-[#3a5510]/30 pointer-events-none"
        style={{
          opacity: isExpanded ? 0.5 : 0,
          transition: 'opacity 0.5s ease'
        }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full border border-[#3a5510]/20 pointer-events-none"
        style={{
          opacity: isExpanded ? 0.3 : 0,
          transition: 'opacity 0.5s ease 0.1s'
        }}
      />
    </div>
  )
}
