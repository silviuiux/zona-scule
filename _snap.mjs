import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const sb = createClient(url, key)
// total
const { count: total } = await sb.from('products').select('*', { count:'exact', head:true })
console.log('TOTAL products:', total)
// brand distribution via paging of brand_name
let from=0, size=1000, brands={}, cols={search_url:0,no_url:0,no_specs:0,no_desc:0,no_image:0}
while(true){
  const { data, error } = await sb.from('products')
    .select('brand_name,manufacturer_url,st1_label,short_description,main_image_url')
    .range(from, from+size-1)
  if(error){console.error(error.message);break}
  if(!data.length) break
  for(const p of data){
    const b=p.brand_name||'(null)'; brands[b]=(brands[b]||0)+1
    const u=p.manufacturer_url||''
    if(u.includes('cautare-rezultate')||u.includes('/search')) cols.search_url++
    if(!u) cols.no_url++
    if(!p.st1_label) cols.no_specs++
    if(!p.short_description) cols.no_desc++
    if(!p.main_image_url) cols.no_image++
  }
  from+=size
  if(data.length<size) break
}
console.log('\nBY BRAND:')
Object.entries(brands).sort((a,b)=>b[1]-a[1]).forEach(([b,c])=>console.log(`  ${c}\t${b}`))
console.log('\nQUALITY FLAGS (counts):', JSON.stringify(cols,null,2))
