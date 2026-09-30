'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { hasValidAdminSession } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function assertAdmin() {
  if (!(await hasValidAdminSession())) throw new Error('Unauthorized')
}

export async function setMessageHandled(id: string, handled: boolean) {
  await assertAdmin()
  const { error } = await supabase
    .from('contact_messages')
    .update({ handled_at: handled ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/mesaje')
}

export async function setMessageSpam(id: string, spam: boolean) {
  await assertAdmin()
  const { error } = await supabase.from('contact_messages').update({ spam }).eq('id', id)
  if (error) throw error
  revalidatePath('/admin/mesaje')
}
