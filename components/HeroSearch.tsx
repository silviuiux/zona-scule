'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroSearch() {
  const [q, setQ] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) router.push(`/produse?q=${encodeURIComponent(q.trim())}`)
    else router.push('/produse')
  }

  return (
    <form onSubmit={handleSubmit} className="hero-search-box">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Cauta scule, branduri, accesorii"
      />
      <button type="submit" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', padding: '2px',
        color: 'rgba(0,0,0,0.3)', flexShrink: 0,
        transition: 'color 150ms',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </form>
  )
}
