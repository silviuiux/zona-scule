'use client'

// One product on a shelf: a standing card with the real product photo as a
// texture. Texture loads lazily (only when its aisle is near the camera) and
// falls back to a branded color card if the image fails or blocks CORS.
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useWarehouse } from './store'
import type { ShelfProduct } from '@/lib/supabase'

// Pool textures — the same image URL is only ever fetched/decoded once.
const textureCache = new Map<string, Promise<THREE.Texture | null>>()
const loader = new THREE.TextureLoader()
loader.setCrossOrigin('anonymous')

function loadTexture(url: string): Promise<THREE.Texture | null> {
  let p = textureCache.get(url)
  if (!p) {
    p = new Promise(resolve => {
      loader.load(
        url,
        tex => {
          tex.colorSpace = THREE.SRGBColorSpace
          tex.anisotropy = 4
          resolve(tex)
        },
        undefined,
        () => resolve(null) // broken image / CORS → fallback card, never a crash
      )
    })
    textureCache.set(url, p)
  }
  return p
}

const CARD_W = 0.72
const CARD_H = 0.72

export default function ProductCard3D({
  product,
  aisleIndex,
  position,
  near,
  countTowardLoader,
}: {
  product: ShelfProduct
  aisleIndex: number
  position: [number, number, number]
  near: boolean
  countTowardLoader: boolean
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [attempted, setAttempted] = useState(false)
  const group = useRef<THREE.Group>(null)
  const setHovered = useWarehouse(s => s.setHovered)
  const setSelected = useWarehouse(s => s.setSelected)
  const registerTexture = useWarehouse(s => s.registerTexture)
  const textureDone = useWarehouse(s => s.textureDone)
  const [hover, setHover] = useState(false)

  const url = product.main_image_storage_url || product.main_image_url

  // if this card unmounts while hovered (aisle switch), restore the cursor
  useEffect(() => {
    return () => {
      if (useWarehouse.getState().hovered?.product.slug === product.slug) {
        useWarehouse.getState().setHovered(null)
        document.body.style.cursor = 'auto'
      }
    }
  }, [product.slug])

  useEffect(() => {
    if (!near || attempted || !url) return
    setAttempted(true)
    if (countTowardLoader) registerTexture()
    let alive = true
    loadTexture(url).then(tex => {
      if (alive && tex) setTexture(tex)
      if (countTowardLoader) textureDone()
    })
    return () => {
      alive = false
    }
  }, [near, attempted, url, countTowardLoader, registerTexture, textureDone])

  const fallbackColor = useMemo(() => {
    // deterministic per-product tint so fallback shelves still look varied
    let h = 0
    for (const ch of product.slug) h = (h * 31 + ch.charCodeAt(0)) % 360
    return new THREE.Color().setHSL(h / 360, 0.12, 0.82)
  }, [product.slug])

  return (
    <group
      ref={group}
      position={position}
      scale={hover ? 1.12 : 1}
      onPointerOver={e => {
        e.stopPropagation()
        setHover(true)
        setHovered({ product, aisleIndex })
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        // only clear if we're still the hovered product — pointer-over on the
        // next card may already have replaced it
        const s = useWarehouse.getState()
        if (s.hovered?.product.slug === product.slug) {
          s.setHovered(null)
          document.body.style.cursor = 'auto'
        }
      }}
      onClick={e => {
        e.stopPropagation()
        setSelected(product)
      }}
    >
      {/* photo card */}
      <mesh position={[0, CARD_H / 2, 0]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        {texture ? (
          <meshStandardMaterial map={texture} transparent side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial color={fallbackColor} side={THREE.DoubleSide} />
        )}
      </mesh>
      {/* tiny plinth so cards feel placed, not floating */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[CARD_W * 0.9, 0.02, 0.18]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  )
}
