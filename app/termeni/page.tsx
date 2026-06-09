import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = { title: 'Termene si conditii' }

export default function TermeniPage() {
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
        <h1>Termene si conditii</h1>
        <p>Acest site este operat de Technology Production SRL (Zona Scule), CIF RO 6796092, cu sediul in Sfanta Vineri 28, Pitesti, Arges.</p>
        <h2>Informatii produse si preturi</h2>
        <p>Catalogul prezinta produse disponibile prin reteaua noastra de distributie. Ofertele de pret se transmit individual, pe baza solicitarii din pagina de contact. Imaginile si specificatiile au caracter informativ si pot fi modificate de producatori fara notificare.</p>
        <h2>Contact</h2>
        <p>Pentru orice intrebare legata de acesti termeni: contact@zonascule.ro / 0248.222.298.</p>
        {/* TODO(Silviu): completeaza cu textul juridic final inainte de lansare */}
      </main>
      <Footer />
    </>
  )
}
