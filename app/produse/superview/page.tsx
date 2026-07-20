import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getSuperviewProducts } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────
// /produse/superview — "one of each" overview: exactly one representative
// product per unique (brand, category, subcategory) combination in the
// catalogue, instead of every SKU. If two brands both sell e.g. "Aspiratoare
// industriale", both get their own card here — the dedup key is the full
// (brand, category, subcategory) triple, not just subcategory.
//
// All the real work (dedup + representative pick: featured first, then
// price desc, then name) happens in the get_superview_products() Postgres
// function (see migration add_get_superview_products_function) — this page
// just groups the ~500 resulting rows by category for a scannable layout,
// with a small subcategory tag on each card (see .sv-subcat-tag) since
// category alone stopped being descriptive enough once "Accesorii" absorbed
// the old "Consumabile" category and grew a very long subcategory tail.
// Not linked from nav/sitemap — direct-URL only, same pattern as the brand
// landing pages under app/brand/.
// ─────────────────────────────────────────────────────────────────────────

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Superview — Câte un produs din fiecare | Zona Scule',
  description: 'O privire de ansamblu asupra catalogului: exact un produs reprezentativ pentru fiecare combinație brand + categorie + subcategorie.',
  robots: { index: false, follow: false },
}

export default async function SuperviewPage() {
  const { groups, totalProducts, brandCount, categoryCount } = await getSuperviewProducts()

  return (
    <>
      <Nav />
      <style>{`
        .sv-hero {
          background: rgb(255,255,255);
          padding-top: 52px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .sv-hero-inner { max-width: 1440px; margin: 0 auto; padding: 72px 12px 40px; }
        .sv-eyebrow {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          display: inline-flex; align-items: center; gap: 8px;
          color: rgba(0,0,0,0.45); margin-bottom: 18px;
        }
        .sv-eyebrow::before { content: ''; width: 6px; height: 6px; border-radius: 1px; background: rgb(217,44,43); }
        .sv-title {
          font-family: 'Bungee', sans-serif; font-size: clamp(32px, 5vw, 60px);
          text-transform: uppercase; line-height: 1.05; color: rgb(0,0,0); margin-bottom: 14px;
        }
        .sv-desc {
          font-family: 'Recursive', sans-serif; font-size: 15px; line-height: 1.6;
          color: rgba(0,0,0,0.55); max-width: 640px; margin-bottom: 28px;
        }
        .sv-stats { display: flex; gap: 24px; flex-wrap: wrap; }
        .sv-stat { display: flex; align-items: baseline; gap: 8px; }
        .sv-stat-n { font-family: 'Bungee', sans-serif; font-size: 22px; color: rgb(0,0,0); }
        .sv-stat-l { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
        .sv-stat-div { width: 1px; height: 20px; background: rgba(0,0,0,0.12); }

        .sv-page { background: rgb(244,244,244); min-height: 60vh; }
        .sv-body { max-width: 1440px; margin: 0 auto; padding: 40px 12px 80px; }
        .sv-cat-section { margin-bottom: 48px; }
        .sv-cat-section:last-child { margin-bottom: 0; }
        .sv-cat-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px; }
        .sv-cat-title { font-family: 'Bungee', sans-serif; font-size: clamp(18px, 2vw, 24px); text-transform: uppercase; color: rgb(0,0,0); }
        .sv-cat-count { font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(0,0,0,0.4); }
        .sv-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        @media (max-width: 1024px) { .sv-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) { .sv-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } .sv-hero-inner { padding: 56px 12px 32px; } }

        /* A category can now hold a lot of very specific subcategories (e.g.
           "Accesorii" absorbed everything formerly under "Consumabile" plus
           its own long tail — 100+ distinct subcategories in that one
           category alone). A flat card grid with only a category heading
           stopped being legible at that granularity: nothing on the card
           itself said whether a given "Accesorii" product represented
           "Pile Rotunde" or "Discuri Abrazive" or "Force Logic". This small
           tag makes the actual dedup key (subcategory) visible per card
           without exploding the page into 100+ tiny sub-sections. */
        .sv-card { display: flex; flex-direction: column; gap: 8px; }
        .sv-subcat-tag {
          align-self: flex-start;
          font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
          letter-spacing: 0.04em; text-transform: uppercase;
          color: rgba(0,0,0,0.55); background: rgba(0,0,0,0.05);
          padding: 4px 8px; border-radius: 4px; max-width: 100%;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
      `}</style>

      <div className="sv-hero">
        <div className="sv-hero-inner">
          <span className="sv-eyebrow">Vizualizare Catalog</span>
          <h1 className="sv-title">Superview — câte unul din fiecare</h1>
          <p className="sv-desc">
            Un produs reprezentativ pentru fiecare combinație brand + categorie + subcategorie din catalog.
            Dacă mai multe branduri vând în aceeași subcategorie, fiecare apare cu propriul produs.
          </p>
          <div className="sv-stats">
            <div className="sv-stat">
              <span className="sv-stat-n">{totalProducts.toLocaleString('ro-RO')}</span>
              <span className="sv-stat-l">Produse afișate</span>
            </div>
            <div className="sv-stat-div" />
            <div className="sv-stat">
              <span className="sv-stat-n">{brandCount}</span>
              <span className="sv-stat-l">Branduri</span>
            </div>
            <div className="sv-stat-div" />
            <div className="sv-stat">
              <span className="sv-stat-n">{categoryCount}</span>
              <span className="sv-stat-l">Categorii</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sv-page">
        <div className="sv-body">
          {groups.map(group => (
            <section key={group.category} className="sv-cat-section">
              <div className="sv-cat-head">
                <h2 className="sv-cat-title">{group.category}</h2>
                <span className="sv-cat-count">{group.products.length} produse</span>
              </div>
              <div className="sv-grid">
                {group.products.map(p => (
                  <div key={p.id} className="sv-card">
                    <span className="sv-subcat-tag">{p.subcategory_text ?? 'Diverse'}</span>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
