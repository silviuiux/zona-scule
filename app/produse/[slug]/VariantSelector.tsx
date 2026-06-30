'use client'

/**
 * Variant selector for the PFERD PDP.
 * Dropdown of the other variants in the same family, labelled by the specs that
 * DIFFER across the family. Selecting one navigates to that variant's PDP
 * (new slug → new SKU/images/specs). Renders nothing for a single variant.
 */
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import type { VariantOption } from '@/lib/supabase'

export default function VariantSelector({
  variants,
  currentSlug,
}: {
  variants: VariantOption[]
  currentSlug: string
}) {
  const router = useRouter()

  const distinguishing = useMemo(() => {
    const keys = new Set<string>()
    for (const v of variants) for (const k of Object.keys(v.specs ?? {})) keys.add(k)
    return [...keys].filter(k => new Set(variants.map(v => v.specs?.[k] ?? '')).size > 1)
  }, [variants])

  const labelFor = (v: VariantOption) => {
    if (distinguishing.length && v.specs) {
      const parts = distinguishing
        .map(k => (v.specs?.[k] ? `${k}: ${v.specs[k]}` : null))
        .filter(Boolean)
      if (parts.length) return parts.join('  ·  ')
    }
    return v.variant_label || v.name || v.sku || v.slug
  }

  if (!variants || variants.length < 2) return null

  const opts = [...variants].sort((a, b) =>
    labelFor(a).localeCompare(labelFor(b), undefined, { numeric: true })
  )

  return (
    <div style={{ margin: '4px 0 24px' }}>
      <label
        htmlFor="variant-select"
        style={{
          display: 'block', fontFamily: 'var(--mono)', fontSize: '11px',
          fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'rgba(240,237,231,0.45)', marginBottom: '8px',
        }}
      >
        Alege varianta ({variants.length})
      </label>
      <div style={{ position: 'relative', maxWidth: '520px' }}>
        <select
          id="variant-select"
          value={currentSlug}
          onChange={e => {
            const slug = e.target.value
            if (slug && slug !== currentSlug) router.push(`/produse/${slug}`)
          }}
          style={{
            width: '100%', appearance: 'none', WebkitAppearance: 'none',
            padding: '13px 38px 13px 16px', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
            fontFamily: 'Recursive, sans-serif', fontSize: '14px', color: 'rgb(240,237,231)',
          }}
        >
          {opts.map(v => (
            <option key={v.slug} value={v.slug} style={{ background: 'rgb(19,18,16)', color: 'rgb(240,237,231)' }}>{labelFor(v)}</option>
          ))}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'rgba(240,237,231,0.5)', fontSize: '12px',
          }}
        >
          ▾
        </span>
      </div>
    </div>
  )
}
