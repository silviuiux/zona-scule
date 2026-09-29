'use client'
import { useEffect, useRef } from 'react'
import { CONTACT_MAP_CAMERA as CAM } from './contact-map-camera'

type Kind = 'draw' | 'fade' | 'type'
type Item = { el: SVGElement; kind: Kind; s: number; e: number; os: number; oe: number; text: string }

const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Camera at scroll progress p: view width (m) interpolated in log space
// between keyframes; the centre follows linearly in width, so the pin holds
// still while zooming out and the frame only re-centres at the wide end.
function camera(p: number) {
  let i = 0
  while (i < CAM.length - 2 && p > CAM[i + 1].p) i++
  const a = CAM[i], b = CAM[i + 1]
  const t = easeInOutCubic(clamp01((p - a.p) / (b.p - a.p)))
  const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * t)
  const f = b.w === a.w ? t : (w - a.w) / (b.w - a.w)
  return { w, x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
}

const niceScale = (metres: number) => {
  const pow = Math.pow(10, Math.floor(Math.log10(metres)))
  const n = metres / pow
  const step = n >= 5 ? 5 : n >= 2 ? 2 : 1
  return step * pow
}
const fmtDist = (m: number) => (m >= 1000 ? `${(m / 1000).toLocaleString('ro')} km` : `${m} m`)

export default function ContactMapScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    const svg = host?.querySelector<SVGSVGElement>('svg')
    const section = host?.closest<HTMLElement>('.cmap')
    const sticky = host?.closest<HTMLElement>('.cmap-sticky')
    if (!host || !svg || !section || !sticky) return
    const pin = svg.querySelector<SVGGElement>('[data-role="pin"]')
    // labels are sized in screen px: each group is placed at its map point
    // and scaled by metres-per-px (fonts that big would get clamped)
    const labels = Array.from(svg.querySelectorAll<SVGGElement>('.lbl')).map(el => ({
      el, x: +(el.dataset.x ?? 0), y: +(el.dataset.y ?? 0), a: +(el.dataset.a ?? 0),
    }))
    const stages = Array.from(sticky.querySelectorAll<HTMLSpanElement>('[data-role="stages"] span'))
    const bar = sticky.querySelector<HTMLElement>('[data-role="scale-bar"]')
    const barText = sticky.querySelector<HTMLElement>('[data-role="scale-text"]')

    const items: Item[] = Array.from(svg.querySelectorAll<SVGElement>('[data-k]')).map(el => ({
      el,
      kind: el.dataset.k as Kind,
      s: +(el.dataset.s ?? 0), e: +(el.dataset.e ?? 1),
      os: el.dataset.outS ? +el.dataset.outS : 2, oe: el.dataset.outE ? +el.dataset.outE : 3,
      text: el.dataset.text ?? '',
    }))

    let lastP = -1
    const render = () => {
      const r = section.getBoundingClientRect()
      const run = r.height - sticky.offsetHeight
      const p = run > 0 ? clamp01(-r.top / run) : 0
      const W = svg.clientWidth || 1, H = svg.clientHeight || 1
      const cam = camera(p)
      // narrow screens start closer in on the neighbourhood, then join the
      // shared framing as the camera pulls out
      const near = Math.max(0.5, Math.min(1, W / 1100))
      if (near < 1) cam.w *= near + (1 - near) * clamp01((p - 0.28) / 0.2)
      // slice-fit: the view is cam.w wide, or taller if the box is tall
      const vw = Math.max(cam.w, (cam.w * 0.62) * (W / H))
      const vh = vw * (H / W)
      const u = vw / W
      svg.setAttribute('viewBox', `${(cam.x - vw / 2).toFixed(2)} ${(cam.y - vh / 2).toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`)
      svg.style.setProperty('--u', u.toPrecision(5))
      const us = u.toPrecision(5)
      pin?.setAttribute('transform', `scale(${us})`)
      for (const l of labels) l.el.setAttribute('transform', `translate(${l.x} ${l.y})${l.a ? ` rotate(${l.a})` : ''} scale(${us})`)

      if (Math.abs(p - lastP) > 1e-4) {
        lastP = p
        for (const it of items) {
          const raw = clamp01((p - it.s) / (it.e - it.s))
          const t = easeInOutSine(raw)
          if (it.kind === 'draw') it.el.style.strokeDashoffset = String(1 - t)
          else if (it.kind === 'fade') it.el.style.opacity = String(t * (1 - clamp01((p - it.os) / (it.oe - it.os))))
          else {
            const n = Math.round(it.text.length * raw)
            it.el.textContent = it.text.slice(0, n) + (raw > 0 && raw < 1 ? '_' : '')
          }
        }
        const stage = p < 0.3 ? 0 : p < 0.62 ? 1 : 2
        stages.forEach((s, i) => s.classList.toggle('on', i === stage))
      }
      // scale bar: a round distance close to 120 px
      if (bar && barText) {
        const m = niceScale(120 * u)
        bar.style.width = `${(m / u).toFixed(1)}px`
        barText.textContent = fmtDist(m)
      }
    }

    let raf = 0
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render() }) }
    render()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} style={{ position: 'absolute', inset: 0 }}>{children}</div>
}
