'use client'
import { useState, use } from 'react'

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
    email: '',
    telefon: '',
    companie: '',
    produs: prefilledProduct,
    mesaj: prefilledProduct
      ? `Buna ziua, doresc o oferta pentru: ${prefilledProduct}.`
      : '',
  })
  const [focused, setFocused] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <>
        <style>{`
          .cf-success {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 64px 32px;
            background: rgb(255,255,255);
            border: 1px solid rgba(0,0,0,0.08);
            text-align: center; gap: 12px;
          }
          .cf-success-title {
            font-family: 'Bungee', sans-serif;
            font-size: 32px; color: rgb(0,0,0);
          }
          .cf-success-sub {
            font-family: 'Recursive', sans-serif;
            font-size: 14px; color: rgba(0,0,0,0.5); line-height: 1.6;
          }
        `}</style>
        <div className="cf-success">
          <p className="cf-success-title">MESAJ TRIMIS!</p>
          <p className="cf-success-sub">Va contactam in cel mai scurt timp.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        .cf-wrap {
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          display: flex; flex-direction: column;
        }
        .cf-header {
          padding: 64px 32px 0;
          border-bottom: none;
        }
        .cf-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(28px, 3vw, 42px);
          line-height: 1; color: rgb(0,0,0);
          text-transform: uppercase; margin-bottom: 12px;
        }
        .cf-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.45);
          line-height: 1.6; max-width: 360px;
        }

        /* Fields */
        .cf-fields { flex: 1; padding: 64px 32px 0; }

        .cf-field {
          display: flex; align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          position: relative;
          transition: box-shadow 120ms;
        }
        .cf-field.cf-last { border-bottom: none; }
        .cf-field.cf-focused {
          box-shadow: inset 0 0 0 1px rgba(30,100,255,0.35);
        }

        .cf-field input,
        .cf-field textarea {
          flex: 1; min-width: 0;
          border: none; outline: none; background: transparent;
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgb(0,0,0);
          padding: 17px 0;
          resize: none;
        }
        .cf-field textarea { min-height: 88px; padding-top: 18px; }

        .cf-field input::placeholder,
        .cf-field textarea::placeholder { color: rgba(0,0,0,0.28); }

        /* Right label — only visible when field has a value */
        .cf-label {
          font-family: 'Recursive', sans-serif;
          font-size: 11px; color: rgba(0,0,0,0.3);
          white-space: nowrap; padding-left: 12px; flex-shrink: 0;
          pointer-events: none; opacity: 0; transition: opacity 120ms;
        }
        .cf-field input:not(:placeholder-shown) ~ .cf-label,
        .cf-field textarea:not(:placeholder-shown) ~ .cf-label { opacity: 1; }

        /* Red prefilled value (from PDP "cere oferta") */
        .cf-field.cf-prefilled input { color: rgb(217,44,43); }

        /* Footer / submit */
        .cf-footer { padding: 64px 32px 32px; }
        .cf-submit {
          width: 100%; padding: 18px;
          background: rgb(0,0,0); color: rgb(255,255,255);
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: background 150ms;
        }
        .cf-submit:hover { background: rgb(217,44,43); }

        @media (max-width: 768px) {
          .cf-header { padding: 40px 20px 0; }
          .cf-fields { padding: 40px 20px 0; }
          .cf-footer { padding: 40px 20px 32px; }
        }
      `}</style>

      <form className="cf-wrap" onSubmit={handleSubmit}>
        <div className="cf-header">
          <h2 className="cf-title">HAI SA VORBIM</h2>
          <p className="cf-sub">
            Completati formularul si va raspundem in cel mai scurt
            timp cu o oferta personalizata nevoilor dumneavoastra.
          </p>
        </div>

        <div className="cf-fields">
          <div className={`cf-field${focused === 'nume' ? ' cf-focused' : ''}`}>
            <input placeholder="nume" value={form.nume} onChange={set('nume')}
              onFocus={() => setFocused('nume')} onBlur={() => setFocused(null)} />
            <span className="cf-label">nume</span>
          </div>

          <div className={`cf-field${focused === 'email' ? ' cf-focused' : ''}`}>
            <input type="email" placeholder="email" value={form.email} onChange={set('email')}
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
            <span className="cf-label">email</span>
          </div>

          <div className={`cf-field${focused === 'telefon' ? ' cf-focused' : ''}`}>
            <input type="tel" placeholder="telefon" value={form.telefon} onChange={set('telefon')}
              onFocus={() => setFocused('telefon')} onBlur={() => setFocused(null)} />
            <span className="cf-label">telefon</span>
          </div>

          <div className={`cf-field${focused === 'companie' ? ' cf-focused' : ''}`}>
            <input placeholder="companie (optional)" value={form.companie} onChange={set('companie')}
              onFocus={() => setFocused('companie')} onBlur={() => setFocused(null)} />
            <span className="cf-label">companie</span>
          </div>

          <div className={`cf-field${focused === 'produs' ? ' cf-focused' : ''}${prefilledProduct ? ' cf-prefilled' : ''}`}>
            <input placeholder="produse de interes" value={form.produs} onChange={set('produs')}
              onFocus={() => setFocused('produs')} onBlur={() => setFocused(null)} />
            <span className="cf-label">produse de interes</span>
          </div>

          <div className={`cf-field cf-last${focused === 'mesaj' ? ' cf-focused' : ''}`}>
            <textarea
              placeholder="Descrieti produsele care va intereseaza, cantitatile dorite sau orice alt mesaj."
              value={form.mesaj} onChange={set('mesaj')}
              onFocus={() => setFocused('mesaj')} onBlur={() => setFocused(null)}
            />
            <span className="cf-label">mesaj</span>
          </div>
        </div>

        <div className="cf-footer">
          <button type="submit" className="cf-submit">Trimite mesajul</button>
        </div>
      </form>
    </>
  )
}
