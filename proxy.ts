import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Next.js 16 renamed middleware.ts -> proxy.ts (exported fn -> `proxy`).
// Per the "thin proxy" guidance this only does a cheap presence+signature
// check for redirect UX on /admin pages and a hard 401 on the write API.
// The authoritative check still happens again in app/admin/layout.tsx and
// inside the API route handler itself — this file is not the only gate.
// Gates /admin/* and the product-category write API before route code ever
// runs — per REBUILD.md §3.6/§3.7, neither had any auth check on `main`.
// /admin/login is the only unauthenticated path under /admin.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === "/admin/login";
  const isProtectedPage = pathname.startsWith("/admin") && !isLoginRoute;
  const isProtectedApi = pathname === "/api/update-product-category";

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authed = await verifySessionToken(token);

  if (authed) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/update-product-category"],
};
