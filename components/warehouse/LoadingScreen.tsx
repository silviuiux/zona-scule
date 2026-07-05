'use client'

// Branded loading screen with real progress: tracks the first aisle's
// texture batch registered in the store, then hands off to the intro.
import { useEffect, useRef, useState } from 'react'
import { useWarehouse } from './store'

const MIN_SHOW_MS = 900
const GRACE_MS = 2500 // if no textures register (empty data), don't hang

export default function LoadingScreen() {
  const phase = useWarehouse(s => s.phase)
  const setPhase = useWarehouse(s => s.setPhase)
  const texTotal = useWarehouse(s => s.texTotal)
  const texLoaded = useWarehouse(s => s.texLoaded)
  const mountedAt = useRef(Date.now())
  const [gone, setGone] = useState(false)

  const progress = texTotal > 0 ? texLoaded / texTotal : 0

  useEffect(() => {
    if (phase !== 'loading') return
    const elapsed = Date.now() - mountedAt.current
    const ready =
      (texTotal > 0 && texLoaded >= texTotal) || (texTotal === 0 && elapsed > GRACE_MS)
    if (ready) {
      const wait = Math.max(0, MIN_SHOW_MS - elapsed)
      const id = setTimeout(() => {
        setPhase('intro')
        setTimeout(() => setGone(true), 600)
      }, wait)
      return () => clearTimeout(id)
    }
    // re-check on a timer for the grace-period path
    const id = setTimeout(() => {}, 250)
    return () => clearTimeout(id)
  }, [phase, texTotal, texLoaded, setPhase])

  // grace timer tick (forces the effect above to re-evaluate)
  const [, force] = useState(0)
  useEffect(() => {
    if (phase !== 'loading') return
    const id = setInterval(() => force(n => n + 1), 300)
    return () => clearInterval(id)
  }, [phase])

  if (gone) return null

  return (
    <div className={`wh-loader${phase !== 'loading' ? ' wh-loader-out' : ''}`} aria-busy={phase === 'loading'}>
      <div className="wh-loader-logo">ZONA SCULE</div>
      <div className="wh-loader-sub">DEPOZITUL SE DESCHIDE…</div>
      <div className="wh-loader-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="wh-loader-fill" style={{ width: `${Math.max(6, progress * 100)}%` }} />
      </div>
    </div>
  )
}
