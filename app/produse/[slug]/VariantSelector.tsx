'use client'

/**
 * Variant selector for the PDP.
 *
 * Two modes, chosen automatically per family:
 *
 * 1. Multi-axis grid (families with ≥1 structured `specs` key that differs
 *    across variants — currently PFERD, e.g. corner radius / shank type /
 *    cutting diameter). One row per differing spec, one button per distinct
 *    value in that row. Clicking a value jumps to the sibling variant that
 *    matches all OTHER currently-selected axis values plus the new one. If
 *    no such combination exists in the family, the button is shown greyed
 *    out and disabled rather than linking to a mismatched product.
 *
 * 2. Flat dropdown (families without structured specs — most other brands,
 *    e.g. Milwaukee battery-kit configurations): a single <select> of
 *    variant_label options, unchanged from the previous behaviour.
 *
 * Renders nothing for a family with a single variant.
 */
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { VariantOption } from '@/lib/supabase'

// Spec keys we want first, when present, in this order. Anything else keeps
// its first-seen order after these.
const AXIS_PRIORITY = ['diamet', 'radius', 'raz', 'shank', 'schaft', 'coad']

function prettyLabel(key: string): string {
  return key
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

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
    const diff = [...keys].filter(k => new Set(variants.map(v => v.specs?.[k] ?? '')).size > 1)
    return diff.sort((a, b) => {
      const pa = AXIS_PRIORITY.findIndex(p => a.toLowerCase().includes(p))
      const pb = AXIS_PRIORITY.findIndex(p => b.toLowerCase().includes(p))
      const ra = pa === -1 ? AXIS_PRIORITY.length : pa
      const rb = pb === -1 ? AXIS_PRIORITY.length : pb
      return ra - rb
    })
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

  const current = variants.find(v => v.slug === currentSlug) ?? variants[0]

  // For each axis, the sibling (if any) that matches the current selection
  // on every OTHER axis but has the candidate value on THIS axis.
  const findSibling = (axisKey: string, value: string): VariantOption | null => {
    return (
      variants.find(v => {
        if ((v.specs?.[axisKey] ?? '') !== value) return false
        return distinguishing.every(k => {
          if (k === axisKey) return true
          return (v.specs?.[k] ?? '') === (current.specs?.[k] ?? '')
        })
      }) ?? null
    )
  }

  if (!variants || variants.length < 2) return null

  const labelStyle: CSSProperties = {
    display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '11px',
    fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.45)', marginBottom: '8px',
  }

  // ── Multi-axis grid ──
  if (distinguishing.length > 0) {
    return (
      <div style={{ margin: '4px 0 24px', maxWidth: '560px' }}>
        {distinguishing.map(axisKey => {
          const values = [...new Set(variants.map(v => v.specs?.[axisKey]).filter(Boolean))] as string[]
          values.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
          const activeValue = current.specs?.[axisKey] ?? ''

          return (
            <div key={axisKey} style={{ marginBottom: '16px' }}>
              <span style={labelStyle}>{prettyLabel(axisKey)}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {values.map(value => {
                  const isActive = value === activeValue
                  const sibling = isActive ? current : findSibling(axisKey, value)
                  const disabled = !sibling
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (sibling && sibling.slug !== currentSlug) router.push(`/produse/${sibling.slug}`)
                      }}
                      style={{
                        padding: '8px 14px', borderRadius: '4px',
                        fontFamily: 'Recursive, sans-serif', fontSize: '13px', fontWeight: 500,
                        border: isActive ? '1px solid rgb(20,20,20)' : '1px solid rgba(0,0,0,0.15)',
                        background: isActive ? 'rgb(20,20,20)' : '#fff',
                        color: disabled ? 'rgba(0,0,0,0.3)' : isActive ? '#fff' : 'rgb(20,20,20)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        transition: 'background 150ms, color 150ms, border-color 150ms',
                      }}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Flat dropdown fallback (no structured specs) ──
  const opts = [...variants].sort((a, b) =>
    labelFor(a).localeCompare(labelFor(b), undefined, { numeric: true })
  )

  return (
    <div style={{ margin: '4px 0 24px' }}>
      <label htmlFor="variant-select" style={labelStyle}>
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
            padding: '12px 38px 12px 14px', border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '4px', background: '#fff', cursor: 'pointer',
            fontFamily: 'Recursive, sans-serif', fontSize: '14px', color: 'rgb(20,20,20)',
          }}
        >
          {opts.map(v => (
            <option key={v.slug} value={v.slug}>{labelFor(v)}</option>
          ))}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'rgba(0,0,0,0.5)', fontSize: '12px',
          }}
        >
          ▾
        </span>
      </div>
    </div>
  )
}
