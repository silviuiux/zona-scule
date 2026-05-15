'use client'
import { useState } from 'react'

export default function SkuCopyField({ sku }: { sku: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sku)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = sku
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <style>{`
        .sku-field {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgb(244,244,244);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 4px;
          padding: 10px 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: background 150ms, border-color 150ms;
          user-select: none;
        }
        .sku-field:hover {
          background: rgb(235,235,235);
          border-color: rgba(0,0,0,0.15);
        }
        .sku-field.copied {
          background: rgb(230,245,235);
          border-color: rgba(34,197,94,0.3);
        }
        .sku-field-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.35);
        }
        .sku-field-value {
          font-family: 'Recursive', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgb(0,0,0);
        }
        .sku-field-icon {
          display: flex;
          align-items: center;
          color: rgba(0,0,0,0.3);
          transition: color 150ms;
          flex-shrink: 0;
        }
        .sku-field:hover .sku-field-icon { color: rgba(0,0,0,0.6); }
        .sku-field.copied .sku-field-icon { color: rgb(34,197,94); }
      `}</style>

      <div
        className={`sku-field${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        title={copied ? 'Copiat!' : 'Click pentru a copia SKU'}
      >
        <span className="sku-field-label">SKU:</span>
        <span className="sku-field-value">{copied ? 'Copiat!' : sku}</span>
        <span className="sku-field-icon">
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          )}
        </span>
      </div>
    </>
  )
}
