'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface SolarFlare {
  id: number
  angle: number // Position on the circle (radians)
  startTime: number
  duration: number // How long the flare lasts
  intensity: number // 0-1 strength
  size: number // Scale factor
  direction: number // -1 to 1, bias toward bottom (positive y)
}

interface GradientCircleProps {
  children?: React.ReactNode
  scrollProgress?: number
}

export default function GradientCircle({ children, scrollProgress = 0 }: GradientCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const flaresRef = useRef<SolarFlare[]>([])
  const lastFlareTimeRef = useRef(0)

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

    // Generate a new solar flare
    const createFlare = (time: number): SolarFlare => {
      // Bias toward bottom half of circle (between PI/4 and 3PI/4 from bottom)
      // Bottom is at PI/2, so we want angles around there
      const bottomBias = Math.PI / 2 // Bottom of circle
      const spread = Math.PI * 0.6 // How wide the spawn area is
      const angle = bottomBias + (Math.random() - 0.5) * spread

      return {
        id: Math.random(),
        angle,
        startTime: time,
        duration: 2 + Math.random() * 2, // 2-4 seconds
        intensity: 0.6 + Math.random() * 0.4,
        size: 0.8 + Math.random() * 0.6,
        direction: 0.3 + Math.random() * 0.7, // Mostly downward
      }
    }

    // Draw a solar flare
    const drawFlare = (flare: SolarFlare, currentTime: number) => {
      const elapsed = currentTime - flare.startTime
      const progress = elapsed / flare.duration

      if (progress > 1) return // Flare has ended

      // Easing: quick rise, slow fall
      const riseTime = 0.2
      let alpha: number
      if (progress < riseTime) {
        alpha = (progress / riseTime) * flare.intensity
      } else {
        alpha = flare.intensity * (1 - (progress - riseTime) / (1 - riseTime))
      }

      // Flare extends outward and downward
      const baseX = centerX + Math.cos(flare.angle) * radius
      const baseY = centerY + Math.sin(flare.angle) * radius

      // Flare grows outward over time
      const flareLength = 40 + progress * 80 * flare.size
      const flareWidth = 15 + Math.sin(progress * Math.PI) * 25 * flare.size

      // Direction: outward from center with downward bias
      const outwardX = Math.cos(flare.angle)
      const outwardY = Math.sin(flare.angle)

      // Add downward drift
      const driftY = progress * 30 * flare.direction

      // Create gradient for the flare
      const endX = baseX + outwardX * flareLength
      const endY = baseY + outwardY * flareLength + driftY

      const flareGradient = ctx.createLinearGradient(baseX, baseY, endX, endY)
      flareGradient.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.8})`)
      flareGradient.addColorStop(0.3, `rgba(255, 140, 50, ${alpha * 0.6})`)
      flareGradient.addColorStop(0.7, `rgba(255, 80, 20, ${alpha * 0.3})`)
      flareGradient.addColorStop(1, 'transparent')

      // Draw the main flare body
      ctx.save()
      ctx.translate(baseX, baseY)
      ctx.rotate(flare.angle + Math.PI / 2)

      // Organic flare shape using bezier curves
      ctx.beginPath()
      ctx.moveTo(0, 0)

      // Left side of flare
      ctx.bezierCurveTo(
        -flareWidth * 0.3, flareLength * 0.3,
        -flareWidth * 0.5, flareLength * 0.6,
        -flareWidth * 0.2 + Math.sin(currentTime * 3 + flare.id) * 5, flareLength
      )

      // Tip
      ctx.bezierCurveTo(
        0, flareLength * 1.1,
        0, flareLength * 1.1,
        flareWidth * 0.2 + Math.sin(currentTime * 3 + flare.id + 1) * 5, flareLength
      )

      // Right side of flare
      ctx.bezierCurveTo(
        flareWidth * 0.5, flareLength * 0.6,
        flareWidth * 0.3, flareLength * 0.3,
        0, 0
      )

      ctx.fillStyle = flareGradient
      ctx.fill()

      // Add glow around the flare
      const glowGradient = ctx.createRadialGradient(0, flareLength * 0.5, 0, 0, flareLength * 0.5, flareLength)
      glowGradient.addColorStop(0, `rgba(255, 150, 50, ${alpha * 0.3})`)
      glowGradient.addColorStop(1, 'transparent')

      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(0, flareLength * 0.5, flareLength * 0.8, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      // Draw ripple particles falling downward
      const numParticles = 5
      for (let i = 0; i < numParticles; i++) {
        const particleProgress = (progress + i * 0.1) % 1
        if (particleProgress < 0.2) continue // Delay particle start

        const px = baseX + outwardX * flareLength * particleProgress * 0.8 + (Math.random() - 0.5) * 20
        const py = baseY + outwardY * flareLength * particleProgress + driftY * particleProgress * 1.5 + i * 15
        const particleAlpha = alpha * (1 - particleProgress) * 0.5
        const particleSize = 2 + (1 - particleProgress) * 3

        ctx.fillStyle = `rgba(255, ${150 + i * 20}, 50, ${particleAlpha})`
        ctx.beginPath()
        ctx.arc(px, py, particleSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }

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

      // === SOLAR FLARES ===
      // Spawn new flares randomly (every 1.5-4 seconds)
      if (t - lastFlareTimeRef.current > 1.5 + Math.random() * 2.5) {
        flaresRef.current.push(createFlare(t))
        lastFlareTimeRef.current = t

        // Keep max 4 flares active
        if (flaresRef.current.length > 4) {
          flaresRef.current.shift()
        }
      }

      // Draw active flares
      flaresRef.current = flaresRef.current.filter(flare => {
        const elapsed = t - flare.startTime
        if (elapsed > flare.duration) return false
        drawFlare(flare, t)
        return true
      })

      // Animated particles around the circle
      const numParticles = 30
      for (let i = 0; i < numParticles; i++) {
        const particleAngle = (i / numParticles) * Math.PI * 2 + t * 0.3
        const particleRadius = radius + 20 + Math.sin(t * 2 + i) * 15
        const px = centerX + Math.cos(particleAngle) * particleRadius
        const py = centerY + Math.sin(particleAngle) * particleRadius
        const particleSize = 2 + Math.sin(t + i * 0.5) * 1

        ctx.fillStyle = `rgba(255, ${120 + i * 3}, 50, ${0.3 + Math.sin(t + i) * 0.2})`
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
      {/* Content inside the circle */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </motion.div>
  )
}
