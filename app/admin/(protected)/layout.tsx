import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/auth";
import { logoutAction } from "@/lib/auth-actions";

// Authoritative auth check (full signature+expiry verification, Node
// runtime) — the actual security boundary for /admin. proxy.ts also gates
// this route, but per the "thin proxy" pattern that's a fast UX redirect,
// not something either layer relies on the other for.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await hasValidAdminSession();
  if (!authed) redirect("/admin/login");

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
        <p className="label text-text-faint">Panou de control</p>
        <form action={logoutAction}>
          <button type="submit" className="label text-ink transition-colors hover:text-red">
            Deconectare
          </button>
        </form>
      </div>
      <div className="flex-1 px-6 py-10">{children}</div>
    </div>
  );
}
