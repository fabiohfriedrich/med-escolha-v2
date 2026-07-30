'use client'

import { useEffect, useState } from 'react'

type Variant = 'hero' | 'authority'

export default function CompradoresCounter({ variant = 'hero' }: { variant?: Variant }) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/stats/compradores')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && typeof d.count === 'number') setCount(d.count)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (count === null) return null

  if (variant === 'authority') {
    return (
      <p style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, fontStyle: 'italic', color: 'var(--navy)', marginTop: 4 }}>
        <strong style={{ fontStyle: 'normal' }}>{count.toLocaleString('pt-BR')}</strong> médicos já compraram o Med Escolha
      </p>
    )
  }

  return (
    <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)', marginTop: 8 }}>
      <span style={{ display: 'inline-flex', width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
      <span><strong style={{ color: 'white' }}>{count.toLocaleString('pt-BR')}</strong> médicos já compraram o Med Escolha</span>
    </p>
  )
}
