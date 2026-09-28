'use client'
import { useEffect, useRef } from 'react'

/**
 * Homepage hero, right side (wide desktop only): a quiet drafting loop — a
 * red pen crosshair sketches one tool in a few hairline strokes, dimensions
 * and a caption type in, it holds, the lines are wiped off, and the next
 * tool is drawn. Same line language as the footer easter egg
 * (FooterBlueprint), at a fraction of the detail.
 *
 * Each figure is a <g data-fig> whose children carry data-k: draw (stroke,
 * pathLength=1), fade (centre-lines, opacity), pop (arrowheads) or type
 * (text, from data-text). Timings are laid out at runtime from stroke
 * lengths, in document order. Runs only while the hero is on screen and
 * the tab is visible; reduced motion shows the first figure, finished.
 */

const f1 = (n: number) => n.toFixed(1)
const arrow = (x: number, y: number, dx: number, dy: number, len = 6, half = 2) => {
  const m = Math.hypot(dx, dy) || 1
  const ux = dx / m, uy = dy / m
  const bx = x - ux * len, by = y - uy * len
  return `M${f1(x)} ${f1(y)} L${f1(bx - uy * half)} ${f1(by + ux * half)} L${f1(bx + uy * half)} ${f1(by - ux * half)} Z`
}

// Saw blade: 24 teeth, gullets at r 97, tips at r 108
const BLADE = { x: 240, y: 168 }
const TEETH = (() => {
  const n = 24, r0 = 97, r1 = 108
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n, b = a + ((2 * Math.PI) / n) * 0.72
    d += `${i ? 'L' : 'M'}${f1(BLADE.x + r0 * Math.cos(a))} ${f1(BLADE.y + r0 * Math.sin(a))} L${f1(BLADE.x + r1 * Math.cos(b))} ${f1(BLADE.y + r1 * Math.sin(b))} `
  }
  return d + 'Z'
})()
const circle = (x: number, y: number, r: number) => `M${f1(x + r)} ${f1(y)} A${r} ${r} 0 1 1 ${f1(x - r)} ${f1(y)} A${r} ${r} 0 1 1 ${f1(x + r)} ${f1(y)}`
const SLOTS = [45, 135, 225, 315].map(deg => {
  const a = (deg * Math.PI) / 180
  const p = (r: number) => `${f1(BLADE.x + r * Math.cos(a))} ${f1(BLADE.y + r * Math.sin(a))}`
  return `M${p(92)} L${p(74)} ${circle(BLADE.x + 72 * Math.cos(a), BLADE.y + 72 * Math.sin(a), 2)}`
}).join(' ')

// Drill: helix lines along the fluted body
const FLUTES = (() => {
  let d = ''
  for (let x = 122; x <= 272; x += 21) d += `M${x} 163 C${x + 5} 170 ${x + 9} 180 ${x + 13} 187 `
  return d.trim()
})()

type Kind = 'draw' | 'fade' | 'pop' | 'type'
type Step = { el: SVGGraphicsElement; kind: Kind; s: number; e: number; text: string }

const T_HOLD = 2600 // ms the finished figure stays up
const T_WIPE = 900 // ms to wipe it off
const T_GAP = 500 // ms of blank sheet before the next one

export default function HeroSketch() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const figs = Array.from(svg.querySelectorAll<SVGGElement>('[data-fig]'))
    const head = svg.querySelector<SVGGElement>('.hs-head')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // Lay out each figure's timeline: strokes one after another (slightly
    // overlapping), paced by length; then the rest in quick succession.
    const plans = figs.map(fig => {
      const steps: Step[] = []
      let t = 0
      for (const el of Array.from(fig.querySelectorAll<SVGGraphicsElement>('[data-k]'))) {
        const kind = el.dataset.k as Kind
        let dur: number
        if (kind === 'draw') dur = Math.max(260, Math.min(1100, (el as SVGGeometryElement).getTotalLength() * 2.6))
        else if (kind === 'type') dur = 28 * (el.dataset.text ?? '').length
        else dur = kind === 'fade' ? 500 : 180
        steps.push({ el, kind, s: t, e: t + dur, text: el.dataset.text ?? '' })
        t += kind === 'draw' ? dur * 0.82 : dur * 0.6
      }
      const drawn = Math.max(...steps.map(s => s.e))
      return { fig, steps, drawn, total: drawn + T_HOLD + T_WIPE + T_GAP }
    })

    const paint = (i: number, t: number) => {
      const { steps, drawn } = plans[i]
      const wipe = Math.max(0, Math.min(1, (t - drawn - T_HOLD) / T_WIPE))
      let pen: [number, number] | null = null
      steps.forEach((st, k) => {
        const raw = Math.max(0, Math.min(1, (t - st.s) / (st.e - st.s)))
        const e = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2
        // the wipe runs through the strokes in drawing order, staggered
        const w = Math.max(0, Math.min(1, wipe * 1.6 - (k / steps.length) * 0.6))
        const style = st.el.style
        if (st.kind === 'draw') {
          style.strokeDashoffset = String(w > 0 ? -w : 1 - e)
          if (raw > 0 && raw < 1) {
            const g = st.el as SVGGeometryElement
            const q = g.getPointAtLength(g.getTotalLength() * e)
            pen = [q.x, q.y]
          }
        } else if (st.kind === 'fade') style.opacity = String(e * (1 - w))
        else if (st.kind === 'pop') style.opacity = String(raw >= 1 ? 1 - w : 0)
        else {
          const n = Math.round(st.text.length * raw * (1 - w))
          st.el.textContent = st.text.slice(0, n) + (raw > 0 && raw < 1 ? '_' : '')
        }
      })
      if (head) {
        head.style.opacity = pen ? '1' : '0'
        if (pen) head.setAttribute('transform', `translate(${f1(pen[0])} ${f1(pen[1])})`)
      }
    }

    const show = (i: number) => figs.forEach((f, k) => { f.style.display = k === i ? '' : 'none' })

    if (reduce) { show(0); paint(0, plans[0].drawn); return }

    let idx = 0, t = 0, last = 0, raf = 0
    let onScreen = true
    show(0)
    const tick = (now: number) => {
      t += Math.min(64, now - (last || now)) // no jump after a pause
      last = now
      if (t >= plans[idx].total) {
        paint(idx, plans[idx].total) // leave it blank
        idx = (idx + 1) % plans.length
        t = 0
        show(idx)
      }
      paint(idx, t)
      raf = requestAnimationFrame(tick)
    }
    const run = () => {
      const want = onScreen && document.visibilityState === 'visible'
      if (want && !raf) { last = 0; raf = requestAnimationFrame(tick) }
      if (!want && raf) { cancelAnimationFrame(raf); raf = 0 }
    }
    const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; run() })
    io.observe(svg)
    document.addEventListener('visibilitychange', run)
    run()
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', run)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <svg ref={ref} className="hero-sketch" viewBox="0 0 480 360" aria-hidden="true">
      <style>{`
        .hero-sketch { overflow: visible; }
        .hero-sketch .ln { fill: none; stroke: rgba(0,0,0,0.3); stroke-width: 1.1; stroke-dasharray: 1; stroke-dashoffset: 1; stroke-linecap: round; stroke-linejoin: round; }
        .hero-sketch .ln.thin { stroke: rgba(0,0,0,0.16); stroke-width: 0.9; }
        .hero-sketch .ln.dim { stroke: rgba(217,44,43,0.5); stroke-width: 0.8; }
        .hero-sketch .cl { fill: none; stroke: rgba(0,0,0,0.16); stroke-width: 0.8; stroke-dasharray: 14 4 2 4; opacity: 0; }
        .hero-sketch .arr { fill: rgba(217,44,43,0.65); opacity: 0; }
        .hero-sketch text { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.08em; fill: rgba(0,0,0,0.42); }
        .hero-sketch text.red { fill: rgba(217,44,43,0.75); }
        .hero-sketch .corner { fill: none; stroke: rgba(0,0,0,0.14); stroke-width: 0.8; }
        .hero-sketch .hs-head { opacity: 0; transition: opacity 200ms ease; }
        .hero-sketch .hs-head path { stroke: rgba(217,44,43,0.8); stroke-width: 0.9; fill: none; }
        .hero-sketch .hs-head circle { fill: rgb(217,44,43); }
      `}</style>

      {/* sheet corners — static */}
      <path className="corner" d="M0 14 V0 H14 M466 0 H480 V14 M480 346 V360 H466 M14 360 H0 V346" />

      {/* 01 — combination wrench */}
      <g data-fig="">
        <path className="cl" d="M78 170 H440 M380 124 V216" data-k="fade" />
        <path className="ln" pathLength={1} d="M163 162 A34 34 0 0 0 97.5 160 L122 160 A10 10 0 0 1 122 180 L97.5 180 A34 34 0 0 0 163 178" data-k="draw" />
        <path className="ln" pathLength={1} d="M163 162 L350.3 158" data-k="draw" />
        <path className="ln" pathLength={1} d="M350.3 158 A32 32 0 1 1 350.3 182" data-k="draw" />
        <path className="ln" pathLength={1} d="M350.3 182 L163 178" data-k="draw" />
        <path className="ln thin" pathLength={1} d="M397 170 L388.5 184.7 L371.5 184.7 L363 170 L371.5 155.3 L388.5 155.3 Z" data-k="draw" />
        <path className="ln thin" pathLength={1} d="M182 166.5 L330 163.5 M182 173.5 L330 176.5" data-k="draw" />
        <path className="ln dim" pathLength={1} d="M96 150 V104 M412 150 V104 M96 110 H412" data-k="draw" />
        <path className="arr" d={`${arrow(96, 110, -1, 0)} ${arrow(412, 110, 1, 0)}`} data-k="pop" />
        <text className="red" x="254" y="103" textAnchor="middle" data-k="type" data-text="210" />
        <text x="0" y="336" data-k="type" data-text="FIG. 01 — CHEIE COMBINATĂ 17 · CrV" />
      </g>

      {/* 02 — claw hammer */}
      <g data-fig="">
        <path className="cl" d="M240 60 V326 M128 111 H346" data-k="fade" />
        <path className="ln" pathLength={1} d="M154 92 H250 C272 92 300 96 322 112 C300 106 276 108 262 114 V130 H154 Q148 111 154 92 Z" data-k="draw" />
        <path className="ln thin" pathLength={1} d="M170 92 V130" data-k="draw" />
        <path className="ln" pathLength={1} d="M228 130 L222 300 Q240 312 258 300 L252 130" data-k="draw" />
        <path className="ln thin" pathLength={1} d="M223.5 252 H256.5 M223 266 H257 M222.5 280 H257.5" data-k="draw" />
        <path className="ln dim" pathLength={1} d="M154 86 V62 M322 106 V62 M154 68 H322" data-k="draw" />
        <path className="arr" d={`${arrow(154, 68, -1, 0)} ${arrow(322, 68, 1, 0)}`} data-k="pop" />
        <text className="red" x="238" y="61" textAnchor="middle" data-k="type" data-text="130" />
        <text x="0" y="336" data-k="type" data-text="FIG. 02 — CIOCAN CU GHEARĂ · 500 g" />
      </g>

      {/* 03 — circular saw blade */}
      <g data-fig="">
        <path className="cl" d={`M${BLADE.x - 128} ${BLADE.y} H${BLADE.x + 128} M${BLADE.x} ${BLADE.y - 128} V${BLADE.y + 128}`} data-k="fade" />
        <path className="ln" pathLength={1} d={TEETH} data-k="draw" />
        <path className="ln" pathLength={1} d={circle(BLADE.x, BLADE.y, 15)} data-k="draw" />
        <path className="ln thin" pathLength={1} d={circle(BLADE.x, BLADE.y, 38)} data-k="draw" />
        <path className="ln thin" pathLength={1} d={SLOTS} data-k="draw" />
        <path className="ln dim" pathLength={1} d="M316.4 91.6 L352 56 H396" data-k="draw" />
        <path className="arr" d={arrow(316.4, 91.6, -1, 1)} data-k="pop" />
        <text className="red" x="358" y="50" data-k="type" data-text="Ø 216" />
        <text x="0" y="336" data-k="type" data-text="FIG. 03 — DISC FERĂSTRĂU Ø216 × 30 · Z24" />
      </g>

      {/* 04 — twist drill */}
      <g data-fig="">
        <path className="cl" d="M82 175 H420" data-k="fade" />
        <path className="ln" pathLength={1} d="M116 163 L100 175 L116 187" data-k="draw" />
        <path className="ln" pathLength={1} d="M116 163 H290 M116 187 H290" data-k="draw" />
        <path className="ln thin" pathLength={1} d={FLUTES} data-k="draw" />
        <path className="ln" pathLength={1} d="M290 163 C282 170 286 180 290 187" data-k="draw" />
        <path className="ln" pathLength={1} d="M290 163 H398 L400 165 V185 L398 187 H290" data-k="draw" />
        <path className="ln dim" pathLength={1} d="M100 181 V230 M400 191 V230 M100 224 H400" data-k="draw" />
        <path className="arr" d={`${arrow(100, 224, -1, 0)} ${arrow(400, 224, 1, 0)}`} data-k="pop" />
        <text className="red" x="250" y="218" textAnchor="middle" data-k="type" data-text="133" />
        <path className="ln dim" pathLength={1} d="M204 163 L222 130 H250" data-k="draw" />
        <path className="arr" d={arrow(204, 163, -18, 33)} data-k="pop" />
        <text className="red" x="226" y="124" data-k="type" data-text="Ø 10 h8" />
        <text x="0" y="336" data-k="type" data-text="FIG. 04 — BURGHIU HSS-G Ø10 · DIN 338" />
      </g>

      <g className="hs-head">
        <path d="M-8 0 H-3.5 M3.5 0 H8 M0 -8 V-3.5 M0 3.5 V8" />
        <circle r="1.8" />
      </g>
    </svg>
  )
}
