/**
 * VariationPills — Server Component
 *
 * Renders a horizontal pill carousel showing all available variants
 * for a product family (e.g. different diameters of the same drill).
 *
 * - Current variant: filled black pill (non-clickable)
 * - Other variants:  outlined pills that link to /produse/[slug]
 * - If there is only 1 variant (or no variations_json), renders nothing.
 *
 * The component resolves each sibling variant's internal slug from Supabase
 * using a single batched query keyed on SKU.
 */

import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawVariation {
  label: string
  sku: string
  manufacturer_url: string
}

interface ResolvedVariation extends RawVariation {
  /** Internal /produse/[slug] path — null if the product isn't in our DB yet */
  href: string | null
}

interface Props {
  variationsJson: string | null | undefined
  currentSku: string | null | undefined
}

// ── Component ─────────────────────────────────────────────────────────────────

export default async function VariationPills({ variationsJson, currentSku }: Props) {
  // Parse — bail silently on bad data
  if (!variationsJson) return null

  let raw: RawVariation[] = []
  try {
    raw = JSON.parse(variationsJson)
  } catch {
    return null
  }

  if (!Array.isArray(raw) || raw.length <= 1) return null

  // Batch-resolve slugs for all variant SKUs in one Supabase query
  const skus = raw.map(v => v.sku).filter(Boolean)
  const { data: slugRows } = await supabase
    .from('products')
    .select('sku, slug')
    .in('sku', skus)

  const slugMap: Record<string, string> = {}
  for (const row of slugRows ?? []) {
    if (row.sku && row.slug) slugMap[row.sku] = row.slug
  }

  const resolved: ResolvedVariation[] = raw.map(v => ({
    ...v,
    href: slugMap[v.sku] ? `/produse/${slugMap[v.sku]}` : null,
  }))

  return (
    <div className="var-pills-wrap">
      <p className="var-pills-label">Variante disponibile</p>
      <div className="var-pills-row">
        {resolved.map(v => {
          const isCurrent = v.sku === currentSku

          if (isCurrent) {
            return (
              <span key={v.sku} className="var-pill var-pill-active">
                {v.label}
              </span>
            )
          }

          if (!v.href) {
            // Variant exists in the source but isn't imported yet — show disabled
            return (
              <span key={v.sku} className="var-pill var-pill-disabled">
                {v.label}
              </span>
            )
          }

          return (
            <Link key={v.sku} href={v.href} className="var-pill var-pill-link">
              {v.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
