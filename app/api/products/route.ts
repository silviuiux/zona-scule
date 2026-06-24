import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data/products";

// Backs the "load more" button on /produse (REBUILD.md §3.2/§3.7). Public,
// read-only — no auth required, mirrors the same RPC-backed/family-rollup
// query the listing page itself uses, so pagination never duplicates or
// skips a row relative to the first server-rendered page.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = Number(params.get("page") ?? "1") || 1;
  const pageSize = Math.min(Number(params.get("pageSize") ?? "24") || 24, 100);

  try {
    const result = await getProducts({
      page,
      pageSize,
      brandName: params.get("brand") ?? undefined,
      categoryText: params.get("category") ?? undefined,
      subcategoryText: params.get("subcategory") ?? undefined,
      search: params.get("search") ?? undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/products failed", err);
    return NextResponse.json({ error: "Nu am putut încărca produsele." }, { status: 500 });
  }
}
