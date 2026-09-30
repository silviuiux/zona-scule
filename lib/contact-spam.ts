// Heuristics for the contact form's bot traffic. The bots seen so far fill
// every field with random mixed-case letters ("rzkKZNScDVykpzJSt") and use
// dotted Gmail aliases ("on.od.o.le.ma.j.3.80@gmail.com"); none of that reads
// like a person writing in Romanian or English.

/** A single space-free run of letters that flips case over and over. */
export function looksRandom(value: string | undefined | null): boolean {
  const s = (value ?? '').trim()
  if (s.length < 10 || /\s/.test(s) || !/^[A-Za-z]+$/.test(s)) return false
  const flips = (s.match(/[a-z][A-Z]|[A-Z][a-z]/g) ?? []).length
  return flips >= 5
}

/** Gmail local part chopped into many dotted fragments. */
export function looksDottedAlias(email: string | undefined | null): boolean {
  const [local, domain] = (email ?? '').toLowerCase().split('@')
  if (!local || domain !== 'gmail.com') return false
  return (local.match(/\./g) ?? []).length >= 4
}

/** True when a submission has the bot fingerprint (two or more signals). */
export function isLikelySpam(input: { nume?: string; email?: string; companie?: string; produs?: string; mesaj?: string }): boolean {
  const signals = [
    looksRandom(input.nume),
    looksRandom(input.companie),
    looksRandom(input.produs),
    looksRandom(input.mesaj),
    looksDottedAlias(input.email),
  ].filter(Boolean).length
  return signals >= 2
}
