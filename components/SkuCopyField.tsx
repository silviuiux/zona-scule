"use client";

import { useState } from "react";

export default function SkuCopyField({ sku }: { sku: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sku);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — fail silently, the SKU is still visible as text
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="label inline-flex items-center gap-2 text-text-muted transition-colors hover:text-ink"
      title="Copiază codul SKU"
    >
      SKU: {sku}
      <span aria-hidden>{copied ? "✓" : "⧉"}</span>
    </button>
  );
}
