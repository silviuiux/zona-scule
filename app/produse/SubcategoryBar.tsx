import Link from 'next/link'
import { getSubcategoriesByCategoryName } from '@/lib/supabase'

export default async function SubcategoryBar({
  categoryName,
  activeSub,
}: {
  categoryName: string
  activeSub?: string
}) {
  const subs = await getSubcategoriesByCategoryName(categoryName)
  if (subs.length === 0) return null

  return (
    <>
      <style>{`
        .subcat-bar {
          display: flex; gap: 8px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none; -ms-overflow-style: none;
          margin-bottom: 28px;
        }
        .subcat-bar::-webkit-scrollbar { display: none; }
        .subcat-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; flex-shrink: 0;
          border-radius: 999px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; text-decoration: none;
          transition: background 150ms, border-color 150ms, color 150ms;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgb(255,255,255); color: rgba(0,0,0,0.6);
          white-space: nowrap;
        }
        .subcat-pill:hover { border-color: rgb(0,0,0); color: rgb(0,0,0); }
        .subcat-pill.active {
          background: rgb(0,0,0); border-color: rgb(0,0,0);
          color: rgb(255,255,255);
        }
        .subcat-pill.active .subcat-count { color: rgba(255,255,255,0.5); }
        .subcat-count {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 500;
          color: rgba(0,0,0,0.35);
        }
      `}</style>

      <div className="subcat-bar">
        {/* All */}
        <Link
          href={`/produse?categorie=${encodeURIComponent(categoryName)}`}
          className={`subcat-pill${!activeSub ? ' active' : ''}`}
        >
          Toate
        </Link>
        {subs.map(s => (
          <Link
            key={s.id}
            href={`/produse?categorie=${encodeURIComponent(categoryName)}&subcategorie=${encodeURIComponent(s.name)}`}
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
