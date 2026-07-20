'use client'

// Minimal GDPR/ePrivacy consent store — localStorage-backed, no cookie
// libraries. Only two real categories exist on this site today:
//   - necessary  : always on, can't be disabled (session/CSRF/etc.)
//   - analytics  : Vercel Web Analytics (the only non-essential tracker
//                  currently wired into the codebase — see AnalyticsGate)
// Add more categories here (and to CookieConsent.tsx) if the site ever
// grows real functional/marketing cookies — don't invent toggles for
// categories that don't do anything yet.

export type CookieConsent = {
  necessary: true
  analytics: boolean
  timestamp: number
}

const STORAGE_KEY = 'zs-cookie-consent'

export const CONSENT_EVENT = 'zs:cookie-consent-change'
export const OPEN_SETTINGS_EVENT = 'zs:open-cookie-settings'

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.analytics !== 'boolean') return null
    return { necessary: true, analytics: parsed.analytics, timestamp: parsed.timestamp ?? 0 }
  } catch {
    return null
  }
}

export function saveConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = { necessary: true, analytics, timestamp: Date.now() }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    window.dispatchEvent(new CustomEvent<CookieConsent>(CONSENT_EVENT, { detail: consent }))
  }
  return consent
}

export function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))
  }
}
