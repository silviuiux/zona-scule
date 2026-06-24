import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const vars = {};
env.split('\n').forEach(line => {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2];
});

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const tables = ['products', 'brands', 'categories', 'subcategories', 'product_listing', 'contact_messages'];
  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(t, '->', error ? `ERROR: ${error.message}` : `OK count=${count}`);
  }

  console.log('\n--- RPC checks ---');
  const rpcs = ['count_products_by_brand', 'count_products_by_category', 'count_products_by_subcategory', 'get_brands_by_filter', 'get_subcategories_by_brand', 'get_featured_subcategories_with_image'];
  for (const r of rpcs) {
    let args = {};
    if (r === 'get_brands_by_filter') args = { p_category: null, p_subcategory: null, p_search: null };
    if (r === 'get_subcategories_by_brand') args = { p_brand: null };
    const { data, error } = await supabase.rpc(r, args);
    console.log(r, '->', error ? `ERROR: ${error.message}` : `OK rows=${Array.isArray(data) ? data.length : 'n/a'}`);
  }

  console.log('\n--- sample product columns ---');
  const { data: sample, error: sErr } = await supabase.from('products').select('*').limit(1);
  if (sErr) console.log('ERROR', sErr.message);
  else console.log(sample && sample[0] ? Object.keys(sample[0]) : 'no rows');
}
main();
