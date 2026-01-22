'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

interface SolusLogoProps {
  size?: number
  animated?: boolean
  onClick?: () => void
  isExpanded?: boolean
  isHovered?: boolean
  variant?: 'light' | 'dark' | 'gradient'
}

export default function SolusLogo({
  size = 80,
  animated = true,
  onClick,
  isExpanded = false,
  isHovered = false,
  variant = 'gradient'
}: SolusLogoProps) {
  const logoRef = useRef<SVGSVGElement>(null)
  const path1Ref = useRef<SVGPathElement>(null)
  const path2Ref = useRef<SVGPathElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const flameTimelineRef = useRef<gsap.core.Timeline | null>(null)

  // Colors based on variant
  const colors = {
    light: { fill1: '#FFFFFF', fill2: '#E2E8F0' },
    dark: { fill1: '#FFFFFF', fill2: '#94A3B8' },
    gradient: { fill1: '#FF6B00', fill2: '#FF8C00' }
  }

  const { fill1, fill2 } = colors[variant]

  // Initial fade in animation
  useEffect(() => {
    if (!animated || !path1Ref.current || !path2Ref.current) return

    gsap.fromTo([path1Ref.current, path2Ref.current],
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      }
    )
  }, [animated])

  // Flame flicker animation on hover
  useEffect(() => {
    if (!path1Ref.current || !path2Ref.current || !glowRef.current) return

    // Kill existing timeline
    if (flameTimelineRef.current) {
      flameTimelineRef.current.kill()
    }

    if (isHovered) {
      // Create flickering flame effect
      flameTimelineRef.current = gsap.timeline({ repeat: -1 })

      // Flicker the paths with subtle scale and brightness changes
      flameTimelineRef.current
        .to([path1Ref.current, path2Ref.current], {
          filter: 'brightness(1.3)',
          duration: 0.08,
          ease: 'power1.inOut'
        })
        .to([path1Ref.current, path2Ref.current], {
          filter: 'brightness(1.0)',
          duration: 0.12,
          ease: 'power1.inOut'
        })
        .to([path1Ref.current, path2Ref.current], {
          filter: 'brightness(1.5)',
          duration: 0.06,
          ease: 'power1.inOut'
        })
        .to([path1Ref.current, path2Ref.current], {
          filter: 'brightness(1.1)',
          duration: 0.1,
          ease: 'power1.inOut'
        })
        .to([path1Ref.current, path2Ref.current], {
          filter: 'brightness(1.4)',
          duration: 0.07,
          ease: 'power1.inOut'
        })
        .to([path1Ref.current, path2Ref.current], {
          filter: 'brightness(1.0)',
          duration: 0.15,
          ease: 'power1.inOut'
        })

      // Animate glow with flame-like pulsing
      gsap.to(glowRef.current, {
        opacity: 1,
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out'
      })

      // Add subtle random flicker to glow
      const glowFlicker = gsap.timeline({ repeat: -1 })
      glowFlicker
        .to(glowRef.current, { opacity: 0.9, scale: 1.15, duration: 0.1 })
        .to(glowRef.current, { opacity: 1, scale: 1.25, duration: 0.08 })
        .to(glowRef.current, { opacity: 0.85, scale: 1.1, duration: 0.12 })
        .to(glowRef.current, { opacity: 1, scale: 1.2, duration: 0.1 })

      // Scale up logo slightly
      gsap.to(logoRef.current, {
        scale: 1.08,
        duration: 0.3,
        ease: 'power2.out'
      })

    } else {
      // Reset to normal state
      gsap.to([path1Ref.current, path2Ref.current], {
        filter: 'brightness(1.0)',
        duration: 0.3,
        ease: 'power2.out'
      })

      gsap.to(glowRef.current, {
        opacity: 0.5,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })

      gsap.to(logoRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    return () => {
      if (flameTimelineRef.current) {
        flameTimelineRef.current.kill()
      }
    }
  }, [isHovered])

  // Expand animation - paths move apart slightly
  useEffect(() => {
    if (!animated || !path1Ref.current || !path2Ref.current) return

    if (isExpanded) {
      gsap.to(path1Ref.current, {
        x: 5,
        y: -5,
        duration: 0.5,
        ease: 'back.out(1.5)'
      })
      gsap.to(path2Ref.current, {
        x: -5,
        y: 5,
        duration: 0.5,
        ease: 'back.out(1.5)'
      })
    } else {
      gsap.to([path1Ref.current, path2Ref.current], {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      })
    }
  }, [isExpanded, animated])

  return (
    <div
      className="relative cursor-pointer"
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      {/* Glow effect - warm orange glow that intensifies on hover */}
      {variant === 'gradient' && (
        <div
          ref={glowRef}
          className="absolute transition-all duration-300 pointer-events-none"
          style={{
            inset: '-40%',
            background: 'radial-gradient(circle, rgba(255,107,0,0.6) 0%, rgba(255,140,0,0.3) 40%, rgba(255,69,0,0.1) 60%, transparent 70%)',
            filter: 'blur(20px)',
            opacity: 0.5,
          }}
        />
      )}

      {/* New SOLUS Logo from uploaded SVG */}
      <svg
        ref={logoRef}
        viewBox="0 0 211.99 212.01"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="solusGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={variant === 'gradient' ? '#FF6B00' : fill1} />
            <stop offset="50%" stopColor={variant === 'gradient' ? '#FF8C00' : fill1} />
            <stop offset="100%" stopColor={variant === 'gradient' ? '#FFA500' : fill1} />
          </linearGradient>
          <linearGradient id="solusGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={variant === 'gradient' ? '#FF8C00' : fill2} />
            <stop offset="50%" stopColor={variant === 'gradient' ? '#FFA500' : fill2} />
            <stop offset="100%" stopColor={variant === 'gradient' ? '#FFB833' : fill2} />
          </linearGradient>
          {/* Filter for flame glow effect */}
          <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Path 1 - Top right portion */}
        <path
          ref={path1Ref}
          d="M211.99,140.38l-.32,61.16c-6.7-34.45-34.1-59.92-70.38-60.16-.22-39.01-31.04-70.42-70.67-70.68C70.78,30.78,103.07-.06,141.43,0c38.34.06,70.75,31.43,70.44,70.63l-49.88.05h-14.34c35.81,3.99,63.55,32.59,64.34,69.69Z"
          fill="url(#solusGrad1)"
          filter={isHovered ? "url(#flameGlow)" : undefined}
        />

        {/* Path 2 - Bottom left portion */}
        <path
          ref={path2Ref}
          d="M.04,141.43l65.17-.11C29.22,138,.81,108.89,0,72.05L.31,10.47c6.72,34.39,34.09,59.97,70.34,60.16.47,39.39,31.27,70.39,70.73,70.7-.12,39.78-32.5,70.77-70.82,70.67C32.58,211.91.11,181.29.04,141.43Z"
          fill="url(#solusGrad2)"
          filter={isHovered ? "url(#flameGlow)" : undefined}
        />
      </svg>
    </div>
  )
}
