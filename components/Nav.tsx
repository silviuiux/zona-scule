'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Nav() {
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) router.push(`/produse?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <>
      <style>{`
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 52px;
          background: rgb(244, 244, 244);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          display: flex; align-items: center;
          padding: 0 12px;
          gap: 0;
          transition: box-shadow 200ms;
        }
        .nav.scrolled { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }

        /* Logo — fixed width, no shrink */
        .nav-logo {
          display: flex; align-items: center;
          text-decoration: none; flex-shrink: 0;
          padding-right: 20px;
          border-right: 1px solid rgba(0,0,0,0.1);
          height: 100%;
        }

        /* Catalog button */
        .nav-catalog {
          display: flex; align-items: center; gap: 3px;
          height: 100%;
          padding: 0 16px;
          border-right: 1px solid rgba(0,0,0,0.1);
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 500; color: rgb(0,0,0);
          text-decoration: none; flex-shrink: 0; white-space: nowrap;
          transition: color 150ms;
        }
        .nav-catalog:hover { color: rgb(217,44,43); }

        /* Search — takes all remaining space */
        .nav-search-form {
          flex: 1; min-width: 0;
          display: flex; align-items: center;
          height: 100%;
          padding: 0 14px;
          border-right: 1px solid rgba(0,0,0,0.1);
          gap: 8px;
        }
        .nav-search-input {
          flex: 1; min-width: 0;
          border: none; outline: none; background: transparent;
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgb(0,0,0);
        }
        .nav-search-input::placeholder { color: rgba(0,0,0,0.35); }

        /* Search icon — inside form on the right */
        .nav-search-btn {
          flex-shrink: 0;
          background: none; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(0,0,0,0.4);
          padding: 4px;
          transition: color 150ms;
        }
        .nav-search-btn:hover { color: rgb(217,44,43); }

        /* Contact */
        .nav-contact {
          flex-shrink: 0;
          margin-left: 12px;
          padding: 8px 18px;
          background: rgb(0,0,0); color: rgb(255,255,255);
          border-radius: 2px;
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.07em; text-transform: uppercase;
          text-decoration: none;
          transition: background 150ms;
          white-space: nowrap;
        }
        .nav-contact:hover { background: rgb(217,44,43); }
      `}</style>

      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        {/* ── Real SVG Logo ── */}
        <Link href="/" className="nav-logo">
          <svg width="120" height="23" viewBox="0 0 159 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.213 12.0338L30.8793 0.5C24.2231 0.503334 17.8019 3.0075 12.8326 7.53234L0 19.2162H13.7136L1.32144 30.5C7.62846 30.5 13.7038 28.0759 18.3403 23.7111L23.1138 19.2162L31 12.0338H18.213Z" fill="#D92C2B"/>
            <path d="M0 12.4575V0.506836H12.4901L0 12.4575Z" fill="#D92C2B"/>
            <path d="M17.1201 30.5H31.0001V18.4727L17.1201 30.5Z" fill="#D92C2B"/>
            <path d="M47.448 25V22.632L51.736 8.712H47.768V6.088H55.992V7.944L51.448 22.376H55.992V25H47.448ZM62.7743 25.384C61.7289 25.384 60.8116 25.256 60.0223 25C59.2329 24.7653 58.6143 24.264 58.1663 23.496C57.7396 22.7067 57.5263 21.544 57.5263 20.008V10.088C57.5263 8.95733 57.7396 8.08267 58.1663 7.464C58.6143 6.84533 59.2329 6.41867 60.0223 6.184C60.8329 5.928 61.7609 5.8 62.8063 5.8C63.8303 5.8 64.7369 5.928 65.5263 6.184C66.3369 6.44 66.9663 6.87733 67.4143 7.496C67.8836 8.11467 68.1183 8.97867 68.1183 10.088V19.976C68.1183 21.5333 67.8836 22.7067 67.4143 23.496C66.9663 24.264 66.3369 24.7653 65.5263 25C64.7369 25.256 63.8196 25.384 62.7743 25.384ZM62.7743 23.208C63.0943 23.208 63.3716 23.1547 63.6063 23.048C63.8623 22.9413 64.0543 22.76 64.1823 22.504C64.3316 22.2267 64.4062 21.8533 64.4062 21.384V9.928C64.4062 9.45867 64.3316 9.096 64.1823 8.84C64.0543 8.56267 63.8623 8.37067 63.6063 8.264C63.3716 8.15733 63.0943 8.104 62.7743 8.104C62.4543 8.104 62.1769 8.15733 61.9423 8.264C61.7076 8.37067 61.5156 8.56267 61.3663 8.84C61.2383 9.096 61.1743 9.45867 61.1743 9.928V21.384C61.1743 21.8533 61.2383 22.2267 61.3663 22.504C61.5156 22.76 61.7076 22.9413 61.9423 23.048C62.1769 23.1547 62.4543 23.208 62.7743 23.208ZM70.594 25V6.088H73.826L77.762 17.544V6.088H81.026V25H77.794L73.858 14.312V25H70.594ZM82.5998 25L85.9918 6.088H91.3038L94.6318 25H90.4718L89.8958 21.512H87.1438L86.5998 25H82.5998ZM87.2078 19.656H89.8638L88.5518 9.384L87.2078 19.656ZM106.332 25.224C105.201 25.224 104.23 25.064 103.42 24.744C102.63 24.424 102.022 23.8587 101.596 23.048C101.169 22.2373 100.956 21.096 100.956 19.624V18.504C101.617 18.504 102.268 18.504 102.908 18.504C103.548 18.504 104.188 18.504 104.828 18.504V19.944C104.828 20.7333 104.892 21.3413 105.02 21.768C105.148 22.1733 105.329 22.4613 105.564 22.632C105.798 22.7813 106.076 22.856 106.396 22.856C106.886 22.856 107.27 22.6853 107.548 22.344C107.846 21.9813 107.996 21.288 107.996 20.264C107.996 19.4747 107.868 18.888 107.612 18.504C107.377 18.0987 106.993 17.7787 106.46 17.544C105.926 17.288 105.244 16.9787 104.411 16.616C103.665 16.296 103.046 15.912 102.556 15.464C102.065 15.016 101.702 14.4507 101.468 13.768C101.233 13.0853 101.116 12.2533 101.116 11.272C101.116 10.0347 101.276 9.032 101.596 8.264C101.937 7.496 102.492 6.94133 103.26 6.6C104.049 6.23733 105.105 6.056 106.428 6.056C108.134 6.056 109.436 6.42933 110.332 7.176C111.249 7.90133 111.708 9 111.708 10.472V12.744C111.089 12.744 110.47 12.744 109.852 12.744C109.254 12.744 108.636 12.744 107.996 12.744V11.592C107.996 10.632 107.878 9.96 107.644 9.576C107.43 9.192 107.036 9 106.46 9C105.905 9 105.51 9.17067 105.276 9.512C105.041 9.85333 104.924 10.408 104.924 11.176C104.924 11.88 105.062 12.4347 105.34 12.84C105.638 13.224 106.012 13.5227 106.46 13.736C106.908 13.928 107.388 14.12 107.9 14.312C108.838 14.6747 109.606 15.048 110.204 15.432C110.801 15.7947 111.238 16.3067 111.516 16.968C111.793 17.608 111.932 18.536 111.932 19.752C111.932 21.1173 111.697 22.2053 111.228 23.016C110.78 23.8053 110.129 24.3707 109.276 24.712C108.444 25.0533 107.462 25.224 106.332 25.224ZM119.152 25.384C118.106 25.384 117.178 25.256 116.368 25C115.578 24.7653 114.949 24.264 114.48 23.496C114.032 22.7067 113.808 21.544 113.808 20.008V10.088C113.808 8.95733 114.032 8.08267 114.48 7.464C114.949 6.84533 115.589 6.41867 116.4 6.184C117.21 5.928 118.138 5.8 119.184 5.8C120.25 5.8 121.168 5.928 121.936 6.184C122.725 6.44 123.333 6.87733 123.76 7.496C124.186 8.11467 124.4 8.97867 124.4 10.088V13.992H120.688V9.928C120.688 9.416 120.624 9.032 120.496 8.776C120.368 8.49867 120.186 8.31733 119.952 8.232C119.738 8.14667 119.482 8.104 119.184 8.104C118.885 8.104 118.618 8.14667 118.384 8.232C118.149 8.31733 117.968 8.49867 117.84 8.776C117.712 9.032 117.648 9.416 117.648 9.928V21.384C117.648 21.8747 117.712 22.2587 117.84 22.536C117.968 22.792 118.149 22.9733 118.384 23.08C118.618 23.1653 118.885 23.208 119.184 23.208C119.482 23.208 119.738 23.1653 119.952 23.08C120.186 22.9733 120.368 22.792 120.496 22.536C120.624 22.2587 120.688 21.8747 120.688 21.384V17.64H124.4V19.976C124.4 21.5333 124.186 22.7067 123.76 23.496C123.333 24.264 122.725 24.7653 121.936 25C121.168 25.256 120.24 25.384 119.152 25.384ZM131.934 25.384C131.166 25.384 130.462 25.3307 129.822 25.224C129.182 25.1173 128.628 24.8933 128.158 24.552C127.689 24.2107 127.326 23.7093 127.07 23.048C126.814 22.3653 126.686 21.448 126.686 20.296V6.088H130.398V21.352C130.398 21.8 130.462 22.1627 130.59 22.44C130.74 22.696 130.932 22.8667 131.166 22.952C131.401 23.0373 131.657 23.08 131.934 23.08C132.19 23.08 132.436 23.0373 132.67 22.952C132.905 22.8667 133.086 22.696 133.214 22.44C133.364 22.1627 133.438 21.8 133.438 21.352V6.088H137.15V20.296C137.15 21.4267 137.022 22.3333 136.766 23.016C136.51 23.6987 136.148 24.2107 135.678 24.552C135.23 24.8933 134.676 25.1173 134.014 25.224C133.374 25.3307 132.681 25.384 131.934 25.384ZM139.782 25V6.088H143.462V22.44H147.75V25H139.782ZM149.344 25V6.088H158.048V8.712H153.216V13.768H157.312V16.68H153.216V22.44H158.048V25H149.344Z" fill="#D92C2B"/>
          </svg>
        </Link>

        {/* #2: Catalog → direct to /produse listing, no dropdown */}
        <Link href="/produse" className="nav-catalog">
          Catalog
        </Link>

        {/* Search — icon inside on right */}
        <form className="nav-search-form" onSubmit={handleSearch}>
          <input
            ref={inputRef}
            className="nav-search-input"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cauta orice"
          />
          <button className="nav-search-btn" type="submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

        {/* Contact */}
        <Link href="/contact" className="nav-contact">Contact</Link>
      </nav>
    </>
  )
}
