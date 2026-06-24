// Minimal, dependency-free admin session: a signed cookie, checked in
// middleware.ts before /admin/* or /api/update-product-category are ever
// reached by route code. No third-party auth provider — per REBUILD.md §3.6,
// "even basic" real auth is the bar, and ADMIN_USER/ADMIN_PASS were the
// suggested env vars.
//
// Uses Web Crypto (globalThis.crypto.subtle) rather than Node's `crypto`
// module so the same code runs unmodified in middleware (Edge runtime),
// server actions, and route handlers (Node runtime) alike.

export const ADMIN_COOKIE_NAME = "zs_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSigningSecret(): string {
  const secret = process.env.ADMIN_PASS;
  if (!secret) {
    throw new Error("ADMIN_PASS env var is required to sign admin sessions.");
  }
  return secret;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string): Promise<string> {
  const key = await hmacKey(getSigningSecret());
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(sig);
}

/** Builds the cookie value to set after a successful login. */
export async function createSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const signature = await sign(issuedAt);
  return `${issuedAt}.${signature}`;
}

/** Verifies a session token's signature and expiry. Safe to call from middleware (Edge runtime). */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const expected = await sign(issuedAt);
  if (signature.length !== expected.length) return false;
  // Constant-time-ish comparison without Node's Buffer (unavailable on Edge).
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return false;

  const age = (Date.now() - Number(issuedAt)) / 1000;
  return age >= 0 && age < SESSION_MAX_AGE_SECONDS;
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;
  if (!expectedUser || !expectedPass) return false;
  return username === expectedUser && password === expectedPass;
}

export const ADMIN_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

/**
 * Authoritative check for Server Components and route handlers — reads
 * `next/headers` cookies() directly (Node runtime, not Edge), so this can
 * do the full signature+expiry verification rather than the "thin proxy"
 * presence check in proxy.ts. Call this in app/admin/(protected)/layout.tsx
 * and in app/api/update-product-category/route.ts — proxy.ts alone is UX,
 * not the security boundary (per the Next.js 16 "thin proxy" guidance and
 * the CVE-2025-29927 lesson: never trust Edge middleware as the only gate).
 */
export async function hasValidAdminSession(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
