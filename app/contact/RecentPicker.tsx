'use client'
/* eslint-disable @next/next/no-img-element -- product photos come from hosts outside next/image's list */
import { useRef, useState } from 'react'
import Link from 'next/link'
import { readRecent, type RecentProduct } from '@/lib/recently-viewed'

/**
 * "Istoric" — a small button inside the contact form's products line that
 * opens the products this browser viewed lately (up to 25, newest first);
 * tick any of them and they are attached to the request.
 */
export default function RecentPicker({ picked, onPick }: { picked: RecentProduct[]; onPick: (p: RecentProduct[]) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [items, setItems] = useState<RecentProduct[]>([])
  const [sel, setSel] = useState<Set<string>>(new Set())

  const open = () => {
    setItems(readRecent())
    setSel(new Set(picked.map(p => p.slug)))
    ref.current?.showModal()
  }
  const close = () => ref.current?.close()
  const toggle = (slug: string) => setSel(s => {
    const n = new Set(s)
    if (n.has(slug)) n.delete(slug)
    else n.add(slug)
    return n
  })
  const confirm = () => {
    // keep ones picked earlier that dropped out of the history, then the ticked ones in history order
    const kept = picked.filter(p => sel.has(p.slug) && !items.some(i => i.slug === p.slug))
    onPick([...kept, ...items.filter(i => sel.has(i.slug))])
    close()
  }

  return (
    <>
      <style>{`
        .rp-btn {
          flex: 0 0 auto; align-self: flex-end; margin-bottom: 4px;
          display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px;
          border: 1px solid rgba(0,0,0,0.14); border-radius: 4px; background: rgb(255,255,255); cursor: pointer;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgb(0,0,0); transition: border-color 150ms, color 150ms;
        }
        .rp-btn:hover { border-color: rgba(0,0,0,0.45); }
        .rp-btn b { font-weight: 500; color: rgb(217,44,43); }

        .rp-dialog {
          width: min(640px, calc(100vw - 32px)); max-height: min(720px, calc(100vh - 64px));
          margin: auto; padding: 0; border: 1px solid rgba(0,0,0,0.12); border-radius: 6px;
          background: rgb(255,255,255); box-shadow: 0 24px 64px rgba(0,0,0,0.12);
          color: rgb(0,0,0);
        }
        .rp-dialog[open] { display: flex; flex-direction: column; }
        .rp-dialog::backdrop { background: rgba(0,0,0,0.25); }
        .rp-head { display: flex; align-items: baseline; gap: 16px; padding: 24px 24px 16px; border-bottom: 1px solid rgba(0,0,0,0.08); }
        .rp-title { font-family: 'Neuton', serif; font-size: 30px; line-height: 1; }
        .rp-meta { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.45); }
        .rp-x { margin-left: auto; border: none; background: none; cursor: pointer; font-size: 22px; line-height: 1; color: rgba(0,0,0,0.5); }
        .rp-x:hover { color: rgb(0,0,0); }
        .rp-list { list-style: none; overflow-y: auto; flex: 1; padding: 8px 12px; }
        .rp-item label {
          display: grid; grid-template-columns: 20px 56px 1fr; align-items: center; gap: 14px;
          padding: 10px 12px; border-radius: 4px; cursor: pointer; transition: background 120ms;
        }
        .rp-item label:hover { background: rgb(246,246,246); }
        .rp-item input { width: 16px; height: 16px; accent-color: rgb(217,44,43); cursor: pointer; }
        .rp-img { width: 56px; height: 56px; border: 1px solid rgba(0,0,0,0.08); border-radius: 4px; background: rgb(255,255,255); object-fit: contain; padding: 4px; }
        .rp-img.empty { background: rgb(244,244,244); }
        .rp-brand { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.45); }
        .rp-name { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.35; color: rgb(0,0,0); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .rp-sku { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; color: rgba(0,0,0,0.45); }
        .rp-empty { padding: 40px 24px; font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(0,0,0,0.6); }
        .rp-empty a { color: rgb(217,44,43); }
        .rp-foot { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid rgba(0,0,0,0.08); }
        .rp-foot button {
          height: 36px; padding: 0 18px; border-radius: 3px; cursor: pointer;
          font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
        }
        .rp-cancel { background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.14); color: rgb(0,0,0); }
        .rp-ok { background: rgb(0,0,0); border: 1px solid rgb(0,0,0); color: rgb(255,255,255); }
        .rp-ok:hover { background: rgb(217,44,43); border-color: rgb(217,44,43); }
      `}</style>

      <button type="button" className="rp-btn" onClick={open} aria-haspopup="dialog">
        Istoric{picked.length > 0 && <b>{picked.length}</b>}
      </button>

      <dialog ref={ref} className="rp-dialog" aria-labelledby="rp-title"
        onClick={e => { if (e.target === e.currentTarget) close() }}>
        <div className="rp-head">
          <span id="rp-title" className="rp-title">Produse vizualizate</span>
          <span className="rp-meta">ultimele {items.length}</span>
          <button type="button" className="rp-x" onClick={close} aria-label="Închide">×</button>
        </div>
        {items.length === 0 ? (
          <p className="rp-empty">
            Nu ați deschis încă niciun produs pe acest dispozitiv. Produsele pe care le vizitați în{' '}
            <Link href="/produse">catalog</Link> apar aici, ca să le puteți atașa cererii.
          </p>
        ) : (
          <ul className="rp-list">
            {items.map(p => (
              <li key={p.slug} className="rp-item">
                <label>
                  <input type="checkbox" checked={sel.has(p.slug)} onChange={() => toggle(p.slug)} />
                  {p.image ? <img className="rp-img" src={p.image} alt="" loading="lazy" /> : <span className="rp-img empty" />}
                  <span>
                    {p.brand && <span className="rp-brand">{p.brand}</span>}
                    <span className="rp-name">{p.name}</span>
                    {p.sku && <span className="rp-sku">{p.sku}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className="rp-foot">
          <button type="button" className="rp-cancel" onClick={close}>Renunță</button>
          {items.length > 0 && (
            <button type="button" className="rp-ok" onClick={confirm}>
              {sel.size > 0 ? `Atașează ${sel.size} ${sel.size === 1 ? 'produs' : 'produse'}` : 'Gata'}
            </button>
          )}
        </div>
      </dialog>
    </>
  )
}
