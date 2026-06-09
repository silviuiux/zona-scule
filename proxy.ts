import { NextRequest, NextResponse } from 'next/server'

/**
 * Protects /admin with HTTP Basic Auth (env: ADMIN_USER / ADMIN_PASS).
 * On success, sets the `zs_admin` httpOnly cookie so server components
 * (e.g. the PDP inline category editor) and mutating API routes can
 * verify admin status without re-prompting.
 *
 * Fails CLOSED: if the env vars are missing, /admin is unavailable.
 */

function expectedToken(): string | null {
  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASS
  if (!user || !pass) return null
  return Buffer.from(`${user}:${pass}`).toString('base64')
}

export function proxy(req: NextRequest) {
  const expected = expectedToken()
  if (!expected) {
    return new NextResponse('Admin indisponibil: ADMIN_USER / ADMIN_PASS nu sunt configurate.', { status: 503 })
  }

  if (req.cookies.get('zs_admin')?.value === expected) {
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization') ?? ''
  if (auth.startsWith('Basic ') && auth.slice(6) === expected) {
    const res = NextResponse.next()
    res.cookies.set('zs_admin', expected, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return res
  }

  return new NextResponse('Autentificare necesara.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Zona Scule Admin", charset="UTF-8"' },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}
