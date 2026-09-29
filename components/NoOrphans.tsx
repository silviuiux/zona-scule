'use client'
import { useEffect } from 'react'

/**
 * Site-wide typographic rule: never a single word alone on the last line of
 * a title, subtitle, description or paragraph. CSS does most of it
 * (text-wrap: balance / pretty in globals.css); this ties the last two
 * words of every text block together with a no-break space, for browsers
 * without text-wrap: pretty and for text-wrap's own misses. Runs after
 * hydration and again on anything added later (client navigation, loaded
 * products); the markup itself is left as written.
 */
const BLOCKS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'dd', 'blockquote', 'figcaption',
  '[class*="title"]', '[class*="headline"]', '[class*="desc"]', '[class*="lead"]',
  '[class*="text"]', '[class*="excerpt"]', '[class*="sub"]', '[class*="-name"]',
].join(',')
const SKIP = 'script, style, textarea, input, select, option, code, pre, svg, nav, button'
const NBSP = ' '
// don't glue a pair so long it could overflow a narrow column
const MAX_PAIR = 24

function glue(block: Element) {
  if (block.closest(SKIP)) return
  const w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  const nodes: Text[] = []
  for (let n = w.nextNode(); n; n = w.nextNode()) nodes.push(n as Text)
  const full = nodes.map(n => n.nodeValue ?? '').join('')
  const trimmed = full.replace(/\s+$/, '')
  // fewer than three words: nothing to fix
  if (trimmed.trim().split(/\s+/).length < 3) return
  // the gap before the last word
  const lastSpace = Math.max(trimmed.lastIndexOf(' '), trimmed.lastIndexOf(NBSP))
  if (lastSpace < 0 || trimmed[lastSpace] === NBSP) return
  const before = trimmed.lastIndexOf(' ', lastSpace - 1)
  const pair = trimmed.slice(before + 1)
  if (pair.length > MAX_PAIR) return
  // find that character's text node and swap it for a no-break space
  let at = lastSpace
  for (const n of nodes) {
    const len = n.nodeValue?.length ?? 0
    if (at < len) {
      const v = n.nodeValue!
      n.nodeValue = v.slice(0, at) + NBSP + v.slice(at + 1)
      return
    }
    at -= len
  }
}

export default function NoOrphans() {
  useEffect(() => {
    const run = (root: ParentNode) => {
      if (root instanceof Element && root.matches(BLOCKS)) glue(root)
      root.querySelectorAll(BLOCKS).forEach(glue)
    }
    run(document.body)
    let pending = new Set<ParentNode>()
    let raf = 0
    const mo = new MutationObserver(list => {
      for (const m of list) {
        const t = m.type === 'characterData' ? m.target.parentElement : m.target
        if (t instanceof Element) pending.add(t.closest(BLOCKS) ?? t)
      }
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0
        const batch = pending
        pending = new Set()
        batch.forEach(run)
      })
    })
    mo.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => { mo.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return null
}
