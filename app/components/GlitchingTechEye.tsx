'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GlitchingTechEyeProps {
  size?: number
  glitchIntensity?: number
}

export default function GlitchingTechEye({
  size = 120,
  glitchIntensity = 0.5
}: GlitchingTechEyeProps) {
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })
  const [isGlitching, setIsGlitching] = useState(false)
  const [scanlineY, setScanlineY] = useState(0)

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < glitchIntensity * 0.3) {
        setIsGlitching(true)
        setGlitchOffset({
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 4,
        })
        setTimeout(() => {
          setIsGlitching(false)
          setGlitchOffset({ x: 0, y: 0 })
        }, 50 + Math.random() * 100)
      }
    }, 150)

    return () => clearInterval(glitchInterval)
  }, [glitchIntensity])

  // Scanline animation
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanlineY(prev => (prev + 2) % 100)
    }, 50)
    return () => clearInterval(scanInterval)
  }, [])

  const scale = size / 120

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size * 0.6,
        filter: isGlitching ? 'brightness(1.2)' : 'none',
      }}
    >
      {/* Glitch layers */}
      {isGlitching && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${glitchOffset.x * 2}px, ${glitchOffset.y}px)`,
              opacity: 0.7,
              mixBlendMode: 'screen',
            }}
          >
            <EyeSVG scale={scale} color="cyan" />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${-glitchOffset.x * 2}px, ${-glitchOffset.y}px)`,
              opacity: 0.7,
              mixBlendMode: 'screen',
            }}
          >
            <EyeSVG scale={scale} color="red" />
          </div>
        </>
      )}

      {/* Main eye */}
      <motion.div
        animate={{
          x: glitchOffset.x,
          y: glitchOffset.y,
        }}
        transition={{ duration: 0.05 }}
        className="relative"
      >
        <EyeSVG scale={scale} />
      </motion.div>

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: 0.1 }}
      >
        <div
          className="absolute w-full h-[2px]"
          style={{
            top: `${scanlineY}%`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          }}
        />
      </div>

      {/* CRT flicker */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0, 0.02, 0, 0.01, 0],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatDelay: Math.random() * 2,
        }}
        style={{ background: 'white' }}
      />
    </div>
  )
}

function EyeSVG({ scale = 1, color }: { scale?: number; color?: string }) {
  const irisColor = color || '#D4853B'
  const pupilColor = color ? color : '#1a1a1a'
  const outlineColor = color || '#FFFFFF'

  return (
    <svg
      width={120 * scale}
      height={72 * scale}
      viewBox="0 0 120 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer eye shape - almond */}
      <path
        d="M60 8C30 8 8 36 8 36C8 36 30 64 60 64C90 64 112 36 112 36C112 36 90 8 60 8Z"
        fill="#1a1a1a"
        stroke={outlineColor}
        strokeWidth="2"
      />

      {/* Inner eye outline */}
      <path
        d="M60 14C35 14 16 36 16 36C16 36 35 58 60 58C85 58 104 36 104 36C104 36 85 14 60 14Z"
        fill="none"
        stroke={outlineColor}
        strokeWidth="1"
        strokeOpacity="0.3"
      />

      {/* Iris - outer glow */}
      <defs>
        <radialGradient id={`irisGlow-${color || 'main'}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={irisColor} stopOpacity="0.8" />
          <stop offset="70%" stopColor={irisColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={irisColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Iris glow */}
      <circle
        cx="60"
        cy="36"
        r="22"
        fill={`url(#irisGlow-${color || 'main'})`}
      />

      {/* Iris - main */}
      <circle
        cx="60"
        cy="36"
        r="16"
        fill={irisColor}
      />

      {/* Iris texture rings */}
      <circle
        cx="60"
        cy="36"
        r="14"
        fill="none"
        stroke="#B67030"
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />
      <circle
        cx="60"
        cy="36"
        r="11"
        fill="none"
        stroke="#8B5A2B"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />

      {/* Pupil */}
      <circle
        cx="60"
        cy="36"
        r="7"
        fill={pupilColor}
      />

      {/* Pupil highlight */}
      <circle
        cx="57"
        cy="33"
        r="2"
        fill="white"
        fillOpacity="0.4"
      />

      {/* Tech circuit lines */}
      <g stroke={outlineColor} strokeWidth="0.5" strokeOpacity="0.4">
        {/* Horizontal circuit */}
        <line x1="20" y1="36" x2="38" y2="36" />
        <line x1="82" y1="36" x2="100" y2="36" />

        {/* Corner accents */}
        <polyline points="24,28 28,28 28,32" fill="none" />
        <polyline points="96,28 92,28 92,32" fill="none" />
        <polyline points="24,44 28,44 28,40" fill="none" />
        <polyline points="96,44 92,44 92,40" fill="none" />
      </g>

      {/* Outer frame corners - tech style */}
      <g stroke={outlineColor} strokeWidth="1.5" strokeOpacity="0.6">
        <path d="M12 24 L12 18 L24 18" fill="none" />
        <path d="M108 24 L108 18 L96 18" fill="none" />
        <path d="M12 48 L12 54 L24 54" fill="none" />
        <path d="M108 48 L108 54 L96 54" fill="none" />
      </g>
    </svg>
  )
}
