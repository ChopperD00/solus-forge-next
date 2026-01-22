'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BorderBeamProps {
  color: string
  isActive: boolean
  duration?: number
  size?: number
}

export default function BorderBeam({
  color,
  isActive,
  duration = 1.5,
  size = 80,
}: BorderBeamProps) {
  const [showBeam, setShowBeam] = useState(false)

  useEffect(() => {
    if (isActive) {
      setShowBeam(true)
      // Hide after animation completes (2 loops)
      const timer = setTimeout(() => {
        setShowBeam(false)
      }, duration * 2000 * 2)
      return () => clearTimeout(timer)
    }
  }, [isActive, duration])

  if (!showBeam) return null

  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
      {/* Animated border beam */}
      <motion.div
        className="absolute"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color} 0%, ${color}88 30%, transparent 70%)`,
          filter: 'blur(4px)',
        }}
        initial={{
          top: 0,
          left: 0,
          opacity: 0,
        }}
        animate={{
          // Travel around the border: top -> right -> bottom -> left -> top
          top: ['0%', '0%', '100%', '100%', '0%'],
          left: ['0%', '100%', '100%', '0%', '0%'],
          opacity: [0, 1, 1, 1, 0],
          x: ['-50%', '-50%', '-50%', '-50%', '-50%'],
          y: ['-50%', '-50%', '-50%', '-50%', '-50%'],
        }}
        transition={{
          duration: duration,
          repeat: 2,
          ease: 'linear',
        }}
      />

      {/* Secondary beam (offset) */}
      <motion.div
        className="absolute"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background: `radial-gradient(circle, white 0%, ${color}66 40%, transparent 70%)`,
          filter: 'blur(2px)',
        }}
        initial={{
          top: '100%',
          left: '100%',
          opacity: 0,
        }}
        animate={{
          top: ['100%', '100%', '0%', '0%', '100%'],
          left: ['100%', '0%', '0%', '100%', '100%'],
          opacity: [0, 0.8, 0.8, 0.8, 0],
          x: ['-50%', '-50%', '-50%', '-50%', '-50%'],
          y: ['-50%', '-50%', '-50%', '-50%', '-50%'],
        }}
        transition={{
          duration: duration,
          repeat: 2,
          ease: 'linear',
        }}
      />

      {/* Glow overlay that fades in then out */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          boxShadow: `inset 0 0 20px ${color}66, 0 0 30px ${color}44`,
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 0.8, 0.6, 0.4, 0],
        }}
        transition={{
          duration: duration * 2,
          times: [0, 0.1, 0.3, 0.7, 1],
        }}
      />
    </div>
  )
}
