import { CONTACT_MAP as M } from '@/lib/contact-map-data'

const C = M.city
const D = M.detail
// Strada Sfânta Vineri as it runs: the long diagonal past no. 28, then the
// bend south at its lower end (read off the traced street grid)
const SFV = {
  d: 'M104 -138L81 -119L50 -74L31 -53L8 -24L-52 42L-48 49L-38.5 78L-25 108.5L-8 133.5',
  lx: 66, ly: -97, ang: -55,
}
const CHURCH = { at: [60, -58] as [number, number], anchor: 'start' as const, dx: 8, dy: 4 }
// Pitești landmarks for the town view (metres from the shop; north is −y)
const LANDMARKS: { name: string; at: [number, number]; anchor: 'start' | 'middle' | 'end'; dx: number; dy: number }[] = [
  { name: 'CENTRU', at: [-340, 50], anchor: 'end', dx: -8, dy: 4 },
  { name: 'PIAȚA CEAIR', at: [-330, -400], anchor: 'end', dx: -8, dy: 4 },
  { name: 'HOTEL RAMADA', at: [-108, -520], anchor: 'end', dx: -8, dy: 4 },
  { name: 'PARCUL LUNCA ARGEȘULUI', at: [-471, -868], anchor: 'end', dx: -8, dy: 4 },
  { name: 'MALL VIVO!', at: [219, -596], anchor: 'start', dx: 8, dy: 4 },
  { name: 'PARCUL ȘTRAND', at: [320, 60], anchor: 'middle', dx: 0, dy: 16 },
]
import ContactMapScroller from './ContactMapScroller'

/**
 * "Unde ne găsești" — a full-height, scroll-driven drawing instead of a map
 * embed, in the same draughting style as the footer easter egg. While the
 * section is pinned, scrolling:
 *   01  draws Strada Sfânta Vineri alone, the shop and the church on it,
 *   02  pulls the camera out to Pitești (main streets and roads, the Argeș,
 *       the A1, landmarks: centre, Ceair market, Ramada, VIVO, the parks),
 *   03  and out again to Romania (border, national roads, motorways, cities).
 * Every road is black; only the shop's pin is red.
 * Geometry (metres, centred on the shop) lives in lib/contact-map-data.ts;
 * the camera / drawing is driven by ContactMapScroller. The SVG is rendered
 * here on the server so the geometry never ships as JS.
 *
 * Every drawable carries data-s / data-e (its slice of 0..1 scroll progress)
 * and a data-k kind: draw (pathLength=1 dash), fade, or type (text).
 */

const MAPS_URL = 'https://www.google.com/maps/place/Strada+Sf%C3%A2nta+Vineri+28,+110024+Pite%C8%99ti/@44.8577653,24.8792311,17z'

export default function ContactMap() {
  return (
    <section className="cmap" aria-label="Locația Zona Scule: Strada Sfânta Vineri 28, Pitești">
      <style>{`
        .cmap { position: relative; height: 380vh; }
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
        .cmap-svg .st { stroke: rgba(0,0,0,0.26); stroke-width: calc(0.7px * var(--u, 1) * var(--w, 1)); }
        .cmap-svg .st.main { stroke: rgba(0,0,0,0.72); }
        .cmap-svg .d-water { fill: rgba(126,192,222,0.26); stroke: none; }
        .cmap-svg .d-park { fill: rgba(128,196,146,0.16); stroke: none; }
        .cmap-svg .d-minor { stroke: rgba(0,0,0,0.17); stroke-width: calc(0.6px * var(--u, 1)); }
        .cmap-svg .d-art { stroke: rgba(0,0,0,0.3); stroke-width: calc(0.9px * var(--u, 1)); }
        .cmap-svg .d-hw { stroke: rgba(0,0,0,0.4); stroke-width: calc(1.2px * var(--u, 1)); }
        .cmap-svg .d-junction { stroke: rgba(0,0,0,0.42); stroke-width: calc(0.6px * var(--u, 1)); }
        .cmap-svg .d-junction-fill { fill: rgba(0,0,0,0.035); stroke: none; }
        .cmap-svg .sfv { stroke: rgb(0,0,0); stroke-width: calc(2.2px * var(--u, 1)); }
        .cmap-svg .church { fill: none; stroke: rgba(0,0,0,0.6); stroke-width: 1; }
        .cmap-svg .c-road { stroke: rgba(0,0,0,0.3); stroke-width: calc(0.8px * var(--u, 1) * var(--w, 1)); }
        .cmap-svg .c-road.a1 { stroke: rgba(0,0,0,0.5); }
        /* river as two banks: a grey band with a paler core (widths in metres) */
        .cmap-svg .c-river-band { stroke: rgba(0,0,0,0.16); stroke-width: 72; }
        .cmap-svg .c-river-in { stroke: rgb(247,247,247); stroke-width: calc(72px - 2.4px * var(--u, 1)); }
        .cmap-svg .c-river-band.thin { stroke-width: 44; }
        .cmap-svg .c-river-in.thin { stroke-width: calc(44px - 2.4px * var(--u, 1)); }
        .cmap-svg .c-park { stroke: rgba(0,0,0,0.22); stroke-width: calc(0.7px * var(--u, 1)); }
        .cmap-svg .c-park-fill { fill: rgba(0,0,0,0.025); stroke: none; }
        .cmap-svg .poi-dot { fill: rgba(0,0,0,0.45); }
        .cmap-svg text.poi-label { font-size: 9.5px; fill: rgba(0,0,0,0.5); }
        .cmap-svg text.road-label { font-size: 9px; fill: rgba(0,0,0,0.38); }
        .cmap-svg text.water-label { font-size: 9px; font-style: italic; fill: rgba(0,0,0,0.35); letter-spacing: 0.3em; }
        .cmap-svg .water { stroke: rgba(0,0,0,0.18); stroke-width: calc(0.8px * var(--u, 1)); }
        .cmap-svg .river { stroke: rgba(0,0,0,0.24); stroke-width: calc(1px * var(--u, 1)); }
        .cmap-svg .road { stroke: rgba(0,0,0,0.16); stroke-width: calc(0.8px * var(--u, 1)); }
        .cmap-svg .urban { stroke: rgba(0,0,0,0.22); stroke-width: calc(0.8px * var(--u, 1)); stroke-dasharray: none; }
        .cmap-svg .county { stroke: rgba(0,0,0,0.22); stroke-width: calc(0.8px * var(--u, 1)); stroke-dasharray: none; }
        .cmap-svg .ro { stroke: rgba(0,0,0,0.62); stroke-width: calc(1px * var(--u, 1)); }
        .cmap-svg .eu { stroke: rgba(0,0,0,0.15); stroke-width: calc(0.6px * var(--u, 1)); }
        .cmap-svg .mw { fill: none; stroke: rgba(0,0,0,0.7); stroke-width: calc(1.1px * var(--u, 1)); stroke-linecap: round; stroke-linejoin: round; }
        .cmap-svg .dn { stroke: rgba(0,0,0,0.3); stroke-width: calc(0.7px * var(--u, 1)); }
        .cmap-svg .city text { font-size: 9px; }
        .cmap-svg .danube { stroke: rgba(0,0,0,0.18); stroke-width: calc(0.8px * var(--u, 1)); }
        .cmap-svg text {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.12em; fill: rgba(0,0,0,0.4);
          paint-order: stroke; stroke: rgba(255,255,255,0.92); stroke-width: 3px; stroke-linejoin: round;
        }
        .cmap-svg text.main { fill: rgba(217,44,43,0.85); font-weight: 500; }
        .cmap-svg text.big { font-size: 14px; letter-spacing: 0.3em; fill: rgba(0,0,0,0.55); font-weight: 400; }
        .cmap-svg text.red { fill: rgb(217,44,43); }
        .cmap-svg .dot { fill: rgba(0,0,0,0.4); }
        .cmap-svg .pin-ring { fill: none; stroke: rgb(217,44,43); stroke-width: 1; }
        .cmap-svg .pin-dot { fill: rgb(217,44,43); }
        .cmap-svg .pin-cross { stroke: rgba(217,44,43,0.6); stroke-width: 0.8; fill: none; }
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
          .cmap-svg .city text, .cmap-svg text.road-label, .cmap-svg text.water-label { display: none; }
        }
      `}</style>

      <div className="cmap-sticky">
        <ContactMapScroller>
          <svg className="cmap-svg" viewBox="-550 -300 1100 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {/* 03 · Romania: the border, national roads and motorways, cities */}
            <g data-k="fade" data-s="0.66" data-e="0.7">
              <path className="dr ro" pathLength={1} d={M.romania} data-k="draw" data-s="0.7" data-e="0.84" />
              <path className="dr dn" pathLength={1} d={M.nationalRoads} data-k="draw" data-s="0.8" data-e="0.94" />
              <path className="dr mw" pathLength={1} d={M.motorways.open} data-k="draw" data-s="0.82" data-e="0.94" />
              <path className="dr mw" pathLength={1} d={M.motorways.a1open} data-k="draw" data-s="0.8" data-e="0.9" />
              {M.cities.map((c, i) => {
                const s = 0.88 + i * 0.004
                return (
                  <g key={c.n} className="lbl city" data-x={c.at[0]} data-y={c.at[1]} data-k="fade" data-s={s.toFixed(3)} data-e={(s + 0.03).toFixed(3)}>
                    <circle className="dot" r="2.2" />
                    <text x={c.anchor === 'start' ? 7 : -7} y="3" textAnchor={c.anchor as 'start' | 'end'}>{c.n}</text>
                  </g>
                )
              })}
              <g className="lbl" data-x={30000} data-y={-150000}>
                <text className="big" textAnchor="middle" data-k="type" data-s="0.84" data-e="0.9" data-text="ROMÂNIA" />
              </g>
            </g>

            {/* 02 · Pitești: the Argeș, the town's main streets and roads, the A1 */}
            <g data-k="fade" data-s="0.22" data-e="0.26" data-out-s="0.66" data-out-e="0.72">
              <path className="dr river" pathLength={1} d={M.arges} data-k="draw" data-s="0.28" data-e="0.4" />
              <path className="dr d-art" pathLength={1} d={D.arterials} data-k="draw" data-s="0.28" data-e="0.4" />
              <path className="dr d-hw" pathLength={1} d={D.highways} data-k="draw" data-s="0.26" data-e="0.36" />
              <path className="dr mw" pathLength={1} d={D.a1} data-k="draw" data-s="0.26" data-e="0.36" />
              {/* landmarks leave before the camera pulls out to Romania */}
              <g data-k="fade" data-s="0" data-e="0.001" data-out-s="0.6" data-out-e="0.64">
                {LANDMARKS.map((l, i) => {
                  const st = 0.36 + i * 0.012
                  return (
                    <g key={l.name} className="lbl" data-x={l.at[0]} data-y={l.at[1]} data-k="fade" data-s={st.toFixed(3)} data-e={(st + 0.02).toFixed(3)}>
                      <circle className="poi-dot" r="2.4" />
                      <text className="poi-label" x={l.dx} y={l.dy} textAnchor={l.anchor} data-k="type" data-s={st.toFixed(3)} data-e={(st + 0.03).toFixed(3)} data-text={l.name} />
                    </g>
                  )
                })}
                <g className="lbl" data-x={529} data-y={-263} data-a={51}>
                  <text className="road-label" textAnchor="middle" y="-8" data-k="type" data-s="0.34" data-e="0.38" data-text="AUTOSTRADA A1" />
                </g>
                <g className="lbl" data-x={C.argesLabel.lx} data-y={C.argesLabel.ly} data-a={C.argesLabel.ang}>
                  <text className="water-label" textAnchor="middle" y="4" data-k="type" data-s="0.35" data-e="0.39" data-text="RÂUL ARGEȘ" />
                </g>
              </g>
              <g className="lbl" data-x={900} data-y={700}>
                <text className="big" textAnchor="start" data-k="type" data-s="0.38" data-e="0.44" data-text="PITEȘTI" />
              </g>
            </g>

            {/* 01 · Strada Sfânta Vineri: the street, the shop, the church */}
            <g data-k="fade" data-s="0" data-e="0.001">
              <path className="dr sfv" pathLength={1} d={SFV.d} data-k="draw" data-s="0.02" data-e="0.14" />
              <g data-k="fade" data-s="0" data-e="0.001" data-out-s="0.2" data-out-e="0.24">
                <g className="lbl" data-x={SFV.lx} data-y={SFV.ly} data-a={SFV.ang}>
                  <text className="road-label" textAnchor="middle" y="-8" data-k="type" data-s="0.1" data-e="0.16" data-text="STR. SFÂNTA VINERI" />
                </g>
                <g className="lbl" data-x={CHURCH.at[0]} data-y={CHURCH.at[1]} data-k="fade" data-s="0.14" data-e="0.17">
                  <path className="church" d="M0 -9 V-3 M-3 -6.5 H3" />
                  <circle className="poi-dot" r="2.4" />
                  <text className="poi-label" x={CHURCH.dx} y={CHURCH.dy} textAnchor={CHURCH.anchor} data-k="type" data-s="0.15" data-e="0.2" data-text="BISERICA SF. VINERI" />
                </g>
              </g>
            </g>

            {/* the shop — constant size on screen, scaled by the scroller */}
            <g data-role="pin" data-k="fade" data-s="0.06" data-e="0.09">
              <circle className="pin-pulse" r="10" />
              <path className="pin-cross" d="M-16 0 H-7 M7 0 H16 M0 -16 V-7 M0 7 V16" />
              <circle className="pin-ring" r="7" />
              <circle className="pin-dot" r="2.6" />
              <g data-k="fade" data-s="0" data-e="0.001" data-out-s="0.66" data-out-e="0.7">
                <text className="pin-label" x="22" y="-4" data-k="type" data-s="0.08" data-e="0.13" data-text="ZONA SCULE" />
                <text className="pin-sub" x="22" y="11" data-k="type" data-s="0.11" data-e="0.16" data-text="SFÂNTA VINERI 28" />
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
                <span className="on">01 Sfânta Vineri</span>
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
