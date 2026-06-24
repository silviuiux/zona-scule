import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata = { title: "Admin — Conectare" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const nextParam = params.next;
  const next = (typeof nextParam === "string" && nextParam) || "/admin";

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        <p className="label mb-2 text-red">Acces restricționat</p>
        <h1 className="font-display mb-8 text-3xl text-ink">Conectare admin</h1>
        <AdminLoginForm next={next} />
      </div>
    </div>
  );
}
