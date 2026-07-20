'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { getStoredConsent, CONSENT_EVENT, type CookieConsent } from '@/lib/cookie-consent'

// Vercel Web Analytics is the only non-essential tracker in this codebase.
// It must not fire until the visitor has opted in via CookieConsent — this
// wrapper mounts it only once consent.analytics === true, and reacts live
// if the visitor changes their choice via the footer's cookie settings link.
export default function AnalyticsGate() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Reads localStorage, which doesn't exist during SSR — this must run
    // post-mount, so a one-time setState here (rather than a lazy useState
    // initializer) is what avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(getStoredConsent()?.analytics ?? false)

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsent>).detail
      setEnabled(Boolean(detail?.analytics))
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  if (!enabled) return null
  return <Analytics />
}
