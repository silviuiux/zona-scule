"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth-actions";

const initialState: LoginState = { status: "idle" };

export default function AdminLoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      {state.status === "error" && (
        <p className="border border-red bg-red/5 px-4 py-3 text-sm text-red">{state.message}</p>
      )}

      <div className="flex flex-col gap-2">
        <label className="label text-text-faint" htmlFor="username">
          Utilizator
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoFocus
          className="border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="label text-text-faint" htmlFor="password">
          Parolă
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-red px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-red-hover disabled:opacity-50"
      >
        {pending ? "Se conectează…" : "Conectare"}
      </button>
    </form>
  );
}
