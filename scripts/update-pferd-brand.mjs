// Update brand_name to "PFERD" for all products with slug containing "pferd-"
// Run with: node scripts/update-pferd-brand.mjs

const SUPABASE_URL = "https://dfbhgnbqwoinujnzfxsl.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYmhnbmJxd29pbnVqbnpmeHNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwOTE3NywiZXhwIjoyMDkzMjg1MTc3fQ.sR9i-GlmcCGqTsHCLyFR-6nceHPozdovORB5ZmxidmY";

const BATCH_SIZE = 50;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function fetchPage(offset) {
  const url = `${SUPABASE_URL}/rest/v1/products?slug=like.*pferd-*&select=id,slug,brand_name&limit=${BATCH_SIZE}&offset=${offset}&order=id.asc`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function updateBatch(ids) {
  // Build an "in" filter: id=in.(1,2,3,...)
  const idList = ids.join(",");
  const url = `${SUPABASE_URL}/rest/v1/products?id=in.(${idList})`;
  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ brand_name: "PFERD" }),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  let offset = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  console.log(`Fetching products with "pferd-" in slug (batch size: ${BATCH_SIZE})...\n`);

  while (true) {
    const products = await fetchPage(offset);
    if (products.length === 0) break;

    const toUpdate = products.filter((p) => p.brand_name !== "PFERD");
    const skipped = products.length - toUpdate.length;
    totalSkipped += skipped;

    if (toUpdate.length > 0) {
      const ids = toUpdate.map((p) => p.id);
      const updated = await updateBatch(ids);
      totalUpdated += updated.length;
      process.stdout.write(`Offset ${offset}: updated ${updated.length}, skipped ${skipped}\n`);
    } else {
      process.stdout.write(`Offset ${offset}: all ${skipped} already set, skipping\n`);
    }

    offset += products.length;

    // If we got fewer than BATCH_SIZE, we've reached the end
    if (products.length < BATCH_SIZE) break;
  }

  console.log(`\nDone. Total updated: ${totalUpdated}, already correct: ${totalSkipped}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
