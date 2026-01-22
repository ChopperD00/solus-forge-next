'use client'

import * as React from "react"
import { useRef, useEffect } from "react"

interface GlitchingTechEyeProps {
  size?: number
  hueBase?: number
  rotationSpeed?: number
  glitchiness?: number
  grainStrength?: number
  asciiDensity?: string
  maxAsciiCols?: number
  maxAsciiRows?: number
  eyeFollow?: number
  style?: React.CSSProperties
}

export default function GlitchingTechEye({
  size = 200,
  hueBase = 25, // Orange hue
  rotationSpeed = 1.0,
  glitchiness = 0.85, // Higher default glitchiness
  grainStrength = 0.6,
  asciiDensity = " .:-=+*#%@",
  maxAsciiCols = 80,
  maxAsciiRows = 80,
  eyeFollow = 0.9,
  style,
}: GlitchingTechEyeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const grainCanvasRef = useRef<HTMLCanvasElement | null>(null)
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
    const grainCanvas = grainCanvasRef.current
    if (!canvas || !grainCanvas) return
    const ctx = canvas.getContext("2d")
    const gctx = grainCanvas.getContext("2d")
    if (!ctx || !gctx) return

    const GRAIN_SCALE = 0.5

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

      const gw = Math.max(2, Math.floor(w * GRAIN_SCALE))
      const gh = Math.max(2, Math.floor(h * GRAIN_SCALE))
      if (grainCanvas.width !== gw || grainCanvas.height !== gh) {
        grainCanvas.width = gw
        grainCanvas.height = gh
      }

      ctx.save()
      ctx.scale(dpr, dpr)

      // Clear with transparent background
      ctx.clearRect(0, 0, wCss, hCss)

      const cx = wCss / 2
      const cy = hCss / 2
      const radius = Math.min(wCss, hCss) * 0.35

      // Orange hue shift for SOLUS FORGE palette
      const hueShift = (Math.sin(t * 0.5) * 0.5 + 0.5) * 20
      const hue = (hueBase + hueShift) % 360

      // Background glow gradient - draw as circle, not rectangle
      const bgGrad = ctx.createRadialGradient(
        cx, cy - 20, 0,
        cx, cy, radius * 2
      )
      bgGrad.addColorStop(0, `hsla(${hue + 15}, 90%, 65%, 0.4)`)
      bgGrad.addColorStop(0.3, `hsla(${hue}, 70%, 45%, 0.25)`)
      bgGrad.addColorStop(0.6, `hsla(${hue - 10}, 50%, 25%, 0.15)`)
      bgGrad.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = bgGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 2, 0, Math.PI * 2)
      ctx.fill()

      const rotation = t * rotationSpeed * Math.PI * 0.5

      // More frequent glitches with higher intensity
      const shouldGlitch = Math.random() < 0.12 * glitchiness
      const gOffset = shouldGlitch ? (Math.random() - 0.5) * 25 * glitchiness : 0
      const gScale = shouldGlitch ? 1 + (Math.random() - 0.5) * 0.3 * glitchiness : 1

      ctx.save()
      if (shouldGlitch) {
        ctx.translate(gOffset, gOffset * 0.8)
        ctx.scale(gScale, 1 / (gScale || 1))
      }

      // Inner orb glow - orange palette - draw as circle
      const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5)
      orbGrad.addColorStop(0, `hsla(${hue + 10}, 100%, 95%, 0.9)`)
      orbGrad.addColorStop(0.2, `hsla(${hue + 20}, 90%, 80%, 0.7)`)
      orbGrad.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.4)`)
      orbGrad.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = orbGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Eye follow logic
      const target = mouseRef.current
      const maxOffset = radius * 0.18 * eyeFollow
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
      eyeOffsetRef.current.x = lerp(eyeOffsetRef.current.x, tx, 0.12 + 0.2 * eyeFollow)
      eyeOffsetRef.current.y = lerp(eyeOffsetRef.current.y, ty, 0.12 + 0.2 * eyeFollow)

      // Pupil/center bright spot
      const cRad = radius * 0.3
      ctx.fillStyle = `hsla(${hue + 20}, 100%, 95%, 0.85)`
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
      ctx.strokeStyle = `hsla(${hue + 20}, 80%, 70%, 0.6)`
      ctx.lineWidth = 2

      if (shouldGlitch) {
        const segments = 8
        for (let i = 0; i < segments; i++) {
          const a0 = (i / segments) * Math.PI * 2
          const a1 = ((i + 1) / segments) * Math.PI * 2
          const rr = radius * 1.2 + (Math.random() - 0.5) * 12 * glitchiness
          ctx.beginPath()
          ctx.arc(cx, cy, rr, a0, a1)
          ctx.stroke()
        }
      } else {
        ctx.beginPath()
        ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()

      // ASCII particles - denser grid like the reference
      ctx.font = `${Math.max(8, Math.floor(10 * dpr))}px "Monaco", "Menlo", monospace`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const spacing = 9
      const cols = Math.min(maxAsciiCols, Math.floor(wCss / spacing))
      const rows = Math.min(maxAsciiRows, Math.floor(hCss / spacing))

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i - cols / 2) * spacing + cx
          const y = (j - rows / 2) * spacing + cy
          const dx = x - cx
          const dy = y - cy
          const dist = Math.hypot(dx, dy)

          // Fill more of the sphere area
          if (dist < radius && Math.random() > 0.35) {
            const z = Math.sqrt(Math.max(0, radius * radius - dx * dx - dy * dy))
            const rotZ = dx * Math.sin(rotation) + z * Math.cos(rotation)
            const bright = (rotZ + radius) / (radius * 2)

            if (rotZ > -radius * 0.3) {
              let idx = Math.floor(bright * (asciiDensity.length - 1))
              idx = Math.min(asciiDensity.length - 1, Math.max(0, idx))
              let ch = asciiDensity[idx]

              // More aggressive glitch characters
              if (dist < radius * 0.85 && glitchiness > 0.5 && Math.random() < 0.35 * glitchiness) {
                const glitchChars = ["█", "▓", "▒", "░", "▄", "▀", "■", "□", "▐", "▌", "╳", "◈"]
                ch = glitchChars[Math.floor(Math.random() * glitchChars.length)]
              }

              const alpha = Math.max(0.2, bright)
              ctx.fillStyle = `hsla(${hue + (Math.random() - 0.5) * 10}, 85%, 75%, ${alpha})`
              ctx.fillText(ch, x, y)
            }
          }
        }
      }

      // Grain overlay - more intense
      gctx.clearRect(0, 0, gw, gh)
      const img = gctx.createImageData(gw, gh)
      const data = img.data
      const base = 128
      const amp = Math.floor(255 * (0.1 + grainStrength * 0.4))

      for (let p = 0; p < data.length; p += 4) {
        const n = (Math.random() - 0.5) * amp
        const v = Math.max(0, Math.min(255, base + n))
        data[p] = v
        data[p + 1] = v * 0.7 // Orange tint
        data[p + 2] = v * 0.3
        data[p + 3] = Math.max(0, Math.min(255, Math.abs(n) * 3))
      }
      gctx.putImageData(img, 0, 0)

      // Extra glitch particles
      if (glitchiness > 0.5) {
        gctx.globalCompositeOperation = "screen"
        for (let i = 0; i < 80; i++) {
          const px = Math.random() * gw
          const py = Math.random() * gh
          const pr = Math.random() * 2 + 0.5
          const op = Math.random() * 0.5 * glitchiness
          gctx.fillStyle = `rgba(255, 180, 100, ${op})`
          gctx.beginPath()
          gctx.arc(px, py, pr, 0, Math.PI * 2)
          gctx.fill()
        }
        gctx.globalCompositeOperation = "source-over"
      }

      // Draw grain overlay
      ctx.globalAlpha = 0.3 + grainStrength * 0.5
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(grainCanvas, 0, 0, wCss, hCss)
      ctx.globalAlpha = 1

      ctx.restore()

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [size, hueBase, rotationSpeed, glitchiness, grainStrength, asciiDensity, maxAsciiCols, maxAsciiRows, eyeFollow])

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
      <canvas
        ref={grainCanvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}
