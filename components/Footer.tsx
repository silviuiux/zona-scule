import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <style>{`
        .footer { background: rgb(255,255,255); border-top: 1px solid rgba(0,0,0,0.08); }
        .footer-social {
          padding: 28px 12px; max-width: 1440px; margin: 0 auto;
          display: flex; align-items: center; gap: 0;
          justify-content: space-around;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .footer-social a {
          color: rgba(0,0,0,0.55);
          text-decoration: none;
          display: flex; align-items: center; justify-content: center;
          padding: 8px;
          transition: color 150ms;
        }
        .footer-social a:hover { color: rgb(0,0,0); }
        .footer-grid {
          max-width: 1440px; margin: 0 auto;
          padding: 48px 12px;
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;
        }
        .footer-col-title {
          font-family: var(--font-inter), sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgb(0,0,0); margin-bottom: 14px;
        }
        .footer-link {
          font-family: var(--font-recursive), sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.62);
          text-decoration: none; display: block; margin-bottom: 8px;
        }
        a.footer-link:hover { color: rgb(0,0,0); }
        .footer-bottom {
          border-top: 1px solid rgba(0,0,0,0.08); padding: 14px 12px;
          max-width: 1440px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-bottom span, .footer-bottom a {
          font-family: var(--font-recursive), sans-serif;
          font-size: 11px; color: rgba(0,0,0,0.5); text-decoration: none;
        }
        .footer-bottom a { color: rgb(217, 44, 43); }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; gap: 32px; padding: 36px 16px; }
          .footer-bottom { flex-direction: column; gap: 6px; text-align: center; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-social">
          <a href="https://facebook.com/zonascule" aria-label="Facebook" rel="noopener">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="https://instagram.com/zonascule" aria-label="Instagram" rel="noopener">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="https://youtube.com/@zonascule" aria-label="YouTube" rel="noopener">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
          </a>
          <a href="mailto:contact@zonascule.ro" aria-label="Email">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
          <a href="tel:0248222298" aria-label="Telefon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          </a>
        </div>
        <div className="footer-grid">
          <p style={{ fontFamily: 'var(--font-recursive), sans-serif', fontSize: '13px', color: 'rgba(0,0,0,0.62)', lineHeight: 1.7, maxWidth: '300px' }}>
            Technology Production SRL (Zona Scule) este distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.
          </p>
          <nav aria-label="Informatii">
            <p className="footer-col-title">INFORMATII</p>
            <Link href="/termeni" className="footer-link">Termene si conditii</Link>
            <Link href="/retur" className="footer-link">Politica de retur</Link>
            <a href="https://www.e-licitatie.ro" className="footer-link" rel="noopener" target="_blank">Achizitii S.E.A.P.</a>
            <a href="https://anpc.ro/ce-este-sal/" className="footer-link" rel="noopener" target="_blank">ANPC SAL</a>
          </nav>
          <div>
            <p className="footer-col-title">CONTACT</p>
            <a href="tel:0248222298" className="footer-link">0248.222.298</a>
            <a href="mailto:contact@zonascule.ro" className="footer-link">contact@zonascule.ro</a>
            <p className="footer-link">Sfanta Vineri 28, Pitesti</p>
            <p style={{ fontFamily: 'var(--font-recursive), monospace', fontSize: '11px', color: 'rgba(0,0,0,0.5)' }}>CIF / VAT: RO 6796092</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>ZONA SCULE : Technology Promotion SRL</span>
          <a href="https://x.com/silviux" rel="noopener">silviuX</a>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </>
  )
}
