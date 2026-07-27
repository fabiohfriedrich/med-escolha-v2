'use client'

import { useState } from 'react'

export default function DownloadGate() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [liberado, setLiberado] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, utmCampaign: 'planilha_financeira' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Não foi possível realizar a inscrição. Tente novamente.')
        return
      }
      setLiberado(true)
    } catch {
      setError('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (liberado) {
    return (
      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#065f46', marginBottom: 14 }}>Planilha liberada!</p>
        <a
          href="/downloads/planilha-financeira-medico.xlsx"
          download
          style={{ display: 'inline-block', background: '#059669', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}
        >
          ⬇️ Baixar planilha (.xlsx)
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubscribe} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', border: '1px solid #e2e8f0' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2d5e', marginBottom: 12 }}>
        Digite seu e-mail pra baixar a planilha gratuitamente
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ flex: 1, minWidth: 200, border: '1px solid #cbd5e1', borderRadius: 10, padding: '12px 14px', fontSize: 14 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ background: '#059669', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Enviando...' : 'Quero a planilha →'}
        </button>
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </form>
  )
}
