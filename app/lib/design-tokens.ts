/**
 * Inferis Design System - Design Tokens
 * Extracted from Figma: Inferis v4.0 (Neura AI template)
 *
 * Usage:
 *   import { colors, typography, spacing, effects } from '@/app/lib/design-tokens'
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Primary
  background: {
    primary: '#0A0A0A',
    secondary: '#111111',
    tertiary: '#1A1A1A',
  },

  // Accent
  accent: {
    primary: '#885382',
    primaryHover: '#9A6394',
    primaryMuted: 'rgba(136, 83, 130, 0.2)',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    muted: '#727272',
    inverse: '#0A0A0A',
  },

  // Surface (glassmorphism)
  surface: {
    glass: 'rgba(200, 200, 200, 0.2)',
    glassStrong: 'rgba(255, 255, 255, 0.2)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
  },

  // Utility
  utility: {
    white: '#FFFFFF',
    black: '#000000',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
} as const

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  fontFamily: {
    primary: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  fontSize: {
    hero: '60px',
    display: '48px',
    h1: '36px',
    h2: '30px',
    h3: '25px',
    h4: '22px',
    body: '18px',
    bodySmall: '16px',
    button: '16px',
    caption: '14px',
    label: '12px',
  },

  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const

// ============================================
// SPACING
// ============================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

// ============================================
// EFFECTS
// ============================================

export const effects = {
  borderRadius: {
    none: '0px',
    sm: '8px',
    md: '13px',
    lg: '18px',
    xl: '25px',
    full: '9999px',
  },

  blur: {
    sm: '4px',
    md: '7px',
    lg: '20px',
    xl: '50px',
  },

  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    glow: '0 0 30px rgba(136, 83, 130, 0.3)',
  },

  transition: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
} as const

// ============================================
// COMPONENT PATTERNS
// ============================================

export const components = {
  glassPill: {
    background: colors.surface.glass,
    backdropBlur: effects.blur.md,
    borderRadius: effects.borderRadius.xl,
    padding: '12px 24px',
  },

  glassCard: {
    background: colors.surface.glassStrong,
    backdropBlur: effects.blur.xl,
    borderRadius: effects.borderRadius.lg,
    border: `1px solid ${colors.surface.glassBorder}`,
    padding: '32px',
  },

  buttonPrimary: {
    background: colors.utility.white,
    color: colors.text.inverse,
    borderRadius: effects.borderRadius.full,
    padding: '16px 48px',
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.h2,
  },

  accentHighlight: {
    background: colors.accent.primary,
    borderRadius: effects.borderRadius.md,
    padding: '8px 16px',
  },
} as const
