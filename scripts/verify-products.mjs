/**
 * verify-products.mjs
 *
 * Auditează și verifică corectitudinea datelor de produs din Supabase față de
 * site-ul producătorului. Procesează produsele în batch-uri și generează un
 * raport detaliat.
 *
 * Clasificare automată (fără apeluri web):
 *   SEARCH_URL    — manufacturer_url conține "cautare-rezultate" → niciodată îmbogățit corect
 *   REAL_NO_SPECS — URL real dar st1_label lipsă → extracție parțială
 *   REAL_WITH_DATA — URL real + specs → de verificat (posibilă cross-contamination)
 *   NO_DATA       — fără URL și fără descriere → complet neîmbogățit
 *
 * Verificare completă (pentru REAL_WITH_DATA):
 *   - Fetch pagina producătorului
 *   - Claude compară specs din DB cu conținutul paginii
 *   - Scor de încredere 0–100 per produs
 *   - Dacă scorul < MIN_CONFIDENCE → marcat ca WRONG în raport
 *
 * Usage:
 *   node --env-file=.env.local scripts/verify-products.mjs
 *   node --env-file=.env.local scripts/verify-products.mjs --brand Karcher
 *   node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --limit 100
 *   node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --sample 50
 *   node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --resume
 *   node --env-file=.env.local scripts/verify-products.mjs --sku "1.528-133.0"
 *   node --env-file=.env.local scripts/verify-products.mjs --audit-only
 *
 * Output:
 *   logs/verify-report-<brand>-<timestamp>.json  — raport detaliat
 *   logs/to-fix-<brand>-<timestamp>.csv          — lista SKU-urilor de re-îmbogățit
 *   logs/verify-summary-<brand>-<timestamp>.txt  — sumar text
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Lipsesc variabilele SUPABASE din .env.local')
  process.exit(1)
}
if (!ANTHROPIC_KEY) {
  console.error('❌ Lipsește ANTHROPIC_API_KEY din .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

// Scorul minim de încredere sub care produsul este marcat ca greșit
const MIN_CONFIDENCE = 70

// Delay între cereri pentru a evita rate limiting
const DELAY_MS = 1500

// Batch size pentru paginarea din Supabase
const DB_BATCH_SIZE = 200

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const brandArg  = args.includes('--brand')      ? args[args.indexOf('--brand') + 1]  : null
const limitArg  = args.includes('--limit')      ? parseInt(args[args.indexOf('--limit') + 1])  : null
const sampleArg = args.includes('--sample')     ? parseInt(args[args.indexOf('--sample') + 1]) : null
const skuArg    = args.includes('--sku')        ? args[args.indexOf('--sku') + 1]     : null
const resumeMode    = args.includes('--resume')
const auditOnly     = args.includes('--audit-only')
const resetWrong    = args.includes('--reset-wrong')   // șterge datele greșite din DB

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

function cleanHtml(html, maxChars = 5000) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars)
}

/**
 * Clasifică un produs pe baza datelor din DB, fără apeluri web.
 * Returnează: 'SEARCH_URL' | 'REAL_NO_SPECS' | 'REAL_WITH_DATA' | 'NO_DATA'
 */
function classifyProduct(product) {
  const url = product.manufacturer_url || ''
  const hasSearchUrl = url.includes('cautare-rezultate') || url.includes('/search') || url === ''
  const hasRealUrl = url.length > 0 && !hasSearchUrl
  const hasSpecs = !!(product.st1_label || product.st1_value)
  const hasDescription = !!(product.short_description)

  if (hasRealUrl && hasSpecs) return 'REAL_WITH_DATA'
  if (hasRealUrl && !hasSpecs) return 'REAL_NO_SPECS'
  if (url.includes('cautare-rezultate')) return 'SEARCH_URL'
  return 'NO_DATA'
}

/**
 * Fetch pagina producătorului cu timeout și retry.
 */
async function fetchPage(url, attempt = 1) {
  // Normalizează URL-ul relativ (Karcher folosește uneori căi relative)
  let fullUrl = url
  if (url.startsWith('/')) {
    fullUrl = 'https://www.kaercher.com' + url
  }
  if (!fullUrl.startsWith('http')) {
    return null
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(fullUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        'Referer': 'https://www.kaercher.com/ro/',
      }
    })

    clearTimeout(timeout)

    if (!res.ok) {
      if (res.status === 404) return { status: 404, html: null }
      if (res.status === 429 && attempt < 3) {
        console.log(`    ⏳ Rate limited, aștept 10s...`)
        await sleep(10000)
        return fetchPage(url, attempt + 1)
      }
      return { status: res.status, html: null }
    }

    const html = await res.text()
    return { status: 200, html, url: fullUrl }

  } catch (e) {
    if (attempt < 2) {
      await sleep(3000)
      return fetchPage(url, attempt + 1)
    }
    return { status: 0, html: null, error: e.message }
  }
}

/**
 * Verifică cu Claude dacă datele din DB corespund paginii producătorului.
 * Returnează: { confidence: 0-100, issues: string[], verdict: 'OK'|'WRONG'|'UNCERTAIN', reasoning: string }
 */
async function verifyWithClaude(product, pageText) {
  const dbData = {
    sku: product.sku,
    name: product.name,
    short_description: product.short_description,
    st1: product.st1_label ? `${product.st1_label}: ${product.st1_value}` : null,
    st2: product.st2_label ? `${product.st2_label}: ${product.st2_value}` : null,
    st3: product.st3_label ? `${product.st3_label}: ${product.st3_value}` : null,
    c1: product.c1_title || null,
    c2: product.c2_title || null,
    c3: product.c3_title || null,
  }

  const cleanPage = cleanHtml(pageText, 6000)

  const prompt = `Ești un expert în verificarea calității datelor de produs industrial.

DATELE DIN BAZA DE DATE pentru produsul cu SKU "${product.sku}":
${JSON.stringify(dbData, null, 2)}

CONȚINUTUL PAGINII PRODUCĂTORULUI:
${cleanPage}

Sarcina ta:
1. Verifică dacă pagina este CHIAR pentru produsul cu SKU "${product.sku}" (nu alt produs)
2. Verifică dacă descrierea scurtă din DB corespunde cu ce descrie pagina
3. Verifică dacă specificațiile tehnice (st1/st2/st3) sunt corecte și prezente în pagină
4. Identifică orice date incorecte, lipsă sau de la alt produs

Returnează DOAR JSON valid:
{
  "confidence": <0-100, cât de corect este tot ce e în DB față de pagină>,
  "sku_match": <true/false, SKU-ul apare în conținutul paginii>,
  "description_ok": <true/false/null>,
  "specs_ok": <true/false/null>,
  "issues": ["<problemă 1>", "<problemă 2>"],
  "verdict": "<OK|WRONG|UNCERTAIN>",
  "reasoning": "<explicație scurtă max 150 caractere>"
}

Reguli pentru verdict:
- OK: confidence >= 80, sku_match true, datele par corecte
- WRONG: sku_match false SAU datele sunt clar de la alt produs SAU confidence < 50
- UNCERTAIN: confidence 50-79 sau lipsesc date pentru a decide`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const result = JSON.parse(jsonMatch[0])
    return result

  } catch (e) {
    return {
      confidence: -1,
      verdict: 'ERROR',
      issues: [`Eroare Claude: ${e.message}`],
      reasoning: 'Verificarea a eșuat',
    }
  }
}

/**
 * Resetează datele unui produs greșit în Supabase (pentru re-îmbogățire ulterioară).
 */
async function resetProductData(productId) {
  const { error } = await supabase
    .from('products')
    .update({
      manufacturer_url: null,
      short_description: null,
      st1_label: null, st1_value: null, st1_details: null,
      st2_label: null, st2_value: null, st2_details: null,
      st3_label: null, st3_value: null, st3_details: null,
      c1_title: null, c1_details: null,
      c2_title: null, c2_details: null,
      c3_title: null, c3_details: null,
      app_01_title: null, app_01_details: null,
      app_02_title: null, app_02_details: null,
      app_03_title: null, app_03_details: null,
    })
    .eq('id', productId)

  return !error
}

// ── Fetch all products from Supabase ──────────────────────────────────────────

async function fetchAllProducts() {
  const allProducts = []
  let from = 0

  while (true) {
    let query = supabase
      .from('products')
      .select('id, sku, name, manufacturer_url, short_description, st1_label, st1_value, st2_label, st2_value, st3_label, st3_value, c1_title, c2_title, c3_title, brand_name, category_text, subcategory_text')
      .not('sku', 'is', null)
      .order('name')
      .range(from, from + DB_BATCH_SIZE - 1)

    if (skuArg) {
      query = supabase
        .from('products')
        .select('id, sku, name, manufacturer_url, short_description, st1_label, st1_value, st2_label, st2_value, st3_label, st3_value, c1_title, c2_title, c3_title, brand_name, category_text, subcategory_text')
        .eq('sku', skuArg)
    } else if (brandArg) {
      query = supabase
        .from('products')
        .select('id, sku, name, manufacturer_url, short_description, st1_label, st1_value, st2_label, st2_value, st3_label, st3_value, c1_title, c2_title, c3_title, brand_name, category_text, subcategory_text')
        .eq('brand_name', brandArg)
        .not('sku', 'is', null)
        .order('name')
        .range(from, from + DB_BATCH_SIZE - 1)
    }

    const { data, error } = await query
    if (error) throw error
    if (!data || data.length === 0) break

    allProducts.push(...data)

    if (skuArg || data.length < DB_BATCH_SIZE) break
    from += DB_BATCH_SIZE
  }

  return allProducts
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now()
  const brandLabel = brandArg || 'ALL'
  const ts = timestamp()

  console.log('\n🔍 Product Verification Script')
  console.log(`Brand: ${brandLabel} | Audit-only: ${auditOnly} | Resume: ${resumeMode} | Reset-wrong: ${resetWrong}`)
  console.log(`Confidence threshold: ${MIN_CONFIDENCE}/100\n`)

  // ── 1. Fetch products ─────────────────────────────────────────────────────

  console.log('📥 Citesc produsele din Supabase...')
  let products = await fetchAllProducts()
  console.log(`   → ${products.length} produse găsite`)

  if (products.length === 0) {
    console.log('⚠ Niciun produs de procesat.')
    process.exit(0)
  }

  // ── 2. Clasificare rapidă ─────────────────────────────────────────────────

  console.log('\n📊 Clasificare automată...')
  const classified = {
    REAL_WITH_DATA: [],
    REAL_NO_SPECS: [],
    SEARCH_URL: [],
    NO_DATA: [],
  }

  for (const p of products) {
    const cat = classifyProduct(p)
    classified[cat].push(p)
  }

  console.log(`   ✓ URL real + specs (de verificat): ${classified.REAL_WITH_DATA.length}`)
  console.log(`   ⚠ URL real, fără specs:            ${classified.REAL_NO_SPECS.length}`)
  console.log(`   ✗ URL de search (eșuat):           ${classified.SEARCH_URL.length}`)
  console.log(`   — Fără date:                       ${classified.NO_DATA.length}`)

  if (auditOnly) {
    console.log('\n[--audit-only] Oprire după clasificare.')
    await writeReports(brandLabel, ts, classified, [], startTime)
    return
  }

  // ── 3. Selectează produsele de verificat ──────────────────────────────────

  let toVerify = classified.REAL_WITH_DATA

  if (sampleArg) {
    // Eșantion aleatoriu
    const shuffled = [...toVerify].sort(() => Math.random() - 0.5)
    toVerify = shuffled.slice(0, sampleArg)
    console.log(`\n🎲 Sampling: ${toVerify.length} produse alese random din ${classified.REAL_WITH_DATA.length}`)
  } else if (limitArg) {
    toVerify = toVerify.slice(0, limitArg)
    console.log(`\n🔢 Limit: primele ${toVerify.length} produse`)
  }

  if (toVerify.length === 0) {
    console.log('\n✅ Nu există produse REAL_WITH_DATA de verificat.')
    await writeReports(brandLabel, ts, classified, [], startTime)
    return
  }

  // ── 4. Verificare completă ────────────────────────────────────────────────

  console.log(`\n🔬 Verificare completă: ${toVerify.length} produse...\n`)

  const verificationResults = []
  let okCount = 0, wrongCount = 0, uncertainCount = 0, errorCount = 0, notFoundCount = 0

  for (let i = 0; i < toVerify.length; i++) {
    const p = toVerify[i]
    const progress = `[${i + 1}/${toVerify.length}]`

    process.stdout.write(`${progress} ${p.sku} — ${p.name?.slice(0, 50)}\n`)

    // Fetch pagina
    const pageResult = await fetchPage(p.manufacturer_url)

    if (!pageResult || !pageResult.html) {
      const status = pageResult?.status || 0
      console.log(`  ⚠ Pagina inaccesibilă (HTTP ${status})`)
      verificationResults.push({
        sku: p.sku,
        name: p.name,
        manufacturer_url: p.manufacturer_url,
        category: p.category_text,
        subcategory: p.subcategory_text,
        classification: 'REAL_WITH_DATA',
        verdict: 'PAGE_NOT_FOUND',
        confidence: 0,
        issues: [`HTTP ${status}`],
        reasoning: 'Pagina nu a putut fi accesată',
        reset_done: false,
      })
      notFoundCount++
      await sleep(DELAY_MS)
      continue
    }

    console.log(`  ✓ Pagina găsită (${pageResult.html.length} chars)`)

    // Verificare cu Claude
    const verification = await verifyWithClaude(p, pageResult.html)
    const verdictIcon = verification.verdict === 'OK' ? '✅' :
                        verification.verdict === 'WRONG' ? '❌' :
                        verification.verdict === 'UNCERTAIN' ? '🟡' : '⚠'

    console.log(`  ${verdictIcon} ${verification.verdict} (${verification.confidence}/100) — ${verification.reasoning}`)
    if (verification.issues?.length) {
      for (const issue of verification.issues) {
        console.log(`     • ${issue}`)
      }
    }

    // Reset opțional pentru produsele greșite
    let resetDone = false
    if (resetWrong && verification.verdict === 'WRONG') {
      resetDone = await resetProductData(p.id)
      console.log(`  ${resetDone ? '🗑 Date resetate pentru re-îmbogățire' : '✗ Reset eșuat'}`)
    }

    verificationResults.push({
      sku: p.sku,
      name: p.name,
      manufacturer_url: p.manufacturer_url,
      category: p.category_text,
      subcategory: p.subcategory_text,
      classification: 'REAL_WITH_DATA',
      verdict: verification.verdict,
      confidence: verification.confidence,
      sku_match: verification.sku_match,
      description_ok: verification.description_ok,
      specs_ok: verification.specs_ok,
      issues: verification.issues || [],
      reasoning: verification.reasoning,
      reset_done: resetDone,
    })

    if (verification.verdict === 'OK') okCount++
    else if (verification.verdict === 'WRONG') wrongCount++
    else if (verification.verdict === 'UNCERTAIN') uncertainCount++
    else errorCount++

    await sleep(DELAY_MS)
  }

  // ── 5. Rapoarte ───────────────────────────────────────────────────────────

  await writeReports(brandLabel, ts, classified, verificationResults, startTime, {
    ok: okCount, wrong: wrongCount, uncertain: uncertainCount,
    error: errorCount, notFound: notFoundCount, total: toVerify.length,
  })
}

// ── Write reports ─────────────────────────────────────────────────────────────

async function writeReports(brandLabel, ts, classified, verificationResults, startTime, stats) {
  const logsDir = 'logs'
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir)

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  // JSON complet
  const reportPath = path.join(logsDir, `verify-report-${brandLabel}-${ts}.json`)
  const report = {
    meta: {
      brand: brandLabel,
      timestamp: ts,
      elapsed_seconds: parseFloat(elapsed),
      min_confidence_threshold: MIN_CONFIDENCE,
    },
    summary: {
      total_products: Object.values(classified).flat().length,
      by_classification: {
        REAL_WITH_DATA: classified.REAL_WITH_DATA?.length || 0,
        REAL_NO_SPECS: classified.REAL_NO_SPECS?.length || 0,
        SEARCH_URL: classified.SEARCH_URL?.length || 0,
        NO_DATA: classified.NO_DATA?.length || 0,
      },
      verification: stats || null,
    },
    needs_re_enrichment: [
      ...classified.SEARCH_URL.map(p => ({ sku: p.sku, name: p.name, reason: 'SEARCH_URL', manufacturer_url: p.manufacturer_url })),
      ...classified.REAL_NO_SPECS.map(p => ({ sku: p.sku, name: p.name, reason: 'REAL_NO_SPECS', manufacturer_url: p.manufacturer_url })),
      ...classified.NO_DATA.map(p => ({ sku: p.sku, name: p.name, reason: 'NO_DATA', manufacturer_url: p.manufacturer_url })),
      ...verificationResults.filter(r => r.verdict === 'WRONG').map(r => ({ sku: r.sku, name: r.name, reason: 'WRONG_DATA', manufacturer_url: r.manufacturer_url, confidence: r.confidence, issues: r.issues })),
    ],
    verification_details: verificationResults,
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Raport JSON: ${reportPath}`)

  // CSV pentru re-îmbogățire
  const csvPath = path.join(logsDir, `to-fix-${brandLabel}-${ts}.csv`)
  const csvLines = ['sku,name,reason,manufacturer_url,confidence,issues']
  for (const item of report.needs_re_enrichment) {
    const issues = (item.issues || []).join('; ').replace(/,/g, ' ')
    csvLines.push(`"${item.sku}","${(item.name || '').replace(/"/g, '""')}","${item.reason}","${item.manufacturer_url || ''}","${item.confidence || ''}","${issues}"`)
  }
  fs.writeFileSync(csvPath, csvLines.join('\n'))
  console.log(`📄 Lista de fix: ${csvPath}`)

  // Sumar text
  const summaryPath = path.join(logsDir, `verify-summary-${brandLabel}-${ts}.txt`)
  const lines = [
    `Verificare produse — ${brandLabel} — ${ts}`,
    '='.repeat(50),
    '',
    `Total produse:         ${report.summary.total_products}`,
    `Timp de procesare:     ${elapsed}s`,
    '',
    'CLASIFICARE AUTOMATĂ:',
    `  ✓ URL real + specs:  ${report.summary.by_classification.REAL_WITH_DATA}`,
    `  ⚠ URL real, fără sp: ${report.summary.by_classification.REAL_NO_SPECS}`,
    `  ✗ URL de search:     ${report.summary.by_classification.SEARCH_URL}`,
    `  — Fără date:         ${report.summary.by_classification.NO_DATA}`,
    '',
  ]

  if (stats) {
    lines.push(
      'VERIFICARE COMPLETĂ:',
      `  ✅ OK:               ${stats.ok}`,
      `  ❌ WRONG:            ${stats.wrong}`,
      `  🟡 UNCERTAIN:        ${stats.uncertain}`,
      `  ⚠ Pagina negăsită:  ${stats.notFound}`,
      `  Erori:               ${stats.error}`,
      '',
      `Rata de erori estimată: ${stats.total > 0 ? ((stats.wrong / stats.total) * 100).toFixed(1) : 0}%`,
      '',
    )
  }

  lines.push(
    `DE RE-ÎMBOGĂȚIT (total): ${report.needs_re_enrichment.length}`,
    '',
    'Urmărire comenzi:',
    `  # Re-îmbogățire pentru SEARCH_URL și NO_DATA:`,
    `  node --env-file=.env.local scripts/enrich-karcher.mjs --resume`,
    '',
    `  # Sau pt SKU-uri specifice din CSV:`,
    `  # node --env-file=.env.local scripts/enrich-karcher.mjs --sku "X.XXX-XXX.X"`,
  )

  fs.writeFileSync(summaryPath, lines.join('\n'))
  console.log(`📄 Sumar: ${summaryPath}`)

  // Print summary to console
  console.log('\n' + '─'.repeat(50))
  console.log('SUMAR FINAL')
  console.log('─'.repeat(50))
  console.log(`Total produse analizate:  ${report.summary.total_products}`)
  console.log(`De re-îmbogățit (total):  ${report.needs_re_enrichment.length}`)
  if (stats) {
    console.log(`\nDin cele ${stats.total} verificate complet:`)
    console.log(`  ✅ Corecte:    ${stats.ok} (${stats.total > 0 ? ((stats.ok/stats.total)*100).toFixed(0) : 0}%)`)
    console.log(`  ❌ Greșite:    ${stats.wrong} (${stats.total > 0 ? ((stats.wrong/stats.total)*100).toFixed(0) : 0}%)`)
    console.log(`  🟡 Incerte:    ${stats.uncertain} (${stats.total > 0 ? ((stats.uncertain/stats.total)*100).toFixed(0) : 0}%)`)
  }
  console.log(`\nTimp total: ${elapsed}s`)
}

main().catch(console.error)
