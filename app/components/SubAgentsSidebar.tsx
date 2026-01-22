'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'

interface SubAgent {
  id: string
  name: string
  icon: string
  specialty: string
  capabilities: string[]
  status: 'active' | 'idle' | 'busy'
}

interface SubAgentsSidebarProps {
  agents: SubAgent[]
  selectedAgents: string[]
  onToggleAgent: (agentId: string) => void
}

export default function SubAgentsSidebar({
  agents,
  selectedAgents,
  onToggleAgent
}: SubAgentsSidebarProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Stagger animation on mount
  useEffect(() => {
    const items = itemRefs.current.filter(Boolean)

    gsap.fromTo(items,
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      }
    )
  }, [])

  // Hover animation
  const handleHover = (el: HTMLDivElement | null, isEntering: boolean) => {
    if (!el) return

    gsap.to(el, {
      x: isEntering ? 8 : 0,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-full z-40 flex"
    >
      {/* Main Sidebar */}
      <div
        className={`h-full bg-[#1a2805]/95 backdrop-blur-xl border-r border-[#3a5510]/50 transition-all duration-500 ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#3a5510]/30">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-[#E7FFD9] text-lg font-bold tracking-wider">AGENTS</span>
                <span className="px-2 py-0.5 bg-[#3a5510]/50 rounded-full text-[10px] text-[#9AB88A]">
                  {selectedAgents.length} active
                </span>
              </motion.div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-[#3a5510]/30 rounded-lg transition-colors"
            >
              <svg
                className={`w-4 h-4 text-[#9AB88A] transition-transform ${isExpanded ? '' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Agent List */}
        <div className="p-3 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
          {agents.map((agent, index) => (
            <div
              key={agent.id}
              ref={el => { itemRefs.current[index] = el }}
              onClick={() => onToggleAgent(agent.id)}
              onMouseEnter={(e) => {
                setHoveredAgent(agent.id)
                handleHover(e.currentTarget, true)
              }}
              onMouseLeave={(e) => {
                setHoveredAgent(null)
                handleHover(e.currentTarget, false)
              }}
              className={`relative group cursor-pointer rounded-xl transition-all duration-300 ${
                selectedAgents.includes(agent.id)
                  ? 'bg-[#3a5510]/40 border border-[#5a7530]'
                  : 'bg-transparent border border-transparent hover:bg-[#3a5510]/20 hover:border-[#3a5510]/50'
              } ${isExpanded ? 'p-3' : 'p-2 flex justify-center'}`}
            >
              {/* Status indicator */}
              <div
                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                  selectedAgents.includes(agent.id) ? 'bg-[#7CFC00] animate-pulse' : 'bg-[#5a7a4a]'
                }`}
              />

              <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
                {/* Icon */}
                <div
                  className={`flex items-center justify-center rounded-lg text-xl ${
                    isExpanded ? 'w-10 h-10' : 'w-8 h-8'
                  } ${
                    selectedAgents.includes(agent.id)
                      ? 'bg-[#5a7530]/50'
                      : 'bg-[#2a3a1a]/50'
                  }`}
                >
                  {agent.icon}
                </div>

                {/* Details (only when expanded) */}
                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#E7FFD9] font-medium text-sm truncate">
                        {agent.name}
                      </span>
                    </div>
                    <span className="text-[#7a9a6a] text-xs truncate block">
                      {agent.specialty}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded tooltip on hover (for collapsed state) */}
              {!isExpanded && hoveredAgent === agent.id && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50"
                >
                  <div className="bg-[#1a2805] border border-[#3a5510] rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                    <div className="text-[#E7FFD9] font-medium text-sm">{agent.name}</div>
                    <div className="text-[#7a9a6a] text-xs">{agent.specialty}</div>
                  </div>
                </motion.div>
              )}

              {/* Capabilities tooltip (expanded state) */}
              <AnimatePresence>
                {isExpanded && hoveredAgent === agent.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-full top-0 ml-3 z-50"
                  >
                    <div className="bg-[#1a2805] border border-[#3a5510] rounded-lg p-3 shadow-xl min-w-[180px]">
                      <div className="text-[#9AB88A] text-[10px] uppercase tracking-wider mb-2">
                        Capabilities
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((cap, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-[#2a3a1a] rounded text-[10px] text-[#7a9a6a]"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3a5510]/30 bg-[#1a2805]/95">
            <div className="text-[10px] text-[#5a7a4a] text-center">
              Click to toggle agents
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
