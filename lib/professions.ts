// Profession categories for Zona Soluții, per REBUILD.md §3.4. Kept as a
// small static lookup (label + slug) — the underlying content lives in the
// `articles` table; this is just display metadata for the filter pills.
export const PROFESSIONS = [
  { value: "instalatori", label: "Instalatori" },
  { value: "electricieni", label: "Electricieni" },
  { value: "gradina", label: "Grădină" },
  { value: "spalat-presiune", label: "Spălat cu presiune" },
] as const;

export function professionLabel(value: string): string {
  return PROFESSIONS.find((p) => p.value === value)?.label ?? value;
}
