'use client'
import { useState, use } from 'react'
import { submitContactMessage } from './actions'

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
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    if (!form.produs.trim()) {
      setError('Spuneți-ne pentru ce doriți oferta.')
      return
    }
    setSending(true)
    setError(null)
    const contact = [form.telefon.trim(), form.email.trim()].filter(Boolean).join(' / ')
    const res = await submitContactMessage({
      nume: form.nume,
      email: form.email,
      telefon: form.telefon,
      produs: form.produs,
      mesaj: [
        `Mă numesc ${form.nume.trim()} și sunt interesat să obțin o ofertă pentru ${form.produs.trim()}.`,
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
          padding: clamp(36px, 4vw, 56px) clamp(28px, 3vw, 48px) clamp(40px, 4vw, 56px);
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
          font-size: clamp(40px, 4vw, 60px); line-height: 1; letter-spacing: -0.015em;
          color: rgb(0,0,0);
          margin-bottom: clamp(28px, 5vh, 52px);
        }

        /* The sentence */
        .cf-letter {
          font-family: 'Montserrat', sans-serif; font-weight: 400;
          font-size: clamp(15px, 1.15vw, 17px); line-height: 1.3;
          color: rgb(30,30,30);
          display: flex; flex-direction: column; gap: clamp(10px, 1.8vh, 18px);
        }
        .cf-line { display: flex; align-items: flex-end; flex-wrap: wrap; column-gap: 10px; row-gap: 8px; }
        .cf-line > span { padding-bottom: 5px; white-space: nowrap; }
        .cf-line.gap-top { margin-top: clamp(6px, 1.2vh, 12px); }
        .cf-input {
          flex: 1 1 180px; min-width: 0;
          border: none; border-bottom: 1px solid rgba(0,0,0,0.25); border-radius: 0;
          background: transparent; outline: none;
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(17px, 1.3vw, 19px); line-height: 1.3;
          color: rgb(217,44,43);
          padding: 0 0 4px 6px;
          transition: border-color 150ms;
        }
        .cf-input.name { flex: 0 1 30%; min-width: 160px; }
        .cf-line.nowrap { flex-wrap: nowrap; }
        .cf-label { flex: 0 0 52px; }
        .cf-input.full { padding-left: 0; }
        .cf-input.msg { resize: none; overflow: hidden; field-sizing: content; min-height: 1.3em; }
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
            <div className="cf-letter">
              <div className="cf-line">
                <span>Mă numesc</span>
                <input className="cf-input name" required autoComplete="name" aria-label="Nume"
                  placeholder="numele dumneavoastră" value={form.nume} onChange={set('nume')} />
                <span>și sunt interesat să obțin o ofertă pentru</span>
              </div>
              <div className="cf-line">
                <input className="cf-input full" required aria-label="Produse și cantități"
                  placeholder="produsele și cantitățile dorite" value={form.produs} onChange={set('produs')} />
              </div>
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
