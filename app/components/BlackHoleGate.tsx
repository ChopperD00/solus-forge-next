'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'

const colors = {
  bg: '#000000',
  accent: '#FF6B00',
  accentDim: 'rgba(255, 107, 0, 0.3)',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#444444',
}

// Particle class for the swirling effect
interface Particle {
  x: number
  y: number
  angle: number
  radius: number
  speed: number
  size: number
  opacity: number
  brightness: number // 0-1 for grayscale, converts to orange at edges
}

interface BlackHoleGateProps {
  onUnlock: () => void
  password: string
}

export default function BlackHoleGate({ onUnlock, password }: BlackHoleGateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [warpPhase, setWarpPhase] = useState<'idle' | 'collapse' | 'warp' | 'colorize'>('idle')
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const pullStrengthRef = useRef(0)
  const colorTransitionRef = useRef(0) // 0 = grayscale, 1 = full color

  // Initialize particles - monochromatic, color at edges only
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.max(width, height) * 0.9

    for (let i = 0; i < 500; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * maxRadius + 80
      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        angle,
        radius,
        speed: 0.001 + Math.random() * 0.004,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        brightness: Math.random() * 0.5 + 0.3, // Grayscale brightness
      })
    }
    particlesRef.current = particles
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      if (!canvas || !ctx) return

      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)

      // Clear with deeper fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, width, height)

      // Add noise/grain texture - monochromatic
      const noiseIntensity = 12
      for (let i = 0; i < 600; i++) {
        const nx = Math.random() * width
        const ny = Math.random() * height
        const distFromCenter = Math.sqrt(Math.pow(nx - centerX, 2) + Math.pow(ny - centerY, 2))
        const normalizedDist = distFromCenter / maxDist

        // Color only at edges based on colorTransition
        const colorAmount = Math.max(0, (normalizedDist - 0.5) * 2) * colorTransitionRef.current
        const grayVal = Math.random() * noiseIntensity * normalizedDist

        if (colorAmount > 0 && Math.random() < colorAmount * 0.3) {
          // Orange tinted at edges
          ctx.fillStyle = `rgba(${grayVal + 30 * colorAmount}, ${grayVal * 0.5}, 0, ${Math.random() * 0.3})`
        } else {
          // Pure grayscale
          ctx.fillStyle = `rgba(${grayVal}, ${grayVal}, ${grayVal}, ${Math.random() * 0.25})`
        }
        ctx.fillRect(nx, ny, 1, 1)
      }

      // Draw black hole core - absolute void
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 180
      )
      coreGradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
      coreGradient.addColorStop(0.2, 'rgba(0, 0, 0, 1)')
      coreGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.98)')
      coreGradient.addColorStop(0.6, 'rgba(10, 10, 10, 0.8)')
      coreGradient.addColorStop(0.8, 'rgba(20, 20, 20, 0.4)')
      coreGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 180, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.fill()

      // Event horizon - absolute black center
      ctx.beginPath()
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 1)'
      ctx.fill()

      // Draw accretion disk glow - only at edges, monochrome center
      const diskGradient = ctx.createRadialGradient(
        centerX, centerY, 90,
        centerX, centerY, 350
      )
      // Inner is grayscale, outer gets orange based on colorTransition
      diskGradient.addColorStop(0, 'rgba(40, 40, 40, 0.15)')
      diskGradient.addColorStop(0.3, 'rgba(60, 60, 60, 0.1)')
      if (colorTransitionRef.current > 0) {
        diskGradient.addColorStop(0.6, `rgba(180, 80, 0, ${0.08 * colorTransitionRef.current})`)
        diskGradient.addColorStop(0.85, `rgba(255, 107, 0, ${0.15 * colorTransitionRef.current})`)
      } else {
        diskGradient.addColorStop(0.6, 'rgba(80, 80, 80, 0.06)')
        diskGradient.addColorStop(0.85, 'rgba(100, 100, 100, 0.1)')
      }
      diskGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 350, 0, Math.PI * 2)
      ctx.fillStyle = diskGradient
      ctx.fill()

      // Update and draw particles
      const pullStrength = pullStrengthRef.current

      particlesRef.current.forEach((particle) => {
        // Rotate around center
        particle.angle += particle.speed * (1 + pullStrength * 3)

        // Pull towards center when unlocking
        if (pullStrength > 0) {
          particle.radius -= pullStrength * 6
          if (particle.radius < 50) {
            particle.opacity *= 0.93
          }
        }

        // Calculate position
        particle.x = centerX + Math.cos(particle.angle) * particle.radius
        particle.y = centerY + Math.sin(particle.angle) * particle.radius * 0.4

        // Calculate distance from center for color blending
        const distFromCenter = Math.sqrt(
          Math.pow(particle.x - centerX, 2) +
          Math.pow(particle.y - centerY, 2)
        )
        const normalizedDist = Math.min(1, distFromCenter / (maxDist * 0.6))

        // Particles closer to edge get orange color, center stays gray
        const edgeColorAmount = Math.max(0, (normalizedDist - 0.4) * 2.5) * colorTransitionRef.current

        const alpha = particle.opacity * (1 - pullStrength * 0.5)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

        if (edgeColorAmount > 0) {
          // Orange at edges
          const orangeBlend = edgeColorAmount
          const r = Math.round(particle.brightness * 255 * (1 - orangeBlend) + 255 * orangeBlend)
          const g = Math.round(particle.brightness * 255 * (1 - orangeBlend) + 107 * orangeBlend)
          const b = Math.round(particle.brightness * 255 * (1 - orangeBlend))
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        } else {
          // Grayscale - being sucked into center
          const gray = Math.round(particle.brightness * 200)
          ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`
        }
        ctx.fill()

        // Draw trail
        const trailLength = 15
        for (let i = 1; i <= trailLength; i++) {
          const trailAngle = particle.angle - particle.speed * i * 3
          const trailX = centerX + Math.cos(trailAngle) * particle.radius
          const trailY = centerY + Math.sin(trailAngle) * particle.radius * 0.4
          const trailAlpha = alpha * (1 - i / trailLength) * 0.25

          ctx.beginPath()
          ctx.arc(trailX, trailY, particle.size * 0.4, 0, Math.PI * 2)

          if (edgeColorAmount > 0) {
            ctx.fillStyle = `rgba(255, 107, 0, ${trailAlpha * edgeColorAmount})`
          } else {
            const gray = Math.round(particle.brightness * 150)
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${trailAlpha})`
          }
          ctx.fill()
        }
      })

      // Inner glow ring - subtle gray with orange tint at edges during color phase
      const ringColor = colorTransitionRef.current > 0.5
        ? `rgba(255, 107, 0, ${0.15 + Math.sin(Date.now() * 0.003) * 0.05})`
        : `rgba(100, 100, 100, ${0.2 + Math.sin(Date.now() * 0.003) * 0.05})`

      ctx.beginPath()
      ctx.arc(centerX, centerY, 90 + Math.sin(Date.now() * 0.002) * 5, 0, Math.PI * 2)
      ctx.strokeStyle = ringColor
      ctx.lineWidth = 1.5
      ctx.stroke()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initParticles])

  // Handle unlock animation - fast warp directly
  useEffect(() => {
    if (isUnlocking) {
      // Skip straight to warp phase
      setWarpPhase('warp')

      let progress = 0
      const unlockAnimation = setInterval(() => {
        progress += 0.06 // Faster progress
        pullStrengthRef.current = progress
        colorTransitionRef.current = Math.min(1, progress / 0.5) // Faster color transition

        if (progress >= 0.5) {
          clearInterval(unlockAnimation)
          setWarpPhase('colorize')

          // Quick handoff
          setTimeout(() => {
            onUnlock()
          }, 400)
        }
      }, 16)

      return () => clearInterval(unlockAnimation)
    }
  }, [isUnlocking, onUnlock])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (inputValue.toLowerCase() === password.toLowerCase()) {
      setIsUnlocking(true)
      setError(false)
    } else {
      setError(true)
      setInputValue('')
      setTimeout(() => setError(false), 1000)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={{ background: colors.bg }}>
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: isUnlocking ? 1 : 0.9 }}
      />

      {/* Content overlay */}
      <AnimatePresence>
        {!isUnlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            {/* Title - positioned at top */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-[15%] left-0 right-0 text-center z-20"
            >
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest"
                style={{
                  color: colors.text,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  textShadow: '0 0 60px rgba(255, 255, 255, 0.2), 0 0 120px rgba(100, 100, 100, 0.3)',
                }}
              >
                SOLUS FORGE
              </h1>
            </motion.div>

            {/* Password input - absolute center with inline enter button */}
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div className="relative">
                <input
                  type="password"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter passphrase"
                  autoFocus
                  className="w-72 md:w-80 pl-6 pr-14 py-4 rounded-full text-center text-base tracking-wider focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${error ? '#EF4444' : 'rgba(150, 150, 150, 0.3)'}`,
                    color: colors.text,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    boxShadow: error
                      ? '0 0 30px rgba(239, 68, 68, 0.3)'
                      : '0 0 30px rgba(100, 100, 100, 0.15)',
                  }}
                />
                {/* Enter button on right edge */}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: 'rgba(150, 150, 150, 0.2)',
                    border: '1px solid rgba(150, 150, 150, 0.3)',
                  }}
                >
                  <ArrowRight size={18} weight="bold" color={colors.text} />
                </button>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-8 left-0 right-0 text-center text-sm"
                    style={{ color: '#EF4444', fontFamily: "system-ui, -apple-system, sans-serif" }}
                  >
                    Access Denied
                  </motion.div>
                )}
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fast warp transition */}
      <AnimatePresence>
        {isUnlocking && (
          <>
            {/* Quick "save" flash */}
            {warpPhase === 'warp' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <motion.p
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl md:text-7xl font-bold tracking-widest lowercase"
                  style={{
                    color: colors.text,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textShadow: '0 0 80px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  save
                </motion.p>
              </motion.div>
            )}

            {/* Fast "yourself" with orange */}
            {warpPhase === 'colorize' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <motion.p
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl md:text-7xl font-bold tracking-widest lowercase"
                  style={{
                    color: colors.accent,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textShadow: `0 0 100px ${colors.accent}, 0 0 150px ${colors.accent}`,
                  }}
                >
                  yourself
                </motion.p>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
