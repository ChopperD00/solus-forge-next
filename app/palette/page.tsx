'use client'

import { useState, useEffect } from 'react'

const PRESETS = {
  'Inferis v4.0': '#0A0A0A, #111111, #1A1A1A, #885382, #9A6394, #FFFFFF, #A0A0A0, #727272, #4ADE80, #FBBF24, #F87171',
  'Inferis Glass': 'rgba(200, 200, 200, 0.2), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.3), #885382',
  'Dark Mode': '#0A0A0A, #121212, #1E1E1E, #2D2D2D, #404040, #FFFFFF, #E0E0E0, #A0A0A0',
  'Purple Accent': '#885382, #9A6394, #6B4266, #5C3957, #4D2F49, #3E253B',
}

interface ColorSwatch {
  original: string
  hex: string
  rgb: string
}

function parseColors(input: string): ColorSwatch[] {
  const colors: ColorSwatch[] = []
  const hexPattern = /#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g
  const rgbPattern = /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+)?\s*\)/gi

  let match

  while ((match = hexPattern.exec(input)) !== null) {
    let hex = match[1]
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
    hex = `#${hex.toLowerCase()}`
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    colors.push({ original: match[0], hex, rgb: `rgb(${r}, ${g}, ${b})` })
  }

  while ((match = rgbPattern.exec(input)) !== null) {
    const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3])
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    colors.push({ original: match[0], hex, rgb: `rgb(${r}, ${g}, ${b})` })
  }

  return colors.filter((color, index, self) => index === self.findIndex(c => c.hex === color.hex))
}

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export default function PalettePage() {
  const [input, setInput] = useState('')
  const [colors, setColors] = useState<ColorSwatch[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (input.trim()) setColors(parseColors(input))
    else setColors([])
  }, [input])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Color Palette
        </h1>
        <p className="text-gray-400 mb-4">Paste any text containing colors - hex, rgb, rgba</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-gray-500 text-sm py-1">Presets:</span>
          {Object.entries(PRESETS).map(([name, colors]) => (
            <button key={name} onClick={() => setInput(colors)} className="px-3 py-1 text-sm bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 rounded-full transition-colors text-gray-300 hover:text-white">
              {name}
            </button>
          ))}
          <a href="/design-system" className="px-3 py-1 text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-full transition-colors text-purple-300 hover:text-purple-200">
            Design System →
          </a>
        </div>

        <textarea
          className="w-full h-48 bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 text-gray-200 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
          placeholder="Paste your colors here... #885382, #0A0A0A, rgb(136, 83, 130)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />

        {colors.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-200">{colors.length} color{colors.length !== 1 ? 's' : ''} found</h2>
              <button onClick={() => copyToClipboard(colors.map(c => c.hex).join(', '))} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-colors">
                Copy all hex
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {colors.map((color, i) => {
                const isLight = getLuminance(color.hex) > 0.5
                return (
                  <div key={i} className="group relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105" onClick={() => copyToClipboard(color.hex)}>
                    <div className="aspect-square" style={{ backgroundColor: color.hex }} />
                    <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'bg-black/30' : 'bg-white/10'}`}>
                      <span className={`font-mono text-sm font-bold ${isLight ? 'text-black' : 'text-white'}`}>
                        {copied === color.hex ? 'Copied!' : color.hex}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                      <p className="font-mono text-xs text-gray-200 truncate">{color.hex}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8">
              <h3 className="text-sm text-gray-400 mb-2">Palette Strip</h3>
              <div className="h-16 rounded-xl overflow-hidden flex">
                {colors.map((color, i) => (
                  <div key={i} className="flex-1 cursor-pointer hover:flex-[2] transition-all duration-300" style={{ backgroundColor: color.hex }} onClick={() => copyToClipboard(color.hex)} title={color.hex} />
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">CSS Variables</h3>
              <pre className="font-mono text-xs text-gray-300 overflow-x-auto">
{`:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`}
              </pre>
              <button onClick={() => copyToClipboard(`:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`)} className="mt-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                {copied?.includes(':root') ? 'Copied!' : 'Copy CSS'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-6">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back to Inferis</a>
          <a href="/design-system" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">Design System →</a>
        </div>
      </div>
    </div>
  )
}
