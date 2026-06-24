"use client";

import { useMemo, useState, useTransition } from "react";
import {
  bulkReassign,
  reassignSubcategory,
  renameSubcategory,
  type AdminActionResult,
} from "@/lib/data/admin";
import type { Category, Subcategory } from "@/lib/types";

type Row = Subcategory & { count: number; slug: string };

export default function AdminDashboard({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: Row[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTarget, setBulkTarget] = useState("");
  const [renaming, setRenaming] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<AdminActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  function toggleSelected(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function handleReassign(row: Row, newCategoryId: string) {
    const category = categoryById.get(newCategoryId);
    if (!category) return;
    startTransition(async () => {
      const result = await reassignSubcategory(row.slug, category.id, category.name);
      setMessage(result);
    });
  }

  function handleRename(row: Row) {
    const newName = renaming[row.slug]?.trim();
    if (!newName || newName === row.name) return;
    startTransition(async () => {
      const result = await renameSubcategory(row.slug, newName);
      setMessage(result);
    });
  }

  function handleBulkReassign() {
    const category = categoryById.get(bulkTarget);
    if (!category || selected.size === 0) return;
    startTransition(async () => {
      const result = await bulkReassign(Array.from(selected), category.id, category.name);
      setMessage(result);
      setSelected(new Set());
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {message && (
        <p
          className={`border px-4 py-3 text-sm ${
            message.ok ? "border-border bg-white text-ink" : "border-red bg-red/5 text-red"
          }`}
        >
          {message.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border border-border bg-white p-4">
        <span className="label text-text-faint">
          {selected.size} selectate
        </span>
        <select
          value={bulkTarget}
          onChange={(e) => setBulkTarget(e.target.value)}
          className="border border-border-strong bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Reasignează la categoria…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending || selected.size === 0 || !bulkTarget}
          onClick={handleBulkReassign}
          className="label rounded-full bg-red px-5 py-2 text-white transition-colors hover:bg-red-hover disabled:opacity-40"
        >
          Aplică
        </button>
      </div>

      <div className="overflow-x-auto border border-border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 font-medium text-text-faint">Subcategorie</th>
              <th className="px-4 py-3 font-medium text-text-faint">Produse</th>
              <th className="px-4 py-3 font-medium text-text-faint">Categorie curentă</th>
              <th className="px-4 py-3 font-medium text-text-faint">Redenumește</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(row.slug)}
                    onChange={() => toggleSelected(row.slug)}
                  />
                </td>
                <td className="px-4 py-3 text-ink">{row.name}</td>
                <td className="px-4 py-3 text-text-muted">{row.count}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={row.parent_category_id ?? ""}
                    onChange={(e) => handleReassign(row, e.target.value)}
                    disabled={pending}
                    className="border border-border-strong bg-white px-3 py-2 text-sm text-ink"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={row.name}
                      value={renaming[row.slug] ?? ""}
                      onChange={(e) =>
                        setRenaming((prev) => ({ ...prev, [row.slug]: e.target.value }))
                      }
                      className="w-40 border border-border-strong bg-white px-3 py-2 text-sm text-ink"
                    />
                    <button
                      type="button"
                      disabled={pending || !renaming[row.slug]}
                      onClick={() => handleRename(row)}
                      className="label rounded border border-border-strong px-3 text-ink transition-colors hover:border-ink disabled:opacity-40"
                    >
                      Salvează
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
