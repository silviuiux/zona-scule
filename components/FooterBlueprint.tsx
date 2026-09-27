'use client'
import { useEffect, useRef } from 'react'

/**
 * Homepage easter egg. Once the page is scrolled all the way to the bottom,
 * further wheel (or touch) scrolling looks like it does nothing — but after
 * a short dead zone it starts drafting a faint technical drawing of a drill
 * bit beside the footer logo, driven by how far you keep scrolling:
 *
 *  1. the footer eases from 80vh up to fill the screen below the nav
 *     (the page stays pinned to the bottom, so it reads as the footer
 *     rising) while drafting-grid paper fades in,
 *  2. a small red "pen" crosshair traces each line in turn (outline,
 *     flutes, centre line, dimensions with arrowheads, title block) while
 *     labels type themselves out behind a caret,
 *  3. once complete, the drill does a short spin-up test run (flutes
 *     spiralling along the body) and an "APROBAT" stamp with today's date
 *     lands on the sheet.
 *
 * Every drawable carries data-s / data-e — its slice of the 0..1 progress —
 * and a data-k kind: draw (stroke-dashoffset, pathLength=1), grow (scaleX),
 * pop (scale, for arrowheads), fade (opacity) or type (text). Scrolling
 * back up leaves the drawing as it is.
 */
const DEAD_ZONE = 500 // px of extra scrolling that "does nothing" first
const RANGE = 2600 // px of extra scrolling from blank to fully drawn
const FLUTE_PITCH = 50 // px between flutes — the spin loops by this much
const GROW_END = 0.2 // progress by which the footer has grown to full height

type Kind = 'draw' | 'grow' | 'pop' | 'fade' | 'type'
type Item = { el: SVGGraphicsElement; s: number; e: number; kind: Kind; text: string; len: number }

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function FooterBlueprint() {
  const svgRef = useRef<SVGSVGElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const flutesRef = useRef<SVGGElement>(null)
  const stampRef = useRef<SVGGElement>(null)
  const dateRef = useRef<SVGTextElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const head = headRef.current
    if (!svg || !head) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const footer = svg.closest('footer')
    const doc = document.documentElement

    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    if (dateRef.current) dateRef.current.textContent = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ZS`

    const items: Item[] = Array.from(svg.querySelectorAll<SVGGraphicsElement>('[data-k]')).map(el => {
      const kind = el.dataset.k as Kind
      return {
        el, kind,
        s: +el.dataset.s!, e: +el.dataset.e!,
        text: kind === 'type' ? el.dataset.text ?? '' : '',
        len: kind === 'draw' ? (el as SVGGeometryElement).getTotalLength() : 0,
      }
    })

    // Where the pen sits for a given item at local progress t.
    const penAt = (it: Item, t: number): [number, number] | null => {
      if (it.kind === 'draw') {
        const p = (it.el as SVGGeometryElement).getPointAtLength(it.len * t)
        return [p.x, p.y]
      }
      if (it.kind === 'grow') {
        const b = it.el.getBBox()
        return [b.x + b.width * t, b.y + b.height / 2]
      }
      if (it.kind === 'type') {
        const b = it.el.getBBox()
        return [b.x + b.width, b.y + b.height * 0.7]
      }
      return null
    }

    let lastGrow = 0
    const render = (p: number) => {
      // Footer grows to full height over the first fifth of the drawing.
      const grow = easeInOutCubic(Math.min(1, p / GROW_END))
      if (footer && grow !== lastGrow) {
        lastGrow = grow
        footer.style.setProperty('--footer-grow', grow.toFixed(4))
        window.scrollTo(0, doc.scrollHeight)
      }

      let pen: [number, number] | null = null
      for (const it of items) {
        const raw = Math.max(0, Math.min(1, (p - it.s) / (it.e - it.s)))
        const t = easeInOutSine(raw)
        const style = it.el.style
        if (it.kind === 'draw') style.strokeDashoffset = String(1 - t)
        else if (it.kind === 'grow') style.transform = `scaleX(${t})`
        else if (it.kind === 'pop') style.transform = `scale(${raw < 1 ? easeInOutCubic(raw) * 1.15 : 1})`
        else if (it.kind === 'fade') style.opacity = String(t)
        else {
          const n = Math.round(it.text.length * raw)
          it.el.textContent = it.text.slice(0, n) + (raw > 0 && raw < 1 ? '_' : '')
        }
        if (raw > 0 && raw < 1 && it.kind !== 'pop' && it.kind !== 'fade') pen = penAt(it, t) ?? pen
      }
      if (pen) {
        head.setAttribute('transform', `translate(${pen[0].toFixed(1)} ${pen[1].toFixed(1)})`)
        head.style.opacity = '1'
      } else {
        head.style.opacity = '0'
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
      // the sheet takes the hit
      window.setTimeout(() => {
        svg.animate([{ translate: '0 0' }, { translate: '0 2px' }, { translate: '0 0' }], { duration: 200, easing: 'ease-out' })
      }, 290)
    }
    const finale = () => {
      finished = true
      const flutes = flutesRef.current
      if (reduce || !flutes) { stamp(); return }
      const distance = FLUTE_PITCH * 10
      const duration = 2800
      const t0 = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / duration)
        // right-hand twist drill: flutes run tip → shank as it turns
        flutes.setAttribute('transform', `translate(${((distance * easeInOutCubic(t)) % FLUTE_PITCH).toFixed(2)} 0)`)
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
      if (getComputedStyle(svg).display === 'none') return // mobile: no room for it
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
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      if (raf) cancelAnimationFrame(raf)
      if (spinRaf) cancelAnimationFrame(spinRaf)
      window.clearTimeout(stampTimer)
    }
  }, [])

  // Flutes, one pitch apart. The first sits left of the body clip (hidden)
  // and the last runs past the shank end, so the spin loops seamlessly.
  const flutes = [80, 130, 180, 230, 280, 330, 380, 430]
  const fluteTiming = (i: number) => {
    const k = Math.max(0, i - 1)
    return { s: (0.24 + k * 0.02).toFixed(3), e: (0.29 + k * 0.02).toFixed(3) }
  }

  return (
    <svg ref={svgRef} className="footer-blueprint" viewBox="0 0 760 250" aria-hidden="true">
      <style>{`
        .footer-blueprint { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: min(760px, 56%); height: auto; pointer-events: none; overflow: visible; }
        .footer-blueprint .ln { fill: none; stroke: rgba(0,0,0,0.2); stroke-width: 1; vector-effect: non-scaling-stroke; stroke-dasharray: 1; stroke-dashoffset: 1; stroke-linecap: round; stroke-linejoin: round; }
        .footer-blueprint .ln.strong { stroke: rgba(0,0,0,0.38); stroke-width: 1.25; }
        .footer-blueprint .ln.thin { stroke: rgba(0,0,0,0.16); }
        .footer-blueprint .ln.dim { stroke: rgba(217,44,43,0.55); }
        .footer-blueprint .cl { fill: none; stroke: rgba(0,0,0,0.18); stroke-width: 1; stroke-dasharray: 14 4 2 4; transform-box: fill-box; transform-origin: left center; transform: scaleX(0); }
        .footer-blueprint .arrow { fill: rgba(217,44,43,0.7); transform-box: fill-box; transform-origin: center; transform: scale(0); }
        .footer-blueprint .paper { opacity: 0; }
        .footer-blueprint text { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.08em; fill: rgba(0,0,0,0.45); }
        .footer-blueprint text.red { fill: rgba(217,44,43,0.75); }
        .footer-blueprint text.big { font-size: 11px; fill: rgba(0,0,0,0.6); font-weight: 500; }
        .footer-blueprint .head { opacity: 0; transition: opacity 250ms ease; }
        .footer-blueprint .head circle { fill: rgb(217,44,43); }
        .footer-blueprint .head path { stroke: rgba(217,44,43,0.8); stroke-width: 0.8; fill: none; }
        .footer-blueprint .stamp-ink { opacity: 0; transform-box: fill-box; transform-origin: center; }
        .footer-blueprint .stamp-ink rect { fill: none; stroke: rgba(217,44,43,0.8); }
        .footer-blueprint .stamp-ink text { fill: rgba(217,44,43,0.85); text-anchor: middle; }
        .footer-blueprint .stamp-ink .stamp-word { font-size: 15px; font-weight: 500; letter-spacing: 0.28em; }
        .footer-blueprint .stamp-ink .stamp-date { font-size: 8.5px; letter-spacing: 0.14em; }
        @media (max-width: 1023px) { .footer-blueprint { display: none; } }
      `}</style>

      <defs>
        <pattern id="zs-bp-minor" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0 H0 V10" fill="none" stroke="rgba(0,0,0,0.035)" strokeWidth="0.6" />
        </pattern>
        <pattern id="zs-bp-major" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="url(#zs-bp-minor)" />
          <path d="M50 0 H0 V50" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
        </pattern>
        <radialGradient id="zs-bp-fade">
          <stop offset="0.45" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="zs-bp-mask">
          <rect x="-20" y="-20" width="800" height="290" fill="url(#zs-bp-fade)" />
        </mask>
        <clipPath id="zs-bp-body">
          <rect x="120" y="124.5" width="340" height="51" />
        </clipPath>
        <filter id="zs-bp-ink" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="1.6" />
        </filter>
      </defs>

      {/* drafting paper */}
      <rect className="paper" x="-20" y="-20" width="800" height="290" fill="url(#zs-bp-major)" mask="url(#zs-bp-mask)" data-k="fade" data-s="0" data-e="0.08" />

      {/* note to whoever got this far */}
      <text x="20" y="34" className="red" data-k="type" data-s="0.01" data-e="0.1" data-text="// ai derulat până la capăt. respect." />

      {/* centre line */}
      <line x1="30" y1="150" x2="740" y2="150" className="cl" data-k="grow" data-s="0.06" data-e="0.14" />

      {/* drill: tip, body, flutes, neck, shank */}
      <path className="ln strong" pathLength={1} d="M120 125 L80 150 L120 175" data-k="draw" data-s="0.1" data-e="0.16" />
      <path className="ln strong" pathLength={1} d="M120 125 H460" data-k="draw" data-s="0.14" data-e="0.24" />
      <path className="ln strong" pathLength={1} d="M120 175 H460" data-k="draw" data-s="0.16" data-e="0.26" />
      <g clipPath="url(#zs-bp-body)">
        <g ref={flutesRef}>
          {flutes.map((x, i) => {
            const { s, e } = fluteTiming(i)
            return (
              <path key={x} className="ln thin" pathLength={1}
                d={`M${x} 175 C${x + 14} 162 ${x + 24} 138 ${x + 40} 125`}
                data-k="draw" data-s={s} data-e={e} />
            )
          })}
        </g>
      </g>
      <path className="ln strong" pathLength={1} d="M460 125 V175" data-k="draw" data-s="0.38" data-e="0.4" />
      <path className="ln strong" pathLength={1} d="M460 128 H700 L706 134 V166 L700 172 H460" data-k="draw" data-s="0.4" data-e="0.5" />

      {/* tip angle */}
      <path className="ln dim" pathLength={1} d="M104 136 A 28 28 0 0 0 104 164" data-k="draw" data-s="0.5" data-e="0.54" />
      <text x="26" y="154" className="red" data-k="type" data-s="0.53" data-e="0.57" data-text="118°" />

      {/* flute length */}
      <path className="ln thin" pathLength={1} d="M80 155 V212" data-k="draw" data-s="0.56" data-e="0.59" />
      <path className="ln thin" pathLength={1} d="M460 176 V212" data-k="draw" data-s="0.57" data-e="0.6" />
      <path className="ln dim" pathLength={1} d="M80 205 H460" data-k="draw" data-s="0.6" data-e="0.66" />
      <path className="arrow" d="M80 205 l8 -2.6 v5.2 z" data-k="pop" data-s="0.645" data-e="0.67" />
      <path className="arrow" d="M460 205 l-8 -2.6 v5.2 z" data-k="pop" data-s="0.655" data-e="0.68" />
      <text x="262" y="199" className="red" data-k="type" data-s="0.66" data-e="0.69" data-text="87" />

      {/* overall length */}
      <path className="ln thin" pathLength={1} d="M706 172 V238" data-k="draw" data-s="0.67" data-e="0.7" />
      <path className="ln dim" pathLength={1} d="M80 230 H706" data-k="draw" data-s="0.7" data-e="0.77" />
      <path className="arrow" d="M80 230 l8 -2.6 v5.2 z" data-k="pop" data-s="0.755" data-e="0.78" />
      <path className="arrow" d="M706 230 l-8 -2.6 v5.2 z" data-k="pop" data-s="0.765" data-e="0.79" />
      <text x="382" y="224" className="red" data-k="type" data-s="0.77" data-e="0.8" data-text="133" />

      {/* diameter leader */}
      <path className="ln dim" pathLength={1} d="M400 125 V100 H430" data-k="draw" data-s="0.78" data-e="0.81" />
      <path className="arrow" d="M400 125 l-2.6 -8 h5.2 z" data-k="pop" data-s="0.79" data-e="0.815" />
      <text x="436" y="103" className="red" data-k="type" data-s="0.81" data-e="0.85" data-text="Ø 10 h8" />

      {/* title block */}
      <path className="ln" pathLength={1} d="M450 8 H740 V74 H450 Z M450 30 H740 M450 52 H740 M630 8 V74" data-k="draw" data-s="0.83" data-e="0.9" />
      <text x="460" y="23" className="big" data-k="type" data-s="0.88" data-e="0.91" data-text="ZONA SCULE" />
      <text x="640" y="23" data-k="type" data-s="0.89" data-e="0.92" data-text="DESEN TEHNIC" />
      <text x="460" y="45" data-k="type" data-s="0.91" data-e="0.95" data-text="BURGHIU HSS · DIN 338" />
      <text x="640" y="45" data-k="type" data-s="0.93" data-e="0.96" data-text="SCARA 1:1" />
      <text x="460" y="67" data-k="type" data-s="0.95" data-e="0.99" data-text="PITEȘTI · 26+ ANI" />
      <text x="640" y="67" data-k="type" data-s="0.97" data-e="1" data-text="FOAIA 1/1" />

      {/* approval stamp — lands after the test run */}
      <g transform="rotate(-7 362 44)">
        <g ref={stampRef} className="stamp-ink" filter="url(#zs-bp-ink)">
          <rect x="296" y="20" width="132" height="48" rx="3" strokeWidth="1.6" />
          <rect x="300" y="24" width="124" height="40" rx="2" strokeWidth="0.7" />
          <text x="362" y="46" className="stamp-word">APROBAT</text>
          <text ref={dateRef} x="362" y="58" className="stamp-date" />
        </g>
      </g>

      {/* the pen */}
      <g ref={headRef} className="head">
        <path d="M-8 0 H-3.5 M3.5 0 H8 M0 -8 V-3.5 M0 3.5 V8" />
        <circle r="1.8" />
      </g>
    </svg>
  )
}
