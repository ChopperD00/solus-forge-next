'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { colors, effects, typography } from '@/app/lib/design-tokens'

interface AccentHighlightProps extends HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'div'
}

export const AccentHighlight = forwardRef<HTMLSpanElement, AccentHighlightProps>(
  ({ as = 'span', className = '', style, children, ...props }, ref) => {
    const Component = as

    return (
      <Component
        ref={ref}
        className={`inline-block ${className}`}
        style={{
          background: colors.accent.primary,
          borderRadius: effects.borderRadius.md,
          padding: '4px 12px',
          color: colors.text.primary,
          fontFamily: typography.fontFamily.primary,
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

AccentHighlight.displayName = 'AccentHighlight'
export default AccentHighlight
