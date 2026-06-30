import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { ARTICLES, PROFESSIONS, getArticles } from './articles'

// Articles are static content (articles.ts) — no per-request DB hit needed.
// ISR instead of force-dynamic (REBUILD.md §6).
export const revalidate = 3600

type SP = { profesie?: string }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ZonaSolutiiPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const articles = getArticles(sp.profesie)
  const activeProfession = PROFESSIONS.find(p => p.id === sp.profesie)

  return (
    <>
      <Nav />
      <style>{`
        /* ── Hero ── */
        .zs-hero {
          background: var(--surface);
          padding-top: 52px;
          min-height: 52vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .zs-hero-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 40px 24px 56px; width: 100%;
        }

        /* Breadcrumb */
        .zs-bc { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
        .zs-bc-pill {
          font-family: var(--mono); font-size: 11px; font-weight: 500;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: rgba(240,237,231,0.5); text-decoration: none;
          border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 5px 14px;
          transition: color 150ms, border-color 150ms; white-space: nowrap;
        }
        .zs-bc-pill:hover { color: var(--white); border-color: rgba(217,44,43,0.5); }
        .zs-bc-sep { font-family: var(--mono); font-size: 11px; color: rgba(240,237,231,0.25); }
        .zs-bc-cur {
          font-family: var(--mono); font-size: 11px; font-weight: 500;
          letter-spacing: 0.07em; text-transform: uppercase; color: rgba(240,237,231,0.5);
        }

        /* Title */
        .zs-title { display: flex; flex-direction: column; gap: 0; margin-bottom: 28px; line-height: 1; }
        .zs-title-zona {
          font-family: 'Bungee', sans-serif; font-size: clamp(48px, 7vw, 104px);
          color: rgb(217,44,43); text-transform: uppercase; letter-spacing: -0.005em; line-height: 0.95;
        }
        .zs-title-name {
          font-family: 'Bungee', sans-serif; font-size: clamp(48px, 7vw, 104px);
          color: var(--white); text-transform: uppercase; letter-spacing: -0.005em; line-height: 0.95;
        }

        .zs-desc {
          font-family: 'Recursive', sans-serif; font-size: 15px;
          color: rgba(240,237,231,0.5); line-height: 1.6; max-width: 560px; margin: 0 0 36px;
        }

        /* Stats */
        .zs-stats { display: flex; align-items: center; gap: 24px; }
        .zs-stat { display: flex; align-items: baseline; gap: 8px; }
        .zs-stat-num { font-family: 'Bungee', sans-serif; font-size: 22px; color: var(--white); }
        .zs-stat-label {
          font-family: var(--mono); font-size: 10px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase; color: rgba(240,237,231,0.35);
        }
        .zs-stat-div { width: 1px; height: 20px; background: rgba(255,255,255,0.12); }

        /* ── Listing section ── */
        .zs-body {
          background: var(--surface-2); min-height: 60vh;
        }
        .zs-body-inner { max-width: 1440px; margin: 0 auto; padding: 56px 24px 96px; }

        /* Profession filter pills */
        .zs-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 48px; }
        .zs-filter {
          font-family: var(--mono); font-size: 11px; font-weight: 500;
          letter-spacing: 0.07em; text-transform: uppercase;
          padding: 7px 16px; border-radius: 999px; text-decoration: none;
          border: 1px solid rgba(255,255,255,0.14); color: rgba(240,237,231,0.55);
          transition: all 150ms; white-space: nowrap;
        }
        .zs-filter:hover { color: var(--white); border-color: rgba(255,255,255,0.35); }
        .zs-filter.active {
          background: rgb(217,44,43); color: rgb(255,255,255); border-color: rgb(217,44,43);
        }

        /* Article grid */
        .zs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        /* Article card */
        .zs-card {
          background: var(--surface);
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          display: flex; flex-direction: column;
          transition: transform 180ms, box-shadow 180ms, border-color 180ms;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .zs-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
          border-color: rgba(217,44,43,0.35);
        }

        /* Cover */
        .zs-card-cover {
          width: 100%; aspect-ratio: 16/9;
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .zs-card-cover-grad { width: 100%; height: 100%; }

        /* Card body */
        .zs-card-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .zs-card-tag {
          font-family: var(--mono); font-size: 9px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgb(237,70,69); align-self: flex-start;
        }
        .zs-card-title {
          font-family: 'Recursive', sans-serif; font-size: 16px; font-weight: 700;
          color: var(--white); line-height: 1.35; letter-spacing: -0.01em;
          flex: 1;
        }
        .zs-card-excerpt {
          font-family: 'Recursive', sans-serif; font-size: 13px;
          color: rgba(240,237,231,0.5); line-height: 1.55;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .zs-card-meta {
          display: flex; align-items: center; gap: 12px; padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.07); margin-top: auto;
        }
        .zs-card-date {
          font-family: var(--mono); font-size: 10px; font-weight: 500;
          color: rgba(240,237,231,0.35); letter-spacing: 0.03em;
        }
        .zs-card-read {
          font-family: var(--mono); font-size: 10px;
          color: rgba(240,237,231,0.3); margin-left: auto;
        }

        /* Empty state */
        .zs-empty {
          grid-column: 1/-1; text-align: center; padding: 80px 0;
          font-family: 'Recursive', sans-serif; font-size: 15px; color: rgba(240,237,231,0.4);
        }

        /* ── Mobile ── */
        @media (max-width: 900px) { .zs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) {
          .zs-hero-inner { padding: 24px 16px 40px; }
          .zs-title-zona, .zs-title-name { font-size: 40px; }
          .zs-body-inner { padding: 28px 16px 60px; }
          .zs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── White hero ── */}
      <div className="zs-hero">
        <div className="zs-hero-inner">
          {/* Breadcrumb */}
          <nav className="zs-bc">
            <Link href="/" className="zs-bc-pill">Acasă</Link>
            <span className="zs-bc-sep">/</span>
            {activeProfession ? (
              <>
                <Link href="/zona-solutii" className="zs-bc-pill">Zona Soluții</Link>
                <span className="zs-bc-sep">/</span>
                <span className="zs-bc-cur">{activeProfession.label}</span>
              </>
            ) : (
              <span className="zs-bc-cur">Zona Soluții</span>
            )}
          </nav>

          {/* Title */}
          <div className="zs-title">
            <span className="zs-title-zona">ZONA</span>
            <span className="zs-title-name">SOLUȚII</span>
          </div>

          <p className="zs-desc">
            Ghiduri practice, comparații și inspirație pentru profesioniști. Descoperă uneltele
            potrivite meseriei tale și lucrează mai bine cu fiecare job.
          </p>

          {/* Stats */}
          <div className="zs-stats">
            <div className="zs-stat">
              <span className="zs-stat-num">{articles.length}</span>
              <span className="zs-stat-label">{articles.length === 1 ? 'Articol' : 'Articole'}</span>
            </div>
            <div className="zs-stat-div" />
            <div className="zs-stat">
              <span className="zs-stat-num">{PROFESSIONS.length}</span>
              <span className="zs-stat-label">Profesii</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gray listing ── */}
      <div className="zs-body">
        <div className="zs-body-inner">

          {/* Profession filter pills */}
          <div className="zs-filters">
            <Link
              href="/zona-solutii"
              className={`zs-filter${!sp.profesie ? ' active' : ''}`}
            >
              Toate
            </Link>
            {PROFESSIONS.map(p => (
              <Link
                key={p.id}
                href={`/zona-solutii?profesie=${p.id}`}
                className={`zs-filter${sp.profesie === p.id ? ' active' : ''}`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          {/* Article grid */}
          <div className="zs-grid">
            {articles.length === 0 && (
              <div className="zs-empty">Nu există articole pentru această categorie încă.</div>
            )}
            {articles.map(article => {
              const profession = PROFESSIONS.find(p => p.id === article.profession)
              return (
                <Link key={article.slug} href={`/zona-solutii/${article.slug}`} className="zs-card">
                  {/* Cover */}
                  <div className="zs-card-cover">
                    <div
                      className="zs-card-cover-grad"
                      style={{ background: article.coverGradient }}
                    />
                  </div>

                  {/* Body */}
                  <div className="zs-card-body">
                    {profession && (
                      <span className="zs-card-tag">{profession.label}</span>
                    )}
                    <span className="zs-card-title">{article.title}</span>
                    <span className="zs-card-excerpt">{article.excerpt}</span>
                    <div className="zs-card-meta">
                      <span className="zs-card-date">{formatDate(article.publishedAt)}</span>
                      <span className="zs-card-read">{article.readMinutes} min citit</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
