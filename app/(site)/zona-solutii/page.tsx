import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/data/articles";
import { PROFESSIONS, professionLabel } from "@/lib/professions";
import ArticleCard from "@/components/ArticleCard";

export const metadata: Metadata = {
  title: "Zona Soluții",
};

// Reads searchParams (profession filter) so this is naturally dynamic, like
// /produse — a more precise replacement for the blanket `force-dynamic` on
// `main` (REBUILD.md §3.4/§6), not a stylistic change.
export default async function ZonaSolutiiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const profession = typeof params.profession === "string" ? params.profession : undefined;

  const articles = await getArticles(profession);

  return (
    <div>
      <section className="noise border-b border-border bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1600px]">
          <p className="label mb-4 text-red">Ghiduri practice</p>
          <h1 className="font-display max-w-3xl text-4xl leading-[0.95] text-ink md:text-7xl">
            Zona Soluții
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">
            Recomandări de produse pe meserii — nu un blog, ci ghiduri scurte
            care îți spun exact ce sculă să folosești.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 md:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 flex flex-wrap gap-2">
            <Link
              href="/zona-solutii"
              className={`label rounded-full border px-4 py-2 transition-colors ${
                !profession ? "border-red bg-red text-white" : "border-border-strong text-ink hover:border-ink"
              }`}
            >
              Toate
            </Link>
            {PROFESSIONS.map((p) => (
              <Link
                key={p.value}
                href={`/zona-solutii?profession=${p.value}`}
                className={`label rounded-full border px-4 py-2 transition-colors ${
                  profession === p.value
                    ? "border-red bg-red text-white"
                    : "border-border-strong text-ink hover:border-ink"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          {articles.length === 0 ? (
            <div className="border border-border bg-surface px-6 py-16 text-center">
              <p className="text-ink">
                {profession
                  ? `Niciun ghid pentru ${professionLabel(profession)} încă.`
                  : "Niciun ghid publicat încă."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
