'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Especialidade {
  slug: string
  nome: string
  icon: string
  tags: string[]
  badges: { texto: string; cor: string }[]
  resumo: string
  salario_faixa: string
  duracao: string
  concorrencia: number
  crescimento_10a: string
}

const BADGE_STYLE: Record<string, React.CSSProperties> = {
  hot:    { background: '#fef2f2', color: '#dc2626' },
  up:     { background: '#f0fdf4', color: '#16a34a' },
  blue:   { background: '#eff6ff', color: '#1d4ed8' },
  yellow: { background: '#fefce8', color: '#854d0e' },
}

const FILTERS = [
  { label: 'Todas (55)', value: 'all' },
  { label: '🔥 Muito concorridas', value: 'concorrida' },
  { label: '📈 Em crescimento', value: 'crescimento' },
  { label: '💰 Alta remuneração', value: 'remuneracao' },
  { label: '🌿 Qualidade de vida', value: 'qv' },
]

export default function GuiasGrid({ especialidades }: { especialidades: Especialidade[] }) {
  const [filtro, setFiltro] = useState('all')
  const [busca, setBusca] = useState('')

  const filtradas = especialidades.filter(e => {
    const matchTag = filtro === 'all' || e.tags.includes(filtro)
    const matchBusca = !busca.trim() || e.nome.toLowerCase().includes(busca.toLowerCase())
    return matchTag && matchBusca
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)', color: 'white', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, marginBottom: 8 }}>
            Med Escolha · Guias de Especialidade
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
            As 20 especialidades mais buscadas do Brasil
          </h1>
          <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 520 }}>
            Mercado, remuneração, como é a residência e se o perfil combina com você — tudo em um lugar.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20, border: '1px solid',
                cursor: 'pointer', transition: 'all .15s',
                background: filtro === f.value ? '#1e3a5f' : 'white',
                color: filtro === f.value ? 'white' : '#374151',
                borderColor: filtro === f.value ? '#1e3a5f' : '#e5e7eb',
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{
                padding: '6px 12px 6px 32px', fontSize: 13, border: '1px solid #e5e7eb',
                borderRadius: 20, outline: 'none', background: '#f9fafb', width: 180,
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9ca3af' }}>🔍</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 48px' }}>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>{filtradas.length} especialidades</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
          {filtradas.map(e => (
            <Link key={e.slug} href={`/guias/${e.slug}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 14,
                  padding: '16px', cursor: 'pointer', transition: 'all .15s', height: '100%',
                }}
                onMouseEnter={el => {
                  (el.currentTarget as HTMLDivElement).style.borderColor = '#93c5fd'
                  ;(el.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(30,58,95,.1)'
                  ;(el.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={el => {
                  (el.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'
                  ;(el.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  ;(el.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                }}
              >
                {/* Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>{e.icon}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    {e.badges.slice(0, 1).map((b, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, ...BADGE_STYLE[b.cor] }}>
                        {b.texto}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 5, lineHeight: 1.3 }}>{e.nome}</h3>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 10 }}>{e.resumo}</p>

                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>{e.salario_faixa}</p>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: i <= e.concorrencia
                            ? e.concorrencia >= 4 ? '#ef4444' : e.concorrencia === 3 ? '#f59e0b' : '#1e3a5f'
                            : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: '#2d6a9f', fontWeight: 600 }}>Ver guia →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontWeight: 700 }}>Nenhuma especialidade encontrada</p>
          </div>
        )}

        {/* CTA Quiz */}
        <div style={{
          marginTop: 40, background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)',
          borderRadius: 16, padding: '28px 32px', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Não sabe por onde começar?</h3>
            <p style={{ fontSize: 13, opacity: 0.85 }}>Responda 10 perguntas e descubra quais especialidades combinam com seu perfil.</p>
          </div>
          <Link href="/quiz-rapido" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#fbbf24', color: '#1e3a5f', fontWeight: 700, fontSize: 14,
              padding: '12px 24px', borderRadius: 9, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              🎯 Fazer quiz gratuito →
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
