import AdminLoginForm from '@/components/AdminLoginForm'

export const metadata = { title: 'Admin — Conectare' }
export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const nextParam = params.next
  const next = (typeof nextParam === 'string' && nextParam) || '/admin'

  return (
    <>
      <style>{`
        .al-wrap {
          min-height:100vh; background:#0f0f11;
          display:flex; align-items:center; justify-content:center; padding:24px;
        }
        .al-card { width:100%; max-width:380px; }
        .al-logo {
          font-family:'Inter',sans-serif; font-size:13px; font-weight:700;
          letter-spacing:0.06em; text-transform:uppercase;
          color:rgba(255,255,255,0.5); margin-bottom:28px;
        }
        .al-logo span { color:rgb(217,44,43); }
        .al-eyebrow {
          font-family:'Inter',sans-serif; font-size:10px; font-weight:600;
          letter-spacing:0.12em; text-transform:uppercase;
          color:rgb(217,44,43); margin-bottom:8px;
        }
        .al-title {
          font-family:'Bungee',sans-serif; font-size:28px; color:#fff;
          text-transform:uppercase; line-height:1; margin-bottom:28px;
        }
      `}</style>
      <div className="al-wrap">
        <div className="al-card">
          <div className="al-logo"><span>ZONA SCULE</span> / Admin</div>
          <p className="al-eyebrow">Acces restricționat</p>
          <h1 className="al-title">Conectare</h1>
          <AdminLoginForm next={next} />
        </div>
      </div>
    </>
  )
}
