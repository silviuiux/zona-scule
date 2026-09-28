import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { SOLUTIONS, solutionSubs } from '@/lib/solutions'
import { getBrandsBySubcategories, getApplicationImage } from '@/lib/supabase'
import { SOLUTIONS_CSS } from './styles'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Zona Soluții — scule potrivite pentru fiecare meserie | Zona Scule',
  description: 'Ghiduri pe meserii: ce scule, accesorii și echipamente folosesc electricienii, instalatorii, constructorii, tâmplarii, lăcătușii și firmele de curățenie — cu produsele din catalog.',
  alternates: { canonical: '/zona-solutii' },
}

const n = (v: number) => v.toLocaleString('ro-RO')

export default async function ZonaSolutiiPage() {
  const data = await Promise.all(SOLUTIONS.map(async s => {
    const subs = solutionSubs(s)
    const [brands, image] = await Promise.all([getBrandsBySubcategories(subs), getApplicationImage(subs)])
    return { s, image, products: brands.reduce((a, b) => a + b.cnt, 0), brands: brands.length, names: brands.map(b => b.brand_name) }
  }))
  const allBrands = new Set(data.flatMap(d => d.names))

  return (
    <>
      <Nav />
      <style>{SOLUTIONS_CSS}</style>
      <main className="zs-page">
        <div className="zs-wrap">
          <header className="zs-hero">
            <span className="eyebrow-mono">Soluții pe meserii</span>
            <h1 className="zs-title"><span className="red">Zona</span><br />Soluții</h1>
            <p className="zs-sub">
              Pentru fiecare meserie, sculele care contează: cum se lucrează, ce folosesc profesioniștii
              și ce găsești în catalog — de la trusa de bază la echipamentele de volum.
            </p>
            <div className="zs-stats">
              <div className="zs-stat"><span className="zs-stat-num">{SOLUTIONS.length}</span><span className="zs-stat-label">meserii</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{n(data.reduce((a, d) => a + d.products, 0))}</span><span className="zs-stat-label">produse recomandate</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{allBrands.size}</span><span className="zs-stat-label">branduri</span></div>
            </div>
          </header>

          <section className="zs-end">
            <div className="zs-cards">
              {data.map(({ s, image, products, brands }) => (
                <Link key={s.slug} href={`/zona-solutii/${s.slug}`} className="zs-card">
                  <div className="zs-card-img">
                    {image && <Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 460px" style={{ objectFit: 'cover' }} />}
                  </div>
                  <div className="zs-card-body">
                    <span className="zs-card-domain">{s.domain}</span>
                    <span className="zs-card-title">{s.profession}</span>
                    <span className="zs-card-text">{s.excerpt}</span>
                    <span className="zs-card-meta"><span>{n(products)} produse · {brands} branduri</span><b>Citește →</b></span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
