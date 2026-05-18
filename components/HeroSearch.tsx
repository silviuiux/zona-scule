'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroSearch({ totalCount }: { totalCount?: number }) {
  const [q, setQ] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) router.push(`/produse?q=${encodeURIComponent(q.trim())}`)
    else router.push('/produse')
  }

  return (
    <form onSubmit={handleSubmit} className="hero-search-box">
      <button type="submit" className="hero-search-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <div className="hero-search-input-wrap">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder=""
        />
        {!q && (
          <span className="hero-search-placeholder">
            {totalCount ? (
              <>cauta in <span className="hero-search-placeholder-count">{totalCount.toLocaleString('ro')}</span> de scule, unelte sau accesorii</>
            ) : 'cauta scule, branduri, accesorii'}
          </span>
        )}
      </div>
    </form>
  )
}
