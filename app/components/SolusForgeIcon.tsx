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
  const strokeWidth = size * 0.008

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
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer circle */}
      <motion.circle
        cx="100"
        cy="100"
        r="90"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={0.6}
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      {/* Inner geometric shape - stylized S/forge symbol */}
      <g filter="url(#glow)" opacity={0.9}>
        {/* Top arc swooping down-left */}
        <motion.path
          d="M 140 50 Q 170 80, 150 110 Q 130 140, 100 140"
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
        />

        {/* Bottom arc swooping up-right */}
        <motion.path
          d="M 60 150 Q 30 120, 50 90 Q 70 60, 100 60"
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeInOut' }}
        />

        {/* Diagonal cross line 1 - top-left to bottom-right */}
        <motion.line
          x1="65"
          y1="65"
          x2="135"
          y2="135"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.6, delay: 0.7, ease: 'easeInOut' }}
        />

        {/* Diagonal cross line 2 - top-right to bottom-left */}
        <motion.line
          x1="135"
          y1="65"
          x2="65"
          y2="135"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.6, delay: 0.9, ease: 'easeInOut' }}
        />

        {/* Center diamond/rhombus shape */}
        <motion.path
          d="M 100 70 L 130 100 L 100 130 L 70 100 Z"
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.8, delay: 1.1, ease: 'easeInOut' }}
        />
      </g>

      {/* Subtle outer ring accent */}
      <circle
        cx="100"
        cy="100"
        r="95"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        fill="none"
        opacity={0.2}
      />
    </motion.svg>
  )
}
