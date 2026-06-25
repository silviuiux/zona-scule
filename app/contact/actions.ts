'use server'

import { supabase } from '@/lib/supabase'

export type ContactResult = { ok: boolean; error?: string }

export type ContactInput = {
  nume: string
  email: string
  telefon?: string
  companie?: string
  produs?: string
  mesaj: string
}

/**
 * Persists a contact submission into `contact_messages`. Replaces the old
 * cosmetic-only handler (REBUILD.md §3.5). Uses the anon-key client; the table
 * has RLS with an anon INSERT-only policy (contact_messages_insert_anon), so
 * the public can submit but cannot read or modify existing rows.
 */
export async function submitContactMessage(data: ContactInput): Promise<ContactResult> {
  const nume = data.nume?.trim()
  const email = data.email?.trim()
  const mesaj = data.mesaj?.trim()

  if (!nume || !email || !mesaj) {
    return { ok: false, error: 'Completați nume, email și mesaj.' }
  }
  // Light email sanity check — keep it permissive, real validation is the reply.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: 'Adresa de email nu pare validă.' }
  }

  const { error } = await supabase.from('contact_messages').insert({
    nume,
    email,
    telefon: data.telefon?.trim() || null,
    companie: data.companie?.trim() || null,
    produs: data.produs?.trim() || null,
    mesaj,
  })

  if (error) {
    console.error('contact_messages insert failed', error)
    return {
      ok: false,
      error: 'Nu am putut trimite mesajul. Încercați din nou sau scrieți-ne direct pe email.',
    }
  }

  return { ok: true }
}
