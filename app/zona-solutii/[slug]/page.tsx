import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getArticleBySlug, getArticles, PROFESSIONS, ARTICLES } from '../articles'
import { getProducts } from '@/lib/supabase'

export function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

export const revalidate = 3600

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const profession = PROFESSIONS.find(p => p.id === article.profession)

  // Fetch related products from catalog using the article's filter
  const { products: relatedProducts } = await getProducts({
    ...article.productFilter,
    page: 1,
    pageSize: 6,
  }).catch(() => ({ products: [], total: 0 }))

  // Related articles — same profession, exclude current
  const relatedArticles = getArticles(article.profession)
    .filter(a => a.slug !== article.slug)
    .slice(0, 3)

  return (
    <>
      <Nav />
      <style>{`
        /* ── Hero ── */
        .art-hero {
          padding-top: 52px;
          min-height: 60vh;
          display: flex; align-items: flex-end;
          position: relative; overflow: hidden;
        }
        .art-hero-bg {
          position: absolute; inset: 0; z-index: 0;
        }
        .art-hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
        }
        .art-hero-inner {
          position: relative; z-index: 2;
          max-width: 860px; margin: 0 auto; width: 100%;
          padding: 48px 24px 56px;
        }

        /* Breadcrumb */
        .art-bc { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .art-bc-pill {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.65); text-decoration: none;
          border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 5px 14px;
          transition: color 150ms, border-color 150ms; white-space: nowrap;
        }
        .art-bc-pill:hover { color: rgb(255,255,255); border-color: rgba(255,255,255,0.7); }
        .art-bc-sep { font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(255,255,255,0.3); }
        .art-bc-cur {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.55);
        }

        /* Profession tag */
        .art-tag {
          display: inline-block; margin-bottom: 16px;
          font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgb(255,255,255); background: rgb(217,44,43);
          border-radius: 2px; padding: 5px 12px;
        }

        /* Title */
        .art-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(28px, 5vw, 52px);
          color: rgb(255,255,255); text-transform: uppercase;
          letter-spacing: 0.01em; line-height: 1.1;
          margin: 0 0 20px;
        }

        /* Meta */
        .art-meta { display: flex; align-items: center; gap: 16px; }
        .art-meta-item {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
          color: rgba(255,255,255,0.55); letter-spacing: 0.03em;
        }
        .art-meta-div { width: 1px; height: 14px; background: rgba(255,255,255,0.2); }

        /* ── Body section ── */
        .art-body-wrap {
          background: rgb(255,255,255); padding: 0 24px;
        }
        .art-body-layout {
          max-width: 860px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 60px;
          padding: 60px 0 80px;
        }

        /* Rich text */
        .art-content { min-width: 0; }
        .art-content p {
          font-family: 'Recursive', sans-serif; font-size: 16px;
          color: rgba(0,0,0,0.75); line-height: 1.75;
          margin: 0 0 20px;
        }
        .art-content h2 {
          font-family: 'Bungee', sans-serif; font-size: 18px;
          color: rgb(0,0,0); text-transform: uppercase;
          letter-spacing: 0.04em; margin: 36px 0 12px;
        }
        .art-content h2:first-child { margin-top: 0; }
        .art-content ul {
          margin: 0 0 20px; padding-left: 20px;
        }
        .art-content li {
          font-family: 'Recursive', sans-serif; font-size: 16px;
          color: rgba(0,0,0,0.75); line-height: 1.7; margin-bottom: 6px;
        }
        .art-content strong { color: rgb(0,0,0); font-weight: 700; }

        /* Sidebar */
        .art-sidebar { display: flex; flex-direction: column; gap: 32px; }
        .art-sidebar-block {}
        .art-sidebar-label {
          font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.35);
          margin-bottom: 12px; display: block;
        }

        /* Related article mini-card */
        .art-related-card {
          display: block; text-decoration: none; padding: 14px;
          border: 1px solid rgba(0,0,0,0.08); border-radius: 4px;
          margin-bottom: 10px; transition: border-color 150ms, background 150ms;
        }
        .art-related-card:hover { background: rgb(249,249,249); border-color: rgba(0,0,0,0.18); }
        .art-related-tag {
          font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: rgb(217,44,43);
          display: block; margin-bottom: 4px;
        }
        .art-related-title {
          font-family: 'Recursive', sans-serif; font-size: 13px; font-weight: 600;
          color: rgb(0,0,0); line-height: 1.4;
        }

        /* ── Products section ── */
        .art-products-wrap {
          background: rgb(244,244,244); padding: 60px 24px;
        }
        .art-products-inner { max-width: 1200px; margin: 0 auto; }
        .art-products-header { margin-bottom: 28px; }
        .art-products-eyebrow {
          font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; color: rgb(217,44,43);
          display: block; margin-bottom: 6px;
        }
        .art-products-title {
          font-family: 'Bungee', sans-serif; font-size: 22px;
          color: rgb(0,0,0); text-transform: uppercase; letter-spacing: 0.03em;
        }
        .art-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .art-products-cta {
          margin-top: 28px; display: flex; justify-content: center;
        }
        .art-products-link {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgb(0,0,0); text-decoration: none;
          border: 1.5px solid rgba(0,0,0,0.3); border-radius: 2px; padding: 10px 24px;
          transition: background 150ms, color 150ms, border-color 150ms;
        }
        .art-products-link:hover {
          background: rgb(0,0,0); color: rgb(255,255,255); border-color: rgb(0,0,0);
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .art-body-layout { grid-template-columns: 1fr; gap: 40px; }
          .art-sidebar { order: -1; }
          .art-products-grid { grid-template-columns: repeat(2, 1fr); }
          .art-hero-inner { padding: 32px 16px 40px; }
          .art-body-wrap { padding: 0 16px; }
          .art-products-wrap { padding: 40px 16px; }
        }
        @media (max-width: 480px) {
          .art-products-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="art-hero">
        <div className="art-hero-bg" style={{ background: article.coverGradient }} />
        <div className="art-hero-overlay" />
        <div className="art-hero-inner">
          <nav className="art-bc">
            <Link href="/" className="art-bc-pill">Acasă</Link>
            <span className="art-bc-sep">/</span>
            <Link href="/zona-solutii" className="art-bc-pill">Zona Soluții</Link>
            {profession && (
              <>
                <span className="art-bc-sep">/</span>
                <Link
                  href={`/zona-solutii?profesie=${profession.id}`}
                  className="art-bc-pill"
                >
                  {profession.label}
                </Link>
              </>
            )}
          </nav>

          {profession && <span className="art-tag">{profession.label}</span>}
          <h1 className="art-title">{article.title}</h1>

          <div className="art-meta">
            <span className="art-meta-item">{formatDate(article.publishedAt)}</span>
            <div className="art-meta-div" />
            <span className="art-meta-item">{article.readMinutes} min citit</span>
          </div>
        </div>
      </div>

      {/* ── Article body + sidebar ── */}
      <div className="art-body-wrap">
        <div className="art-body-layout">
          {/* Rich text */}
          <article
            className="art-content"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Sidebar */}
          <aside className="art-sidebar">
            {relatedArticles.length > 0 && (
              <div className="art-sidebar-block">
                <span className="art-sidebar-label">Articole similare</span>
                {relatedArticles.map(a => {
                  const ap = PROFESSIONS.find(p => p.id === a.profession)
                  return (
                    <Link key={a.slug} href={`/zona-solutii/${a.slug}`} className="art-related-card">
                      {ap && <span className="art-related-tag">{ap.label}</span>}
                      <span className="art-related-title">{a.title}</span>
                    </Link>
                  )
                })}
              </div>
            )}

            <div className="art-sidebar-block">
              <span className="art-sidebar-label">Explorează catalogul</span>
              <Link
                href={profession ? `/produse?brand=${article.productFilter.brandName ?? ''}&categorie=${article.productFilter.categoryText ?? ''}` : '/produse'}
                className="art-products-link"
                style={{ display: 'inline-block', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}
              >
                Vezi toate produsele →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Embedded products ── */}
      {relatedProducts.length > 0 && (
        <div className="art-products-wrap">
          <div className="art-products-inner">
            <div className="art-products-header">
              <span className="art-products-eyebrow">Din catalog</span>
              <div className="art-products-title">Produse recomandate</div>
            </div>

            <div className="art-products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="art-products-cta">
              <Link
                href={`/produse${article.productFilter.brandName ? `?brand=${encodeURIComponent(article.productFilter.brandName)}` : article.productFilter.categoryText ? `?categorie=${encodeURIComponent(article.productFilter.categoryText)}` : ''}`}
                className="art-products-link"
              >
                Vezi toate produsele →
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
