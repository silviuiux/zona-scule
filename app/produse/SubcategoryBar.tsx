import Link from 'next/link'
import { getSubcategoriesByCategoryName, SubcategoryWithCount } from '@/lib/supabase'

export default async function SubcategoryBar({
  categoryName,
  activeSub,
  total,
  prefetchedSubs,
}: {
  categoryName?: string
  activeSub?: string
  /** Total products shown in the "Toate" pill */
  total?: number
  /** Pre-fetched subs — skips internal fetch when provided */
  prefetchedSubs?: SubcategoryWithCount[]
}) {
  const subs = prefetchedSubs ?? (categoryName ? await getSubcategoriesByCategoryName(categoryName) : [])
  if (subs.length === 0) return null

  const allHref = categoryName
    ? `/produse?categorie=${encodeURIComponent(categoryName)}`
    : '/produse'

  const subHref = (subName: string) =>
    categoryName
      ? `/produse?categorie=${encodeURIComponent(categoryName)}&subcategorie=${encodeURIComponent(subName)}`
      : `/produse?subcategorie=${encodeURIComponent(subName)}`

  return (
    <>
      <style>{`
        .subcat-bar {
          position: sticky;
          top: 52px;
          z-index: 50;
          margin: -32px 0 32px;
          padding: 32px 0;
          background: rgb(244, 244, 244);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          display: flex; gap: 10px;
          overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .subcat-bar::-webkit-scrollbar { display: none; }

        .subcat-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 16px; flex-shrink: 0;
          border-radius: 999px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 400;
          color: rgba(0,0,0,0.7);
          text-decoration: none;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          transition: background 150ms, border-color 150ms, color 150ms;
          white-space: nowrap;
        }
        .subcat-pill:hover {
          border-color: rgba(0,0,0,0.25);
          color: rgb(0,0,0);
        }
        .subcat-pill.active {
          background: rgb(0,0,0);
          border-color: rgb(0,0,0);
          color: rgb(255,255,255);
        }

        .subcat-count {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 500;
          color: rgba(0,0,0,0.4);
          letter-spacing: 0.02em;
        }
        .subcat-pill.active .subcat-count { color: rgba(255,255,255,0.55); }

        @media (max-width: 768px) {
          .subcat-bar {
            top: 52px;
            margin: -20px 0 20px;
            padding: 32px 0;
          }
        }
      `}</style>

      <div className="subcat-bar">
        <Link
          href={allHref}
          className={`subcat-pill${!activeSub ? ' active' : ''}`}
        >
          Toate
          {typeof total === 'number' && total > 0 && (
            <span className="subcat-count">{total.toLocaleString('ro')}</span>
          )}
        </Link>
        {subs.map(s => (
          <Link
            key={s.id}
            href={subHref(s.name)}
            className={`subcat-pill${activeSub === s.name ? ' active' : ''}`}
          >
            {s.name}
            <span className="subcat-count">{s.product_count.toLocaleString('ro')}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
