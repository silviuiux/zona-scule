'use client'
import { useEffect } from 'react'

/**
 * Updates CSS variables on :root every scroll for the page's parallax layers:
 *
 *   --dot-y         : background-position offset for body::before dot pattern.
 *                     Dots move at 80% of scroll speed (slower than foreground
 *                     → depth illusion). At scrollY=100, dots shift up 80px.
 *
 *   --hero-y        : transform offset for .hero-inner content (homepage).
 *                     Hero races at 120% of scroll speed (faster than fg →
 *                     foreground pop). At scrollY=100, content shifts up an
 *                     extra 20px on top of natural scroll → 120% effective.
 *
 *   --cat-banner-y  : transform offset for .cat-hero-img on /produse.
 *                     Banner moves at 40% of scroll speed (much slower than
 *                     foreground → background depth). At scrollY=100, the
 *                     image translates DOWN 60px so it appears to scroll up
 *                     only 40px → 40% effective.
 *
 * Also drifts the dot layer toward the cursor across the whole viewport:
 *
 *   --dot-tx/--dot-ty : subtle translate toward the pointer (± a few px).
 *   --dot-scale       : subtle scale-up as the pointer moves off-center, read
 *                        as the dot plane drifting closer on the z-axis.
 *
 * Both are eased toward their target every frame (lerp, not snapped) so the
 * motion settles like a slow-drifting plane rather than tracking the cursor
 * directly — the "organic" part of the effect. The easing loop only runs
 * while the values are still moving; it stops once they settle and restarts
 * on the next pointer movement.
 *
 * Renders the cross-line laser layer (.laser in globals.css) and drives its
 * variables — see renderLaser() below.
 */

// Anything the cursor can be "on" that isn't bare page background. While
// over one of these the laser fades out, so it only ever shows on empty
// space and never draws red over text, cards or images.
const CONTENT_SELECTOR =
  'a, button, input, textarea, select, label, img, video, svg, canvas, iframe, ' +
  'p, h1, h2, h3, h4, h5, h6, li, dt, dd, blockquote, table, ' +
  'nav, footer, form, [role="button"], [role="dialog"]'

const DOT_TILE = 16 // must match body::before's background-size
const DOT_CENTER = DOT_TILE / 2

export default function DotsParallax() {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

    const root = document.documentElement
    let renderLaser = () => {}
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      root.style.setProperty('--dot-y', `${-y * 0.8}px`)
      root.style.setProperty('--hero-y', `${-y * 0.2}px`)
      root.style.setProperty('--cat-banner-y', `${y * 0.6}px`)
      // Noise layer moves at 90% of scroll speed: shift background-position
      // by -10% of scrollY so the absolute element's net speed = 90%.
      root.style.setProperty('--noise-y', `${-y * 0.1}px`)
      // Dots slide under a still cursor while scrolling — re-snap the laser.
      renderLaser()
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })

    if (reduce) {
      return () => {
        window.removeEventListener('scroll', onScroll)
        if (raf) cancelAnimationFrame(raf)
      }
    }

    // Pointer-driven drift for the dot layer, in normalized 0..1 viewport
    // coordinates, resting at the center (0.5, 0.5) when idle.
    const DOT_TX_RANGE = 6 // px, at full ±1 offset from center
    const DOT_TY_RANGE = 6 // px
    const DOT_SCALE_RANGE = 0.015 // added scale at full offset
    const EASE = 0.04
    const EPSILON = 0.0004

    let targetX = 0.5
    let targetY = 0.5
    let curX = 0.5
    let curY = 0.5
    let hoverRaf = 0

    // Current dot-layer transform, derived from the same eased values the
    // CSS vars are built from (so the laser always agrees with the dots).
    const layerTransform = () => {
      const nx = (curX - 0.5) * 2
      const ny = (curY - 0.5) * 2
      return {
        tx: nx * DOT_TX_RANGE,
        ty: ny * DOT_TY_RANGE,
        s: 1 + (Math.abs(nx) + Math.abs(ny)) * 0.5 * DOT_SCALE_RANGE,
      }
    }

    // ── Cross-line laser ──
    // The beams glide (no overshoot) onto the snapped dot row/column, while
    // the cross as a whole hangs on a damped angular spring — like the
    // pendulum of a self-levelling laser. Moving the cursor swings it a
    // degree or two; it rocks back and forth and settles level.
    const GLIDE = 0.3 // share of the remaining distance covered per step
    const ROT_K = 0.07
    const ROT_DAMP = 0.9
    const ROT_PUSH = 0.012 // deg/step of angular velocity per px of cursor travel
    const ROT_MAX_VEL = 0.35 // deg/step
    const ROT_MAX = 2.5 // deg
    const IDLE_KICK = 0.3 // deg/step → a ~1.5° rock around level
    const IDLE_WIGGLE_MS = 7000 // still cursor → the cross rocks once more
    const IDLE_FADE_MS = 10000 // still cursor → the laser fades out
    const STEP_MS = 1000 / 60 // fixed-rate steps, same feel at 60/120Hz
    const SNAP_HYSTERESIS = 4 // px past the midpoint before switching rows

    let mouseX = -1
    let mouseY = -1
    let overEmpty = false
    let awake = false
    let laserOn = false
    const beamX = { pos: 0, target: 0 }
    const beamY = { pos: 0, target: 0 }
    const rot = { angle: 0, vel: 0 }
    let springRaf = 0
    let lastT = 0
    let wiggleTimer = 0
    let fadeTimer = 0
    let colIdx = NaN // current dot column/row the beams sit on (NaN = unset)
    let rowIdx = NaN

    const writeBeams = () => {
      root.style.setProperty('--laser-x', `${beamX.pos.toFixed(2)}px`)
      root.style.setProperty('--laser-y', `${beamY.pos.toFixed(2)}px`)
      root.style.setProperty('--laser-rot', `${rot.angle.toFixed(3)}deg`)
    }
    const springFrame = (now: number) => {
      const steps = Math.min(4, Math.max(1, Math.round((now - lastT) / STEP_MS)))
      lastT = now
      for (let i = 0; i < steps; i++) {
        beamX.pos += (beamX.target - beamX.pos) * GLIDE
        beamY.pos += (beamY.target - beamY.pos) * GLIDE
        rot.vel = (rot.vel - rot.angle * ROT_K) * ROT_DAMP
        rot.angle = Math.max(-ROT_MAX, Math.min(ROT_MAX, rot.angle + rot.vel))
      }
      const moving =
        Math.abs(beamX.target - beamX.pos) > 0.05 ||
        Math.abs(beamY.target - beamY.pos) > 0.05 ||
        Math.abs(rot.vel) > 0.002 ||
        Math.abs(rot.angle) > 0.01
      if (moving) {
        writeBeams()
        springRaf = requestAnimationFrame(springFrame)
      } else {
        beamX.pos = beamX.target
        beamY.pos = beamY.target
        rot.angle = rot.vel = 0
        writeBeams()
        springRaf = 0
      }
    }
    const runSpring = () => {
      if (springRaf) return
      lastT = performance.now()
      springRaf = requestAnimationFrame(springFrame)
    }
    const pushRotation = (dv: number) => {
      rot.vel = Math.max(-ROT_MAX_VEL, Math.min(ROT_MAX_VEL, rot.vel + dv))
      runSpring()
    }

    if (finePointer) {
      renderLaser = () => {
        if (mouseX < 0) return
        // Screen → layer-local coords: undo translate + scale (about the
        // viewport centre, the layer's transform-origin).
        const { tx, ty, s } = layerTransform()
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const px = cx + (mouseX - tx - cx) / s
        const py = cy + (mouseY - ty - cy) / s
        // Snap to the nearest dot column/row (rows carry the scroll offset),
        // with hysteresis: keep the current line until the cursor is clearly
        // past the midpoint, so the slow cursor-drift of the dot plane (a few
        // px) can't make a beam hop rows on its own after the mouse stops.
        // Tracked as grid indices (not px) so scrolling moves the target
        // along with its row and it can never be left between rows.
        const dotY = -window.scrollY * 0.8
        const colF = (px - DOT_CENTER) / DOT_TILE
        const rowF = (py - DOT_CENTER - dotY) / DOT_TILE
        const keep = 0.5 + SNAP_HYSTERESIS / DOT_TILE
        if (!(Math.abs(colF - colIdx) <= keep)) colIdx = Math.round(colF)
        if (!(Math.abs(rowF - rowIdx) <= keep)) rowIdx = Math.round(rowF)
        beamX.target = colIdx * DOT_TILE + DOT_CENTER
        beamY.target = rowIdx * DOT_TILE + DOT_CENTER + dotY
        root.style.setProperty('--laser-cx', `${px.toFixed(1)}px`)
        root.style.setProperty('--laser-cy', `${py.toFixed(1)}px`)
        runSpring()
      }
    }
    // Visible only while the cursor is over empty space AND has moved within
    // the last IDLE_FADE_MS.
    const syncLaser = () => {
      const on = overEmpty && awake
      if (on === laserOn) return
      laserOn = on
      root.style.setProperty('--laser-on', on ? '1' : '0')
      if (on) {
        // Appear already on the cursor and level, not gliding in from a
        // stale spot.
        renderLaser()
        beamX.pos = beamX.target
        beamY.pos = beamY.target
        rot.angle = rot.vel = 0
        writeBeams()
      }
    }

    const resetIdle = () => {
      window.clearTimeout(wiggleTimer)
      window.clearTimeout(fadeTimer)
      wiggleTimer = window.setTimeout(() => {
        if (laserOn) pushRotation(IDLE_KICK)
      }, IDLE_WIGGLE_MS)
      fadeTimer = window.setTimeout(() => {
        awake = false
        syncLaser()
      }, IDLE_FADE_MS)
    }

    const tick = () => {
      curX += (targetX - curX) * EASE
      curY += (targetY - curY) * EASE
      const { tx, ty, s } = layerTransform()
      root.style.setProperty('--dot-tx', `${tx.toFixed(2)}px`)
      root.style.setProperty('--dot-ty', `${ty.toFixed(2)}px`)
      root.style.setProperty('--dot-scale', `${s.toFixed(4)}`)
      renderLaser()

      if (Math.abs(targetX - curX) < EPSILON && Math.abs(targetY - curY) < EPSILON) {
        hoverRaf = 0
        return
      }
      hoverRaf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!hoverRaf) hoverRaf = requestAnimationFrame(tick)
    }
    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth
      targetY = e.clientY / window.innerHeight
      const dx = mouseX < 0 ? 0 : e.clientX - mouseX
      mouseX = e.clientX
      mouseY = e.clientY
      if (finePointer) {
        const t = e.target as Element | null
        overEmpty = !!t && !t.closest(CONTENT_SELECTOR)
        awake = true
        syncLaser()
        resetIdle()
        // Sideways travel swings the cross, as if the laser were carried.
        if (laserOn && dx) pushRotation(-dx * ROT_PUSH)
      }
      kick()
    }
    const onMouseLeave = () => {
      targetX = 0.5
      targetY = 0.5
      overEmpty = false
      syncLaser()
      window.clearTimeout(wiggleTimer)
      window.clearTimeout(fadeTimer)
      kick()
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      if (raf) cancelAnimationFrame(raf)
      if (hoverRaf) cancelAnimationFrame(hoverRaf)
      if (springRaf) cancelAnimationFrame(springRaf)
      window.clearTimeout(wiggleTimer)
      window.clearTimeout(fadeTimer)
    }
  }, [])

  // First element in <body> (see app/layout.tsx), so — like body::before —
  // it paints beneath all positioned page content.
  return (
    <div className="laser" aria-hidden="true">
      <div className="laser-h" />
      <div className="laser-v" />
    </div>
  )
}
