import Link from "next/link";
import type { Article } from "@/lib/types";

const DEFAULT_GRADIENT = "linear-gradient(135deg, #1e1e1e, #0a0a0a)";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/zona-solutii/${article.slug}`}
      className="group flex flex-col border border-border bg-white transition-colors hover:border-ink"
    >
      <div
        className="flex aspect-[16/9] items-end p-5"
        style={{ background: article.cover_gradient || DEFAULT_GRADIENT }}
      >
        {article.tag && (
          <span className="label rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur-sm">
            {article.tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-display text-2xl leading-tight text-ink transition-colors group-hover:text-red">
          {article.title}
        </h3>
        <p className="text-sm leading-relaxed text-text-muted">{article.excerpt}</p>
        {article.read_minutes && (
          <p className="label mt-auto pt-2 text-text-faint">{article.read_minutes} min citire</p>
        )}
      </div>
    </Link>
  );
}
