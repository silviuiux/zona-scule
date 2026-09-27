'use client'
import { useState, use } from 'react'
import { submitContactMessage } from './actions'

/**
 * "Fill-in-the-sentence" contact form: the request reads as one letter —
 * "Mă numesc ___ și sunt interesat să obțin o ofertă personalizată pentru
 * ___. Vă rog să mă contactați la ___ / ___" — with the inputs sitting on
 * the text's underlines, typed values in red Neuton. The sentence itself
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
    telefon: '',
    email: '',
  })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

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
      mesaj: `Mă numesc ${form.nume.trim()} și sunt interesat să obțin o ofertă personalizată pentru ${form.produs.trim()}. Vă rog să mă contactați la ${contact}.`,
    })
    setSending(false)
    if (res.ok) setSent(true)
    else setError(res.error ?? 'A apărut o eroare. Încercați din nou.')
  }

  return (
    <section className="cf" aria-labelledby="cf-title">
      <style>{`
        .cf { padding: var(--space-section) 0; border-bottom: 1px solid rgba(0,0,0,0.12); }
        /* Compact letter on the left 60% — the rest of the full-width
           section is open space. No panel by default; a hairline outline
           frames it only while a field is being filled in. */
        .cf-panel {
          width: 60%;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: clamp(32px, 4vw, 56px);
          transition: border-color 250ms ease;
        }
        .cf-panel:focus-within { border-color: rgba(0,0,0,0.12); }
        .cf-eyebrow { margin-bottom: 16px; }
        .cf-title {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(36px, 3.4vw, 48px); line-height: 1; letter-spacing: -0.015em;
          color: rgb(0,0,0);
          margin-bottom: 48px;
        }

        /* The sentence */
        .cf-letter {
          font-family: 'Montserrat', sans-serif; font-weight: 400;
          font-size: clamp(17px, 1.4vw, 20px); line-height: 1.3;
          color: rgb(30,30,30);
          display: flex; flex-direction: column; gap: 22px;
        }
        .cf-line { display: flex; align-items: flex-end; flex-wrap: wrap; column-gap: 12px; row-gap: 8px; }
        .cf-line > span { padding-bottom: 5px; white-space: nowrap; }
        .cf-input {
          flex: 1 1 200px; min-width: 0;
          border: none; border-bottom: 1px solid rgba(0,0,0,0.25); border-radius: 0;
          background: transparent; outline: none;
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(19px, 1.55vw, 22px); line-height: 1.3;
          color: rgb(217,44,43);
          padding: 0 0 4px 8px;
          transition: border-color 150ms;
        }
        .cf-input.name { flex: 0 1 34%; min-width: 180px; }
        .cf-input.full { padding-left: 0; }
        .cf-input::placeholder { color: rgba(0,0,0,0.22); }
        .cf-input:focus { border-bottom-color: rgb(217,44,43); }

        .cf-foot {
          margin-top: 48px; padding-top: 24px;
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
        }
        .cf-note {
          font-family: 'Montserrat', sans-serif; font-weight: 400;
          font-size: 14px; line-height: 1.5;
          color: rgba(0,0,0,0.5); max-width: 34ch;
        }
        .cf-error { font-family: 'Montserrat', sans-serif; font-size: 13px; color: rgb(217,44,43); margin-top: 8px; }
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

        .cf-thanks { font-family: 'Montserrat', sans-serif; font-size: 20px; line-height: 1.4; color: rgb(30,30,30); max-width: 34ch; }
        .cf-thanks em { font-style: normal; font-family: 'Neuton', serif; font-size: 22px; color: rgb(217,44,43); }

        @media (max-width: 1100px) { .cf-panel { width: 80%; } }
        @media (max-width: 768px) {
          .cf-line { flex-direction: column; align-items: stretch; }
          .cf-line > span { white-space: normal; padding-bottom: 0; }
          .cf-input, .cf-input.name { flex: 1 1 auto; width: 100%; padding-left: 0; }
          .cf-panel { width: 100%; }
          .cf-submit { width: 100%; justify-content: space-between; }
        }
      `}</style>

      <div className="cf-panel">
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
                <span>și sunt interesat să obțin o ofertă</span>
              </div>
              <div className="cf-line">
                <span>personalizată pentru</span>
                <input className="cf-input" required aria-label="Produse de interes"
                  placeholder="produsele sau cantitățile dorite" value={form.produs} onChange={set('produs')} />
              </div>
              <div className="cf-line">
                <span>Vă rog să mă contactați la</span>
                <input className="cf-input" type="tel" autoComplete="tel" aria-label="Telefon"
                  placeholder="telefon" value={form.telefon} onChange={set('telefon')} />
              </div>
              <div className="cf-line">
                <input className="cf-input full" type="email" required autoComplete="email" aria-label="Email"
                  placeholder="adresa de e-mail" value={form.email} onChange={set('email')} />
              </div>
            </div>

            <div className="cf-foot">
              <div>
                <p className="cf-note">Pregătim oferte personalizate, întotdeauna adaptate nevoilor și cerințelor dumneavoastră.</p>
                {error && <p className="cf-error">{error}</p>}
              </div>
              <button type="submit" className="cf-submit" disabled={sending}>
                {sending ? 'Se trimite…' : 'Trimite mesajul'}
                <span className="cf-submit-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
