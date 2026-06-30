/**
 * Skeleton loading UI for /produse/[slug] (PDP).
 * Shown automatically by Next.js App Router while the product data is being fetched.
 * Mirrors the actual PDP layout: white top section (left info + right image) + dark specs section.
 */
export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes pdp-shimmer {
          0%   { background-position: -700px 0; }
          100% { background-position:  700px 0; }
        }
        /* Paper shimmer — for the product-image mount only */
        .ps {
          background: linear-gradient(
            90deg,
            rgb(232,230,226) 25%,
            rgb(244,242,238) 50%,
            rgb(232,230,226) 75%
          );
          background-size: 700px 100%;
          animation: pdp-shimmer 1.5s ease-in-out infinite;
          border-radius: 3px;
        }
        /* Dark shimmer — for dark bg sections */
        .ps-dark {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.07) 25%,
            rgba(255,255,255,0.13) 50%,
            rgba(255,255,255,0.07) 75%
          );
          background-size: 700px 100%;
          animation: pdp-shimmer 1.5s ease-in-out infinite;
          border-radius: 3px;
        }

        /* Page shell */
        .pdp-skel { padding-top: 52px; background: var(--surface-2); }

        /* ── Top section ── */
        .pdp-skel-top {
          background: var(--surface);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .pdp-skel-top-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 40px 12px 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        /* Left column */
        .pdp-skel-left { display: flex; flex-direction: column; gap: 0; }
        .pdp-skel-breadcrumbs {
          display: flex; gap: 8px; margin-bottom: 32px;
        }
        .pdp-skel-meta { margin-bottom: 8px; }
        .pdp-skel-title { margin-bottom: 16px; }
        .pdp-skel-desc { margin-bottom: 40px; display: flex; flex-direction: column; gap: 8px; }
        .pdp-skel-sku { margin-bottom: 24px; }
        .pdp-skel-cta { border-radius: 2px; }

        /* Right column — image area (kept on a paper mount, like the real photo) */
        .pdp-skel-img-wrap {
          aspect-ratio: 1;
          max-width: 520px;
          width: 100%;
          justify-self: center;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }

        /* ── Specs section ── */
        .pdp-skel-specs {
          background: var(--surface-2);
          padding: 96px 0;
        }
        .pdp-skel-specs-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 0 12px;
        }
        .pdp-skel-specs-label { margin-bottom: 40px; }
        .pdp-skel-specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .pdp-skel-spec-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 28px 24px;
          display: flex; flex-direction: column; gap: 16px;
        }

        @media (max-width: 768px) {
          .pdp-skel-top-inner {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 24px 12px 40px;
          }
          .pdp-skel-specs-grid { grid-template-columns: 1fr; }
          .pdp-skel-img-wrap { order: -1; }
        }
      `}</style>

      <div className="pdp-skel">
        {/* ── White top section ── */}
        <div className="pdp-skel-top">
          <div className="pdp-skel-top-inner">
            {/* Left: info */}
            <div className="pdp-skel-left">
              {/* Breadcrumbs */}
              <div className="pdp-skel-breadcrumbs">
                {[60, 80, 100].map((w, i) => (
                  <div key={i} className="ps-dark" style={{ height: 28, width: w, borderRadius: 999 }} />
                ))}
              </div>

              {/* Brand */}
              <div className="pdp-skel-meta">
                <div className="ps-dark" style={{ height: 18, width: 90 }} />
              </div>

              {/* Product title */}
              <div className="pdp-skel-title" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <div className="ps-dark" style={{ height: 40, width: '90%' }} />
                <div className="ps-dark" style={{ height: 40, width: '65%' }} />
              </div>

              {/* Description */}
              <div className="pdp-skel-desc">
                <div className="ps-dark" style={{ height: 14, width: '100%' }} />
                <div className="ps-dark" style={{ height: 14, width: '88%' }} />
                <div className="ps-dark" style={{ height: 14, width: '72%' }} />
              </div>

              {/* SKU */}
              <div className="pdp-skel-sku">
                <div className="ps-dark" style={{ height: 36, width: 160, borderRadius: 8 }} />
              </div>

              {/* CTA button */}
              <div className="ps-dark pdp-skel-cta" style={{ height: 48, width: '100%', maxWidth: 460, borderRadius: 8 }} />
            </div>

            {/* Right: image */}
            <div className="pdp-skel-img-wrap">
              <div className="ps" style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* ── Dark specs section ── */}
        <div className="pdp-skel-specs">
          <div className="pdp-skel-specs-inner">
            {/* Section label */}
            <div className="pdp-skel-specs-label">
              <div className="ps-dark" style={{ height: 12, width: 160 }} />
            </div>

            {/* 3 spec cards */}
            <div className="pdp-skel-specs-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="pdp-skel-spec-card">
                  <div className="ps-dark" style={{ height: 13, width: '55%' }} />
                  <div className="ps-dark" style={{ height: 40, width: '70%' }} />
                  <div className="ps-dark" style={{ height: 13, width: '40%' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
