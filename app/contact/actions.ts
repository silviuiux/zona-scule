'use server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export type ContactPayload = {
  nume: string
  email: string
  telefon?: string
  companie?: string
  produs?: string
  mesaj: string
  /** honeypot — real users never fill this */
  website?: string
  sourceUrl?: string
}

export type ContactResult = { ok: true } | { ok: false; error: string }

export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  // Honeypot: pretend success for bots.
  if (payload.website) return { ok: true }

  const nume = payload.nume?.trim()
  const email = payload.email?.trim()
  const mesaj = payload.mesaj?.trim()

  if (!nume || nume.length < 2) return { ok: false, error: 'Va rugam introduceti numele.' }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Adresa de email nu este valida.' }
  if (!mesaj || mesaj.length < 5) return { ok: false, error: 'Va rugam scrieti un mesaj.' }

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('contact_messages').insert({
      nume: nume.slice(0, 200),
      email: email.slice(0, 200),
      telefon: payload.telefon?.trim().slice(0, 50) || null,
      companie: payload.companie?.trim().slice(0, 200) || null,
      produs: payload.produs?.trim().slice(0, 500) || null,
      mesaj: mesaj.slice(0, 5000),
      source_url: payload.sourceUrl?.slice(0, 500) || null,
    })
    if (error) {
      console.error('[contact] insert failed:', error.message)
      return { ok: false, error: 'Nu am putut trimite mesajul. Va rugam sunati la 0248.222.298.' }
    }
    return { ok: true }
  } catch (e) {
    console.error('[contact] unexpected:', e)
    return { ok: false, error: 'Nu am putut trimite mesajul. Va rugam sunati la 0248.222.298.' }
  }
}
