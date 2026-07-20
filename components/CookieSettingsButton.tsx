'use client'

import { openCookieSettings } from '@/lib/cookie-consent'

// Small client island so server components (Footer, legal pages) can expose
// a "reopen cookie preferences" action without themselves becoming client
// components. `variant="footer"` matches the dark footer's .footer-link
// styling; `variant="inline"` is a red text-link for use inside light-bg
// prose (e.g. the cookie policy page).
export default function CookieSettingsButton({
  variant = 'footer',
}: {
  variant?: 'footer' | 'inline'
}) {
  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={openCookieSettings}
        style={{
          font: 'inherit',
          color: 'rgb(217,44,43)',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        Deschide preferințele de cookie-uri
      </button>
    )
  }

  return (
    <button type="button" className="footer-link footer-link-btn" onClick={openCookieSettings}>
      Setări cookie-uri
    </button>
  )
}
