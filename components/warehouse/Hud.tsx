'use client'

// DOM overlay: exit control, intro skip hint, hover tooltip, category jump
// overlay, product detail panel. Uses the site's real fonts (Bungee/Inter/
// Recursive are loaded by the root layout).
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useWarehouse } from './store'
import type { WarehouseData } from '@/lib/warehouse-data'

export default function Hud({ data }: { data: WarehouseData }) {
  const phase = useWarehouse(s => s.phase)
  const skipIntro = useWarehouse(s => s.skipIntro)
  const hovered = useWarehouse(s => s.hovered)
  const selected = useWarehouse(s => s.selected)
  const setSelected = useWarehouse(s => s.setSelected)
  const jumpOpen = useWarehouse(s => s.jumpOpen)
  const setJumpOpen = useWarehouse(s => s.setJumpOpen)
  const activeAisle = useWarehouse(s => s.activeAisle)
  const setActiveAisle = useWarehouse(s => s.setActiveAisle)

  return (
    <div className="wh-hud">
      {/* exit — always visible, always on top */}
      <Link href="/" className="wh-exit" aria-label="Ieși din depozit, înapoi la site">
        ← IEȘIRE
      </Link>

      {phase === 'intro' && (
        <button className="wh-skip" onClick={skipIntro} aria-label="Sari peste introducere">
          SARI INTRO — Esc
        </button>
      )}

      {phase === 'explore' && (
        <>
          {/* category jump */}
          <button
            className="wh-jump-btn"
            onClick={() => setJumpOpen(!jumpOpen)}
            aria-expanded={jumpOpen}
            aria-label="Sari la o categorie"
          >
            CULOARE ▾
          </button>

          <div className="wh-controls-hint" aria-hidden="true">
            scroll / W–S — înaintează · A–D — schimbă culoarul · click — detalii
          </div>

          {jumpOpen && (
            <nav className="wh-jump-panel" aria-label="Categorii">
              {data.aisles.map((a, i) => (
                <button
                  key={a.categoryName}
                  className={`wh-jump-item${i === activeAisle ? ' active' : ''}`}
                  onClick={() => {
                    setActiveAisle(i)
                    setJumpOpen(false)
                  }}
                >
                  <span className="wh-jump-name">{a.categoryName}</span>
                  <span className="wh-jump-count">
                    {a.productCount.toLocaleString('ro-RO')} produse
                  </span>
                </button>
              ))}
              <Link href="/produse" className="wh-jump-item wh-jump-all">
                <span className="wh-jump-name">Tot catalogul →</span>
              </Link>
            </nav>
          )}

          {/* hover tooltip */}
          {hovered && !selected && (
            <div className="wh-tooltip" role="status">
              <div className="wh-tooltip-brand">{hovered.product.brand_name}</div>
              <div className="wh-tooltip-name">{hovered.product.name}</div>
              <div className="wh-tooltip-specs">
                {hovered.product.st1_label && (
                  <span>
                    {hovered.product.st1_label}: <b>{hovered.product.st1_value}</b>
                  </span>
                )}
                {hovered.product.st2_label && (
                  <span>
                    {hovered.product.st2_label}: <b>{hovered.product.st2_value}</b>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* detail panel */}
          {selected && (
            <div className="wh-panel" role="dialog" aria-label={selected.name}>
              <button
                className="wh-panel-close"
                onClick={() => setSelected(null)}
                aria-label="Închide detaliile"
              >
                ✕
              </button>
              {(selected.main_image_storage_url || selected.main_image_url) && (
                <img
                  className="wh-panel-img"
                  src={selected.main_image_storage_url || selected.main_image_url || ''}
                  alt={selected.name}
                />
              )}
              <div className="wh-panel-brand">{selected.brand_name}</div>
              <h2 className="wh-panel-name">{selected.name}</h2>
              {selected.short_description && (
                <p className="wh-panel-desc">{selected.short_description}</p>
              )}
              <div className="wh-panel-specs">
                {selected.st1_label && (
                  <div>
                    <span>{selected.st1_label}</span>
                    <b>{selected.st1_value}</b>
                  </div>
                )}
                {selected.st2_label && (
                  <div>
                    <span>{selected.st2_label}</span>
                    <b>{selected.st2_value}</b>
                  </div>
                )}
              </div>
              <a
                className="wh-panel-cta"
                href={`/produse/${selected.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                VEZI DETALII COMPLETE →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  )
}
