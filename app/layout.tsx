import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

// Space Grotesk as display font (similar geometric/modern feel to Halfre)
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SOLUS FORGE Pre-Alpha v3.0 - Creative Command Center',
  description: 'AI-powered creative production platform with multi-agent orchestration, Figma integration, and generative AI workflows',
  keywords: ['AI', 'creative', 'automation', 'video generation', 'image generation', 'email marketing', 'influencer'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
