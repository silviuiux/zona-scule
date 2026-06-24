"use client";

import { createClient } from "@supabase/supabase-js";

// Browser client — anon key only, safe to expose. Used by client components
// that need direct reads (currently none do; most reads go through Server
// Components or /api routes), kept for parity with the documented stack.
let browserClient: ReturnType<typeof createClient> | null = null;

export function getBrowserSupabase() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars."
    );
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}
