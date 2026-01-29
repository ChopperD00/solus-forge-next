'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { colors, effects, typography } from '@/app/lib/design-tokens'

interface GlassPillProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { padding: '6px 12px', fontSize: typography.fontSize.label },
  md: { padding: '10px 20px', fontSize: typography.fontSize.caption },
  lg: { padding: '12px 24px', fontSize: typography.fontSize.button },
}

export const GlassPill = forwardRef<HTMLDivElement, GlassPillProps>(
  ({ size = 'md', className = '', style, children, ...props }, ref) => {
    const s = sizes[size]

    return (
      <div
        ref={ref}
        className={`inline-flex items-center justify-center ${className}`}
        style={{
          background: colors.surface.glass,
          backdropFilter: `blur(${effects.blur.md})`,
          WebkitBackdropFilter: `blur(${effects.blur.md})`,
          borderRadius: effects.borderRadius.xl,
          padding: s.padding,
          fontSize: s.fontSize,
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.primary,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassPill.displayName = 'GlassPill'
export default GlassPill
