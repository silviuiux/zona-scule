/**
 * Skeleton loading UI for /produse.
 * Next.js App Router shows this automatically while page.tsx is fetching data.
 *
 * Mirrors the CURRENT default layout — CatalogLayout's "pills" mode
 * (ViewModeContext defaults to 'pills' for anyone without a saved
 * preference in localStorage): a filter row of 4 equal cells (view
 * switcher + brand/category/subcategory dropdowns) and a 4-column product
 * grid, no persistent sidebar. The old vertical Sidebar.tsx list is still
 * available behind the view-switcher toggle, but is no longer the default
 * — this skeleton previously mirrored that legacy sidebar layout, which
 * made the loading preview mismatch what most visitors actually land on.
 */
export default function Loading() {
  const CARD_COUNT = 12 // 3 rows of 4, matching the pills-mode grid

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

        /* ── Hero section (white) ── */
        .skel-hero {
          background: rgb(255, 255, 255);
          padding-top: 52px;
          min-height: 62vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-bottom: 1px solid rgba(0,0,0,0.07);
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

        /* ── Gray listing section ── */
        .skel-page {
          background: rgb(244, 244, 244);
          min-height: 60vh;
        }
        .skel-layout {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 12px;
        }

        /* ── Filter row — view switcher + 3 dropdowns, 4 equal cells,
             matches CatalogLayout's ".filter-row" grid exactly. ── */
        .skel-filter-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 32px 0 16px;
        }
        .skel-filter-cell {
          height: 40px;
          border-radius: 8px;
        }

        /* ── Main ── */
        .skel-main { padding: 0 0 80px; min-width: 0; }

        /* Subcategory pill bar placeholder */
        .skel-pills {
          display: flex; gap: 8px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        /* ── Product card skeleton — 4 columns, matching pills-mode ── */
        .skel-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .skel-card {
          background: rgb(255,255,255);
          border-radius: 8px;
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
          background: rgb(238,238,238);
          border-radius: 4px;
          padding: 8px 10px;
          display: flex; flex-direction: column; gap: 4px;
        }

        @media (max-width: 768px) {
          .skel-hero { min-height: auto; }
          .skel-hero-inner { padding: 24px 12px 40px; }
          /* Dropdown filter row is desktop-only in reality — mobile always
             uses the drawer + pill bar regardless of stored view mode. */
          .skel-filter-row { display: none; }
          .skel-main { padding: 20px 12px 60px; }
          .skel-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>

      {/* ── White hero skeleton ── */}
      <div className="skel-hero">
        <div className="skel-hero-inner">
          {/* Breadcrumb */}
          <div className="skel-breadcrumb">
            {[70, 8, 120].map((w, i) =>
              i === 1
                ? <div key={i} style={{ width: 8, height: 12, color: 'rgba(0,0,0,0.2)', fontSize: 12, fontFamily: 'sans-serif', display: 'flex', alignItems: 'center' }}>/</div>
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
            <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.1)' }} />
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
          <main className="skel-main">
            {/* Filter row — view switcher + brand/category/subcategory dropdowns */}
            <div className="skel-filter-row">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skel skel-filter-cell" />
              ))}
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
