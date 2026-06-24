import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getAdjacentProducts,
  getProductVariants,
} from "@/lib/data/products";
import { getProductImage, getProductGallery } from "@/lib/image";
import ProductImage from "@/components/ProductImage";
import ProductNavArrows from "@/components/ProductNavArrows";
import SkuCopyField from "@/components/SkuCopyField";
import VariantSelector from "@/components/VariantSelector";

// Hourly ISR, not `force-dynamic` (REBUILD.md §3.3/§6). No generateStaticParams
// — every slug renders on first request, then gets cached for `revalidate`
// seconds, which is the right tradeoff for a catalog this size (no build-time
// cost, no stale-forever pages).
export const revalidate = 3600;

type SpecRow = { label: string | null; value: string | null; details: string | null };
type TitledRow = { title: string | null; details: string | null };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produs indisponibil" };

  return {
    title: product.name,
    description:
      product.short_description ??
      `${product.brand_name ?? ""} ${product.name} — disponibil la Zona Scule.`.trim(),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [{ prev, next }, variants] = await Promise.all([
    getAdjacentProducts(slug, product.subcategory_text),
    product.family_id ? getProductVariants(product.family_id) : Promise.resolve([]),
  ]);

  const gallery = getProductGallery(product).slice(1); // first image is the hero, rest are gallery
  const heroImage = getProductImage(product);

  const specRows: SpecRow[] = [
    { label: product.st1_label, value: product.st1_value, details: product.st1_details },
    { label: product.st2_label, value: product.st2_value, details: product.st2_details },
    { label: product.st3_label, value: product.st3_value, details: product.st3_details },
  ].filter((row) => row.label && row.value);

  const characteristicRows: TitledRow[] = [
    { title: product.c1_title, details: product.c1_details },
    { title: product.c2_title, details: product.c2_details },
    { title: product.c3_title, details: product.c3_details },
  ].filter((row) => row.title);

  const applicationRows: TitledRow[] = [
    { title: product.app_01_title, details: product.app_01_details },
    { title: product.app_02_title, details: product.app_02_details },
    { title: product.app_03_title, details: product.app_03_details },
  ].filter((row) => row.title);

  const quoteParams = new URLSearchParams();
  if (product.sku) quoteParams.set("sku", product.sku);
  if (product.brand_name) quoteParams.set("brand", product.brand_name);
  quoteParams.set("model", product.model || product.name);

  return (
    <div className="relative">
      <ProductNavArrows prev={prev} next={next} />

      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-8 md:py-14">
        <nav className="label mb-8 flex flex-wrap items-center gap-x-2 text-text-faint">
          <Link href="/" className="hover:text-ink">
            Acasă
          </Link>
          <span>/</span>
          <Link href="/produse" className="hover:text-ink">
            Catalog
          </Link>
          {product.brand_name && (
            <>
              <span>/</span>
              <Link href={`/produse?brand=${encodeURIComponent(product.brand_name)}`} className="hover:text-ink">
                {product.brand_name}
              </Link>
            </>
          )}
          {product.category_text && (
            <>
              <span>/</span>
              <Link
                href={`/produse?category=${encodeURIComponent(product.category_text)}`}
                className="hover:text-ink"
              >
                {product.category_text}
              </Link>
            </>
          )}
          {product.subcategory_text && (
            <>
              <span>/</span>
              <Link
                href={`/produse?subcategory=${encodeURIComponent(product.subcategory_text)}`}
                className="hover:text-ink"
              >
                {product.subcategory_text}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden border border-border bg-white">
              <ProductImage src={heroImage} alt={product.name} sizes="(min-width: 768px) 45vw, 90vw" />
            </div>
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((url) => (
                  <div key={url} className="relative aspect-square overflow-hidden border border-border bg-white">
                    <ProductImage src={url} alt={product.name} sizes="20vw" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              {product.brand_name && <p className="label mb-2 text-red">{product.brand_name}</p>}
              <h1 className="font-display text-3xl leading-[0.95] text-ink md:text-5xl">
                {product.name}
              </h1>
              {product.sku && <div className="mt-3"><SkuCopyField sku={product.sku} /></div>}
            </div>

            {product.short_description && (
              <p className="text-base leading-relaxed text-text-muted">{product.short_description}</p>
            )}

            <VariantSelector variants={variants} currentSlug={slug} />

            <Link
              href={`/contact?${quoteParams.toString()}`}
              className="inline-flex w-fit items-center rounded-full bg-red px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-red-hover"
            >
              Cere ofertă
            </Link>

            {specRows.length > 0 && (
              <div className="border-t border-border pt-6">
                <p className="label mb-4 text-text-faint">Specificații</p>
                <dl className="grid gap-3">
                  {specRows.map((row, i) => (
                    <div key={i} className="flex flex-wrap justify-between gap-2 border-b border-border pb-3 text-sm">
                      <dt className="text-text-muted">{row.label}</dt>
                      <dd className="font-medium text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {characteristicRows.length > 0 && (
              <div className="border-t border-border pt-6">
                <p className="label mb-4 text-text-faint">Caracteristici</p>
                <ul className="grid gap-3">
                  {characteristicRows.map((row, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-ink">{row.title}</span>
                      {row.details && <span className="text-text-muted"> — {row.details}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {applicationRows.length > 0 && (
              <div className="border-t border-border pt-6">
                <p className="label mb-4 text-text-faint">Utilizări recomandate</p>
                <ul className="grid gap-3">
                  {applicationRows.map((row, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-ink">{row.title}</span>
                      {row.details && <span className="text-text-muted"> — {row.details}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
