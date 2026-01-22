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
      <head>
        {/* Inter font from Google Fonts CDN - Light (300) through Bold (700) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{children}</body>
    </html>
  )
}
