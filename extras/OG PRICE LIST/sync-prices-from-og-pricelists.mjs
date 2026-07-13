/**
 * sync-prices-from-og-pricelists.mjs
 *
 * Sincronizează products.price din Supabase cu prețurile din listele de preț
 * ale furnizorilor (extras/OG PRICE LIST/*.csv). Match strict pe SKU
 * (products.sku === PDT_SUP_REF din CSV) — NU pe brand, pentru că fișierele
 * sunt grupate pe distribuitor/export, nu pe brandul real al produsului
 * (ex: fișierul "TOYA" conține și un produs cu brand_name="Vorel" în DB,
 * fișierul "NOVALIA" conține produse cu brand_name="PEDDINGHAUS" etc.).
 *
 * Reguli de business (stabilite 2026-07-12):
 *  1. Pentru fiecare SKU găsit într-un CSV, prețul e convertit în EUR
 *     (dacă ITEM_UNIT_CURRENCY === 'RON', împărțim la EUR_RATE; dacă e
 *     deja 'EUR', îl păstrăm) și SUPRASCRIE price-ul curent din DB.
 *  2. Pentru produsele care au deja un preț "real" în DB (adică diferit de
 *     1.00 — valoarea implicită/placeholder pe care o are 100% din produsele
 *     necotate, verificat 2026-07-12) și care NU apar în niciun CSV din
 *     OG PRICE LIST, presupunem că prețul existent e în RON (asta era
 *     convenția înainte de acest script — vezi "sorting order rules july
 *     11.md") și îl convertim în EUR împărțind la EUR_RATE ("legacy
 *     conversion"). În practică asta afectează aproape exclusiv Milwaukee,
 *     singurul brand cu prețuri reale înainte de acest script.
 *  3. Conflicte (același SKU apare în mai multe CSV-uri cu prețuri EUR
 *     diferite după conversie) NU sunt suprascrise silențios — se
 *     păstrează prima valoare întâlnită și tot conflictul e logat într-un
 *     CSV separat pentru verificare manuală.
 *
 * Setup (o singură dată):
 *   npm install csv-parse
 *
 * Usage:
 *   # Preview fără să scrie nimic în DB — arată exact ce s-ar schimba
 *   node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs --dry-run
 *
 *   # Rulare completă (live)
 *   node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs
 *
 *   # Testează doar pe un subset (primele N SKU-uri din CSV-uri, după parsare)
 *   node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs --dry-run --limit 50
 *
 *   # Sari peste pasul de "legacy conversion" (regula #2 de mai sus)
 *   node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs --skip-legacy
 *
 *   # Alt folder sursă / alt curs valutar (pentru re-rulări ulterioare)
 *   node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs --dir "extras/OG PRICE LIST" --rate 5.2337
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, basename } from 'path'

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
// Scrierile pe products.price sunt blocate de RLS pentru anon/authenticated
// (products are select-only pentru public) — e nevoie de service role key.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('✗ Lipsesc NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY.')
  console.error('  Rulează cu: node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs')
  console.error('  (SUPABASE_SERVICE_KEY trebuie să fie service_role key-ul din Supabase — anon key nu are voie să scrie pe products.)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const skipLegacy = args.includes('--skip-legacy')
const dirArg = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : 'extras/OG PRICE LIST'
const rateArg = args.includes('--rate') ? parseFloat(args[args.indexOf('--rate') + 1]) : 5.2337
const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : null
const concurrency = 10

const EUR_RATE = rateArg // 1 EUR = EUR_RATE RON
const PLACEHOLDER_PRICE = 1.0 // valoarea default pentru produse necotate

console.log(`💶 Sync prices from OG PRICE LIST → Supabase`)
console.log(`Mode: ${dryRun ? 'DRY RUN (nimic nu se scrie)' : 'LIVE'}`)
console.log(`Curs: 1 EUR = ${EUR_RATE} RON`)
console.log(`Director sursă: ${dirArg}`)
console.log(`Legacy conversion (RON→EUR pentru prețuri deja sincronizate, nematchuite): ${skipLegacy ? 'SKIP' : 'da'}\n`)

function round2(n) {
  return Math.round(n * 100) / 100
}

// ── 1. Citește toate CSV-urile din folder ───────────────────────────────────────

function loadCsvRows(dir) {
  if (!existsSync(dir)) {
    console.error(`✗ Nu găsesc directorul "${dir}". Rulează scriptul din rădăcina proiectului sau pasează --dir.`)
    process.exit(1)
  }
  const files = readdirSync(dir).filter(f => f.toLowerCase().endsWith('.csv'))
  if (files.length === 0) {
    console.error(`✗ Niciun .csv găsit în "${dir}".`)
    process.exit(1)
  }

  const allRows = []
  for (const file of files) {
    const raw = readFileSync(join(dir, file), 'utf8')
    const records = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    })
    console.log(`  📄 ${file}: ${records.length} rânduri`)
    for (const r of records) allRows.push({ ...r, __file: file })
  }
  return allRows
}

// ── 2. Construiește map SKU → preț EUR, cu detecție de conflicte ───────────────

function buildPriceMap(rows) {
  const map = new Map() // sku -> { priceEur, sourceFile, priceOrig, currency }
  const conflicts = []
  let skippedNoSku = 0
  let skippedBadPrice = 0
  let skippedUnknownCurrency = 0

  for (const row of rows) {
    const sku = (row.PDT_SUP_REF ?? row.ITEM_SUP_REF ?? '').toString().trim()
    if (!sku) { skippedNoSku++; continue }

    const priceRaw = parseFloat(row.ITEM_PUBLIC_PRICE)
    if (!Number.isFinite(priceRaw) || priceRaw <= 0) { skippedBadPrice++; continue }

    const currency = (row.ITEM_UNIT_CURRENCY ?? '').toString().trim().toUpperCase()
    let priceEur
    if (currency === 'EUR') priceEur = priceRaw
    else if (currency === 'RON') priceEur = priceRaw / EUR_RATE
    else { skippedUnknownCurrency++; continue }

    priceEur = round2(priceEur)

    const existing = map.get(sku)
    if (existing) {
      if (Math.abs(existing.priceEur - priceEur) > 0.01) {
        conflicts.push({
          sku,
          file1: existing.sourceFile, price1_eur: existing.priceEur,
          file2: row.__file, price2_eur: priceEur,
        })
      }
      continue // primul preț întâlnit câștigă, indiferent de conflict
    }

    map.set(sku, { priceEur, sourceFile: row.__file, priceOrig: priceRaw, currency })
  }

  return { map, conflicts, skippedNoSku, skippedBadPrice, skippedUnknownCurrency }
}

// ── 3. Fetch produse din DB care matchează SKU-urile din CSV ───────────────────

async function fetchMatchingProducts(skus) {
  const products = []
  const chunkSize = 300
  for (let i = 0; i < skus.length; i += chunkSize) {
    const chunk = skus.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from('products')
      .select('id, sku, brand_name, name, price')
      .in('sku', chunk)
    if (error) throw error
    products.push(...data)
    process.stdout.write(`\r  🔎 Caut în DB: ${Math.min(i + chunkSize, skus.length)}/${skus.length} SKU-uri verificate`)
  }
  console.log()
  return products
}

// ── 4. Aplică update-uri cu concurență limitată ─────────────────────────────────

async function applyUpdates(updates) {
  let done = 0
  let errors = 0
  for (let i = 0; i < updates.length; i += concurrency) {
    const batch = updates.slice(i, i + concurrency)
    await Promise.all(batch.map(async u => {
      const { error } = await supabase.from('products').update({ price: u.newPrice }).eq('id', u.id)
      if (error) {
        errors++
        console.error(`\n  ✗ ${u.sku}: ${error.message}`)
      }
    }))
    done += batch.length
    process.stdout.write(`\r  💾 Update: ${done}/${updates.length}`)
  }
  console.log()
  return errors
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const rows = loadCsvRows(dirArg)
  console.log(`\nTotal rânduri parsate din toate CSV-urile: ${rows.length}`)

  const { map, conflicts, skippedNoSku, skippedBadPrice, skippedUnknownCurrency } = buildPriceMap(rows)
  console.log(`SKU-uri unice cu preț valid: ${map.size}`)
  console.log(`  (ignorate: ${skippedNoSku} fără SKU, ${skippedBadPrice} preț invalid, ${skippedUnknownCurrency} monedă necunoscută)`)
  if (conflicts.length > 0) {
    console.log(`⚠ ${conflicts.length} conflicte de preț (același SKU, prețuri EUR diferite în fișiere diferite) — a câștigat prima valoare întâlnită, restul logat.`)
  }

  let skus = [...map.keys()]
  if (limitArg) {
    skus = skus.slice(0, limitArg)
    console.log(`--limit ${limitArg}: procesăm doar primele ${skus.length} SKU-uri`)
  }

  console.log(`\n🔎 Caut produsele din DB care matchează aceste SKU-uri...`)
  const matched = await fetchMatchingProducts(skus)
  console.log(`Produse găsite în DB (match SKU): ${matched.length} din ${skus.length} SKU-uri căutate`)

  const matchedSkuSet = new Set(matched.map(p => p.sku))

  // Update-uri din CSV — suprascriem price-ul curent cu cel din listă
  const csvUpdates = []
  let unchanged = 0
  for (const p of matched) {
    const entry = map.get(p.sku)
    const newPrice = entry.priceEur
    const current = p.price === null ? null : parseFloat(p.price)
    if (current !== null && Math.abs(current - newPrice) < 0.005) { unchanged++; continue }
    csvUpdates.push({ id: p.id, sku: p.sku, name: p.name, brand: p.brand_name, oldPrice: current, newPrice, source: entry.sourceFile })
  }
  console.log(`\n📋 Din CSV: ${csvUpdates.length} produse de actualizat, ${unchanged} deja la zi.`)

  // Legacy conversion — produse cu preț "real" (≠ 1.00) deja în DB, nematchuite de niciun CSV
  let legacyUpdates = []
  if (!skipLegacy) {
    console.log(`\n🔎 Caut produse cu preț "real" (≠ ${PLACEHOLDER_PRICE}) deja în DB, nematchuite de niciun CSV (legacy RON→EUR)...`)
    const { data: pricedProducts, error } = await supabase
      .from('products')
      .select('id, sku, brand_name, name, price')
      .neq('price', PLACEHOLDER_PRICE)
    if (error) throw error

    legacyUpdates = pricedProducts
      .filter(p => !matchedSkuSet.has(p.sku))
      .map(p => {
        const current = parseFloat(p.price)
        const newPrice = round2(current / EUR_RATE)
        return { id: p.id, sku: p.sku, name: p.name, brand: p.brand_name, oldPrice: current, newPrice, source: 'legacy (RON→EUR)' }
      })
    console.log(`Legacy: ${legacyUpdates.length} produse de convertit RON→EUR (majoritatea Milwaukee, cel mai probabil).`)
  }

  const allUpdates = [...csvUpdates, ...legacyUpdates]

  // Preview
  console.log(`\n── Preview (primele 15) ──────────────────────────────`)
  for (const u of allUpdates.slice(0, 15)) {
    console.log(`  [${u.brand ?? '?'}] ${u.sku} — ${u.oldPrice ?? 'null'} → ${u.newPrice} EUR  (${u.source})`)
  }
  if (allUpdates.length > 15) console.log(`  ... și încă ${allUpdates.length - 15}`)

  console.log(`\n── Total de actualizat: ${allUpdates.length} produse ──`)

  // Scrie rapoarte
  const logsDir = 'logs'
  if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')

  if (conflicts.length > 0) {
    const conflictsPath = join(logsDir, `price-sync-conflicts-${ts}.csv`)
    const csvLines = ['sku,file1,price1_eur,file2,price2_eur']
    for (const c of conflicts) csvLines.push(`"${c.sku}","${c.file1}",${c.price1_eur},"${c.file2}",${c.price2_eur}`)
    writeFileSync(conflictsPath, csvLines.join('\n'))
    console.log(`\n⚠ Conflicte scrise în: ${conflictsPath}`)
  }

  const reportPath = join(logsDir, `price-sync-report-${ts}.json`)
  writeFileSync(reportPath, JSON.stringify({
    dryRun, rate: EUR_RATE, dir: dirArg, timestamp: ts,
    csvFilesParsed: [...new Set(rows.map(r => r.__file))],
    totalCsvRows: rows.length,
    uniqueSkusWithValidPrice: map.size,
    conflicts,
    matchedInDb: matched.length,
    csvUpdatesCount: csvUpdates.length,
    legacyUpdatesCount: legacyUpdates.length,
    unchanged,
    updates: allUpdates,
  }, null, 2))
  console.log(`📝 Raport complet scris în: ${reportPath}`)

  if (dryRun) {
    console.log(`\n✅ DRY RUN — nimic nu a fost scris în DB. Rulează fără --dry-run pentru a aplica schimbările.`)
    return
  }

  if (allUpdates.length === 0) {
    console.log(`\n✅ Nimic de actualizat.`)
    return
  }

  console.log(`\n💾 Scriu în DB...`)
  const errors = await applyUpdates(allUpdates)
  console.log(`\n✓ ${allUpdates.length - errors} produse actualizate cu succes${errors > 0 ? `, ${errors} erori (vezi mai sus)` : ''}.`)

  console.log(`\n🔄 Refresh product_listing_mv (ca /produse să vadă prețurile noi)...`)
  const { error: refreshError } = await supabase.rpc('refresh_product_listing')
  if (refreshError) {
    console.error(`✗ Refresh eșuat: ${refreshError.message}`)
    console.error(`  Rulează manual: select refresh_product_listing(); din Supabase SQL editor.`)
  } else {
    console.log(`✓ product_listing_mv actualizat.`)
  }
}

main().catch(err => {
  console.error('\n✗ Eroare fatală:', err)
  process.exit(1)
})
