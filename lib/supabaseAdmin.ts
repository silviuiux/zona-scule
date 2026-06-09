import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client. SERVER ONLY — never import from a
 * client component. Used by authenticated admin actions and the
 * contact-form insert, after RLS locks anon writes (supabase/setup.sql).
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_KEY / NEXT_PUBLIC_SUPABASE_URL missing')
  return createClient(url, key, { auth: { persistSession: false } })
}
