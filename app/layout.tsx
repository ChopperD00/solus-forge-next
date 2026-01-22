import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const halfre = localFont({
  src: [
    {
      path: '../public/fonts/Halfre.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-halfre',
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
    <html lang="en" className={`${inter.variable} ${halfre.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
