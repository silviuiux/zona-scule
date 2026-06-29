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

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Best-effort email notification on a new contact submission. Sent via Resend
 * (https://resend.com) using a plain fetch — no SDK dependency. Never throws:
 * a failed email must not break the user's submission (the row is already saved).
 *
 * Env vars (Vercel -> Project -> Settings -> Environment Variables):
 *   RESEND_API_KEY      — required; if missing, notification is skipped.
 *   CONTACT_NOTIFY_TO   — recipient (default: silviuxardelean@gmail.com).
 *   CONTACT_NOTIFY_FROM — sender; until zonascule.ro is verified in Resend use
 *                         the default "onboarding@resend.dev".
 */
async function sendContactNotification(data: ContactInput) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY missing - skipping contact email notification')
    return
  }

  const to = process.env.CONTACT_NOTIFY_TO || 'silviuxardelean@gmail.com'
  const from = process.env.CONTACT_NOTIFY_FROM || 'Zona Scule <onboarding@resend.dev>'

  const row = (label: string, value?: string) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#666">${label}</td><td>${esc(value)}</td></tr>` : ''

  const html = `
    <h2 style="margin:0 0 12px">Mesaj nou de pe zonascule.online</h2>
    <table style="border-collapse:collapse;font:14px/1.5 system-ui,sans-serif">
      ${row('Nume', data.nume)}
      ${row('Email', data.email)}
      ${row('Telefon', data.telefon)}
      ${row('Companie', data.companie)}
      ${row('Produs', data.produs)}
    </table>
    <p style="margin:16px 0 4px;color:#666">Mesaj:</p>
    <p style="white-space:pre-wrap;margin:0">${esc(data.mesaj)}</p>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `Contact nou - ${data.nume}`,
        html,
      }),
    })
    if (!res.ok) {
      console.error('Resend notification failed', res.status, await res.text())
    }
  } catch (err) {
    console.error('Resend notification error', err)
  }
}

/**
 * Persists a contact submission into `contact_messages`. Replaces the old
 * cosmetic-only handler (REBUILD.md 3.5). Uses the anon-key client; the table
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
  // Light email sanity check - keep it permissive, real validation is the reply.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: 'Adresa de email nu pare validă.' }
  }

  const payload: ContactInput = {
    nume,
    email,
    telefon: data.telefon?.trim() || undefined,
    companie: data.companie?.trim() || undefined,
    produs: data.produs?.trim() || undefined,
    mesaj,
  }

  const { error } = await supabase.from('contact_messages').insert({
    nume,
    email,
    telefon: payload.telefon || null,
    companie: payload.companie || null,
    produs: payload.produs || null,
    mesaj,
  })

  if (error) {
    console.error('contact_messages insert failed', error)
    return {
      ok: false,
      error: 'Nu am putut trimite mesajul. Încercați din nou sau scrieți-ne direct pe email.',
    }
  }

  // Best-effort notification - the row is saved regardless of email outcome.
  await sendContactNotification(payload)

  return { ok: true }
}
