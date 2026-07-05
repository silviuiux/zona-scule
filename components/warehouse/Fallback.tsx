'use client'

// Graceful degradation for no-WebGL / low-end / reduced-motion visitors:
// a static 2.5D "warehouse shelf" rendered in plain DOM with the same art
// direction, real data, and clear links into the real catalog.
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import type { WarehouseData } from '@/lib/warehouse-data'

export default function Fallback({
  data,
  reason,
}: {
  data: WarehouseData
  reason: 'no-webgl' | 'reduced-motion' | 'low-end' | 'no-data'
}) {
  return (
    <div className="wh-fallback">
      <Link href="/" className="wh-exit" aria-label="Înapoi la site">
        ← IEȘIRE
      </Link>
      <header className="wh-fb-head">
        <h1>DEPOZITUL ZONA SCULE</h1>
        <p>
          {reason === 'no-webgl'
            ? 'Browserul tău nu suportă experiența 3D — dar depozitul e tot aici, raft cu raft.'
            : reason === 'no-data'
              ? 'Rafturile se aprovizionează chiar acum — între timp, catalogul complet te așteaptă mai jos.'
              : 'Versiune simplificată, fără animații — depozitul e tot aici, raft cu raft.'}
        </p>
      </header>

      {data.aisles.map(aisle => (
        <section key={aisle.categoryName} className="wh-fb-aisle">
          <div className="wh-fb-sign">
            <h2>{aisle.categoryName}</h2>
            <span>{aisle.productCount.toLocaleString('ro-RO')} produse</span>
          </div>
          {aisle.shelves.map(shelf => (
            <div key={shelf.label} className="wh-fb-shelf">
              <h3>{shelf.label}</h3>
              <div className="wh-fb-row">
                {shelf.products.map(p => (
                  <a
                    key={p.slug}
                    className="wh-fb-card"
                    href={`/produse/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {(p.main_image_storage_url || p.main_image_url) && (
                      <img
                        src={p.main_image_storage_url || p.main_image_url || ''}
                        alt={p.name}
                        loading="lazy"
                      />
                    )}
                    <span className="wh-fb-brand">{p.brand_name}</span>
                    <span className="wh-fb-name">{p.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <footer className="wh-fb-foot">
        <Link href="/produse">Vezi tot catalogul →</Link>
      </footer>
    </div>
  )
}
