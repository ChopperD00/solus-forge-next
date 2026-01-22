import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// Futuriata font family
const futuriata = localFont({
  src: [
    {
      path: '../public/fonts/futuriata-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/futuriata-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-futuriata',
  display: 'swap',
})

// Futuriata line variants for special effects
const futuriataLine = localFont({
  src: [
    {
      path: '../public/fonts/futuriata-light-line.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/futuriata-boldline.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-futuriata-line',
  display: 'swap',
})

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
    <html lang="en" className={`${futuriata.variable} ${futuriataLine.variable}`}>
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{children}</body>
    </html>
  )
}
