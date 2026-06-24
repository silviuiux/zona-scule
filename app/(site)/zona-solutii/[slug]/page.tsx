import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
import { getProducts } from "@/lib/data/products";
import { professionLabel } from "@/lib/professions";
import ProductCard from "@/components/ProductCard";

export const revalidate = 3600;

const DEFAULT_GRADIENT = "linear-gradient(135deg, #1e1e1e, #0a0a0a)";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Ghid indisponibil" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [related, recommended] = await Promise.all([
    getRelatedArticles(article.profession, slug),
    getProducts({ page: 1, pageSize: 6, ...article.product_filter }),
  ]);

  return (
    <div>
      <section
        className="flex min-h-[40vh] flex-col justify-end px-5 py-16 md:px-8 md:py-24"
        style={{ background: article.cover_gradient || DEFAULT_GRADIENT }}
      >
        <div className="mx-auto w-full max-w-[1600px]">
          <nav className="label mb-6 flex items-center gap-2 text-white/60">
            <Link href="/zona-solutii" className="hover:text-white">
              Zona Soluții
            </Link>
            <span>/</span>
            <span>{professionLabel(article.profession)}</span>
          </nav>
          {article.tag && (
            <p className="label mb-4 inline-block rounded-full bg-white/15 px-3 py-1.5 text-white">
              {article.tag}
            </p>
          )}
          <h1 className="font-display max-w-3xl text-4xl leading-[0.95] text-white md:text-6xl">
            {article.title}
          </h1>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1600px] gap-16 md:grid-cols-[1.6fr_1fr]">
          <article
            className="prose-zs max-w-none text-base leading-relaxed text-ink"
            dangerouslySetInnerHTML={{ __html: article.body_html }}
          />

          <aside className="flex flex-col gap-10">
            <div className="border border-border bg-surface p-6">
              <p className="label mb-3 text-text-faint">Ai nevoie de scule pentru asta?</p>
              <p className="mb-5 text-sm text-text-muted">
                Vezi tot catalogul filtrat pentru această recomandare.
              </p>
              <Link
                href="/produse"
                className="label inline-block rounded-full bg-red px-6 py-3 text-white transition-colors hover:bg-red-hover"
              >
                Vezi catalogul
              </Link>
            </div>

            {related.length > 0 && (
              <div>
                <p className="label mb-4 text-text-faint">Ghiduri similare</p>
                <ul className="flex flex-col gap-4">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link href={`/zona-solutii/${r.slug}`} className="group block">
                        <p className="text-sm font-medium text-ink transition-colors group-hover:text-red">
                          {r.title}
                        </p>
                        <p className="label mt-1 text-text-faint">{r.read_minutes ?? "—"} min</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {recommended.products.length > 0 && (
          <div className="mx-auto mt-16 max-w-[1600px] border-t border-border pt-16">
            <h2 className="font-display mb-8 text-3xl text-ink md:text-4xl">Produse recomandate</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {recommended.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
