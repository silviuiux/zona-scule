import { cookies } from 'next/headers'

/**
 * Returns true when the request carries the admin cookie set by the
 * /admin Basic Auth middleware. Used to gate the PDP inline category
 * editor and every mutating server action / API route.
 */
export async function isAdmin(): Promise<boolean> {
  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASS
  if (!user || !pass) return false
  const expected = Buffer.from(`${user}:${pass}`).toString('base64')
  const jar = await cookies()
  return jar.get('zs_admin')?.value === expected
}
