import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { SOLUTIONS, SOLUTION_TYPES, solutionSubs, type Solution } from '@/lib/solutions'
import StoriesShuffle from './StoriesShuffle'
import { getApplicationImage, getProductDetail } from '@/lib/supabase'

/**
 * "Zona Soluții" teaser above the footer: every story in a carousel that
 * runs off the right edge, wide and narrow cards in turn, in a new random
 * order on every visit — pages are cached, so the shuffle happens in the
 * browser (StoriesShuffle), which also drives the arrows and the counter. Covers are the same
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
          grid-column: 1 / span 9;
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(44px, 5.4vw, 88px); line-height: 0.98; letter-spacing: -0.02em;
          color: rgb(0,0,0);
        }
        .st-title span { display: block; white-space: nowrap; }
        .st-title em { font-style: normal; color: rgb(217,44,43); }
        .st-lead {
          grid-column: 10 / span 3;
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

        /* Carousel: every story, shuffled per visit, wide and narrow cards in
           turn; it runs off the right edge of the page */
        .st-bar { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-bottom: 20px; }
        .st-count { margin-right: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em; color: rgba(0,0,0,0.45); }
        .st-arrow {
          width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.08); border-radius: 4px; cursor: pointer; color: rgb(0,0,0);
          transition: border-color 150ms, opacity 150ms;
        }
        .st-arrow:hover { border-color: rgba(0,0,0,0.3); }
        .st-arrow:disabled { opacity: 0.35; cursor: default; }
        .st-track {
          display: flex; gap: 16px; align-items: flex-start;
          overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth;
          scrollbar-width: none; -ms-overflow-style: none;
          margin-right: calc(50% - 50vw); padding-right: var(--gutter);
        }
        .st-track::-webkit-scrollbar { display: none; }
        .st-card { flex: 0 0 auto; width: clamp(260px, 24vw, 360px); scroll-snap-align: start; display: flex; flex-direction: column; text-decoration: none; color: inherit; }
        .st-card.wide { width: clamp(440px, 50vw, 760px); }
        .st-img {
          position: relative; overflow: hidden; border-radius: 4px;
          height: clamp(360px, 56vh, 560px); background: rgb(236,236,236);
        }
        .st-img img { transition: transform 900ms cubic-bezier(0.2, 0, 0, 1); }
        .st-card:hover .st-img img { transform: scale(1.04); }
        .st-body { padding-top: 24px; display: flex; flex-direction: column; gap: 12px; max-width: 560px; }
        .st-kind {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: rgb(217,44,43);
        }
        .st-name {
          font-family: 'Neuton', serif; font-size: 28px; line-height: 1.05; letter-spacing: -0.01em; color: rgb(0,0,0);
        }
        .st-card.wide .st-name { font-size: clamp(32px, 3vw, 44px); }
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
          .st-title, .st-lead { grid-column: 1 / -1; }
          .st-lead { max-width: 560px; margin-top: 24px; }
        }
        @media (max-width: 640px) {
          .st-title span { white-space: normal; }
          .st-card { width: 72vw; }
          .st-card.wide { width: 86vw; }
          .st-img { height: 52vh; }
          .st-arrow { display: none; }
        }
      `}</style>

      <div className="st-head">
        <span className="st-eyebrow">Zona Soluții</span>
        <h2 id="st-teaser-title" className="st-title"><span>Cum lucrează <em>profesioniștii</em></span><span>și ce aleg.</span></h2>
        <div className="st-lead">
          <p>Povești din meserii și industrie, ghiduri „Cum alegi…”, liste de scule pe proiect și produse prezentate în detaliu.</p>
          <Link href="/zona-solutii" className="st-all">Toate soluțiile <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <StoriesShuffle />
      <div className="st-bar">
        <span className="st-count"><span data-st-pos>01</span> / {String(stories.length).padStart(2, '0')}</span>
        <button type="button" className="st-arrow" data-st-dir="-1" aria-label="Poveștile anterioare">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button type="button" className="st-arrow" data-st-dir="1" aria-label="Poveștile următoare">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
      <div className="st-track">
        {stories.map((s, i) => (
          <Link key={s.slug} href={`/zona-solutii/${s.slug}`} className={`st-card${i % 3 === 0 ? ' wide' : ''}`}>
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
