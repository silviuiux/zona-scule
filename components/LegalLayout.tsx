import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { LEGAL_PAGES, ANPC_SAL_URL } from '@/lib/legal-nav'

export type LegalTocItem = { id: string; label: string }

export default function LegalLayout({
  eyebrow,
  title,
  titleRed,
  lastUpdated,
  currentHref,
  toc = [],
  children,
}: {
  eyebrow: string
  title: string
  titleRed?: string
  lastUpdated: string
  currentHref: string
  toc?: LegalTocItem[]
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <style>{`
        .legal-page {
          padding-top: 52px;
          min-height: 100vh;
          background: rgb(244,244,244);
        }
        .legal-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 64px 12px 96px;
        }

        /* ── Header ── */
        .legal-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
          margin-bottom: 14px;
        }
        .legal-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(32px, 4.2vw, 52px);
          line-height: 1.02;
          text-transform: uppercase;
          margin-bottom: 10px;
          max-width: 900px;
        }
        .legal-title .red {
          font-family: 'Bungee Inline', sans-serif;
          color: rgb(217,44,43);
        }
        .legal-updated {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.4);
          margin-bottom: 48px;
        }

        /* ── Grid: sidebar + prose ── */
        .legal-grid {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 56px;
          align-items: start;
        }

        .legal-sidebar {
          position: sticky;
          top: 76px;
          display: flex; flex-direction: column; gap: 28px;
        }
        .legal-sidebar-block { display: flex; flex-direction: column; gap: 2px; }
        .legal-sidebar-title {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.35);
          margin-bottom: 10px;
        }
        .legal-sidebar-link {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; line-height: 1.9;
          color: rgba(0,0,0,0.5);
          text-decoration: none;
          border-left: 2px solid transparent;
          padding-left: 10px;
          transition: color 150ms, border-color 150ms;
        }
        .legal-sidebar-link:hover { color: rgb(0,0,0); }
        .legal-sidebar-link.active {
          color: rgb(217,44,43);
          border-left-color: rgb(217,44,43);
          font-weight: 500;
        }
        .legal-sidebar-external {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.03em;
          color: rgb(217,44,43);
          text-decoration: none;
          padding: 12px 14px;
          background: rgba(217,44,43,0.06);
          border: 1px solid rgba(217,44,43,0.18);
          border-radius: 4px;
          margin-top: 4px;
        }
        .legal-sidebar-external:hover { background: rgba(217,44,43,0.1); }

        /* ── Prose ── */
        .legal-prose {
          max-width: 760px;
          font-family: 'Recursive', sans-serif;
          font-size: 14.5px;
          line-height: 1.75;
          color: rgba(0,0,0,0.75);
        }
        .legal-prose h2 {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgb(0,0,0);
          display: flex; align-items: center; gap: 9px;
          margin: 44px 0 16px;
          scroll-margin-top: 76px;
        }
        .legal-prose h2:first-child { margin-top: 0; }
        .legal-prose h2::before {
          content: '';
          width: 6px; height: 6px; flex-shrink: 0;
          background: rgb(217,44,43);
          border-radius: 1px;
        }
        .legal-prose h3 {
          font-family: 'Recursive', sans-serif;
          font-size: 14.5px; font-weight: 700;
          color: rgb(0,0,0);
          margin: 22px 0 8px;
        }
        .legal-prose p { margin-bottom: 14px; }
        .legal-prose ul, .legal-prose ol {
          margin: 0 0 14px; padding-left: 20px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .legal-prose li::marker { color: rgb(217,44,43); }
        .legal-prose strong { color: rgb(0,0,0); font-weight: 700; }
        .legal-prose a {
          color: rgb(217,44,43);
          text-decoration: underline;
          text-decoration-color: rgba(217,44,43,0.35);
          text-underline-offset: 2px;
        }
        .legal-prose a:hover { text-decoration-color: rgb(217,44,43); }
        .legal-prose table {
          width: 100%; border-collapse: collapse;
          margin: 8px 0 20px;
          font-size: 13px;
        }
        .legal-prose th, .legal-prose td {
          border: 1px solid rgba(0,0,0,0.1);
          padding: 8px 10px; text-align: left; vertical-align: top;
        }
        .legal-prose th {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.04em; text-transform: uppercase;
          background: rgba(0,0,0,0.03);
        }
        .legal-callout {
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          border-left: 3px solid rgb(217,44,43);
          border-radius: 4px;
          padding: 16px 18px;
          margin: 8px 0 20px;
          font-size: 13.5px;
        }
        .legal-callout p:last-child { margin-bottom: 0; }

        @media (max-width: 900px) {
          .legal-grid { grid-template-columns: 1fr; gap: 32px; }
          .legal-sidebar { position: static; flex-direction: row; flex-wrap: wrap; gap: 16px; }
          .legal-sidebar-block { flex: 1 1 220px; }
        }
        @media (max-width: 768px) {
          .legal-inner { padding: 40px 12px 64px; }
        }
      `}</style>

      <div className="legal-page">
        <div className="legal-inner">
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1 className="legal-title">
            {titleRed ? (
              <>
                {title} <span className="red">{titleRed}</span>
              </>
            ) : (
              title
            )}
          </h1>
          <p className="legal-updated">Ultima actualizare: {lastUpdated}</p>

          <div className="legal-grid">
            <aside className="legal-sidebar">
              <div className="legal-sidebar-block">
                <p className="legal-sidebar-title">Pagini legale</p>
                {LEGAL_PAGES.map(p => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className={`legal-sidebar-link${p.href === currentHref ? ' active' : ''}`}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>

              {toc.length > 0 && (
                <div className="legal-sidebar-block">
                  <p className="legal-sidebar-title">Pe această pagină</p>
                  {toc.map(item => (
                    <a key={item.id} href={`#${item.id}`} className="legal-sidebar-link">
                      {item.label}
                    </a>
                  ))}
                </div>
              )}

              <a
                href={ANPC_SAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="legal-sidebar-external"
              >
                Reclamații SAL — ANPC ↗
              </a>
            </aside>

            <div className="legal-prose">{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
