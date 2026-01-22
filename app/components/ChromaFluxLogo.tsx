'use client'

import { useRef, useEffect, useState } from 'react'

interface ChromaFluxLogoProps {
  size?: number
  onClick?: () => void
  isExpanded?: boolean
}

export default function ChromaFluxLogo({
  size = 180,
  onClick,
  isExpanded = false,
}: ChromaFluxLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const [isHovered, setIsHovered] = useState(false)
  const timeRef = useRef(0)

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        mouseRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        }
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // SVG path data for the S logo
    const path1 = new Path2D('M211.99,140.38l-.32,61.16c-6.7-34.45-34.1-59.92-70.38-60.16-.22-39.01-31.04-70.42-70.67-70.68C70.78,30.78,103.07-.06,141.43,0c38.34.06,70.75,31.43,70.44,70.63l-49.88.05h-14.34c35.81,3.99,63.55,32.59,64.34,69.69Z')
    const path2 = new Path2D('M.04,141.43l65.17-.11C29.22,138,.81,108.89,0,72.05L.31,10.47c6.72,34.39,34.09,59.97,70.34,60.16.47,39.39,31.27,70.39,70.73,70.7-.12,39.78-32.5,70.77-70.82,70.67C32.58,211.91.11,181.29.04,141.43Z')

    const animate = () => {
      timeRef.current += 0.016 // ~60fps

      const t = timeRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const hoverIntensity = isHovered ? 1.5 : 1.0

      // Clear canvas
      ctx.clearRect(0, 0, size, size)

      // Scale to fit
      const scale = size / 212
      ctx.save()
      ctx.scale(scale, scale)

      // Create chromatic flame effect with multiple layers
      const layers = [
        { offset: 0, color: `hsl(${25 + Math.sin(t * 2 + mx * 3) * 15}, 100%, ${55 + Math.sin(t * 3) * 10}%)`, blur: 0 },
        { offset: isHovered ? 3 : 1, color: `hsl(${35 + Math.sin(t * 2.5 + my * 4) * 20}, 100%, ${60 + Math.sin(t * 2.5) * 15}%)`, blur: isHovered ? 8 : 4 },
        { offset: isHovered ? 6 : 2, color: `hsl(${15 + Math.sin(t * 3 + mx * 2) * 10}, 100%, ${50 + Math.sin(t * 4) * 10}%)`, blur: isHovered ? 15 : 8 },
        { offset: isHovered ? 10 : 3, color: `hsl(${45 + Math.sin(t * 1.5) * 25}, 95%, ${65 + Math.sin(t * 2) * 10}%)`, blur: isHovered ? 25 : 12 },
      ]

      // Draw glow layers (back to front)
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i]

        ctx.save()

        // Chromatic shift based on mouse and time
        const shiftX = Math.sin(t * 2 + i) * layer.offset * hoverIntensity + (mx - 0.5) * layer.offset * 3
        const shiftY = Math.cos(t * 2.5 + i) * layer.offset * hoverIntensity + (my - 0.5) * layer.offset * 3

        ctx.translate(shiftX, shiftY)

        if (layer.blur > 0) {
          ctx.filter = `blur(${layer.blur}px)`
        }

        ctx.globalAlpha = i === 0 ? 1 : 0.6 - i * 0.1
        ctx.fillStyle = layer.color
        ctx.fill(path1)
        ctx.fill(path2)

        ctx.restore()
      }

      // Draw main logo on top with gradient
      const gradient1 = ctx.createLinearGradient(0, 0, 212, 212)
      gradient1.addColorStop(0, '#FF6B00')
      gradient1.addColorStop(0.5, '#FF8C00')
      gradient1.addColorStop(1, '#FFA500')

      const gradient2 = ctx.createLinearGradient(212, 212, 0, 0)
      gradient2.addColorStop(0, '#FF8C00')
      gradient2.addColorStop(0.5, '#FFA500')
      gradient2.addColorStop(1, '#FFB833')

      ctx.globalAlpha = 1
      ctx.filter = 'none'
      ctx.fillStyle = gradient1
      ctx.fill(path1)
      ctx.fillStyle = gradient2
      ctx.fill(path2)

      // Add inner glow when hovered
      if (isHovered) {
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = 0.3 + Math.sin(t * 5) * 0.1
        ctx.fillStyle = '#FFFFFF'
        ctx.fill(path1)
        ctx.fill(path2)
        ctx.globalCompositeOperation = 'source-over'
      }

      ctx.restore()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [size, isHovered])

  // Expand animation effect
  useEffect(() => {
    if (isExpanded) {
      // Could add expansion effects here
    }
  }, [isExpanded])

  return (
    <div
      className="relative cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: size, height: size }}
    >
      {/* Outer glow effect */}
      <div
        className="absolute inset-0 transition-all duration-500 pointer-events-none"
        style={{
          background: isHovered
            ? 'radial-gradient(circle, rgba(255,107,0,0.4) 0%, rgba(255,140,0,0.2) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,107,0,0.2) 0%, transparent 60%)',
          filter: isHovered ? 'blur(30px)' : 'blur(20px)',
          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
        }}
      />

      {/* Main canvas */}
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
