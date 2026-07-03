'use client'

/**
 * Global "lazy loading" feedback for client-side navigations that DON'T
 * remount a route segment — e.g. clicking a category/subcategory/brand pill
 * on /produse just changes searchParams on the same page, so Next's
 * automatic loading.tsx Suspense boundary can take a moment to kick in and
 * the click can otherwise feel unresponsive while the new server payload
 * (DB query + render) comes back.
 *
 * Two pieces:
 *  - `NavigationProgressProvider` — wraps the app once (root layout), holds
 *    a `useTransition` pending flag, and renders a slim top progress bar
 *    (YouTube/GitHub-style) that fills while a navigation is in flight.
 *  - `TransitionLink` — drop-in replacement for `next/link`'s `<Link>` that
 *    routes clicks through `startTransition(() => router.push(href))` so
 *    the provider's pending flag (and therefore the progress bar) reacts to
 *    every filter/category/subcategory click, regardless of whether the
 *    target is a new segment or just new searchParams.
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

type NavCtxValue = { pending: boolean; navigate: (href: string) => void }
const NavCtx = createContext<NavCtxValue>({ pending: false, navigate: () => {} })

export function useNavigation() {
  return useContext(NavCtx)
}

function ProgressBar({ pending }: { pending: boolean }) {
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []

    if (pending) {
      setVisible(true)
      // Jump to a small width immediately, then creep towards ~85% — never
      // finishes on its own, so it always reflects "still working".
      setWidth(12)
      timers.current.push(setTimeout(() => setWidth(45), 80))
      timers.current.push(setTimeout(() => setWidth(72), 500))
      timers.current.push(setTimeout(() => setWidth(85), 1500))
    } else if (visible) {
      // Snap to 100% then fade out.
      setWidth(100)
      timers.current.push(
        setTimeout(() => {
          setVisible(false)
          setWidth(0)
        }, 220)
      )
    }
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', top: 0, left: 0, height: 3, zIndex: 9999,
        width: `${width}%`,
        opacity: visible ? 1 : 0,
        background: 'rgb(217,44,43)',
        boxShadow: visible ? '0 0 8px rgba(217,44,43,0.6)' : 'none',
        transition: width === 100
          ? 'width 200ms ease-out, opacity 300ms ease-out 150ms'
          : 'width 400ms ease-out, opacity 150ms ease-out',
      }}
    />
  )
}

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = (href: string) => {
    startTransition(() => router.push(href))
  }

  return (
    <NavCtx.Provider value={{ pending: isPending, navigate }}>
      <ProgressBar pending={isPending} />
      {children}
    </NavCtx.Provider>
  )
}

type TransitionLinkProps = {
  href: string
  className?: string
  children: ReactNode
  onClick?: () => void
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>

/**
 * Drop-in `<Link>` replacement. Falls back to native browser navigation for
 * modifier-clicks / middle-clicks (new tab, etc.) so ctrl/cmd-click still
 * works as expected.
 */
export function TransitionLink({ href, className, children, onClick, ...rest }: TransitionLinkProps) {
  const { navigate } = useNavigation()
  return (
    <NextLink
      href={href}
      className={className}
      onClick={e => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        onClick?.()
        navigate(href)
      }}
      {...rest}
    >
      {children}
    </NextLink>
  )
}
