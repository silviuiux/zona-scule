import type { Metadata } from 'next'
import './globals.css'
import DotsParallax from '@/components/DotsParallax'
import SmoothScroll from '@/components/SmoothScroll'
import { NavigationProgressProvider } from '@/components/NavigationProgress'
import AnalyticsGate from '@/components/AnalyticsGate'
import CookieConsent from '@/components/CookieConsent'

export const metadata: Metadata = {
  title: 'Zona Scule — Scule și Echipamente Profesionale',
  description: 'Distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.',
  // app/favicon.ico is picked up automatically by Next's file convention;
  // these cover the sizes/formats that convention doesn't reach (multi-size
  // PNG favicons, iOS home-screen icon, Android/PWA manifest icons).
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Exact fonts from Framer: Bungee (headlines), Recursive (body/labels), Inter (UI) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Bungee+Inline&family=Recursive:wght@400;500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Recursive', system-ui, sans-serif" }}>
        <SmoothScroll />
        <DotsParallax />
        <NavigationProgressProvider>
          {children}
        </NavigationProgressProvider>
        <CookieConsent />
        <AnalyticsGate />
      </body>
    </html>
  )
}
