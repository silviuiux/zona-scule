'use client'
import { useState, useMemo, useTransition } from 'react'
import { reassignSubcategory, bulkReassign } from './actions'

type Sub = {
  id: string
  name: string
  parent_category_id: string
  category_name: string
  product_count: number
}

type Cat = { id: string; name: string }

export default function AdminClient({
  subcategories,
  categories,
}: {
  subcategories: Sub[]
  categories: Cat[]
}) {
  const [filter, setFilter] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkTarget, setBulkTarget] = useState('')
  const [saving, setSaving] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [notification, setNotification] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const filtered = useMemo(() => {
    return subcategories.filter(s => {
      const matchText = s.name.toLowerCase().includes(filter.toLowerCase())
      const matchCat = catFilter === 'all' || s.category_name === catFilter
      return matchText && matchCat
    })
  }, [subcategories, filter, catFilter])

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleReassign = async (subId: string, newCatId: string) => {
    setSaving(prev => new Set(prev).add(subId))
    try {
      await reassignSubcategory(subId, newCatId)
      setOverrides(prev => ({ ...prev, [subId]: newCatId }))
      setSaved(prev => new Set(prev).add(subId))
      setTimeout(() => setSaved(prev => { const n = new Set(prev); n.delete(subId); return n }), 2000)
    } catch {
      notify('Eroare la salvare', 'err')
    } finally {
      setSaving(prev => { const n = new Set(prev); n.delete(subId); return n })
    }
  }

  const handleBulkReassign = async () => {
    if (!bulkTarget || selected.size === 0) return
    startTransition(async () => {
      try {
        await bulkReassign(Array.from(selected), bulkTarget)
        const newOverrides: Record<string, string> = {}
        selected.forEach(id => { newOverrides[id] = bulkTarget })
        setOverrides(prev => ({ ...prev, ...newOverrides }))
        notify(`${selected.size} subcategorii mutate`)
        setSelected(new Set())
        setBulkTarget('')
      } catch {
        notify('Eroare la bulk reassign', 'err')
      }
    })
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(s => s.id)))
    }
  }

  const getCatName = (catId: string) => categories.find(c => c.id === catId)?.name ?? '—'

  const stats = useMemo(() => {
    const byCat: Record<string, number> = {}
    subcategories.forEach(s => {
      byCat[s.category_name] = (byCat[s.category_name] ?? 0) + 1
    })
    return byCat
  }, [subcategories])

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f11; color: #e8e6e3; font-family: 'Inter', system-ui, sans-serif; }

        .admin { min-height: 100vh; background: #0f0f11; }

        /* Header */
        .admin-header {
          background: #141416; border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 0 24px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .admin-logo {
          font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
        }
        .admin-logo span { color: rgb(217,44,43); }
        .admin-badge {
          font-size: 11px; padding: 3px 10px;
          background: rgba(217,44,43,0.15); color: rgb(217,44,43);
          border: 1px solid rgba(217,44,43,0.3); border-radius: 999px;
          letter-spacing: 0.04em;
        }

        /* Stats bar */
        .stats-bar {
          background: #141416; border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 12px 24px;
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .stat-chip {
          font-size: 11px; padding: 4px 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px; color: rgba(255,255,255,0.5);
          display: flex; gap: 6px; align-items: center;
          cursor: pointer; transition: border-color 150ms;
        }
        .stat-chip:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
        .stat-chip.active { border-color: rgb(217,44,43); color: rgb(217,44,43); background: rgba(217,44,43,0.08); }
        .stat-chip-count {
          font-weight: 700; color: rgba(255,255,255,0.8);
          font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        }
        .stat-chip.active .stat-chip-count { color: rgb(217,44,43); }

        /* Toolbar */
        .toolbar {
          padding: 12px 24px;
          display: flex; align-items: center; gap: 12px;
          background: #0f0f11; border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
        }
        .search-input {
          flex: 1; min-width: 200px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; padding: 8px 12px;
          font-size: 13px; color: #e8e6e3; outline: none;
          font-family: inherit;
          transition: border-color 150ms;
        }
        .search-input:focus { border-color: rgba(255,255,255,0.25); }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }

        /* Bulk action bar */
        .bulk-bar {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px;
          background: rgba(217,44,43,0.08);
          border: 1px solid rgba(217,44,43,0.2);
          border-radius: 6px; flex-shrink: 0;
        }
        .bulk-label { font-size: 12px; color: rgb(217,44,43); font-weight: 600; white-space: nowrap; }
        .bulk-select {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 3px; padding: 5px 8px;
          font-size: 12px; color: #e8e6e3;
          outline: none; cursor: pointer; font-family: inherit;
        }
        .bulk-select option { background: #1a1a1e; }
        .btn {
          padding: 6px 14px; border-radius: 3px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: inherit; letter-spacing: 0.04em;
          transition: background 150ms; white-space: nowrap;
        }
        .btn-red { background: rgb(217,44,43); color: #fff; }
        .btn-red:hover { background: rgb(190,35,34); }
        .btn-ghost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }

        /* Table */
        .table-wrap {
          overflow-x: auto;
          padding: 0 24px 80px;
        }
        table {
          width: 100%; border-collapse: collapse;
          font-size: 13px; min-width: 700px;
        }
        thead th {
          text-align: left; padding: 10px 12px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          white-space: nowrap;
        }
        thead th:first-child { width: 36px; }
        tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 100ms;
        }
        tbody tr:hover { background: rgba(255,255,255,0.02); }
        tbody tr.selected-row { background: rgba(217,44,43,0.06); }
        td { padding: 9px 12px; vertical-align: middle; }

        .sub-name { font-weight: 500; color: #e8e6e3; }
        .cat-badge {
          display: inline-block;
          font-size: 10px; padding: 2px 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px; color: rgba(255,255,255,0.5);
          white-space: nowrap;
        }
        .cat-badge.changed {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.3);
          color: rgb(34,197,94);
        }
        .count-mono {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.4);
        }
        .count-mono.zero { color: rgba(255,255,255,0.15); }

        /* Inline select */
        .cat-select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px; padding: 5px 8px;
          font-size: 12px; color: #e8e6e3;
          outline: none; cursor: pointer; font-family: inherit;
          width: 100%; max-width: 220px;
          transition: border-color 150ms;
        }
        .cat-select:focus { border-color: rgba(255,255,255,0.3); }
        .cat-select option { background: #1a1a1e; }

        .save-btn {
          padding: 4px 10px; border: none; border-radius: 3px;
          font-size: 11px; font-weight: 600; cursor: pointer;
          font-family: inherit; white-space: nowrap;
          transition: background 150ms;
        }
        .save-btn.idle {
          background: rgba(217,44,43,0.15);
          color: rgb(217,44,43);
          border: 1px solid rgba(217,44,43,0.3);
        }
        .save-btn.idle:hover { background: rgba(217,44,43,0.25); }
        .save-btn.saving {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
          cursor: default; border: 1px solid transparent;
        }
        .save-btn.saved {
          background: rgba(34,197,94,0.12);
          color: rgb(34,197,94);
          border: 1px solid rgba(34,197,94,0.3);
          cursor: default;
        }

        /* Checkbox */
        .cb { width: 15px; height: 15px; cursor: pointer; accent-color: rgb(217,44,43); }

        /* Notification */
        .notif {
          position: fixed; bottom: 24px; right: 24px; z-index: 200;
          padding: 12px 20px; border-radius: 6px;
          font-size: 13px; font-weight: 500;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          animation: slideUp 200ms ease;
        }
        .notif.ok { background: #1a2e1a; border: 1px solid rgba(34,197,94,0.4); color: rgb(34,197,94); }
        .notif.err { background: #2e1a1a; border: 1px solid rgba(217,44,43,0.4); color: rgb(217,44,43); }
        @keyframes slideUp {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Summary footer */
        .table-footer {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #141416; border-top: 1px solid rgba(255,255,255,0.07);
          padding: 10px 24px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: rgba(255,255,255,0.35);
        }
        .table-footer strong { color: rgba(255,255,255,0.7); }
      `}</style>

      <div className="admin">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-logo">
            <span>ZONA SCULE</span> / Admin
          </div>
          <span className="admin-badge">Category Audit</span>
        </div>

        {/* Stats chips — click to filter by category */}
        <div className="stats-bar">
          <div
            className={`stat-chip${catFilter === 'all' ? ' active' : ''}`}
            onClick={() => setCatFilter('all')}
          >
            Toate
            <span className="stat-chip-count">{subcategories.length}</span>
          </div>
          {Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, cnt]) => (
              <div
                key={cat}
                className={`stat-chip${catFilter === cat ? ' active' : ''}`}
                onClick={() => setCatFilter(prev => prev === cat ? 'all' : cat)}
              >
                {cat}
                <span className="stat-chip-count">{cnt}</span>
              </div>
            ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Caută subcategorie..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />

          {selected.size > 0 && (
            <div className="bulk-bar">
              <span className="bulk-label">{selected.size} selectate</span>
              <select
                className="bulk-select"
                value={bulkTarget}
                onChange={e => setBulkTarget(e.target.value)}
              >
                <option value="">Mută în...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                className="btn btn-red"
                onClick={handleBulkReassign}
                disabled={!bulkTarget || isPending}
              >
                {isPending ? 'Se salvează...' : 'Aplică'}
              </button>
              <button className="btn btn-ghost" onClick={() => setSelected(new Set())}>
                Anulează
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="cb"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Subcategorie</th>
                <th>Categorie curentă</th>
                <th>Produse</th>
                <th>Mută în</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => {
                const currentCatId = overrides[sub.id] ?? sub.parent_category_id
                const currentCatName = overrides[sub.id] ? getCatName(overrides[sub.id]) : sub.category_name
                const isChanged = !!overrides[sub.id] && overrides[sub.id] !== sub.parent_category_id
                const isSaving = saving.has(sub.id)
                const isSaved = saved.has(sub.id)
                const isSelected = selected.has(sub.id)

                return (
                  <tr key={sub.id} className={isSelected ? 'selected-row' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="cb"
                        checked={isSelected}
                        onChange={() => toggleSelect(sub.id)}
                      />
                    </td>
                    <td>
                      <span className="sub-name">{sub.name}</span>
                    </td>
                    <td>
                      <span className={`cat-badge${isChanged ? ' changed' : ''}`}>
                        {currentCatName}
                      </span>
                    </td>
                    <td>
                      <span className={`count-mono${sub.product_count === 0 ? ' zero' : ''}`}>
                        {sub.product_count.toLocaleString('ro')}
                      </span>
                    </td>
                    <td>
                      <select
                        className="cat-select"
                        value={currentCatId}
                        onChange={e => handleReassign(sub.id, e.target.value)}
                        disabled={isSaving}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {isSaving && (
                        <span className="save-btn saving">Saving...</span>
                      )}
                      {isSaved && (
                        <span className="save-btn saved">✓ Salvat</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="table-footer">
          <span>
            Afișând <strong>{filtered.length}</strong> din <strong>{subcategories.length}</strong> subcategorii
          </span>
          <span>
            {Object.keys(overrides).length > 0 && (
              <strong style={{ color: 'rgb(34,197,94)' }}>
                {Object.keys(overrides).length} modificări în această sesiune
              </strong>
            )}
          </span>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`notif ${notification.type}`}>{notification.msg}</div>
        )}
      </div>
    </>
  )
}
