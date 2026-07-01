export default function Footer() {
  return (
    <>
      <style>{`
        .footer { background: rgb(255,255,255); border-top: 1px solid rgba(0,0,0,0.08); }
        .footer-grid {
          max-width: 1440px; margin: 0 auto;
          padding: 48px 12px;
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;
        }
        .footer-col-title {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgb(0,0,0); margin-bottom: 14px;
        }
        .footer-link {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5);
          text-decoration: none; display: block; margin-bottom: 8px;
        }
        .footer-link:hover { color: rgb(0,0,0); }
        .footer-bottom {
          border-top: 1px solid rgba(0,0,0,0.08); padding: 14px 12px;
          max-width: 1440px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-bottom span, .footer-bottom a {
          font-family: 'Recursive', sans-serif;
          font-size: 11px; color: rgba(0,0,0,0.35); text-decoration: none;
        }
        .footer-bottom a { color: rgb(217, 44, 43); }

        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; gap: 32px; padding: 36px 16px; }
          .footer-bottom { flex-direction: column; gap: 6px; text-align: center; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-grid">
          <p style={{ fontFamily: 'Recursive, sans-serif', fontSize: '13px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, maxWidth: '300px' }}>
            Technology Production SRL (Zona Scule) este distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.
          </p>
          <div>
            <p className="footer-col-title">INFORMATII</p>
            {['Termene si conditii', 'Politica de retur', 'Achizitii S.E.A.P.', 'ANPC SAL'].map(l => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>
          <div>
            <p className="footer-col-title">CONTACT</p>
            <a href="tel:0248222298" className="footer-link">0248.222.298</a>
            <a href="mailto:contact@zonascule.ro" className="footer-link">contact@zonascule.ro</a>
            <p className="footer-link">Sfanta Vineri 28, Pitesti</p>
            <p style={{ fontFamily: 'Recursive, monospace', fontSize: '11px', color: 'rgba(0,0,0,0.3)' }}>CIF / VAT: RO 6796092</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>ZONA SCULE : Technology Promotion SRL</span>
          <span>2026</span>
        </div>
      </footer>
    </>
  )
}
