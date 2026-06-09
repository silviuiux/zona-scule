import type { Metadata, Viewport } from 'next'
import { Bungee, Bungee_Inline, Recursive, Inter } from 'next/font/google'
import './globals.css'
import DotsParallax from '@/components/DotsParallax'
import SmoothScroll from '@/components/SmoothScroll'

// Self-hosted via next/font: no render-blocking Google Fonts CSS,
// no third-party request, automatic fallback metrics (less CLS).
const bungee = Bungee({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-bungee', display: 'swap' })
const bungeeInline = Bungee_Inline({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-bungee-inline', display: 'swap' })
const recursive = Recursive({ weight: ['400', '500'], subsets: ['latin', 'latin-ext'], variable: '--font-recursive', display: 'swap' })
const inter = Inter({ weight: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zonascule.online'),
  title: {
    default: 'Zona Scule — Scule și Echipamente Profesionale',
    template: '%s — Zona Scule',
  },
  description: 'Distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.',
  openGraph: {
    siteName: 'Zona Scule',
    locale: 'ro_RO',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${bungee.variable} ${bungeeInline.variable} ${recursive.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://dfbhgnbqwoinujnzfxsl.supabase.co" />
      </head>
      <body>
        <a href="#continut" className="skip-link">Sari la continut</a>
        <SmoothScroll />
        <DotsParallax />
        {children}
      </body>
    </html>
  )
}
