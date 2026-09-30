'use client'
import { useMemo, useState, useTransition } from 'react'
import { logoutAction } from '@/lib/auth-actions'
import { setMessageHandled, setMessageSpam } from './actions'
import type { ContactMessage } from './page'

type Filter = 'new' | 'handled' | 'spam' | 'all'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'new', label: 'De rezolvat' },
  { key: 'handled', label: 'Rezolvate' },
  { key: 'spam', label: 'Spam' },
  { key: 'all', label: 'Toate' },
]

const fmt = new Intl.DateTimeFormat('ro-RO', {
  timeZone: 'Europe/Bucharest', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

function matches(m: ContactMessage, f: Filter) {
  if (f === 'all') return true
  if (f === 'spam') return m.spam
  if (f === 'handled') return !m.spam && !!m.handled_at
  return !m.spam && !m.handled_at
}

export default function MessagesClient({ messages }: { messages: ContactMessage[] }) {
  const [filter, setFilter] = useState<Filter>('new')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const counts = useMemo(() => Object.fromEntries(
    FILTERS.map(f => [f.key, messages.filter(m => matches(m, f.key)).length])
  ) as Record<Filter, number>, [messages])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return messages.filter(m => matches(m, filter) && (!q ||
      [m.nume, m.email, m.telefon, m.companie, m.produs, m.mesaj].some(v => v?.toLowerCase().includes(q))))
  }, [messages, filter, search])

  const act = (fn: () => Promise<void>) => startTransition(() => { fn() })

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f11; color: #e8e6e3; font-family: 'Inter', system-ui, sans-serif; }
        .admin { min-height: 100vh; background: #0f0f11; }
        .admin-header {
          background: #141416; border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50; gap: 12px;
        }
        .admin-logo { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.5); white-space: nowrap; }
        .admin-logo span { color: rgb(217,44,43); }
        .admin-nav { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
        .admin-badge { font-size: 11px; padding: 3px 10px; background: rgba(217,44,43,0.15); color: rgb(217,44,43); border: 1px solid rgba(217,44,43,0.3); border-radius: 999px; }
        .nav-link { font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none; padding: 6px 12px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.1); background: none; font-family: inherit; cursor: pointer; }
        .nav-link:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

        .toolbar { padding: 12px 24px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; background: #141416; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .chip { font-size: 12px; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-family: inherit;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); display: flex; gap: 8px; align-items: center; }
        .chip.active { border-color: rgb(217,44,43); color: rgb(217,44,43); background: rgba(217,44,43,0.08); }
        .chip b { font-family: 'IBM Plex Mono', monospace; font-size: 11px; }
        .search { flex: 1; min-width: 220px; margin-left: auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; padding: 8px 12px; font-size: 13px; color: #e8e6e3; outline: none; font-family: inherit; }

        .list { padding: 16px 24px 80px; display: flex; flex-direction: column; gap: 8px; max-width: 1200px; }
        .msg { background: #141416; border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; }
        .msg.handled { opacity: 0.6; }
        .msg-head { display: grid; grid-template-columns: 140px 1fr auto; gap: 16px; align-items: center; padding: 12px 16px; cursor: pointer; }
        .msg-date { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.45); }
        .msg-who { min-width: 0; }
        .msg-name { font-weight: 600; font-size: 14px; }
        .msg-name small { font-weight: 400; color: rgba(255,255,255,0.45); margin-left: 8px; }
        .msg-prod { font-size: 12px; color: rgba(255,255,255,0.55); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        .tag { font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
        .tag.new { background: rgba(217,44,43,0.15); color: rgb(217,44,43); }
        .tag.done { background: rgba(34,197,94,0.12); color: rgb(34,197,94); }
        .tag.spam { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }
        .msg-body { border-top: 1px solid rgba(255,255,255,0.06); padding: 16px; display: grid; grid-template-columns: 1fr 260px; gap: 24px; }
        .msg-text { white-space: pre-wrap; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.8); }
        .msg-meta { display: flex; flex-direction: column; gap: 10px; font-size: 13px; }
        .msg-meta span { display: block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 2px; }
        .msg-meta a { color: #e8e6e3; }
        .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
        .btn { font-size: 12px; padding: 7px 12px; border-radius: 4px; cursor: pointer; font-family: inherit; border: 1px solid rgba(255,255,255,0.15); background: none; color: #e8e6e3; text-decoration: none; }
        .btn.primary { background: rgb(217,44,43); border-color: rgb(217,44,43); color: #fff; }
        .btn:disabled { opacity: 0.5; cursor: default; }
        .empty { padding: 40px 0; color: rgba(255,255,255,0.35); font-size: 14px; }
        @media (max-width: 720px) {
          .msg-head { grid-template-columns: 1fr auto; }
          .msg-date { grid-column: 1 / -1; }
          .msg-body { grid-template-columns: 1fr; }
          .admin-logo { display: none; }
        }
      `}</style>

      <div className="admin">
        <div className="admin-header">
          <div className="admin-logo"><span>ZONA SCULE</span> / Admin</div>
          <div className="admin-nav">
            <span className="admin-badge">Mesaje</span>
            <a href="/admin" className="nav-link">Categorii</a>
            <a href="/admin/catalog" className="nav-link">Catalog</a>
            <a href="/admin/status" className="nav-link">Status produse</a>
            <form action={logoutAction} style={{ margin: 0 }}>
              <button type="submit" className="nav-link">Ieșire</button>
            </form>
          </div>
        </div>

        <div className="toolbar">
          {FILTERS.map(f => (
            <button key={f.key} type="button" className={`chip${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label} <b>{counts[f.key]}</b>
            </button>
          ))}
          <input className="search" placeholder="Caută nume, email, produs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="list">
          {shown.length === 0 && <p className="empty">Niciun mesaj aici.</p>}
          {shown.map(m => {
            const isOpen = open === m.id
            const status = m.spam ? 'spam' : m.handled_at ? 'done' : 'new'
            const reply = `mailto:${m.email}?subject=${encodeURIComponent('Ofertă Zona Scule' + (m.produs ? ` — ${m.produs}` : ''))}`
            return (
              <div key={m.id} className={`msg${m.handled_at ? ' handled' : ''}`}>
                <div className="msg-head" onClick={() => setOpen(isOpen ? null : m.id)}>
                  <div className="msg-date">{fmt.format(new Date(m.created_at))}</div>
                  <div className="msg-who">
                    <div className="msg-name">{m.nume}{m.companie && <small>{m.companie}</small>}</div>
                    <div className="msg-prod">{m.produs || m.mesaj.slice(0, 120)}</div>
                  </div>
                  <span className={`tag ${status}`}>{status === 'spam' ? 'Spam' : status === 'done' ? 'Rezolvat' : 'Nou'}</span>
                </div>
                {isOpen && (
                  <div className="msg-body">
                    <p className="msg-text">{m.mesaj}</p>
                    <div className="msg-meta">
                      <div><span>Email</span><a href={`mailto:${m.email}`}>{m.email}</a></div>
                      {m.telefon && <div><span>Telefon</span><a href={`tel:${m.telefon}`}>{m.telefon}</a></div>}
                      {m.produs && <div><span>Produs</span>{m.produs}</div>}
                      {m.handled_at && <div><span>Rezolvat la</span>{fmt.format(new Date(m.handled_at))}</div>}
                      <div className="actions">
                        {!m.spam && <a className="btn primary" href={reply}>Răspunde</a>}
                        {!m.spam && (
                          <button type="button" className="btn" disabled={pending} onClick={() => act(() => setMessageHandled(m.id, !m.handled_at))}>
                            {m.handled_at ? 'Marchează nerezolvat' : 'Marchează rezolvat'}
                          </button>
                        )}
                        <button type="button" className="btn" disabled={pending} onClick={() => act(() => setMessageSpam(m.id, !m.spam))}>
                          {m.spam ? 'Nu e spam' : 'Spam'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
