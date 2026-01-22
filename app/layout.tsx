import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SOLUS FORGE Pre-Alpha v3.5 - Creative Command Center',
  description: 'AI-powered creative production platform with multi-agent orchestration, Figma integration, and generative AI workflows',
  keywords: ['AI', 'creative', 'automation', 'video generation', 'image generation', 'email marketing', 'influencer'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{children}</body>
    </html>
  )
}
