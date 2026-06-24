import Link from "next/link";
import { getAllBrands } from "@/lib/data/brands";
import { getCategoriesWithCount, getFeaturedSubcategoriesWithImage } from "@/lib/data/categories";
import { getArticles } from "@/lib/data/articles";
import ProductImage from "@/components/ProductImage";

// ISR — catalog/category/brand data doesn't need a fresh DB hit on every
// request. Replaces the `force-dynamic` flagged in REBUILD.md §3.7.
export const revalidate = 3600;

export default async function HomePage() {
  const [brands, categories, featuredSubcategories, articles] = await Promise.all([
    getAllBrands(),
    getCategoriesWithCount(),
    getFeaturedSubcategoriesWithImage(),
    getArticles().catch(() => []),
  ]);

  const featuredBrands = brands.filter((b) => b.featured);
  const totalProducts = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      {/* Hero */}
      <section className="noise relative overflow-hidden border-b border-border bg-white px-5 pt-20 pb-16 md:px-8 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-[1600px]">
          <p className="label mb-6 text-red">Distribuitor de unelte profesionale</p>
          <h1 className="font-display max-w-5xl text-[14vw] leading-[0.92] text-ink md:text-[7.5rem]">
            Sculele potrivite,
            <br />
            la <span className="text-red">stoc real</span>.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">
            Catalog complet de unelte electrice, scule de mână și consumabile
            industriale — peste {totalProducts.toLocaleString("ro-RO")} de
            produse de la {brands.length}+ branduri, filtrabile pe brand,
            categorie și aplicație.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/produse"
              className="rounded-full bg-red px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-red-hover"
            >
              Vezi catalogul
            </Link>
            <Link
              href="/zona-solutii"
              className="rounded-full border border-border-strong px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:border-ink"
            >
              Zona Soluții
            </Link>
          </div>
        </div>
      </section>

      {/* Stat / brand strip */}
      {featuredBrands.length > 0 && (
        <section className="border-b border-border bg-surface px-5 py-8 md:px-8">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-10 gap-y-4">
            <p className="label whitespace-nowrap">Branduri de top</p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {featuredBrands.slice(0, 10).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/produse?brand=${encodeURIComponent(brand.name)}`}
                  className="font-display text-xl tracking-tight text-text-muted transition-colors hover:text-ink"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category grid */}
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-4xl text-ink md:text-5xl">Categorii</h2>
            <Link href="/produse" className="label text-red hover:text-red-hover">
              Tot catalogul →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => (
              <Link
                key={category.id}
                href={`/produse?category=${encodeURIComponent(category.name)}`}
                className="group flex items-center justify-between gap-6 bg-white px-6 py-6 transition-colors hover:bg-surface"
              >
                <div className="flex items-baseline gap-4">
                  <span className="label text-text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-xl leading-tight text-ink transition-colors group-hover:text-red md:text-2xl">
                    {category.name}
                  </span>
                </div>
                <span className="label shrink-0 text-text-faint">
                  {category.count.toLocaleString("ro-RO")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured subcategories */}
      {featuredSubcategories.length > 0 && (
        <section className="border-t border-border bg-surface px-5 py-20 md:px-8">
          <div className="mx-auto max-w-[1600px]">
            <h2 className="font-display mb-10 text-4xl text-ink md:text-5xl">
              Cele mai căutate
            </h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {featuredSubcategories.slice(0, 8).map((sub) => (
                <Link
                  key={sub.id}
                  href={`/produse?subcategory=${encodeURIComponent(sub.name)}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden border border-border bg-white">
                    <ProductImage
                      src={sub.image_url}
                      alt={sub.name}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink transition-colors group-hover:text-red">
                    {sub.name}
                  </p>
                  <p className="label mt-1 text-text-faint">
                    {sub.product_count.toLocaleString("ro-RO")} produse
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Zona Soluții teaser */}
      {articles.length > 0 && (
        <section className="px-5 py-20 md:px-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-display text-4xl text-ink md:text-5xl">Zona Soluții</h2>
              <Link href="/zona-solutii" className="label text-red hover:text-red-hover">
                Toate ghidurile →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={`/zona-solutii/${article.slug}`}
                  className="group border border-border p-6 transition-colors hover:border-ink"
                >
                  {article.tag && <p className="label text-red">{article.tag}</p>}
                  <h3 className="font-display mt-3 text-2xl leading-tight text-ink">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA band */}
      <section className="bg-red px-5 py-20 md:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <h2 className="font-display max-w-2xl text-4xl text-white md:text-6xl">
            Ai nevoie de o ofertă pentru proiectul tău?
          </h2>
          <Link
            href="/contact"
            className="shrink-0 rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-wider text-red transition-opacity hover:opacity-90"
          >
            Contactează-ne
          </Link>
        </div>
      </section>
    </>
  );
}
