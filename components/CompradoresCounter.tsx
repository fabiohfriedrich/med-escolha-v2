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
        <strong style={{ fontStyle: 'normal' }}>{count.toLocaleString('pt-BR')}</strong> médicos já fizeram o med escolha
      </p>
    )
  }

  return (
    <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 700, color: 'white', marginTop: 16 }}>
      <span style={{ display: 'inline-flex', width: 10, height: 10, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
      <span><strong style={{ color: 'var(--teal)' }}>{count.toLocaleString('pt-BR')}</strong> médicos já fizeram o med escolha</span>
    </p>
  )
}
