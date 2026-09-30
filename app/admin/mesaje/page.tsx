import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { hasValidAdminSession } from '@/lib/auth'
import MessagesClient from './MessagesClient'

// contact_messages is insert-only for anon (RLS), so reading needs the
// service key — this page is behind the admin session like the rest of /admin.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export type ContactMessage = {
  id: string
  created_at: string
  nume: string
  email: string
  telefon: string | null
  companie: string | null
  produs: string | null
  mesaj: string
  spam: boolean
  handled_at: string | null
}

export default async function AdminMessagesPage() {
  if (!(await hasValidAdminSession())) redirect('/admin/login?next=/admin/mesaje')

  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, created_at, nume, email, telefon, companie, produs, mesaj, spam, handled_at')
    .order('created_at', { ascending: false })
  if (error) throw error

  return <MessagesClient messages={(data ?? []) as ContactMessage[]} />
}
