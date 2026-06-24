import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl text-ink">ZONA</span>
              <span className="font-display text-2xl text-red">SCULE</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
              Distribuitor de unelte, scule electrice și consumabile industriale.
              Catalog complet, stoc verificat, livrare rapidă pentru profesioniști
              și ateliere.
            </p>
          </div>

          <div>
            <p className="label mb-4">Catalog</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/produse" className="text-ink-soft hover:text-red">Toate produsele</Link></li>
              <li><Link href="/zona-solutii" className="text-ink-soft hover:text-red">Zona Soluții</Link></li>
            </ul>
          </div>

          <div>
            <p className="label mb-4">Companie</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contact" className="text-ink-soft hover:text-red">Contact</Link></li>
              <li><Link href="/admin/login" className="text-ink-soft hover:text-red">Admin</Link></li>
            </ul>
          </div>

          <div>
            <p className="label mb-4">Contact</p>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <li>contact@zonascule.ro</li>
              <li>+40 700 000 000</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-text-faint md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Zona Scule. Toate drepturile rezervate.</p>
          <p>Unelte profesionale pentru fiecare meserie.</p>
        </div>
      </div>
    </footer>
  );
}
