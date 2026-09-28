import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { SOLUTIONS, SOLUTION_TYPES, solutionSubs } from '@/lib/solutions'
import { getBrandsBySubcategories, getApplicationImage, getProductDetail } from '@/lib/supabase'
import { SOLUTIONS_CSS } from './styles'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Zona Soluții — scule pe meserii, ghiduri și proiecte | Zona Scule',
  description: 'Ce scule folosesc electricienii, instalatorii, constructorii, mecanicii și industria auto; ghiduri „Cum alegi…” și liste de scule pe proiect — cu produsele din catalog.',
  alternates: { canonical: '/zona-solutii' },
}

const n = (v: number) => v.toLocaleString('ro-RO')

export default async function ZonaSolutiiPage() {
  const data = await Promise.all(SOLUTIONS.map(async s => {
    const subs = solutionSubs(s)
    const [brands, image] = await Promise.all([
      getBrandsBySubcategories(subs),
      s.product ? getProductDetail(s.product).then(p => p?.applicationImages[0] ?? null) : getApplicationImage(subs),
    ])
    return { s, image, products: brands.reduce((a, b) => a + b.cnt, 0), brands: brands.length, names: brands.map(b => b.brand_name) }
  }))
  const allBrands = new Set(data.flatMap(d => d.names))
  const featured = data.find(d => d.s.featured)
  type Row = (typeof data)[number]

  const card = ({ s, image, products, brands }: Row, compact = false) => (
    <Link key={s.slug} href={`/zona-solutii/${s.slug}`} className={`zs-card${compact ? ' compact' : ''}`}>
      <div className="zs-card-img">
        {image && <Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 460px" style={{ objectFit: 'cover' }} />}
      </div>
      <div className="zs-card-body">
        <span className="zs-card-domain">{s.domain}</span>
        <span className="zs-card-title">{s.title ?? s.profession}</span>
        <span className="zs-card-text">{s.excerpt}</span>
        <span className="zs-card-meta"><span>{n(products)} produse · {brands} branduri</span><b>Citește →</b></span>
      </div>
    </Link>
  )

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
              Pentru fiecare meserie și industrie, sculele care contează: cum se lucrează, ce folosesc
              profesioniștii, cum alegi corect și ce găsești în catalog.
            </p>
            <div className="zs-stats">
              <div className="zs-stat"><span className="zs-stat-num">{SOLUTIONS.length}</span><span className="zs-stat-label">ghiduri</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{n(data.reduce((a, d) => a + d.products, 0))}</span><span className="zs-stat-label">produse recomandate</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{allBrands.size}</span><span className="zs-stat-label">branduri</span></div>
            </div>
          </header>

          {featured && (
            <Link href={`/zona-solutii/${featured.s.slug}`} className="zs-featured">
              <div className="zs-featured-img">
                {featured.image && <Image src={featured.image} alt="" fill sizes="(max-width: 1024px) 100vw, 800px" style={{ objectFit: 'cover' }} priority />}
              </div>
              <div className="zs-featured-body">
                <span className="zs-card-domain">{featured.s.domain}</span>
                <span className="zs-featured-title">{featured.s.profession}</span>
                <span className="zs-featured-head">{featured.s.headline}</span>
                <span className="zs-featured-text">{featured.s.excerpt}</span>
                <span className="zs-card-meta"><span>{n(featured.products)} produse · {featured.brands} branduri</span><b>Citește →</b></span>
              </div>
            </Link>
          )}

          {SOLUTION_TYPES.map(t => {
            const rows = data.filter(d => d.s.type === t.id && d !== featured)
            if (rows.length === 0) return null
            return (
              <section key={t.id} className="zs-group">
                <div className="zs-group-head">
                  <h2 className="zs-group-title">{t.label}</h2>
                  <span className="zs-group-count">{t.eyebrow} · {rows.length + (featured?.s.type === t.id ? 1 : 0)}</span>
                </div>
                <div className="zs-cards">{rows.map(r => card(r, t.id !== 'meserie'))}</div>
              </section>
            )
          })}
          <div className="zs-end" />
        </div>
      </main>
      <Footer />
    </>
  )
}
