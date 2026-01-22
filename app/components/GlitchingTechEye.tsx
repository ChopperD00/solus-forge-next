'use client'

import * as React from "react"
import { useRef, useEffect } from "react"

interface GlitchingTechEyeProps {
  size?: number
  hueBase?: number // Will be converted to orange palette
  rotationSpeed?: number
  glitchiness?: number
  grainStrength?: number
  eyeFollow?: number
  style?: React.CSSProperties
}

// SOLUS FORGE color palette
const colors = {
  bg: 'transparent',
  accent: '#FF6B00',
  accentLight: '#FF8C33',
  accentDark: '#CC5500',
  accentGlow: 'rgba(255, 107, 0, 0.3)',
}

export default function GlitchingTechEye({
  size = 200,
  hueBase = 25, // Orange hue
  rotationSpeed = 0.8,
  glitchiness = 0.5,
  grainStrength = 0.3,
  eyeFollow = 0.7,
  style,
}: GlitchingTechEyeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const tRef = useRef(0)

  const mouseRef = useRef<{ x: number; y: number; inside: boolean }>({
    x: 0,
    y: 0,
    inside: false,
  })
  const eyeOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseRef.current = {
        x,
        y,
        inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height,
      }
    }

    const onLeave = () => {
      mouseRef.current.inside = false
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseout", onLeave, { passive: true })

    return () => {
      window.removeEventListener("mousemove", onMove as any)
      window.removeEventListener("mouseout", onLeave as any)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const asciiDensity = " .:-=+*#%@"

    const render = () => {
      tRef.current += 0.016
      const t = tRef.current
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      const wCss = canvas.clientWidth || size
      const hCss = canvas.clientHeight || size
      const w = Math.floor(wCss * dpr)
      const h = Math.floor(hCss * dpr)

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      ctx.save()
      ctx.scale(dpr, dpr)

      // Clear with transparent background
      ctx.clearRect(0, 0, wCss, hCss)

      const cx = wCss / 2
      const cy = hCss / 2
      const radius = Math.min(wCss, hCss) * 0.35

      // Orange hue shift for SOLUS FORGE palette
      const hueShift = (Math.sin(t * 0.5) * 0.5 + 0.5) * 15
      const hue = (hueBase + hueShift) % 360

      const rotation = t * rotationSpeed * Math.PI * 0.5
      const shouldGlitch = Math.random() < 0.06 * glitchiness
      const gOffset = shouldGlitch ? (Math.random() - 0.5) * 15 * glitchiness : 0
      const gScale = shouldGlitch ? 1 + (Math.random() - 0.5) * 0.2 * glitchiness : 1

      ctx.save()
      if (shouldGlitch) {
        ctx.translate(gOffset, gOffset * 0.8)
        ctx.scale(gScale, 1 / (gScale || 1))
      }

      // Inner orb glow - orange palette
      const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.3)
      orbGrad.addColorStop(0, `hsla(${hue + 10}, 100%, 70%, 0.9)`)
      orbGrad.addColorStop(0.3, `hsla(${hue}, 90%, 55%, 0.6)`)
      orbGrad.addColorStop(0.6, `hsla(${hue - 5}, 80%, 40%, 0.3)`)
      orbGrad.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = orbGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2)
      ctx.fill()

      // Eye follow logic
      const target = mouseRef.current
      const maxOffset = radius * 0.15 * eyeFollow
      let tx = 0, ty = 0

      if (target.inside) {
        const dx = target.x - cx
        const dy = target.y - cy
        const len = Math.hypot(dx, dy) || 1
        const k = Math.min(1, len / (radius * 1.2))
        tx = (dx / len) * maxOffset * k
        ty = (dy / len) * maxOffset * k
      }

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      eyeOffsetRef.current.x = lerp(eyeOffsetRef.current.x, tx, 0.1 + 0.15 * eyeFollow)
      eyeOffsetRef.current.y = lerp(eyeOffsetRef.current.y, ty, 0.1 + 0.15 * eyeFollow)

      // Pupil/center bright spot - orange
      const cRad = radius * 0.25
      const pupilGrad = ctx.createRadialGradient(
        cx + eyeOffsetRef.current.x,
        cy + eyeOffsetRef.current.y,
        0,
        cx + eyeOffsetRef.current.x,
        cy + eyeOffsetRef.current.y,
        cRad
      )
      pupilGrad.addColorStop(0, `hsla(${hue + 15}, 100%, 85%, 1)`)
      pupilGrad.addColorStop(0.5, `hsla(${hue + 10}, 95%, 65%, 0.9)`)
      pupilGrad.addColorStop(1, `hsla(${hue}, 90%, 50%, 0.6)`)

      ctx.fillStyle = pupilGrad
      ctx.beginPath()
      ctx.arc(
        cx + eyeOffsetRef.current.x,
        cy + eyeOffsetRef.current.y,
        cRad,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // Outer ring with glitch effect
      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.5)`
      ctx.lineWidth = 1.5

      if (shouldGlitch) {
        const segments = 8
        for (let i = 0; i < segments; i++) {
          const a0 = (i / segments) * Math.PI * 2
          const a1 = ((i + 1) / segments) * Math.PI * 2
          const rr = radius * 1.1 + (Math.random() - 0.5) * 8 * glitchiness
          ctx.beginPath()
          ctx.arc(cx, cy, rr, a0, a1)
          ctx.stroke()
        }
      } else {
        ctx.beginPath()
        ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()

      // ASCII particles on the sphere
      ctx.font = `${Math.max(6, Math.floor(8))}px monospace`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const spacing = 7
      const cols = Math.min(30, Math.floor(wCss / spacing))
      const rows = Math.min(30, Math.floor(hCss / spacing))

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i - cols / 2) * spacing + cx
          const y = (j - rows / 2) * spacing + cy
          const dx = x - cx
          const dy = y - cy
          const dist = Math.hypot(dx, dy)

          if (dist < radius * 0.9 && dist > radius * 0.3 && Math.random() > 0.5) {
            const z = Math.sqrt(Math.max(0, radius * radius - dx * dx - dy * dy))
            const rotZ = dx * Math.sin(rotation) + z * Math.cos(rotation)
            const bright = (rotZ + radius) / (radius * 2)

            if (rotZ > -radius * 0.3) {
              let idx = Math.floor(bright * (asciiDensity.length - 1))
              idx = Math.min(asciiDensity.length - 1, Math.max(0, idx))
              let ch = asciiDensity[idx]

              // Glitch characters
              if (glitchiness > 0.6 && Math.random() < 0.2) {
                const glitchChars = ["█", "▓", "▒", "░", "▄", "▀", "■", "□"]
                ch = glitchChars[Math.floor(Math.random() * glitchChars.length)]
              }

              const alpha = Math.max(0.15, bright * 0.6)
              ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${alpha})`
              ctx.fillText(ch, x, y)
            }
          }
        }
      }

      // Subtle grain overlay
      if (grainStrength > 0) {
        for (let i = 0; i < 50; i++) {
          const gx = Math.random() * wCss
          const gy = Math.random() * hCss
          const gdist = Math.hypot(gx - cx, gy - cy)
          if (gdist < radius * 1.2) {
            const op = Math.random() * 0.15 * grainStrength
            ctx.fillStyle = `rgba(255, 150, 50, ${op})`
            ctx.beginPath()
            ctx.arc(gx, gy, Math.random() * 1.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      ctx.restore()

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [size, hueBase, rotationSpeed, glitchiness, grainStrength, eyeFollow])

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        width: size,
        height: size,
        position: "relative",
        overflow: "visible",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}
