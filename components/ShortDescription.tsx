import type { CSSProperties } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renders a product's short_description (Markdown: **bold**, *italic*, "* bullet")
 * as proper HTML instead of raw text with literal asterisks.
 */
export default function ShortDescription({
  text,
  className,
  style,
}: {
  text: string | null | undefined
  className?: string
  style?: CSSProperties
}) {
  if (!text) return null

  return (
    <div className={className} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  )
}
