'use client'
import { useEffect, useRef } from 'react'

/**
 * Homepage easter egg. Once the page is scrolled all the way to the bottom,
 * further wheel (or touch) scrolling looks like it does nothing — but after
 * a short dead zone it starts drafting a technical drawing of a circular saw
 * blade, driven by how far you keep scrolling:
 *
 *  1. the footer eases from 80vh up to fill the screen below the nav (only
 *     the gap between logo and link columns grows; the page stays pinned to
 *     the bottom, so the logo rises while the columns stay put) and faint
 *     drafting-grid paper fades in,
 *  2. a red "pen" crosshair traces the blade — centre lines, all 48 teeth
 *     round the rim, bore, slots, the printed label (typed along the
 *     blade), dimensions — while the blade slowly turns,
 *  3. the title block fills in under the logo; once complete the blade does
 *     a spin-up test run and an "APROBAT" stamp with today's date lands.
 *
 * The blade is drawn at 1:1: its SVG is sized in CSS millimetres (viewBox
 * units are mm), so a Ø216 blade is 216 CSS mm across — matching the title
 * block's "SCARA 1:1" on a standard 96-dpi screen.
 *
 * Every drawable carries data-s / data-e — its slice of the 0..1 progress —
 * and a data-k kind: draw (stroke-dashoffset, pathLength=1), grow (scale
 * along data-axis), pop (scale, arrowheads), fade (opacity) or type (text).
 */
const DEAD_ZONE = 500 // px of extra scrolling that "does nothing" first
const RANGE = 2800 // px of extra scrolling from blank to fully drawn
const GROW_END = 0.2 // progress by which the footer has grown to full height
const TURN_WHILE_DRAWING = 40 // degrees the blade turns over the whole drawing

// ── Blade geometry (mm) ──────────────────────────────────────────────────────
const C = 108 // centre
const R = 108 // tooth-tip radius (Ø216)
const TEETH = 48
const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
const pt = (r: number, deg: number) => polar(r, deg).map(v => v.toFixed(2)).join(' ')
const circle = (x: number, y: number, r: number) =>
  `M${(x + r).toFixed(2)} ${y.toFixed(2)} A${r} ${r} 0 1 0 ${(x - r).toFixed(2)} ${y.toFixed(2)} A${r} ${r} 0 1 0 ${(x + r).toFixed(2)} ${y.toFixed(2)}`
// Arrowhead with its tip at (x, y), pointing along (dx, dy).
const arrow = (x: number, y: number, dx: number, dy: number, len = 2.2, half = 0.7) => {
  const m = Math.hypot(dx, dy)
  const ux = dx / m, uy = dy / m
  const bx = x - ux * len, by = y - uy * len
  return `M${x.toFixed(2)} ${y.toFixed(2)} L${(bx - uy * half).toFixed(2)} ${(by + ux * half).toFixed(2)} L${(bx + uy * half).toFixed(2)} ${(by - ux * half).toFixed(2)} Z`
}

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
  return {
    d: `M${qx.toFixed(2)} ${qy.toFixed(2)} L${px.toFixed(2)} ${py.toFixed(2)} M${qx.toFixed(2)} ${qy.toFixed(2)} H${sx.toFixed(2)}`,
    head: arrow(px, py, px - qx, py - qy),
    tx: sx - 1.5,
    ty: qy - 1.2,
  }
}
const BORE = leader(15, 200)
const TOOTH = leader(R, 215)

type Kind = 'draw' | 'grow' | 'pop' | 'fade' | 'type'
type Item = {
  el: SVGGraphicsElement
  s: number
  e: number
  kind: Kind
  text: string
  len: number
  head: SVGGElement | null
  rotor: boolean
}

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function FooterBlueprint() {
  const layerRef = useRef<HTMLDivElement>(null)
  const rotorRef = useRef<SVGGElement>(null)
  const titleRef = useRef<SVGSVGElement>(null)
  const stampRef = useRef<SVGGElement>(null)
  const dateRef = useRef<SVGTextElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const rotor = rotorRef.current
    const title = titleRef.current
    if (!layer || !rotor || !title) return
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
        head: el.ownerSVGElement?.querySelector<SVGGElement>('.head') ?? null,
        rotor: !!el.closest('.bp-rotor'),
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

    let angle = 0
    const setAngle = (a: number) => {
      angle = a
      rotor.setAttribute('transform', `rotate(${a.toFixed(3)} ${C} ${C})`)
    }
    const spin = (x: number, y: number): [number, number] => {
      if (!angle) return [x, y]
      const a = (angle * Math.PI) / 180
      const dx = x - C, dy = y - C
      return [C + dx * Math.cos(a) - dy * Math.sin(a), C + dx * Math.sin(a) + dy * Math.cos(a)]
    }

    // Where the pen sits for a given item at local progress t.
    const penAt = (it: Item, t: number, chars: number): [number, number] | null => {
      let p: [number, number] | null = null
      if (it.kind === 'draw') {
        const q = (it.el as SVGGeometryElement).getPointAtLength(it.len * t)
        p = [q.x, q.y]
      } else if (it.kind === 'grow') {
        const b = it.el.getBBox()
        p = it.el.dataset.axis === 'y' ? [b.x + b.width / 2, b.y + b.height * t] : [b.x + b.width * t, b.y + b.height / 2]
      } else if (it.kind === 'type' && chars > 0) {
        try {
          const q = (it.el as unknown as SVGTextContentElement).getEndPositionOfChar(chars - 1)
          p = [q.x, q.y]
        } catch { p = null }
      }
      return p && it.rotor ? spin(p[0], p[1]) : p
    }

    let lastGrow = 0
    const render = (p: number) => {
      // Footer grows to full height over the first part of the drawing.
      const grow = easeInOutCubic(Math.min(1, p / GROW_END))
      if (footer && grow !== lastGrow) {
        lastGrow = grow
        footer.style.setProperty('--footer-grow', grow.toFixed(4))
        window.scrollTo(0, doc.scrollHeight)
      }
      placeTitle()
      setAngle(-p * TURN_WHILE_DRAWING)

      let pen: { head: SVGGElement; xy: [number, number] } | null = null
      for (const it of items) {
        const raw = Math.max(0, Math.min(1, (p - it.s) / (it.e - it.s)))
        const t = easeInOutSine(raw)
        const style = it.el.style
        let chars = 0
        if (it.kind === 'draw') style.strokeDashoffset = String(1 - t)
        else if (it.kind === 'grow') style.transform = it.el.dataset.axis === 'y' ? `scaleY(${t})` : `scaleX(${t})`
        else if (it.kind === 'pop') style.transform = `scale(${raw < 1 ? easeInOutCubic(raw) * 1.15 : 1})`
        else if (it.kind === 'fade') style.opacity = String(t)
        else {
          chars = Math.round(it.text.length * raw)
          it.el.textContent = it.text.slice(0, chars) + (raw > 0 && raw < 1 ? '_' : '')
        }
        if (raw > 0 && raw < 1 && it.head && it.kind !== 'pop' && it.kind !== 'fade') {
          const xy = penAt(it, t, chars)
          if (xy) pen = { head: it.head, xy }
        }
      }
      for (const h of heads) {
        if (pen && h === pen.head) {
          h.setAttribute('transform', `translate(${pen.xy[0].toFixed(2)} ${pen.xy[1].toFixed(2)})`)
          h.style.opacity = '1'
        } else {
          h.style.opacity = '0'
        }
      }
    }
    render(0)

    // ── Finale: spin-up test run, then the stamp ──
    let finished = false
    let spinRaf = 0
    let stampTimer = 0
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
      window.setTimeout(() => {
        title.animate([{ translate: '0 0' }, { translate: '0 2px' }, { translate: '0 0' }], { duration: 200, easing: 'ease-out' })
      }, 290)
    }
    const finale = () => {
      finished = true
      if (reduce) { stamp(); return }
      const from = angle
      const turn = 2 * 360 + 30
      const duration = 3200
      const t0 = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / duration)
        setAngle(from - turn * easeInOutCubic(t))
        if (t < 1) spinRaf = requestAnimationFrame(step)
        else stampTimer = window.setTimeout(stamp, 150)
      }
      spinRaf = requestAnimationFrame(step)
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
      const next = Math.max(0, Math.min(1, (overscroll - DEAD_ZONE) / RANGE))
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
      if (spinRaf) cancelAnimationFrame(spinRaf)
      window.clearTimeout(stampTimer)
    }
  }, [])

  const slots = [22.5, 112.5, 202.5, 292.5]
  const ornaments = [67.5, 157.5, 247.5, 337.5]
  // rotation-direction arrow printed on the blade (CCW, near the top)
  const dirArc = { d: `M${pt(90, -60)} A90 90 0 0 0 ${pt(90, -100)}`, end: polar(90, -100) }
  const dirTangent: [number, number] = [Math.sin((-100 * Math.PI) / 180), -Math.cos((-100 * Math.PI) / 180)]

  return (
    <div ref={layerRef} className="bp-layer" aria-hidden="true">
      <style>{`
        .bp-layer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        @media (max-width: 1023px) { .bp-layer { display: none; } }
        .bp-layer svg { position: absolute; overflow: visible; }
        /* 1:1 — viewBox units are millimetres */
        .bp-blade {
          width: 280mm; height: 264mm;
          right: calc(12px - 24mm);
          bottom: calc((100vh - 52px - var(--bp-bar, 57px)) / 2 - 132mm);
        }
        .bp-title { width: 460px; height: 96px; left: 12px; top: 0; }

        /* Stroke widths are in each SVG's own units — mm on the blade
           (0.265mm ≈ 1px), px on the title block. No non-scaling-stroke:
           it would measure the pathLength-based draw dashes in screen px. */
        .bp-layer .ln { fill: none; stroke: rgba(0,0,0,0.2); stroke-dasharray: 1; stroke-dashoffset: 1; stroke-linecap: round; stroke-linejoin: round; }
        .bp-layer .ln.thin { stroke: rgba(0,0,0,0.15); }
        .bp-layer .ln.strong { stroke: rgba(0,0,0,0.34); }
        .bp-layer .ln.dim { stroke: rgba(217,44,43,0.55); }
        .bp-blade .ln { stroke-width: 0.265; }
        .bp-blade .ln.strong { stroke-width: 0.33; }
        .bp-title .ln { stroke-width: 1; }
        .bp-layer .cl { fill: none; stroke: rgba(0,0,0,0.16); stroke-width: 0.265; stroke-dasharray: 3.7 1.06 0.53 1.06; transform-box: fill-box; }
        .bp-layer .cl[data-axis="x"] { transform-origin: left center; transform: scaleX(0); }
        .bp-layer .cl[data-axis="y"] { transform-origin: center top; transform: scaleY(0); }
        .bp-layer .arrow { fill: rgba(217,44,43,0.7); transform-box: fill-box; transform-origin: center; transform: scale(0); }
        .bp-layer .paper { opacity: 0; }
        .bp-layer text { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.08em; fill: rgba(0,0,0,0.45); }
        .bp-blade text { font-size: 2.7px; }
        .bp-title text { font-size: 10px; }
        .bp-layer text.red { fill: rgba(217,44,43,0.75); }
        .bp-layer text.big { fill: rgba(0,0,0,0.6); font-weight: 500; }
        .bp-title text.big { font-size: 11px; }
        .bp-blade text.label { font-size: 3.3px; letter-spacing: 0.22em; fill: rgba(0,0,0,0.32); }
        .bp-layer .head { opacity: 0; transition: opacity 250ms ease; }
        .bp-layer .head circle { fill: rgb(217,44,43); }
        .bp-layer .head path { stroke: rgba(217,44,43,0.8); stroke-width: 0.8; fill: none; vector-effect: non-scaling-stroke; }
        .bp-layer .stamp-ink { opacity: 0; transform-box: fill-box; transform-origin: center; }
        .bp-layer .stamp-ink rect { fill: none; stroke: rgba(217,44,43,0.8); }
        .bp-layer .stamp-ink text { fill: rgba(217,44,43,0.85); text-anchor: middle; }
        .bp-layer .stamp-ink .stamp-word { font-size: 15px; font-weight: 500; letter-spacing: 0.28em; }
        .bp-layer .stamp-ink .stamp-date { font-size: 8.5px; letter-spacing: 0.14em; }
      `}</style>

      {/* ── The blade, 1:1 ── */}
      <svg className="bp-blade" viewBox="-40 -24 280 264">
        <defs>
          <pattern id="zs-bp-minor" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5 0 H0 V5" fill="none" stroke="rgba(0,0,0,0.035)" strokeWidth="0.15" />
          </pattern>
          <pattern id="zs-bp-major" width="25" height="25" patternUnits="userSpaceOnUse" x={C} y={C}>
            <rect width="25" height="25" fill="url(#zs-bp-minor)" />
            <path d="M25 0 H0 V25" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.22" />
          </pattern>
          <radialGradient id="zs-bp-fade" cx={C} cy={C} r="150" gradientUnits="userSpaceOnUse">
            <stop offset="0.55" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="zs-bp-mask">
            <rect x="-40" y="-24" width="280" height="264" fill="url(#zs-bp-fade)" />
          </mask>
          <path id="zs-bp-label-path" d={`M${pt(54, 200)} A54 54 0 1 1 ${pt(54, 199.9)}`} />
        </defs>

        <rect className="paper" x="-40" y="-24" width="280" height="264" fill="url(#zs-bp-major)" mask="url(#zs-bp-mask)" data-k="fade" data-s="0.02" data-e="0.12" />

        {/* centre lines (the axes don't turn with the blade) */}
        <line className="cl" x1="-14" y1={C} x2="230" y2={C} data-axis="x" data-k="grow" data-s="0.06" data-e="0.15" />
        <line className="cl" x1={C} y1="-14" x2={C} y2="230" data-axis="y" data-k="grow" data-s="0.09" data-e="0.18" />

        <g ref={rotorRef} className="bp-rotor">
          {/* all 48 teeth, traced once round the rim */}
          <path className="ln strong" pathLength={1} d={TEETH_PATH} data-k="draw" data-s="0.14" data-e="0.46" />
          {/* bore Ø30, drive-pin holes, clamping flange */}
          <path className="ln strong" pathLength={1} d={circle(C, C, 15)} data-k="draw" data-s="0.46" data-e="0.5" />
          <path className="ln" pathLength={1} d={circle(...polar(24, 90), 2.2)} data-k="draw" data-s="0.5" data-e="0.52" />
          <path className="ln" pathLength={1} d={circle(...polar(24, 270), 2.2)} data-k="draw" data-s="0.51" data-e="0.53" />
          <path className="ln thin" pathLength={1} d={circle(C, C, 40)} data-k="draw" data-s="0.52" data-e="0.56" />
          {/* expansion slots with stress-relief holes */}
          {slots.map((a, i) => {
            const [hx, hy] = polar(80.5, a)
            return (
              <path key={a} className="ln" pathLength={1} d={`M${pt(100, a)} L${pt(82, a)} ${circle(hx, hy, 1.5)}`}
                data-k="draw" data-s={(0.55 + i * 0.02).toFixed(3)} data-e={(0.58 + i * 0.02).toFixed(3)} />
            )
          })}
          {/* noise-damping laser ornaments */}
          {ornaments.map((a, i) => (
            <path key={a} className="ln thin" pathLength={1} d={`M${pt(68, a - 12)} A68 68 0 0 1 ${pt(68, a + 12)}`}
              data-k="draw" data-s={(0.62 + i * 0.015).toFixed(3)} data-e={(0.65 + i * 0.015).toFixed(3)} />
          ))}
          {/* printed label, typed along the blade */}
          <text className="label">
            <textPath href="#zs-bp-label-path" data-k="type" data-s="0.68" data-e="0.76"
              data-text="ZONA SCULE · Ø216 × 30 · Z48 · HM · n max 8 800 min⁻¹" />
          </text>
          {/* rotation direction */}
          <path className="ln dim" pathLength={1} d={dirArc.d} data-k="draw" data-s="0.74" data-e="0.77" />
          <path className="arrow" d={arrow(dirArc.end[0], dirArc.end[1], dirTangent[0], dirTangent[1])} data-k="pop" data-s="0.765" data-e="0.785" />
        </g>

        {/* Ø216 — diameter through the centre, text outside left */}
        <path className="ln dim" pathLength={1} d={`M${2 * R} ${C} H-10`} data-k="draw" data-s="0.78" data-e="0.82" />
        <path className="arrow" d={arrow(0, C, -1, 0)} data-k="pop" data-s="0.805" data-e="0.825" />
        <path className="arrow" d={arrow(2 * R, C, 1, 0)} data-k="pop" data-s="0.79" data-e="0.81" />
        <text x="-12" y={C - 1.2} className="red" textAnchor="end" data-k="type" data-s="0.81" data-e="0.84" data-text="Ø 216" />

        {/* bore */}
        <path className="ln dim" pathLength={1} d={BORE.d} data-k="draw" data-s="0.82" data-e="0.85" />
        <path className="arrow" d={BORE.head} data-k="pop" data-s="0.84" data-e="0.86" />
        <text x={BORE.tx} y={BORE.ty} className="red" textAnchor="end" data-k="type" data-s="0.84" data-e="0.87" data-text="Ø 30 H7" />

        {/* teeth */}
        <path className="ln dim" pathLength={1} d={TOOTH.d} data-k="draw" data-s="0.85" data-e="0.88" />
        <path className="arrow" d={TOOTH.head} data-k="pop" data-s="0.87" data-e="0.89" />
        <text x={TOOTH.tx} y={TOOTH.ty} className="red" textAnchor="end" data-k="type" data-s="0.87" data-e="0.9" data-text="Z 48" />

        {/* the pen (drawn in px, scaled into mm) */}
        <g className="head">
          <g transform="scale(0.2646)">
            <path d="M-8 0 H-3.5 M3.5 0 H8 M0 -8 V-3.5 M0 3.5 V8" />
            <circle r="1.8" />
          </g>
        </g>
      </svg>

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
        <text x="10" y="59" data-k="type" data-s="0.92" data-e="0.96" data-text="DISC CIRCULAR Ø216 × 30" />
        <text x="190" y="59" data-k="type" data-s="0.94" data-e="0.97" data-text="SCARA 1:1" />
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

        <g className="head">
          <path d="M-8 0 H-3.5 M3.5 0 H8 M0 -8 V-3.5 M0 3.5 V8" />
          <circle r="1.8" />
        </g>
      </svg>
    </div>
  )
}
