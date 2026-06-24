import { NextRequest, NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Writes category_id/category_text/subcategory_id/subcategory_text on one
// product (REBUILD.md §3.7). `hasValidAdminSession()` here is the real
// security boundary — proxy.ts also 401s unauthenticated requests to this
// path, but this route never trusts that alone (see lib/auth.ts comment on
// the "thin proxy" pattern / CVE-2025-29927).
export async function POST(request: NextRequest) {
  const authed = await hasValidAdminSession();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    productId?: string;
    categoryId?: string;
    categoryText?: string;
    subcategoryId?: string;
    subcategoryText?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corp JSON invalid." }, { status: 400 });
  }

  const { productId, categoryId, categoryText, subcategoryId, subcategoryText } = body;
  if (!productId) {
    return NextResponse.json({ error: "productId este obligatoriu." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      category_id: categoryId ?? null,
      category_text: categoryText ?? null,
      subcategory_id: subcategoryId ?? null,
      subcategory_text: subcategoryText ?? null,
    })
    .eq("id", productId);

  if (error) {
    console.error("update-product-category failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/admin");
  revalidatePath("/produse");

  return NextResponse.json({ ok: true });
}
