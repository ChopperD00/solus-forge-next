import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

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
    <html lang="en" className={`${inter.variable} ${futuriata.variable} ${futuriataLine.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
