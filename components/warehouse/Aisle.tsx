'use client'

// One category aisle: steel racking on both sides, canvas-texture signage in
// the site's display font, shelf sections per subcategory, real products.
import { useMemo } from 'react'
import * as THREE from 'three'
import { useWarehouse, aisleX } from './store'
import { makeSignTexture } from './canvasText'
import ProductCard3D from './ProductCard3D'
import type { WarehouseAisle } from '@/lib/warehouse-data'

const RACK_X = 2.1 // distance of racking from aisle centerline
const SECTION_LEN = 6.4
const SECTION_GAP = 1.6
const SHELF_LEVELS = [0.55, 1.45, 2.35]
const STEEL = '#3d4550'
const STEEL_DARK = '#2b313a'

function ShelfSection({
  aisle,
  aisleIndex,
  shelfIndex,
  near,
}: {
  aisle: WarehouseAisle
  aisleIndex: number
  shelfIndex: number
  near: boolean
}) {
  const shelf = aisle.shelves[shelfIndex]
  const side = shelfIndex % 2 === 0 ? -1 : 1 // alternate left/right racks
  const z0 = -(shelfIndex * (SECTION_LEN + SECTION_GAP)) - 3

  const labelTex = useMemo(
    () =>
      makeSignTexture({
        text: shelf.label,
        subtext: `${shelf.productCount} produse`,
        width: 1024,
        height: 200,
        background: '#1e1e1e',
      }),
    [shelf.label, shelf.productCount]
  )

  // 10 products over 3 boards: 4 / 3 / 3
  const perLevel = [4, 3, 3]
  const placed: { p: (typeof shelf.products)[number]; level: number; slot: number; slots: number }[] = []
  let idx = 0
  perLevel.forEach((n, level) => {
    for (let s = 0; s < n && idx < shelf.products.length; s++, idx++) {
      placed.push({ p: shelf.products[idx], level, slot: s, slots: n })
    }
  })

  return (
    <group
      position={[aisleX(aisleIndex) + side * RACK_X, 0, z0]}
      rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      {/* uprights */}
      {[-SECTION_LEN / 2, SECTION_LEN / 2].map(x => (
        <mesh key={x} position={[x, 1.5, 0]}>
          <boxGeometry args={[0.09, 3, 0.5]} />
          <meshStandardMaterial color={STEEL_DARK} />
        </mesh>
      ))}
      {/* shelf boards */}
      {SHELF_LEVELS.map(y => (
        <mesh key={y} position={[0, y - 0.03, 0]}>
          <boxGeometry args={[SECTION_LEN, 0.06, 0.55]} />
          <meshStandardMaterial color={STEEL} metalness={0.35} roughness={0.6} />
        </mesh>
      ))}
      {/* back panel */}
      <mesh position={[0, 1.5, -0.28]}>
        <planeGeometry args={[SECTION_LEN, 3]} />
        <meshStandardMaterial color="#23272e" side={THREE.DoubleSide} />
      </mesh>
      {/* subcategory label rail */}
      <mesh position={[0, 3.12, 0.1]}>
        <planeGeometry args={[SECTION_LEN * 0.92, 0.5]} />
        <meshBasicMaterial map={labelTex} toneMapped={false} />
      </mesh>
      {/* products */}
      {placed.map(({ p, level, slot, slots }) => (
        <ProductCard3D
          key={p.slug}
          product={p}
          aisleIndex={aisleIndex}
          near={near}
          countTowardLoader={aisleIndex === 0}
          position={[
            (slot - (slots - 1) / 2) * (SECTION_LEN / slots) * 0.92,
            SHELF_LEVELS[level],
            0.05,
          ]}
        />
      ))}
    </group>
  )
}

export default function Aisle({
  aisle,
  index,
}: {
  aisle: WarehouseAisle
  index: number
}) {
  const activeAisle = useWarehouse(s => s.activeAisle)
  const setActiveAisle = useWarehouse(s => s.setActiveAisle)
  const near = Math.abs(activeAisle - index) <= 1 // texture budget: only near aisles load

  const signTex = useMemo(
    () =>
      makeSignTexture({
        text: aisle.categoryName,
        subtext: `${aisle.productCount.toLocaleString('ro-RO')} produse`,
      }),
    [aisle.categoryName, aisle.productCount]
  )

  return (
    <group>
      {/* overhead entrance sign — clickable aisle jump */}
      <mesh
        position={[aisleX(index), 3.8, 0.5]}
        onClick={e => {
          e.stopPropagation()
          setActiveAisle(index)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <planeGeometry args={[5.4, 1.35]} />
        <meshBasicMaterial map={signTex} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* sign hangers */}
      {[-2.2, 2.2].map(dx => (
        <mesh key={dx} position={[aisleX(index) + dx, 4.9, 0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2]} />
          <meshStandardMaterial color={STEEL_DARK} />
        </mesh>
      ))}
      {aisle.shelves.map((_, si) => (
        <ShelfSection
          key={si}
          aisle={aisle}
          aisleIndex={index}
          shelfIndex={si}
          near={near}
        />
      ))}
    </group>
  )
}
