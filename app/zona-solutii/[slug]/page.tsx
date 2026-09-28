import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { SOLUTIONS, SOLUTION_TYPES, getSolution, solutionSubs, type SolutionSection } from '@/lib/solutions'
import { getProductsBySubcategories, getBrandsBySubcategories, getApplicationImage, getProductDetail } from '@/lib/supabase'
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
  const [brands, image, rows, product] = await Promise.all([
    getBrandsBySubcategories(subs),
    story.sections.some(x => x.kind === 'image') ? getApplicationImage(subs) : Promise.resolve(null),
    Promise.all(carousels.map(c => getProductsBySubcategories(c.subs))),
    story.product ? getProductDetail(story.product) : Promise.resolve(null),
  ])
  const features = (product?.special_features ?? '').split('|').map(f => f.trim()).filter(Boolean)
  const productImage = product ? (product.main_image_storage_url || product.main_image_url) : null
  const rowOf = new Map(carousels.map((c, i) => [c, rows[i]]))
  const totalProducts = brands.reduce((a, b) => a + b.cnt, 0)
  const faq = story.sections.find((x): x is Extract<SolutionSection, { kind: 'faq' }> => x.kind === 'faq')
  const howto = story.sections.find((x): x is Extract<SolutionSection, { kind: 'howto' }> => x.kind === 'howto')
  // same kind of story first, then the rest
  const others = SOLUTIONS.filter(s => s.slug !== story.slug)
  const related = [...others.filter(s => s.type === story.type), ...others.filter(s => s.type !== story.type)].slice(0, 3)
  const typeInfo = SOLUTION_TYPES.find(t => t.id === story.type)!

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Zona Soluții', item: 'https://www.zonascule.ro/zona-solutii' },
        { '@type': 'ListItem', position: 2, name: story.domain, item: `https://www.zonascule.ro/zona-solutii/${story.slug}` },
      ],
    },
    ...(howto ? [{
      '@context': 'https://schema.org', '@type': 'HowTo', name: story.title ?? story.profession,
      step: howto.steps.map((st, k) => ({ '@type': 'HowToStep', position: k + 1, name: st.title, text: st.text })),
    }] : []),
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
      case 'compare':
        return (
          <section key={i} className="zs-section">
            <h2 className="zs-check-title">{sec.title}</h2>
            {sec.text && <p className="zs-car-text zs-compare-text">{sec.text}</p>}
            <div className="zs-compare-wrap">
              <table className="zs-compare">
                <thead><tr>{sec.head.map((h, k) => <th key={k} scope="col">{h}</th>)}</tr></thead>
                <tbody>
                  {sec.rows.map((r, k) => (
                    <tr key={k}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sec.note && <p className="zs-compare-note">{sec.note}</p>}
          </section>
        )
      case 'rules':
        return (
          <section key={i} className="zs-section">
            <h2 className="zs-check-title">{sec.title}</h2>
            <div className="zs-rules">
              {sec.items.map(r => (
                <div key={r.when} className="zs-rule">
                  <span className="zs-rule-if">Dacă</span>
                  <p className="zs-rule-when">{r.when}</p>
                  <span className="zs-rule-arrow" aria-hidden="true">→</span>
                  <p className="zs-rule-then">{r.then}</p>
                </div>
              ))}
            </div>
          </section>
        )
      case 'howto':
        return (
          <section key={i} className="zs-section">
            <h2 className="zs-check-title">{sec.title}</h2>
            <ol className="zs-howto">
              {sec.steps.map((st, k) => (
                <li key={st.title} className="zs-howto-step">
                  <span className="zs-howto-n">{pad(k)}</span>
                  <p className="zs-step-t">{st.title}</p>
                  <p className="zs-step-p">{st.text}</p>
                </li>
              ))}
            </ol>
          </section>
        )
      case 'cta':
        return (
          <section key={i} className="zs-section">
            <div className="zs-cta">
              <div>
                <h2 className="zs-cta-title">{sec.title}</h2>
                <p className="zs-cta-text">{sec.text}</p>
              </div>
              <Link href={sec.href} className="zs-cta-btn">{sec.label} <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        )
      case 'product':
        if (!product) return null
        return (
          <section key={i} className="zs-section">
            <div className="zs-product">
              <div className="zs-product-img">
                {productImage && <Image src={productImage} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 640px" style={{ objectFit: 'contain' }} priority />}
              </div>
              <div className="zs-product-body">
                <span className="zs-card-domain">{product.brand_name}</span>
                <h2 className="zs-product-name">{product.name}</h2>
                {product.short_description && <p className="zs-product-short">{product.short_description}</p>}
                {features.length > 0 && (
                  <ul className="zs-product-features">
                    {features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                )}
                <Link href={`/produse/${product.slug}`} className="zs-cta-btn zs-product-btn">Vezi produsul <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </section>
        )
      case 'gallery': {
        const imgs = product?.applicationImages ?? []
        if (imgs.length === 0) return null
        return (
          <section key={i} className="zs-section">
            <h2 className="zs-check-title">{sec.title}</h2>
            <div className={`zs-gallery n${Math.min(imgs.length, 3)}`}>
              {imgs.slice(0, 3).map((src, k) => (
                <div key={src} className="zs-gallery-item">
                  <Image src={src} alt={`${product?.name} — în lucru ${k + 1}`} fill sizes={k === 0 ? '(max-width: 1024px) 100vw, 900px' : '(max-width: 1024px) 50vw, 460px'} style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </section>
        )
      }
      case 'specs':
        return (
          <section key={i} className="zs-section">
            <h2 className="zs-check-title">{sec.title}</h2>
            <div className="zs-specs">
              {sec.groups.map(g => (
                <div key={g.name} className="zs-spec-group">
                  <p className="zs-spec-group-name">{g.name}</p>
                  <dl>
                    {g.rows.map(([k, v]) => (
                      <div key={k} className="zs-spec-row"><dt>{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            {sec.note && <p className="zs-compare-note">{sec.note}</p>}
          </section>
        )
      case 'proscons':
        return (
          <section key={i} className="zs-section">
            <div className="zs-proscons">
              <div className="zs-pc">
                <h2 className="zs-pc-title"><span className="zs-pc-mark plus">+</span> Puncte forte</h2>
                <ul>{sec.pros.map(p => <li key={p}>{p}</li>)}</ul>
              </div>
              <div className="zs-pc">
                <h2 className="zs-pc-title"><span className="zs-pc-mark">!</span> De știut</h2>
                <ul>{sec.cons.map(p => <li key={p}>{p}</li>)}</ul>
              </div>
            </div>
          </section>
        )
      case 'verdict':
        return (
          <section key={i} className="zs-section">
            <div className="zs-verdict">
              <div>
                <span className="eyebrow-mono">Verdict</span>
                <p className="zs-tip-text">{sec.text}</p>
                <span className="zs-tip-by">— Analiza echipei tehnice Zona Scule</span>
              </div>
              <div className="zs-verdict-for">
                <p className="zs-spec-group-name">Pentru cine</p>
                <ul>{sec.forWho.map(w => <li key={w}>{w}</li>)}</ul>
                {product && <Link href={`/produse/${product.slug}`} className="zs-car-link">Vezi produsul <span aria-hidden="true">→</span></Link>}
              </div>
            </div>
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
              <span className="zs-crumb-cur">{typeInfo.label}</span>
            </nav>
            <span className="eyebrow-mono">{story.domain}</span>
            {story.title
              ? <h1 className="zs-title zs-title-long">{story.title}</h1>
              : <h1 className="zs-title"><span className="red">Zona</span><br />{story.profession}</h1>}
            <p className="zs-headline">{story.headline}</p>
            <p className="zs-sub">{story.excerpt}</p>
            {story.heroStats ? (
              <div className="zs-stats">
                {story.heroStats.map(([v, l]) => (
                  <div key={l} className="zs-stat"><span className="zs-stat-num">{v}</span><span className="zs-stat-label">{l}</span></div>
                ))}
              </div>
            ) : <div className="zs-stats">
              <div className="zs-stat"><span className="zs-stat-num">{n(totalProducts)}</span><span className="zs-stat-label">{story.type === 'meserie' ? 'produse relevante' : 'produse recomandate'}</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{brands.length}</span><span className="zs-stat-label">branduri</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{carousels.length}</span><span className="zs-stat-label">familii de produse</span></div>
            </div>}
            {brands.length > 0 && !story.product && (
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
                    <span className="zs-card-title">{r.title ?? r.profession}</span>
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
