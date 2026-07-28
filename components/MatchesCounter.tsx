'use client'

import { useEffect, useState } from 'react'

export default function MatchesCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/stats/matches')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && typeof d.count === 'number') setCount(d.count)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (count === null || count < 20) return null

  return (
    <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)', marginTop: 14 }}>
      <span style={{ display: 'inline-flex', width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
      <span><strong style={{ color: 'white' }}>{count.toLocaleString('pt-BR')}</strong> médicos já descobriram o match da especialidade</span>
    </p>
  )
}
