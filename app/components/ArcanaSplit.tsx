'use client'

import { motion, MotionValue, useTransform } from 'framer-motion'
import { ReactNode, ComponentType } from 'react'

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
  splitStart: number // When the split animation starts (0-1)
  splitEnd: number // When the split animation ends (0-1)
  columnIndex: number // For staggering
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
  // Stagger the animation slightly per column
  const stagger = columnIndex * 0.02
  const adjustedStart = splitStart + stagger
  const adjustedEnd = splitEnd + stagger

  // Symbol opacity fades out as split progresses
  const symbolOpacity = useTransform(
    scrollProgress,
    [adjustedStart, adjustedStart + 0.05, adjustedEnd - 0.05, adjustedEnd],
    [0, 1, 1, 0]
  )

  // Symbol scale pulses then shrinks
  const symbolScale = useTransform(
    scrollProgress,
    [adjustedStart, adjustedStart + 0.05, adjustedEnd - 0.02, adjustedEnd],
    [0.5, 1.2, 1, 0.3]
  )

  // Cards opacity (inverse of symbol - fade in as symbol fades out)
  const cardsOpacity = useTransform(
    scrollProgress,
    [adjustedEnd - 0.05, adjustedEnd + 0.03],
    [0, 1]
  )

  // Card positions - they split outward from center
  const getCardTransform = (cardIndex: number, totalCards: number) => {
    // Cards start stacked at center, then spread out vertically
    const centerOffset = (totalCards - 1) / 2
    const finalY = (cardIndex - centerOffset) * 70 // Final vertical spacing

    // Add slight horizontal jitter during split
    const jitterX = (cardIndex % 2 === 0 ? -1 : 1) * 20

    const y = useTransform(
      scrollProgress,
      [adjustedEnd - 0.05, adjustedEnd + 0.02],
      [0, finalY]
    )

    const x = useTransform(
      scrollProgress,
      [adjustedEnd - 0.05, adjustedEnd - 0.02, adjustedEnd + 0.02],
      [0, jitterX, 0]
    )

    const scale = useTransform(
      scrollProgress,
      [adjustedEnd - 0.05, adjustedEnd],
      [0.8, 1]
    )

    const rotate = useTransform(
      scrollProgress,
      [adjustedEnd - 0.05, adjustedEnd - 0.02, adjustedEnd + 0.02],
      [cardIndex * 5 - totalCards * 2.5, cardIndex * 3, 0]
    )

    return { x, y, scale, rotate }
  }

  return (
    <div className="relative flex flex-col items-center flex-1" style={{ minWidth: 150, maxWidth: 180, minHeight: 400 }}>
      {/* Arcana Name - always visible once section starts */}
      <motion.span
        className="text-[10px] uppercase tracking-widest mb-4 whitespace-nowrap"
        style={{
          color: arcanaColor,
          opacity: useTransform(scrollProgress, [adjustedStart, adjustedStart + 0.03], [0, 0.7]),
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {arcanaName}
      </motion.span>

      {/* Container for symbol and cards */}
      <div className="relative flex-1 flex items-center justify-center" style={{ minHeight: 320 }}>
        {/* Unified Arcana Symbol - fades/scales out during split */}
        <motion.div
          className="absolute flex flex-col items-center justify-center"
          style={{
            opacity: symbolOpacity,
            scale: symbolScale,
          }}
        >
          {/* Glowing backdrop */}
          <div
            className="absolute w-32 h-32 rounded-full blur-2xl"
            style={{ background: `${arcanaColor}30` }}
          />

          {/* Symbol container */}
          <div
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.bg} 100%)`,
              border: `2px solid ${arcanaColor}`,
              boxShadow: `
                0 0 40px ${arcanaColor}44,
                inset 0 0 30px ${arcanaColor}22
              `,
            }}
          >
            {arcanaSymbol}
          </div>

          {/* Fracture lines that appear before split */}
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
            {/* Crack lines */}
            <svg
              className="absolute w-32 h-32"
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
              <motion.path
                d="M35 60 L45 55 L55 58 L65 55"
                stroke={arcanaColor}
                strokeWidth="0.5"
                fill="none"
                style={{
                  pathLength: useTransform(
                    scrollProgress,
                    [adjustedEnd - 0.05, adjustedEnd],
                    [0, 1]
                  ),
                }}
              />
            </svg>
          </motion.div>

          {/* Particle burst on split */}
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
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2
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
                      [0, Math.cos(angle) * 60]
                    ),
                    y: useTransform(
                      scrollProgress,
                      [adjustedEnd - 0.02, adjustedEnd + 0.02],
                      [0, Math.sin(angle) * 60]
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

        {/* Individual Cards - emerge from split */}
        <motion.div
          className="absolute flex flex-col items-center gap-3"
          style={{ opacity: cardsOpacity }}
        >
          {cards.map((card, cardIndex) => {
            const IconComponent = card.icon
            const transforms = getCardTransform(cardIndex, cards.length)

            return (
              <motion.button
                key={card.id}
                className="w-[140px] h-[60px] rounded-xl flex items-center gap-3 px-3 transition-all"
                style={{
                  background: 'transparent',
                  border: `1px solid ${arcanaColor}66`,
                  boxShadow: `0 0 15px ${arcanaColor}22`,
                  x: transforms.x,
                  y: transforms.y,
                  scale: transforms.scale,
                  rotate: transforms.rotate,
                }}
                whileHover={{
                  background: `${arcanaColor}15`,
                  boxShadow: `0 0 25px ${arcanaColor}44`,
                  scale: 1.05,
                }}
                onClick={() => onCardSelect?.(card.id)}
              >
                <IconComponent size={24} weight="duotone" color={colors.text} />
                <span className="text-xs text-left leading-tight" style={{ color: colors.text }}>
                  {card.title}
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
