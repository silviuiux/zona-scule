'use client'
import { useEffect } from 'react'

/**
 * Picks three random stories in the StoriesTeaser next to it, on every
 * visit: shows them (data-show), orders them and makes the first the large
 * one. Without JS the server's three stay.
 */
export default function StoriesShuffle() {
  useEffect(() => {
    const grid = document.querySelector('.st-teaser .st-grid')
    if (!grid) return
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.st-card'))
    const order = cards.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    cards.forEach(c => { c.removeAttribute('data-show'); c.classList.remove('lead'); c.style.order = '' })
    order.slice(0, 3).forEach((idx, pos) => {
      const c = cards[idx]
      c.setAttribute('data-show', '')
      c.style.order = String(pos)
      if (pos === 0) c.classList.add('lead')
    })
  }, [])
  return null
}
