'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

interface DripProps {
  delay: number
  duration: number
  startX: number
  color: string
  size: number
}

function Drip({ delay, duration, startX, color, size }: DripProps) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: startX,
        top: '100%',
        width: size,
        height: size,
        background: color,
        filter: `blur(${size * 0.3}px)`,
      }}
      initial={{ y: 0, opacity: 0.8, scaleY: 1 }}
      animate={{
        y: [0, 30, 80, 150],
        opacity: [0.8, 0.6, 0.3, 0],
        scaleY: [1, 1.5, 2.5, 4],
        scaleX: [1, 0.8, 0.5, 0.3],
      }}
      transition={{
        duration,
        delay,
        ease: 'easeIn',
        repeat: Infinity,
        repeatDelay: duration * 0.5,
      }}
    />
  )
}

interface MeltingLetterProps {
  letter: string
  index: number
  color: string
  meltColor: string
  fontSize: number
  isMelting: boolean
  meltProgress: number // 0 to 1
}

function MeltingLetter({ letter, index, color, meltColor, fontSize, isMelting, meltProgress }: MeltingLetterProps) {
  const uniqueId = `melt-${index}-${letter}`

  // Each letter has slightly different timing
  const letterDelay = index * 0.08
  const letterMeltProgress = Math.max(0, Math.min(1, (meltProgress - letterDelay * 0.5) * 1.5))

  // Drip properties vary per letter
  const drips = useMemo(() => {
    const numDrips = 2 + Math.floor(Math.random() * 2)
    return Array.from({ length: numDrips }, (_, i) => ({
      delay: letterDelay + i * 0.3 + Math.random() * 0.2,
      duration: 1.5 + Math.random() * 1,
      startX: (Math.random() - 0.5) * fontSize * 0.6,
      size: 3 + Math.random() * 4,
    }))
  }, [letterDelay, fontSize])

  return (
    <motion.span
      className="relative inline-block"
      style={{
        color: color,
        fontSize,
        fontWeight: 'bold',
      }}
      animate={isMelting ? {
        y: [0, letterMeltProgress * 8],
        filter: [
          'blur(0px)',
          `blur(${letterMeltProgress * 2}px)`,
        ],
      } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* SVG filter for melting distortion */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={uniqueId} x="-50%" y="-50%" width="200%" height="300%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.015 + letterMeltProgress * 0.02}
              numOctaves="2"
              seed={index}
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                values={`0.01;${0.02 + letterMeltProgress * 0.03};0.01`}
                dur="3s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={letterMeltProgress * 15}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation={letterMeltProgress * 0.5} />
          </filter>
        </defs>
      </svg>

      {/* Main letter with distortion */}
      <span
        style={{
          filter: isMelting && letterMeltProgress > 0.1 ? `url(#${uniqueId})` : 'none',
          display: 'inline-block',
          transform: `scaleY(${1 + letterMeltProgress * 0.3})`,
          transformOrigin: 'top center',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {letter === ' ' ? '\u00A0' : letter}
      </span>

      {/* Dripping effect */}
      {isMelting && letterMeltProgress > 0.2 && letter !== ' ' && (
        <>
          {drips.map((drip, i) => (
            <Drip
              key={i}
              delay={drip.delay}
              duration={drip.duration}
              startX={drip.startX}
              color={meltColor}
              size={drip.size}
            />
          ))}
        </>
      )}

      {/* Glow puddle beneath */}
      {isMelting && letterMeltProgress > 0.4 && letter !== ' ' && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -20 - letterMeltProgress * 30,
            width: fontSize * 0.8,
            height: fontSize * 0.3,
            background: `radial-gradient(ellipse, ${meltColor}66 0%, transparent 70%)`,
            filter: 'blur(4px)',
          }}
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: letterMeltProgress * 0.6, scaleX: 1 + letterMeltProgress * 0.5 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.span>
  )
}

interface MeltingTextProps {
  text: string
  isVisible: boolean
  isMelting: boolean
  meltProgress?: number // 0 to 1
  fontSize?: number
  color?: string
  meltColor?: string
  className?: string
}

export default function MeltingText({
  text,
  isVisible,
  isMelting,
  meltProgress = 0,
  fontSize = 48,
  color = '#FF6B00',
  meltColor = '#FF6B00',
  className = '',
}: MeltingTextProps) {
  const letters = text.split('')

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`relative inline-flex ${className}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            textShadow: `0 0 30px ${meltColor}66, 0 0 60px ${meltColor}33`,
          }}
        >
          {letters.map((letter, index) => (
            <MeltingLetter
              key={`${index}-${letter}`}
              letter={letter}
              index={index}
              color={color}
              meltColor={meltColor}
              fontSize={fontSize}
              isMelting={isMelting}
              meltProgress={meltProgress}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
