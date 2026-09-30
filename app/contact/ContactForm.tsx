'use client'
import { useState, use } from 'react'
import { submitContactMessage } from './actions'
import RecentPicker from './RecentPicker'
import type { RecentProduct } from '@/lib/recently-viewed'

/**
 * "Fill-in-the-sentence" contact form: the request reads as one letter —
 * "Mă numesc ___ și sunt interesat să obțin o ofertă pentru / ___ (produse
 * și cantități) / ___ (mesaj) / Vă rog să mă contactați la: tel ___
 * email ___" — with the inputs sitting on the text's underlines, typed
 * values in red Neuton. The sentence itself
 * becomes the message sent through submitContactMessage (same pipeline as
 * before: contact_messages row + office email).
 */
export default function ContactForm({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; brand?: string; model?: string }>
}) {
  const params = use(searchParams)

  const prefilledProduct = [params.brand, params.model, params.sku]
    .filter(Boolean).join(' — ')

  const [form, setForm] = useState({
    nume: '',
    produs: prefilledProduct,
    mesaj: '',
    telefon: '',
    email: '',
  })
  const [picked, setPicked] = useState<RecentProduct[]>([])
  const [honeypot, setHoneypot] = useState('')
  const [shownAt] = useState(() => Date.now())
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    if (!form.produs.trim() && picked.length === 0) {
      setError('Spuneți-ne pentru ce doriți oferta.')
      return
    }
    setSending(true)
    setError(null)
    const contact = [form.telefon.trim(), form.email.trim()].filter(Boolean).join(' / ')
    const origin = window.location.origin
    const refs = picked.map(p => `${[p.brand, p.name].filter(Boolean).join(' ')}${p.sku ? ` (${p.sku})` : ''}`)
    const what = [form.produs.trim(), ...refs].filter(Boolean).join('; ')
    const links = picked.length
      ? 'Produse atașate din istoric:\n' + picked.map(p => `– ${[p.brand, p.name].filter(Boolean).join(' ')}${p.sku ? ` · ${p.sku}` : ''} · ${origin}/produse/${p.slug}`).join('\n')
      : ''
    const res = await submitContactMessage({
      nume: form.nume,
      email: form.email,
      telefon: form.telefon,
      website: honeypot,
      elapsedMs: Date.now() - shownAt,
      produs: what,
      mesaj: [
        `Mă numesc ${form.nume.trim()} și sunt interesat să obțin o ofertă pentru ${what}.`,
        links,
        form.mesaj.trim(),
        `Vă rog să mă contactați la: ${contact}.`,
      ].filter(Boolean).join('\n\n'),
    })
    setSending(false)
    if (res.ok) setSent(true)
    else setError(res.error ?? 'A apărut o eroare. Încercați din nou.')
  }

  return (
    <div className="cf">
      <style>{`
        /* A sheet of paper left on the desk: white, a soft shadow, turned a
           little counter-clockwise — it straightens up while you write */
        .cf {
          position: relative;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.06);
          padding: clamp(48px, 5vw, 80px) clamp(32px, 3.4vw, 56px) clamp(52px, 5vw, 80px);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 14px 32px rgba(0,0,0,0.07), 0 40px 80px rgba(0,0,0,0.05);
          transform: rotate(-2deg);
          transform-origin: 40% 60%;
          transition: transform 600ms cubic-bezier(0.2, 0.7, 0.1, 1), box-shadow 600ms ease;
        }
        .cf:focus-within { transform: rotate(-0.5deg); box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 18px 40px rgba(0,0,0,0.08), 0 48px 96px rgba(0,0,0,0.06); }
        @media (prefers-reduced-motion: reduce) { .cf { transition: none; } }
        .cf-eyebrow { margin-bottom: 16px; }
        .cf-title {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(36px, 3.4vw, 52px); line-height: 1; letter-spacing: -0.015em;
          color: rgb(0,0,0);
          margin-bottom: clamp(28px, 5vh, 52px);
        }

        /* The sentence */
        .cf-letter {
          font-family: 'Montserrat', sans-serif; font-weight: 400;
          font-size: clamp(13px, 1vw, 15px); line-height: 1.3;
          color: rgb(30,30,30);
          display: flex; flex-direction: column; gap: clamp(14px, 2.2vh, 22px);
        }
        .cf-line { display: flex; align-items: flex-end; flex-wrap: wrap; column-gap: 10px; row-gap: 8px; }
        .cf-line > span { padding-bottom: 5px; white-space: nowrap; }
        .cf-line.gap-top { margin-top: clamp(6px, 1.2vh, 12px); }
        .cf-input {
          flex: 1 1 180px; min-width: 0;
          border: none; border-bottom: 1px solid rgba(0,0,0,0.25); border-radius: 0;
          background: transparent; outline: none;
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(15px, 1.15vw, 17px); line-height: 1.3;
          color: rgb(217,44,43);
          padding: 0 0 4px 6px;
          transition: border-color 150ms;
        }
        .cf-input.name { flex: 0 1 30%; min-width: 160px; }
        .cf-line.nowrap { flex-wrap: nowrap; }
        .cf-label { flex: 0 0 52px; }
        .cf-input.full { padding-left: 0; }
        .cf-input.msg { resize: none; overflow: hidden; field-sizing: content; min-height: 1.3em; }
        .cf-picked { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin-top: -4px; }
        .cf-picked li {
          display: inline-flex; align-items: center; gap: 6px; max-width: 100%;
          padding: 4px 4px 4px 10px; border-radius: 3px; background: rgb(244,244,244);
          font-family: 'Recursive', sans-serif; font-size: 13px; color: rgb(217,44,43);
        }
        .cf-picked li span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cf-picked button { border: none; background: none; cursor: pointer; font-size: 16px; line-height: 1; color: rgba(0,0,0,0.45); padding: 0 4px; }
        .cf-picked button:hover { color: rgb(0,0,0); }
        .cf-input::placeholder { color: rgba(0,0,0,0.22); }
        .cf-input:focus { border-bottom-color: rgb(217,44,43); }

        .cf-foot {
          margin-top: clamp(28px, 5vh, 48px);
          display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
        }
        .cf-error { font-family: 'Montserrat', sans-serif; font-size: 13px; color: rgb(217,44,43); }
        .cf-submit {
          display: inline-flex; align-items: center; gap: 28px;
          background: rgb(0,0,0); color: rgb(255,255,255);
          border: none; border-radius: 3px; cursor: pointer;
          padding: 8px 8px 8px 24px;
          font-family: 'Montserrat', sans-serif; font-weight: 500;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 150ms;
        }
        .cf-submit:hover { background: rgb(217,44,43); }
        .cf-submit:disabled { opacity: 0.55; cursor: default; }
        .cf-submit-icon {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.14);
          display: inline-flex; align-items: center; justify-content: center;
          transition: transform 250ms cubic-bezier(0.22,1,0.36,1);
        }
        .cf-submit:hover .cf-submit-icon { transform: translateX(3px); }

        .cf-thanks { font-family: 'Montserrat', sans-serif; font-size: 18px; line-height: 1.4; color: rgb(30,30,30); max-width: 34ch; }
        .cf-thanks em { font-style: normal; font-family: 'Neuton', serif; font-size: 20px; color: rgb(217,44,43); }

        @media (max-width: 768px) {
          .cf-line { flex-direction: column; align-items: stretch; }
          .cf-line > span { white-space: normal; padding-bottom: 0; }
          .cf-input, .cf-input.name { flex: 0 0 auto; width: 100%; padding-left: 0; }
          .cf-label { flex: 0 0 auto; }
          .cf { transform: rotate(-1deg); }
          .cf-submit { width: 100%; justify-content: space-between; }
        }
      `}</style>

        <p className="eyebrow-mono cf-eyebrow">Cerere de ofertă</p>
        <h1 id="cf-title" className="cf-title">Hai să vorbim</h1>

        {sent ? (
          <p className="cf-thanks">
            Mulțumim{form.nume.trim() ? <>, <em>{form.nume.trim()}</em></> : null}! Pregătim oferta și vă contactăm în cel mai scurt timp.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Honeypot — off-screen, skipped by keyboard and screen readers */}
            <input
              type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)}
              tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }}
            />
            <div className="cf-letter">
              <div className="cf-line">
                <span>Mă numesc</span>
                <input className="cf-input name" required autoComplete="name" aria-label="Nume"
                  placeholder="numele dumneavoastră" value={form.nume} onChange={set('nume')} />
                <span>și sunt interesat să obțin o ofertă pentru</span>
              </div>
              <div className="cf-line nowrap">
                <input className="cf-input full" required={picked.length === 0} aria-label="Produse și cantități"
                  placeholder="produsele și cantitățile dorite" value={form.produs} onChange={set('produs')} />
                <RecentPicker picked={picked} onPick={setPicked} />
              </div>
              {picked.length > 0 && (
                <ul className="cf-picked" aria-label="Produse atașate">
                  {picked.map(p => (
                    <li key={p.slug}>
                      <span>{[p.brand, p.name].filter(Boolean).join(' ')}</span>
                      <button type="button" aria-label={`Scoate ${p.name}`} onClick={() => setPicked(l => l.filter(x => x.slug !== p.slug))}>×</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="cf-line">
                <textarea className="cf-input full msg" rows={1} aria-label="Mesaj"
                  placeholder="mesaj (opțional)" value={form.mesaj} onChange={set('mesaj')} />
              </div>
              <div className="cf-line gap-top">
                <span>Vă rog să mă contactați la:</span>
              </div>
              <div className="cf-line nowrap">
                <span className="cf-label">tel.</span>
                <input className="cf-input" type="tel" autoComplete="tel" aria-label="Telefon"
                  placeholder="telefon" value={form.telefon} onChange={set('telefon')} />
              </div>
              <div className="cf-line nowrap">
                <span className="cf-label">e-mail</span>
                <input className="cf-input" type="email" required autoComplete="email" aria-label="Email"
                  placeholder="adresa de e-mail" value={form.email} onChange={set('email')} />
              </div>
            </div>

            <div className="cf-foot">
              <button type="submit" className="cf-submit" disabled={sending}>
                {sending ? 'Se trimite…' : 'Trimite cererea'}
                <span className="cf-submit-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </button>
              {error && <p className="cf-error">{error}</p>}
            </div>
          </form>
        )}
    </div>
  )
}
