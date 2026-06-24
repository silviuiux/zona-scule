import Link from "next/link";
import SearchTrigger from "@/components/SearchTrigger";

const LINKS = [
  { href: "/produse", label: "Catalog" },
  { href: "/zona-solutii", label: "Zona Soluții" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-[1.6rem] tracking-tight text-ink">ZONA</span>
          <span className="font-display text-[1.6rem] tracking-tight text-red">SCULE</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label text-ink transition-colors hover:text-red"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <SearchTrigger />
          <Link
            href="/contact"
            className="hidden rounded-full bg-red px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-red-hover md:inline-block"
          >
            Cere ofertă
          </Link>
        </div>
      </div>
    </header>
  );
}
