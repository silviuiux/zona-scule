'use client'
import { useEffect, useRef, useSyncExternalStore } from 'react'

/**
 * Homepage easter egg. Once the page is scrolled all the way to the bottom,
 * further wheel (or touch) scrolling looks like it does nothing — but after
 * a short dead zone it starts drafting a technical drawing, driven by how
 * far you keep scrolling:
 *
 *  • the footer eases from 80vh up to fill the screen below the nav (only
 *    the gap between logo and link columns grows; the page stays pinned to
 *    the bottom, so the logo rises while the columns stay put) and faint
 *    drafting-grid paper fades in;
 *  • a red "pen" crosshair traces the drawing line by line while labels
 *    type themselves out; the title block fills in under the logo;
 *  • a finale plays, then an "APROBAT" stamp with today's date lands.
 *
 * Two drawings, both at 1:1 (their SVGs are sized in CSS millimetres and
 * the viewBox units are mm):
 *  - "nail" (default): a Ø3,1 × 100 nail standing on a board section, which
 *    a hammer then drives in over four scroll-driven hits until only the
 *    head is left above the surface; finale: the camera zooms into
 *    detail A at 5:1.
 *  - "blade" (?egg=blade): a Ø216 × 30 circular saw blade that turns as you
 *    scroll; finale: a spin-up test run.
 *
 * Every drawable carries data-s / data-e — its slice of the 0..1 progress —
 * and a data-k kind: draw (stroke-dashoffset, pathLength=1), grow (scale
 * along data-axis), pop (scale, arrowheads), fade (opacity; data-dir="out"
 * to fade away) or type (text).
 */
const DEAD_ZONE = 500 // px of extra scrolling that "does nothing" first
const RANGE = 2800 // px of extra scrolling from blank to fully drawn
const GROW_END = 0.2 // progress by which the footer has grown to full height

type Variant = 'nail' | 'blade'
type Kind = 'draw' | 'grow' | 'pop' | 'fade' | 'type'
type Item = { el: SVGGraphicsElement; s: number; e: number; kind: Kind; text: string; len: number; out: boolean; wrap: SVGGElement | null }

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInQuad = (t: number) => t * t
const clamp01 = (t: number) => Math.max(0, Math.min(1, t))

// ── Shared drawing helpers (mm) ──────────────────────────────────────────────
const f2 = (v: number) => v.toFixed(2)
const circle = (x: number, y: number, r: number) =>
  `M${f2(x + r)} ${f2(y)} A${r} ${r} 0 1 0 ${f2(x - r)} ${f2(y)} A${r} ${r} 0 1 0 ${f2(x + r)} ${f2(y)}`
// Arrowhead with its tip at (x, y), pointing along (dx, dy).
const arrow = (x: number, y: number, dx: number, dy: number, len = 2.2, half = 0.7) => {
  const m = Math.hypot(dx, dy)
  const ux = dx / m, uy = dy / m
  const bx = x - ux * len, by = y - uy * len
  return `M${f2(x)} ${f2(y)} L${f2(bx - uy * half)} ${f2(by + ux * half)} L${f2(bx + uy * half)} ${f2(by - ux * half)} Z`
}
const PX = 0.2646 // 1 CSS px in mm
// The pen crosshair, drawn in px (scaled into mm on the drawings).
const Pen = ({ scale = 1 }: { scale?: number }) => (
  <g className="pen-wrap">
    <g className="head">
      <g transform={scale === 1 ? undefined : `scale(${scale})`}>
        <path d="M-8 0 H-3.5 M3.5 0 H8 M0 -8 V-3.5 M0 3.5 V8" />
        <circle r="1.8" />
      </g>
    </g>
  </g>
)
// Drafting-grid paper (5 mm / 25 mm), faded towards the edges.
const Paper = ({ x, y, w, h, cx, cy, r }: { x: number; y: number; w: number; h: number; cx: number; cy: number; r: number }) => (
  <>
    <defs>
      <pattern id="zs-bp-minor" width="5" height="5" patternUnits="userSpaceOnUse">
        <path className="grid-minor" d="M5 0 H0 V5" />
      </pattern>
      <pattern id="zs-bp-major" width="25" height="25" patternUnits="userSpaceOnUse" x={cx} y={cy}>
        <rect width="25" height="25" fill="url(#zs-bp-minor)" />
        <path className="grid-major" d="M25 0 H0 V25" />
      </pattern>
      <radialGradient id="zs-bp-fade" cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
        <stop offset="0.55" stopColor="#fff" />
        <stop offset="1" stopColor="#000" />
      </radialGradient>
      <mask id="zs-bp-mask">
        <rect x={x} y={y} width={w} height={h} fill="url(#zs-bp-fade)" />
      </mask>
    </defs>
    <rect className="paper" x={x} y={y} width={w} height={h} fill="url(#zs-bp-major)" mask="url(#zs-bp-mask)" data-k="fade" data-s="0.02" data-e="0.12" />
  </>
)

// ════════════════════════════════════════════════════════════════════════════
// Nail
// ════════════════════════════════════════════════════════════════════════════
const NAIL_S = { x: 72, y: 170 } // where the point meets the board surface
const NAIL_TILT = 28 // degrees from vertical, head leaning right
const NAIL_DEPTHS = [0, 30, 58, 80, 94] // mm driven in after each hit (nail is 100 long)
const HIT_START = 0.6
const HIT_SPAN = 0.075
const HAMMER_REST = 12 // mm above the head between hits
const HAMMER_WINDUP = 45
const NAIL_ZOOM = 5
const NAIL_FRAME_Y = 0.38 // where detail A sits in the close-up (fraction of frame height) — clear of the columns
const nailTransform = (depth: number) => `translate(${NAIL_S.x} ${NAIL_S.y}) rotate(${NAIL_TILT}) translate(0 ${f2(depth - 100)})`
// Detail A: just above the surface, where the head ends up.
const NAIL_DETAIL = (() => {
  const a = (NAIL_TILT * Math.PI) / 180
  return { x: NAIL_S.x + 3 * Math.sin(a), y: NAIL_S.y - 3 * Math.cos(a) }
})()
const BOARD_HATCH = (() => {
  let d = ''
  for (let x0 = -20; x0 <= 176; x0 += 4) d += `M${x0} 196 L${x0 + 26} 170 `
  return d.trim()
})()
const NAIL_OUTLINE = 'M-1.55 0 V94 L0 100 L1.55 94 V0'

// Hammer gap above the head and nail depth for scroll progress p. Each hit:
// wind up, strike (accelerating), drive the nail in, lift back to rest.
function nailState(p: number) {
  let depth = 0
  let gap = HAMMER_REST
  for (let k = 0; k < NAIL_DEPTHS.length - 1; k++) {
    const a = HIT_START + k * HIT_SPAN
    if (p >= a + HIT_SPAN) { depth = NAIL_DEPTHS[k + 1]; gap = HAMMER_REST; continue }
    if (p < a) break
    const u = (p - a) / HIT_SPAN
    const d0 = NAIL_DEPTHS[k], d1 = NAIL_DEPTHS[k + 1]
    if (u < 0.5) { depth = d0; gap = HAMMER_REST + (HAMMER_WINDUP - HAMMER_REST) * easeOutCubic(u / 0.5) }
    else if (u < 0.7) { depth = d0; gap = HAMMER_WINDUP * (1 - easeInQuad((u - 0.5) / 0.2)) }
    else if (u < 0.8) { depth = d0 + (d1 - d0) * easeOutCubic((u - 0.7) / 0.1); gap = 0 }
    else { depth = d1; gap = HAMMER_REST * easeOutCubic((u - 0.8) / 0.2) }
    break
  }
  return { depth, gap }
}

function NailArt() {
  const t0 = nailTransform(0)
  const armL = { tip: [1.55, 60], knee: [14, 52] }
  const armH = { tip: [3.5, -0.8], knee: [12, -10] }
  return (
    <svg className="bp-art bp-nail" viewBox="0 0 180 200">
      <Paper x={-20} y={-20} w={220} h={240} cx={NAIL_S.x} cy={NAIL_S.y} r={150} />
      <defs>
        <clipPath id="zs-bp-board"><rect x="10" y="170" width="166" height="26" /></clipPath>
        <clipPath id="zs-bp-above"><rect x="-40" y="-80" width="260" height="250" /></clipPath>
        <clipPath id="zs-bp-below"><rect x="-40" y="170" width="260" height="80" /></clipPath>
      </defs>

      {/* board section: surface, edges with a break line, 45° hatch */}
      <path className="ln strong" pathLength={1} d="M6 170 H176" data-k="draw" data-s="0.06" data-e="0.13" />
      <path className="ln" pathLength={1} d="M176 170 V196 H10 L12.5 190 L8.5 184 L12.5 178 L8.5 173 L10 170" data-k="draw" data-s="0.12" data-e="0.18" />
      <g clipPath="url(#zs-bp-board)">
        <path className="ln thin" pathLength={1} d={BOARD_HATCH} data-k="draw" data-s="0.16" data-e="0.26" />
      </g>

      {/* the part of the nail inside the board, as a hidden (dashed) line */}
      <g className="hidden-part" clipPath="url(#zs-bp-below)" data-k="fade" data-s="0.62" data-e="0.66">
        <g data-role="nail" transform={t0}>
          <path className="hid" d={NAIL_OUTLINE} />
        </g>
      </g>

      <g clipPath="url(#zs-bp-above)">
        <g data-role="nail" transform={t0}>
          <line className="cl" x1="0" y1="-10" x2="0" y2="108" data-axis="y" data-k="grow" data-s="0.2" data-e="0.26" />
          <path className="ln strong" pathLength={1} d="M-3.5 -1.2 H3.5 V0 H-3.5 Z" data-k="draw" data-s="0.26" data-e="0.3" />
          <path className="ln strong" pathLength={1} d={NAIL_OUTLINE} data-k="draw" data-s="0.29" data-e="0.4" />

          {/* dimensions — fade away before the hammer comes in */}
          <g data-k="fade" data-dir="out" data-s="0.58" data-e="0.61">
            <path className="ln thin" pathLength={1} d="M-3.5 -1.2 H-12 M0 100 H-12" data-k="draw" data-s="0.4" data-e="0.42" />
            <path className="ln dim" pathLength={1} d="M-10 -1.2 V100" data-k="draw" data-s="0.42" data-e="0.46" />
            <path className="arrow" d={arrow(-10, -1.2, 0, -1)} data-k="pop" data-s="0.45" data-e="0.47" />
            <path className="arrow" d={arrow(-10, 100, 0, 1)} data-k="pop" data-s="0.44" data-e="0.46" />
            <text className="red" textAnchor="middle" transform="translate(-11.2 50) rotate(-90)" data-k="type" data-s="0.46" data-e="0.49" data-text="L 100" />

            <path className="ln dim" pathLength={1} d={`M${armL.knee[0]} ${armL.knee[1]} L${armL.tip[0]} ${armL.tip[1]} M${armL.knee[0]} ${armL.knee[1]} H20`} data-k="draw" data-s="0.48" data-e="0.5" />
            <path className="arrow" d={arrow(armL.tip[0], armL.tip[1], armL.tip[0] - armL.knee[0], armL.tip[1] - armL.knee[1])} data-k="pop" data-s="0.495" data-e="0.51" />
            <text x="21" y="51.4" className="red" data-k="type" data-s="0.5" data-e="0.52" data-text="Ø 3,1" />

            <path className="ln dim" pathLength={1} d={`M${armH.knee[0]} ${armH.knee[1]} L${armH.tip[0]} ${armH.tip[1]} M${armH.knee[0]} ${armH.knee[1]} H18`} data-k="draw" data-s="0.51" data-e="0.53" />
            <path className="arrow" d={arrow(armH.tip[0], armH.tip[1], armH.tip[0] - armH.knee[0], armH.tip[1] - armH.knee[1])} data-k="pop" data-s="0.525" data-e="0.54" />
            <text x="19" y="-10.6" className="red" data-k="type" data-s="0.53" data-e="0.55" data-text="Ø 7" />
          </g>

          {/* impact flash at the hammer face */}
          <path data-role="sparks" className="sparks" d="M-14.5 -1.6 L-19.5 -3.8 M-14.5 -0.4 L-20 0.8 M-12 0.4 L-14.5 3 M14.5 -1.6 L19.5 -3.8 M14.5 -0.4 L20 0.8 M12 0.4 L14.5 3" />

          {/* hammer: head block with a chamfered face, handle running off-frame */}
          <g data-k="fade" data-dir="out" data-s="0.9" data-e="0.94">
            <g data-role="hammer" transform={`translate(0 ${-HAMMER_REST})`}>
              <path className="ln strong" pathLength={1} d="M-14 -65.2 H14 V-4.2 L11 -1.2 H-11 L-14 -4.2 Z" data-k="draw" data-s="0.54" data-e="0.58" />
              <path className="ln" pathLength={1} d="M-14 -52 H14 M-14 -14 H14" data-k="draw" data-s="0.565" data-e="0.585" />
              <path className="ln" pathLength={1} d="M14 -41.2 H160 M14 -25.2 H160" data-k="draw" data-s="0.57" data-e="0.6" />
            </g>
          </g>
        </g>
      </g>

      {/* detail A, drawn once the nail is in */}
      <path className="ln dim" pathLength={1} d={circle(NAIL_DETAIL.x, NAIL_DETAIL.y, 14)} data-k="draw" data-s="0.92" data-e="0.96" />
      <text data-role="detail-label" x={f2(NAIL_DETAIL.x + 11)} y={f2(NAIL_DETAIL.y - 11.5)} className="red big-label" data-k="type" data-s="0.95" data-e="0.97" data-text="A" />

      <Pen scale={PX} />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Circular saw blade
// ════════════════════════════════════════════════════════════════════════════
const C = 108 // centre
const R = 108 // tooth-tip radius (Ø216)
const TEETH = 48
const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
const pt = (r: number, deg: number) => polar(r, deg).map(f2).join(' ')
// Rim: steep cutting face up to a flat carbide tip, clearance back, gullet.
// Faces lead in the direction of decreasing angle → the blade turns CCW.
const TEETH_PATH = (() => {
  let d = `M${pt(100, 0)}`
  for (let i = 0; i < TEETH; i++) {
    const a = (i * 360) / TEETH
    d += ` L${pt(R, a + 1.2)} L${pt(R, a + 2.4)} L${pt(103.5, a + 6.2)} Q${pt(100.4, a + 7.3)} ${pt(100, a + 7.5)}`
  }
  return d + ' Z'
})()
// Leader from a point on the blade out along `deg`, then a short shoulder left.
const leader = (fromR: number, deg: number) => {
  const [px, py] = polar(fromR, deg)
  const [qx, qy] = polar(128, deg)
  const sx = qx - 8
  return { d: `M${f2(qx)} ${f2(qy)} L${f2(px)} ${f2(py)} M${f2(qx)} ${f2(qy)} H${f2(sx)}`, head: arrow(px, py, px - qx, py - qy), tx: sx - 1.5, ty: qy - 1.2 }
}
const BORE = leader(15, 200)
const TOOTH = leader(R, 215)
const BLADE_TURN = 40 // degrees the blade turns over the whole drawing

function BladeArt() {
  const slots = [22.5, 112.5, 202.5, 292.5]
  const ornaments = [67.5, 157.5, 247.5, 337.5]
  const dirEnd = polar(90, -100)
  const dirTangent: [number, number] = [Math.sin((-100 * Math.PI) / 180), -Math.cos((-100 * Math.PI) / 180)]
  return (
    <svg className="bp-art bp-blade" viewBox="-40 -24 280 264">
      <Paper x={-40} y={-24} w={280} h={264} cx={C} cy={C} r={150} />
      <defs>
        <path id="zs-bp-label-path" d={`M${pt(54, 200)} A54 54 0 1 1 ${pt(54, 199.9)}`} />
      </defs>
      <line className="cl" x1="-14" y1={C} x2="230" y2={C} data-axis="x" data-k="grow" data-s="0.06" data-e="0.15" />
      <line className="cl" x1={C} y1="-14" x2={C} y2="230" data-axis="y" data-k="grow" data-s="0.09" data-e="0.18" />

      <g data-role="rotor">
        <path className="ln strong" pathLength={1} d={TEETH_PATH} data-k="draw" data-s="0.14" data-e="0.46" />
        <path className="ln strong" pathLength={1} d={circle(C, C, 15)} data-k="draw" data-s="0.46" data-e="0.5" />
        <path className="ln" pathLength={1} d={circle(...polar(24, 90), 2.2)} data-k="draw" data-s="0.5" data-e="0.52" />
        <path className="ln" pathLength={1} d={circle(...polar(24, 270), 2.2)} data-k="draw" data-s="0.51" data-e="0.53" />
        <path className="ln thin" pathLength={1} d={circle(C, C, 40)} data-k="draw" data-s="0.52" data-e="0.56" />
        {slots.map((a, i) => {
          const [hx, hy] = polar(80.5, a)
          return <path key={a} className="ln" pathLength={1} d={`M${pt(100, a)} L${pt(82, a)} ${circle(hx, hy, 1.5)}`} data-k="draw" data-s={(0.55 + i * 0.02).toFixed(3)} data-e={(0.58 + i * 0.02).toFixed(3)} />
        })}
        {ornaments.map((a, i) => (
          <path key={a} className="ln thin" pathLength={1} d={`M${pt(68, a - 12)} A68 68 0 0 1 ${pt(68, a + 12)}`} data-k="draw" data-s={(0.62 + i * 0.015).toFixed(3)} data-e={(0.65 + i * 0.015).toFixed(3)} />
        ))}
        <text className="label">
          <textPath href="#zs-bp-label-path" data-k="type" data-s="0.68" data-e="0.76" data-text="ZONA SCULE · Ø216 × 30 · Z48 · HM · n max 8 800 min⁻¹" />
        </text>
        <path className="ln dim" pathLength={1} d={`M${pt(90, -60)} A90 90 0 0 0 ${pt(90, -100)}`} data-k="draw" data-s="0.74" data-e="0.77" />
        <path className="arrow" d={arrow(dirEnd[0], dirEnd[1], dirTangent[0], dirTangent[1])} data-k="pop" data-s="0.765" data-e="0.785" />
      </g>

      <path className="ln dim" pathLength={1} d={`M${2 * R} ${C} H-10`} data-k="draw" data-s="0.78" data-e="0.82" />
      <path className="arrow" d={arrow(0, C, -1, 0)} data-k="pop" data-s="0.805" data-e="0.825" />
      <path className="arrow" d={arrow(2 * R, C, 1, 0)} data-k="pop" data-s="0.79" data-e="0.81" />
      <text x="-12" y={C - 1.2} className="red" textAnchor="end" data-k="type" data-s="0.81" data-e="0.84" data-text="Ø 216" />
      <path className="ln dim" pathLength={1} d={BORE.d} data-k="draw" data-s="0.82" data-e="0.85" />
      <path className="arrow" d={BORE.head} data-k="pop" data-s="0.84" data-e="0.86" />
      <text x={BORE.tx} y={BORE.ty} className="red" textAnchor="end" data-k="type" data-s="0.84" data-e="0.87" data-text="Ø 30 H7" />
      <path className="ln dim" pathLength={1} d={TOOTH.d} data-k="draw" data-s="0.85" data-e="0.88" />
      <path className="arrow" d={TOOTH.head} data-k="pop" data-s="0.87" data-e="0.89" />
      <text x={TOOTH.tx} y={TOOTH.ty} className="red" textAnchor="end" data-k="type" data-s="0.87" data-e="0.9" data-text="Z 48" />

      <Pen scale={PX} />
    </svg>
  )
}

const TITLE_PART: Record<Variant, string> = {
  nail: 'CUI CAP PLAT 3,1×100',
  blade: 'DISC CIRCULAR Ø216 × 30',
}

// ?egg=blade shows the saw blade instead of the nail (default).
const subscribe = () => () => {}
const readVariant = (): Variant => (new URLSearchParams(window.location.search).get('egg') === 'blade' ? 'blade' : 'nail')
const serverVariant = (): Variant => 'nail'

export default function FooterBlueprint() {
  const variant = useSyncExternalStore(subscribe, readVariant, serverVariant)
  const layerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<SVGSVGElement>(null)
  const stampRef = useRef<SVGGElement>(null)
  const dateRef = useRef<SVGTextElement>(null)
  const scaleRef = useRef<SVGTextElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const title = titleRef.current
    const art = layer?.querySelector<SVGSVGElement>('.bp-art')
    if (!layer || !title || !art) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const footer = layer.closest('footer')
    const doc = document.documentElement

    const bar = footer?.querySelector<HTMLElement>('.footer-bottom')
    if (bar) layer.style.setProperty('--bp-bar', `${bar.offsetHeight}px`)

    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    if (dateRef.current) dateRef.current.textContent = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ZS`

    const items: Item[] = Array.from(layer.querySelectorAll<SVGGraphicsElement>('[data-k]')).map(el => {
      const kind = el.dataset.k as Kind
      return {
        el, kind,
        s: +el.dataset.s!, e: +el.dataset.e!,
        text: kind === 'type' ? el.dataset.text ?? '' : '',
        len: kind === 'draw' ? (el as SVGGeometryElement).getTotalLength() : 0,
        out: el.dataset.dir === 'out',
        wrap: el.ownerSVGElement?.querySelector<SVGGElement>('.pen-wrap') ?? null,
      }
    })
    const heads = Array.from(layer.querySelectorAll<SVGGElement>('.head'))

    // Title block sits just under the logo, wherever the logo row is.
    const placeTitle = () => {
      const logo = footer?.querySelector('.footer-logo')
      if (!logo) return
      const l = logo.getBoundingClientRect()
      const box = layer.getBoundingClientRect()
      title.style.left = `${(l.left - box.left).toFixed(1)}px`
      title.style.top = `${(l.bottom - box.top + 40).toFixed(1)}px`
    }
    placeTitle()

    // Pen position in its SVG's user space, whatever transforms (turning
    // blade, tilted / driven nail, camera zoom) sit in between.
    const penAt = (it: Item, t: number, chars: number): [number, number] | null => {
      let x: number, y: number
      if (it.kind === 'draw') {
        const q = (it.el as SVGGeometryElement).getPointAtLength(it.len * t)
        x = q.x; y = q.y
      } else if (it.kind === 'grow') {
        const b = it.el.getBBox()
        if (it.el.dataset.axis === 'y') { x = b.x + b.width / 2; y = b.y + b.height * t }
        else { x = b.x + b.width * t; y = b.y + b.height / 2 }
      } else if (it.kind === 'type' && chars > 0) {
        try {
          const q = (it.el as unknown as SVGTextContentElement).getEndPositionOfChar(chars - 1)
          x = q.x; y = q.y
        } catch { return null }
      } else return null
      // grow items carry a CSS scale of their own — map through the parent
      const src = (it.kind === 'grow' ? it.el.parentNode : it.el) as SVGGraphicsElement
      const a = src.getCTM(), b = it.wrap?.getCTM()
      if (!a || !b) return [x, y]
      const q = new DOMPoint(x, y).matrixTransform(b.inverse().multiply(a))
      return [q.x, q.y]
    }

    // ── Per-drawing behaviour ──
    const rotor = art.querySelector<SVGGElement>('[data-role="rotor"]')
    const nailGroups = Array.from(art.querySelectorAll<SVGGElement>('[data-role="nail"]'))
    const hammer = art.querySelector<SVGGElement>('[data-role="hammer"]')
    const sparks = art.querySelector<SVGPathElement>('[data-role="sparks"]')
    let bladeAngle = 0
    const setBlade = (a: number) => {
      bladeAngle = a
      rotor?.setAttribute('transform', `rotate(${a.toFixed(3)} ${C} ${C})`)
    }
    const impact = () => {
      if (reduce) return
      sparks?.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 0 }], { duration: 320, easing: 'ease-out' })
      art.animate([{ translate: '0 0' }, { translate: '0 1.5px' }, { translate: '0 0' }], { duration: 160, easing: 'ease-out' })
    }
    let lastP = 0
    const frameArt = (p: number) => {
      if (variant === 'blade') { setBlade(-p * BLADE_TURN); return }
      const { depth, gap } = nailState(p)
      const tf = nailTransform(depth)
      for (const g of nailGroups) g.setAttribute('transform', tf)
      hammer?.setAttribute('transform', `translate(0 ${f2(-gap)})`)
      // a hit lands when progress crosses 70% of its slice
      for (let k = 0; k < NAIL_DEPTHS.length - 1; k++) {
        const contact = HIT_START + (k + 0.7) * HIT_SPAN
        if (lastP < contact && p >= contact) impact()
      }
      lastP = p
    }

    let lastGrow = 0
    const render = (p: number) => {
      const grow = easeInOutCubic(Math.min(1, p / GROW_END))
      if (footer && grow !== lastGrow) {
        lastGrow = grow
        footer.style.setProperty('--footer-grow', grow.toFixed(4))
        window.scrollTo(0, doc.scrollHeight)
      }
      placeTitle()
      frameArt(p)

      let pen: { wrap: SVGGElement; xy: [number, number] } | null = null
      for (const it of items) {
        const raw = clamp01((p - it.s) / (it.e - it.s))
        const t = easeInOutSine(raw)
        const style = it.el.style
        let chars = 0
        if (it.kind === 'draw') style.strokeDashoffset = String(1 - t)
        else if (it.kind === 'grow') style.transform = it.el.dataset.axis === 'y' ? `scaleY(${t})` : `scaleX(${t})`
        else if (it.kind === 'pop') style.transform = `scale(${raw < 1 ? easeInOutCubic(raw) * 1.15 : 1})`
        else if (it.kind === 'fade') style.opacity = String(it.out ? 1 - t : t)
        else {
          chars = Math.round(it.text.length * raw)
          it.el.textContent = it.text.slice(0, chars) + (raw > 0 && raw < 1 ? '_' : '')
        }
        if (raw > 0 && raw < 1 && it.wrap && it.kind !== 'pop' && it.kind !== 'fade') {
          const xy = penAt(it, t, chars)
          if (xy) pen = { wrap: it.wrap, xy }
        }
      }
      for (const h of heads) {
        if (pen && h.parentNode === pen.wrap) {
          h.setAttribute('transform', `translate(${pen.xy[0].toFixed(2)} ${pen.xy[1].toFixed(2)})`)
          h.style.opacity = '1'
        } else {
          h.style.opacity = '0'
        }
      }
    }
    render(0)

    // ── Finale ──
    let finished = false
    let animRaf = 0
    const timers: number[] = []
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)) }
    const tween = (duration: number, step: (t: number) => void, done: () => void) => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        step(t)
        if (t < 1) animRaf = requestAnimationFrame(tick)
        else done()
      }
      animRaf = requestAnimationFrame(tick)
    }
    const stamp = () => {
      const s = stampRef.current
      if (!s) return
      if (reduce) { s.style.opacity = '1'; return }
      s.animate(
        [
          { opacity: 0, transform: 'scale(1.9)' },
          { opacity: 1, transform: 'scale(0.94)', offset: 0.7 },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: 420, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', fill: 'forwards' },
      )
      later(() => { title.animate([{ translate: '0 0' }, { translate: '0 2px' }, { translate: '0 0' }], { duration: 200, easing: 'ease-out' }) }, 290)
    }
    // Backspace the title block's scale, then type the new one.
    const retypeScale = (text: string, done: () => void) => {
      const el = scaleRef.current
      if (!el) { done(); return }
      const from = el.textContent ?? ''
      tween(700, t => {
        const n = Math.round((from.length + text.length) * t)
        el.textContent = n <= from.length
          ? from.slice(0, from.length - n) + '_'
          : text.slice(0, n - from.length) + (t < 1 ? '_' : '')
      }, done)
    }
    const finale = () => {
      finished = true
      if (reduce) { stamp(); return }
      if (variant === 'blade') {
        const from = bladeAngle
        tween(3200, t => setBlade(from - (2 * 360 + 30) * easeInOutCubic(t)), () => later(stamp, 150))
        return
      }
      // nail: the camera moves in on detail A
      const vb = art.viewBox.baseVal
      const x0 = vb.x, y0 = vb.y, w0 = vb.width, h0 = vb.height
      const w1 = w0 / NAIL_ZOOM, h1 = h0 / NAIL_ZOOM
      const x1 = NAIL_DETAIL.x - w1 / 2, y1 = NAIL_DETAIL.y - h1 * NAIL_FRAME_Y
      art.querySelector('[data-role="detail-label"]')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' })
      tween(2400, t => {
        const e = easeInOutCubic(t)
        const w = w0 + (w1 - w0) * e
        art.setAttribute('viewBox', `${f2(x0 + (x1 - x0) * e)} ${f2(y0 + (y1 - y0) * e)} ${w.toFixed(3)} ${(h0 + (h1 - h0) * e).toFixed(3)}`)
        art.style.setProperty('--sw', (w / w0).toFixed(4)) // keep lines hairline-thin as the camera closes in
      }, () => later(() => retypeScale(`DET. A · ${NAIL_ZOOM}:1`, () => later(stamp, 150)), 250))
    }

    // ── Scroll-past-the-end input → eased progress ──
    let overscroll = 0
    let target = 0
    let cur = 0
    let raf = 0
    const frame = () => {
      cur += (target - cur) * 0.1
      if (Math.abs(target - cur) < 0.0005) cur = target
      render(cur)
      if (cur === target) {
        raf = 0
        if (cur >= 1 && !finished) finale()
      } else {
        raf = requestAnimationFrame(frame)
      }
    }
    const push = (delta: number) => {
      if (delta <= 0 || finished) return
      if (getComputedStyle(layer).display === 'none') return // no room for it on small screens
      if (window.scrollY + window.innerHeight < doc.scrollHeight - 2) return
      overscroll += delta
      const next = clamp01((overscroll - DEAD_ZONE) / RANGE)
      target = reduce && next > 0 ? 1 : Math.max(target, next)
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const onWheel = (e: WheelEvent) => push(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY)
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      push((touchY - y) * 2)
      touchY = y
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('resize', placeTitle)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', placeTitle)
      if (raf) cancelAnimationFrame(raf)
      if (animRaf) cancelAnimationFrame(animRaf)
      timers.forEach(t => window.clearTimeout(t))
    }
  }, [variant])

  return (
    <div ref={layerRef} className="bp-layer" aria-hidden="true">
      <style>{`
        .bp-layer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        @media (max-width: 1023px) { .bp-layer { display: none; } }
        .bp-layer svg { position: absolute; }
        /* 1:1 — viewBox units are millimetres; centred in the grown footer */
        .bp-blade {
          overflow: visible;
          width: 280mm; height: 264mm;
          right: calc(12px - 24mm);
          bottom: calc((100vh - 52px - var(--bp-bar, 57px)) / 2 - 132mm);
        }
        .bp-nail {
          overflow: hidden; /* frames the camera move */
          width: 180mm; height: 200mm;
          right: 12px;
          bottom: calc((100vh - 52px - var(--bp-bar, 57px)) / 2 - 100mm);
        }
        .bp-title { width: 460px; height: 96px; left: 12px; top: 0; overflow: visible; }

        /* Stroke widths are in each SVG's own units — mm on the drawings
           (0.265mm ≈ 1px, scaled by --sw during the camera zoom), px on the
           title block. No non-scaling-stroke: it would measure the
           pathLength-based draw dashes in screen px. */
        .bp-layer .ln { fill: none; stroke: rgba(0,0,0,0.2); stroke-dasharray: 1; stroke-dashoffset: 1; stroke-linecap: round; stroke-linejoin: round; }
        .bp-layer .ln.thin { stroke: rgba(0,0,0,0.15); }
        .bp-layer .ln.strong { stroke: rgba(0,0,0,0.34); }
        .bp-layer .ln.dim { stroke: rgba(217,44,43,0.55); }
        .bp-art .ln { stroke-width: calc(0.265px * var(--sw, 1)); }
        .bp-art .ln.strong { stroke-width: calc(0.33px * var(--sw, 1)); }
        .bp-title .ln { stroke-width: 1; }
        .bp-art .cl { fill: none; stroke: rgba(0,0,0,0.16); stroke-width: calc(0.265px * var(--sw, 1)); stroke-dasharray: 3.7 1.06 0.53 1.06; transform-box: fill-box; }
        .bp-art .cl[data-axis="x"] { transform-origin: left center; transform: scaleX(0); }
        .bp-art .cl[data-axis="y"] { transform-origin: center top; transform: scaleY(0); }
        .bp-art .hidden-part { opacity: 0; }
        .bp-art .hid { fill: none; stroke: rgba(0,0,0,0.26); stroke-width: calc(0.22px * var(--sw, 1)); stroke-dasharray: 1.2 0.8; }
        .bp-art .sparks { fill: none; stroke: rgb(217,44,43); stroke-width: 0.3; stroke-linecap: round; opacity: 0; }
        .bp-art .grid-minor { fill: none; stroke: rgba(0,0,0,0.035); stroke-width: calc(0.15px * var(--sw, 1)); }
        .bp-art .grid-major { fill: none; stroke: rgba(0,0,0,0.06); stroke-width: calc(0.22px * var(--sw, 1)); }
        .bp-layer .arrow { fill: rgba(217,44,43,0.7); transform-box: fill-box; transform-origin: center; transform: scale(0); }
        .bp-layer .paper { opacity: 0; }
        .bp-layer text { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.08em; fill: rgba(0,0,0,0.45); }
        .bp-art text { font-size: 2.7px; }
        .bp-art text.big-label { font-size: 4px; font-weight: 500; }
        .bp-title text { font-size: 10px; }
        .bp-layer text.red { fill: rgba(217,44,43,0.75); }
        .bp-layer text.big { fill: rgba(0,0,0,0.6); font-weight: 500; }
        .bp-title text.big { font-size: 11px; }
        .bp-blade text.label { font-size: 3.3px; letter-spacing: 0.22em; fill: rgba(0,0,0,0.32); }
        .bp-layer .head { opacity: 0; transition: opacity 250ms ease; }
        .bp-layer .head circle { fill: rgb(217,44,43); }
        .bp-layer .head path { stroke: rgba(217,44,43,0.8); stroke-width: 0.8; fill: none; }
        .bp-layer .stamp-ink { opacity: 0; transform-box: fill-box; transform-origin: center; }
        .bp-layer .stamp-ink rect { fill: none; stroke: rgba(217,44,43,0.8); }
        .bp-layer .stamp-ink text { fill: rgba(217,44,43,0.85); text-anchor: middle; }
        .bp-layer .stamp-ink .stamp-word { font-size: 15px; font-weight: 500; letter-spacing: 0.28em; }
        .bp-layer .stamp-ink .stamp-date { font-size: 8.5px; letter-spacing: 0.14em; }
      `}</style>

      {variant === 'blade' ? <BladeArt /> : <NailArt />}

      {/* ── Note, title block and stamp, under the logo ── */}
      <svg ref={titleRef} className="bp-title" viewBox="0 0 460 96">
        <defs>
          <filter id="zs-bp-ink" x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="1.6" />
          </filter>
        </defs>
        <text x="0" y="10" className="red" data-k="type" data-s="0.01" data-e="0.08" data-text="// ai derulat până la capăt. respect." />
        <path className="ln" pathLength={1} d="M0 22 H290 V88 H0 Z M0 44 H290 M0 66 H290 M180 22 V88" data-k="draw" data-s="0.88" data-e="0.93" />
        <text x="10" y="37" className="big" data-k="type" data-s="0.9" data-e="0.93" data-text="ZONA SCULE" />
        <text x="190" y="37" data-k="type" data-s="0.91" data-e="0.94" data-text="DESEN TEHNIC" />
        <text x="10" y="59" data-k="type" data-s="0.92" data-e="0.96" data-text={TITLE_PART[variant]} />
        <text ref={scaleRef} x="190" y="59" data-k="type" data-s="0.94" data-e="0.97" data-text="SCARA 1:1" />
        <text x="10" y="81" data-k="type" data-s="0.95" data-e="0.99" data-text="PITEȘTI · 26+ ANI" />
        <text x="190" y="81" data-k="type" data-s="0.97" data-e="1" data-text="FOAIA 1/1" />

        <g transform="rotate(-7 366 55)">
          <g ref={stampRef} className="stamp-ink" filter="url(#zs-bp-ink)">
            <rect x="300" y="31" width="132" height="48" rx="3" strokeWidth="1.6" />
            <rect x="304" y="35" width="124" height="40" rx="2" strokeWidth="0.7" />
            <text x="366" y="57" className="stamp-word">APROBAT</text>
            <text ref={dateRef} x="366" y="69" className="stamp-date" />
          </g>
        </g>

        <Pen />
      </svg>
    </div>
  )
}
