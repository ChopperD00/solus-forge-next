'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Star {
  x: number
  y: number
  z: number
  prevZ: number
  size: number
  hue: number
}

interface HyperspeedTransitionProps {
  isActive: boolean
  onComplete: () => void
  phase?: 'sucking' | 'hyperspeed' | 'arrival'
}

export default function HyperspeedTransition({
  isActive,
  onComplete,
}: HyperspeedTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const [phase, setPhase] = useState<'idle' | 'sucking' | 'hyperspeed' | 'flash' | 'arrival'>('idle')
  const speedRef = useRef(0)
  const animationRef = useRef<number>()

  // Initialize stars
  const initStars = (width: number, height: number, count: number = 800) => {
    const stars: Star[] = []
    for (let i = 0; i < count; i++) {
      const z = Math.random() * 2000
      stars.push({
        x: (Math.random() - 0.5) * width * 3,
        y: (Math.random() - 0.5) * height * 3,
        z,
        prevZ: z,
        size: Math.random() * 2 + 0.5,
        hue: Math.random() * 60 + 20, // Orange to yellow
      })
    }
    starsRef.current = stars
  }

  useEffect(() => {
    if (!isActive) {
      setPhase('idle')
      return
    }

    // Start the sequence
    setPhase('sucking')
    speedRef.current = 2

    // Phase timing
    const suckingTimer = setTimeout(() => {
      setPhase('hyperspeed')
      speedRef.current = 50
    }, 1500)

    const flashTimer = setTimeout(() => {
      setPhase('flash')
    }, 3500)

    const arrivalTimer = setTimeout(() => {
      setPhase('arrival')
    }, 3800)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      clearTimeout(suckingTimer)
      clearTimeout(flashTimer)
      clearTimeout(arrivalTimer)
      clearTimeout(completeTimer)
    }
  }, [isActive, onComplete])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      if (!canvas || !ctx) return

      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      // Dynamic speed based on phase
      let targetSpeed = 0
      if (phase === 'sucking') {
        targetSpeed = 5
      } else if (phase === 'hyperspeed') {
        targetSpeed = 80
      } else if (phase === 'flash' || phase === 'arrival') {
        targetSpeed = 150
      }

      speedRef.current += (targetSpeed - speedRef.current) * 0.05

      // Clear canvas with motion blur effect
      const fadeAlpha = phase === 'hyperspeed' ? 0.15 : phase === 'flash' ? 0.3 : 0.2
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`
      ctx.fillRect(0, 0, width, height)

      // Draw event horizon glow during sucking phase
      if (phase === 'sucking') {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, 300
        )
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
        gradient.addColorStop(0.3, 'rgba(255, 107, 0, 0.2)')
        gradient.addColorStop(0.6, 'rgba(255, 60, 0, 0.1)')
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(centerX, centerY, 300, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Update and draw stars
      starsRef.current.forEach((star) => {
        star.prevZ = star.z
        star.z -= speedRef.current

        // Reset star if it passes the camera
        if (star.z <= 0) {
          star.z = 2000
          star.prevZ = 2000
          star.x = (Math.random() - 0.5) * width * 3
          star.y = (Math.random() - 0.5) * height * 3
        }

        // Project 3D to 2D
        const sx = (star.x / star.z) * 500 + centerX
        const sy = (star.y / star.z) * 500 + centerY
        const px = (star.x / star.prevZ) * 500 + centerX
        const py = (star.y / star.prevZ) * 500 + centerY

        // Calculate size based on distance
        const size = (1 - star.z / 2000) * star.size * 3

        // Calculate opacity based on position
        const opacity = Math.min(1, (1 - star.z / 2000) * 1.5)

        // Color shifts to white at high speed
        const speedFactor = Math.min(1, speedRef.current / 80)
        const saturation = 100 - speedFactor * 50
        const lightness = 60 + speedFactor * 30

        // Draw star trail (elongated at high speed)
        if (speedRef.current > 10) {
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(sx, sy)
          ctx.strokeStyle = `hsla(${star.hue}, ${saturation}%, ${lightness}%, ${opacity * 0.8})`
          ctx.lineWidth = size * 0.8
          ctx.lineCap = 'round'
          ctx.stroke()
        }

        // Draw star point
        ctx.beginPath()
        ctx.arc(sx, sy, size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${star.hue}, ${saturation}%, ${lightness}%, ${opacity})`
        ctx.fill()
      })

      // Central tunnel effect during hyperspeed
      if (phase === 'hyperspeed' || phase === 'flash') {
        const tunnelGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, Math.max(width, height) * 0.6
        )
        tunnelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
        tunnelGradient.addColorStop(0.2, 'rgba(255, 200, 100, 0.05)')
        tunnelGradient.addColorStop(0.5, 'rgba(255, 107, 0, 0.02)')
        tunnelGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(centerX, centerY, Math.max(width, height) * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = tunnelGradient
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isActive) {
      animate()
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, phase])

  if (!isActive && phase === 'idle') return null

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Canvas starfield */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: '#000' }}
      />

      {/* White flash at apex */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white"
          />
        )}
      </AnimatePresence>


      {/* Arrival text */}
      <AnimatePresence>
        {/* Arrival phase - no text, just flash to black then fade out */}
        {phase === 'arrival' && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{ background: '#0A0A0A' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
