'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function navigate(router: ReturnType<typeof useRouter>, url: string, dir: 'prev' | 'next') {
  document.documentElement.dataset.navDir = dir

  if ('startViewTransition' in document) {
    // @ts-ignore — View Transitions API
    document.startViewTransition(() => router.push(url))
  } else {
    router.push(url)
  }
}

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
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowLeft' && prevSlug) navigate(router, `/produse/${prevSlug}`, 'prev')
      if (e.key === 'ArrowRight' && nextSlug) navigate(router, `/produse/${nextSlug}`, 'next')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevSlug, nextSlug, router])

  return (
    <>
      <style>{`
        /* ── View Transition: 3D wheel/cylinder on the hero image ── */

        /* Next → : old spins left-and-back, new comes from right-and-back */
        html[data-nav-dir="next"]::view-transition-old(product-hero) {
          animation: hero-spin-out-left 420ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        html[data-nav-dir="next"]::view-transition-new(product-hero) {
          animation: hero-spin-in-right 420ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        /* Prev ← : old spins right-and-back, new comes from left-and-back */
        html[data-nav-dir="prev"]::view-transition-old(product-hero) {
          animation: hero-spin-out-right 420ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        html[data-nav-dir="prev"]::view-transition-new(product-hero) {
          animation: hero-spin-in-left 420ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        /* Fallback for no direction set */
        ::view-transition-old(product-hero) {
          animation: hero-spin-out-left 420ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        ::view-transition-new(product-hero) {
          animation: hero-spin-in-right 420ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        @keyframes hero-spin-out-left {
          from {
            opacity: 1;
            transform: perspective(900px) rotateY(0deg) translateZ(0px) scale(1);
          }
          to {
            opacity: 0;
            transform: perspective(900px) rotateY(-72deg) translateZ(-220px) scale(0.82);
          }
        }
        @keyframes hero-spin-in-right {
          from {
            opacity: 0;
            transform: perspective(900px) rotateY(72deg) translateZ(-220px) scale(0.82);
          }
          to {
            opacity: 1;
            transform: perspective(900px) rotateY(0deg) translateZ(0px) scale(1);
          }
        }
        @keyframes hero-spin-out-right {
          from {
            opacity: 1;
            transform: perspective(900px) rotateY(0deg) translateZ(0px) scale(1);
          }
          to {
            opacity: 0;
            transform: perspective(900px) rotateY(72deg) translateZ(-220px) scale(0.82);
          }
        }
        @keyframes hero-spin-in-left {
          from {
            opacity: 0;
            transform: perspective(900px) rotateY(-72deg) translateZ(-220px) scale(0.82);
          }
          to {
            opacity: 1;
            transform: perspective(900px) rotateY(0deg) translateZ(0px) scale(1);
          }
        }

        /* Suppress the default cross-fade on everything else */
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }

        /* ── Nav arrow buttons ── */
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
          onClick={e => { e.preventDefault(); navigate(router, `/produse/${prevSlug}`, 'prev') }}
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
          onClick={e => { e.preventDefault(); navigate(router, `/produse/${nextSlug}`, 'next') }}
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
