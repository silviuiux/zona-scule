'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductNavArrows({
  prevSlug,
  nextSlug,
}: {
  prevSlug: string | null
  nextSlug: string | null
}) {
  const router = useRouter()

  // Prefetch on mount so navigation is instant
  useEffect(() => {
    if (prevSlug) router.prefetch(`/produse/${prevSlug}`)
    if (nextSlug) router.prefetch(`/produse/${nextSlug}`)
  }, [prevSlug, nextSlug, router])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack if user is typing in an input
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowLeft' && prevSlug) router.push(`/produse/${prevSlug}`)
      if (e.key === 'ArrowRight' && nextSlug) router.push(`/produse/${nextSlug}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevSlug, nextSlug, router])

  return (
    <>
      <style>{`
        .prod-nav-arrow {
          position: fixed;
          top: 50vh;
          transform: translateY(-50%);
          z-index: 40;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 3px;
          cursor: pointer;
          text-decoration: none;
          color: rgb(0,0,0);
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          transition: background 150ms, border-color 150ms, box-shadow 150ms, opacity 150ms;
          opacity: 0.7;
        }
        .prod-nav-arrow:hover {
          background: rgb(0,0,0);
          color: rgb(255,255,255);
          border-color: transparent;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18);
          opacity: 1;
        }
        .prod-nav-arrow.disabled {
          opacity: 0.2;
          pointer-events: none;
          cursor: default;
        }
        .prod-nav-arrow.prev { left: 16px; }
        .prod-nav-arrow.next { right: 16px; }
        .prod-nav-arrow svg { width: 18px; height: 18px; stroke-width: 2; }

        @media (max-width: 768px) {
          .prod-nav-arrow { width: 36px; height: 36px; }
          .prod-nav-arrow.prev { left: 8px; }
          .prod-nav-arrow.next { right: 8px; }
          .prod-nav-arrow svg { width: 14px; height: 14px; }
        }
      `}</style>

      {/* Previous */}
      {prevSlug ? (
        <a
          href={`/produse/${prevSlug}`}
          className="prod-nav-arrow prev"
          title="Produsul anterior (←)"
          onClick={e => { e.preventDefault(); router.push(`/produse/${prevSlug}`) }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
      ) : (
        <span className="prod-nav-arrow prev disabled">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </span>
      )}

      {/* Next */}
      {nextSlug ? (
        <a
          href={`/produse/${nextSlug}`}
          className="prod-nav-arrow next"
          title="Produsul următor (→)"
          onClick={e => { e.preventDefault(); router.push(`/produse/${nextSlug}`) }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      ) : (
        <span className="prod-nav-arrow next disabled">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      )}
    </>
  )
}
