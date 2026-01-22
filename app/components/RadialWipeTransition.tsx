'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RadialWipeTransitionProps {
  isActive: boolean
  origin?: { x: number; y: number }
  color?: string
  duration?: number
  onComplete?: () => void
  children?: React.ReactNode
}

export default function RadialWipeTransition({
  isActive,
  origin = { x: 50, y: 50 },
  color = '#FF6B00',
  duration = 0.8,
  onComplete,
  children,
}: RadialWipeTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'expanding' | 'content' | 'complete'>('idle')

  useEffect(() => {
    if (isActive && phase === 'idle') {
      setPhase('expanding')
    } else if (!isActive && phase !== 'idle') {
      setPhase('idle')
    }
  }, [isActive, phase])

  useEffect(() => {
    if (phase === 'expanding') {
      const timer = setTimeout(() => {
        setPhase('content')
      }, duration * 500)
      return () => clearTimeout(timer)
    }
    if (phase === 'content') {
      const timer = setTimeout(() => {
        setPhase('complete')
        onComplete?.()
      }, duration * 500)
      return () => clearTimeout(timer)
    }
  }, [phase, duration, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Radial wipe circle */}
          <motion.div
            className="absolute"
            style={{
              left: `${origin.x}%`,
              top: `${origin.y}%`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${color} 0%, ${color}dd 40%, ${color}99 70%, transparent 100%)`,
              borderRadius: '50%',
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 1,
            }}
            animate={{
              width: '300vmax',
              height: '300vmax',
              opacity: phase === 'complete' ? 0 : 1,
            }}
            transition={{
              width: { duration: duration, ease: [0.22, 1, 0.36, 1] },
              height: { duration: duration, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.3, delay: phase === 'complete' ? 0 : duration },
            }}
          />

          {/* Inner glow ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              left: `${origin.x}%`,
              top: `${origin.y}%`,
              transform: 'translate(-50%, -50%)',
              border: `2px solid ${color}`,
              boxShadow: `0 0 30px ${color}, inset 0 0 30px ${color}44`,
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 1,
            }}
            animate={{
              width: '300vmax',
              height: '300vmax',
              opacity: 0,
            }}
            transition={{
              width: { duration: duration * 0.8, ease: [0.22, 1, 0.36, 1] },
              height: { duration: duration * 0.8, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: duration * 0.6, delay: duration * 0.2 },
            }}
          />

          {/* Particle burst */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const distance = 150
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${origin.x}%`,
                  top: `${origin.y}%`,
                  background: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: duration * 0.6,
                  ease: 'easeOut',
                  delay: 0.05,
                }}
              />
            )
          })}

          {/* Content fade in */}
          {children && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'content' || phase === 'complete' ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing transition state
export function useRadialWipe() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionOrigin, setTransitionOrigin] = useState({ x: 50, y: 50 })
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null)

  const triggerTransition = (origin: { x: number; y: number }, callback?: () => void) => {
    setTransitionOrigin(origin)
    setIsTransitioning(true)
    if (callback) {
      setPendingCallback(() => callback)
    }
  }

  const handleComplete = () => {
    if (pendingCallback) {
      pendingCallback()
      setPendingCallback(null)
    }
    // Keep transition visible briefly after callback
    setTimeout(() => {
      setIsTransitioning(false)
    }, 100)
  }

  return {
    isTransitioning,
    transitionOrigin,
    triggerTransition,
    handleComplete,
  }
}
