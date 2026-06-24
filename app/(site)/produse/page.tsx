import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import { getCategoriesWithCount, getSubcategoryPills } from "@/lib/data/categories";
import { getBrandsByFilter } from "@/lib/data/brands";
import CatalogSidebar from "@/components/CatalogSidebar";
import SubcategoryPills from "@/components/SubcategoryPills";
import MobileFilterToggle from "@/components/MobileFilterToggle";
import ProductCard from "@/components/ProductCard";
import LoadMoreProducts from "@/components/LoadMoreProducts";
import type { CatalogSearchParams } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Catalog",
};

const PAGE_SIZE = 24;

// Reads searchParams directly, so this route is naturally dynamic (no
// `force-dynamic` export needed — that blunt flag from REBUILD.md §3.2/§6
// is exactly what we're avoiding). Filtered/searched catalog pages can't be
// ISR'd the way the homepage can: the content genuinely changes per query.
export default async function ProdusePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const active: CatalogSearchParams = {
    brand: first(rawParams.brand) || undefined,
    category: first(rawParams.category) || undefined,
    subcategory: first(rawParams.subcategory) || undefined,
    search: first(rawParams.search) || undefined,
  };

  const categories = await getCategoriesWithCount();
  const activeCategory = categories.find((c) => c.name === active.category);

  const [{ products, hasMore }, brands, subcategoryPills] = await Promise.all([
    getProducts({
      page: 1,
      pageSize: PAGE_SIZE,
      brandName: active.brand,
      categoryText: active.category,
      subcategoryText: active.subcategory,
      search: active.search,
    }),
    getBrandsByFilter({
      categoryText: active.category,
      subcategoryText: active.subcategory,
      search: active.search,
    }),
    getSubcategoryPills({ brandName: active.brand, categoryId: activeCategory?.id }),
  ]);

  const crumbs = [active.brand, active.category, active.subcategory].filter(Boolean);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <p className="label mb-3 text-red">
          {crumbs.length > 0 ? crumbs.join(" / ") : "Catalog complet"}
        </p>
        <h1 className="font-display text-4xl text-ink md:text-6xl">
          {active.search ? `Rezultate pentru „${active.search}”` : "Catalog produse"}
        </h1>
      </div>

      <div className="mb-8">
        <MobileFilterToggle>
          <CatalogSidebar categories={categories} brands={brands} active={active} />
        </MobileFilterToggle>
      </div>

      <div className="flex gap-12">
        <aside className="hidden w-60 shrink-0 md:block">
          <CatalogSidebar categories={categories} brands={brands} active={active} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-8">
            <SubcategoryPills pills={subcategoryPills} active={active} />
          </div>

          {products.length === 0 ? (
            <div className="border border-border bg-surface px-6 py-16 text-center">
              <p className="text-ink">Niciun produs nu corespunde acestor filtre.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <LoadMoreProducts
            filter={active}
            initialPage={1}
            initialHasMore={hasMore}
            pageSize={PAGE_SIZE}
          />
        </div>
      </div>
    </div>
  );
}
