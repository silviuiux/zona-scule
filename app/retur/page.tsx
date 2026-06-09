import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = { title: 'Politica de retur' }

export default function ReturPage() {
  return (
    <>
      <Nav />
      <main id="continut" className="legal-page">
        <style>{`
          .legal-page { padding: 120px 16px 96px; max-width: 840px; margin: 0 auto; min-height: 70vh; }
          .legal-page h1 { font-family: var(--font-bungee), sans-serif; font-size: clamp(32px, 5vw, 56px); text-transform: uppercase; line-height: 1; margin-bottom: 24px; }
          .legal-page h2 { font-family: var(--font-recursive), sans-serif; font-size: 18px; font-weight: 500; margin: 32px 0 8px; }
          .legal-page p { font-family: var(--font-recursive), sans-serif; font-size: 14px; line-height: 1.7; color: rgba(0,0,0,0.7); margin-bottom: 12px; }
        `}</style>
        <h1>Politica de retur</h1>
        <p>Comenzile se finalizeaza prin oferta directa, iar conditiile de retur si garantie se comunica odata cu oferta, in conformitate cu legislatia in vigoare (OUG 34/2014 pentru consumatori).</p>
        <h2>Garantie si service</h2>
        <p>Produsele beneficiaza de garantia producatorului. Echipa noastra de service asigura interventii si proceduri simplificate de garantie — detalii la 0248.222.298.</p>
        {/* TODO(Silviu): completeaza cu textul juridic final inainte de lansare */}
      </main>
      <Footer />
    </>
  )
}
