"use client";

import { useState } from "react";

export default function MobileFilterToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label flex w-full items-center justify-between border border-border-strong px-4 py-3 text-ink"
      >
        Filtre
        <span aria-hidden>↓</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-ink/30" role="dialog" aria-modal="true">
          <div className="flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <p className="label text-text-faint">Filtre</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide filtrele"
                className="text-2xl leading-none text-ink"
              >
                ×
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
