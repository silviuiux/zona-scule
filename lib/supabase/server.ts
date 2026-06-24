import { createClient } from "@supabase/supabase-js";

// Read-only (anon-key) Supabase client for use in Server Components, route
// handlers, and server actions that only need public catalog data. RLS on the
// underlying tables/views governs what's actually readable.
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars."
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

export const supabaseServer = getServerSupabase();
