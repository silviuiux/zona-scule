'use client'
import { useEffect, useRef } from 'react'

/**
 * Homepage easter egg. Once the page is scrolled all the way to the bottom,
 * further wheel (or touch) scrolling looks like it does nothing — but after
 * a short dead zone it starts "drafting" a faint technical drawing of a
 * drill bit behind the footer's logo row: outlines, dimension lines and
 * title-block text drawn in stroke by stroke, driven by how far you keep
 * scrolling. Scrolling back up past the bottom just leaves it as drawn.
 *
 * Drawing: every element carries data-s / data-e (start/end of its slice of
 * the 0..1 progress). Paths draw via stroke-dashoffset (pathLength=1),
 * dashed construction lines grow via scaleX, text types itself out.
 */
const DEAD_ZONE = 500 // px of extra scrolling that "does nothing" first
const RANGE = 2600 // px of extra scrolling from blank to fully drawn

export default function FooterBlueprint() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    type Item = { el: SVGElement; s: number; e: number; kind: 'path' | 'grow' | 'text'; text: string }
    const items: Item[] = Array.from(svg.querySelectorAll<SVGElement>('[data-s]')).map(el => {
      const kind = el.tagName === 'text' ? 'text' : el.hasAttribute('data-grow') ? 'grow' : 'path'
      const text = kind === 'text' ? el.getAttribute('data-text') ?? '' : ''
      return { el, s: +el.dataset.s!, e: +el.dataset.e!, kind, text }
    })

    const render = (p: number) => {
      for (const it of items) {
        const t = Math.max(0, Math.min(1, (p - it.s) / (it.e - it.s)))
        if (it.kind === 'path') it.el.style.strokeDashoffset = String(1 - t)
        else if (it.kind === 'grow') it.el.style.transform = `scaleX(${t})`
        else it.el.textContent = it.text.slice(0, Math.round(it.text.length * t))
      }
    }
    render(0)

    let overscroll = 0 // accumulated scroll attempts past the bottom
    let target = 0
    let cur = 0
    let raf = 0
    const frame = () => {
      cur += (target - cur) * 0.12
      if (Math.abs(target - cur) < 0.0005) cur = target
      render(cur)
      raf = cur === target ? 0 : requestAnimationFrame(frame)
    }
    const push = (delta: number) => {
      if (delta <= 0) return
      const doc = document.documentElement
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
    }
  }, [])

  // Flute curves along the drill body.
  const flutes = [130, 180, 230, 280, 330, 380, 420]

  return (
    <svg ref={svgRef} className="footer-blueprint" viewBox="0 0 760 250" aria-hidden="true">
      <style>{`
        .footer-blueprint { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: min(760px, 56%); height: auto; pointer-events: none; overflow: visible; }
        .footer-blueprint .ln { fill: none; stroke: rgba(0,0,0,0.22); stroke-width: 1; vector-effect: non-scaling-stroke; stroke-dasharray: 1; stroke-linecap: round; }
        .footer-blueprint .dim { stroke: rgba(217,44,43,0.55); }
        .footer-blueprint .cl { fill: none; stroke: rgba(0,0,0,0.18); stroke-width: 1; stroke-dasharray: 14 4 2 4; transform-box: fill-box; transform-origin: left center; }
        .footer-blueprint text { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.08em; fill: rgba(0,0,0,0.45); }
        .footer-blueprint text.red { fill: rgba(217,44,43,0.75); }
        .footer-blueprint text.big { font-size: 11px; fill: rgba(0,0,0,0.6); font-weight: 500; }
        @media (max-width: 1023px) { .footer-blueprint { display: none; } }
      `}</style>

      {/* note to whoever got this far */}
      <text x="20" y="34" className="red" data-s="0" data-e="0.1" data-text="// ai derulat până la capăt. respect." />

      {/* centre line */}
      <line x1="30" y1="150" x2="740" y2="150" className="cl" data-grow="" data-s="0.04" data-e="0.14" />

      {/* drill: tip, body, flutes, neck, shank */}
      <path className="ln" pathLength={1} d="M120 125 L80 150 L120 175" data-s="0.1" data-e="0.16" />
      <path className="ln" pathLength={1} d="M120 125 H460" data-s="0.14" data-e="0.24" />
      <path className="ln" pathLength={1} d="M120 175 H460" data-s="0.16" data-e="0.26" />
      {flutes.map((x, i) => (
        <path key={x} className="ln" pathLength={1}
          d={`M${x} 175 C${x + 14} 162 ${x + 24} 138 ${x + 40} 125`}
          data-s={(0.24 + i * 0.022).toFixed(3)} data-e={(0.28 + i * 0.022).toFixed(3)} />
      ))}
      <path className="ln" pathLength={1} d="M460 125 V175" data-s="0.38" data-e="0.4" />
      <path className="ln" pathLength={1} d="M460 128 H700 L706 134 V166 L700 172 H460" data-s="0.4" data-e="0.5" />

      {/* tip angle */}
      <path className="ln dim" pathLength={1} d="M104 136 A 28 28 0 0 0 104 164" data-s="0.5" data-e="0.54" />
      <text x="26" y="154" className="red" data-s="0.53" data-e="0.57" data-text="118°" />

      {/* flute length */}
      <path className="ln" pathLength={1} d="M80 155 V212" data-s="0.56" data-e="0.59" />
      <path className="ln" pathLength={1} d="M460 176 V212" data-s="0.57" data-e="0.6" />
      <path className="ln dim" pathLength={1} d="M80 205 H460 M80 199 V211 M460 199 V211" data-s="0.6" data-e="0.66" />
      <text x="262" y="199" className="red" data-s="0.65" data-e="0.68" data-text="87" />

      {/* overall length */}
      <path className="ln" pathLength={1} d="M706 172 V238" data-s="0.67" data-e="0.7" />
      <path className="ln dim" pathLength={1} d="M80 230 H706 M80 224 V236 M706 224 V236" data-s="0.7" data-e="0.77" />
      <text x="382" y="224" className="red" data-s="0.76" data-e="0.79" data-text="133" />

      {/* diameter leader */}
      <path className="ln dim" pathLength={1} d="M400 125 V100 H430" data-s="0.78" data-e="0.81" />
      <text x="436" y="103" className="red" data-s="0.8" data-e="0.84" data-text="Ø 10 h8" />

      {/* title block (top right, clear of the footer columns below) */}
      <path className="ln" pathLength={1} d="M450 8 H740 V74 H450 Z M450 30 H740 M450 52 H740 M630 8 V74" data-s="0.83" data-e="0.9" />
      <text x="460" y="23" className="big" data-s="0.88" data-e="0.91" data-text="ZONA SCULE" />
      <text x="640" y="23" data-s="0.89" data-e="0.92" data-text="DESEN TEHNIC" />
      <text x="460" y="45" data-s="0.91" data-e="0.95" data-text="BURGHIU HSS · DIN 338" />
      <text x="640" y="45" data-s="0.93" data-e="0.96" data-text="SCARA 1:1" />
      <text x="460" y="67" data-s="0.95" data-e="0.99" data-text="PITEȘTI · 26+ ANI" />
      <text x="640" y="67" data-s="0.97" data-e="1" data-text="FOAIA 1/1" />
    </svg>
  )
}
