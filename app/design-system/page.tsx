'use client'

import { useState } from 'react'
import { colors, typography, effects, spacing, components } from '@/app/lib/design-tokens'

function ColorSwatch({ name, value, textColor = 'white' }: { name: string; value: string; textColor?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden transition-transform hover:scale-105" onClick={copy}>
      <div className="h-24 flex items-end p-3" style={{ backgroundColor: value, color: textColor }}>
        <span className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? 'Copied!' : value}
        </span>
      </div>
      <div className="bg-[#1a1a1a] p-3">
        <p className="text-sm text-white font-medium">{name}</p>
        <p className="text-xs text-gray-400 font-mono">{value}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold text-white mb-6 pb-2 border-b border-gray-800">{title}</h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg text-gray-400 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-gray-800 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-lg z-50">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Inferis Design System
              </h1>
              <p className="text-gray-400 text-sm mt-1">v4.0 · Based on Neura AI Template</p>
            </div>
            <nav className="flex gap-6 text-sm">
              <a href="#colors" className="text-gray-400 hover:text-white transition-colors">Colors</a>
              <a href="#typography" className="text-gray-400 hover:text-white transition-colors">Typography</a>
              <a href="#effects" className="text-gray-400 hover:text-white transition-colors">Effects</a>
              <a href="#components" className="text-gray-400 hover:text-white transition-colors">Components</a>
              <a href="/palette" className="text-purple-400 hover:text-purple-300 transition-colors">Palette Tool →</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <Section title="Colors">
          <div id="colors" className="scroll-mt-24">
            <SubSection title="Background">
              <div className="grid grid-cols-3 gap-4">
                <ColorSwatch name="Primary" value={colors.background.primary} />
                <ColorSwatch name="Secondary" value={colors.background.secondary} />
                <ColorSwatch name="Tertiary" value={colors.background.tertiary} />
              </div>
            </SubSection>

            <SubSection title="Accent">
              <div className="grid grid-cols-3 gap-4">
                <ColorSwatch name="Primary" value={colors.accent.primary} />
                <ColorSwatch name="Primary Hover" value={colors.accent.primaryHover} />
                <ColorSwatch name="Primary Muted" value={colors.accent.primaryMuted} />
              </div>
            </SubSection>

            <SubSection title="Text">
              <div className="grid grid-cols-4 gap-4">
                <ColorSwatch name="Primary" value={colors.text.primary} textColor="#0A0A0A" />
                <ColorSwatch name="Secondary" value={colors.text.secondary} textColor="#0A0A0A" />
                <ColorSwatch name="Muted" value={colors.text.muted} textColor="white" />
                <ColorSwatch name="Inverse" value={colors.text.inverse} textColor="white" />
              </div>
            </SubSection>

            <SubSection title="Utility">
              <div className="grid grid-cols-5 gap-4">
                <ColorSwatch name="White" value={colors.utility.white} textColor="#0A0A0A" />
                <ColorSwatch name="Black" value={colors.utility.black} />
                <ColorSwatch name="Success" value={colors.utility.success} textColor="#0A0A0A" />
                <ColorSwatch name="Warning" value={colors.utility.warning} textColor="#0A0A0A" />
                <ColorSwatch name="Error" value={colors.utility.error} textColor="#0A0A0A" />
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="Typography">
          <div id="typography" className="scroll-mt-24">
            <SubSection title="Font Family">
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-[#1a1a1a] rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Primary</p>
                  <p className="text-3xl" style={{ fontFamily: typography.fontFamily.primary }}>Space Grotesk</p>
                  <p className="text-gray-400 text-sm mt-2 font-mono">{typography.fontFamily.primary}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Monospace</p>
                  <p className="text-3xl" style={{ fontFamily: typography.fontFamily.mono }}>JetBrains Mono</p>
                  <p className="text-gray-400 text-sm mt-2 font-mono">{typography.fontFamily.mono}</p>
                </div>
              </div>
            </SubSection>

            <SubSection title="Font Sizes">
              <div className="space-y-4 bg-[#1a1a1a] rounded-xl p-6">
                {Object.entries(typography.fontSize).map(([name, size]) => (
                  <div key={name} className="flex items-baseline gap-4">
                    <span className="text-gray-500 text-sm w-24 font-mono">{size}</span>
                    <span className="text-gray-400 text-sm w-24">{name}</span>
                    <span style={{ fontSize: size }} className="text-white truncate">The quick brown fox</span>
                  </div>
                ))}
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="Effects">
          <div id="effects" className="scroll-mt-24">
            <SubSection title="Border Radius">
              <div className="grid grid-cols-6 gap-4">
                {Object.entries(effects.borderRadius).map(([name, radius]) => (
                  <div key={name} className="text-center">
                    <div className="w-20 h-20 mx-auto bg-purple-500/50 border border-purple-400" style={{ borderRadius: radius }} />
                    <p className="text-sm text-gray-400 mt-2 capitalize">{name}</p>
                    <p className="text-xs text-gray-500 font-mono">{radius}</p>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Blur (Glassmorphism)">
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(effects.blur).map(([name, blur]) => (
                  <div key={name} className="relative h-32 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500" />
                    <div className="absolute inset-4 bg-white/20 rounded-lg flex items-center justify-center" style={{ backdropFilter: `blur(${blur})` }}>
                      <span className="text-white text-sm capitalize">{name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="Component Patterns">
          <div id="components" className="scroll-mt-24">
            <SubSection title="Glass Pill (Section Labels)">
              <div className="flex gap-4">
                {['About', 'How It Works', 'Use Cases'].map((label) => (
                  <div key={label} className="inline-flex items-center justify-center" style={{
                    background: components.glassPill.background,
                    backdropFilter: `blur(${components.glassPill.backdropBlur})`,
                    borderRadius: components.glassPill.borderRadius,
                    padding: components.glassPill.padding,
                  }}>
                    <span className="text-white font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Glass Card">
              <div className="grid grid-cols-3 gap-6">
                {['For Designers', 'For Marketers', 'For Developers'].map((title) => (
                  <div key={title} style={{
                    background: components.glassCard.background,
                    backdropFilter: `blur(${components.glassCard.backdropBlur})`,
                    borderRadius: components.glassCard.borderRadius,
                    border: components.glassCard.border,
                    padding: components.glassCard.padding,
                  }}>
                    <h4 className="text-xl text-white mb-3">{title}</h4>
                    <p className="text-gray-300 text-sm">Mockups, color palettes, UI copy — handled in seconds.</p>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Buttons">
              <div className="flex gap-4 items-center">
                <button style={{
                  background: components.buttonPrimary.background,
                  color: components.buttonPrimary.color,
                  borderRadius: components.buttonPrimary.borderRadius,
                  padding: components.buttonPrimary.padding,
                  fontWeight: components.buttonPrimary.fontWeight,
                  fontSize: components.buttonPrimary.fontSize,
                }}>Get Started</button>
                <button className="border border-white/30 text-white hover:bg-white/10 transition-colors" style={{ borderRadius: components.buttonPrimary.borderRadius, padding: '12px 32px' }}>Learn More</button>
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="Quick Copy">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] rounded-xl p-6 overflow-x-auto">
              <h4 className="text-sm text-gray-400 mb-3">Design Tokens</h4>
              <pre className="text-sm text-gray-300 font-mono whitespace-pre">
{`import { colors, typography, effects } from '@/app/lib/design-tokens'

<div style={{ background: colors.background.primary }} />
<div style={{ color: colors.accent.primary }} />`}
              </pre>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-6 overflow-x-auto">
              <h4 className="text-sm text-gray-400 mb-3">Component Library</h4>
              <pre className="text-sm text-gray-300 font-mono whitespace-pre">
{`import { Button, GlassCard, GlassPill } from '@/app/components/ui'

<Button variant="primary" size="lg">Get Started</Button>
<GlassCard variant="strong" hover>Content</GlassCard>`}
              </pre>
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back to Inferis</a>
          <a href="/palette" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">Open Palette Tool →</a>
        </div>
      </footer>
    </div>
  )
}
