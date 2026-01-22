'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const colors = {
  bg: '#000000',
  accent: '#FF6B00',
  accentDim: 'rgba(255, 107, 0, 0.3)',
  text: '#FFFFFF',
  textMuted: '#666666',
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
  hue: number
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
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const pullStrengthRef = useRef(0)

  // Initialize particles - more particles for denser effect
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.max(width, height) * 0.9

    // More particles for denser, grainier effect
    for (let i = 0; i < 500; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * maxRadius + 80
      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        angle,
        radius,
        speed: 0.001 + Math.random() * 0.004,
        size: Math.random() * 1.5 + 0.3, // Smaller particles for granularity
        opacity: Math.random() * 0.6 + 0.1,
        hue: Math.random() * 35 + 15, // Orange to amber range
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

      // Clear with deeper fade for richer blacks
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, width, height)

      // Add noise/grain texture overlay
      const noiseIntensity = 15
      for (let i = 0; i < 800; i++) {
        const nx = Math.random() * width
        const ny = Math.random() * height
        const distFromCenter = Math.sqrt(Math.pow(nx - centerX, 2) + Math.pow(ny - centerY, 2))
        const noiseBrightness = Math.random() * noiseIntensity * (distFromCenter / 400)
        ctx.fillStyle = `rgba(${noiseBrightness}, ${noiseBrightness * 0.8}, ${noiseBrightness * 0.5}, ${Math.random() * 0.3})`
        ctx.fillRect(nx, ny, 1, 1)
      }

      // Draw black hole core - DEEPER black with more layers
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 180
      )
      coreGradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
      coreGradient.addColorStop(0.15, 'rgba(0, 0, 0, 1)')
      coreGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.98)')
      coreGradient.addColorStop(0.5, 'rgba(5, 2, 0, 0.9)')
      coreGradient.addColorStop(0.7, 'rgba(15, 5, 0, 0.6)')
      coreGradient.addColorStop(0.85, 'rgba(40, 15, 0, 0.2)')
      coreGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 180, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.fill()

      // Event horizon ring - absolute black inner circle
      const eventHorizon = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 60
      )
      eventHorizon.addColorStop(0, 'rgba(0, 0, 0, 1)')
      eventHorizon.addColorStop(0.8, 'rgba(0, 0, 0, 1)')
      eventHorizon.addColorStop(1, 'rgba(0, 0, 0, 0.95)')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2)
      ctx.fillStyle = eventHorizon
      ctx.fill()

      // Draw accretion disk glow - more subtle
      const diskGradient = ctx.createRadialGradient(
        centerX, centerY, 90,
        centerX, centerY, 250
      )
      diskGradient.addColorStop(0, 'rgba(255, 107, 0, 0.25)')
      diskGradient.addColorStop(0.3, 'rgba(255, 120, 0, 0.15)')
      diskGradient.addColorStop(0.6, 'rgba(255, 140, 0, 0.08)')
      diskGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 250, 0, Math.PI * 2)
      ctx.fillStyle = diskGradient
      ctx.fill()

      // Update and draw particles
      const pullStrength = pullStrengthRef.current

      particlesRef.current.forEach((particle) => {
        // Rotate around center
        particle.angle += particle.speed * (1 + pullStrength * 2)

        // Pull towards center when unlocking
        if (pullStrength > 0) {
          particle.radius -= pullStrength * 5
          if (particle.radius < 50) {
            particle.opacity *= 0.95
          }
        }

        // Calculate position
        particle.x = centerX + Math.cos(particle.angle) * particle.radius
        particle.y = centerY + Math.sin(particle.angle) * particle.radius * 0.4 // Elliptical orbit

        // Draw particle
        const alpha = particle.opacity * (1 - pullStrength * 0.5)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 60%, ${alpha})`
        ctx.fill()

        // Draw trail
        const trailLength = 20
        for (let i = 1; i <= trailLength; i++) {
          const trailAngle = particle.angle - particle.speed * i * 3
          const trailX = centerX + Math.cos(trailAngle) * particle.radius
          const trailY = centerY + Math.sin(trailAngle) * particle.radius * 0.4
          const trailAlpha = alpha * (1 - i / trailLength) * 0.3

          ctx.beginPath()
          ctx.arc(trailX, trailY, particle.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${particle.hue}, 100%, 60%, ${trailAlpha})`
          ctx.fill()
        }
      })

      // Inner glow ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, 90 + Math.sin(Date.now() * 0.002) * 5, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 107, 0, ${0.3 + Math.sin(Date.now() * 0.003) * 0.1})`
      ctx.lineWidth = 2
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

  // Handle unlock animation - faster collapse, quicker handoff to hyperspeed
  useEffect(() => {
    if (isUnlocking) {
      let progress = 0
      const unlockAnimation = setInterval(() => {
        progress += 0.04 // Faster collapse
        pullStrengthRef.current = progress

        if (progress >= 0.6) { // Trigger hyperspeed earlier for seamless transition
          clearInterval(unlockAnimation)
          onUnlock()
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
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
          >
            {/* Title */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest mb-4"
                style={{
                  color: colors.text,
                  textShadow: `0 0 40px ${colors.accentDim}`,
                }}
              >
                SOLUS FORGE
              </h1>
              <p
                className="text-sm md:text-base tracking-wider uppercase"
                style={{ color: colors.textMuted }}
              >
                Authorized Access Only
              </p>
            </motion.div>

            {/* Password input */}
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <input
                  type="password"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter passphrase"
                  autoFocus
                  className="w-72 md:w-80 px-6 py-4 rounded-full text-center text-base tracking-wider focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${error ? '#EF4444' : 'rgba(255, 107, 0, 0.3)'}`,
                    color: colors.text,
                    boxShadow: error
                      ? '0 0 30px rgba(239, 68, 68, 0.3)'
                      : `0 0 30px ${colors.accentDim}`,
                  }}
                />
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-8 left-0 right-0 text-center text-sm"
                    style={{ color: '#EF4444' }}
                  >
                    Access Denied
                  </motion.div>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full font-medium tracking-wider transition-all"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, #F59E0B 100%)`,
                  color: colors.text,
                  boxShadow: `0 0 40px ${colors.accentDim}`,
                }}
              >
                ENTER THE VOID
              </motion.button>
            </motion.form>

            {/* Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-16 text-xs tracking-wider italic"
              style={{ color: colors.textMuted }}
            >
              "Libera te tutemet ex inferis"
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlocking state overlay */}
      <AnimatePresence>
        {isUnlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeIn' }}
              className="text-center"
            >
              <p
                className="text-2xl md:text-3xl font-light tracking-widest"
                style={{
                  color: colors.accent,
                  textShadow: `0 0 30px ${colors.accent}`,
                }}
              >
                ACCESS GRANTED
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
