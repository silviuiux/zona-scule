import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col items-start px-5 py-24 md:px-8">
      <p className="label mb-4 text-red">404</p>
      <h1 className="font-display mb-4 text-4xl text-ink md:text-5xl">
        Produsul nu a fost găsit.
      </h1>
      <p className="mb-8 max-w-md text-text-muted">
        Linkul poate fi vechi sau produsul a fost retras din catalog.
      </p>
      <Link
        href="/produse"
        className="rounded-full bg-red px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-red-hover"
      >
        Vezi catalogul
      </Link>
    </div>
  );
}
