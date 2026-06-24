import Link from "next/link";

// Top-level admin segment — deliberately outside app/(site), so it never
// gets the public Nav/Footer. Applies to both /admin/login (public) and
// /admin (protected) — the auth check itself lives one level deeper in
// app/admin/(protected)/layout.tsx so the login page isn't gated by itself.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-white px-6 py-4">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-lg tracking-tight text-ink">ZONA</span>
          <span className="font-display text-lg tracking-tight text-red">SCULE</span>
          <span className="label ml-2 text-text-faint">Admin</span>
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
