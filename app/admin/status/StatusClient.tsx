'use client'
import { useState, useMemo } from 'react'
import { logoutAction } from '@/lib/auth-actions'
import type { EnrichmentRow } from './page'

type SortKey = 'brand_name' | 'category_text' | 'total' | 'has_desc' | 'detailed' | 'enriched_count'
type SortDir = 'asc' | 'desc'

// Row shape after folding st1-3 + app1-3 into one "detailed description" metric.
type Row = EnrichmentRow & { detailed_count: number; detailed_total: number }

// Completion-rate color buckets — green means "largely mapped", red means
// "mostly missing", so a glance at the table surfaces the worst gaps.
function pctOf(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0
}
function pctClass(pct: number): string {
  if (pct >= 80) return 'pct-good'
  if (pct >= 40) return 'pct-mid'
  return 'pct-bad'
}

function PctCell({ count, total }: { count: number; total: number }) {
  const pct = pctOf(count, total)
  return (
    <span className={`pct-badge ${pctClass(pct)}`}>
      <span className="pct-num">{pct}%</span>
      <span className="pct-frac">{count.toLocaleString('ro')}/{total.toLocaleString('ro')}</span>
    </span>
  )
}

export default function StatusClient({ rows: rawRows }: { rows: EnrichmentRow[] }) {
  const rows: Row[] = useMemo(() => rawRows.map(r => ({
    ...r,
    detailed_count: r.has_st1 + r.has_st2 + r.has_st3 + r.has_app1 + r.has_app2 + r.has_app3,
    detailed_total: r.total * 6,
  })), [rawRows])

  const [brandFilter, setBrandFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('brand_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const brandTotals = useMemo(() => {
    const m: Record<string, number> = {}
    rows.forEach(r => { m[r.brand_name] = (m[r.brand_name] ?? 0) + r.total })
    return m
  }, [rows])

  const overall = useMemo(() => {
    const sum = (k: keyof Row) => rows.reduce((acc, r) => acc + (r[k] as number), 0)
    return {
      total: sum('total'),
      has_desc: sum('has_desc'),
      detailed_count: sum('detailed_count'),
      detailed_total: sum('detailed_total'),
      enriched_count: sum('enriched_count'),
    }
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(r => {
      const matchBrand = brandFilter === 'all' || r.brand_name === brandFilter
      const matchSearch = !q ||
        r.category_text.toLowerCase().includes(q) ||
        r.brand_name.toLowerCase().includes(q)
      return matchBrand && matchSearch
    })
  }, [rows, brandFilter, search])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      let cmp: number
      if (sortKey === 'brand_name' || sortKey === 'category_text') {
        cmp = a[sortKey].localeCompare(b[sortKey])
      } else if (sortKey === 'detailed') {
        cmp = pctOf(a.detailed_count, a.detailed_total) - pctOf(b.detailed_count, b.detailed_total)
      } else {
        cmp = (a[sortKey] as number) - (b[sortKey] as number)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(['brand_name', 'category_text'].includes(key) ? 'asc' : 'asc')
    }
  }

  const sortIndicator = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f11; color: #e8e6e3; font-family: 'Inter', system-ui, sans-serif; }

        .admin { min-height: 100vh; background: #0f0f11; }

        .admin-header {
          background: #141416; border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 0 24px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .admin-logo { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .admin-logo span { color: rgb(217,44,43); }
        .admin-badge {
          font-size: 11px; padding: 3px 10px;
          background: rgba(217,44,43,0.15); color: rgb(217,44,43);
          border: 1px solid rgba(217,44,43,0.3); border-radius: 999px; letter-spacing: 0.04em;
        }
        .nav-link {
          font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none;
          padding: 6px 12px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.1);
          transition: color 150ms, border-color 150ms;
        }
        .nav-link:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

        /* Overview strip — headline completion numbers across the whole catalog */
        .overview-bar {
          background: #141416; border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 16px 24px; display: flex; gap: 28px; flex-wrap: wrap;
        }
        .ov-item { display: flex; flex-direction: column; gap: 3px; }
        .ov-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
        .ov-value { font-family: 'IBM Plex Mono', monospace; font-size: 18px; color: #e8e6e3; }
        .ov-value.good { color: rgb(34,197,94); }
        .ov-value.mid { color: rgb(234,179,8); }
        .ov-value.bad { color: rgb(217,44,43); }

        .stats-bar {
          background: #141416; border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 12px 24px; display: flex; gap: 8px; flex-wrap: wrap;
        }
        .stat-chip {
          font-size: 11px; padding: 4px 10px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px; color: rgba(255,255,255,0.5);
          display: flex; gap: 6px; align-items: center; cursor: pointer; transition: border-color 150ms;
        }
        .stat-chip:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
        .stat-chip.active { border-color: rgb(217,44,43); color: rgb(217,44,43); background: rgba(217,44,43,0.08); }
        .stat-chip-count { font-weight: 700; color: rgba(255,255,255,0.8); font-family: 'IBM Plex Mono', monospace; font-size: 10px; }
        .stat-chip.active .stat-chip-count { color: rgb(217,44,43); }

        .toolbar {
          padding: 12px 24px; display: flex; align-items: center; gap: 12px;
          background: #0f0f11; border-bottom: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;
        }
        .search-input {
          flex: 1; min-width: 220px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; padding: 8px 12px; font-size: 13px; color: #e8e6e3;
          outline: none; font-family: inherit; transition: border-color 150ms;
        }
        .search-input:focus { border-color: rgba(255,255,255,0.25); }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }

        .table-wrap { overflow-x: auto; padding: 0 24px 80px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 760px; }
        thead th {
          text-align: left; padding: 10px 12px; font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap;
          cursor: pointer; user-select: none; transition: color 150ms;
          position: sticky; top: 56px; background: #0f0f11; z-index: 10;
        }
        thead th:hover { color: rgba(255,255,255,0.6); }
        thead th.sorted { color: rgb(217,44,43); }
        tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 100ms; }
        tbody tr:hover { background: rgba(255,255,255,0.02); }
        td { padding: 9px 12px; vertical-align: middle; }

        .brand-cell { font-weight: 600; color: #e8e6e3; }
        .cat-cell { color: rgba(255,255,255,0.6); }
        .count-mono { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.6); }

        .pct-badge { display: inline-flex; flex-direction: column; gap: 1px; line-height: 1.2; }
        .pct-num { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700; }
        .pct-frac { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.25); }
        .pct-good .pct-num { color: rgb(34,197,94); }
        .pct-mid .pct-num { color: rgb(234,179,8); }
        .pct-bad .pct-num { color: rgb(217,44,43); }

        .table-footer {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #141416; border-top: 1px solid rgba(255,255,255,0.07);
          padding: 10px 24px; display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: rgba(255,255,255,0.35);
        }
        .table-footer strong { color: rgba(255,255,255,0.7); }
      `}</style>

      <div className="admin">
        <div className="admin-header">
          <div className="admin-logo"><span>ZONA SCULE</span> / Admin</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="admin-badge">Status produse</span>
            <a href="/admin" className="nav-link">Categorii</a>
            <form action={logoutAction} style={{ margin: 0 }}>
              <button type="submit" className="nav-link" style={{ background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}>Ieșire</button>
            </form>
          </div>
        </div>

        {/* Overview — whole-catalog completion, independent of active filters */}
        <div className="overview-bar">
          <div className="ov-item">
            <span className="ov-label">Total produse</span>
            <span className="ov-value">{overall.total.toLocaleString('ro')}</span>
          </div>
          <div className="ov-item">
            <span className="ov-label">Descriere</span>
            <span className={`ov-value ${pctClass(pctOf(overall.has_desc, overall.total)) === 'pct-good' ? 'good' : pctClass(pctOf(overall.has_desc, overall.total)) === 'pct-mid' ? 'mid' : 'bad'}`}>
              {pctOf(overall.has_desc, overall.total)}%
            </span>
          </div>
          <div className="ov-item">
            <span className="ov-label">Descriere detaliata (ST1-3 + App1-3)</span>
            <span className="ov-value">{pctOf(overall.detailed_count, overall.detailed_total)}%</span>
          </div>
          <div className="ov-item">
            <span className="ov-label">Enriched (flag)</span>
            <span className="ov-value">{pctOf(overall.enriched_count, overall.total)}%</span>
          </div>
        </div>

        {/* Brand filter chips */}
        <div className="stats-bar">
          <div className={`stat-chip${brandFilter === 'all' ? ' active' : ''}`} onClick={() => setBrandFilter('all')}>
            Toate brandurile
            <span className="stat-chip-count">{overall.total.toLocaleString('ro')}</span>
          </div>
          {Object.entries(brandTotals).sort((a, b) => b[1] - a[1]).map(([brand, cnt]) => (
            <div
              key={brand}
              className={`stat-chip${brandFilter === brand ? ' active' : ''}`}
              onClick={() => setBrandFilter(prev => prev === brand ? 'all' : brand)}
            >
              {brand}
              <span className="stat-chip-count">{cnt.toLocaleString('ro')}</span>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Caută brand sau categorie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className={sortKey === 'brand_name' ? 'sorted' : ''} onClick={() => toggleSort('brand_name')}>Brand{sortIndicator('brand_name')}</th>
                <th className={sortKey === 'category_text' ? 'sorted' : ''} onClick={() => toggleSort('category_text')}>Categorie{sortIndicator('category_text')}</th>
                <th className={sortKey === 'total' ? 'sorted' : ''} onClick={() => toggleSort('total')}>Produse{sortIndicator('total')}</th>
                <th className={sortKey === 'has_desc' ? 'sorted' : ''} onClick={() => toggleSort('has_desc')}>Descriere{sortIndicator('has_desc')}</th>
                <th className={sortKey === 'detailed' ? 'sorted' : ''} onClick={() => toggleSort('detailed')}>Descriere detaliata{sortIndicator('detailed')}</th>
                <th className={sortKey === 'enriched_count' ? 'sorted' : ''} onClick={() => toggleSort('enriched_count')}>Enriched{sortIndicator('enriched_count')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={`${r.brand_name}-${r.category_text}-${i}`}>
                  <td className="brand-cell">{r.brand_name}</td>
                  <td className="cat-cell">{r.category_text}</td>
                  <td className="count-mono">{r.total.toLocaleString('ro')}</td>
                  <td><PctCell count={r.has_desc} total={r.total} /></td>
                  <td><PctCell count={r.detailed_count} total={r.detailed_total} /></td>
                  <td><PctCell count={r.enriched_count} total={r.total} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Afișând <strong>{sorted.length}</strong> din <strong>{rows.length}</strong> combinații brand/categorie</span>
          <span>{overall.total.toLocaleString('ro')} produse în total</span>
        </div>
      </div>
    </>
  )
}
