'use client'

import { motion } from 'framer-motion'

interface SolusForgeIconProps {
  size?: number
  color?: string
  glowColor?: string
  animated?: boolean
  className?: string
}

export default function SolusForgeIcon({
  size = 200,
  color = '#FFFFFF',
  glowColor = 'rgba(255, 107, 0, 0.3)',
  animated = true,
  className = '',
}: SolusForgeIconProps) {
  const strokeWidth = size * 0.012

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={animated ? { opacity: 0, scale: 0.9 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Glow filter */}
      <defs>
        <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="irisGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FF8C00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="pupilGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="1" />
          <stop offset="70%" stopColor="#0A0A0A" stopOpacity="1" />
          <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Outer glow ring */}
      <motion.circle
        cx="100"
        cy="100"
        r="95"
        stroke={color}
        strokeWidth={strokeWidth * 0.3}
        fill="none"
        opacity={0.15}
        initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 0.15 } : undefined}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Eye outer shape - almond/lemon shape */}
      <motion.path
        d="M 20 100 Q 100 30, 180 100 Q 100 170, 20 100"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        filter="url(#eyeGlow)"
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Eye inner lid line - top */}
      <motion.path
        d="M 35 100 Q 100 50, 165 100"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        fill="none"
        opacity={0.4}
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeInOut' }}
      />

      {/* Eye inner lid line - bottom */}
      <motion.path
        d="M 35 100 Q 100 150, 165 100"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        fill="none"
        opacity={0.4}
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeInOut' }}
      />

      {/* Iris - outer circle with gradient */}
      <motion.circle
        cx="100"
        cy="100"
        r="38"
        fill="url(#irisGradient)"
        stroke={color}
        strokeWidth={strokeWidth * 0.4}
        opacity={0.8}
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 0.8 } : undefined}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
      />

      {/* Iris detail rings */}
      <motion.circle
        cx="100"
        cy="100"
        r="32"
        stroke="#FF6B00"
        strokeWidth={strokeWidth * 0.3}
        fill="none"
        opacity={0.3}
        initial={animated ? { scale: 0 } : undefined}
        animate={animated ? { scale: 1 } : undefined}
        transition={{ duration: 0.5, delay: 0.5 }}
      />

      {/* Pupil - deep black center */}
      <motion.circle
        cx="100"
        cy="100"
        r="18"
        fill="url(#pupilGradient)"
        initial={animated ? { scale: 0 } : undefined}
        animate={animated ? { scale: 1 } : undefined}
        transition={{ duration: 0.4, delay: 0.6, ease: 'backOut' }}
      />

      {/* Inner pupil void - absolute black */}
      <motion.circle
        cx="100"
        cy="100"
        r="10"
        fill="#000000"
        initial={animated ? { scale: 0 } : undefined}
        animate={animated ? { scale: 1 } : undefined}
        transition={{ duration: 0.3, delay: 0.7, ease: 'easeOut' }}
      />

      {/* Highlight/reflection */}
      <motion.circle
        cx="90"
        cy="90"
        r="5"
        fill={color}
        opacity={0.7}
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 0.7 } : undefined}
        transition={{ duration: 0.3, delay: 0.9, ease: 'easeOut' }}
      />

      {/* Secondary smaller highlight */}
      <motion.circle
        cx="112"
        cy="108"
        r="2"
        fill={color}
        opacity={0.4}
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 0.4 } : undefined}
        transition={{ duration: 0.2, delay: 1, ease: 'easeOut' }}
      />

      {/* Subtle pulsing glow around iris */}
      {animated && (
        <motion.circle
          cx="100"
          cy="100"
          r="42"
          stroke="#FF6B00"
          strokeWidth={1}
          fill="none"
          opacity={0.2}
          animate={{
            r: [42, 45, 42],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.svg>
  )
}
