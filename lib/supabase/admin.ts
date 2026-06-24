import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client. NEVER import this from a client component or expose it
// to the browser bundle — the `server-only` import above makes that a build
// error if anyone tries. Used exclusively by the admin server actions and the
// /api/update-product-category route, both of which sit behind the
// requireAdminSession() check in lib/auth.ts.
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL env var.");

  const key = serviceKey || anonKey;
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_KEY (and no anon key fallback available)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const supabaseAdmin = getAdminSupabase();
