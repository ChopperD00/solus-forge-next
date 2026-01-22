'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

interface GradientBlob {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
}

export default function MouseGradientBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: 0.5, y: 0.5 })
  const [isLoaded, setIsLoaded] = useState(false)

  // SOLUS palette - Warm orange glows on warm black (cinematic)
  const blobs: GradientBlob[] = [
    { id: 1, x: 20, y: 30, size: 800, color: 'rgba(255, 107, 0, 0.18)', delay: 0 },       // Vibrant orange
    { id: 2, x: 70, y: 60, size: 700, color: 'rgba(255, 140, 0, 0.14)', delay: 0.5 },     // Bright orange
    { id: 3, x: 40, y: 80, size: 600, color: 'rgba(255, 165, 0, 0.12)', delay: 1 },       // Golden orange
    { id: 4, x: 80, y: 20, size: 500, color: 'rgba(232, 93, 4, 0.10)', delay: 1.5 },      // Deep orange
    { id: 5, x: 50, y: 50, size: 900, color: 'rgba(255, 120, 0, 0.08)', delay: 0.8 },     // Center glow
  ]

  // Generate film grain noise on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 512
    canvas.height = 512

    let animationId: number

    const generateGrain = () => {
      const imageData = ctx.createImageData(512, 512)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        // Random grayscale noise with warm tint
        const noise = Math.random() * 255
        const warmth = Math.random() * 20 // Slight warm variation

        data[i] = Math.min(255, noise + warmth)     // R - slightly warmer
        data[i + 1] = noise                         // G
        data[i + 2] = Math.max(0, noise - warmth)   // B - slightly less
        data[i + 3] = Math.random() * 30 + 10       // A - variable opacity
      }

      ctx.putImageData(imageData, 0, 0)
      animationId = requestAnimationFrame(generateGrain)
    }

    // Run grain at ~30fps for performance
    const grainLoop = () => {
      generateGrain()
      setTimeout(() => requestAnimationFrame(grainLoop), 33)
    }
    grainLoop()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Mouse tracking with smooth interpolation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      mousePos.current = { x, y }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animate blobs based on mouse position
  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true)
      return
    }

    const animateBlobs = () => {
      blobRefs.current.forEach((blob, index) => {
        if (!blob) return

        const baseBlob = blobs[index]
        const mouseInfluence = 40 // How much mouse affects position
        const breatheInfluence = 25 // Ambient movement

        // Calculate target position based on mouse
        const targetX = baseBlob.x + (mousePos.current.x - 0.5) * mouseInfluence
        const targetY = baseBlob.y + (mousePos.current.y - 0.5) * mouseInfluence

        // Add organic breathing movement with varied speeds
        const time = Date.now() / 1000
        const breatheX = Math.sin(time * 0.4 + index * 1.2) * breatheInfluence
        const breatheY = Math.cos(time * 0.3 + index * 0.8) * breatheInfluence

        gsap.to(blob, {
          left: `${targetX + breatheX}%`,
          top: `${targetY + breatheY}%`,
          duration: 2.5,
          ease: 'power2.out'
        })
      })

      requestAnimationFrame(animateBlobs)
    }

    const animationId = requestAnimationFrame(animateBlobs)
    return () => cancelAnimationFrame(animationId)
  }, [isLoaded])

  // Initial entrance animation
  useEffect(() => {
    blobRefs.current.forEach((blob, index) => {
      if (!blob) return

      gsap.fromTo(blob,
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 2,
          delay: blobs[index].delay * 0.4,
          ease: 'power3.out'
        }
      )
    })
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Base warm black background with subtle gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 30% 20%, #1E1414 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 70% 80%, #181210 0%, transparent 50%),
            linear-gradient(160deg, #141010 0%, #1A1414 30%, #141010 70%, #100C0C 100%)
          `
        }}
      />

      {/* Mesh gradient blobs */}
      {blobs.map((blob, index) => (
        <div
          key={blob.id}
          ref={el => { blobRefs.current[index] = el }}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(ellipse at center, ${blob.color} 0%, ${blob.color.replace(/[\d.]+\)$/, '0)')} 60%, transparent 100%)`,
            filter: 'blur(80px)',
            mixBlendMode: 'screen',
            willChange: 'transform, left, top',
          }}
        />
      ))}

      {/* Animated film grain overlay - canvas-based */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: 0.08,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Static grain texture layer (backup/additional texture) */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.06,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Warm cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at center, transparent 0%, rgba(20,16,16,0.3) 50%, rgba(10,8,8,0.7) 100%)
          `,
        }}
      />

      {/* Subtle warm light leak from top-left */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 10% 10%, rgba(255,107,0,0.03) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}
