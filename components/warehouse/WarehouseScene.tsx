'use client'

// The warehouse itself: concrete floor, dock lighting, fog, dust motes,
// one aisle per real product category.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Aisle from './Aisle'
import CameraRig from './CameraRig'
import { aisleX, AISLE_LENGTH, useWarehouse } from './store'
import type { WarehouseData } from '@/lib/warehouse-data'

function DustMotes({ centerX }: { centerX: number }) {
  const ref = useRef<THREE.Points>(null)
  const reducedMotion = useWarehouse(s => s.reducedMotion)
  const positions = useMemo(() => {
    const n = 350
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = centerX + (Math.random() - 0.5) * 80
      arr[i * 3 + 1] = Math.random() * 6
      arr[i * 3 + 2] = -Math.random() * (AISLE_LENGTH + 10) + 5
    }
    return arr
  }, [centerX])

  useFrame(({ clock }) => {
    if (ref.current && !reducedMotion) {
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.02) * 0.02
      ref.current.position.y = Math.sin(clock.elapsedTime * 0.11) * 0.15
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#ffe9c4" transparent opacity={0.35} sizeAttenuation />
    </points>
  )
}

export default function WarehouseScene({ data }: { data: WarehouseData }) {
  const n = data.aisles.length
  const centerX = aisleX(Math.floor((n - 1) / 2))
  const width = Math.max(n * 14 + 30, 60)

  return (
    <>
      <color attach="background" args={['#0d0f12']} />
      <fog attach="fog" args={['#0d0f12', 14, 55]} />

      {/* ambient + cool fill */}
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#8fa3bf', '#1a1c1f', 0.4]} />

      {/* warm dock lights down each aisle */}
      {data.aisles.map((_, i) => (
        <group key={i}>
          <pointLight position={[aisleX(i), 5.2, -6]} intensity={26} distance={22} color="#ffd9a0" />
          <pointLight position={[aisleX(i), 5.2, -20]} intensity={26} distance={22} color="#ffd9a0" />
          {/* light fixture proxies */}
          {[-6, -20].map(z => (
            <mesh key={z} position={[aisleX(i), 5.6, z]}>
              <boxGeometry args={[1.6, 0.12, 0.4]} />
              <meshStandardMaterial color="#111" emissive="#ffd9a0" emissiveIntensity={2.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* concrete floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0, -10]}>
        <planeGeometry args={[width, 90]} />
        <meshStandardMaterial color="#33363b" roughness={0.92} metalness={0.05} />
      </mesh>
      {/* painted safety lines along each aisle */}
      {data.aisles.map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[aisleX(i), 0.005, -(AISLE_LENGTH / 2) + 3]}>
          <planeGeometry args={[3.2, AISLE_LENGTH + 6]} />
          <meshStandardMaterial color="#3a3e44" roughness={0.95} />
        </mesh>
      ))}

      {/* back wall + side walls (dark, fog does most of the work) */}
      <mesh position={[centerX, 5, -(AISLE_LENGTH + 8)]}>
        <planeGeometry args={[width, 14]} />
        <meshStandardMaterial color="#15171b" />
      </mesh>

      <DustMotes centerX={centerX} />

      {data.aisles.map((aisle, i) => (
        <Aisle key={aisle.categoryName} aisle={aisle} index={i} />
      ))}

      <CameraRig aisleCount={n} />
    </>
  )
}
