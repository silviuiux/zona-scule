'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  getStoredConsent,
  saveConsent,
  OPEN_SETTINGS_EVENT,
} from '@/lib/cookie-consent'

// EU-mandated cookie consent: nothing non-essential runs until the visitor
// chooses. Three actions on the first-visit banner (accept all / necessary
// only / customize), plus a "customize" panel with a single real toggle
// (analytics — see AnalyticsGate.tsx for what that gates). The banner also
// re-opens from the footer's "Setări cookie-uri" link, via OPEN_SETTINGS_EVENT.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    // Reads localStorage, which doesn't exist during SSR — this must run
    // post-mount, so a one-time setState here (rather than a lazy useState
    // initializer) is what avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getStoredConsent()) setVisible(true)

    const onOpenSettings = () => {
      const current = getStoredConsent()
      setAnalytics(current?.analytics ?? false)
      setExpanded(true)
      setVisible(true)
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpenSettings)
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpenSettings)
  }, [])

  const close = useCallback(() => {
    setVisible(false)
    setExpanded(false)
  }, [])

  const acceptAll = () => { saveConsent(true); close() }
  const rejectNonEssential = () => { saveConsent(false); close() }
  const savePreferences = () => { saveConsent(analytics); close() }

  if (!visible) return null

  return (
    <>
      <style>{`
        .cc-wrap {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 10000;
          display: flex; justify-content: center;
          padding: 16px;
          pointer-events: none;
        }
        .cc-card {
          pointer-events: auto;
          width: 100%; max-width: 720px;
          background: rgb(17,17,17);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
          padding: 24px 26px;
        }
        .cc-title {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 10px;
        }
        .cc-title::before {
          content: ''; width: 5px; height: 5px;
          background: rgb(217,44,43); border-radius: 1px; flex-shrink: 0;
        }
        .cc-text {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; line-height: 1.6;
          color: rgba(255,255,255,0.55);
          margin-bottom: 18px;
          max-width: 560px;
        }
        .cc-text a { color: rgba(255,255,255,0.85); text-decoration: underline; text-underline-offset: 2px; }
        .cc-text a:hover { color: rgb(237,90,89); }

        .cc-actions { display: flex; flex-wrap: wrap; gap: 10px; }
        .cc-btn {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 10px 18px;
          border-radius: 3px; border: 1px solid transparent;
          cursor: pointer; transition: background 150ms, border-color 150ms, color 150ms;
        }
        .cc-btn-primary { background: rgb(217,44,43); color: rgb(255,255,255); }
        .cc-btn-primary:hover { background: rgb(190,35,34); }
        .cc-btn-secondary { background: transparent; color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.2); }
        .cc-btn-secondary:hover { border-color: rgba(255,255,255,0.5); color: rgb(255,255,255); }
        .cc-btn-ghost { background: transparent; color: rgba(255,255,255,0.5); }
        .cc-btn-ghost:hover { color: rgb(255,255,255); }

        .cc-prefs { margin: 4px 0 18px; display: flex; flex-direction: column; gap: 12px; }
        .cc-pref-row {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
        }
        .cc-pref-label {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-bottom: 4px;
        }
        .cc-pref-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; line-height: 1.5;
          color: rgba(255,255,255,0.45);
        }
        .cc-switch {
          position: relative; flex-shrink: 0;
          width: 38px; height: 22px;
          border-radius: 999px;
          border: none; cursor: pointer;
          background: rgba(255,255,255,0.15);
          transition: background 150ms;
        }
        .cc-switch.on { background: rgb(217,44,43); }
        .cc-switch.disabled { cursor: not-allowed; opacity: 0.6; }
        .cc-switch::after {
          content: '';
          position: absolute; top: 2px; left: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: rgb(255,255,255);
          transition: transform 150ms;
        }
        .cc-switch.on::after { transform: translateX(16px); }

        @media (max-width: 520px) {
          .cc-actions { flex-direction: column; }
          .cc-btn { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="cc-wrap" role="dialog" aria-modal="false" aria-label="Preferințe cookie-uri">
        <div className="cc-card">
          <p className="cc-title">Cookie-uri</p>
          <p className="cc-text">
            Folosim cookie-uri necesare pentru funcționarea site-ului și, doar cu acordul tău,
            cookie-uri de analiză (Vercel Analytics) pentru a înțelege cum este folosit site-ul.
            Detalii complete în{' '}
            <Link href="/politica-de-cookie-uri">Politica de cookie-uri</Link>.
          </p>

          {expanded && (
            <div className="cc-prefs">
              <div className="cc-pref-row">
                <div>
                  <p className="cc-pref-label">Necesare</p>
                  <p className="cc-pref-desc">Indispensabile pentru funcționarea de bază a site-ului. Nu pot fi dezactivate.</p>
                </div>
                <button className="cc-switch on disabled" disabled aria-label="Cookie-uri necesare — mereu active" />
              </div>
              <div className="cc-pref-row">
                <div>
                  <p className="cc-pref-label">Analiză (Vercel Analytics)</p>
                  <p className="cc-pref-desc">Statistici anonime de trafic, folosite doar pentru a îmbunătăți site-ul.</p>
                </div>
                <button
                  className={`cc-switch${analytics ? ' on' : ''}`}
                  onClick={() => setAnalytics(v => !v)}
                  aria-pressed={analytics}
                  aria-label="Cookie-uri de analiză"
                />
              </div>
            </div>
          )}

          <div className="cc-actions">
            <button className="cc-btn cc-btn-primary" onClick={acceptAll}>Accept tot</button>
            <button className="cc-btn cc-btn-secondary" onClick={rejectNonEssential}>Doar necesare</button>
            {expanded ? (
              <button className="cc-btn cc-btn-secondary" onClick={savePreferences}>Salvează preferințele</button>
            ) : (
              <button className="cc-btn cc-btn-ghost" onClick={() => setExpanded(true)}>Personalizează</button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
