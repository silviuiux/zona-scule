'use client'

// Client root for /depozit: capability detection → 3D experience or fallback.
import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import WarehouseScene from '@/components/warehouse/WarehouseScene'
import Hud from '@/components/warehouse/Hud'
import LoadingScreen from '@/components/warehouse/LoadingScreen'
import Fallback from '@/components/warehouse/Fallback'
import { useWarehouse } from '@/components/warehouse/store'
import type { WarehouseData } from '@/lib/warehouse-data'

type Capability =
  | { kind: 'checking' }
  | { kind: '3d' }
  | { kind: 'fallback'; reason: 'no-webgl' | 'reduced-motion' | 'low-end' | 'no-data' }

function detectCapability(): Capability {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return { kind: 'fallback', reason: 'reduced-motion' }
    }
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (!gl) return { kind: 'fallback', reason: 'no-webgl' }
    // crude low-end heuristic: very low device memory or tiny old phones
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory
    if (mem !== undefined && mem <= 2) return { kind: 'fallback', reason: 'low-end' }
    return { kind: '3d' }
  } catch {
    return { kind: 'fallback', reason: 'no-webgl' }
  }
}

export default function DepozitClient({ data }: { data: WarehouseData }) {
  const [cap, setCap] = useState<Capability>({ kind: 'checking' })
  const setReducedMotion = useWarehouse(s => s.setReducedMotion)

  useEffect(() => {
    // the store is a module singleton — reset it so a revisit gets a fresh
    // loader/intro instead of last visit's state
    useWarehouse.setState({
      phase: 'loading',
      activeAisle: 0,
      aisleProgress: 0,
      hovered: null,
      selected: null,
      jumpOpen: false,
      texTotal: 0,
      texLoaded: 0,
      introSkipped: false,
    })
    const c = detectCapability()
    setCap(c)
    // reduced-motion users who still land in 3D via future toggles get calm camera
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }, [setReducedMotion])

  if (cap.kind === 'checking') {
    return <div className="wh-boot" aria-busy="true" />
  }

  if (cap.kind === 'fallback') {
    return <Fallback data={data} reason={cap.reason} />
  }

  if (data.aisles.length === 0) {
    // best-effort data: nothing came back → don't render an empty void
    return <Fallback data={data} reason="no-data" />
  }

  return (
    <div className="wh-root">
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 120, position: [0, 9, 26] }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
        }}
      >
        <WarehouseScene data={data} />
      </Canvas>
      <Hud data={data} />
      <LoadingScreen />
    </div>
  )
}
