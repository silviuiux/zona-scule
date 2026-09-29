'use client'
import { useEffect } from 'react'

/**
 * Drives the StoriesTeaser carousel next to it: shuffles the stories on
 * every visit (CSS order; every third card from the first is wide), and
 * wires the arrows and the "01 / 32" counter to the track's scroll.
 */
export default function StoriesShuffle() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.st-teaser')
    const track = root?.querySelector<HTMLElement>('.st-track')
    if (!root || !track) return
    const cards = Array.from(track.querySelectorAll<HTMLElement>('.st-card'))
    const order = cards.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    order.forEach((idx, pos) => {
      const c = cards[idx]
      c.style.order = String(pos)
      c.classList.toggle('wide', pos % 3 === 0)
    })
    track.scrollLeft = 0

    const prev = root.querySelector<HTMLButtonElement>('[data-st-dir="-1"]')
    const next = root.querySelector<HTMLButtonElement>('[data-st-dir="1"]')
    const pos = root.querySelector<HTMLElement>('[data-st-pos]')
    const sorted = () => [...cards].sort((a, b) => a.offsetLeft - b.offsetLeft)
    const current = () => {
      const x = track.scrollLeft + 4
      const list = sorted()
      let i = 0
      while (i < list.length - 1 && list[i + 1].offsetLeft - track.offsetLeft <= x) i++
      return i
    }
    const update = () => {
      const i = current()
      if (pos) pos.textContent = String(i + 1).padStart(2, '0')
      if (prev) prev.disabled = track.scrollLeft <= 2
      if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2
    }
    const go = (dir: number) => {
      const list = sorted()
      const i = Math.max(0, Math.min(list.length - 1, current() + dir))
      track.scrollTo({ left: list[i].offsetLeft - track.offsetLeft })
    }
    const onPrev = () => go(-1), onNext = () => go(1)
    prev?.addEventListener('click', onPrev)
    next?.addEventListener('click', onNext)
    track.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      prev?.removeEventListener('click', onPrev)
      next?.removeEventListener('click', onNext)
      track.removeEventListener('scroll', update)
    }
  }, [])
  return null
}
