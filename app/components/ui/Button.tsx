'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { colors, effects, typography } from '@/app/lib/design-tokens'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: { background: colors.utility.white, color: colors.text.inverse, border: 'none' },
  secondary: { background: 'transparent', color: colors.text.primary, border: `1px solid ${colors.surface.glassBorder}` },
  ghost: { background: 'transparent', color: colors.text.secondary, border: 'none' },
  accent: { background: colors.accent.primary, color: colors.text.primary, border: 'none' },
}

const sizes = {
  sm: { padding: '8px 16px', fontSize: typography.fontSize.caption, borderRadius: effects.borderRadius.lg },
  md: { padding: '12px 24px', fontSize: typography.fontSize.button, borderRadius: effects.borderRadius.xl },
  lg: { padding: '16px 48px', fontSize: typography.fontSize.h4, borderRadius: effects.borderRadius.full },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', style, children, ...props }, ref) => {
    const v = variants[variant]
    const s = sizes[size]

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{ ...v, ...s, fontFamily: typography.fontFamily.primary, fontWeight: typography.fontWeight.medium, ...style }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
