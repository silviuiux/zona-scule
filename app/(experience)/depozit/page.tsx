// /depozit — Phase 1 prototype of the immersive 3D warehouse experience.
// Intentionally UNLINKED: not in Nav, Footer, sitemap, or metadata. Reachable
// only by direct URL during evaluation. Read-only against Supabase.
import DepozitClient from './DepozitClient'
import { getWarehouseData } from '@/lib/warehouse-data'
import './depozit.css'

// Data changes rarely (catalog taxonomy) — revalidate hourly like the PDPs.
export const revalidate = 3600

// Keep crawlers out while this is a prototype.
export const metadata = {
  robots: { index: false, follow: false },
  title: 'Depozit — Zona Scule',
}

export default async function DepozitPage() {
  // Server-side fetch: keeps Supabase usage consistent with the rest of the
  // app and ships the scene one serialized payload instead of client round-trips.
  const data = await getWarehouseData()
  return <DepozitClient data={data} />
}
