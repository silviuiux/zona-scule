/**
 * Skeleton loading UI for /produse.
 * Next.js App Router shows this automatically while page.tsx is fetching data.
 * Mirrors the new layout: white hero section + gray sidebar/grid section.
 */
export default function Loading() {
  const SIDEBAR_ROWS = 14
  const CARD_COUNT   = 9   // 3 rows of 3

  return (
    <>
      <style>{`
        /* ── Shimmer keyframe ── */
        @keyframes skel-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skel {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.05) 25%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0.05) 75%
          );
          background-size: 600px 100%;
          animation: skel-shimmer 1.5s ease-in-out infinite;
          border-radius: 3px;
        }

        /* ── Hero section (dark) ── */
        .skel-hero {
          background: var(--surface);
          padding-top: 52px;
          min-height: 56vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .skel-hero-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 12px 56px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Breadcrumb pills */
        .skel-breadcrumb {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          align-items: center;
        }

        /* Title block */
        .skel-title {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        /* Description lines */
        .skel-desc {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 28px;
        }

        /* Stats row */
        .skel-stats {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .skel-stat {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        /* ── Dark listing section ── */
        .skel-page {
          background: var(--surface-2);
          min-height: 60vh;
        }
        .skel-layout {
          display: flex;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 12px;
        }

        /* ── Sidebar ── */
        .skel-sidebar {
          width: 280px; flex-shrink: 0;
          padding: 32px 16px 40px 24px;
        }
        .skel-sidebar-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 0;
        }

        /* ── Main ── */
        .skel-main { flex: 1; padding: 32px 32px 80px; min-width: 0; }

        /* Subcategory pill bar placeholder */
        .skel-pills {
          display: flex; gap: 8px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        /* ── Product card skeleton ── */
        .skel-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .skel-card {
          background: var(--surface-2);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
        }
        .skel-card-img {
          aspect-ratio: 1;
          width: 100%;
        }
        .skel-card-body {
          padding: 16px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .skel-card-specs {
          display: flex; gap: 6px; margin-top: 4px;
        }
        .skel-card-spec {
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          padding: 8px 10px;
          display: flex; flex-direction: column; gap: 4px;
        }

        @media (max-width: 768px) {
          .skel-hero { min-height: auto; }
          .skel-hero-inner { padding: 24px 12px 40px; }
          .skel-sidebar { display: none; }
          .skel-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .skel-main { padding: 20px 12px 60px; }
        }
      `}</style>

      {/* ── White hero skeleton ── */}
      <div className="skel-hero">
        <div className="skel-hero-inner">
          {/* Breadcrumb */}
          <div className="skel-breadcrumb">
            {[70, 8, 120].map((w, i) =>
              i === 1
                ? <div key={i} style={{ width: 8, height: 12, color: 'rgba(240,237,231,0.25)', fontSize: 12, fontFamily: 'sans-serif', display: 'flex', alignItems: 'center' }}>/</div>
                : <div key={i} className="skel" style={{ height: 26, width: w, borderRadius: 999 }} />
            )}
          </div>

          {/* Title — two Bungee lines */}
          <div className="skel-title">
            <div className="skel" style={{ height: 72, width: '15%', borderRadius: 4 }} />
            <div className="skel" style={{ height: 72, width: '48%', borderRadius: 4 }} />
          </div>

          {/* Description lines */}
          <div className="skel-desc">
            <div className="skel" style={{ height: 14, width: '44%' }} />
            <div className="skel" style={{ height: 14, width: '32%' }} />
          </div>

          {/* Stats */}
          <div className="skel-stats">
            <div className="skel-stat">
              <div className="skel" style={{ height: 24, width: 60, borderRadius: 3 }} />
              <div className="skel" style={{ height: 10, width: 52, borderRadius: 2 }} />
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />
            <div className="skel-stat">
              <div className="skel" style={{ height: 24, width: 36, borderRadius: 3 }} />
              <div className="skel" style={{ height: 10, width: 60, borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Gray listing skeleton ── */}
      <div className="skel-page">
        <div className="skel-layout">
          {/* ── Sidebar skeleton ── */}
          <aside className="skel-sidebar">
            {Array.from({ length: SIDEBAR_ROWS }).map((_, i) => (
              <div key={i} className="skel-sidebar-row">
                <div className="skel" style={{ width: 14, height: 14, flexShrink: 0 }} />
                <div
                  className="skel"
                  style={{ height: 14, width: `${55 + (i * 17) % 35}%` }}
                />
              </div>
            ))}
          </aside>

          {/* ── Main content skeleton ── */}
          <main className="skel-main">
            {/* Subcategory pills */}
            <div className="skel-pills">
              {[88, 140, 120, 100, 130].map((w, i) => (
                <div
                  key={i}
                  className="skel"
                  style={{ height: 36, width: w, borderRadius: 999, flexShrink: 0 }}
                />
              ))}
            </div>

            {/* Product grid */}
            <div className="skel-grid">
              {Array.from({ length: CARD_COUNT }).map((_, i) => (
                <div key={i} className="skel-card">
                  <div className="skel skel-card-img" />
                  <div className="skel-card-body">
                    <div className="skel" style={{ height: 13, width: '38%' }} />
                    <div className="skel" style={{ height: 13, width: '72%' }} />
                    <div className="skel-card-specs">
                      <div className="skel-card-spec">
                        <div className="skel" style={{ height: 9, width: 44 }} />
                        <div className="skel" style={{ height: 13, width: 56 }} />
                      </div>
                      <div className="skel-card-spec">
                        <div className="skel" style={{ height: 9, width: 36 }} />
                        <div className="skel" style={{ height: 13, width: 48 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
