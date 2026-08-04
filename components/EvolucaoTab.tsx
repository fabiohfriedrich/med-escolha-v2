'use client'

import { useEffect, useState } from 'react'
import { Poppins } from 'next/font/google'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import styles from './MedEscolhaLanding.module.css'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap' })

interface Especialidade { id: number; nome: string; pct: number }
interface Resultado { id: string; created_at: string; ranking_json: Especialidade[] }

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function EvolucaoTab() {
  const [resultados, setResultados] = useState<Resultado[] | null>(null)

  useEffect(() => {
    fetch('/api/meus-resultados')
      .then((res) => (res.ok ? res.json() : { resultados: [] }))
      .then((data) => setResultados(data.resultados ?? []))
      .catch(() => setResultados([]))
  }, [])

  if (!resultados) {
    return (
      <div className={`${poppins.className} ${styles.landingRoot}`}>
        <div style={{ height: 160, background: 'var(--offwhite)', borderRadius: 20 }} />
      </div>
    )
  }

  if (resultados.length < 2) {
    return (
      <div className={`${poppins.className} ${styles.landingRoot}`}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, textAlign: 'center' }}>
          <span className={styles.eyebrow}>evolução</span>
          <h2 style={{ margin: 0 }}>ainda não dá pra comparar</h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: 8 }}>
            {resultados.length === 0
              ? 'faça seu primeiro teste pra começar a acompanhar sua evolução.'
              : 'faça um novo teste pra ver como seu match mudou desde o último.'}
          </p>
          <a href="/teste" className={styles.btn}>
            {resultados.length === 0 ? 'fazer meu primeiro teste' : 'refazer o teste'}
          </a>
        </div>
      </div>
    )
  }

  const [atual, anterior] = resultados
  const mapAnterior = new Map(anterior.ranking_json.map((e) => [e.id, e]))
  const idsRelevantes = new Set<number>([
    ...atual.ranking_json.slice(0, 3).map((e) => e.id),
    ...anterior.ranking_json.slice(0, 3).map((e) => e.id),
  ])
  const linhas = atual.ranking_json
    .filter((e) => idsRelevantes.has(e.id))
    .map((e) => {
      const antes = mapAnterior.get(e.id)
      const delta = antes ? e.pct - antes.pct : null
      return { ...e, delta, novaEntrada: !antes }
    })
    .sort((a, b) => b.pct - a.pct)

  return (
    <div className={`${poppins.className} ${styles.landingRoot}`}>
      <div style={{ marginBottom: 20 }}>
        <span className={styles.eyebrow}>evolução</span>
        <h2 style={{ margin: 0 }}>teste anterior x teste atual</h2>
        <p style={{ color: 'var(--text-soft)', fontSize: 13 }}>
          {formatData(anterior.created_at)} → {formatData(atual.created_at)}
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, padding: 8 }}>
        {linhas.map((e, i) => {
          const Icone = e.delta == null ? Minus : e.delta > 0.5 ? TrendingUp : e.delta < -0.5 ? TrendingDown : Minus
          const cor = e.delta == null ? 'var(--text-soft)' : e.delta > 0.5 ? 'var(--teal-dark)' : e.delta < -0.5 ? '#dc2626' : 'var(--text-soft)'
          return (
            <div
              key={e.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)', fontSize: 14 }}>{e.nome}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-soft)' }}>
                  {e.novaEntrada ? 'nova no top 3' : `${(e.pct - (e.delta ?? 0)).toFixed(0)}% → `}
                  <strong style={{ color: 'var(--text)' }}>{e.pct.toFixed(0)}%</strong>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: cor, fontWeight: 700, fontSize: 13 }}>
                <Icone size={16} />
                {e.delta != null && e.delta !== 0 ? `${e.delta > 0 ? '+' : ''}${e.delta.toFixed(0)}%` : '—'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
