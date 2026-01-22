'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GradientCircleProps {
  children?: React.ReactNode
  scrollProgress?: number
}

export default function GradientCircle({ children, scrollProgress = 0 }: GradientCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const size = 800
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.42

    const animate = () => {
      timeRef.current += 0.008

      const t = timeRef.current

      // Clear canvas
      ctx.clearRect(0, 0, size, size)

      // Create multiple rotating gradient layers for depth
      const layers = 4

      for (let layer = 0; layer < layers; layer++) {
        const layerOffset = (layer / layers) * Math.PI * 2
        const layerOpacity = 0.3 - layer * 0.05
        const layerRadius = radius - layer * 15

        // Create rotating conic gradient effect using radial gradients
        const numGradients = 6
        for (let i = 0; i < numGradients; i++) {
          const angle = (i / numGradients) * Math.PI * 2 + t * (0.5 + layer * 0.2) + layerOffset
          const gradientX = centerX + Math.cos(angle) * layerRadius * 0.3
          const gradientY = centerY + Math.sin(angle) * layerRadius * 0.3

          // Color palette: warm oranges, ambers, and subtle purples
          const hue = 25 + Math.sin(t + i * 0.5) * 15 // 10-40 range (orange/amber)
          const saturation = 85 + Math.sin(t * 0.7 + i) * 15
          const lightness = 55 + Math.sin(t * 0.5 + i * 0.3) * 10

          const gradient = ctx.createRadialGradient(
            gradientX, gradientY, 0,
            gradientX, gradientY, layerRadius * 0.8
          )

          gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${layerOpacity})`)
          gradient.addColorStop(0.5, `hsla(${hue + 10}, ${saturation - 10}%, ${lightness - 10}%, ${layerOpacity * 0.5})`)
          gradient.addColorStop(1, 'transparent')

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Add glow effect
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.6,
        centerX, centerY, radius * 1.2
      )
      glowGradient.addColorStop(0, 'rgba(255, 107, 0, 0.15)')
      glowGradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.08)')
      glowGradient.addColorStop(1, 'transparent')

      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2)
      ctx.fill()

      // Inner dark core for depth
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * 0.7
      )
      coreGradient.addColorStop(0, 'rgba(10, 10, 10, 0.9)')
      coreGradient.addColorStop(0.6, 'rgba(10, 10, 10, 0.6)')
      coreGradient.addColorStop(1, 'transparent')

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.75, 0, Math.PI * 2)
      ctx.fill()

      // Subtle rim highlight
      ctx.strokeStyle = 'rgba(255, 150, 50, 0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Subtle ambient particles (no flares)
      const numParticles = 20
      for (let i = 0; i < numParticles; i++) {
        const particleAngle = (i / numParticles) * Math.PI * 2 + t * 0.2
        const particleRadius = radius + 10 + Math.sin(t * 1.5 + i) * 8
        const px = centerX + Math.cos(particleAngle) * particleRadius
        const py = centerY + Math.sin(particleAngle) * particleRadius
        const particleSize = 1.5 + Math.sin(t + i * 0.5) * 0.5

        ctx.fillStyle = `rgba(255, ${140 + i * 3}, 60, ${0.2 + Math.sin(t + i) * 0.1})`
        ctx.beginPath()
        ctx.arc(px, py, particleSize, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Scale based on scroll progress
  const scale = 1 + scrollProgress * 2

  return (
    <motion.div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{
        width: 800,
        height: 800,
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: 800, height: 800 }}
      />
      {/* Content inside the circle - perfectly centered */}
      <div
        className="absolute z-10 flex flex-col items-center justify-center"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}
