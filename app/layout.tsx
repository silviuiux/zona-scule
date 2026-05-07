import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zona Scule — Scule și Echipamente Profesionale',
  description: 'Distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.',
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
        {children}
      </body>
    </html>
  )
}
