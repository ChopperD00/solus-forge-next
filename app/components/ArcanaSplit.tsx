'use client'

import { motion, MotionValue, useTransform } from 'framer-motion'
import { ReactNode, ComponentType, useState, useEffect } from 'react'

interface ArcanaCard {
  id: string
  icon: ComponentType<any>
  title: string
  subtitle: string
  capabilities: string[]
  arcana: string
}

interface ArcanaSplitProps {
  arcanaName: string
  arcanaColor: string
  arcanaSymbol: ReactNode
  cards: ArcanaCard[]
  scrollProgress: MotionValue<number>
  splitStart: number
  splitEnd: number
  columnIndex: number
  onCardSelect?: (cardId: string) => void
}

const colors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
}

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  return isMobile
}

// Playing card dimensions - responsive
const CARD_WIDTH_DESKTOP = 150
const CARD_HEIGHT_DESKTOP = 200
const CARD_WIDTH_MOBILE = 120
const CARD_HEIGHT_MOBILE = 160

// Flippable Tarot Card component
function FlippableCard({
  card,
  arcanaColor,
  transforms,
  onSelect,
  isMobile,
}: {
  card: ArcanaCard
  arcanaColor: string
  transforms: { x: MotionValue<number>; y: MotionValue<number>; scale: MotionValue<number>; rotate: MotionValue<number> }
  onSelect?: (id: string) => void
  isMobile: boolean
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const IconComponent = card.icon

  const cardWidth = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP
  const cardHeight = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP

  return (
    <motion.div
      className="relative cursor-pointer flex-shrink-0"
      style={{
        width: cardWidth,
        height: cardHeight,
        x: transforms.x,
        y: transforms.y,
        scale: transforms.scale,
        rotate: transforms.rotate,
        perspective: 1000,
      }}
      onMouseEnter={() => !isMobile && setIsFlipped(true)}
      onMouseLeave={() => !isMobile && setIsFlipped(false)}
      onTouchStart={() => isMobile && setIsFlipped(!isFlipped)}
      onClick={() => onSelect?.(card.id)}
    >
      {/* Card container with 3D flip */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center p-2 md:p-3"
          style={{
            backfaceVisibility: 'hidden',
            background: `linear-gradient(145deg, ${colors.surface} 0%, ${colors.bg} 100%)`,
            border: `1px solid ${arcanaColor}55`,
            boxShadow: `
              0 4px 20px rgba(0,0,0,0.4),
              0 0 20px ${arcanaColor}22,
              inset 0 1px 0 rgba(255,255,255,0.05)
            `,
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 w-2 h-2 md:w-3 md:h-3 border-l border-t" style={{ borderColor: `${arcanaColor}44` }} />
          <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 md:w-3 md:h-3 border-r border-t" style={{ borderColor: `${arcanaColor}44` }} />
          <div className="absolute bottom-1.5 left-1.5 md:bottom-2 md:left-2 w-2 h-2 md:w-3 md:h-3 border-l border-b" style={{ borderColor: `${arcanaColor}44` }} />
          <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 w-2 h-2 md:w-3 md:h-3 border-r border-b" style={{ borderColor: `${arcanaColor}44` }} />

          {/* Icon */}
          <div
            className="w-10 h-10 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-2 md:mb-3"
            style={{
              background: `${arcanaColor}15`,
              border: `1px solid ${arcanaColor}33`,
            }}
          >
            <IconComponent size={isMobile ? 24 : 32} weight="duotone" color={arcanaColor} />
          </div>

          {/* Title */}
          <span
            className="text-sm md:text-lg font-bold text-center leading-tight"
            style={{ color: colors.text }}
          >
            {card.title}
          </span>

          {/* Subtitle */}
          <span
            className="text-[10px] md:text-sm text-center mt-1 md:mt-2 leading-snug px-1 md:px-2"
            style={{ color: colors.textMuted }}
          >
            {card.subtitle}
          </span>
        </div>

        {/* Back of card (capabilities) */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col p-2 md:p-4"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(145deg, ${arcanaColor}22 0%, ${colors.bg} 100%)`,
            border: `1px solid ${arcanaColor}`,
            boxShadow: `
              0 4px 20px rgba(0,0,0,0.4),
              0 0 30px ${arcanaColor}44,
              inset 0 0 40px ${arcanaColor}11
            `,
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3 pb-1 md:pb-2 border-b" style={{ borderColor: `${arcanaColor}33` }}>
            <IconComponent size={isMobile ? 14 : 18} weight="duotone" color={arcanaColor} />
            <span className="text-[10px] md:text-xs font-semibold" style={{ color: arcanaColor }}>
              {card.title}
            </span>
          </div>

          {/* Capabilities list */}
          <div className="flex-1 flex flex-col gap-1 md:gap-2">
            {card.capabilities.map((cap, i) => (
              <div
                key={i}
                className="flex items-center gap-1 md:gap-2 text-[9px] md:text-[11px]"
                style={{ color: colors.text }}
              >
                <div
                  className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0"
                  style={{ background: arcanaColor }}
                />
                <span className="leading-tight">{cap}</span>
              </div>
            ))}
          </div>

          {/* Click to select indicator */}
          <div
            className="text-[8px] md:text-[10px] text-center mt-1 md:mt-2 pt-1 md:pt-2 border-t opacity-80 font-medium"
            style={{ borderColor: `${arcanaColor}33`, color: arcanaColor }}
          >
            Tap to select →
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ArcanaSplit({
  arcanaName,
  arcanaColor,
  arcanaSymbol,
  cards,
  scrollProgress,
  splitStart,
  splitEnd,
  columnIndex,
  onCardSelect,
}: ArcanaSplitProps) {
  const isMobile = useIsMobile()
  const cardWidth = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP

  // Minimal stagger for subtle wave effect - all columns reveal together
  const stagger = columnIndex * 0.005
  const adjustedStart = splitStart + stagger
  const adjustedEnd = splitEnd + stagger

  // Symbol animations - shorter duration, fades out quickly
  const symbolOpacity = useTransform(
    scrollProgress,
    [adjustedStart, adjustedStart + 0.03, adjustedEnd - 0.08, adjustedEnd - 0.03],
    [0, 1, 1, 0]
  )

  const symbolScale = useTransform(
    scrollProgress,
    [adjustedStart, adjustedStart + 0.03, adjustedEnd - 0.05, adjustedEnd - 0.02],
    [0.5, 1.2, 1, 0.3]
  )

  // Cards fade in as symbols fade out - tighter timing
  const cardsOpacity = useTransform(
    scrollProgress,
    [adjustedEnd - 0.06, adjustedEnd - 0.02],
    [0, 1]
  )

  // Card position transforms - simple fade in with slight stagger
  const getCardTransform = (cardIndex: number, _totalCards: number) => {
    // No Y movement - cards are already stacked by flexbox
    const y = useTransform(scrollProgress, [0, 1], [0, 0])

    // No X movement
    const x = useTransform(scrollProgress, [0, 1], [0, 0])

    // Simple scale in with minimal card stagger
    const scale = useTransform(
      scrollProgress,
      [adjustedEnd - 0.06 + cardIndex * 0.005, adjustedEnd - 0.02 + cardIndex * 0.005],
      [0.8, 1]
    )

    // No rotation
    const rotate = useTransform(scrollProgress, [0, 1], [0, 0])

    return { x, y, scale, rotate }
  }

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: cardWidth + 20, minHeight: isMobile ? 700 : 900 }}
    >
      {/* Arcana Name - positioned above everything */}
      <motion.span
        className="text-[8px] md:text-[10px] uppercase tracking-widest mb-3 md:mb-6 whitespace-nowrap font-semibold"
        style={{
          color: arcanaColor,
          opacity: useTransform(scrollProgress, [adjustedStart, adjustedStart + 0.03], [0, 0.9]),
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {arcanaName}
      </motion.span>

      {/* Container for symbol and cards */}
      <div className="relative flex flex-col items-center justify-start">
        {/* Unified Arcana Symbol - collapses when not visible */}
        <motion.div
          className="flex flex-col items-center justify-center"
          style={{
            opacity: symbolOpacity,
            scale: symbolScale,
            height: 0,
            marginBottom: 0,
            overflow: 'visible',
          }}
        >
          <div
            className="absolute w-20 h-20 md:w-32 md:h-32 rounded-full blur-2xl"
            style={{ background: `${arcanaColor}30` }}
          />
          <div
            className="relative w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.bg} 100%)`,
              border: `2px solid ${arcanaColor}`,
              boxShadow: `0 0 40px ${arcanaColor}44, inset 0 0 30px ${arcanaColor}22`,
            }}
          >
            {arcanaSymbol}
          </div>

          {/* Fracture lines - hidden on mobile for cleaner look */}
          <motion.div
            className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none"
            style={{
              opacity: useTransform(
                scrollProgress,
                [adjustedEnd - 0.08, adjustedEnd - 0.04, adjustedEnd],
                [0, 1, 0]
              ),
            }}
          >
            <svg
              className="absolute w-28 h-28"
              viewBox="0 0 100 100"
              style={{ filter: `drop-shadow(0 0 4px ${arcanaColor})` }}
            >
              <motion.path
                d="M50 20 L48 35 L45 50 L50 65 L52 80"
                stroke={arcanaColor}
                strokeWidth="1"
                fill="none"
                style={{
                  pathLength: useTransform(
                    scrollProgress,
                    [adjustedEnd - 0.08, adjustedEnd - 0.02],
                    [0, 1]
                  ),
                }}
              />
              <motion.path
                d="M30 40 L40 45 L50 50 L60 48 L70 42"
                stroke={arcanaColor}
                strokeWidth="0.5"
                fill="none"
                style={{
                  pathLength: useTransform(
                    scrollProgress,
                    [adjustedEnd - 0.06, adjustedEnd - 0.01],
                    [0, 1]
                  ),
                }}
              />
            </svg>
          </motion.div>

          {/* Particle burst - hidden on mobile */}
          <motion.div
            className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none"
            style={{
              opacity: useTransform(
                scrollProgress,
                [adjustedEnd - 0.02, adjustedEnd, adjustedEnd + 0.03],
                [0, 1, 0]
              ),
            }}
          >
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: arcanaColor,
                    boxShadow: `0 0 10px ${arcanaColor}`,
                    x: useTransform(
                      scrollProgress,
                      [adjustedEnd - 0.02, adjustedEnd + 0.02],
                      [0, Math.cos(angle) * 50]
                    ),
                    y: useTransform(
                      scrollProgress,
                      [adjustedEnd - 0.02, adjustedEnd + 0.02],
                      [0, Math.sin(angle) * 50]
                    ),
                    scale: useTransform(
                      scrollProgress,
                      [adjustedEnd - 0.02, adjustedEnd, adjustedEnd + 0.02],
                      [0, 1.5, 0]
                    ),
                  }}
                />
              )
            })}
          </motion.div>
        </motion.div>

        {/* Playing Cards - vertical stack */}
        <motion.div
          className="flex flex-col items-center gap-2 md:gap-3"
          style={{ opacity: cardsOpacity }}
        >
          {cards.map((card, cardIndex) => {
            const transforms = getCardTransform(cardIndex, cards.length)
            return (
              <FlippableCard
                key={card.id}
                card={card}
                arcanaColor={arcanaColor}
                transforms={transforms}
                onSelect={onCardSelect}
                isMobile={isMobile}
              />
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
