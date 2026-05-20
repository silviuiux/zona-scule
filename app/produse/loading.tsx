/**
 * Skeleton loading UI for /produse.
 * Next.js App Router shows this automatically while page.tsx is fetching data.
 * Mirrors the exact layout (sidebar + 3-col grid) so there's no layout shift.
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
            rgb(232,232,232) 25%,
            rgb(244,244,244) 50%,
            rgb(232,232,232) 75%
          );
          background-size: 600px 100%;
          animation: skel-shimmer 1.5s ease-in-out infinite;
          border-radius: 3px;
        }

        /* ── Page shell (matches catalog-page) ── */
        .skel-page {
          padding-top: 52px;
          background: rgb(244, 244, 244);
          min-height: 100vh;
        }
        .skel-spacer { width: 100%; height: 10vh; min-height: 60px; }

        /* ── Layout (matches catalog-layout) ── */
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
        .skel-header { margin-bottom: 24px; }

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
          background: rgb(255,255,255);
          border-radius: 4px;
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

        @media (max-width: 768px) {
          .skel-sidebar { display: none; }
          .skel-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .skel-main { padding: 20px 12px 60px; }
        }
      `}</style>

      <div className="skel-page">
        <div className="skel-spacer" />

        <div className="skel-layout">
          {/* ── Sidebar skeleton ── */}
          <aside className="skel-sidebar">
            {Array.from({ length: SIDEBAR_ROWS }).map((_, i) => (
              <div key={i} className="skel-sidebar-row">
                {/* Chevron placeholder */}
                <div className="skel" style={{ width: 14, height: 14, flexShrink: 0 }} />
                {/* Label placeholder — vary widths to look natural */}
                <div
                  className="skel"
                  style={{ height: 14, width: `${55 + (i * 17) % 35}%` }}
                />
              </div>
            ))}
          </aside>

          {/* ── Main content skeleton ── */}
          <main className="skel-main">
            {/* Page title */}
            <div className="skel-header">
              <div className="skel" style={{ height: 56, width: '45%', borderRadius: 4 }} />
            </div>

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
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <div className="skel" style={{ height: 12, width: '28%' }} />
                      <div className="skel" style={{ height: 12, width: '22%' }} />
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
