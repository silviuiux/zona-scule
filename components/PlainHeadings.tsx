'use client'
import { useEffect } from 'react'

/**
 * Neuton, the display face, has no Romanian ș/ț (and friends): the browser
 * draws them from a fallback font, which shows in big titles. So text set in
 * Neuton is shown without diacritics. The markup keeps them (search engines,
 * screen readers and copy-paste on everything else); only the rendered text
 * of Neuton elements is changed, after hydration and for anything added later.
 */
const MAP: Record<string, string> = {
  'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ş': 's', 'ț': 't', 'ţ': 't',
  'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ş': 'S', 'Ț': 'T', 'Ţ': 'T',
}
const RE = /[ăâîșşțţĂÂÎȘŞȚŢ]/g
const TEST = /[ăâîșşțţĂÂÎȘŞȚŢ]/

export default function PlainHeadings() {
  useEffect(() => {
    const isNeuton = new WeakMap<Element, boolean>()
    const neuton = (el: Element) => {
      let v = isNeuton.get(el)
      if (v === undefined) {
        v = getComputedStyle(el).fontFamily.trimStart().replace(/^["']/, '').startsWith('Neuton')
        isNeuton.set(el, v)
      }
      return v
    }
    const fix = (t: Text) => {
      const v = t.nodeValue
      if (!v || !TEST.test(v)) return
      const el = t.parentElement
      if (!el || el.closest('script, style, textarea, input') || !neuton(el)) return
      t.nodeValue = v.replace(RE, c => MAP[c])
    }
    const scan = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) { fix(root as Text); return }
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      for (let n = w.nextNode(); n; n = w.nextNode()) fix(n as Text)
    }
    scan(document.body)
    const mo = new MutationObserver(list => {
      for (const m of list) {
        if (m.type === 'characterData') fix(m.target as Text)
        else m.addedNodes.forEach(scan)
      }
    })
    mo.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => mo.disconnect()
  }, [])
  return null
}
