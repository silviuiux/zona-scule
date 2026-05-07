'use client'
import { useState, use } from 'react'

export default function ContactForm({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; brand?: string; model?: string }>
}) {
  const params = use(searchParams)

  // Pre-fill "Produse de interes" from PDP oferta button
  const prefilledProduct = [params.brand, params.model, params.sku]
    .filter(Boolean).join(' — ')

  const [form, setForm] = useState({
    nume: '',
    email: '',
    telefon: '',
    companie: '',
    produs: prefilledProduct,
    mesaj: prefilledProduct
      ? `Bună ziua, doresc o ofertă pentru: ${prefilledProduct}.`
      : '',
  })
  const [sent, setSent] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire to email service / Supabase
    setSent(true)
  }

  return (
    <>
      <style>{`
        .contact-form-wrap {
          padding: 0;
        }
        .contact-form {
          display: flex; flex-direction: column; gap: 16px;
        }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-label {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.5); font-weight: 500;
        }
        .form-input, .form-textarea {
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 3px; padding: 10px 12px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgb(0,0,0);
          outline: none; transition: border-color 150ms;
          width: 100%;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: rgba(0,0,0,0.3); }
        .form-input:focus, .form-textarea:focus { border-color: rgb(0,0,0); }
        .form-textarea { resize: vertical; min-height: 100px; }
        /* Prefilled highlight */
        .form-input.prefilled { border-color: rgba(217,44,43,0.3); background: rgba(217,44,43,0.02); }
        .form-submit {
          padding: 14px; background: rgb(0,0,0); color: rgb(255,255,255);
          border: none; border-radius: 3px;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: background 150ms;
          margin-top: 8px;
        }
        .form-submit:hover { background: rgb(217,44,43); }
        .form-success {
          padding: 24px; background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.3); border-radius: 4px;
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgb(22,163,74);
        }
        /* Prefilled notice */
        .prefill-notice {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(217,44,43,0.8);
          padding: 8px 12px;
          background: rgba(217,44,43,0.05);
          border: 1px solid rgba(217,44,43,0.15);
          border-radius: 3px; margin-bottom: 4px;
        }
      `}</style>

      <div className="contact-form-wrap">
        {sent ? (
          <div className="form-success">
            Mesajul tău a fost trimis! Te contactăm în cel mai scurt timp.
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            {prefilledProduct && (
              <div className="prefill-notice">
                Cerere ofertă pentru: <strong>{prefilledProduct}</strong>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Nume</label>
              <input className="form-input" placeholder="Nae Protopopitoricescoviki"
                value={form.nume} onChange={set('nume')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="nae.p@mail.com"
                  value={form.email} onChange={set('email')} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input className="form-input" type="tel" placeholder="0700 00 00 00"
                  value={form.telefon} onChange={set('telefon')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Companie</label>
              <input className="form-input" placeholder="ProtoAuto"
                value={form.companie} onChange={set('companie')} />
            </div>
            <div className="form-group">
              <label className="form-label">Produse de interes</label>
              <input
                className={`form-input${prefilledProduct ? ' prefilled' : ''}`}
                placeholder="Numele produsului sau categoria"
                value={form.produs} onChange={set('produs')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mesajul tau</label>
              <textarea className="form-textarea" placeholder="Descrie ce ai nevoie..."
                value={form.mesaj} onChange={set('mesaj')} />
            </div>
            <button type="submit" className="form-submit">Trimite mesajul</button>
          </form>
        )}
      </div>
    </>
  )
}
