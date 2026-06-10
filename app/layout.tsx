import type { Metadata, Viewport } from 'next'
import './globals.css'
import DotsParallax from '@/components/DotsParallax'
import SmoothScroll from '@/components/SmoothScroll'

// NOTE: fonts load via Google Fonts <link> below (same as before).
// All components reference var(--font-*) (set in globals.css), so a future
// switch to next/font/google self-hosting is a 2-file change — the build
// sandbox used for this branch could not reach fonts.gstatic.com.

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
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://dfbhgnbqwoinujnzfxsl.supabase.co" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Bungee+Inline&family=Recursive:wght@400;500&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
