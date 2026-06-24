"use server";

import { supabaseServer } from "@/lib/supabase/server";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

/**
 * Persists a contact form submission into `contact_messages`. Replaces the
 * previous cosmetic-only handler (REBUILD.md §3.5) with a real insert. Uses
 * the anon-key server client — RLS on `contact_messages` should allow
 * anonymous inserts but nothing else (see docs/migrations/0001_rebuild.sql).
 */
export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const nume = String(formData.get("nume") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const companie = String(formData.get("companie") || "").trim();
  const produs = String(formData.get("produs") || "").trim();
  const mesaj = String(formData.get("mesaj") || "").trim();

  if (!nume || !email || !mesaj) {
    return { status: "error", message: "Completează nume, email și mesaj." };
  }

  const { error } = await supabaseServer.from("contact_messages").insert({
    nume,
    email,
    telefon: telefon || null,
    companie: companie || null,
    produs: produs || null,
    mesaj,
  });

  if (error) {
    console.error("contact_messages insert failed", error);
    return {
      status: "error",
      message: "Nu am putut trimite mesajul. Încearcă din nou sau scrie-ne direct pe email.",
    };
  }

  return { status: "success", message: "Mesajul tău a fost trimis." };
}
