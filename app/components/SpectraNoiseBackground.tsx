'use client'

import { useRef, useEffect, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  baseX: number
  baseY: number
  targetX: number
  targetY: number
  size: number
  hue: number
  speed: number
  angle: number
  orbitRadius: number
  orbitSpeed: number
}

interface SpectraNoiseBackgroundProps {
  isExpanded?: boolean
  logoCenter?: { x: number; y: number }
  logoSize?: number
}

export default function SpectraNoiseBackground({
  isExpanded = false,
  logoCenter,
  logoSize = 200,
}: SpectraNoiseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const timeRef = useRef(0)
  const transitionRef = useRef(0) // 0 = scattered, 1 = nova circle

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const numParticles = 150

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        targetX: x,
        targetY: y,
        size: Math.random() * 3 + 1,
        hue: 20 + Math.random() * 30, // Orange range
        speed: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: 0,
        orbitSpeed: (Math.random() - 0.5) * 0.02,
      })
    }

    particlesRef.current = particles
  }, [])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Main animation effect
  useEffect(() => {
    const canvas = canvasRef.current
    const noiseCanvas = noiseCanvasRef.current
    if (!canvas || !noiseCanvas) return

    const ctx = canvas.getContext('2d')
    const noiseCtx = noiseCanvas.getContext('2d')
    if (!ctx || !noiseCtx) return

    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`

      noiseCanvas.width = 512
      noiseCanvas.height = 512

      if (particlesRef.current.length === 0) {
        initParticles(window.innerWidth, window.innerHeight)
      }
    }

    resize()
    window.addEventListener('resize', resize)

    // Generate scanlines + noise texture
    let noiseFrame = 0
    const generateNoise = () => {
      const imageData = noiseCtx.createImageData(512, 512)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const y = Math.floor((i / 4) / 512)

        // Scanline effect
        const scanline = y % 4 === 0 ? 0.7 : 1

        // Noise with hue shift
        const noise = Math.random() * 255
        const warmth = Math.random() * 30

        data[i] = Math.min(255, (noise + warmth) * scanline)     // R
        data[i + 1] = noise * scanline                            // G
        data[i + 2] = Math.max(0, noise - warmth) * scanline      // B
        data[i + 3] = Math.random() * 25 + 8                      // A
      }

      noiseCtx.putImageData(imageData, 0, 0)
    }

    const animate = () => {
      timeRef.current += 0.016
      noiseFrame++

      const t = timeRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const width = window.innerWidth
      const height = window.innerHeight

      // Update transition state
      const targetTransition = isExpanded ? 1 : 0
      transitionRef.current += (targetTransition - transitionRef.current) * 0.03

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Dynamic gradient background with mouse reactivity
      const gradientCenterX = width * (0.3 + mx * 0.4)
      const gradientCenterY = height * (0.3 + my * 0.4)

      // Create layered gradients for spectral effect
      const gradient1 = ctx.createRadialGradient(
        gradientCenterX, gradientCenterY, 0,
        gradientCenterX, gradientCenterY, width * 0.8
      )
      gradient1.addColorStop(0, `hsla(${25 + Math.sin(t * 0.5) * 10}, 100%, 8%, 1)`)
      gradient1.addColorStop(0.4, `hsla(${20 + Math.sin(t * 0.3) * 5}, 80%, 5%, 1)`)
      gradient1.addColorStop(1, 'hsla(15, 50%, 3%, 1)')

      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, width, height)

      // Secondary gradient (mouse-reactive warm glow)
      const gradient2 = ctx.createRadialGradient(
        mx * width, my * height, 0,
        mx * width, my * height, 400
      )
      gradient2.addColorStop(0, `hsla(30, 100%, 50%, 0.08)`)
      gradient2.addColorStop(0.5, `hsla(25, 100%, 40%, 0.04)`)
      gradient2.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, width, height)

      // Calculate nova circle center and radius
      const centerX = logoCenter?.x ?? width / 2
      const centerY = logoCenter?.y ?? height / 2
      const novaRadius = (logoSize / 2) + 60

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Calculate target position based on transition state
        const novaAngle = (i / particlesRef.current.length) * Math.PI * 2 + t * 0.2
        const novaX = centerX + Math.cos(novaAngle) * novaRadius
        const novaY = centerY + Math.sin(novaAngle) * novaRadius

        // Lerp between scattered and nova positions
        particle.targetX = particle.baseX * (1 - transitionRef.current) + novaX * transitionRef.current
        particle.targetY = particle.baseY * (1 - transitionRef.current) + novaY * transitionRef.current

        // Smooth movement towards target
        particle.x += (particle.targetX - particle.x) * 0.05
        particle.y += (particle.targetY - particle.y) * 0.05

        // Add mouse influence when scattered
        if (transitionRef.current < 0.5) {
          const dx = mx * width - particle.x
          const dy = my * height - particle.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 300) {
            const force = (300 - dist) / 300 * 30
            particle.x -= (dx / dist) * force * 0.01
            particle.y -= (dy / dist) * force * 0.01
          }

          // Ambient drift
          particle.x += Math.sin(t * particle.speed + i) * 0.5
          particle.y += Math.cos(t * particle.speed * 0.8 + i) * 0.5
        } else {
          // Orbital motion when in nova mode
          particle.angle += particle.orbitSpeed
        }

        // Dynamic size and glow based on state
        const glowIntensity = 0.3 + transitionRef.current * 0.5
        const particleHue = particle.hue + Math.sin(t + i * 0.1) * 10
        const particleSize = particle.size * (1 + transitionRef.current * 0.5)

        // Draw particle with glow
        ctx.save()
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2)

        // Glow effect
        ctx.shadowColor = `hsla(${particleHue}, 100%, 55%, ${glowIntensity})`
        ctx.shadowBlur = 15 + transitionRef.current * 10

        ctx.fillStyle = `hsla(${particleHue}, 100%, 60%, ${0.7 + transitionRef.current * 0.3})`
        ctx.fill()
        ctx.restore()
      })

      // Draw connecting lines when in nova mode
      if (transitionRef.current > 0.3) {
        ctx.strokeStyle = `hsla(30, 100%, 50%, ${transitionRef.current * 0.15})`
        ctx.lineWidth = 1

        for (let i = 0; i < particlesRef.current.length; i++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[(i + 1) % particlesRef.current.length]

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }

      // Generate noise at ~20fps for performance
      if (noiseFrame % 3 === 0) {
        generateNoise()
      }

      // Draw noise overlay
      ctx.globalAlpha = 0.06
      ctx.globalCompositeOperation = 'overlay'
      ctx.drawImage(noiseCanvas, 0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1

      // Vignette effect
      const vignetteGradient = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.3,
        width / 2, height / 2, height * 0.9
      )
      vignetteGradient.addColorStop(0, 'transparent')
      vignetteGradient.addColorStop(0.7, 'rgba(10, 8, 6, 0.4)')
      vignetteGradient.addColorStop(1, 'rgba(10, 8, 6, 0.8)')

      ctx.fillStyle = vignetteGradient
      ctx.fillRect(0, 0, width, height)

      // Scanline overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isExpanded, logoCenter, logoSize, initParticles])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <canvas
        ref={noiseCanvasRef}
        className="hidden"
      />
    </>
  )
}
