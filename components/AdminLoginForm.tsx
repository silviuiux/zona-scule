'use client'
import { useActionState } from 'react'
import { loginAction, type LoginState } from '@/lib/auth-actions'

const initialState: LoginState = { status: 'idle' }

export default function AdminLoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <>
      <style>{`
        .al-form { display:flex; flex-direction:column; gap:18px; width:100%; }
        .al-field { display:flex; flex-direction:column; gap:7px; }
        .al-label {
          font-family:'Inter',sans-serif; font-size:10px; font-weight:600;
          letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.4);
        }
        .al-input {
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12);
          border-radius:4px; padding:12px 14px; font-size:14px; color:#e8e6e3;
          outline:none; font-family:'Inter',sans-serif; transition:border-color 150ms;
        }
        .al-input:focus { border-color:rgba(217,44,43,0.6); }
        .al-error {
          font-family:'Inter',sans-serif; font-size:13px; color:rgb(217,44,43);
          background:rgba(217,44,43,0.08); border:1px solid rgba(217,44,43,0.25);
          border-radius:4px; padding:10px 12px;
        }
        .al-submit {
          margin-top:4px; background:rgb(217,44,43); color:#fff; border:none;
          border-radius:4px; padding:13px; font-family:'Inter',sans-serif;
          font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
          cursor:pointer; transition:background 150ms;
        }
        .al-submit:hover { background:rgb(190,35,34); }
        .al-submit:disabled { opacity:0.5; cursor:default; }
      `}</style>
      <form action={formAction} className="al-form">
        <input type="hidden" name="next" value={next} />
        {state.status === 'error' && <p className="al-error">{state.message}</p>}
        <div className="al-field">
          <label className="al-label" htmlFor="username">Utilizator</label>
          <input id="username" name="username" type="text" required autoFocus className="al-input" />
        </div>
        <div className="al-field">
          <label className="al-label" htmlFor="password">Parolă</label>
          <input id="password" name="password" type="password" required className="al-input" />
        </div>
        <button type="submit" disabled={pending} className="al-submit">
          {pending ? 'Se conectează…' : 'Conectare'}
        </button>
      </form>
    </>
  )
}
