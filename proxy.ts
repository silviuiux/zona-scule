import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Next.js 16 renamed middleware.ts -> proxy.ts (exported fn -> `proxy`).
// Per the "thin proxy" guidance this only does a cheap presence+signature
// check for redirect UX on /admin pages. The authoritative check still
// happens again in app/admin/page.tsx and the admin server actions — this
// file is not the only gate (CVE-2025-29927). Gates /admin/* before route
// code ever runs — per REBUILD.md §3.6, there was no auth check on `main`.
// /admin/login is the only unauthenticated path under /admin.
//
// The former product-category write API (/api/update-product-category) and
// its PDP-editing UI were removed — category/subcategory reassignment now
// only happens from /admin (see app/admin/actions.ts), so this proxy no
// longer needs to gate a separate write endpoint.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === "/admin/login";
  const isProtectedPage = pathname.startsWith("/admin") && !isLoginRoute;

  if (!isProtectedPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authed = await verifySessionToken(token);

  if (authed) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
