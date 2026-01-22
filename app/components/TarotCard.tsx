'use client'

import { useState, useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

const colors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
  accent: '#FF6B00',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TarotCardProps {
  card: {
    id: string
    icon: React.ComponentType<any>
    title: string
    subtitle: string
    capabilities: string[]
    arcana: string
  }
  index: number
  arcX: number
  arcY: number
  arcRotation: number
  gridX: number
  gridY: number
  gridRotation: number
  cardDelay: number
  onSelect: () => void
  scrollProgress: number
}

export default function TarotCard({
  card,
  index,
  arcX,
  arcY,
  arcRotation,
  gridX,
  gridY,
  gridRotation,
  cardDelay,
  onSelect,
  scrollProgress,
}: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const IconComponent = card.icon

  // Card animation phases based on scroll progress
  // Phase 1 (0.55-0.65): Cards fly in from off-screen to arc formation
  // Phase 2 (0.65-0.80): Cards move from arc to grid positions
  // Phase 3 (0.80+): Cards are in final grid positions

  // Calculate animation progress for this specific card (with stagger)
  const cardProgress = Math.max(0, Math.min(1, (scrollProgress - 0.55 - cardDelay) / 0.25))

  // Entrance phase: cards start below screen and fly up to arc
  const entranceProgress = Math.max(0, Math.min(1, cardProgress * 2)) // 0-0.5 of cardProgress
  // Settle phase: cards move from arc to grid
  const settleProgress = Math.max(0, Math.min(1, (cardProgress - 0.5) * 2)) // 0.5-1 of cardProgress

  // Easing functions
  const easeOutBack = (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  // Entry animation (from below to arc)
  const entryY = 400 // Start 400px below
  const easedEntrance = easeOutBack(entranceProgress)

  // Current positions interpolated
  const currentX = entranceProgress < 1
    ? arcX * easedEntrance
    : arcX * (1 - easeOutCubic(settleProgress)) + gridX * easeOutCubic(settleProgress)

  const currentY = entranceProgress < 1
    ? entryY * (1 - easedEntrance) + arcY * easedEntrance
    : arcY * (1 - easeOutCubic(settleProgress)) + gridY * easeOutCubic(settleProgress)

  const currentRotation = entranceProgress < 1
    ? arcRotation * easedEntrance
    : arcRotation * (1 - easeOutCubic(settleProgress)) + gridRotation * easeOutCubic(settleProgress)

  // Scale animation
  const scale = entranceProgress < 0.5
    ? 0.5 + easedEntrance * 0.5
    : 1

  // Opacity
  const opacity = entranceProgress < 0.1 ? entranceProgress * 10 : 1

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 cursor-pointer"
      style={{
        x: currentX,
        y: currentY,
        rotate: currentRotation,
        scale,
        opacity,
        transformOrigin: 'center center',
        zIndex: isHovered ? 50 : 10 + index,
      }}
      onMouseEnter={() => {
        setIsHovered(true)
        setIsFlipped(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsFlipped(false)
      }}
      onClick={onSelect}
      whileHover={{ scale: 1.1, zIndex: 50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Card Container with 3D perspective */}
      <div
        className="relative w-[120px] h-[170px]"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Inner card that flips */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT FACE - Icon + Title */}
          <div
            className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 backface-hidden"
            style={{
              background: isHovered ? `${colors.surface}` : 'transparent',
              border: `2px solid ${colors.accent}`,
              boxShadow: `
                0 0 20px ${colors.accent}44,
                inset 0 0 30px ${colors.accent}11
              `,
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Icon */}
            <div
              className="tarot-icon transition-all duration-300"
              style={{
                filter: isHovered
                  ? `drop-shadow(0 0 15px ${colors.accent})`
                  : 'none',
              }}
            >
              <IconComponent
                size={40}
                weight="duotone"
                color={isHovered ? colors.accent : colors.text}
              />
            </div>

            {/* Title */}
            <div className="text-center px-2">
              <p
                className="text-xs font-semibold leading-tight"
                style={{
                  color: isHovered ? colors.accent : colors.text,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {card.title}
              </p>
            </div>

            {/* Arcana badge */}
            <div
              className="absolute bottom-2 text-[8px] uppercase tracking-wider"
              style={{ color: colors.textDim }}
            >
              {card.arcana}
            </div>

            {/* Corner decorations */}
            <div
              className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2"
              style={{ borderColor: colors.accent }}
            />
            <div
              className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2"
              style={{ borderColor: colors.accent }}
            />
            <div
              className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2"
              style={{ borderColor: colors.accent }}
            />
            <div
              className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2"
              style={{ borderColor: colors.accent }}
            />
          </div>

          {/* BACK FACE - Capabilities */}
          <div
            className="absolute inset-0 rounded-xl flex flex-col items-center justify-center p-3 backface-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.bg} 100%)`,
              border: `2px solid ${colors.accent}`,
              boxShadow: `
                0 0 30px ${colors.accent}66,
                inset 0 0 40px ${colors.accent}22
              `,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Title */}
            <p
              className="text-sm font-bold mb-2 text-center"
              style={{
                color: colors.accent,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {card.title}
            </p>

            {/* Subtitle */}
            <p
              className="text-[9px] mb-3 text-center leading-tight"
              style={{ color: colors.textMuted }}
            >
              {card.subtitle}
            </p>

            {/* Capabilities */}
            <div className="space-y-1">
              {card.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 text-[8px]"
                  style={{ color: colors.textMuted }}
                >
                  <span style={{ color: colors.accent }}>◆</span>
                  {cap}
                </div>
              ))}
            </div>

            {/* Open prompt */}
            <p
              className="absolute bottom-2 text-[8px] italic"
              style={{ color: colors.textDim }}
            >
              Click to enter
            </p>

            {/* Corner decorations */}
            <div
              className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2"
              style={{ borderColor: colors.accent }}
            />
            <div
              className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2"
              style={{ borderColor: colors.accent }}
            />
            <div
              className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2"
              style={{ borderColor: colors.accent }}
            />
            <div
              className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2"
              style={{ borderColor: colors.accent }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
