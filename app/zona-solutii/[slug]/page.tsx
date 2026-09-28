import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { SOLUTIONS, getSolution, solutionSubs, type SolutionSection } from '@/lib/solutions'
import { getProductsBySubcategories, getBrandsBySubcategories, getApplicationImage } from '@/lib/supabase'
import { getBrandHref } from '@/lib/brand-content'
import { SOLUTIONS_CSS } from '../styles'

// One template for every story in lib/solutions.ts: the sections render in
// the order the story lists them. Numbers and products come live from the
// catalog, refreshed hourly.
export const revalidate = 3600

export function generateStaticParams() {
  return SOLUTIONS.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getSolution((await params).slug)
  if (!s) return {}
  return { title: s.metaTitle, description: s.metaDescription, alternates: { canonical: `/zona-solutii/${s.slug}` } }
}

const n = (v: number) => v.toLocaleString('ro-RO')
const pad = (i: number) => String(i + 1).padStart(2, '0')

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const story = getSolution((await params).slug)
  if (!story) notFound()

  const subs = solutionSubs(story)
  const carousels = story.sections.filter((x): x is Extract<SolutionSection, { kind: 'carousel' }> => x.kind === 'carousel')
  const [brands, image, rows] = await Promise.all([
    getBrandsBySubcategories(subs),
    story.sections.some(x => x.kind === 'image') ? getApplicationImage(subs) : Promise.resolve(null),
    Promise.all(carousels.map(c => getProductsBySubcategories(c.subs))),
  ])
  const rowOf = new Map(carousels.map((c, i) => [c, rows[i]]))
  const totalProducts = brands.reduce((a, b) => a + b.cnt, 0)
  const faq = story.sections.find((x): x is Extract<SolutionSection, { kind: 'faq' }> => x.kind === 'faq')
  const related = SOLUTIONS.filter(s => s.slug !== story.slug).slice(0, 3)

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Zona Soluții', item: 'https://www.zonascule.ro/zona-solutii' },
        { '@type': 'ListItem', position: 2, name: story.domain, item: `https://www.zonascule.ro/zona-solutii/${story.slug}` },
      ],
    },
    ...(faq ? [{
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    }] : []),
  ]

  let checklistNo = 0
  const render = (sec: SolutionSection, i: number) => {
    switch (sec.kind) {
      case 'intro':
        return (
          <section key={i} className="zs-section">
            <div className="zs-intro">
              <p className="zs-lead">{sec.lead}</p>
              <ol className="zs-steps">
                {sec.steps.map((st, k) => (
                  <li key={st.title} className="zs-step">
                    <span className="zs-step-n">{pad(k)}</span>
                    <div><p className="zs-step-t">{st.title}</p><p className="zs-step-p">{st.text}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )
      case 'image':
        if (!image) return null
        return (
          <section key={i} className="zs-section">
            <div className="zs-image">
              <Image src={image} alt={`${story.domain} — sculă în lucru`} fill sizes="(max-width: 1440px) 100vw, 1376px" style={{ objectFit: 'cover' }} />
              <span className="zs-image-cap">{sec.caption ?? `${story.domain} · în lucru`}</span>
            </div>
          </section>
        )
      case 'carousel': {
        const row = rowOf.get(sec)
        if (!row || row.products.length === 0) return null
        return (
          <section key={i} className="zs-section">
            <div className="zs-car-head">
              <div>
                <h2 className="zs-car-title">{sec.title}</h2>
                <p className="zs-car-text">{sec.text}</p>
              </div>
              <Link href={`/produse?subcategorie=${encodeURIComponent(sec.subs[0])}`} className="zs-car-link">
                Vezi toate <b>{n(row.total)}</b> <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="zs-scroll">
              {row.products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )
      }
      case 'checklist':
        checklistNo++
        return (
          <section key={i} className="zs-section" id={checklistNo === 1 ? 'trusa' : undefined}>
            <h2 className="zs-check-title">{sec.title}</h2>
            <div className="zs-check">
              {sec.items.map((it, k) => (
                <Link key={it.name} href={`/produse?q=${encodeURIComponent(it.q)}`} className="zs-check-item">
                  <span className="zs-check-n">{pad(k)}</span>
                  <span className="zs-check-name">{it.name}</span>
                  <span className="zs-check-why">{it.why}</span>
                  <span className="zs-check-go">Caută în catalog →</span>
                </Link>
              ))}
            </div>
          </section>
        )
      case 'tip':
        return (
          <section key={i} className="zs-section">
            <blockquote className="zs-tip">
              <p className="zs-tip-text">{sec.text}</p>
              <span className="zs-tip-by">— {sec.by}</span>
            </blockquote>
          </section>
        )
      case 'faq':
        return (
          <section key={i} className="zs-section">
            <div className="zs-faq">
              <h2 className="zs-faq-title">Întrebări frecvente</h2>
              <div className="zs-faq-list">
                {sec.items.map(f => (
                  <details key={f.q} className="zs-faq-item">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )
    }
  }

  return (
    <>
      <Nav />
      <style>{SOLUTIONS_CSS}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="zs-page">
        <div className="zs-wrap">
          <header className="zs-hero">
            <nav className="zs-crumbs" aria-label="Breadcrumb">
              <Link href="/zona-solutii" className="zs-crumb">Zona Soluții</Link>
              <span className="zs-crumb-sep">/</span>
              <span className="zs-crumb-cur">{story.domain}</span>
            </nav>
            <span className="eyebrow-mono">{story.domain}</span>
            <h1 className="zs-title"><span className="red">Zona</span><br />{story.profession}</h1>
            <p className="zs-headline">{story.headline}</p>
            <p className="zs-sub">{story.excerpt}</p>
            <div className="zs-stats">
              <div className="zs-stat"><span className="zs-stat-num">{n(totalProducts)}</span><span className="zs-stat-label">produse relevante</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{brands.length}</span><span className="zs-stat-label">branduri</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{carousels.length}</span><span className="zs-stat-label">familii de produse</span></div>
            </div>
            {brands.length > 0 && (
              <div className="zs-brands">
                {brands.slice(0, 6).map(b => (
                  <Link key={b.brand_name} href={getBrandHref(b.brand_name)} className="zs-brand">
                    {b.brand_name} <span>{n(b.cnt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </header>

          {story.sections.map(render)}

          <section className="zs-section zs-end">
            <h2 className="zs-related-title">Alte soluții</h2>
            <div className="zs-cards">
              {related.map(r => (
                <Link key={r.slug} href={`/zona-solutii/${r.slug}`} className="zs-card">
                  <div className="zs-card-body">
                    <span className="zs-card-domain">{r.domain}</span>
                    <span className="zs-card-title">{r.profession}</span>
                    <span className="zs-card-text">{r.excerpt}</span>
                    <span className="zs-card-meta"><span>Zona Soluții</span><b>Citește →</b></span>
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
