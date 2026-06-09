import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="continut" style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '120px 16px 96px', textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-bungee), sans-serif',
          fontSize: 'clamp(64px, 12vw, 140px)', lineHeight: 1, color: 'rgb(217,44,43)',
        }}>404</p>
        <h1 style={{
          fontFamily: 'var(--font-bungee), sans-serif',
          fontSize: 'clamp(20px, 3vw, 32px)', textTransform: 'uppercase', lineHeight: 1.1,
        }}>Pagina nu a fost gasita</h1>
        <p style={{
          fontFamily: 'var(--font-recursive), sans-serif',
          fontSize: 14, color: 'rgba(0,0,0,0.62)', maxWidth: 420, lineHeight: 1.6,
        }}>
          Produsul sau pagina cautata nu mai exista. Cauta in catalog — avem peste 31.000 de scule si accesorii.
        </p>
        <Link href="/produse" style={{
          marginTop: 8, display: 'inline-block', padding: '14px 36px',
          background: 'rgb(217,44,43)', color: 'rgb(255,255,255)',
          fontFamily: 'var(--font-inter), sans-serif', fontSize: 12, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
          borderRadius: 4,
        }}>Vezi catalogul</Link>
      </main>
      <Footer />
    </>
  )
}
