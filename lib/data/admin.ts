"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Admin write paths. All use the service-role client deliberately — RLS on
// `subcategories`/`products` should be read-only for `anon` now (REBUILD.md
// §5.5), so writes only succeed through these server actions, which sit
// behind the middleware.ts auth gate. Never call supabaseAdmin from a client
// component or expose these actions to unauthenticated routes.

export type AdminActionResult = { ok: boolean; message: string };

export async function reassignSubcategory(
  subcategorySlug: string,
  newCategoryId: string,
  newCategoryName: string
): Promise<AdminActionResult> {
  const { data: subcategory, error: subError } = await supabaseAdmin
    .from("subcategories")
    .update({ parent_category_id: newCategoryId })
    .eq("slug", subcategorySlug)
    .select("name")
    .maybeSingle();

  if (subError || !subcategory) {
    return { ok: false, message: subError?.message ?? "Subcategorie inexistentă." };
  }

  const { error: productsError } = await supabaseAdmin
    .from("products")
    .update({ category_id: newCategoryId, category_text: newCategoryName })
    .eq("subcategory_text", subcategory.name);

  if (productsError) {
    return { ok: false, message: productsError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/produse");
  return { ok: true, message: `${subcategory.name} reasignată la ${newCategoryName}.` };
}

export async function renameSubcategory(
  subcategorySlug: string,
  newName: string
): Promise<AdminActionResult> {
  const { data: subcategory, error: subError } = await supabaseAdmin
    .from("subcategories")
    .update({ name: newName })
    .eq("slug", subcategorySlug)
    .select("name")
    .maybeSingle();

  if (subError || !subcategory) {
    return { ok: false, message: subError?.message ?? "Subcategorie inexistentă." };
  }

  const { error: productsError } = await supabaseAdmin
    .from("products")
    .update({ subcategory_text: newName })
    .eq("subcategory_text", subcategory.name);

  if (productsError) {
    return { ok: false, message: productsError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/produse");
  return { ok: true, message: `Subcategorie redenumită în ${newName}.` };
}

export async function bulkReassign(
  subcategorySlugs: string[],
  newCategoryId: string,
  newCategoryName: string
): Promise<AdminActionResult> {
  let successCount = 0;
  for (const slug of subcategorySlugs) {
    const result = await reassignSubcategory(slug, newCategoryId, newCategoryName);
    if (result.ok) successCount += 1;
  }

  revalidatePath("/admin");
  revalidatePath("/produse");
  return {
    ok: successCount > 0,
    message: `${successCount}/${subcategorySlugs.length} subcategorii reasignate la ${newCategoryName}.`,
  };
}
