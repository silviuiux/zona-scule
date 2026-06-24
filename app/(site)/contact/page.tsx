import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
};

// Static-ish marketing copy + a client form — nothing here needs a DB hit,
// so no revalidate/dynamic export is needed at all; this page is as static
// as it gets short of the form's own client-side searchParams read.
export default function ContactPage() {
  return (
    <div>
      <section className="noise border-b border-border bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1600px]">
          <p className="label mb-4 text-red">Pitești, Argeș, România</p>
          <h1 className="font-display max-w-3xl text-4xl leading-[0.95] text-ink md:text-7xl">
            Hai să discutăm despre proiectul tău.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">
            Cere o ofertă, întreabă despre stoc sau programează o livrare —
            răspundem rapid, de obicei în aceeași zi lucrătoare.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-[1600px] gap-16 md:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-10">
            <div>
              <p className="label mb-3 text-text-faint">Email</p>
              <p className="text-lg text-ink">contact@zonascule.ro</p>
            </div>
            <div>
              <p className="label mb-3 text-text-faint">Telefon</p>
              <p className="text-lg text-ink">+40 700 000 000</p>
            </div>
            <div>
              <p className="label mb-3 text-text-faint">Adresă</p>
              <p className="text-lg text-ink">Pitești, Argeș, România</p>
            </div>
            <div>
              <p className="label mb-3 text-text-faint">Program</p>
              <p className="text-lg text-ink">Luni – Vineri, 09:00 – 18:00</p>
            </div>
          </div>

          <div className="border border-border bg-white p-6 md:p-10">
            <Suspense>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
