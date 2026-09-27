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
        .cf-title {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(44px, 5vw, 72px); line-height: 1; letter-spacing: -0.015em;
          color: rgb(0,0,0);
          margin-bottom: clamp(48px, 7vw, 96px);
        }

        /* The sentence */
        .cf-letter {
          font-family: 'Montserrat', sans-serif; font-weight: 400;
          font-size: clamp(22px, 2.3vw, 34px); line-height: 1.2;
          color: rgb(30,30,30);
          display: flex; flex-direction: column; gap: clamp(20px, 2.4vw, 36px);
        }
        .cf-line { display: flex; align-items: flex-end; flex-wrap: wrap; column-gap: 14px; row-gap: 8px; }
        .cf-line > span { padding-bottom: 6px; white-space: nowrap; }
        .cf-input {
          flex: 1 1 280px; min-width: 0;
          border: none; border-bottom: 1px solid rgba(0,0,0,0.3); border-radius: 0;
          background: transparent; outline: none;
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(24px, 2.4vw, 34px); line-height: 1.2;
          color: rgb(217,44,43);
          padding: 0 0 6px clamp(0px, 1.6vw, 24px);
          transition: border-color 150ms;
        }
        .cf-input.name { flex: 0 1 30%; min-width: 220px; }
        .cf-input.full { padding-left: 0; }
        .cf-input::placeholder { color: rgba(0,0,0,0.22); }
        .cf-input:focus { border-bottom-color: rgb(217,44,43); }

        .cf-foot {
          margin-top: clamp(56px, 7vw, 96px);
          display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap;
        }
        .cf-note {
          font-family: 'Montserrat', sans-serif; font-weight: 400;
          font-size: clamp(17px, 1.6vw, 24px); line-height: 1.4;
          color: rgba(0,0,0,0.5); max-width: 30ch;
        }
        .cf-error { font-family: 'Montserrat', sans-serif; font-size: 14px; color: rgb(217,44,43); margin-top: 10px; }
        .cf-submit {
          display: inline-flex; align-items: center; gap: 40px;
          background: rgb(0,0,0); color: rgb(255,255,255);
          border: none; border-radius: 4px; cursor: pointer;
          padding: 16px 16px 16px 64px;
          font-family: 'Montserrat', sans-serif; font-weight: 500;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 150ms;
        }
        .cf-submit:hover { background: rgb(217,44,43); }
        .cf-submit:disabled { opacity: 0.55; cursor: default; }
        .cf-submit-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.14);
          display: inline-flex; align-items: center; justify-content: center;
          transition: transform 250ms cubic-bezier(0.22,1,0.36,1);
        }
        .cf-submit:hover .cf-submit-icon { transform: translateX(3px); }

        .cf-thanks { font-family: 'Montserrat', sans-serif; font-size: clamp(22px, 2.3vw, 34px); line-height: 1.3; color: rgb(30,30,30); max-width: 32ch; }
        .cf-thanks em { font-style: normal; font-family: 'Neuton', serif; color: rgb(217,44,43); }

        @media (max-width: 768px) {
          .cf-line { flex-direction: column; align-items: stretch; }
          .cf-line > span { white-space: normal; padding-bottom: 0; }
          .cf-input, .cf-input.name { flex: 1 1 auto; width: 100%; padding-left: 0; }
          .cf-submit { width: 100%; justify-content: space-between; padding-left: 24px; }
        }
      `}</style>

      <h2 id="cf-title" className="cf-title">Hai să vorbim</h2>

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
    </section>
  )
}
