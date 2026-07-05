'use client'

// Central state for the /depozit warehouse experience (zustand).
import { create } from 'zustand'
import type { ShelfProduct } from '@/lib/supabase'

export type Phase = 'loading' | 'intro' | 'explore'

export type HoverInfo = {
  product: ShelfProduct
  aisleIndex: number
}

type WarehouseStore = {
  phase: Phase
  setPhase: (p: Phase) => void

  /** Which category aisle the camera is in / heading to. */
  activeAisle: number
  setActiveAisle: (i: number) => void

  /** 0 → aisle entrance, 1 → far end of the aisle. */
  aisleProgress: number
  setAisleProgress: (p: number) => void

  hovered: HoverInfo | null
  setHovered: (h: HoverInfo | null) => void

  selected: ShelfProduct | null
  setSelected: (p: ShelfProduct | null) => void

  jumpOpen: boolean
  setJumpOpen: (v: boolean) => void

  reducedMotion: boolean
  setReducedMotion: (v: boolean) => void

  /** Initial-texture-batch loading progress, 0..1 (drives the loader bar). */
  texTotal: number
  texLoaded: number
  registerTexture: () => void
  textureDone: () => void

  introSkipped: boolean
  skipIntro: () => void
}

export const useWarehouse = create<WarehouseStore>(set => ({
  phase: 'loading',
  setPhase: phase => set({ phase }),

  activeAisle: 0,
  setActiveAisle: i => set({ activeAisle: i, aisleProgress: 0 }),

  aisleProgress: 0,
  setAisleProgress: p => set({ aisleProgress: Math.max(0, Math.min(1, p)) }),

  hovered: null,
  setHovered: hovered => set({ hovered }),

  selected: null,
  setSelected: selected => set({ selected }),

  jumpOpen: false,
  setJumpOpen: jumpOpen => set({ jumpOpen }),

  reducedMotion: false,
  setReducedMotion: reducedMotion => set({ reducedMotion }),

  texTotal: 0,
  texLoaded: 0,
  registerTexture: () => set(s => ({ texTotal: s.texTotal + 1 })),
  textureDone: () => set(s => ({ texLoaded: s.texLoaded + 1 })),

  introSkipped: false,
  skipIntro: () => set({ introSkipped: true, phase: 'explore' }),
}))

// ── Shared spatial constants (single source of truth for scene + camera) ──
export const AISLE_SPACING = 14 // X distance between aisle centerlines
export const AISLE_LENGTH = 34 // Z extent of one aisle
export const AISLE_Z_START = 2 // camera Z at aisle entrance
export const AISLE_Z_END = -(AISLE_LENGTH - 6) // camera Z at far end
export const EYE_HEIGHT = 1.7

export function aisleX(index: number) {
  return index * AISLE_SPACING
}
