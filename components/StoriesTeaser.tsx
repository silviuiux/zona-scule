import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { SOLUTIONS, SOLUTION_TYPES, solutionSubs, type Solution } from '@/lib/solutions'
import StoriesShuffle from './StoriesShuffle'
import { getApplicationImage, getProductDetail } from '@/lib/supabase'

/**
 * "Zona Soluții" teaser above the footer: three stories, a different random
 * three on every visit (the first one large). Every story is in the markup
 * — pages are cached, so the pick happens in the browser (StoriesShuffle);
 * the hidden ones cost nothing, their images are lazy. Covers are the same
 * application photos the stories' own cards use, cached for a day.
 */
const cover = unstable_cache(
  async (slug: string) => {
    const s = SOLUTIONS.find(x => x.slug === slug)
    if (!s) return null
    return s.product
      ? (await getProductDetail(s.product))?.applicationImages[0] ?? null
      : getApplicationImage(solutionSubs(s))
  },
  ['story-cover'],
  { revalidate: 86400 },
)

const typeLabel = (s: Solution) => SOLUTION_TYPES.find(t => t.id === s.type)?.eyebrow ?? ''

export default async function StoriesTeaser() {
  // a fixed order for the server render (the featured story first); the
  // browser reshuffles
  const stories = [...SOLUTIONS].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  const images = await Promise.all(stories.map(s => cover(s.slug).catch(() => null)))

  return (
    <section className="st-teaser" aria-labelledby="st-teaser-title">
      <style>{`
        .st-teaser {
          position: relative; z-index: 1;
          max-width: 1440px; margin: 0 auto;
          padding: clamp(120px, 18vh, 220px) var(--gutter) clamp(120px, 16vh, 200px);
        }
        .st-head {
          display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px;
          align-items: end; margin-bottom: clamp(56px, 8vh, 96px);
        }
        .st-eyebrow {
          grid-column: 1 / -1;
          display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(0,0,0,0.45);
        }
        .st-eyebrow::before { content: ''; width: 24px; height: 1px; background: rgb(217,44,43); }
        .st-title {
          grid-column: 1 / span 7;
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(44px, 5.6vw, 88px); line-height: 0.98; letter-spacing: -0.02em;
          color: rgb(0,0,0);
        }
        .st-title em { font-style: normal; color: rgb(217,44,43); }
        .st-lead {
          grid-column: 9 / span 4;
          font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.7; color: rgba(0,0,0,0.55);
        }
        .st-all {
          display: inline-flex; align-items: center; gap: 10px; margin-top: 20px;
          font-family: 'Oswald', 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgb(0,0,0); text-decoration: none;
          border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; height: 28px; padding: 0 14px;
          transition: border-color 150ms;
        }
        .st-all:hover { border-color: rgba(0,0,0,0.45); }

        .st-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; row-gap: 56px; }
        .st-card { grid-column: span 3; display: none; flex-direction: column; text-decoration: none; color: inherit; }
        .st-card[data-show] { display: flex; }
        .st-card.lead[data-show] { display: grid; }
        .st-card.lead { grid-column: span 6; }
        .st-img {
          position: relative; overflow: hidden; border-radius: 4px;
          aspect-ratio: 4 / 5; background: rgb(236,236,236);
        }
        .st-card.lead .st-img { aspect-ratio: auto; height: 100%; min-height: 420px; }
        .st-img img { transition: transform 900ms cubic-bezier(0.2, 0, 0, 1); }
        .st-card:hover .st-img img { transform: scale(1.04); }
        .st-card.lead { grid-template-rows: 1fr auto; }
        .st-body { padding-top: 24px; display: flex; flex-direction: column; gap: 12px; }
        .st-kind {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: rgb(217,44,43);
        }
        .st-name {
          font-family: 'Neuton', serif; font-size: 28px; line-height: 1.05; letter-spacing: -0.01em; color: rgb(0,0,0);
        }
        .st-card.lead .st-name { font-size: clamp(32px, 3vw, 44px); }
        .st-text {
          font-family: 'Recursive', sans-serif; font-size: 13px; line-height: 1.65; color: rgba(0,0,0,0.55);
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .st-more {
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgb(0,0,0);
        }
        .st-card:hover .st-name { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 1px; }

        @media (max-width: 1024px) {
          .st-title { grid-column: 1 / -1; }
          .st-lead { grid-column: 1 / span 8; margin-top: 24px; }
          .st-card.lead { grid-column: 1 / -1; }
          .st-card { grid-column: span 6; }
          .st-card.lead .st-img { min-height: 0; aspect-ratio: 16 / 10; }
        }
        @media (max-width: 640px) {
          .st-lead { grid-column: 1 / -1; }
          .st-card, .st-card.lead { grid-column: 1 / -1; }
          .st-img { aspect-ratio: 4 / 3; }
        }
      `}</style>

      <div className="st-head">
        <span className="st-eyebrow">Zona Soluții</span>
        <h2 id="st-teaser-title" className="st-title">Cum lucrează <em>profesioniștii</em> și ce scule aleg.</h2>
        <div className="st-lead">
          <p>Povești din meserii și industrie, ghiduri „Cum alegi…”, liste de scule pe proiect și produse prezentate în detaliu.</p>
          <Link href="/zona-solutii" className="st-all">Toate soluțiile <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <StoriesShuffle />
      <div className="st-grid">
        {stories.map((s, i) => (
          <Link key={s.slug} href={`/zona-solutii/${s.slug}`} className={`st-card${i === 0 ? ' lead' : ''}`} data-show={i < 3 ? '' : undefined}>
            <div className="st-img">
              {images[i] && (
                <Image
                  src={images[i]!}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="st-body">
              <span className="st-kind">{typeLabel(s)} · {s.domain}</span>
              <span className="st-name">{s.title ?? s.profession}</span>
              <span className="st-text">{s.excerpt}</span>
              <span className="st-more">Citește →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
