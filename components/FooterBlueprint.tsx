'use client'
import { useEffect, useRef, useSyncExternalStore } from 'react'

/**
 * Footer easter egg (every page, desktop). The footer is a full viewport
 * tall, so ordinary scrolling comes to rest on all of it: on the way in its
 * top edge slides under the (sticky) nav and a note types itself under the
 * logo — "derulează în continuare", the only hint. A fresh scroll from that
 * stop (after a short beat, see DEAD_ZONE) starts drafting a technical
 * drawing on faint grid paper, driven by how far you keep scrolling
 * (scrolling back rewinds it):
 *
 *  • the footer logo lifts away to make room; a red "pen" crosshair traces
 *    the drawing line by line while labels type themselves out; the title
 *    block fills in where the logo was;
 *  • a finale plays, then an "APROBAT" stamp with today's date lands.
 *
 * Six drawings (their SVGs are sized in CSS millimetres and the viewBox
 * units are the object's mm — 1:1, except the power drill at 1:2):
 *  - "nail" (?egg=nail): a Ø3,1 × 100 nail standing on a board section, which
 *    a hammer then drives in over four scroll-driven hits until only the
 *    head is left above the surface; finale: the camera zooms into
 *    detail A at 5:1.
 *  - "blade" (?egg=blade): a Ø216 × 30 circular saw blade that turns as you
 *    scroll; finale: a spin-up test run.
 *  - "drill" (?egg=drill): an HSS Ø10 × 133 twist drill (DIN 338, 118°
 *    point, 30° helix) with a 4:1 section A–A; it then spins up and feeds
 *    through a 12 mm steel plate (chips curling out, flutes sliding, the
 *    section turning in sync), backs out, and the new hole is dimensioned;
 *    finale: a wind-down test spin.
 *
 *  - "power" (?egg=power): an 18V brushless drill/driver, drawn assembled
 *    (gearbox, motor and electronics as hidden lines), which then comes apart
 *    into an exploded view — chuck, clutch collar, planetary gearbox and
 *    motor slide out along the axis, trigger forward, electronics and
 *    battery down — with balloons, a parts list and a section B–B through
 *    the motor (12-slot stator, 4-pole rotor); finale: a test spin.
 *
 *  - "caliper" (?egg=caliper): a 0–200 × 0,05 vernier caliper at 1:2; the
 *    slider opens, a Ø50 bar is drawn in section between the jaws, they
 *    close on it and the reading is dimensioned; finale: a second check.
 *  - "level" (?egg=level): an 800 mm spirit level at 1:5, drawn 4° off
 *    (bubble towards the high end), which settles level as you scroll;
 *    finale: the bubble swings past the marks and settles.
 *
 * Which one shows is shuffled on every page load (never the same one twice
 * in a row) between blade, drill, power, caliper and level — the nail is out of the shuffle
 * for now; ?egg=… forces any of them.
 *
 * Every drawable carries data-s / data-e — its slice of the 0..1 progress —
 * and a data-k kind: draw (stroke-dashoffset, pathLength=1), grow (scale
 * along data-axis), pop (scale, arrowheads), fade (opacity; data-dir="out"
 * to fade away) or type (text).
 */
const RANGE = 2600 // px of extra scrolling from blank to fully drawn
// A short beat before anything draws: the first bit of scrolling past the
// end does nothing but hold the page, so the drawing never looks like part
// of the footer. One deliberate scroll gets past it.
const DEAD_ZONE = 60
// Scrolling that is still the gesture which brought the page to the bottom
// (trackpad / wheel momentum) never starts the drawing — only a fresh
// scroll does (a pause of this long between wheel events), or a gesture
// that keeps pushing after the page has sat at the bottom for a while.
const NEW_GESTURE_GAP = 180 // ms
const SETTLED = 2000 // ms at the bottom

type Variant = 'nail' | 'blade' | 'drill' | 'power' | 'caliper' | 'level'
const VARIANTS: Variant[] = ['nail', 'blade', 'drill', 'power', 'caliper', 'level']
// In the page-load shuffle; the rest stay reachable with ?egg=…
const SHUFFLED: Variant[] = ['blade', 'drill', 'power', 'caliper', 'level']
type Kind = 'draw' | 'grow' | 'pop' | 'fade' | 'type'
type Item = { el: SVGGraphicsElement; s: number; e: number; kind: Kind; text: string; len: number; out: boolean; arrive: boolean; wrap: SVGGElement | null }

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
// `unit`: viewBox units per mm of paper (2 on a 1:2 drawing).
const Paper = ({ x, y, w, h, cx, cy, r, unit = 1 }: { x: number; y: number; w: number; h: number; cx: number; cy: number; r: number; unit?: number }) => (
  <>
    <defs>
      <pattern id="zs-bp-minor" width={5 * unit} height={5 * unit} patternUnits="userSpaceOnUse">
        <path className="grid-minor" d={`M${5 * unit} 0 H0 V${5 * unit}`} />
      </pattern>
      <pattern id="zs-bp-major" width={25 * unit} height={25 * unit} patternUnits="userSpaceOnUse" x={cx} y={cy}>
        <rect width={25 * unit} height={25 * unit} fill="url(#zs-bp-minor)" />
        <path className="grid-major" d={`M${25 * unit} 0 H0 V${25 * unit}`} />
      </pattern>
      <radialGradient id="zs-bp-fade" cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
        <stop offset="0.55" stopColor="#fff" />
        <stop offset="1" stopColor="#000" />
      </radialGradient>
      <mask id="zs-bp-mask">
        <rect x={x} y={y} width={w} height={h} fill="url(#zs-bp-fade)" />
      </mask>
    </defs>
    <rect className="paper" x={x} y={y} width={w} height={h} fill="url(#zs-bp-major)" mask="url(#zs-bp-mask)" data-k="fade" data-s="0" data-e="0.08" />
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

// ════════════════════════════════════════════════════════════════════════════
// Twist drill — HSS Ø10 × 133, DIN 338 (jobber length), 118° point
// ════════════════════════════════════════════════════════════════════════════
const DR = { y: 60, r: 5, tip: 48, pointLen: 3, fluteEnd: 135, end: 181 } // mm; tip on the left
const DR_LEAD = (Math.PI * 10) / Math.tan((30 * Math.PI) / 180) // helix lead for a 30° helix ≈ 54.4
const DR_PITCH = DR_LEAD / 2 // two flutes → the side-view pattern repeats every half lead
const DR_FLUTE_W = 9 // mm between a flute's leading and trailing edge
const PLATE = { x0: 24, x1: 36, y0: 34, y1: 86 } // steel plate in section
const DRILL_START = 0.63 // feeding in
const DRILL_THROUGH = 0.86 // tip out the far side
const DRILL_RETRACT = 0.89 // start backing out
const DRILL_BACK = 0.94 // fully out
const DRILL_FEED = 30 // mm of travel (tip ends 6 mm past the plate)
const SEC = { x: 166, y: 25, r: 20 } // section A–A at 4:1, in the open space above the shank
const DR_CUT = 100 // x of the A–A cutting plane on the body

// Flute edges seen from the side: half a helix turn is an S-curve across the
// Ø10 body over half a lead. Leading and trailing edges of both flutes.
const fluteEdges = (offset: number) => {
  let d = ''
  for (let x0 = DR.tip - 3 * DR_PITCH; x0 < DR.fluteEnd + DR_PITCH; x0 += DR_PITCH) {
    const x = x0 + offset
    const k = DR_PITCH
    d += `M${f2(x)} ${DR.y + DR.r} C${f2(x + k * 0.36)} ${DR.y + DR.r} ${f2(x + k * 0.64)} ${DR.y - DR.r} ${f2(x + k)} ${DR.y - DR.r} `
  }
  return d.trim()
}
const DR_LEADING = fluteEdges(0)
const DR_TRAILING = fluteEdges(DR_FLUTE_W)

// Section A–A: Ø10 core circle (drawn 4:1) with two flute cut-outs.
const SECTION_PATH = (() => {
  const P = (deg: number) => {
    const a = (deg * Math.PI) / 180
    return `${f2(SEC.x + SEC.r * Math.cos(a))} ${f2(SEC.y + SEC.r * Math.sin(a))}`
  }
  return `M${P(30)} A${SEC.r} ${SEC.r} 0 0 1 ${P(150)} A11 11 0 0 0 ${P(210)} A${SEC.r} ${SEC.r} 0 0 1 ${P(330)} A11 11 0 0 0 ${P(390)} Z`
})()
const SECTION_HATCH = (() => {
  let d = ''
  for (let x0 = SEC.x - 44; x0 <= SEC.x + 24; x0 += 2.5) d += `M${f2(x0)} ${SEC.y + 22} L${f2(x0 + 44)} ${SEC.y - 22} `
  return d.trim()
})()
const PLATE_HATCH = (() => {
  let d = ''
  for (let y0 = PLATE.y0 - 12; y0 <= PLATE.y1 + 12; y0 += 3) d += `M${PLATE.x0} ${y0 + 12} L${PLATE.x1} ${y0} `
  return d.trim()
})()

// Feed (mm the drill has advanced) and spin offset for scroll progress p.
function drillState(p: number) {
  let feed = 0
  if (p >= DRILL_START && p < DRILL_THROUGH) feed = DRILL_FEED * easeInOutSine((p - DRILL_START) / (DRILL_THROUGH - DRILL_START))
  else if (p >= DRILL_THROUGH && p < DRILL_RETRACT) feed = DRILL_FEED
  else if (p >= DRILL_RETRACT && p < DRILL_BACK) feed = DRILL_FEED * (1 - easeInOutCubic((p - DRILL_RETRACT) / (DRILL_BACK - DRILL_RETRACT)))
  const spinning = p > DRILL_START && p < DRILL_BACK
  const turn = spinning ? ((p - DRILL_START) / (DRILL_BACK - DRILL_START)) * 18 * DR_LEAD : 0 // mm of helix travel
  return { feed, turn }
}

function DrillArt() {
  const dimL = 84, dim87 = 77
  return (
    <svg className="bp-art bp-drill" viewBox="0 0 200 180">
      <Paper x={-20} y={-20} w={240} h={220} cx={110} cy={DR.y} r={140} />
      <defs>
        <clipPath id="zs-bp-dbody"><rect x={DR.tip + DR.pointLen} y={DR.y - DR.r} width={DR.fluteEnd - DR.tip - DR.pointLen} height={DR.r * 2} /></clipPath>
        <clipPath id="zs-bp-plate"><rect x={PLATE.x0} y={PLATE.y0} width={PLATE.x1 - PLATE.x0} height={PLATE.y1 - PLATE.y0} /></clipPath>
        <clipPath id="zs-bp-sec"><path d={SECTION_PATH} /></clipPath>
      </defs>

      <line className="cl" x1="12" y1={DR.y} x2="192" y2={DR.y} data-axis="x" data-k="grow" data-s="0.06" data-e="0.14" />

      {/* steel plate in section: faces, break lines, hatch; the drilled hole is cut into it */}
      <path className="ln strong" pathLength={1} d={`M${PLATE.x1} ${PLATE.y0} V${PLATE.y1} M${PLATE.x0} ${PLATE.y0} V${PLATE.y1}`} data-k="draw" data-s="0.44" data-e="0.48" />
      <path className="ln" pathLength={1} d={`M${PLATE.x0 - 2} ${PLATE.y0} L27 ${PLATE.y0 + 1.6} L31 ${PLATE.y0 - 1.6} L${PLATE.x1 + 2} ${PLATE.y0} M${PLATE.x0 - 2} ${PLATE.y1} L27 ${PLATE.y1 + 1.6} L31 ${PLATE.y1 - 1.6} L${PLATE.x1 + 2} ${PLATE.y1}`} data-k="draw" data-s="0.47" data-e="0.5" />
      <g clipPath="url(#zs-bp-plate)">
        <path className="ln thin" pathLength={1} d={PLATE_HATCH} data-k="draw" data-s="0.49" data-e="0.56" />
      </g>
      <path data-role="hole" className="hole" d={`M${PLATE.x1} ${DR.y - DR.r} H${PLATE.x1} V${DR.y + DR.r} H${PLATE.x1}`} />
      <text className="red mono-s" x={PLATE.x0 - 1} y={PLATE.y0 - 4} textAnchor="middle" data-k="type" data-s="0.5" data-e="0.53" data-text="S235 · t 12" />

      <g data-role="drill">
        {/* point: two lips meeting at 118°, chisel edge */}
        <path className="ln strong" pathLength={1} d={`M${DR.tip + DR.pointLen} ${DR.y - DR.r} L${DR.tip} ${DR.y} L${DR.tip + DR.pointLen} ${DR.y + DR.r}`} data-k="draw" data-s="0.12" data-e="0.16" />
        <path className="ln thin" pathLength={1} d={`M${DR.tip + 0.6} ${DR.y - 0.9} L${DR.tip + 0.6} ${DR.y + 0.9}`} data-k="draw" data-s="0.155" data-e="0.17" />
        {/* body and margins (lands) */}
        <path className="ln strong" pathLength={1} d={`M${DR.tip + DR.pointLen} ${DR.y - DR.r} H${DR.fluteEnd}`} data-k="draw" data-s="0.15" data-e="0.22" />
        <path className="ln strong" pathLength={1} d={`M${DR.tip + DR.pointLen} ${DR.y + DR.r} H${DR.fluteEnd}`} data-k="draw" data-s="0.17" data-e="0.24" />
        <path className="ln thin" pathLength={1} d={`M${DR.tip + DR.pointLen + 0.4} ${DR.y - DR.r + 0.6} H${DR.fluteEnd - 1} M${DR.tip + DR.pointLen + 0.4} ${DR.y + DR.r - 0.6} H${DR.fluteEnd - 1}`} data-k="draw" data-s="0.22" data-e="0.27" />
        {/* flutes: helix edges, clipped to the body; slide along it as it turns */}
        <g clipPath="url(#zs-bp-dbody)">
          <g data-role="flutes">
            <path className="ln" pathLength={1} d={DR_LEADING} data-k="draw" data-s="0.29" data-e="0.4" />
            <path className="ln thin" pathLength={1} d={DR_TRAILING} data-k="draw" data-s="0.32" data-e="0.43" />
          </g>
        </g>
        {/* flute run-out, shank with chamfer */}
        <path className="ln" pathLength={1} d={`M${DR.fluteEnd} ${DR.y - DR.r} C${DR.fluteEnd - 4} ${DR.y - 1} ${DR.fluteEnd - 2} ${DR.y + 2} ${DR.fluteEnd} ${DR.y + DR.r}`} data-k="draw" data-s="0.26" data-e="0.28" />
        <path className="ln strong" pathLength={1} d={`M${DR.fluteEnd} ${DR.y - DR.r} H${DR.end - 1} L${DR.end} ${DR.y - DR.r + 1} V${DR.y + DR.r - 1} L${DR.end - 1} ${DR.y + DR.r} H${DR.fluteEnd}`} data-k="draw" data-s="0.27" data-e="0.35" />
        <text className="mark" x={(DR.fluteEnd + DR.end) / 2} y={DR.y + 0.8} textAnchor="middle" data-k="type" data-s="0.42" data-e="0.48" data-text="HSS-G · Ø10 · DIN 338 · ZS" />
        {/* cutting plane A–A */}
        <path className="ln dim" pathLength={1} d={`M${DR_CUT} ${DR.y - 11} V${DR.y - 7.5} M${DR_CUT} ${DR.y + 7.5} V${DR.y + 11} M${DR_CUT} ${DR.y - 11} H${DR_CUT + 3} M${DR_CUT} ${DR.y + 11} H${DR_CUT + 3}`} data-k="draw" data-s="0.36" data-e="0.39" />
        <path className="arrow" d={arrow(DR_CUT + 4.6, DR.y - 11, 1, 0, 1.8, 0.6)} data-k="pop" data-s="0.385" data-e="0.4" />
        <path className="arrow" d={arrow(DR_CUT + 4.6, DR.y + 11, 1, 0, 1.8, 0.6)} data-k="pop" data-s="0.385" data-e="0.4" />
        <text className="red" x={DR_CUT - 1} y={DR.y - 12.5} textAnchor="middle" data-k="type" data-s="0.39" data-e="0.4" data-text="A" />
        <text className="red" x={DR_CUT - 1} y={DR.y + 14.8} textAnchor="middle" data-k="type" data-s="0.39" data-e="0.4" data-text="A" />
      </g>

      {/* chips curling out of the hole while it cuts */}
      <g data-role="chips" className="chips">
        <path d="M0 0 C1.5 -2 4 -1.5 3.6 0.6 C3.2 2.4 0.8 2.2 1.2 0.6" />
        <path d="M0 0 C1.2 -1.6 3.4 -1.2 3 0.5 C2.7 2 0.7 1.8 1 0.5" />
        <path d="M0 0 C1.8 -2.2 4.6 -1.6 4.1 0.7 C3.6 2.7 0.9 2.4 1.4 0.7" />
      </g>

      {/* dimensions — fade away before the drill starts cutting */}
      <g data-k="fade" data-dir="out" data-s="0.6" data-e="0.63">
        <path className="ln thin" pathLength={1} d={`M${DR.tip} ${DR.y + 1} V${dimL + 3} M${DR.end} ${DR.y + DR.r + 1} V${dimL + 3} M${DR.fluteEnd} ${DR.y + DR.r + 1} V${dim87 + 3}`} data-k="draw" data-s="0.4" data-e="0.43" />
        <path className="ln dim" pathLength={1} d={`M${DR.tip} ${dimL} H${DR.end}`} data-k="draw" data-s="0.42" data-e="0.46" />
        <path className="arrow" d={arrow(DR.tip, dimL, -1, 0)} data-k="pop" data-s="0.45" data-e="0.47" />
        <path className="arrow" d={arrow(DR.end, dimL, 1, 0)} data-k="pop" data-s="0.44" data-e="0.46" />
        <text className="red" x={(DR.tip + DR.end) / 2} y={dimL - 1.2} textAnchor="middle" data-k="type" data-s="0.45" data-e="0.48" data-text="133" />
        <path className="ln dim" pathLength={1} d={`M${DR.tip} ${dim87} H${DR.fluteEnd}`} data-k="draw" data-s="0.44" data-e="0.48" />
        <path className="arrow" d={arrow(DR.tip, dim87, -1, 0)} data-k="pop" data-s="0.47" data-e="0.49" />
        <path className="arrow" d={arrow(DR.fluteEnd, dim87, 1, 0)} data-k="pop" data-s="0.46" data-e="0.48" />
        <text className="red" x={(DR.tip + DR.fluteEnd) / 2} y={dim87 - 1.2} textAnchor="middle" data-k="type" data-s="0.47" data-e="0.5" data-text="87" />
        {/* Ø10 h8 on the shank */}
        <path className="ln dim" pathLength={1} d={`M166 ${DR.y + DR.r} L170 ${DR.y + 13} H177`} data-k="draw" data-s="0.47" data-e="0.5" />
        <path className="arrow" d={arrow(166, DR.y + DR.r, 166 - 170, DR.y + DR.r - (DR.y + 13))} data-k="pop" data-s="0.49" data-e="0.51" />
        <text className="red" x="170" y={DR.y + 11.8} data-k="type" data-s="0.5" data-e="0.52" data-text="Ø10 h8" />
        {/* 118° point angle */}
        <path className="ln dim" pathLength={1} d={`M${f2(DR.tip + 7 * Math.cos((-59 * Math.PI) / 180))} ${f2(DR.y + 7 * Math.sin((-59 * Math.PI) / 180))} A7 7 0 0 1 ${f2(DR.tip + 7 * Math.cos((59 * Math.PI) / 180))} ${f2(DR.y + 7 * Math.sin((59 * Math.PI) / 180))}`} data-k="draw" data-s="0.5" data-e="0.53" />
        <text className="red" x={DR.tip + 2} y={DR.y - 8.5} data-k="type" data-s="0.52" data-e="0.54" data-text="118°" />
        {/* helix angle */}
        <path className="ln dim" pathLength={1} d={`M${f2(DR.tip + DR.pointLen + DR_PITCH * 1.5)} ${DR.y} L114 ${DR.y - 18} H121`} data-k="draw" data-s="0.52" data-e="0.55" />
        <text className="red" x="114" y={DR.y - 19.2} data-k="type" data-s="0.54" data-e="0.56" data-text="β 30°" />
      </g>

      {/* section A–A, 4:1 — turns with the drill */}
      <text className="red" x={SEC.x - SEC.r - 6} y={SEC.y + 1} textAnchor="end" data-k="type" data-s="0.55" data-e="0.58" data-text="A–A  4:1" />
      <line className="cl" x1={SEC.x - 24} y1={SEC.y} x2={SEC.x + 24} y2={SEC.y} data-axis="x" data-k="grow" data-s="0.5" data-e="0.53" />
      <line className="cl" x1={SEC.x} y1={SEC.y - 23} x2={SEC.x} y2={SEC.y + 24} data-axis="y" data-k="grow" data-s="0.51" data-e="0.54" />
      <g data-role="section">
        <path className="ln strong" pathLength={1} d={SECTION_PATH} data-k="draw" data-s="0.52" data-e="0.57" />
        <g clipPath="url(#zs-bp-sec)">
          <path className="ln thin" pathLength={1} d={SECTION_HATCH} data-k="draw" data-s="0.56" data-e="0.6" />
        </g>
      </g>

      {/* the finished hole */}
      <path className="ln dim" pathLength={1} d={`M${(PLATE.x0 + PLATE.x1) / 2} ${DR.y - DR.r} L${PLATE.x1 + 8} ${DR.y - 22} H${PLATE.x1 + 16}`} data-k="draw" data-s="0.94" data-e="0.97" />
      <path className="arrow" d={arrow((PLATE.x0 + PLATE.x1) / 2, DR.y - DR.r, (PLATE.x0 + PLATE.x1) / 2 - PLATE.x1 - 8, DR.y - DR.r - DR.y + 22)} data-k="pop" data-s="0.96" data-e="0.975" />
      <text className="red" x={PLATE.x1 + 8} y={DR.y - 23.2} data-k="type" data-s="0.96" data-e="0.99" data-text="Ø10 TRECĂTOR" />

      <Pen scale={PX} />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Cordless drill/driver 18V, brushless — exploded assembly, drawn at 1:2
// (viewBox units are the drill's own mm; the SVG is sized at half that)
// ════════════════════════════════════════════════════════════════════════════
const PY = 70 // spindle axis
const PAR = (x: number, y: number, dx: number, dy: number) => arrow(x, y, dx, dy, 4.4, 1.4)
// Each part slides out along its own vector over its own slice of progress.
const POWER_PARTS = [
  { role: 'x-chuck', dx: -144, dy: 0, s: 0.58, e: 0.72 },
  { role: 'x-collar', dx: -132, dy: 0, s: 0.6, e: 0.73 },
  { role: 'x-gear', dx: -112, dy: 0, s: 0.62, e: 0.75 },
  { role: 'x-motor', dx: -96, dy: 0, s: 0.64, e: 0.77 },
  { role: 'x-trigger', dx: -30, dy: 6, s: 0.66, e: 0.76 },
  { role: 'x-pcb', dx: 0, dy: 18, s: 0.68, e: 0.78 },
  { role: 'x-battery', dx: 0, dy: 30, s: 0.68, e: 0.8 },
]
// Chuck sleeve grip ribs (parallel to the axis) seen from the side at a turn
// of `deg` — only the ones facing us.
const chuckRibs = (deg: number) => {
  let d = ''
  for (let i = 0; i < 12; i++) {
    const a = ((i * 30 + deg) * Math.PI) / 180
    if (Math.cos(a) < 0.2) continue
    const y = PY + 20 * Math.sin(a)
    d += `M163 ${f2(y)} H187 `
  }
  return d.trim()
}
const BB = { x: 368, y: 122 } // section B–B through the motor
const bbPt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return `${f2(BB.x + r * Math.cos(a))} ${f2(BB.y + r * Math.sin(a))}`
}
// Stator: 12 T-shaped teeth around the rotor bore.
const BB_STATOR_INNER = (() => {
  let d = ''
  for (let i = 0; i < 12; i++) {
    const a = i * 30
    d += `${i ? 'L' : 'M'}${bbPt(11.5, a - 11)} A11.5 11.5 0 0 1 ${bbPt(11.5, a + 11)} L${bbPt(13, a + 11)} L${bbPt(13, a + 5)} L${bbPt(19, a + 5)} A19 19 0 0 1 ${bbPt(19, a + 25)} L${bbPt(13, a + 25)} L${bbPt(13, a + 19)} `
  }
  return d + 'Z'
})()
const BB_STATOR = `${circle(BB.x, BB.y, 24)} ${BB_STATOR_INNER}`
const BB_HATCH = (() => {
  let d = ''
  for (let x0 = BB.x - 54; x0 <= BB.x + 30; x0 += 3) d += `M${f2(x0)} ${BB.y + 26} L${f2(x0 + 52)} ${BB.y - 26} `
  return d.trim()
})()
const BB_MAGNETS = [0, 90, 180, 270]
  .map(a => `M${bbPt(10.3, a - 36)} A10.3 10.3 0 0 1 ${bbPt(10.3, a + 36)} L${bbPt(7.6, a + 36)} A7.6 7.6 0 0 0 ${bbPt(7.6, a - 36)} Z`)
  .join(' ')
const BB_COILS = Array.from({ length: 12 }, (_, i) => circle(...(bbPt(16, i * 30 + 15).split(' ').map(Number) as [number, number]), 1.1)).join(' ')
const PARTS_LIST = [
  'MANDRINĂ AUTOBLOCANTĂ 13 mm',
  'INEL AMBREIAJ 21+1',
  'REDUCTOR PLANETAR 2 VIT.',
  'MOTOR BRUSHLESS 18V',
  'CARCASĂ · MÂNER',
  'TRĂGACI VARIABIL',
  'MODUL ELECTRONIC',
  'ACUMULATOR 18V · 2,0 Ah',
]
// Balloons: [n, balloon x, y, leader path]
const BALLOONS: [number, number, number, string][] = [
  [1, 31, 24, 'M31 49 V30'],
  [2, 74, 24, 'M74 45 V30'],
  [3, 115, 24, 'M115 47 V30'],
  [4, 160, 24, 'M160 45 V30'],
  [5, 300, 24, 'M300 43 V30'],
  [6, 190, 152, 'M204 140 L194 147.5'],
  [7, 347, 194, 'M316 194 H341'],
  [8, 347, 237, 'M322 237 H341'],
]

function PowerArt() {
  const hid = (d: string, s: number) => (
    <g data-k="fade" data-dir="out" data-s="0.58" data-e="0.61">
      <path className="hid" d={d} data-k="fade" data-s={s} data-e={s + 0.05} />
    </g>
  )
  return (
    <svg className="bp-art bp-power" viewBox="0 0 400 265">
      <Paper x={-20} y={-20} w={440} h={320} cx={200} cy={130} r={260} unit={2} />
      <defs>
        <clipPath id="zs-bp-bb"><path d={BB_STATOR} clipRule="evenodd" /></clipPath>
      </defs>

      <line className="cl" x1="0" y1={PY} x2="346" y2={PY} data-axis="x" data-k="grow" data-s="0.06" data-e="0.14" />

      {/* 5 · housing (clamshell, stays put) */}
      <path className="ln strong" pathLength={1} d="M212 47 C250 44 300 42 322 46 C334 50 338 60 338 70 C338 82 332 92 320 96 H294 C290 120 286 146 286 168 H324 V184 H204 V168 H242 C244 146 246 124 250 100 H226 C220 100 214 97 212 93 Z" data-k="draw" data-s="0.22" data-e="0.36" />
      <path className="ln" pathLength={1} d="M262 44.5 V40 H278 V44" data-k="draw" data-s="0.34" data-e="0.36" />
      <path className="ln thin" pathLength={1} d="M326 58 H331 M325 64 H333 M325 70 H334 M325 76 H333 M326 82 H331" data-k="draw" data-s="0.35" data-e="0.38" />
      <path className="ln thin" pathLength={1} d="M253 104 C250 126 248 146 247 164 M289 100 C285 124 283 146 282 164" data-k="draw" data-s="0.36" data-e="0.4" />
      <path className="ln thin" pathLength={1} d={`${circle(304, 60, 2)} ${circle(304, 82, 2)} ${circle(266, 150, 2)} ${circle(209, 176, 1.6)}`} data-k="draw" data-s="0.38" data-e="0.41" />

      {/* 1 · chuck */}
      <g data-role="x-chuck">
        <path className="ln strong" pathLength={1} d={`M150 ${PY - 9} L156 ${PY - 15} L160 ${PY - 20} H190 L192 ${PY - 18} H200 V${PY + 18} H192 L190 ${PY + 20} H160 L156 ${PY + 15} L150 ${PY + 9} Z`} data-k="draw" data-s="0.12" data-e="0.2" />
        <path className="ln thin" pathLength={1} d={`M160 ${PY - 20} V${PY + 20} M190 ${PY - 20} V${PY + 20}`} data-k="draw" data-s="0.19" data-e="0.21" />
        <path data-role="ribs" className="ln thin" pathLength={1} d={chuckRibs(0)} data-k="draw" data-s="0.2" data-e="0.24" />
        <path className="ln thin" pathLength={1} d={`M150 ${PY - 3} L147 ${PY - 2} V${PY + 2} L150 ${PY + 3}`} data-k="draw" data-s="0.2" data-e="0.21" />
      </g>

      {/* 2 · clutch collar */}
      <g data-role="x-collar">
        <path className="ln strong" pathLength={1} d={`M200 ${PY - 22} L201.5 ${PY - 24} H210.5 L212 ${PY - 22} V${PY + 22} L210.5 ${PY + 24} H201.5 L200 ${PY + 22} Z`} data-k="draw" data-s="0.2" data-e="0.24" />
        <path className="ln thin" pathLength={1} d={`M203 ${PY - 24} V${PY - 20} M206 ${PY - 24} V${PY - 20} M209 ${PY - 24} V${PY - 20} M203 ${PY + 20} V${PY + 24} M206 ${PY + 20} V${PY + 24} M209 ${PY + 20} V${PY + 24}`} data-k="draw" data-s="0.23" data-e="0.25" />
      </g>

      {/* 3 · two-speed planetary gearbox — hidden inside, drawn as it comes out */}
      <g data-role="x-gear">
        {hid(`M204 65 H212 V75 H204 Z M212 48 H250 V92 H212 Z`, 0.41)}
        <path className="ln strong" pathLength={1} d={`M212 48 H250 V92 H212 Z`} data-k="draw" data-s="0.63" data-e="0.7" />
        <path className="ln" pathLength={1} d={`M212 65 H204 V75 H212 M231 48 V44 H235 V48`} data-k="draw" data-s="0.68" data-e="0.71" />
        <path className="ln thin" pathLength={1} d={`M226 48 V92 M238 48 V92 ${circle(217, 52, 1.2)} ${circle(217, 88, 1.2)} ${circle(245, 52, 1.2)} ${circle(245, 88, 1.2)}`} data-k="draw" data-s="0.7" data-e="0.74" />
        <path className="hid" d={`M213 60 H249 M213 80 H249`} data-k="fade" data-s="0.72" data-e="0.75" />
      </g>

      {/* 4 · brushless motor: stator, rotor shaft with pinion, hall board, fan */}
      <g data-role="x-motor">
        {hid(`M252 46 H284 V94 H252 Z M290 49 H297 V91 H290 Z`, 0.42)}
        <path className="ln strong" pathLength={1} d="M252 46 H284 V94 H252 Z" data-k="draw" data-s="0.65" data-e="0.71" />
        <path className="ln thin" pathLength={1} d="M256 47 V93 M260 47 V93 M264 47 V93 M272 47 V93 M276 47 V93 M280 47 V93" data-k="draw" data-s="0.7" data-e="0.73" />
        <path className="ln" pathLength={1} d="M252 50 C246 50 246 60 252 60 M252 80 C246 80 246 90 252 90 M284 50 C290 50 290 60 284 60 M284 80 C290 80 290 90 284 90" data-k="draw" data-s="0.71" data-e="0.74" />
        <path className="ln" pathLength={1} d={`M240 ${PY - 3} H300 V${PY + 3} H240 Z M240 ${PY - 3} L241 ${PY - 4.5} L242 ${PY - 3} L243 ${PY - 4.5} L244 ${PY - 3} L245 ${PY - 4.5} L246 ${PY - 3}`} data-k="draw" data-s="0.67" data-e="0.71" />
        <path className="ln" pathLength={1} d="M290 49 H297 V91 H290 Z M291 53 L296 57 M291 60 L296 64 M291 76 L296 80 M291 83 L296 87" data-k="draw" data-s="0.72" data-e="0.75" />
        <path className="ln thin" pathLength={1} d="M286 54 H288.5 V86 H286 Z" data-k="draw" data-s="0.73" data-e="0.75" />
        {/* cutting plane B–B */}
        <path className="ln dim" pathLength={1} d="M268 36 V42 M268 98 V104 M268 36 H274 M268 104 H280" data-k="draw" data-s="0.74" data-e="0.77" />
        <path className="arrow" d={PAR(279, 36, 1, 0)} data-k="pop" data-s="0.765" data-e="0.78" />
        <path className="arrow" d={PAR(285, 104, 1, 0)} data-k="pop" data-s="0.765" data-e="0.78" />
        <text className="red" x="266" y="33" textAnchor="middle" data-k="type" data-s="0.77" data-e="0.78" data-text="B" />
        <text className="red" x="266" y="112" textAnchor="middle" data-k="type" data-s="0.77" data-e="0.78" data-text="B" />
      </g>

      {/* 6 · trigger */}
      <g data-role="x-trigger">
        <path className="ln strong" pathLength={1} d="M247 106 H236 Q230 106 230 112 V128 Q230 134 236 134 H247" data-k="draw" data-s="0.36" data-e="0.39" />
        <path className="ln thin" pathLength={1} d="M233 114 V126" data-k="draw" data-s="0.385" data-e="0.4" />
      </g>

      {/* 7 · electronics module in the foot */}
      <g data-role="x-pcb">
        {hid(`M212 171 H314 V179 H212 Z`, 0.43)}
        <path className="ln strong" pathLength={1} d="M212 172 H314 V179 H212 Z" data-k="draw" data-s="0.69" data-e="0.74" />
        <path className="ln thin" pathLength={1} d={`M222 172 V168 H230 V172 M236 172 V168 H244 V172 M250 172 V168 H258 V172 M266 172 V168 H274 V172 M282 172 V168 H290 V172 ${circle(302, 169.5, 2.5)} M296 179 V183 M306 179 V183`} data-k="draw" data-s="0.73" data-e="0.77" />
      </g>

      {/* 8 · battery pack */}
      <g data-role="x-battery">
        <path className="ln strong" pathLength={1} d="M208 184 H320 V224 Q320 230 314 230 H214 Q208 230 208 224 Z" data-k="draw" data-s="0.38" data-e="0.46" />
        <path className="ln thin" pathLength={1} d="M212 190 H316 M208 193 H204 V203 H208 M292 219 H296 M299 219 H303 M306 219 H310" data-k="draw" data-s="0.44" data-e="0.48" />
        <text className="mark" x="260" y="210" textAnchor="middle" data-k="type" data-s="0.46" data-e="0.5" data-text="ZS · 18V · 2,0 Ah · Li-Ion" />
      </g>

      {/* overall dimensions — fade away before it comes apart */}
      <g data-k="fade" data-dir="out" data-s="0.55" data-e="0.58">
        <path className="ln thin" pathLength={1} d="M150 58 V20 M338 66 V20 M280 40 H364 M322 230 H364" data-k="draw" data-s="0.46" data-e="0.49" />
        <path className="ln dim" pathLength={1} d="M150 25 H338" data-k="draw" data-s="0.48" data-e="0.51" />
        <path className="arrow" d={PAR(150, 25, -1, 0)} data-k="pop" data-s="0.5" data-e="0.52" />
        <path className="arrow" d={PAR(338, 25, 1, 0)} data-k="pop" data-s="0.49" data-e="0.51" />
        <text className="red" x="244" y="22" textAnchor="middle" data-k="type" data-s="0.5" data-e="0.53" data-text="188" />
        <path className="ln dim" pathLength={1} d="M360 40 V230" data-k="draw" data-s="0.5" data-e="0.53" />
        <path className="arrow" d={PAR(360, 40, 0, -1)} data-k="pop" data-s="0.52" data-e="0.54" />
        <path className="arrow" d={PAR(360, 230, 0, 1)} data-k="pop" data-s="0.51" data-e="0.53" />
        <text className="red" x="357" y="135" textAnchor="middle" transform="rotate(-90 357 135)" data-k="type" data-s="0.52" data-e="0.55" data-text="190" />
      </g>

      {/* section B–B through the motor: laminated stator, 4-pole rotor */}
      <text className="red" x={BB.x} y={BB.y - 30} textAnchor="middle" data-k="type" data-s="0.76" data-e="0.78" data-text="B–B" />
      <line className="cl" x1={BB.x - 28} y1={BB.y} x2={BB.x + 28} y2={BB.y} data-axis="x" data-k="grow" data-s="0.76" data-e="0.78" />
      <line className="cl" x1={BB.x} y1={BB.y - 27} x2={BB.x} y2={BB.y + 28} data-axis="y" data-k="grow" data-s="0.765" data-e="0.785" />
      <path className="ln strong" pathLength={1} d={BB_STATOR} data-k="draw" data-s="0.77" data-e="0.82" />
      <g clipPath="url(#zs-bp-bb)">
        <path className="ln thin" pathLength={1} d={BB_HATCH} data-k="draw" data-s="0.81" data-e="0.84" />
      </g>
      <path className="ln thin" pathLength={1} d={BB_COILS} data-k="draw" data-s="0.82" data-e="0.85" />
      <g data-role="bb-rotor">
        <path className="ln" pathLength={1} d={circle(BB.x, BB.y, 10.3)} data-k="draw" data-s="0.79" data-e="0.81" />
        <path className="ln dim" pathLength={1} d={BB_MAGNETS} data-k="draw" data-s="0.8" data-e="0.83" />
        <path className="ln" pathLength={1} d={`${circle(BB.x, BB.y, 3)} M${BB.x - 1} ${BB.y - 3} V${BB.y - 2} H${BB.x + 1} V${BB.y - 3}`} data-k="draw" data-s="0.82" data-e="0.84" />
      </g>

      {/* balloons */}
      <g data-role="balloons">
        {BALLOONS.map(([n, x, y, lead], i) => {
          const s = 0.8 + i * 0.008
          return (
            <g key={n}>
              <path className="ln thin" pathLength={1} d={lead} data-k="draw" data-s={s.toFixed(3)} data-e={(s + 0.02).toFixed(3)} />
              <path className="ln" pathLength={1} d={circle(x, y, 5.5)} data-k="draw" data-s={(s + 0.015).toFixed(3)} data-e={(s + 0.03).toFixed(3)} />
              <text className="bal" x={x} y={y + 1.9} textAnchor="middle" data-k="type" data-s={(s + 0.025).toFixed(3)} data-e={(s + 0.03).toFixed(3)} data-text={String(n)} />
            </g>
          )
        })}
      </g>

      {/* parts list */}
      <text className="red" x="10" y="159" data-k="type" data-s="0.82" data-e="0.84" data-text="LISTĂ DE PIESE" />
      <path className="ln" pathLength={1} d={`M10 164 H190 V245 H10 Z M24 164 V245 M172 164 V245 ${Array.from({ length: 8 }, (_, i) => `M10 ${173 + i * 9} H190`).join(' ')}`} data-k="draw" data-s="0.83" data-e="0.87" />
      <text className="pl pl-h" x="17" y="171" textAnchor="middle" data-k="type" data-s="0.85" data-e="0.86" data-text="POZ" />
      <text className="pl pl-h" x="28" y="171" data-k="type" data-s="0.85" data-e="0.865" data-text="DENUMIRE" />
      <text className="pl pl-h" x="181" y="171" textAnchor="middle" data-k="type" data-s="0.855" data-e="0.865" data-text="BUC." />
      {PARTS_LIST.map((name, i) => {
        const s = 0.86 + i * 0.012
        const y = 180 + i * 9
        return (
          <g key={name}>
            <text className="pl" x="17" y={y} textAnchor="middle" data-k="type" data-s={s.toFixed(3)} data-e={(s + 0.004).toFixed(3)} data-text={String(i + 1)} />
            <text className="pl" x="28" y={y} data-k="type" data-s={(s + 0.002).toFixed(3)} data-e={(s + 0.012).toFixed(3)} data-text={name} />
            <text className="pl" x="181" y={y} textAnchor="middle" data-k="type" data-s={(s + 0.01).toFixed(3)} data-e={(s + 0.012).toFixed(3)} data-text="1" />
          </g>
        )
      })}

      <Pen scale={PX * 2} />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Vernier caliper — 0–200 mm, 0,05 mm (1:2; viewBox units are the caliper's mm)
// ════════════════════════════════════════════════════════════════════════════
const CAL_Z = 30 // measuring faces when closed
const CAL_OPEN = 62 // how far the slider opens first
const CAL_BAR = { x: 55, y: 112, r: 25 } // Ø50 round bar, in section
const CAL_A = 4.4, CAL_H = 1.4 // arrowheads at 1:2
const CAL_TICKS = (() => {
  let d = ''
  for (let i = 0; i <= 200; i++) d += `M${CAL_Z + i} 60 V${60 - (i % 10 === 0 ? 9 : i % 5 === 0 ? 6 : 3.5)} `
  return d.trim()
})()
const CAL_VERNIER = (() => {
  let d = ''
  for (let k = 0; k <= 20; k++) d += `M${f2(CAL_Z + k * 1.95)} 60 V${k % 10 === 0 ? 66.5 : k % 2 === 0 ? 64.5 : 63} `
  return d.trim()
})()
const CAL_HATCH = (() => {
  let d = ''
  for (let c = -50; c <= 50; c += 5) d += `M${CAL_BAR.x + c - 30} ${CAL_BAR.y + 30} L${CAL_BAR.x + c + 30} ${CAL_BAR.y - 30} `
  return d.trim()
})()
// Slider travel for scroll progress p: open, hold while the bar is drawn,
// then close onto it.
function calOpening(p: number) {
  if (p < 0.5) return 0
  if (p < 0.58) return CAL_OPEN * easeInOutCubic((p - 0.5) / 0.08)
  if (p < 0.66) return CAL_OPEN
  if (p < 0.76) return CAL_OPEN - (CAL_OPEN - 2 * CAL_BAR.r) * easeInOutCubic((p - 0.66) / 0.1)
  return 2 * CAL_BAR.r
}

function CaliperArt() {
  const bx0 = CAL_Z, bx1 = CAL_Z + 2 * CAL_BAR.r
  return (
    <svg className="bp-art bp-caliper" viewBox="-20 -8 400 184">
      <Paper x={-40} y={-30} w={460} h={230} cx={CAL_Z} cy={112} r={250} unit={2} />
      <defs>
        <clipPath id="zs-bp-rod"><rect x="300" y="40" width="90" height="24" /></clipPath>
        <clipPath id="zs-bp-bar"><path d={circle(CAL_BAR.x, CAL_BAR.y, CAL_BAR.r)} /></clipPath>
      </defs>

      {/* beam, fixed jaws, main scale */}
      <path className="ln strong" pathLength={1} d="M0 40 H300 V64 H0 Z" data-k="draw" data-s="0.06" data-e="0.16" />
      <path className="ln strong" pathLength={1} d={`M${CAL_Z} 64 V150 L0 118 V64 M${CAL_Z} 40 V12 L18 18 L14 40`} data-k="draw" data-s="0.14" data-e="0.24" />
      <path className="ln thin" pathLength={1} d={CAL_TICKS} data-k="draw" data-s="0.2" data-e="0.34" />
      {Array.from({ length: 21 }, (_, i) => {
        const s = 0.3 + i * 0.004
        return <text key={i} className="mark" x={CAL_Z + i * 10} y="49" textAnchor="middle" data-k="type" data-s={s.toFixed(3)} data-e={(s + 0.004).toFixed(3)} data-text={String(i)} />
      })}
      <text className="mark" x="266" y="55" textAnchor="middle" data-k="type" data-s="0.46" data-e="0.5" data-text="ZS · 0,05 mm" />

      {/* the slider: jaws, vernier, roller, lock screw */}
      <g data-role="slider">
        <path className="cal-fill" d="M30 34 H130 V70 H30 Z M36 44 V60 H124 V44 Z" fillRule="evenodd" data-k="fade" data-s="0.24" data-e="0.28" />
        <path className="ln strong" pathLength={1} d="M30 34 H130 V70 H30 Z" data-k="draw" data-s="0.24" data-e="0.32" />
        <path className="ln" pathLength={1} d="M36 44 H124 V60 H36 Z" data-k="draw" data-s="0.3" data-e="0.34" />
        <path className="ln strong" pathLength={1} d={`M${CAL_Z} 70 V150 L60 118 V70 M${CAL_Z} 34 V12 L42 18 L46 34`} data-k="draw" data-s="0.32" data-e="0.4" />
        <path className="ln thin" pathLength={1} d={CAL_VERNIER} data-k="draw" data-s="0.38" data-e="0.44" />
        <path className="ln" pathLength={1} d={`${circle(104, 77, 6)} M101 71.8 V82.2 M104 71 V83 M107 71.8 V82.2`} data-k="draw" data-s="0.42" data-e="0.46" />
        <path className="ln" pathLength={1} d="M70 34 V27 H84 V34 M72 27 V23 H82 V27" data-k="draw" data-s="0.44" data-e="0.47" />
      </g>
      {/* depth rod: rides with the slider, seen only past the beam's end */}
      <g clipPath="url(#zs-bp-rod)">
        <g data-role="rod">
          <path className="ln strong" pathLength={1} d="M130 50 H300 L302 51 V53 L300 54 H130" data-k="draw" data-s="0.46" data-e="0.48" />
        </g>
      </g>

      {/* Ø50 bar in section, drawn while the jaws are open */}
      <line className="cl" x1={CAL_BAR.x - 34} y1={CAL_BAR.y} x2={CAL_BAR.x + 34} y2={CAL_BAR.y} data-axis="x" data-k="grow" data-s="0.57" data-e="0.61" />
      <line className="cl" x1={CAL_BAR.x} y1={CAL_BAR.y - 34} x2={CAL_BAR.x} y2={CAL_BAR.y + 34} data-axis="y" data-k="grow" data-s="0.58" data-e="0.62" />
      <path className="ln strong" pathLength={1} d={circle(CAL_BAR.x, CAL_BAR.y, CAL_BAR.r)} data-k="draw" data-s="0.58" data-e="0.64" />
      <g clipPath="url(#zs-bp-bar)">
        <path className="ln thin" pathLength={1} d={CAL_HATCH} data-k="draw" data-s="0.63" data-e="0.67" />
      </g>

      {/* the reading, once the jaws are closed on it */}
      <path className="ln dim" pathLength={1} d={`M${bx0} 152 V170 M${bx1} 152 V170 M${bx0} 165 H${bx1}`} data-k="draw" data-s="0.78" data-e="0.82" />
      <path className="arrow" d={arrow(bx0, 165, -1, 0, CAL_A, CAL_H)} data-k="pop" data-s="0.81" data-e="0.83" />
      <path className="arrow" d={arrow(bx1, 165, 1, 0, CAL_A, CAL_H)} data-k="pop" data-s="0.8" data-e="0.82" />
      <text className="red" x={bx1 + 6} y="167" data-k="type" data-s="0.82" data-e="0.86" data-text="Ø 50,00" />
      <path className="ln dim" pathLength={1} d="M0 38 V-2 M300 38 V-2 M0 3 H300" data-k="draw" data-s="0.85" data-e="0.89" />
      <path className="arrow" d={arrow(0, 3, -1, 0, CAL_A, CAL_H)} data-k="pop" data-s="0.88" data-e="0.9" />
      <path className="arrow" d={arrow(300, 3, 1, 0, CAL_A, CAL_H)} data-k="pop" data-s="0.87" data-e="0.89" />
      <text className="red" x="150" y="0.6" textAnchor="middle" data-k="type" data-s="0.88" data-e="0.91" data-text="300" />

      <Pen scale={PX * 2} />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Spirit level — 800 mm (1:5; viewBox units are the level's mm)
// ════════════════════════════════════════════════════════════════════════════
const LV = { len: 800, h: 64, px: 400, py: 64 } // pivot: middle of the bottom edge
const LV_TILT = 4 // degrees off level at the start (right end up)
const LV_BUBBLE = 6 // mm the bubble drifts per degree of tilt
const LV_A = 11, LV_H = 3.5 // arrowheads at 1:5
const levelTilt = (p: number) => LV_TILT * (1 - easeInOutCubic(clamp01((p - 0.62) / 0.22)))
const capsule = (x0: number, x1: number, y0: number, y1: number) => {
  const r = (y1 - y0) / 2
  return `M${x0 + r} ${y0} H${x1 - r} A${r} ${r} 0 0 1 ${x1 - r} ${y1} H${x0 + r} A${r} ${r} 0 0 1 ${x0 + r} ${y0} Z`
}
const LV_ARC = (() => {
  const r = 450, a = (-LV_TILT * Math.PI) / 180
  return { d: `M${LV.px + r} ${LV.py} A${r} ${r} 0 0 0 ${f2(LV.px + r * Math.cos(a))} ${f2(LV.py + r * Math.sin(a))}`, x: LV.px + r * Math.cos(a), y: LV.py + r * Math.sin(a) }
})()

function LevelArt() {
  return (
    <svg className="bp-art bp-level" viewBox="-40 -60 960 200">
      <Paper x={-80} y={-120} w={980} h={320} cx={LV.px} cy={LV.py} r={520} unit={5} />
      <line className="cl" x1="-30" y1={LV.py} x2="830" y2={LV.py} data-axis="x" data-k="grow" data-s="0.06" data-e="0.14" />

      <g data-role="level" transform={`rotate(${-LV_TILT} ${LV.px} ${LV.py})`}>
        {/* aluminium profile with rubber end caps */}
        <path className="ln strong" pathLength={1} d="M24 0 H776 M24 64 H776" data-k="draw" data-s="0.12" data-e="0.24" />
        <path className="ln strong" pathLength={1} d="M24 -2 H6 Q0 -2 0 4 V60 Q0 66 6 66 H24 Z M776 -2 H794 Q800 -2 800 4 V60 Q800 66 794 66 H776 Z" data-k="draw" data-s="0.22" data-e="0.3" />
        <path className="ln thin" pathLength={1} d="M24 8 H776 M24 56 H776" data-k="draw" data-s="0.28" data-e="0.36" />
        {/* central vial */}
        <path className="ln" pathLength={1} d="M354 14 H446 Q450 14 450 18 V46 Q450 50 446 50 H354 Q350 50 350 46 V18 Q350 14 354 14 Z" data-k="draw" data-s="0.34" data-e="0.4" />
        <path className="ln" pathLength={1} d={capsule(360, 440, 24, 40)} data-k="draw" data-s="0.39" data-e="0.44" />
        <path className="ln dim" pathLength={1} d="M387 21 V43 M413 21 V43" data-k="draw" data-s="0.44" data-e="0.46" />
        <g data-role="bubble" transform={`translate(${LV_TILT * LV_BUBBLE} 0)`}>
          <path className="ln strong" pathLength={1} d={`M411 32 A11 5.5 0 1 0 389 32 A11 5.5 0 1 0 411 32`} data-k="draw" data-s="0.46" data-e="0.49" />
        </g>
        {/* plumb vial */}
        <path className="ln" pathLength={1} d={circle(120, 32, 19)} data-k="draw" data-s="0.4" data-e="0.44" />
        <path className="ln" pathLength={1} d={capsule(113, 127, 17, 47)} data-k="draw" data-s="0.43" data-e="0.46" />
        <path className="ln thin" pathLength={1} d={`M110 27 H130 M110 37 H130 ${circle(120, 22, 4)}`} data-k="draw" data-s="0.45" data-e="0.48" />
        {/* hand grip */}
        <path className="ln" pathLength={1} d="M578 18 H702 A14 14 0 0 1 702 46 H578 A14 14 0 0 1 578 18 Z" data-k="draw" data-s="0.47" data-e="0.53" />
        <text className="mark" x="240" y="36" textAnchor="middle" data-k="type" data-s="0.5" data-e="0.55" data-text="ZONA SCULE · 800" />
        <text className="mark" x="510" y="36" textAnchor="middle" data-k="type" data-s="0.52" data-e="0.56" data-text="0,5 mm/m" />
      </g>

      {/* off by 4° — the dimension goes once it's level */}
      <g data-k="fade" data-dir="out" data-s="0.62" data-e="0.66">
        <path className="ln dim" pathLength={1} d={LV_ARC.d} data-k="draw" data-s="0.54" data-e="0.58" />
        <path className="arrow" d={arrow(LV_ARC.x, LV_ARC.y, Math.sin((LV_TILT * Math.PI) / 180), -1, LV_A, LV_H)} data-k="pop" data-s="0.57" data-e="0.59" />
        <text className="red" x={LV_ARC.x + 10} y={LV_ARC.y + 18} data-k="type" data-s="0.58" data-e="0.61" data-text="α 4°" />
      </g>

      <path className="ln dim" pathLength={1} d="M0 70 V116 M800 70 V116 M0 110 H800" data-k="draw" data-s="0.84" data-e="0.88" />
      <path className="arrow" d={arrow(0, 110, -1, 0, LV_A, LV_H)} data-k="pop" data-s="0.87" data-e="0.89" />
      <path className="arrow" d={arrow(800, 110, 1, 0, LV_A, LV_H)} data-k="pop" data-s="0.86" data-e="0.88" />
      <text className="red" x="400" y="104" textAnchor="middle" data-k="type" data-s="0.87" data-e="0.9" data-text="800" />
      <path className="ln dim" pathLength={1} d="M400 14 L440 -30 H500" data-k="draw" data-s="0.88" data-e="0.91" />
      <path className="arrow" d={arrow(400, 14, -40, 44, LV_A, LV_H)} data-k="pop" data-s="0.9" data-e="0.92" />
      <text className="red" x="446" y="-36" data-k="type" data-s="0.9" data-e="0.94" data-text="α 0,0° · ORIZONTAL" />

      <Pen scale={PX * 5} />
    </svg>
  )
}

const TITLE_PART: Record<Variant, string> = {
  nail: 'CUI CAP PLAT 3,1×100',
  blade: 'DISC CIRCULAR Ø216 × 30',
  drill: 'BURGHIU HSS Ø10 × 133',
  power: 'MAȘINĂ DE GĂURIT 18V',
  caliper: 'ȘUBLER 0–200 × 0,05',
  level: 'NIVELĂ CU BULĂ 800',
}
const TITLE_SCALE: Record<Variant, string> = { nail: 'SCARA 1:1', blade: 'SCARA 1:1', drill: 'SCARA 1:1', power: 'SCARA 1:2', caliper: 'SCARA 1:2', level: 'SCARA 1:5' }

// A different drawing on each page load (never the same one twice in a
// row, remembered per browser); ?egg=nail|blade|drill|power|caliper|level
// forces one.
// The nail is out of the shuffle for now.
let chosenVariant: Variant | null = null
const pickVariant = (): Variant => {
  const forced = new URLSearchParams(window.location.search).get('egg')
  if (VARIANTS.includes(forced as Variant)) return forced as Variant
  let last: string | null = null
  try { last = localStorage.getItem('zs-egg') } catch {}
  const pool = SHUFFLED.filter(v => v !== last)
  const v = pool[Math.floor(Math.random() * pool.length)]
  try { localStorage.setItem('zs-egg', v) } catch {}
  return v
}
const subscribe = () => () => {}
const readVariant = (): Variant => (chosenVariant ??= pickVariant())
const serverVariant = (): Variant => 'nail'

export default function FooterBlueprint() {
  const variant = useSyncExternalStore(subscribe, readVariant, serverVariant)
  const layerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<SVGSVGElement>(null)
  const noteRef = useRef<SVGSVGElement>(null)
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
    if (bar && footer) footer.style.setProperty('--bp-bar', `${bar.offsetHeight}px`)
    // room taken by the link columns at the bottom of the footer, so tall
    // drawings can sit just above them
    const cols = footer?.querySelector<HTMLElement>('.footer-grid')
    const measureCols = () => {
      if (!cols) return
      const r = cols.getBoundingClientRect(), box = layer.getBoundingClientRect()
      layer.style.setProperty('--bp-cols', `${Math.round(box.bottom - r.top)}px`)
    }
    measureCols()

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
        arrive: el.dataset.arrive !== undefined,
        wrap: el.ownerSVGElement?.querySelector<SVGGElement>('.pen-wrap') ?? null,
      }
    })
    const heads = Array.from(layer.querySelectorAll<SVGGElement>('.head'))

    // Title block sits just under the logo row (or the nav, see below).
    // At rest the logo row has scrolled away under the nav, so whichever
    // is lower — logo or nav — is the line to hang them from.
    const placeTitle = () => {
      const logo = footer?.querySelector('.footer-logo')
      if (!logo) return
      const r = logo.getBoundingClientRect()
      const navB = document.querySelector('.nav')?.getBoundingClientRect().bottom ?? 0
      const l = { left: r.left, bottom: Math.max(r.bottom, navB) }
      const box = layer.getBoundingClientRect()
      title.style.left = `${(l.left - box.left).toFixed(1)}px`
      title.style.top = `${(l.bottom - box.top + 40).toFixed(1)}px`
      // the note: from where the wordmark ends, centred in the gap between
      // the logo and the link columns
      const note = noteRef.current
      const word = footer?.querySelector('.footer-logo-word')
      const grid = footer?.querySelector('.footer-grid')
      if (note && word && grid) {
        const w = word.getBoundingClientRect(), g = grid.getBoundingClientRect()
        note.style.left = `${(w.right - box.left).toFixed(1)}px`
        note.style.top = `${((l.bottom + g.top) / 2 - 22 - box.top).toFixed(1)}px`
      }
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
    // drill: feed, spin (flutes slide + section turns), hole, chips
    const drill = art.querySelector<SVGGElement>('[data-role="drill"]')
    const flutes = art.querySelector<SVGGElement>('[data-role="flutes"]')
    const section = art.querySelector<SVGGElement>('[data-role="section"]')
    const hole = art.querySelector<SVGPathElement>('[data-role="hole"]')
    const chips = Array.from(art.querySelectorAll<SVGPathElement>('[data-role="chips"] path'))
    let drillTurn = 0
    const setSpin = (turn: number) => {
      drillTurn = turn
      flutes?.setAttribute('transform', `translate(${f2(turn % DR_PITCH)} 0)`)
      section?.setAttribute('transform', `rotate(${((turn / DR_LEAD) * 360).toFixed(2)} ${SEC.x} ${SEC.y})`)
    }
    const depthAt = (feed: number) => Math.max(0, Math.min(PLATE.x1 - PLATE.x0, PLATE.x1 - (DR.tip - feed + DR.pointLen * 0.5)))
    const frameDrill = (p: number) => {
      const { feed, turn } = drillState(p)
      drill?.setAttribute('transform', `translate(${f2(-feed)} 0)`)
      setSpin(turn)
      // hole depth follows the full-diameter part of the point; it stays cut
      // while the drill backs out (and un-cuts if you scroll back up)
      const depth = depthAt(feed)
      const x = PLATE.x1 - depthAt(drillState(Math.min(p, DRILL_THROUGH)).feed)
      hole?.setAttribute('d', `M${PLATE.x1} ${DR.y - DR.r} H${f2(x)} V${DR.y + DR.r} H${PLATE.x1}`)
      const cutting = p > DRILL_START && p < DRILL_THROUGH && depth > 0 && depth < PLATE.x1 - PLATE.x0
      chips.forEach((c, i) => {
        const ph = (((p - DRILL_START) * 60 + i / chips.length) % 1 + 1) % 1
        const side = i % 2 ? 1 : -1
        const cx = PLATE.x1 + 1 + ph * 9, cy = DR.y + side * (DR.r + 1 + ph * 7)
        c.setAttribute('transform', `translate(${f2(cx)} ${f2(cy)}) rotate(${(ph * 540).toFixed(0)}) scale(${(0.6 + ph * 0.6).toFixed(2)})`)
        c.style.opacity = cutting ? String(Math.sin(ph * Math.PI)) : '0'
      })
    }

    // power drill: parts slide apart; the chuck and the B–B rotor turn
    const parts = POWER_PARTS.map(pp => ({ ...pp, el: art.querySelector<SVGGElement>(`[data-role="${pp.role}"]`) }))
    const ribs = art.querySelector<SVGPathElement>('[data-role="ribs"]')
    const bbRotor = art.querySelector<SVGGElement>('[data-role="bb-rotor"]')
    let powerTurn = 0
    const setPowerSpin = (deg: number) => {
      powerTurn = deg
      ribs?.setAttribute('d', chuckRibs(deg))
      bbRotor?.setAttribute('transform', `rotate(${(-deg).toFixed(2)} ${BB.x} ${BB.y})`)
    }
    const framePower = (p: number) => {
      for (const pp of parts) {
        const t = easeInOutCubic(clamp01((p - pp.s) / (pp.e - pp.s)))
        pp.el?.setAttribute('transform', `translate(${f2(pp.dx * t)} ${f2(pp.dy * t)})`)
      }
      bbRotor?.setAttribute('transform', `rotate(${(-p * 120).toFixed(2)} ${BB.x} ${BB.y})`)
      powerTurn = p * 120
    }

    // caliper: the slider rides on the beam; level: the whole level tilts,
    // its bubble drifting towards the high end
    const slider = art.querySelector<SVGGElement>('[data-role="slider"]')
    const rod = art.querySelector<SVGGElement>('[data-role="rod"]')
    let calO = 0
    const setCal = (o: number) => {
      calO = o
      slider?.setAttribute('transform', `translate(${f2(o)} 0)`)
      rod?.setAttribute('transform', `translate(${f2(o)} 0)`)
    }
    const levelG = art.querySelector<SVGGElement>('[data-role="level"]')
    const bubble = art.querySelector<SVGGElement>('[data-role="bubble"]')
    const setBubble = (dx: number) => bubble?.setAttribute('transform', `translate(${f2(dx)} 0)`)
    const setLevel = (deg: number) => {
      levelG?.setAttribute('transform', `rotate(${(-deg).toFixed(3)} ${LV.px} ${LV.py})`)
      setBubble(deg * LV_BUBBLE)
    }

    let lastP = 0
    const frameArt = (p: number) => {
      if (variant === 'blade') { setBlade(-p * BLADE_TURN); return }
      if (variant === 'drill') { frameDrill(p); return }
      if (variant === 'power') { framePower(p); return }
      if (variant === 'caliper') { setCal(calOpening(p)); return }
      if (variant === 'level') { setLevel(levelTilt(p)); return }
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

    // The note types itself out once the page has come to rest at the
    // bottom (the footer logo has scrolled away under the nav by then —
    // the footer is taller than the screen by the logo's row): arrival
    // runs 0 → 1 in time, not scroll, and runs back fast on the way up.
    let arrival = 0, arrivalTo = 0, arrRaf = 0, arrLast = 0
    const ARRIVE_MS = 2600, LEAVE_MS = 450
    const stepArrival = (now: number) => {
      const dt = now - arrLast
      arrLast = now
      arrival = arrivalTo > arrival
        ? Math.min(arrivalTo, arrival + dt / ARRIVE_MS)
        : Math.max(arrivalTo, arrival - dt / LEAVE_MS)
      if (!raf) render(cur)
      arrRaf = arrival !== arrivalTo ? requestAnimationFrame(stepArrival) : 0
    }
    const arriveTo = (to: number) => {
      if (to === arrivalTo) return
      arrivalTo = to
      if (reduce) { arrival = to; if (!raf) render(cur); return }
      if (!arrRaf) { arrLast = performance.now(); arrRaf = requestAnimationFrame(stepArrival) }
    }
    const render = (p: number) => {
      placeTitle()
      frameArt(p)
      // the note steps aside, in place, as soon as the drawing starts
      if (noteRef.current) noteRef.current.classList.toggle('gone', p > 0.002)

      let pen: { wrap: SVGGElement; xy: [number, number] } | null = null
      for (const it of items) {
        const raw = clamp01(((it.arrive ? arrival : p) - it.s) / (it.e - it.s))
        const t = easeInOutSine(raw)
        const style = it.el.style
        let chars = 0
        if (it.kind === 'draw') {
          style.strokeDashoffset = String(1 - t)
          style.visibility = t > 0 ? '' : 'hidden' // a round cap would leave a dot
        }
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
    const artViewBox = art.getAttribute('viewBox')
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
      if (variant === 'drill') {
        // one more test spin, winding down, then the stamp
        const from = drillTurn
        tween(1800, t => setSpin(from + 4 * DR_LEAD * (1 - Math.pow(1 - t, 3))), () => later(stamp, 150))
        return
      }
      if (variant === 'power') {
        // test run of the exploded drivetrain: spin up, wind down, then the stamp
        const from = powerTurn
        tween(2600, t => setPowerSpin(from + 3 * 360 * easeInOutCubic(t)), () => later(stamp, 150))
        return
      }
      if (variant === 'caliper') {
        // a second check: ease the jaws off and back onto the bar
        tween(1400, t => setCal(calO + 6 * Math.sin(Math.PI * t)), () => { setCal(2 * CAL_BAR.r); later(stamp, 150) })
        return
      }
      if (variant === 'level') {
        // a nudge: the bubble swings past the marks and settles
        tween(1800, t => setBubble(7 * Math.exp(-3.5 * t) * Math.sin(6 * Math.PI * t)), () => { setBubble(0); later(stamp, 150) })
        return
      }
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

    // Scrolling back up past the finale: drop everything it added, so the
    // scroll-driven frames can play the drawing backwards from here.
    const undoFinale = () => {
      finished = false
      timers.forEach(t => window.clearTimeout(t)); timers.length = 0
      if (animRaf) { cancelAnimationFrame(animRaf); animRaf = 0 }
      layer.getAnimations({ subtree: true }).forEach(a => a.cancel())
      if (stampRef.current) stampRef.current.style.opacity = ''
      if (artViewBox) art.setAttribute('viewBox', artViewBox)
      art.style.removeProperty('--sw')
      ribs?.setAttribute('d', chuckRibs(0))
    }

    // ── Scroll-past-the-end input → eased progress (both ways) ──
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
        setHold()
        if (cur >= 1 && !finished) finale()
      } else {
        raf = requestAnimationFrame(frame)
      }
    }
    const hidden = () => getComputedStyle(layer).display === 'none'
    const atEnd = () => window.scrollY + window.innerHeight >= doc.scrollHeight - 2
    // While any of the drawing is out, the wheel belongs to it: down draws
    // on, up rewinds — the page itself only scrolls again once it's back at
    // zero. SmoothScroll (Lenis) reads this flag and stands aside.
    const setHold = () => {
      if ((overscroll > 0 || cur > 0) && atEnd()) doc.dataset.eggHold = '1'
      else delete doc.dataset.eggHold
    }
    // Returns true when the event was consumed by the drawing.
    let lastInput = 0
    let endSince = atEnd() ? 0 : Infinity // when the page last reached the bottom
    const push = (delta: number) => {
      const now = performance.now()
      const gap = now - lastInput
      lastInput = now
      if (hidden()) return false // no room for it on small screens
      if (!atEnd()) return false
      if (delta > 0) {
        if (finished) return true
        // not yet started: only a fresh scroll (or a settled page) counts
        if (overscroll <= 0 && cur <= 0 && gap < NEW_GESTURE_GAP && now - endSince < SETTLED) return false
        overscroll = Math.min(overscroll + delta, DEAD_ZONE + RANGE)
      } else {
        if (overscroll <= 0) return cur > 0 // still rewinding: hold the page
        overscroll = Math.max(0, overscroll + delta)
      }
      const next = clamp01((overscroll - DEAD_ZONE) / RANGE)
      target = reduce ? (next > 0 ? 1 : 0) : next
      if (finished && target < 1) undoFinale()
      setHold()
      if (!raf) raf = requestAnimationFrame(frame)
      return true
    }

    const onWheel = (e: WheelEvent) => {
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      if (push(d) && e.cancelable) e.preventDefault()
    }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      if (push((touchY - y) * 2) && e.cancelable) e.preventDefault()
      touchY = y
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    const onResize = () => { placeTitle(); measureCols() }
    window.addEventListener('resize', onResize)
    // Ordinary scrolling brings the footer in (its logo scrolls on up and
    // away under the nav), and at the bottom the note types itself — so
    // the natural stop at the bottom is already the blank sheet, and
    // the very next scroll draws. Scrolling back up reverses all of it.
    let scrollRaf = 0
    const onScroll = () => {
      setHold()
      if (!atEnd()) endSince = Infinity
      else if (endSince === Infinity) endSince = performance.now()
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        if (!footer || hidden()) return
        const top = footer.getBoundingClientRect().top
        const vh = window.innerHeight
        if (top >= vh) { arriveTo(0); return }
        arriveTo(atEnd() ? 1 : 0)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
      if (arrRaf) cancelAnimationFrame(arrRaf)
      delete doc.dataset.eggHold
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', onResize)
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
          right: calc(var(--gutter) - 24mm);
          bottom: calc((100vh - var(--bp-bar, 57px)) / 2 - 132mm);
        }
        .bp-nail {
          overflow: hidden; /* frames the camera move */
          width: 180mm; height: 200mm;
          right: var(--gutter);
          bottom: calc((100vh - var(--bp-bar, 57px)) / 2 - 100mm);
        }
        .bp-drill {
          overflow: hidden;
          width: 200mm; height: 180mm;
          right: var(--gutter);
          bottom: calc((100vh - var(--bp-bar, 57px)) / 2 - 90mm);
        }
        /* 1:2 — viewBox units are the drill's mm, the SVG is half that */
        .bp-power {
          overflow: hidden;
          width: 200mm; height: 132.5mm;
          right: var(--gutter);
          bottom: calc(var(--bp-cols, 300px) + 16px); /* just above the link columns */
          --sw: 2;
        }
        .bp-caliper {
          overflow: hidden;
          width: 200mm; height: 92mm;
          right: var(--gutter);
          bottom: calc(var(--bp-cols, 300px) + 32px);
          --sw: 2;
        }
        /* 1:5 */
        .bp-level {
          overflow: hidden;
          width: 192mm; height: 40mm;
          right: var(--gutter);
          bottom: calc(var(--bp-cols, 300px) + 72px);
          --sw: 5;
        }
        /* Laptop-sized screens: a touch smaller so it clears the logo and
           the link columns. */
        @media (max-width: 1365px), (max-height: 860px) {
          .bp-power { width: 172mm; height: 114mm; }
          .bp-caliper { width: 172mm; height: 79.1mm; }
          .bp-level { width: 168mm; height: 35mm; }
        }
        .bp-art.bp-caliper text { font-size: 5.4px; }
        .bp-art.bp-caliper text.mark { font-size: 4.2px; }
        .bp-art.bp-caliper .cl { stroke-dasharray: 7.4 2.12 1.06 2.12; }
        .bp-art .cal-fill { fill: #fff; stroke: none; opacity: 0; }
        .bp-art.bp-level text { font-size: 13.5px; }
        .bp-art.bp-level text.mark { font-size: 10.5px; }
        .bp-art.bp-level .cl { stroke-dasharray: 18.5 5.3 2.65 5.3; }
        .bp-art.bp-power text { font-size: 5.4px; }
        .bp-art.bp-power text.mark { font-size: 4.2px; }
        .bp-art.bp-power text.pl { font-size: 4.4px; }
        .bp-art.bp-power text.pl-h { fill: rgba(0,0,0,0.6); font-weight: 500; }
        .bp-art.bp-power text.bal { font-size: 5.4px; fill: rgba(0,0,0,0.6); }
        .bp-art.bp-power .hid { stroke-dasharray: 2.4 1.6; }
        .bp-art.bp-power .cl { stroke-dasharray: 7.4 2.12 1.06 2.12; }
        .bp-art .hole { fill: #fff; stroke: rgba(0,0,0,0.34); stroke-width: 0.3; }
        .bp-art .chips path { fill: none; stroke: rgba(0,0,0,0.45); stroke-width: 0.25; stroke-linecap: round; opacity: 0; }
        .bp-art text.mark { font-size: 2.1px; letter-spacing: 0.14em; fill: rgba(0,0,0,0.38); }
        .bp-art text.mono-s { font-size: 2.3px; }
        .bp-title { width: 460px; height: 126px; left: var(--gutter); top: 0; overflow: visible; }
        .bp-note { width: 240px; height: 44px; left: 0; top: 0; overflow: visible; transition: opacity 700ms ease; }
        .bp-note.gone { opacity: 0; }
        .bp-note text { font-size: 10px; }

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
        .bp-layer text.note { fill: rgb(0,0,0); }
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

      {variant === 'blade' ? <BladeArt /> : variant === 'drill' ? <DrillArt /> : variant === 'power' ? <PowerArt /> : variant === 'caliper' ? <CaliperArt /> : variant === 'level' ? <LevelArt /> : <NailArt />}

      {/* ── Three-line note: right of the logo's end, halfway down the gap ── */}
      <svg ref={noteRef} className="bp-note" viewBox="0 0 240 44">
        <text x="0" y="10" className="note" data-k="type" data-arrive="" data-s="0.04" data-e="0.4" data-text="// Ai derulat până la capăt." />
        <text x="0" y="24" className="note" data-k="type" data-arrive="" data-s="0.46" data-e="0.6" data-text="// Mulțumesc." />
        <text x="0" y="38" className="note" data-k="type" data-arrive="" data-s="0.66" data-e="1" data-text="// Derulează în continuare." />
        <Pen />
      </svg>

      {/* ── Title block and stamp, under the logo ── */}
      <svg ref={titleRef} className="bp-title" viewBox="0 0 460 126">
        <defs>
          <filter id="zs-bp-ink" x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="1.6" />
          </filter>
        </defs>
        {/* title block + stamp */}
        <g transform="translate(0 -22)">
          <path className="ln" pathLength={1} d="M0 22 H290 V88 H0 Z M0 44 H290 M0 66 H290 M180 22 V88" data-k="draw" data-s="0.88" data-e="0.93" />
          <text x="10" y="37" className="big" data-k="type" data-s="0.9" data-e="0.93" data-text="ZONA SCULE" />
          <text x="190" y="37" data-k="type" data-s="0.91" data-e="0.94" data-text="DESEN TEHNIC" />
          <text x="10" y="59" data-k="type" data-s="0.92" data-e="0.96" data-text={TITLE_PART[variant]} />
          <text ref={scaleRef} x="190" y="59" data-k="type" data-s="0.94" data-e="0.97" data-text={TITLE_SCALE[variant]} />
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
        </g>

        <Pen />
      </svg>
    </div>
  )
}
