'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  getStoredConsent,
  saveConsent,
  OPEN_SETTINGS_EVENT,
} from '@/lib/cookie-consent'

// Cookie icon (chocolate-chip circle) — sits before the "Cookie-uri" label.
const CookieIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.6" />
    <circle cx="8.5" cy="10" r="1.1" fill="white" />
    <circle cx="13" cy="8.5" r="1" fill="white" />
    <circle cx="15.5" cy="13" r="1.1" fill="white" />
    <circle cx="10" cy="15" r="1" fill="white" />
  </svg>
)

// "Personalizează" is icon-only — two toggle tracks, standing in for
// the settings/preferences panel it opens.
const SettingsIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="7" x2="20" y2="7" />
    <circle cx="15" cy="7" r="2" fill="white" stroke="none" />
    <line x1="4" y1="17" x2="20" y2="17" />
    <circle cx="9" cy="17" r="2" fill="white" stroke="none" />
  </svg>
)

// EU-mandated cookie consent: nothing non-essential runs until the visitor
// chooses. A slim full-width bar at the bottom of the page (not a floating
// card) with three actions in a row — icon-only "Personalizează" (opens a
// small popover with the actual toggle), "Doar necesare", "Accept tot".
// The single real toggle (analytics — see AnalyticsGate.tsx for what it
// gates) lives in that popover. The footer's "Setări cookie-uri" link
// re-opens both the bar and the popover via OPEN_SETTINGS_EVENT.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reads localStorage, which doesn't exist during SSR — this must run
    // post-mount, so a one-time setState here (rather than a lazy useState
    // initializer) is what avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getStoredConsent()) setVisible(true)

    const onOpenSettings = () => {
      const current = getStoredConsent()
      setAnalytics(current?.analytics ?? false)
      setSettingsOpen(true)
      setVisible(true)
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpenSettings)
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpenSettings)
  }, [])

  // Click-outside closes the popover without dismissing the whole bar.
  useEffect(() => {
    if (!settingsOpen) return
    const onClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [settingsOpen])

  const close = useCallback(() => {
    setVisible(false)
    setSettingsOpen(false)
  }, [])

  const acceptAll = () => { saveConsent(true); close() }
  const rejectNonEssential = () => { saveConsent(false); close() }
  const savePreferences = () => { saveConsent(analytics); close() }

  if (!visible) return null

  return (
    <>
      <style>{`
        .cc-bar {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 10000;
          background: rgba(0,0,0,0.96);
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .cc-bar-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px;
        }
        .cc-text-row {
          display: flex; align-items: center; gap: 10px;
          min-width: 0;
        }
        .cc-icon { flex-shrink: 0; display: flex; }
        .cc-text {
          font-family: 'Recursive', sans-serif;
          font-size: 12.5px; line-height: 1.5;
          color: rgba(255,255,255,0.55);
        }
        .cc-text strong {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.9);
        }
        .cc-text a { color: rgba(255,255,255,0.85); text-decoration: underline; text-underline-offset: 2px; }
        .cc-text a:hover { color: rgb(237,90,89); }

        .cc-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .cc-btn {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 9px 16px;
          border-radius: 3px; border: 1px solid transparent;
          cursor: pointer; transition: background 150ms, border-color 150ms, color 150ms;
          white-space: nowrap;
        }
        .cc-btn-primary { background: rgb(217,44,43); color: rgb(255,255,255); }
        .cc-btn-primary:hover { background: rgb(190,35,34); }
        .cc-btn-secondary { background: transparent; color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.2); }
        .cc-btn-secondary:hover { border-color: rgba(255,255,255,0.5); color: rgb(255,255,255); }

        .cc-icon-btn {
          flex-shrink: 0;
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: 1px solid rgba(255,255,255,0.2);
          border-radius: 3px; cursor: pointer;
          transition: border-color 150ms, background 150ms;
        }
        .cc-icon-btn:hover, .cc-icon-btn[aria-expanded="true"] {
          border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.06);
        }

        .cc-settings-wrap { position: relative; flex-shrink: 0; }
        .cc-popover {
          position: absolute; right: 0; bottom: calc(100% + 10px);
          width: 320px;
          background: rgb(17,17,17);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          padding: 18px;
        }
        .cc-popover-title {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 12px;
        }
        .cc-prefs { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        .cc-pref-row {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 14px;
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
          font-size: 11.5px; line-height: 1.5;
          color: rgba(255,255,255,0.45);
        }
        .cc-switch {
          position: relative; flex-shrink: 0;
          width: 36px; height: 21px;
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
          width: 17px; height: 17px; border-radius: 50%;
          background: rgb(255,255,255);
          transition: transform 150ms;
        }
        .cc-switch.on::after { transform: translateX(15px); }
        .cc-popover-save {
          width: 100%; text-align: center;
        }

        @media (max-width: 860px) {
          .cc-bar-inner { flex-direction: column; align-items: flex-start; gap: 14px; }
          .cc-actions { width: 100%; justify-content: flex-end; }
        }
        @media (max-width: 480px) {
          .cc-actions { flex-wrap: wrap; justify-content: stretch; }
          .cc-btn { flex: 1; text-align: center; }
          .cc-popover { right: -24px; width: calc(100vw - 32px); }
        }
      `}</style>

      <div className="cc-bar" role="dialog" aria-modal="false" aria-label="Preferințe cookie-uri">
        <div className="cc-bar-inner">
          <div className="cc-text-row">
            <span className="cc-icon">{CookieIcon}</span>
            <p className="cc-text">
              <strong>Accepti cookies?</strong>{' — '}
              Unele cookie-uri sunt necesare. Cu voia ta tinem site-ul ca uns cu ajutorul
              cookie-urilor de analiza.{' '}
              <Link href="/politica-de-cookie-uri">Politica de cookie-uri</Link>.
            </p>
          </div>

          <div className="cc-actions">
            <div className="cc-settings-wrap" ref={settingsRef}>
              <button
                type="button"
                className="cc-icon-btn"
                aria-label="Personalizează preferințele de cookie-uri"
                aria-expanded={settingsOpen}
                onClick={() => setSettingsOpen(v => !v)}
              >
                {SettingsIcon}
              </button>

              {settingsOpen && (
                <div className="cc-popover">
                  <p className="cc-popover-title">Personalizează</p>
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
                  <button className="cc-btn cc-btn-secondary cc-popover-save" onClick={savePreferences}>
                    Salvează preferințele
                  </button>
                </div>
              )}
            </div>

            <button className="cc-btn cc-btn-secondary" onClick={rejectNonEssential}>Doar necesare</button>
            <button className="cc-btn cc-btn-primary" onClick={acceptAll}>Accept tot</button>
          </div>
        </div>
      </div>
    </>
  )
}
