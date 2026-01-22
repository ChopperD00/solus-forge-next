'use client'

import { motion, MotionValue, useTransform } from 'framer-motion'
import { ReactNode, ComponentType, useState } from 'react'

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

// Playing card dimensions - larger for better text legibility
const CARD_WIDTH = 150
const CARD_HEIGHT = 200

// Flippable Tarot Card component
function FlippableCard({
  card,
  arcanaColor,
  transforms,
  onSelect,
}: {
  card: ArcanaCard
  arcanaColor: string
  transforms: { x: MotionValue<number>; y: MotionValue<number>; scale: MotionValue<number>; rotate: MotionValue<number> }
  onSelect?: (id: string) => void
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const IconComponent = card.icon

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        x: transforms.x,
        y: transforms.y,
        scale: transforms.scale,
        rotate: transforms.rotate,
        perspective: 1000,
      }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
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
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center p-3"
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
          <div className="absolute top-2 left-2 w-3 h-3 border-l border-t" style={{ borderColor: `${arcanaColor}44` }} />
          <div className="absolute top-2 right-2 w-3 h-3 border-r border-t" style={{ borderColor: `${arcanaColor}44` }} />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b" style={{ borderColor: `${arcanaColor}44` }} />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b" style={{ borderColor: `${arcanaColor}44` }} />

          {/* Icon */}
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center mb-3"
            style={{
              background: `${arcanaColor}15`,
              border: `1px solid ${arcanaColor}33`,
            }}
          >
            <IconComponent size={32} weight="duotone" color={arcanaColor} />
          </div>

          {/* Title - larger */}
          <span
            className="text-lg font-bold text-center leading-tight"
            style={{ color: colors.text }}
          >
            {card.title}
          </span>

          {/* Subtitle - larger, more legible */}
          <span
            className="text-sm text-center mt-2 leading-snug px-2"
            style={{ color: colors.textMuted }}
          >
            {card.subtitle}
          </span>
        </div>

        {/* Back of card (capabilities) */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col p-4"
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
          <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: `${arcanaColor}33` }}>
            <IconComponent size={18} weight="duotone" color={arcanaColor} />
            <span className="text-xs font-semibold" style={{ color: arcanaColor }}>
              {card.title}
            </span>
          </div>

          {/* Capabilities list */}
          <div className="flex-1 flex flex-col gap-2">
            {card.capabilities.map((cap, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[11px]"
                style={{ color: colors.text }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: arcanaColor }}
                />
                <span className="leading-tight">{cap}</span>
              </div>
            ))}
          </div>

          {/* Click to select indicator */}
          <div
            className="text-[10px] text-center mt-2 pt-2 border-t opacity-80 font-medium"
            style={{ borderColor: `${arcanaColor}33`, color: arcanaColor }}
          >
            Click to select →
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
  const stagger = columnIndex * 0.02
  const adjustedStart = splitStart + stagger
  const adjustedEnd = splitEnd + stagger

  // Symbol animations
  const symbolOpacity = useTransform(
    scrollProgress,
    [adjustedStart, adjustedStart + 0.05, adjustedEnd - 0.05, adjustedEnd],
    [0, 1, 1, 0]
  )

  const symbolScale = useTransform(
    scrollProgress,
    [adjustedStart, adjustedStart + 0.05, adjustedEnd - 0.02, adjustedEnd],
    [0.5, 1.2, 1, 0.3]
  )

  // Cards fade in
  const cardsOpacity = useTransform(
    scrollProgress,
    [adjustedEnd - 0.05, adjustedEnd + 0.03],
    [0, 1]
  )

  // Card position transforms - simple fade in with slight stagger
  const getCardTransform = (cardIndex: number, totalCards: number) => {
    // No Y movement - cards are already stacked by flexbox
    const y = useTransform(scrollProgress, [0, 1], [0, 0])

    // No X movement
    const x = useTransform(scrollProgress, [0, 1], [0, 0])

    // Simple scale in
    const scale = useTransform(
      scrollProgress,
      [adjustedEnd - 0.05 + cardIndex * 0.01, adjustedEnd + cardIndex * 0.01],
      [0.8, 1]
    )

    // No rotation
    const rotate = useTransform(scrollProgress, [0, 1], [0, 0])

    return { x, y, scale, rotate }
  }

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: CARD_WIDTH + 20 }}
    >
      {/* Arcana Name - positioned above everything */}
      <motion.span
        className="text-[10px] uppercase tracking-widest mb-4 whitespace-nowrap font-semibold"
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
        {/* Unified Arcana Symbol */}
        <motion.div
          className="absolute flex flex-col items-center justify-center"
          style={{
            opacity: symbolOpacity,
            scale: symbolScale,
            top: '20%',
          }}
        >
          <div
            className="absolute w-32 h-32 rounded-full blur-2xl"
            style={{ background: `${arcanaColor}30` }}
          />
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.bg} 100%)`,
              border: `2px solid ${arcanaColor}`,
              boxShadow: `0 0 40px ${arcanaColor}44, inset 0 0 30px ${arcanaColor}22`,
            }}
          >
            {arcanaSymbol}
          </div>

          {/* Fracture lines */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
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

          {/* Particle burst */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
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

        {/* Playing Cards - simple vertical stack */}
        <motion.div
          className="flex flex-col items-center gap-3"
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
              />
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
