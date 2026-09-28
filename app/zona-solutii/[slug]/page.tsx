import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { SOLUTIONS, SOLUTION_TYPES, getSolution, solutionSubs, type SolutionSection } from '@/lib/solutions'
import { getProductsBySubcategories, getBrandsBySubcategories, getApplicationImages, getProductDetail } from '@/lib/supabase'
import { getBrandHref } from '@/lib/brand-content'
import { SOLUTIONS_CSS, STORY_CSS } from '../styles'
import StoryMotion from '../StoryMotion'

// One template for every story in lib/solutions.ts, laid out as an
// editorial long-read: a quiet hero, a full-bleed photo, then the story's
// sections in the order it lists them — numbered chapters with a lot of air
// between them, full-bleed photos between chapters, step sequences that
// light up one step at a time, and content that rises in as it's reached
// (StoryMotion). Numbers and products come live from the catalog, hourly.
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
const stagger = (i: number) => ({ ['--i' as string]: i }) as CSSProperties

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const story = getSolution((await params).slug)
  if (!story) notFound()

  const subs = solutionSubs(story)
  const carousels = story.sections.filter((x): x is Extract<SolutionSection, { kind: 'carousel' }> => x.kind === 'carousel')
  const imageSlots = story.sections.filter(x => x.kind === 'image').length
  const [brands, pool, rows, product] = await Promise.all([
    getBrandsBySubcategories(subs),
    story.product ? Promise.resolve([]) : getApplicationImages(subs, imageSlots + 1),
    Promise.all(carousels.map(c => getProductsBySubcategories(c.subs))),
    story.product ? getProductDetail(story.product) : Promise.resolve(null),
  ])
  // photos: the first opens the story under the hero, the rest go to the
  // story's image sections (product stories: the product's own photos)
  const photos = product ? product.applicationImages : pool
  const heroPhoto = photos[0] ?? null
  const galleryPhotos = product ? photos.slice(1) : []
  let photoNo = 1

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

  // numbered chapters: "01 — Șurubelnițe izolate…"
  let chapterNo = 0
  const chapter = (title: string, text?: string, aside?: ReactNode) => {
    chapterNo++
    return (
      <header className="zs-chapter" data-reveal>
        <span className="zs-chapter-n">{String(chapterNo).padStart(2, '0')}</span>
        <div className="zs-chapter-main">
          <h2 className="zs-chapter-title">{title}</h2>
          {text && <p className="zs-chapter-text">{text}</p>}
        </div>
        {aside}
      </header>
    )
  }

  // a sequence that lights up one step at a time as it scrolls past
  const sequence = ({ label, lead, steps, big }: { label: string; lead: string; steps: { title: string; text: string }[]; big?: boolean }) => (
    <div className="zs-seq" data-steps>
      <div className="zs-seq-side">
        <div className="zs-seq-sticky">
          <span className="eyebrow-mono">{label}</span>
          <p className={big ? 'zs-seq-lead big' : 'zs-seq-lead'}>{lead}</p>
          <p className="zs-seq-count"><span data-step-current>01</span> / {String(steps.length).padStart(2, '0')}</p>
        </div>
      </div>
      <ol className="zs-seq-steps">
        {steps.map((st, k) => (
          <li key={st.title} className="zs-seq-step" data-step={pad(k)}>
            <span className="zs-seq-n">{pad(k)}</span>
            <p className="zs-seq-t">{st.title}</p>
            <p className="zs-seq-p">{st.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )

  const fullBleed = ({ src, alt, caption, tall, key }: { src: string; alt: string; caption?: string; tall?: boolean; key?: string | number }) => (
    <figure key={key} className={`zs-bleed${tall ? ' tall' : ''}`} data-reveal>
      <div className="zs-bleed-frame" data-parallax>
        <div className="zs-bleed-img">
          <Image src={src} alt={alt} fill sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
      </div>
      {caption && <figcaption className="zs-bleed-cap">{caption}</figcaption>}
    </figure>
  )

  let checklistNo = 0
  const render = (sec: SolutionSection, i: number) => {
    switch (sec.kind) {
      case 'intro':
        return (
          <section key={i} className="zs-block">
            {sequence({ label: 'Cum se lucrează', lead: sec.lead, steps: sec.steps, big: true })}
          </section>
        )
      case 'image': {
        const src = photos[photoNo++]
        if (!src) return null
        return fullBleed({ key: i, src, alt: `${story.domain} — sculă în lucru`, caption: sec.caption ?? `${story.domain} · în lucru` })
      }
      case 'carousel': {
        const row = rowOf.get(sec)
        if (!row || row.products.length === 0) return null
        return (
          <section key={i} className="zs-block">
            {chapter(sec.title, sec.text, (
              <Link href={`/produse?subcategorie=${encodeURIComponent(sec.subs[0])}`} className="zs-car-link">
                Vezi toate <b>{n(row.total)}</b> <span aria-hidden="true">→</span>
              </Link>
            ))}
            <div className="zs-scroll zs-scroll-bleed">
              {row.products.map((p, k) => (
                <div key={p.id} className="zs-scroll-item" data-reveal style={stagger(Math.min(k, 5))}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )
      }
      case 'checklist':
        checklistNo++
        return (
          <section key={i} className="zs-block" id={checklistNo === 1 ? 'trusa' : undefined}>
            {chapter(sec.title, sec.text)}
            <div className="zs-check">
              {sec.items.map((it, k) => (
                <Link key={it.name} href={`/produse?q=${encodeURIComponent(it.q)}`} className="zs-check-item" data-reveal style={stagger(k % 3)}>
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
          <section key={i} className="zs-block zs-quote-block">
            <blockquote className="zs-quote" data-reveal>
              <p className="zs-quote-text">{sec.text}</p>
              <span className="zs-tip-by">— {sec.by}</span>
            </blockquote>
          </section>
        )
      case 'compare':
        return (
          <section key={i} className="zs-block">
            {chapter(sec.title, sec.text)}
            <div className="zs-compare-wrap" data-reveal>
              <table className="zs-compare">
                <thead><tr>{sec.head.map((h, k) => <th key={k} scope="col">{h}</th>)}</tr></thead>
                <tbody>
                  {sec.rows.map((r, k) => (
                    <tr key={k}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sec.note && <p className="zs-compare-note" data-reveal>{sec.note}</p>}
          </section>
        )
      case 'rules':
        return (
          <section key={i} className="zs-block">
            {chapter(sec.title)}
            <div className="zs-rules">
              {sec.items.map((r, k) => (
                <div key={r.when} className="zs-rule" data-reveal style={stagger(k % 2)}>
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
          <section key={i} className="zs-block">
            {sequence({ label: 'Pas cu pas', lead: sec.title, steps: sec.steps })}
          </section>
        )
      case 'cta':
        return (
          <section key={i} className="zs-block">
            <div className="zs-cta" data-reveal>
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
          <section key={i} className="zs-block">
            <div className="zs-product">
              <div className="zs-product-img" data-reveal>
                {productImage && <Image src={productImage} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 640px" style={{ objectFit: 'contain' }} priority />}
              </div>
              <div className="zs-product-body">
                <span className="zs-card-domain" data-reveal>{product.brand_name}</span>
                <h2 className="zs-product-name" data-reveal style={stagger(1)}>{product.name}</h2>
                {product.short_description && <p className="zs-product-short" data-reveal style={stagger(2)}>{product.short_description}</p>}
                {features.length > 0 && (
                  <ul className="zs-product-features">
                    {features.map((f, k) => <li key={f} data-reveal style={stagger(3 + k)}>{f}</li>)}
                  </ul>
                )}
                <Link href={`/produse/${product.slug}`} className="zs-cta-btn zs-product-btn" data-reveal style={stagger(4)}>Vezi produsul <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </section>
        )
      case 'gallery': {
        if (galleryPhotos.length === 0) return null
        const [first, ...rest] = galleryPhotos
        return (
          <section key={i} className="zs-block zs-gallery-block">
            {chapter(sec.title)}
            {fullBleed({ src: first, alt: `${product?.name} — în lucru`, tall: true })}
            {rest.length > 0 && (
              <div className={`zs-pair n${rest.length}`}>
                {rest.slice(0, 2).map((src, k) => (
                  <div key={src} className="zs-pair-item" data-reveal style={stagger(k)}>
                    <Image src={src} alt={`${product?.name} — în lucru ${k + 2}`} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      }
      case 'specs':
        return (
          <section key={i} className="zs-block">
            {chapter(sec.title)}
            <div className="zs-specs">
              {sec.groups.map((g, k) => (
                <div key={g.name} className="zs-spec-group" data-reveal style={stagger(k % 2)}>
                  <p className="zs-spec-group-name">{g.name}</p>
                  <dl>
                    {g.rows.map(([key, v]) => (
                      <div key={key} className="zs-spec-row"><dt>{key}</dt><dd>{v}</dd></div>
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
          <section key={i} className="zs-block">
            <div className="zs-proscons">
              <div className="zs-pc" data-reveal>
                <h2 className="zs-pc-title"><span className="zs-pc-mark plus">+</span> Puncte forte</h2>
                <ul>{sec.pros.map(p => <li key={p}>{p}</li>)}</ul>
              </div>
              <div className="zs-pc" data-reveal style={stagger(1)}>
                <h2 className="zs-pc-title"><span className="zs-pc-mark">!</span> De știut</h2>
                <ul>{sec.cons.map(p => <li key={p}>{p}</li>)}</ul>
              </div>
            </div>
          </section>
        )
      case 'verdict':
        return (
          <section key={i} className="zs-block">
            <div className="zs-verdict">
              <div data-reveal>
                <span className="eyebrow-mono">Verdict</span>
                <p className="zs-quote-text">{sec.text}</p>
                <span className="zs-tip-by">— Analiza echipei tehnice Zona Scule</span>
              </div>
              <div className="zs-verdict-for" data-reveal style={stagger(1)}>
                <p className="zs-spec-group-name">Pentru cine</p>
                <ul>{sec.forWho.map(w => <li key={w}>{w}</li>)}</ul>
                {product && <Link href={`/produse/${product.slug}`} className="zs-car-link">Vezi produsul <span aria-hidden="true">→</span></Link>}
              </div>
            </div>
          </section>
        )
      case 'faq':
        return (
          <section key={i} className="zs-block">
            {chapter("Întrebări frecvente")}
            <div className="zs-faq-list zs-faq-solo">
              {sec.items.map((f, k) => (
                <details key={f.q} className="zs-faq-item" data-reveal style={stagger(k)}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )
    }
  }

  return (
    <>
      <Nav />
      <style>{SOLUTIONS_CSS + STORY_CSS}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StoryMotion />
      <main className="zs-page zs-story">
        <div className="zs-wrap">
          <header className="zs-story-hero">
            <nav className="zs-crumbs" aria-label="Breadcrumb" data-reveal>
              <Link href="/zona-solutii" className="zs-crumb">Zona Soluții</Link>
              <span className="zs-crumb-sep">/</span>
              <span className="zs-crumb-cur">{typeInfo.label}</span>
            </nav>
            <span className="eyebrow-mono" data-reveal style={stagger(1)}>{story.domain}</span>
            {story.title
              ? <h1 className="zs-title zs-title-long" data-reveal style={stagger(2)}>{story.title}</h1>
              : <h1 className="zs-title" data-reveal style={stagger(2)}><span className="red">Zona</span><br />{story.profession}</h1>}
            <div className="zs-story-intro">
              <p className="zs-headline" data-reveal style={stagger(3)}>{story.headline}</p>
              <p className="zs-sub" data-reveal style={stagger(4)}>{story.excerpt}</p>
            </div>
            <div className="zs-stats" data-reveal style={stagger(5)}>
              {story.heroStats
                ? story.heroStats.map(([v, l]) => (
                  <div key={l} className="zs-stat"><span className="zs-stat-num">{v}</span><span className="zs-stat-label">{l}</span></div>
                ))
                : <>
                  <div className="zs-stat"><span className="zs-stat-num">{n(totalProducts)}</span><span className="zs-stat-label">{story.type === 'meserie' ? 'produse relevante' : 'produse recomandate'}</span></div>
                  <div className="zs-stat"><span className="zs-stat-num">{brands.length}</span><span className="zs-stat-label">branduri</span></div>
                  <div className="zs-stat"><span className="zs-stat-num">{carousels.length}</span><span className="zs-stat-label">familii de produse</span></div>
                </>}
            </div>
            {brands.length > 0 && !story.product && (
              <div className="zs-brands" data-reveal style={stagger(6)}>
                {brands.slice(0, 6).map(b => (
                  <Link key={b.brand_name} href={getBrandHref(b.brand_name)} className="zs-brand">
                    {b.brand_name} <span>{n(b.cnt)}</span>
                  </Link>
                ))}
              </div>
            )}
            <span className="zs-scroll-cue" aria-hidden="true">Derulează <span>↓</span></span>
          </header>

          {heroPhoto && fullBleed({ src: heroPhoto, alt: `${story.title ?? story.profession} — în lucru`, tall: true })}

          {story.sections.map(render)}

          <section className="zs-block zs-end">
            {chapter("Alte soluții")}
            <div className="zs-cards">
              {related.map((r, k) => (
                <Link key={r.slug} href={`/zona-solutii/${r.slug}`} className="zs-card" data-reveal style={stagger(k)}>
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
