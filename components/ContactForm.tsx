"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitContactMessage, type ContactFormState } from "@/lib/data/contact";

const initialState: ContactFormState = { status: "idle" };

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  const sku = searchParams.get("sku") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const model = searchParams.get("model") ?? "";
  const hasProductContext = Boolean(sku || brand || model);

  const [produs, setProdus] = useState("");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    if (!hasProductContext) return;
    setProdus([brand, model].filter(Boolean).join(" — "));
    setMesaj(
      `Solicit o ofertă pentru: ${[brand, model].filter(Boolean).join(" ")}${
        sku ? ` (SKU: ${sku})` : ""
      }.`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProductContext]);

  if (state.status === "success") {
    return (
      <div className="border border-border bg-surface px-8 py-12 text-center">
        <p className="label mb-3 text-red">Mesaj trimis</p>
        <p className="font-display text-2xl text-ink md:text-3xl">{state.message}</p>
        <p className="mt-3 text-sm text-text-muted">Te contactăm cât mai rapid posibil.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.status === "error" && (
        <p className="border border-red bg-red/5 px-4 py-3 text-sm text-red">{state.message}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nume *" name="nume" required />
        <Field label="Email *" name="email" type="email" required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Telefon" name="telefon" type="tel" />
        <Field label="Companie" name="companie" />
      </div>

      <Field
        label="Produs de interes"
        name="produs"
        value={produs}
        onChange={(e) => setProdus(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <label className="label text-text-faint" htmlFor="mesaj">
          Mesaj *
        </label>
        <textarea
          id="mesaj"
          name="mesaj"
          required
          rows={5}
          value={mesaj}
          onChange={(e) => setMesaj(e.target.value)}
          className="border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-red px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-red-hover disabled:opacity-50"
      >
        {pending ? "Se trimite…" : "Trimite mesajul"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label text-text-faint" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
      />
    </div>
  );
}
