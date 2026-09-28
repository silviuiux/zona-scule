import { CONTACT_MAP as M } from '@/lib/contact-map-data'
import ContactMapScroller from './ContactMapScroller'

/**
 * "Unde ne găsești" — a full-height, scroll-driven drawing instead of a map
 * embed, in the same draughting style as the footer easter egg. While the
 * section is pinned, scrolling:
 *   01  draws Strada Sfânta Vineri and the streets around no. 28,
 *   02  pulls the camera out to Pitești (urban area, Argeș, main roads,
 *       Argeș county),
 *   03  and out again to Romania's border within Europe.
 * Geometry (metres, centred on the shop) lives in lib/contact-map-data.ts;
 * the camera / drawing is driven by ContactMapScroller. The SVG is rendered
 * here on the server so the geometry never ships as JS.
 *
 * Every drawable carries data-s / data-e (its slice of 0..1 scroll progress)
 * and a data-k kind: draw (pathLength=1 dash), fade, or type (text).
 */

const MAPS_URL = 'https://www.google.com/maps/place/Strada+Sf%C3%A2nta+Vineri+28,+110024+Pite%C8%99ti/@44.8577653,24.8792311,17z'

const CITY_LABELS: [string, keyof typeof M.places, 'start' | 'end'][] = [
  ['BUCUREȘTI', 'Bucharest', 'start'],
  ['CLUJ-NAPOCA', 'Cluj-Napoca', 'end'],
  ['IAȘI', 'Iași', 'start'],
  ['TIMIȘOARA', 'Timișoara', 'start'],
]

export default function ContactMap() {
  return (
    <section className="cmap" aria-label="Locația Zona Scule: Strada Sfânta Vineri 28, Pitești">
      <style>{`
        .cmap { position: relative; height: 340vh; }
        .cmap-sticky {
          position: sticky; top: var(--nav-h);
          height: calc(100vh - var(--nav-h));
          overflow: hidden;
          border-top: 1px solid rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.6);
        }
        .cmap-svg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          /* soft vignette so the drawing dissolves into the page */
          -webkit-mask-image: radial-gradient(ellipse 70% 75% at 58% 50%, #000 55%, transparent 100%);
                  mask-image: radial-gradient(ellipse 70% 75% at 58% 50%, #000 55%, transparent 100%);
        }
        /* --u = metres per screen px, set every frame: keeps line weights and
           type the same on screen whatever the zoom. */
        .cmap-svg .dr { fill: none; stroke-dasharray: 1; stroke-dashoffset: 1; stroke-linecap: round; stroke-linejoin: round; }
        .cmap-svg .st { stroke: rgba(0,0,0,0.42); stroke-width: calc(1px * var(--u, 1) * var(--w, 1)); }
        .cmap-svg .st.main { stroke: rgb(0,0,0); }
        .cmap-svg .water { stroke: rgba(0,0,0,0.3); stroke-width: calc(1px * var(--u, 1)); }
        .cmap-svg .river { stroke: rgba(0,0,0,0.35); stroke-width: calc(1.2px * var(--u, 1)); }
        .cmap-svg .road { stroke: rgba(0,0,0,0.28); stroke-width: calc(1px * var(--u, 1)); }
        .cmap-svg .urban { stroke: rgba(217,44,43,0.55); stroke-width: calc(1px * var(--u, 1)); }
        .cmap-svg .urban-fill { fill: rgba(217,44,43,0.05); stroke: none; }
        .cmap-svg .county { stroke: rgba(0,0,0,0.4); stroke-width: calc(1px * var(--u, 1)); }
        .cmap-svg .ro { stroke: rgb(0,0,0); stroke-width: calc(1.4px * var(--u, 1)); }
        .cmap-svg .ro-fill { fill: rgba(217,44,43,0.06); stroke: none; }
        .cmap-svg .eu { stroke: rgba(0,0,0,0.26); stroke-width: calc(0.8px * var(--u, 1)); }
        .cmap-svg .danube { stroke: rgba(0,0,0,0.3); stroke-width: calc(1px * var(--u, 1)); }
        .cmap-svg text {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 0.12em; fill: rgba(0,0,0,0.5);
          paint-order: stroke; stroke: rgba(255,255,255,0.92); stroke-width: 3px; stroke-linejoin: round;
        }
        .cmap-svg text.main { fill: rgb(217,44,43); font-weight: 500; }
        .cmap-svg text.big { font-size: 15px; letter-spacing: 0.3em; fill: rgba(0,0,0,0.7); font-weight: 500; }
        .cmap-svg text.red { fill: rgb(217,44,43); }
        .cmap-svg .dot { fill: rgba(0,0,0,0.55); }
        .cmap-svg .pin-ring { fill: none; stroke: rgb(217,44,43); stroke-width: 1; }
        .cmap-svg .pin-dot { fill: rgb(217,44,43); }
        .cmap-svg .pin-cross { stroke: rgba(217,44,43,0.8); stroke-width: 1; fill: none; }
        .cmap-svg .pin-pulse { fill: none; stroke: rgba(217,44,43,0.5); stroke-width: 1; transform-box: fill-box; transform-origin: center; animation: cmap-pulse 2.4s ease-out infinite; }
        @keyframes cmap-pulse { from { transform: scale(0.4); opacity: 1; } to { transform: scale(2.2); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .cmap-svg .pin-pulse { animation: none; opacity: 0; } }
        .cmap-svg text.pin-label { font-size: 11px; fill: rgb(217,44,43); font-weight: 500; }
        .cmap-svg text.pin-sub { font-size: 10px; fill: rgba(0,0,0,0.5); }

        /* Overlay */
        .cmap-ui {
          position: absolute; inset: 0; pointer-events: none;
          max-width: 1440px; margin: 0 auto; padding: clamp(28px, 6vh, 64px) var(--gutter);
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .cmap-ui a { pointer-events: auto; }
        .cmap-head { display: flex; flex-direction: column; gap: 14px; max-width: 520px; }
        .cmap-title { font-family: 'Neuton', serif; font-weight: 400; font-size: clamp(34px, 3.4vw, 52px); line-height: 1; letter-spacing: -0.015em; color: rgb(0,0,0); }
        .cmap-foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .cmap-readout { display: flex; flex-direction: column; gap: 12px; }
        .cmap-stages { display: flex; gap: 18px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.3); }
        .cmap-stages span { transition: color 250ms; }
        .cmap-stages span.on { color: rgb(0,0,0); }
        .cmap-stages span.on::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: rgb(217,44,43); margin-right: 8px; vertical-align: 1px; }
        .cmap-scale { display: flex; align-items: center; gap: 12px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.08em; color: rgba(0,0,0,0.55); }
        .cmap-scale-bar { height: 6px; border: 1px solid rgba(0,0,0,0.55); border-top: none; width: 120px; }
        .cmap-coords { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.08em; color: rgba(0,0,0,0.4); }
        .cmap-link {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.1);
          padding: 12px 18px; border-radius: 4px;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transition: border-color 150ms;
        }
        .cmap-link:hover { border-color: rgba(217,44,43,0.35); }
        .cmap-link-text { display: flex; flex-direction: column; gap: 2px; }
        .cmap-link-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
        .cmap-link-action { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 500; color: rgb(0,0,0); }
        .cmap-link:hover .cmap-link-action { color: rgb(217,44,43); }

        @media (max-width: 768px) {
          .cmap { height: 280vh; }
          .cmap-svg { -webkit-mask-image: none; mask-image: none; }
          .cmap-foot { flex-direction: column; align-items: flex-start; }
          .cmap-svg .city text { display: none; }
        }
      `}</style>

      <div className="cmap-sticky">
        <ContactMapScroller>
          <svg className="cmap-svg" viewBox="-550 -300 1100 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {/* 03 · Europe and Romania */}
            <g data-k="fade" data-s="0.58" data-e="0.64">
              <path className="dr eu" pathLength={1} d={M.europe} data-k="draw" data-s="0.66" data-e="0.84" />
              <path className="dr danube" pathLength={1} d={M.danube} data-k="draw" data-s="0.7" data-e="0.8" />
              <path className="ro-fill" d={M.romania} data-k="fade" data-s="0.7" data-e="0.78" />
              <path className="dr ro" pathLength={1} d={M.romania} data-k="draw" data-s="0.6" data-e="0.74" />
              {CITY_LABELS.map(([label, key, anchor], i) => {
                const [x, y] = M.places[key] as readonly [number, number]
                const s = 0.74 + i * 0.008
                return (
                  <g key={key} className="lbl city" data-x={x} data-y={y} data-k="fade" data-s={s.toFixed(3)} data-e={(s + 0.03).toFixed(3)}>
                    <circle className="dot" r="2.5" />
                    <text x={anchor === 'start' ? 9 : -9} y="3.5" textAnchor={anchor}>{label}</text>
                  </g>
                )
              })}
              <g className="lbl" data-x={30000} data-y={-150000}>
                <text className="big" textAnchor="middle" data-k="type" data-s="0.76" data-e="0.82" data-text="ROMÂNIA" />
              </g>
            </g>

            {/* 02 · Pitești and Argeș county */}
            <g data-k="fade" data-s="0.3" data-e="0.36" data-out-s="0.62" data-out-e="0.7">
              <path className="dr county" pathLength={1} d={M.county} data-k="draw" data-s="0.37" data-e="0.5" />
              <path className="dr road" pathLength={1} d={M.roads} data-k="draw" data-s="0.38" data-e="0.5" />
              <path className="dr river" pathLength={1} d={M.arges} data-k="draw" data-s="0.36" data-e="0.46" />
              <path className="urban-fill" d={M.urban} data-k="fade" data-s="0.46" data-e="0.5" />
              <path className="dr urban" pathLength={1} d={M.urban} data-k="draw" data-s="0.34" data-e="0.44" />
              <g className="lbl" data-x={-2500} data-y={4200}>
                <text className="big" textAnchor="end" data-k="type" data-s="0.47" data-e="0.52" data-text="PITEȘTI" />
              </g>
              <g className="lbl" data-x={-19000} data-y={13000}>
                <text data-k="type" data-s="0.5" data-e="0.55" data-text="JUD. ARGEȘ" />
              </g>
              <g className="lbl" data-x={6000} data-y={8500}>
                <text data-k="type" data-s="0.49" data-e="0.53" data-text="R. ARGEȘ" />
              </g>
            </g>

            {/* 01 · the street */}
            <g data-k="fade" data-s="0" data-e="0.001" data-out-s="0.33" data-out-e="0.42">
              <path className="dr water" pathLength={1} d={M.water} data-k="draw" data-s="0.16" data-e="0.24" />
              <g className="lbl" data-x={318} data-y={20} data-k="fade" data-s="0" data-e="0.001" data-out-s="0.28" data-out-e="0.31">
                <text data-k="type" data-s="0.22" data-e="0.26" data-text="ARGEȘ" />
              </g>
              {M.streets.map((st, i) => {
                const s = st.main ? 0.02 : 0.05 + i * 0.012
                return (
                  <path key={st.id} className={`dr st${st.main ? ' main' : ''}`} pathLength={1} d={st.d}
                    style={{ ['--w' as string]: st.w }} data-k="draw" data-s={s.toFixed(3)} data-e={(s + (st.main ? 0.07 : 0.08)).toFixed(3)} />
                )
              })}
              <g data-k="fade" data-s="0" data-e="0.001" data-out-s="0.28" data-out-e="0.31">
              {M.streets.filter(st => st.label).map((st, i) => {
                const s = st.main ? 0.08 : 0.13 + i * 0.01
                return (
                  <g key={st.id} className="lbl" data-x={st.lx} data-y={st.ly} data-a={st.ang}>
                    <text className={st.main ? 'main' : undefined} textAnchor="middle" y="-7" data-k="type" data-s={s.toFixed(3)} data-e={(s + 0.04).toFixed(3)} data-text={st.label} />
                  </g>
                )
              })}
              </g>
              <g transform={`translate(${M.church[0]} ${M.church[1]})`} data-k="fade" data-s="0.2" data-e="0.24">
                <path className="st" d="M0 -5 V5 M-3.5 -1.5 H3.5" style={{ ['--w' as string]: 1.2 }} />
              </g>
            </g>

            {/* the shop — constant size on screen, scaled by the scroller */}
            <g data-role="pin" data-k="fade" data-s="0.02" data-e="0.05">
              <circle className="pin-pulse" r="10" />
              <path className="pin-cross" d="M-16 0 H-7 M7 0 H16 M0 -16 V-7 M0 7 V16" />
              <circle className="pin-ring" r="7" />
              <circle className="pin-dot" r="2.6" />
              <g data-k="fade" data-s="0" data-e="0.001" data-out-s="0.62" data-out-e="0.68">
                <text className="pin-label" x="22" y="-4" data-k="type" data-s="0.05" data-e="0.11" data-text="ZONA SCULE" />
                <text className="pin-sub" x="22" y="11" data-k="type" data-s="0.08" data-e="0.14" data-text="SFÂNTA VINERI 28" />
              </g>
            </g>
          </svg>
        </ContactMapScroller>

        <div className="cmap-ui">
          <div className="cmap-head">
            <span className="eyebrow-mono">Unde ne găsești</span>
            <h2 className="cmap-title">Sfânta Vineri 28, Pitești</h2>
          </div>
          <div className="cmap-foot">
            <div className="cmap-readout">
              <div className="cmap-stages" data-role="stages">
                <span className="on">01 Strada</span>
                <span>02 Pitești</span>
                <span>03 România</span>
              </div>
              <div className="cmap-scale">
                <div className="cmap-scale-bar" data-role="scale-bar" />
                <span data-role="scale-text">100 m</span>
              </div>
              <span className="cmap-coords">44°51′28″N · 24°52′46″E</span>
            </div>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="cmap-link">
              <span className="cmap-link-text">
                <span className="cmap-link-label">Sfânta Vineri 28, Pitești</span>
                <span className="cmap-link-action">Deschide în Google Maps ↗</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
