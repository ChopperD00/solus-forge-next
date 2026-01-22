'use client'

import { useRef, useEffect, useState } from 'react'

interface NovaGlowLogoProps {
  size?: number
  onClick?: () => void
  isExpanded?: boolean
}

export default function NovaGlowLogo({
  size = 180,
  onClick,
  isExpanded = false,
}: NovaGlowLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const [isHovered, setIsHovered] = useState(false)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const glowCanvas = glowCanvasRef.current
    if (!canvas || !glowCanvas) return

    const ctx = canvas.getContext('2d')
    const glowCtx = glowCanvas.getContext('2d')
    if (!ctx || !glowCtx) return

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1
    const glowSize = size * 2 // Extra space for glow

    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    glowCanvas.width = glowSize * dpr
    glowCanvas.height = glowSize * dpr
    glowCtx.scale(dpr, dpr)

    // SVG path data for the S logo
    const path1 = new Path2D('M211.99,140.38l-.32,61.16c-6.7-34.45-34.1-59.92-70.38-60.16-.22-39.01-31.04-70.42-70.67-70.68C70.78,30.78,103.07-.06,141.43,0c38.34.06,70.75,31.43,70.44,70.63l-49.88.05h-14.34c35.81,3.99,63.55,32.59,64.34,69.69Z')
    const path2 = new Path2D('M.04,141.43l65.17-.11C29.22,138,.81,108.89,0,72.05L.31,10.47c6.72,34.39,34.09,59.97,70.34,60.16.47,39.39,31.27,70.39,70.73,70.7-.12,39.78-32.5,70.77-70.82,70.67C32.58,211.91.11,181.29.04,141.43Z')

    const animate = () => {
      timeRef.current += 0.016

      const t = timeRef.current
      const hoverMultiplier = isHovered ? 1.4 : 1.0

      // Clear canvases
      ctx.clearRect(0, 0, size, size)
      glowCtx.clearRect(0, 0, glowSize, glowSize)

      // Scale for logo
      const scale = size / 212
      const glowScale = glowSize / 212

      // ===== NOVA GLOW EFFECT (on separate canvas) =====
      glowCtx.save()
      glowCtx.translate(glowSize / 4, glowSize / 4) // Center the glow
      glowCtx.scale(scale, scale)

      // Animated gradient ring around the logo
      const numRings = 5
      for (let ring = numRings; ring >= 1; ring--) {
        const ringProgress = ring / numRings
        const ringOffset = 20 + ring * 15 * hoverMultiplier

        // Animated hue shift
        const hue = 25 + Math.sin(t * 1.5 + ring * 0.5) * 20
        const saturation = 100
        const lightness = 50 + Math.sin(t * 2 + ring) * 10
        const alpha = (0.4 - ringProgress * 0.3) * hoverMultiplier

        glowCtx.save()

        // Create expanded path for glow
        glowCtx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
        glowCtx.shadowBlur = 30 + ring * 20 * hoverMultiplier
        glowCtx.shadowOffsetX = 0
        glowCtx.shadowOffsetY = 0

        // Pulse the glow
        const pulseScale = 1 + Math.sin(t * 3 + ring * 0.8) * 0.02 * hoverMultiplier
        glowCtx.translate(106, 106)
        glowCtx.scale(pulseScale, pulseScale)
        glowCtx.translate(-106, -106)

        glowCtx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.5})`
        glowCtx.fill(path1)
        glowCtx.fill(path2)

        glowCtx.restore()
      }

      // Animated orbital glow particles
      const numParticles = 12
      for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2 + t * 0.5
        const radius = 130 + Math.sin(t * 2 + i) * 20
        const px = 106 + Math.cos(angle) * radius
        const py = 106 + Math.sin(angle) * radius
        const particleSize = 3 + Math.sin(t * 3 + i * 0.5) * 2

        const particleHue = 30 + Math.sin(t + i) * 15

        glowCtx.beginPath()
        glowCtx.arc(px, py, particleSize * hoverMultiplier, 0, Math.PI * 2)
        glowCtx.fillStyle = `hsla(${particleHue}, 100%, 60%, ${0.6 * hoverMultiplier})`
        glowCtx.shadowColor = `hsla(${particleHue}, 100%, 50%, 0.8)`
        glowCtx.shadowBlur = 15 * hoverMultiplier
        glowCtx.fill()
      }

      glowCtx.restore()

      // ===== MAIN LOGO (on main canvas) =====
      ctx.save()
      ctx.scale(scale, scale)

      // Draw main logo with gradient
      const gradient1 = ctx.createLinearGradient(0, 0, 212, 212)
      gradient1.addColorStop(0, '#FF6B00')
      gradient1.addColorStop(0.5, '#FF8C00')
      gradient1.addColorStop(1, '#FFA500')

      const gradient2 = ctx.createLinearGradient(212, 212, 0, 0)
      gradient2.addColorStop(0, '#FF8C00')
      gradient2.addColorStop(0.5, '#FFA500')
      gradient2.addColorStop(1, '#FFB833')

      ctx.fillStyle = gradient1
      ctx.fill(path1)
      ctx.fillStyle = gradient2
      ctx.fill(path2)

      // Add subtle inner glow
      if (isHovered) {
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = 0.2 + Math.sin(t * 4) * 0.1
        ctx.fillStyle = '#FFFFFF'
        ctx.fill(path1)
        ctx.fill(path2)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }

      ctx.restore()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [size, isHovered])

  const glowSize = size * 2

  return (
    <div
      className="relative cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: size, height: size }}
    >
      {/* Nova Glow canvas (behind) */}
      <canvas
        ref={glowCanvasRef}
        className="absolute pointer-events-none transition-opacity duration-500"
        style={{
          width: glowSize,
          height: glowSize,
          left: -size / 2,
          top: -size / 2,
          opacity: isHovered ? 1 : 0.7,
        }}
      />

      {/* Radiant outer glow */}
      <div
        className="absolute pointer-events-none transition-all duration-500"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          left: -size * 0.4,
          top: -size * 0.4,
          background: isHovered
            ? 'radial-gradient(circle, rgba(255,107,0,0.35) 0%, rgba(255,140,0,0.2) 30%, rgba(255,165,0,0.1) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,107,0,0.2) 0%, rgba(255,140,0,0.1) 30%, transparent 60%)',
          filter: isHovered ? 'blur(40px)' : 'blur(25px)',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      {/* Main logo canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10 transition-transform duration-300"
        style={{
          width: size,
          height: size,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      />
    </div>
  )
}
