'use client'

import { useState } from 'react'

export default function PdfGate() {
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
        body: JSON.stringify({ email, utmCampaign: 'guia_instagram' }),
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
      <button
        onClick={() => window.print()}
        className="print:hidden"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7c3aed', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
      >
        🖨️ Baixar em PDF
      </button>
    )
  }

  return (
    <form onSubmit={handleSubscribe} className="print:hidden" style={{ background: 'white', borderRadius: 16, padding: '20px 22px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f2d5e', marginBottom: 10 }}>
        Digite seu e-mail pra liberar o download em PDF
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ minWidth: 200, border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 14px', fontSize: 14 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ background: '#7c3aed', color: 'white', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Enviando...' : 'Liberar PDF →'}
        </button>
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </form>
  )
}
