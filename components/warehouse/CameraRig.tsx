'use client'

// Camera brain: skippable entry cinematic, then guided glide navigation
// (scroll/keys/touch along the active aisle, aisle switching left/right).
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  useWarehouse,
  aisleX,
  AISLE_Z_START,
  AISLE_Z_END,
  EYE_HEIGHT,
} from './store'

const INTRO_SECONDS = 6.5

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

export default function CameraRig({ aisleCount }: { aisleCount: number }) {
  const camera = useThree(s => s.camera)
  const phase = useWarehouse(s => s.phase)
  const setPhase = useWarehouse(s => s.setPhase)
  const reducedMotion = useWarehouse(s => s.reducedMotion)
  const introSkipped = useWarehouse(s => s.introSkipped)

  const introT = useRef(0)
  const look = useRef({ x: 0, y: 0 }) // pointer-driven look offset
  const pos = useRef(new THREE.Vector3(aisleX(0), 9, 26))
  const lookTarget = useRef(new THREE.Vector3(aisleX(0), 1.5, 0))

  // ── input listeners ──
  useEffect(() => {
    const st = useWarehouse.getState

    const clampAisle = (i: number) => Math.max(0, Math.min(aisleCount - 1, i))

    const onWheel = (e: WheelEvent) => {
      const s = st()
      if (s.phase !== 'explore' || s.selected || s.jumpOpen) return
      s.setAisleProgress(s.aisleProgress + e.deltaY * 0.00045)
    }

    const onKey = (e: KeyboardEvent) => {
      const s = st()
      if (e.key === 'Escape') {
        if (s.phase === 'intro') s.skipIntro()
        else if (s.selected) s.setSelected(null)
        else if (s.jumpOpen) s.setJumpOpen(false)
        return
      }
      if (s.phase === 'intro' && (e.key === ' ' || e.key === 'Enter')) {
        s.skipIntro()
        return
      }
      if (s.phase !== 'explore' || s.selected || s.jumpOpen) return
      const step = 0.06
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          s.setAisleProgress(s.aisleProgress + step)
          break
        case 's':
        case 'S':
        case 'ArrowDown':
          s.setAisleProgress(s.aisleProgress - step)
          break
        case 'a':
        case 'A':
        case 'ArrowLeft':
          s.setActiveAisle(clampAisle(s.activeAisle - 1))
          break
        case 'd':
        case 'D':
        case 'ArrowRight':
          s.setActiveAisle(clampAisle(s.activeAisle + 1))
          break
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      look.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      look.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    // touch: vertical drag = move down aisle, decisive horizontal swipe = switch aisle
    let touchStart: { x: number; y: number } | null = null
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touchStart = { x: t.clientX, y: t.clientY }
      const s = st()
      if (s.phase === 'intro') s.skipIntro()
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart) return
      const s = st()
      if (s.phase !== 'explore' || s.selected || s.jumpOpen) return
      const t = e.touches[0]
      const dy = t.clientY - touchStart.y
      const dx = t.clientX - touchStart.x
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) {
        s.setActiveAisle(clampAisle(s.activeAisle + (dx < 0 ? 1 : -1)))
        touchStart = { x: t.clientX, y: t.clientY }
      } else {
        s.setAisleProgress(s.aisleProgress + dy * 0.0015)
        touchStart = { x: touchStart.x, y: t.clientY }
      }
    }
    const onTouchEnd = () => {
      touchStart = null
    }

    const onClickDuringIntro = () => {
      const s = st()
      if (s.phase === 'intro') s.skipIntro()
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('click', onClickDuringIntro)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('click', onClickDuringIntro)
    }
  }, [aisleCount])

  useFrame((_, delta) => {
    const s = useWarehouse.getState()
    const centerX = aisleX(Math.floor((aisleCount - 1) / 2))

    if (s.phase === 'intro' && !introSkipped && !reducedMotion) {
      introT.current = Math.min(1, introT.current + delta / INTRO_SECONDS)
      const t = smoothstep(introT.current)
      // dolly: high over the dock doors → settle at aisle 0 entrance
      pos.current.set(
        THREE.MathUtils.lerp(centerX, aisleX(0), t),
        THREE.MathUtils.lerp(10, EYE_HEIGHT, t),
        THREE.MathUtils.lerp(30, AISLE_Z_START, t)
      )
      lookTarget.current.set(
        THREE.MathUtils.lerp(centerX, aisleX(0), t),
        THREE.MathUtils.lerp(2.5, EYE_HEIGHT, t),
        THREE.MathUtils.lerp(0, -8, t)
      )
      camera.position.copy(pos.current)
      camera.lookAt(lookTarget.current)
      if (introT.current >= 1) setPhase('explore')
      return
    }

    if (s.phase === 'intro') {
      // reduced motion or skipped: cut straight to the first view
      setPhase('explore')
    }

    // ── explore: damped glide toward the active aisle/progress target ──
    const targetX = aisleX(s.activeAisle)
    const targetZ = THREE.MathUtils.lerp(AISLE_Z_START, AISLE_Z_END, s.aisleProgress)
    const damp = reducedMotion ? 1 : 1 - Math.exp(-3.2 * delta)

    pos.current.x = THREE.MathUtils.lerp(pos.current.x, targetX, damp)
    pos.current.y = THREE.MathUtils.lerp(pos.current.y, EYE_HEIGHT, damp)
    pos.current.z = THREE.MathUtils.lerp(pos.current.z, targetZ, damp)
    camera.position.copy(pos.current)

    const lookAmt = reducedMotion ? 0 : 1
    lookTarget.current.set(
      targetX + look.current.x * 2.4 * lookAmt,
      EYE_HEIGHT + 0.25 - look.current.y * 1.1 * lookAmt,
      targetZ - 7
    )
    camera.lookAt(lookTarget.current)
  })

  return null
}
