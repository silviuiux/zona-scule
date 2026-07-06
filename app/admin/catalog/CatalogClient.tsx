'use client'
import { useState, useRef, useCallback, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  updateProductField,
  updateProductCategory,
  updateProductSubcategory,
  refreshCatalogListing,
} from './actions'

export type CatalogProduct = {
  id: string
  slug: string | null
  brand_name: string | null
  sku: string | null
  name: string | null
  model: string | null
  short_description: string | null
  long_description: string | null
  category_id: string | null
  category_text: string | null
  subcategory_id: string | null
  subcategory_text: string | null
  st1_label: string | null
  st1_value: string | null
  st1_details: string | null
  st2_label: string | null
  st2_value: string | null
  st2_details: string | null
  st3_label: string | null
  st3_value: string | null
  st3_details: string | null
  manufacturer_url: string | null
  family_name: string | null
}

export type CatOption = { id: string; name: string }
export type SubOption = { id: string; name: string; parent_category_id: string | null }

type TextField = Exclude<
  keyof CatalogProduct,
  'id' | 'slug' | 'category_id' | 'category_text' | 'subcategory_id' | 'subcategory_text'
>

type Status = 'saving' | 'saved' | 'error' | undefined

const TEXT_COLUMNS: { field: TextField; label: string; width: 'sm' | 'md' | 'lg' | 'xl' }[] = [
  { field: 'brand_name', label: 'Brand', width: 'md' },
  { field: 'sku', label: 'SKU', width: 'md' },
  { field: 'name', label: 'Nume', width: 'xl' },
  { field: 'model', label: 'Model', width: 'lg' },
  { field: 'short_description', label: 'Descriere scurtă', width: 'xl' },
  { field: 'long_description', label: 'Descriere lungă', width: 'xl' },
  { field: 'st1_label', label: 'ST1 Label', width: 'sm' },
  { field: 'st1_value', label: 'ST1 Value', width: 'sm' },
  { field: 'st1_details', label: 'ST1 Details', width: 'lg' },
  { field: 'st2_label', label: 'ST2 Label', width: 'sm' },
  { field: 'st2_value', label: 'ST2 Value', width: 'sm' },
  { field: 'st2_details', label: 'ST2 Details', width: 'lg' },
  { field: 'st3_label', label: 'ST3 Label', width: 'sm' },
  { field: 'st3_value', label: 'ST3 Value', width: 'sm' },
  { field: 'st3_details', label: 'ST3 Details', width: 'lg' },
  { field: 'manufacturer_url', label: 'Manufacturer URL', width: 'lg' },
  { field: 'family_name', label: 'Family name', width: 'md' },
]

const WIDTH_PX = { sm: 110, md: 160, lg: 220, xl: 260 } as const

function EditableText({
  value,
  status,
  width,
  onCommit,
}: {
  value: string | null
  status: Status
  width: number
  onCommit: (next: string) => void
}) {
  // Adjust local state when the `value` prop changes (after a successful
  // commit or a revert-on-error) — done during render, not in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevValue, setPrevValue] = useState(value)
  const [val, setVal] = useState(value ?? '')
  if (value !== prevValue) {
    setPrevValue(value)
    setVal(value ?? '')
  }

  const commit = () => {
    if (val !== (value ?? '')) onCommit(val)
  }

  return (
    <input
      className={`cell-input${status ? ` cs-${status}` : ''}`}
      style={{ width }}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') { setVal(value ?? '') }
      }}
      title={val}
    />
  )
}

export default function CatalogClient({
  products,
  total,
  page,
  pageSize,
  categories,
  subcategories,
  brandNames,
  initialFilters,
}: {
  products: CatalogProduct[]
  total: number
  page: number
  pageSize: number
  categories: CatOption[]
  subcategories: SubOption[]
  brandNames: string[]
  initialFilters: { q: string; brand: string; categorie: string }
}) {
  const router = useRouter()
  const pathname = usePathname()

  // `products`/`page` only change identity after a real navigation (new
  // server data) — resync local state during render rather than in an
  // effect (see EditableText above for the same pattern/rationale).
  const [prevProducts, setPrevProducts] = useState(products)
  const [rows, setRows] = useState(products)
  if (products !== prevProducts) {
    setPrevProducts(products)
    setRows(products)
  }

  const [q, setQ] = useState(initialFilters.q)
  const [brand, setBrand] = useState(initialFilters.brand)
  const [categorie, setCategorie] = useState(initialFilters.categorie)
  const [prevPage, setPrevPage] = useState(page)
  const [pageInput, setPageInput] = useState(String(page))
  if (page !== prevPage) {
    setPrevPage(page)
    setPageInput(String(page))
  }

  const [cellStatus, setCellStatus] = useState<Record<string, Status>>({})
  const [notification, setNotification] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [refreshing, startRefresh] = useTransition()
  const [refreshDone, setRefreshDone] = useState(false)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const navigate = useCallback((next: Partial<{ page: number; q: string; brand: string; categorie: string }>) => {
    const merged = {
      page: next.page ?? page,
      q: next.q ?? q,
      brand: next.brand ?? brand,
      categorie: next.categorie ?? categorie,
    }
    const params = new URLSearchParams()
    if (merged.page > 1) params.set('page', String(merged.page))
    if (merged.q) params.set('q', merged.q)
    if (merged.brand) params.set('brand', merged.brand)
    if (merged.categorie) params.set('categorie', merged.categorie)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, page, q, brand, categorie])

  // Debounced search — 350ms after the user stops typing, reset to page 1.
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSearchChange = (val: string) => {
    setQ(val)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => navigate({ q: val, page: 1 }), 350)
  }

  const setStatus = (key: string, s: Status) => setCellStatus(prev => ({ ...prev, [key]: s }))
  const clearStatusSoon = (key: string, delay: number) => {
    setTimeout(() => setCellStatus(prev => { const n = { ...prev }; delete n[key]; return n }), delay)
  }

  const commitText = useCallback((row: CatalogProduct, field: TextField, next: string) => {
    const key = `${row.id}:${field}`
    const prevValue = row[field] as string | null
    setStatus(key, 'saving')
    setRows(rs => rs.map(r => r.id === row.id ? { ...r, [field]: next || null } : r))
    updateProductField(row.id, field, next)
      .then(() => {
        setStatus(key, 'saved')
        clearStatusSoon(key, 1500)
      })
      .catch(() => {
        setRows(rs => rs.map(r => r.id === row.id ? { ...r, [field]: prevValue } : r))
        setStatus(key, 'error')
        notify('Eroare la salvare', 'err')
        clearStatusSoon(key, 2500)
      })
  }, [notify])

  const commitCategory = useCallback((row: CatalogProduct, categoryId: string) => {
    const key = `${row.id}:category`
    const prev = { category_id: row.category_id, category_text: row.category_text }
    const catName = categories.find(c => c.id === categoryId)?.name ?? null
    setStatus(key, 'saving')
    setRows(rs => rs.map(r => r.id === row.id ? { ...r, category_id: categoryId, category_text: catName } : r))
    updateProductCategory(row.id, categoryId)
      .then(() => { setStatus(key, 'saved'); clearStatusSoon(key, 1500) })
      .catch(() => {
        setRows(rs => rs.map(r => r.id === row.id ? { ...r, ...prev } : r))
        setStatus(key, 'error')
        notify('Eroare la salvare', 'err')
        clearStatusSoon(key, 2500)
      })
  }, [categories, notify])

  const commitSubcategory = useCallback((row: CatalogProduct, subcategoryId: string) => {
    const key = `${row.id}:subcategory`
    const prev = { subcategory_id: row.subcategory_id, subcategory_text: row.subcategory_text }
    const subName = subcategories.find(s => s.id === subcategoryId)?.name ?? null
    setStatus(key, 'saving')
    setRows(rs => rs.map(r => r.id === row.id ? { ...r, subcategory_id: subcategoryId, subcategory_text: subName } : r))
    updateProductSubcategory(row.id, subcategoryId)
      .then(() => { setStatus(key, 'saved'); clearStatusSoon(key, 1500) })
      .catch(() => {
        setRows(rs => rs.map(r => r.id === row.id ? { ...r, ...prev } : r))
        setStatus(key, 'error')
        notify('Eroare la salvare', 'err')
        clearStatusSoon(key, 2500)
      })
  }, [subcategories, notify])

  const handleRefresh = () => {
    setRefreshDone(false)
    startRefresh(async () => {
      try {
        await refreshCatalogListing()
        setRefreshDone(true)
        notify('Site-ul a fost actualizat cu ultimele modificări')
        setTimeout(() => setRefreshDone(false), 3000)
      } catch {
        notify('Eroare la actualizarea site-ului', 'err')
      }
    })
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .cat-admin { min-height: 100vh; background: #0f0f11; color: #e8e6e3; font-family: 'Inter', system-ui, sans-serif; }

        .cat-header {
          background: #141416; border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 0 24px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .cat-logo { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .cat-logo span { color: rgb(217,44,43); }
        .cat-badge {
          font-size: 11px; padding: 3px 10px;
          background: rgba(217,44,43,0.15); color: rgb(217,44,43);
          border: 1px solid rgba(217,44,43,0.3); border-radius: 999px;
          letter-spacing: 0.04em;
        }
        .btn {
          padding: 6px 14px; border-radius: 3px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: inherit; letter-spacing: 0.04em;
          transition: background 150ms; white-space: nowrap;
        }
        .btn-red { background: rgb(217,44,43); color: #fff; }
        .btn-red:hover { background: rgb(190,35,34); }
        .btn-red:disabled { opacity: 0.5; cursor: default; }
        .btn-green { background: rgba(34,197,94,0.85); color: #fff; }
        .btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .btn-ghost:disabled { opacity: 0.4; cursor: default; }

        .toolbar {
          padding: 12px 24px;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          background: #0f0f11; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .tb-input, .tb-select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; padding: 7px 10px;
          font-size: 13px; color: #e8e6e3; outline: none;
          font-family: inherit;
          transition: border-color 150ms;
        }
        .tb-input:focus, .tb-select:focus { border-color: rgba(255,255,255,0.25); }
        .tb-input::placeholder { color: rgba(255,255,255,0.25); }
        .tb-input.search { min-width: 240px; flex: 1; }
        .tb-select option { background: #1a1a1e; }

        .spacer { flex: 1; }

        .table-wrap { overflow: auto; padding: 0 0 90px; max-height: calc(100vh - 168px); }
        table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 12.5px; }
        thead th {
          position: sticky; top: 0; z-index: 5;
          text-align: left; padding: 9px 10px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          background: #17171a;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          white-space: nowrap;
        }
        tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); }
        tbody tr:hover { background: rgba(255,255,255,0.02); }
        td { padding: 5px 10px; vertical-align: middle; }

        .cell-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 3px; padding: 6px 8px;
          font-size: 12.5px; color: #e8e6e3; outline: none;
          font-family: inherit;
          transition: border-color 150ms, background 150ms;
        }
        .cell-input:focus { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.07); }
        .cell-input.cs-saving { border-color: rgba(255,255,255,0.3); }
        .cell-input.cs-saved { border-color: rgb(34,197,94); }
        .cell-input.cs-error { border-color: rgb(217,44,43); background: rgba(217,44,43,0.08); }

        .cat-select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px; padding: 6px 8px;
          font-size: 12.5px; color: #e8e6e3;
          outline: none; cursor: pointer; font-family: inherit;
          width: 170px;
          transition: border-color 150ms;
        }
        .cat-select.cs-saving { border-color: rgba(255,255,255,0.3); }
        .cat-select.cs-saved { border-color: rgb(34,197,94); }
        .cat-select.cs-error { border-color: rgb(217,44,43); }
        .cat-select option { background: #1a1a1e; }
        .cat-select:disabled { opacity: 0.4; cursor: default; }

        .row-view-link {
          color: rgba(255,255,255,0.3); text-decoration: none; font-size: 13px;
        }
        .row-view-link:hover { color: rgb(217,44,43); }

        .pager {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #141416; border-top: 1px solid rgba(255,255,255,0.07);
          padding: 10px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          font-size: 12px; color: rgba(255,255,255,0.5);
        }
        .pager-controls { display: flex; align-items: center; gap: 8px; }
        .page-jump {
          width: 56px; text-align: center;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 3px; padding: 5px; color: #e8e6e3; font-family: inherit; font-size: 12px;
        }

        .notif {
          position: fixed; bottom: 60px; right: 24px; z-index: 200;
          padding: 12px 20px; border-radius: 6px;
          font-size: 13px; font-weight: 500;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .notif.ok { background: #1a2e1a; border: 1px solid rgba(34,197,94,0.4); color: rgb(34,197,94); }
        .notif.err { background: #2e1a1a; border: 1px solid rgba(217,44,43,0.4); color: rgb(217,44,43); }
      `}</style>

      <div className="cat-admin">
        <div className="cat-header">
          <div className="cat-logo"><span>ZONA SCULE</span> / Admin / Catalog</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="cat-badge">{total.toLocaleString('ro')} produse</span>
            <a href="/admin" className="btn btn-ghost" style={{ textDecoration: 'none', display: 'inline-block' }}>Categorii</a>
            <button
              className={refreshDone ? 'btn btn-green' : 'btn btn-red'}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Reîmprospătează /produse cu ultimele modificări (materialized view)"
            >
              {refreshing ? 'Se actualizează...' : refreshDone ? '✓ Actualizat' : 'Actualizează site-ul'}
            </button>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="tb-input search"
            placeholder="Caută după nume, SKU, brand, model..."
            value={q}
            onChange={e => onSearchChange(e.target.value)}
          />
          <select
            className="tb-select"
            value={brand}
            onChange={e => { setBrand(e.target.value); navigate({ brand: e.target.value, page: 1 }) }}
          >
            <option value="">Toate brandurile</option>
            {brandNames.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            className="tb-select"
            value={categorie}
            onChange={e => { setCategorie(e.target.value); navigate({ categorie: e.target.value, page: 1 }) }}
          >
            <option value="">Toate categoriile</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <div className="spacer" />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                {TEXT_COLUMNS.slice(0, 4).map(c => <th key={c.field}>{c.label}</th>)}
                <th>Categorie</th>
                <th>Subcategorie</th>
                {TEXT_COLUMNS.slice(4).map(c => <th key={c.field}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const subsForRow = subcategories.filter(s => s.parent_category_id === row.category_id)
                const renderText = (field: TextField) => {
                  const col = TEXT_COLUMNS.find(c => c.field === field)!
                  return (
                    <td key={field}>
                      <EditableText
                        value={row[field] as string | null}
                        status={cellStatus[`${row.id}:${field}`]}
                        width={WIDTH_PX[col.width]}
                        onCommit={next => commitText(row, field, next)}
                      />
                    </td>
                  )
                }
                return (
                  <tr key={row.id}>
                    <td>
                      {row.slug && (
                        <a className="row-view-link" href={`/produse/${row.slug}`} target="_blank" rel="noopener noreferrer" title="Vezi pe site">↗</a>
                      )}
                    </td>
                    {renderText('brand_name')}
                    {renderText('sku')}
                    {renderText('name')}
                    {renderText('model')}

                    <td>
                      <select
                        className={`cat-select${cellStatus[`${row.id}:category`] ? ` cs-${cellStatus[`${row.id}:category`]}` : ''}`}
                        value={row.category_id ?? ''}
                        onChange={e => e.target.value && commitCategory(row, e.target.value)}
                      >
                        <option value="">—</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        className={`cat-select${cellStatus[`${row.id}:subcategory`] ? ` cs-${cellStatus[`${row.id}:subcategory`]}` : ''}`}
                        value={row.subcategory_id ?? ''}
                        onChange={e => e.target.value && commitSubcategory(row, e.target.value)}
                        disabled={!row.category_id}
                      >
                        <option value="">{row.category_id ? '—' : 'Alege categoria'}</option>
                        {subsForRow.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>

                    {renderText('short_description')}
                    {renderText('long_description')}
                    {renderText('st1_label')}
                    {renderText('st1_value')}
                    {renderText('st1_details')}
                    {renderText('st2_label')}
                    {renderText('st2_value')}
                    {renderText('st2_details')}
                    {renderText('st3_label')}
                    {renderText('st3_value')}
                    {renderText('st3_details')}
                    {renderText('manufacturer_url')}
                    {renderText('family_name')}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span>
            Pagina <strong style={{ color: '#e8e6e3' }}>{page}</strong> din {totalPages.toLocaleString('ro')}
            {' · '}{total.toLocaleString('ro')} produse
          </span>
          <div className="pager-controls">
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => navigate({ page: page - 1 })}>← Prev</button>
            <input
              className="page-jump"
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const n = Math.min(totalPages, Math.max(1, parseInt(pageInput, 10) || 1))
                  navigate({ page: n })
                }
              }}
            />
            <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => navigate({ page: page + 1 })}>Next →</button>
          </div>
        </div>

        {notification && (
          <div className={`notif ${notification.type}`}>{notification.msg}</div>
        )}
      </div>
    </>
  )
}
