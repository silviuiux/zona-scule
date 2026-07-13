/**
 * Strips Markdown syntax down to plain text, for compact contexts
 * (e.g. a product card fallback) where full formatting doesn't fit.
 */
export function stripMarkdown(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // **bold**
    .replace(/\*(.*?)\*/g, '$1') // *italic*
    .replace(/^\s*[-*]\s+/gm, '') // "* bullet" / "- bullet" markers
    .replace(/\n{2,}/g, ' ') // collapse blank lines
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
