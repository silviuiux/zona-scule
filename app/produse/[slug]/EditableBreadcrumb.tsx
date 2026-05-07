'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Cat = { name: string }
type Sub = { name: string }

export default function EditableBreadcrumb({
  productId,
  categoryText,
  subcategoryText,
}: {
  productId: string
  categoryText: string | null
  subcategoryText: string | null
}) {
  const [cats, setCats] = useState<Cat[]>([])
  const [subs, setSubs] = useState<Sub[]>([])
  const [activeCat, setActiveCat] = useState(categoryText ?? '')
  const [activeSub, setActiveSub] = useState(subcategoryText ?? '')
  const [showCatDrop, setShowCatDrop] = useState(false)
  const [showSubDrop, setShowSubDrop] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)

  // Load categories once
  useEffect(() => {
    fetch('/api/all-categories')
      .then(r => r.json())
      .then(setCats)
  }, [])

  // Load subcategories when category changes
  useEffect(() => {
    if (!activeCat) { setSubs([]); return }
    fetch(`/api/subcategories?categorie=${encodeURIComponent(activeCat)}`)
      .then(r => r.json())
      .then(setSubs)
  }, [activeCat])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCatDrop(false)
      if (subRef.current && !subRef.current.contains(e.target as Node)) setShowSubDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const save = async (newCat: string, newSub: string) => {
    setSaving(true)
    try {
      await fetch('/api/update-product-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, categoryText: newCat, subcategoryText: newSub }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert('Eroare la salvare')
    } finally {
      setSaving(false)
    }
  }

  const selectCat = (name: string) => {
    setActiveCat(name)
    setActiveSub('')
    setShowCatDrop(false)
    save(name, '')
  }

  const selectSub = (name: string) => {
    setActiveSub(name)
    setShowSubDrop(false)
    save(activeCat, name)
  }

  return (
    <>
      <style>{`
        .ebc-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; align-items: center; }

        .bc-pill {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.5);
          padding: 4px 12px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 4px;
          text-decoration: none;
          transition: border-color 150ms, color 150ms;
          white-space: nowrap;
        }
        .bc-pill:hover { border-color: rgb(0,0,0); color: rgb(0,0,0); }

        /* Editable pill — same style + dropdown chevron */
        .ebc-wrap { position: relative; }
        .ebc-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.6);
          padding: 4px 10px 4px 12px;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 4px;
          cursor: pointer;
          background: none;
          transition: border-color 150ms, color 150ms, background 150ms;
          white-space: nowrap;
        }
        .ebc-pill:hover { border-color: rgb(0,0,0); color: rgb(0,0,0); background: rgba(0,0,0,0.02); }
        .ebc-pill.open { border-color: rgb(0,0,0); color: rgb(0,0,0); }
        .ebc-chevron {
          opacity: 0.4; flex-shrink: 0;
          transition: transform 200ms;
        }
        .ebc-pill.open .ebc-chevron { transform: rotate(180deg); opacity: 0.7; }

        /* Dropdown */
        .ebc-drop {
          position: absolute; top: calc(100% + 4px); left: 0;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          z-index: 200;
          min-width: 220px; max-width: 320px;
          max-height: 320px; overflow-y: auto;
          padding: 4px;
        }
        .ebc-drop::-webkit-scrollbar { width: 4px; }
        .ebc-drop::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }

        .ebc-option {
          display: block; width: 100%; text-align: left;
          padding: 7px 10px;
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.7);
          background: none; border: none; cursor: pointer;
          border-radius: 4px;
          transition: background 100ms, color 100ms;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ebc-option:hover { background: rgba(0,0,0,0.05); color: rgb(0,0,0); }
        .ebc-option.active { background: rgba(217,44,43,0.08); color: rgb(217,44,43); font-weight: 500; }

        /* Saved indicator */
        .ebc-saved {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600;
          color: rgb(34,197,94);
          padding: 2px 6px;
          background: rgba(34,197,94,0.1);
          border-radius: 999px;
          animation: fadeIn 200ms ease;
        }
        .ebc-saving {
          font-family: 'Inter', sans-serif;
          font-size: 10px; color: rgba(0,0,0,0.3);
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        /* Separator */
        .bc-sep { color: rgba(0,0,0,0.2); font-size: 12px; }
      `}</style>

      <div className="ebc-row">
        {/* Static Catalog link */}
        <Link href="/produse" className="bc-pill">Catalog</Link>
        <span className="bc-sep">/</span>

        {/* Editable Category */}
        <div className="ebc-wrap" ref={catRef}>
          <button
            className={`ebc-pill${showCatDrop ? ' open' : ''}`}
            onClick={() => { setShowCatDrop(v => !v); setShowSubDrop(false) }}
          >
            {activeCat || 'Fără categorie'}
            <svg className="ebc-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          {showCatDrop && (
            <div className="ebc-drop">
              {cats.map(c => (
                <button
                  key={c.name}
                  className={`ebc-option${c.name === activeCat ? ' active' : ''}`}
                  onClick={() => selectCat(c.name)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editable Subcategory */}
        {activeCat && (
          <>
            <span className="bc-sep">/</span>
            <div className="ebc-wrap" ref={subRef}>
              <button
                className={`ebc-pill${showSubDrop ? ' open' : ''}`}
                onClick={() => { setShowSubDrop(v => !v); setShowCatDrop(false) }}
              >
                {activeSub || 'Fără subcategorie'}
                <svg className="ebc-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {showSubDrop && (
                <div className="ebc-drop">
                  <button
                    className={`ebc-option${!activeSub ? ' active' : ''}`}
                    onClick={() => selectSub('')}
                  >
                    — Fără subcategorie
                  </button>
                  {subs.map((s: any) => (
                    <button
                      key={s.name}
                      className={`ebc-option${s.name === activeSub ? ' active' : ''}`}
                      onClick={() => selectSub(s.name)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Save status */}
        {saving && <span className="ebc-saving">Salvez...</span>}
        {saved && <span className="ebc-saved">✓ Salvat</span>}
      </div>
    </>
  )
}
