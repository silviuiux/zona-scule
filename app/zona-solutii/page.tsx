import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { SOLUTIONS, SOLUTION_TYPES, solutionSubs } from '@/lib/solutions'
import { getBrandsBySubcategories, getApplicationImage, getProductDetail } from '@/lib/supabase'
import { SOLUTIONS_CSS, STORY_CSS } from './styles'
import StoryMotion from './StoryMotion'
import { stagger } from './editorial'

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
  // its sub-stories travel with it, not in the groups below
  const series = featured ? data.filter(d => d.s.parent === featured.s.slug) : []
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
      <style>{SOLUTIONS_CSS + STORY_CSS}</style>
      <StoryMotion />
      <main className="zs-page zs-story">
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
            <section className="zs-feature">
              <div className="zs-feature-inner">
                <Link href={`/zona-solutii/${featured.s.slug}`} className="zs-feature-main">
                  <div className="zs-feature-img" data-parallax data-reveal>
                    <div>
                      {featured.image && <Image src={featured.image} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" style={{ objectFit: 'cover' }} priority />}
                    </div>
                  </div>
                  <div className="zs-feature-body">
                    <span className="zs-feature-kicker" data-reveal>Poveste recomandată · {featured.s.domain}</span>
                    <span className="zs-feature-title" data-reveal style={stagger(1)}>{featured.s.profession}</span>
                    <span className="zs-feature-head" data-reveal style={stagger(2)}>{featured.s.headline}</span>
                    <span className="zs-feature-text" data-reveal style={stagger(3)}>{featured.s.excerpt}</span>
                    <span className="zs-feature-meta" data-reveal style={stagger(4)}>
                      <span className="zs-feature-count">{n(featured.products)} produse · {featured.brands} branduri{series.length > 0 && ` · ${series.length} ghiduri în serie`}</span>
                      <span className="zs-feature-btn">Citește povestea <span aria-hidden="true">→</span></span>
                    </span>
                  </div>
                </Link>

                {series.length > 0 && (
                  <div className="zs-feature-series">
                    <div className="zs-feature-series-head" data-reveal>
                      <span className="zs-feature-series-title">Din seria {featured.s.profession}</span>
                      <span className="zs-group-count">Nevoile liniei, pe rând · {series.length}</span>
                    </div>
                    <div className="zs-feature-subs">
                      {series.map((r, k) => (
                        <Link key={r.s.slug} href={`/zona-solutii/${r.s.slug}`} className="zs-sub" data-reveal style={stagger(k)}>
                          <span className="zs-sub-img">
                            {(r.image ?? featured.image) && <Image src={(r.image ?? featured.image)!} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px" style={{ objectFit: 'cover' }} />}
                          </span>
                          <span className="zs-sub-n">{String(k + 1).padStart(2, '0')}</span>
                          <span className="zs-sub-title">{r.s.profession}</span>
                          <span className="zs-sub-text">{r.s.headline}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {SOLUTION_TYPES.map(t => {
            const rows = data.filter(d => d.s.type === t.id && d !== featured && !d.s.parent)
            if (rows.length === 0) return null
            return (
              <section key={t.id} className="zs-group">
                <div className="zs-group-head">
                  <h2 className="zs-group-title">{t.label}</h2>
                  <span className="zs-group-count">{t.eyebrow} · {rows.length}</span>
                </div>
                <div className="zs-cards">{rows.map(r => card(r, t.id !== 'meserie'))}</div>
              </section>
            )
          })}
          <div className="zs-end" />
        </div>
      </main>
      <Footer stories={false} />
    </>
  )
}
