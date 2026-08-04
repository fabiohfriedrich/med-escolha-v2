'use client'

import { useEffect, useState } from 'react'
import { Poppins } from 'next/font/google'
import { Target, CalendarClock, ListChecks, GraduationCap, ArrowRight } from 'lucide-react'
import posthog from 'posthog-js'
import styles from './MedEscolhaLanding.module.css'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap' })

interface DashboardData {
  ultimoResultado: { id: string; createdAt: string; top3: Array<{ id: number; nome: string; pct: number }> } | null
  radar: { ativo: boolean; total: number } | null
  proximoEdital: { instituicao: string; uf: string | null; status: { label: string; background: string; color: string } } | null
  reteste: { agendado: boolean; data?: string }
  cronograma: { total: number; concluidos: number }
}

interface Props {
  primeiroNome: string
  onIrParaCronograma: () => void
  onIrParaResultados: () => void
}

const cardStyle: React.CSSProperties = {
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const iconWrapStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 14,
  background: 'rgba(31, 191, 168, 0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--teal-dark)',
}

export default function PerfilDashboard({ primeiroNome, onIrParaCronograma, onIrParaResultados }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) {
    return (
      <div className={`${poppins.className} ${styles.landingRoot}`} style={{ padding: '40px 0' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 100, background: 'var(--offwhite)', borderRadius: 20, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data.ultimoResultado) {
    return (
      <div className={`${poppins.className} ${styles.landingRoot}`}>
        <div style={{ ...cardStyle, textAlign: 'center', alignItems: 'center', padding: 40 }}>
          <span className={styles.eyebrow}>seu painel</span>
          <h2 style={{ margin: 0 }}>faça seu primeiro teste</h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: 8 }}>
            depois do teste, seu radar de editais, reteste e cronograma aparecem aqui.
          </p>
          <a href="/teste" className={styles.btn}>
            fazer meu primeiro teste
          </a>
        </div>
      </div>
    )
  }

  const { ultimoResultado, radar, proximoEdital, reteste, cronograma } = data
  const pctCronograma = cronograma.total > 0 ? Math.round((cronograma.concluidos / cronograma.total) * 100) : 0

  return (
    <div className={`${poppins.className} ${styles.landingRoot}`}>
      <div style={{ marginBottom: 24 }}>
        <span className={styles.eyebrow}>olá, {primeiroNome}</span>
        <h2 style={{ margin: 0 }}>seu painel</h2>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {/* Top 3 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={iconWrapStyle}><GraduationCap size={22} /></div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--navy)', margin: 0, fontSize: 15 }}>seu top 3</p>
              <p style={{ fontSize: 12, color: 'var(--text-soft)', margin: 0 }}>
                teste feito em {new Date(ultimoResultado.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ultimoResultado.top3.map((e, i) => (
              <span
                key={e.id}
                style={{
                  fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 999,
                  background: i === 0 ? 'var(--navy)' : 'rgba(14,31,77,0.06)',
                  color: i === 0 ? 'var(--white)' : 'var(--navy)',
                }}
              >
                {['🥇', '🥈', '🥉'][i]} {e.nome} · {e.pct.toFixed(0)}%
              </span>
            ))}
          </div>
          <button
            onClick={onIrParaResultados}
            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--teal-dark)', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
          >
            ver todos os testes <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {/* Radar / próximo edital */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconWrapStyle}><Target size={22} /></div>
              <p style={{ fontWeight: 700, color: 'var(--navy)', margin: 0, fontSize: 15 }}>radar de editais</p>
            </div>
            {proximoEdital ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>
                  próximo: <strong style={{ color: 'var(--text)' }}>{proximoEdital.instituicao}</strong>{proximoEdital.uf ? ` · ${proximoEdital.uf}` : ''}
                </p>
                <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: proximoEdital.status.background, color: proximoEdital.status.color }}>
                  {proximoEdital.status.label}
                </span>
              </>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>
                {radar?.ativo ? 'nenhum edital em aberto pras suas especialidades agora.' : 'seu radar ainda não tá ativo.'}
              </p>
            )}
            <a href="/radar" style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-dark)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              ver radar completo <ArrowRight size={14} />
            </a>
          </div>

          {/* Reteste */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconWrapStyle}><CalendarClock size={22} /></div>
              <p style={{ fontWeight: 700, color: 'var(--navy)', margin: 0, fontSize: 15 }}>próximo reteste</p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>
              {reteste.agendado ? <>te avisamos em <strong style={{ color: 'var(--text)' }}>{reteste.data}</strong>.</> : 'nenhum reteste agendado ainda.'}
            </p>
            <button
              onClick={() => { onIrParaCronograma(); posthog.capture('dashboard_reteste_clicado') }}
              style={{ alignSelf: 'flex-start', fontSize: 13, fontWeight: 700, color: 'var(--teal-dark)', background: 'none', border: 0, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              {reteste.agendado ? 'mudar data' : 'agendar'} <ArrowRight size={14} />
            </button>
          </div>

          {/* Cronograma */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconWrapStyle}><ListChecks size={22} /></div>
              <p style={{ fontWeight: 700, color: 'var(--navy)', margin: 0, fontSize: 15 }}>cronograma</p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-soft)', marginBottom: 6 }}>
                <span>{cronograma.concluidos} de {cronograma.total} concluídos</span>
                <span>{pctCronograma}%</span>
              </div>
              <div style={{ width: '100%', background: 'var(--offwhite)', borderRadius: 999, height: 8 }}>
                <div style={{ width: `${pctCronograma}%`, background: 'var(--teal)', borderRadius: 999, height: 8, transition: 'width 0.3s' }} />
              </div>
            </div>
            <button
              onClick={() => { onIrParaCronograma(); posthog.capture('dashboard_cronograma_clicado') }}
              style={{ alignSelf: 'flex-start', fontSize: 13, fontWeight: 700, color: 'var(--teal-dark)', background: 'none', border: 0, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              ver cronograma completo <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
