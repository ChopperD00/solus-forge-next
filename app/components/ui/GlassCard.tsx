'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { colors, effects } from '@/app/lib/design-tokens'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'subtle'
  hover?: boolean
}

const variants = {
  default: { background: colors.surface.glass, blur: effects.blur.md, border: `1px solid ${colors.surface.glassBorder}` },
  strong: { background: colors.surface.glassStrong, blur: effects.blur.xl, border: `1px solid ${colors.utility.white}` },
  subtle: { background: 'rgba(255, 255, 255, 0.05)', blur: effects.blur.sm, border: `1px solid rgba(255, 255, 255, 0.1)` },
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', hover = false, className = '', style, children, ...props }, ref) => {
    const v = variants[variant]

    return (
      <div
        ref={ref}
        className={`${hover ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg' : ''} ${className}`}
        style={{
          background: v.background,
          backdropFilter: `blur(${v.blur})`,
          WebkitBackdropFilter: `blur(${v.blur})`,
          border: v.border,
          borderRadius: effects.borderRadius.lg,
          padding: '32px',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
export default GlassCard
