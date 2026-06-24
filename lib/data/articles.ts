import { supabaseServer } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

/**
 * Zona Soluții articles, now backed by a real `articles` table (see
 * docs/migrations/0001_rebuild.sql) instead of the static
 * `app/zona-solutii/articles.ts` array on `main` — editable without a code
 * deploy, per the recommendation in REBUILD.md §7.
 */
export async function getArticles(profession?: string): Promise<Article[]> {
  let query = supabaseServer
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (profession) query = query.eq("profession", profession);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabaseServer
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as Article) ?? null;
}

export async function getRelatedArticles(
  profession: string,
  excludeSlug: string,
  limit = 3
): Promise<Article[]> {
  const { data, error } = await supabaseServer
    .from("articles")
    .select("*")
    .eq("profession", profession)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Article[];
}
