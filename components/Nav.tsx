'use client'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Navbar — outlined buttons in Oswald, three states:
 *  1. rest: Cauta · Catalog · Branduri · Zona Soluții as outlined buttons,
 *     Contact solid black;
 *  2. search open: Cauta grows into a wide outlined field between the logo
 *     and the links;
 *  3. typing: the bar turns light grey, the links drop their outlines, and
 *     a panel opens below with query completions from /api/search — the
 *     typed part regular, the completion bold; × dismisses a suggestion.
 * On phones the links fold into a hamburger that opens a fullscreen menu:
 * the pages as big numbered lines, the contact details at the bottom.
 */
const MENU = [
  { href: '/produse', label: 'Catalog', note: 'Toate produsele' },
  { href: '/branduri', label: 'Branduri', note: 'Zona Branduri' },
  { href: '/zona-solutii', label: 'Zona Soluții', note: 'Meserii, ghiduri, proiecte' },
  { href: '/contact', label: 'Contact', note: 'Cere o ofertă' },
]
export default function Nav() {
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)

  // ?nav=bar / ?nav=float picks the nav style (remembered per browser)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('nav')
    try { if (q === 'bar' || q === 'float') localStorage.setItem('zs-nav', q) } catch {}
    let mode = q
    try { mode = mode ?? localStorage.getItem('zs-nav') } catch {}
    document.documentElement.classList.toggle('nav-bar', mode === 'bar')
  }, [])
  const [searchOpen, setSearchOpen] = useState(false)
  const [terms, setTerms] = useState<string[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const [fetching, setFetching] = useState(false)
  const [indent, setIndent] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const typing = searchOpen && q.trim().length > 0
  const shown = terms.filter(t => !dismissed.includes(t))
  const panelOpen = typing && shown.length > 0

  // ── scroll shadow ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // ── mobile menu: the page stays put underneath; Escape closes ─────────────
  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { root.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  // ── click outside the nav → collapse an empty search ───────────────────────
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveIdx(-1)
        setQ(v => { if (!v.trim()) setSearchOpen(false); return v })
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // ── the suggestions line up with the search field ──────────────────────────
  useEffect(() => {
    const measure = () => {
      const w = wrapRef.current, inner = innerRef.current
      if (w && inner) setIndent(w.getBoundingClientRect().left - inner.getBoundingClientRect().left - parseFloat(getComputedStyle(inner).paddingLeft))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [searchOpen])

  // ── debounced completions ──────────────────────────────────────────────────
  useEffect(() => {
    const trimmed = q.trim()
    if (trimmed.length < 2) return
    const t = setTimeout(async () => {
      setFetching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        setTerms(data.terms ?? [])
        setActiveIdx(-1)
      } catch {
        setTerms([])
      } finally {
        setFetching(false)
      }
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  const go = useCallback((term: string) => {
    const t = term.trim()
    if (!t) return
    router.push(`/produse?q=${encodeURIComponent(t)}`)
    setQ('')
    setTerms([])
    setActiveIdx(-1)
    setSearchOpen(false)
    inputRef.current?.blur()
  }, [router])

  const [menuQ, setMenuQ] = useState('')
  const submitMenuSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const t = menuQ.trim()
    if (!t) return
    router.push(`/produse?q=${encodeURIComponent(t)}`)
    setMenuQ('')
    setMenuOpen(false)
  }

  const openSearch = () => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 30) }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (q) { setQ(''); setTerms([]) } else setSearchOpen(false)
      setActiveIdx(-1)
      return
    }
    if (!panelOpen) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, shown.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    go(activeIdx >= 0 && shown[activeIdx] ? shown[activeIdx] : q)
  }

  // typed part regular, the rest bold
  const split = (term: string) => {
    const typed = q.trim()
    const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return fold(term).startsWith(fold(typed)) ? [term.slice(0, typed.length), term.slice(typed.length)] : ['', term]
  }

  return (
    <>
      <style>{`
        /* A white card floating --nav-top (16px) below the top edge, as
           wide as the page content — the same card as the cookie bar */
        .nav {
          position: fixed; top: var(--nav-top); left: 0; right: 0; z-index: 100;
          width: calc(min(100%, 1440px) - 2 * var(--gutter)); margin: 0 auto;
          height: var(--nav-bar-h);
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.12); border-radius: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          display: flex; align-items: stretch;
          transition: box-shadow 200ms, background 200ms;
        }
        .nav.scrolled { box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
        .nav.typing { background: rgb(243,243,243); }
        .nav .nav-inner { padding: 0 20px; }
        .nav .nav-panel { left: -1px; right: -1px; top: calc(100% + 8px); padding: 24px 20px 28px; border: 1px solid rgba(0,0,0,0.12); border-radius: 6px; }
        .nav .nav-panel::before { display: none; }

        /* ?nav=bar — the full-width bar */
        html.nav-bar .nav {
          top: 0; width: auto; margin: 0; border: none; border-radius: 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.025), 0 10px 28px rgba(0,0,0,0.03);
        }
        html.nav-bar .nav.scrolled { box-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.06); }
        html.nav-bar .nav .nav-inner { padding: 0 var(--gutter); }
        html.nav-bar .nav .nav-panel { left: var(--gutter); right: var(--gutter); top: 100%; padding: 24px 0 28px; border: none; border-top: 1px solid rgba(0,0,0,0.14); border-bottom: 1px solid rgba(0,0,0,0.14); border-radius: 0; }
        html.nav-bar .nav .nav-panel::before { display: block; }

        .nav-inner {
          position: relative;
          max-width: 1440px; margin: 0 auto; width: 100%;
          /* Same side gutter as the page content, so the logo and the
             Contact button line up with everything below. */
          display: flex; align-items: center; gap: 12px; padding: 0 var(--gutter);
        }
        .nav-logo { display: flex; align-items: center; text-decoration: none; flex-shrink: 0; height: 100%; margin-right: auto; }
        .nav.search-open .nav-logo { margin-right: 32px; }

        /* Shared button look: Oswald, wide tracking, hairline outline; as
           tall as the logo (28px), with a larger invisible hit area */
        .nav-btn {
          position: relative;
          display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          height: 28px; padding: 0 14px; flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; background: rgb(255,255,255);
          font-family: 'Oswald', 'Inter', sans-serif; font-weight: 400;
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgb(20,20,20); text-decoration: none; white-space: nowrap; cursor: pointer;
          transition: border-color 150ms, color 150ms, background 150ms;
        }
        .nav-btn::after { content: ''; position: absolute; inset: -8px -3px; }
        .nav-btn:hover { border-color: rgba(0,0,0,0.45); }
        .nav-btn.solid { background: rgb(18,18,18); border-color: rgb(18,18,18); color: rgb(255,255,255); padding: 0 22px; }
        .nav-btn.solid:hover { background: rgb(217,44,43); border-color: rgb(217,44,43); }
        /* while typing, the links step back to plain grey text */
        .nav.typing .nav-links .nav-btn:not(.solid) { border-color: transparent; background: transparent; color: rgba(0,0,0,0.38); }
        .nav.typing .nav-links .nav-btn:not(.solid):hover { color: rgb(0,0,0); }

        /* Search: a button at rest, a wide field when open */
        .nav-search-wrap { flex: 0 0 auto; display: flex; }
        .nav.search-open .nav-search-wrap { flex: 1 1 auto; min-width: 0; margin-right: 12px; }
        .nav-search-trigger svg { flex-shrink: 0; }
        .nav-search-form {
          flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px;
          height: 28px; padding: 0 14px;
          border: 1px solid rgb(18,18,18); border-radius: 4px; background: rgb(255,255,255);
        }
        .nav-search-icon { flex-shrink: 0; color: rgb(18,18,18); display: flex; }
        .nav-search-input {
          flex: 1; min-width: 0; border: none; outline: none; background: transparent;
          font-family: 'Recursive', sans-serif; font-size: 13px; color: rgb(0,0,0);
        }
        .nav-search-go {
          flex-shrink: 0; background: none; border: none; cursor: pointer; padding: 0;
          font-family: 'Oswald', 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgb(20,20,20);
        }
        .nav-search-go:hover { color: rgb(217,44,43); }

        .nav-links { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

        /* ── Completions panel (typing) ── */
        .nav-panel {
          position: absolute; top: 100%; left: var(--gutter); right: var(--gutter);
          background: rgb(243,243,243);
          border-top: 1px solid rgba(0,0,0,0.14); border-bottom: 1px solid rgba(0,0,0,0.14);
          padding: 24px 0 28px;
        }
        .nav-panel::before { /* grey reaches the window edges behind the panel */
          content: ''; position: absolute; top: -1px; bottom: -29px; left: -100vw; right: -100vw;
          background: rgb(243,243,243); z-index: -1;
        }
        .nav-panel-list { list-style: none; padding-left: var(--indent, 0px); }
        .nav-term {
          display: flex; align-items: center; gap: 18px; padding: 6px 0;
          font-family: 'Inter', sans-serif; font-size: 22px; line-height: 1.3; color: rgb(0,0,0);
        }
        .nav-term-x {
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; margin-left: 4px; border: none; background: none; cursor: pointer;
          color: rgb(0,0,0); border-radius: 4px; transition: background 120ms;
        }
        .nav-term-x:hover { background: rgba(0,0,0,0.06); }
        .nav-term-go { background: none; border: none; padding: 0; cursor: pointer; font: inherit; color: inherit; text-align: left; }
        .nav-term-go b { font-weight: 700; }
        .nav-term.active .nav-term-go, .nav-term-go:hover { text-decoration: underline; text-underline-offset: 5px; text-decoration-thickness: 1px; }
        .nav-panel-loading {
          position: absolute; top: -1px; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgb(217,44,43) 50%, transparent 100%);
          background-size: 200% 100%; animation: nav-sweep 1s linear infinite;
        }
        @keyframes nav-sweep { from { background-position: 100% 0; } to { background-position: -100% 0; } }

        /* ── Tablets: tighter buttons ── */
        @media (max-width: 1180px) {
          .nav-btn { padding: 0 11px; letter-spacing: 0.16em; }
          .nav-btn.solid { padding: 0 16px; }
          .nav-inner, .nav-links { gap: 8px; }
        }
        /* ── Phones: search opens as a row under the bar; links collapse ── */
        @media (max-width: 768px) {
          .nav-links .nav-btn:not(.solid) { display: none; }
          .nav-btn.solid { padding: 0 14px; letter-spacing: 0.16em; }
          .nav-search-trigger { padding: 0; width: 32px; border-color: transparent; }
          .nav-search-trigger span { display: none; }
          .nav.search-open .nav-search-wrap {
            position: absolute; top: 100%; left: 0; right: 0; margin: 0;
            padding: 10px var(--gutter); background: rgb(255,255,255);
            border-bottom: 1px solid rgba(0,0,0,0.08);
          }
          .nav.typing .nav-search-wrap { background: rgb(243,243,243); }
          .nav.search-open .nav-logo { margin-right: auto; }
          .nav-panel, .nav .nav-panel, html.nav-bar .nav .nav-panel { top: calc(100% + 61px); padding: 12px 20px 16px; }
          .nav-panel-list { padding-left: 0; }
          .nav-term { font-size: 17px; gap: 12px; }
          .nav-links { display: none; }
          .nav.menu-open { box-shadow: none; }
        }

        /* ── Phones: hamburger + fullscreen menu ── */
        .nav-burger {
          display: none; position: relative; align-items: center; justify-content: center;
          width: 40px; height: 40px; margin-right: -8px; flex-shrink: 0;
          background: none; border: none; cursor: pointer; padding: 0;
        }
        .nav-burger span {
          position: absolute; left: 10px; right: 10px; height: 1.5px; background: rgb(0,0,0);
          transition: transform 350ms cubic-bezier(0.2, 0.7, 0.1, 1), opacity 200ms;
        }
        .nav-burger span:nth-child(1) { transform: translateY(-4px); }
        .nav-burger span:nth-child(2) { transform: translateY(4px); }
        .nav.menu-open .nav-search-wrap { visibility: hidden; }
        .nav.menu-open .nav-burger span:nth-child(1) { transform: rotate(45deg); }
        .nav.menu-open .nav-burger span:nth-child(2) { transform: rotate(-45deg); }
        @media (max-width: 768px) { .nav-burger { display: flex; } }

        .nav-menu {
          position: fixed; inset: 0; z-index: 99;
          padding: calc(var(--nav-h) + 24px) var(--gutter) calc(32px + env(safe-area-inset-bottom));
          overflow-y: auto; overscroll-behavior: contain;
          background: rgb(255,255,255);
          display: flex; flex-direction: column;
          opacity: 0; visibility: hidden; pointer-events: none;
          transition: opacity 300ms ease, visibility 0s linear 300ms;
        }
        .nav-menu.open { opacity: 1; visibility: visible; pointer-events: auto; transition: opacity 300ms ease; }
        .nav-menu-search {
          display: flex; align-items: center; gap: 12px; height: 56px; padding: 0 8px 0 16px; margin-bottom: 24px;
          border: 1px solid rgba(0,0,0,0.16); border-radius: 6px; background: rgb(255,255,255); color: rgb(18,18,18);
          opacity: 0; transform: translateY(8px);
          transition: opacity 400ms ease 40ms, transform 600ms cubic-bezier(0.2, 0.7, 0.1, 1) 40ms, border-color 200ms;
        }
        .nav-menu.open .nav-menu-search { opacity: 1; transform: none; }
        .nav-menu-search:focus-within { border-color: rgb(18,18,18); }
        .nav-menu-search svg { flex-shrink: 0; }
        .nav-menu-search input {
          flex: 1 1 auto; min-width: 0; border: none; outline: none; background: none;
          font-family: 'Recursive', sans-serif; font-size: 16px; color: rgb(18,18,18);
        }
        .nav-menu-search input::placeholder { color: rgba(0,0,0,0.4); }
        .nav-menu-search input::-webkit-search-cancel-button { display: none; }
        .nav-menu-search button {
          flex-shrink: 0; height: 40px; padding: 0 14px; border: none; border-radius: 4px; cursor: pointer;
          background: rgb(18,18,18); color: rgb(255,255,255);
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
        }
        .nav-menu-list { list-style: none; display: flex; flex-direction: column; }
        .nav-menu-item { border-top: 1px solid rgba(0,0,0,0.08); overflow: hidden; }
        .nav-menu-item:last-child { border-bottom: 1px solid rgba(0,0,0,0.08); }
        .nav-menu-link {
          display: grid; grid-template-columns: 36px 1fr auto; align-items: baseline; gap: 8px;
          padding: 18px 0; text-decoration: none; color: rgb(0,0,0);
          transform: translateY(100%); opacity: 0;
          transition: transform 600ms cubic-bezier(0.2, 0.7, 0.1, 1), opacity 400ms ease;
          transition-delay: calc(60ms + var(--i) * 60ms);
        }
        .nav-menu.open .nav-menu-link { transform: none; opacity: 1; }
        .nav-menu-n { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.1em; color: rgb(217,44,43); }
        .nav-menu-label { font-family: 'Neuton', serif; font-size: clamp(38px, 11vw, 56px); line-height: 1; letter-spacing: -0.015em; }
        .nav-menu-note { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.4); text-align: right; max-width: 110px; }
        .nav-menu-link:active .nav-menu-label { color: rgb(217,44,43); }
        .nav-menu-foot {
          margin-top: auto; padding-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px 16px;
          opacity: 0; transform: translateY(12px);
          transition: opacity 500ms ease 320ms, transform 600ms cubic-bezier(0.2, 0.7, 0.1, 1) 320ms;
        }
        .nav-menu.open .nav-menu-foot { opacity: 1; transform: none; }
        .nav-menu-foot span { display: block; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.4); margin-bottom: 6px; }
        .nav-menu-foot a, .nav-menu-foot p { font-family: 'Recursive', sans-serif; font-size: 14px; color: rgb(0,0,0); text-decoration: none; }
        .nav-menu-foot a.red { color: rgb(217,44,43); }
        @media (min-width: 769px) { .nav-menu { display: none; } }
        @media (prefers-reduced-motion: reduce) {
          .nav-menu-link, .nav-menu-foot, .nav-menu-search { transition: none; transform: none; }
        }
      `}</style>

      <nav ref={navRef} className={`nav${scrolled ? ' scrolled' : ''}${searchOpen ? ' search-open' : ''}${typing ? ' typing' : ''}${menuOpen ? ' menu-open' : ''}`}>
        <div ref={innerRef} className="nav-inner" style={{ ['--indent' as string]: `${indent + 12}px` }}>
          <Link href="/" className="nav-logo" aria-label="Zona Scule — acasă">
            <svg width="144" height="28" viewBox="0 0 159 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.213 12.0338L30.8793 0.5C24.2231 0.503334 17.8019 3.0075 12.8326 7.53234L0 19.2162H13.7136L1.32144 30.5C7.62846 30.5 13.7038 28.0759 18.3403 23.7111L23.1138 19.2162L31 12.0338H18.213Z" fill="#D92C2B"/>
              <path d="M0 12.4575V0.506836H12.4901L0 12.4575Z" fill="#D92C2B"/>
              <path d="M17.1201 30.5H31.0001V18.4727L17.1201 30.5Z" fill="#D92C2B"/>
              <path d="M47.448 25V22.632L51.736 8.712H47.768V6.088H55.992V7.944L51.448 22.376H55.992V25H47.448ZM62.7743 25.384C61.7289 25.384 60.8116 25.256 60.0223 25C59.2329 24.7653 58.6143 24.264 58.1663 23.496C57.7396 22.7067 57.5263 21.544 57.5263 20.008V10.088C57.5263 8.95733 57.7396 8.08267 58.1663 7.464C58.6143 6.84533 59.2329 6.41867 60.0223 6.184C60.8329 5.928 61.7609 5.8 62.8063 5.8C63.8303 5.8 64.7369 5.928 65.5263 6.184C66.3369 6.44 66.9663 6.87733 67.4143 7.496C67.8836 8.11467 68.1183 8.97867 68.1183 10.088V19.976C68.1183 21.5333 67.8836 22.7067 67.4143 23.496C66.9663 24.264 66.3369 24.7653 65.5263 25C64.7369 25.256 63.8196 25.384 62.7743 25.384ZM62.7743 23.208C63.0943 23.208 63.3716 23.1547 63.6063 23.048C63.8623 22.9413 64.0543 22.76 64.1823 22.504C64.3316 22.2267 64.4062 21.8533 64.4062 21.384V9.928C64.4062 9.45867 64.3316 9.096 64.1823 8.84C64.0543 8.56267 63.8623 8.37067 63.6063 8.264C63.3716 8.15733 63.0943 8.104 62.7743 8.104C62.4543 8.104 62.1769 8.15733 61.9423 8.264C61.7076 8.37067 61.5156 8.56267 61.3663 8.84C61.2383 9.096 61.1743 9.45867 61.1743 9.928V21.384C61.1743 21.8533 61.2383 22.2267 61.3663 22.504C61.5156 22.76 61.7076 22.9413 61.9423 23.048C62.1769 23.1547 62.4543 23.208 62.7743 23.208ZM70.594 25V6.088H73.826L77.762 17.544V6.088H81.026V25H77.794L73.858 14.312V25H70.594ZM82.5998 25L85.9918 6.088H91.3038L94.6318 25H90.4718L89.8958 21.512H87.1438L86.5998 25H82.5998ZM87.2078 19.656H89.8638L88.5518 9.384L87.2078 19.656ZM106.332 25.224C105.201 25.224 104.23 25.064 103.42 24.744C102.63 24.424 102.022 23.8587 101.596 23.048C101.169 22.2373 100.956 21.096 100.956 19.624V18.504C101.617 18.504 102.268 18.504 102.908 18.504C103.548 18.504 104.188 18.504 104.828 18.504V19.944C104.828 20.7333 104.892 21.3413 105.02 21.768C105.148 22.1733 105.329 22.4613 105.564 22.632C105.798 22.7813 106.076 22.856 106.396 22.856C106.886 22.856 107.27 22.6853 107.548 22.344C107.846 21.9813 107.996 21.288 107.996 20.264C107.996 19.4747 107.868 18.888 107.612 18.504C107.377 18.0987 106.993 17.7787 106.46 17.544C105.926 17.288 105.244 16.9787 104.411 16.616C103.665 16.296 103.046 15.912 102.556 15.464C102.065 15.016 101.702 14.4507 101.468 13.768C101.233 13.0853 101.116 12.2533 101.116 11.272C101.116 10.0347 101.276 9.032 101.596 8.264C101.937 7.496 102.492 6.94133 103.26 6.6C104.049 6.23733 105.105 6.056 106.428 6.056C108.134 6.056 109.436 6.42933 110.332 7.176C111.249 7.90133 111.708 9 111.708 10.472V12.744C111.089 12.744 110.47 12.744 109.852 12.744C109.254 12.744 108.636 12.744 107.996 12.744V11.592C107.996 10.632 107.878 9.96 107.644 9.576C107.43 9.192 107.036 9 106.46 9C105.905 9 105.51 9.17067 105.276 9.512C105.041 9.85333 104.924 10.408 104.924 11.176C104.924 11.88 105.062 12.4347 105.34 12.84C105.638 13.224 106.012 13.5227 106.46 13.736C106.908 13.928 107.388 14.12 107.9 14.312C108.838 14.6747 109.606 15.048 110.204 15.432C110.801 15.7947 111.238 16.3067 111.516 16.968C111.793 17.608 111.932 18.536 111.932 19.752C111.932 21.1173 111.697 22.2053 111.228 23.016C110.78 23.8053 110.129 24.3707 109.276 24.712C108.444 25.0533 107.462 25.224 106.332 25.224ZM119.152 25.384C118.106 25.384 117.178 25.256 116.368 25C115.578 24.7653 114.949 24.264 114.48 23.496C114.032 22.7067 113.808 21.544 113.808 20.008V10.088C113.808 8.95733 114.032 8.08267 114.48 7.464C114.949 6.84533 115.589 6.41867 116.4 6.184C117.21 5.928 118.138 5.8 119.184 5.8C120.25 5.8 121.168 5.928 121.936 6.184C122.725 6.44 123.333 6.87733 123.76 7.496C124.186 8.11467 124.4 8.97867 124.4 10.088V13.992H120.688V9.928C120.688 9.416 120.624 9.032 120.496 8.776C120.368 8.49867 120.186 8.31733 119.952 8.232C119.738 8.14667 119.482 8.104 119.184 8.104C118.885 8.104 118.618 8.14667 118.384 8.232C118.149 8.31733 117.968 8.49867 117.84 8.776C117.712 9.032 117.648 9.416 117.648 9.928V21.384C117.648 21.8747 117.712 22.2587 117.84 22.536C117.968 22.792 118.149 22.9733 118.384 23.08C118.618 23.1653 118.885 23.208 119.184 23.208C119.482 23.208 119.738 23.1653 119.952 23.08C120.186 22.9733 120.368 22.792 120.496 22.536C120.624 22.2587 120.688 21.8747 120.688 21.384V17.64H124.4V19.976C124.4 21.5333 124.186 22.7067 123.76 23.496C123.333 24.264 122.725 24.7653 121.936 25C121.168 25.256 120.24 25.384 119.152 25.384ZM131.934 25.384C131.166 25.384 130.462 25.3307 129.822 25.224C129.182 25.1173 128.628 24.8933 128.158 24.552C127.689 24.2107 127.326 23.7093 127.07 23.048C126.814 22.3653 126.686 21.448 126.686 20.296V6.088H130.398V21.352C130.398 21.8 130.462 22.1627 130.59 22.44C130.74 22.696 130.932 22.8667 131.166 22.952C131.401 23.0373 131.657 23.08 131.934 23.08C132.19 23.08 132.436 23.0373 132.67 22.952C132.905 22.8667 133.086 22.696 133.214 22.44C133.364 22.1627 133.438 21.8 133.438 21.352V6.088H137.15V20.296C137.15 21.4267 137.022 22.3333 136.766 23.016C136.51 23.6987 136.148 24.2107 135.678 24.552C135.23 24.8933 134.676 25.1173 134.014 25.224C133.374 25.3307 132.681 25.384 131.934 25.384ZM139.782 25V6.088H143.462V22.44H147.75V25H139.782ZM149.344 25V6.088H158.048V8.712H153.216V13.768H157.312V16.68H153.216V22.44H158.048V25H149.344Z" fill="#D92C2B"/>
            </svg>
          </Link>

          <div ref={wrapRef} className="nav-search-wrap">
            {searchOpen ? (
              <form className="nav-search-form" onSubmit={handleSubmit} role="search">
                <span className="nav-search-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/></svg>
                </span>
                <input
                  ref={inputRef}
                  className="nav-search-input"
                  value={q}
                  onChange={e => { setQ(e.target.value); setDismissed([]); if (e.target.value.trim().length < 2) setTerms([]) }}
                  onKeyDown={handleKeyDown}
                  aria-label="Caută în catalog"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button className="nav-search-go" type="submit">Cauta</button>
              </form>
            ) : (
              <button type="button" className="nav-btn nav-search-trigger" onClick={openSearch} aria-label="Caută">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/></svg>
                <span>Cauta</span>
              </button>
            )}
          </div>

          <div className="nav-links">
            <Link href="/produse" className="nav-btn">Catalog</Link>
            <Link href="/branduri" className="nav-btn">Branduri</Link>
            <Link href="/zona-solutii" className="nav-btn">Zona Soluții</Link>
            <Link href="/contact" className="nav-btn solid">Contact</Link>
          </div>

          <button type="button" className="nav-burger" aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'} aria-expanded={menuOpen} aria-controls="nav-menu" onClick={() => { setMenuOpen(o => !o); setSearchOpen(false) }}>
            <span /><span />
          </button>

          {panelOpen && (
            <div className="nav-panel" role="listbox" aria-label="Sugestii de căutare">
              {fetching && <div className="nav-panel-loading" />}
              <ul className="nav-panel-list">
                {shown.map((t, i) => {
                  const [typed, rest] = split(t)
                  return (
                    <li key={t} className={`nav-term${i === activeIdx ? ' active' : ''}`} role="option" aria-selected={i === activeIdx} onMouseEnter={() => setActiveIdx(i)}>
                      <button type="button" className="nav-term-x" aria-label={`Ascunde „${t}”`} onClick={() => setDismissed(d => [...d, t])}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                      <button type="button" className="nav-term-go" onClick={() => go(t)}>
                        {typed}<b>{rest}</b>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div id="nav-menu" className={`nav-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <form className="nav-menu-search" role="search" onSubmit={submitMenuSearch}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            type="search"
            value={menuQ}
            onChange={e => setMenuQ(e.target.value)}
            placeholder="Caută în catalog…"
            aria-label="Caută produse"
            enterKeyHint="search"
            tabIndex={menuOpen ? 0 : -1}
          />
          <button type="submit" tabIndex={menuOpen ? 0 : -1}>Caută</button>
        </form>
        <ol className="nav-menu-list">
          {MENU.map((m, i) => (
            <li key={m.href} className="nav-menu-item">
              <Link href={m.href} className="nav-menu-link" style={{ ['--i' as string]: i }} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>
                <span className="nav-menu-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="nav-menu-label">{m.label}</span>
                <span className="nav-menu-note">{m.note}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="nav-menu-foot">
          <div><span>Telefon</span><a href="tel:0248222298" className="red" tabIndex={menuOpen ? 0 : -1}>0248.222.298</a></div>
          <div><span>E-mail</span><a href="mailto:office@zonascule.ro" tabIndex={menuOpen ? 0 : -1}>office@zonascule.ro</a></div>
          <div><span>Program</span><p>L–V · 08:30–17:00</p></div>
          <div><span>Adresă</span><p>Sfânta Vineri 28, Pitești</p></div>
        </div>
      </div>
    </>
  )
}
