'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import posthog from 'posthog-js'
import KitTop3OfertaCard from '@/components/KitTop3OfertaCard'

interface Especialidade {
  id: number
  nome: string
  pct: number
}

interface Props {
  top3: Especialidade[]
  resultadoId?: string
}

type RadarState = 'loading' | { ativo: boolean; total: number }
type RetesteState = 'loading' | { agendado: boolean; data?: string }
type IndicacaoState = 'loading' | { codigo: string | null; confirmadas: number; meta: number }
type KitTop3State = 'loading' | { desbloqueado: boolean; consultaFalhou: boolean }

export default function PosResultadoActions({ top3, resultadoId }: Props) {
  const [radar, setRadar] = useState<RadarState>('loading')
  const [reteste, setReteste] = useState<RetesteState>('loading')
  const [indicacao, setIndicacao] = useState<IndicacaoState>('loading')
  const [kitTop3, setKitTop3] = useState<KitTop3State>('loading')
  const [ativandoRadar, setAtivandoRadar] = useState(false)
  const [agendandoReteste, setAgendandoReteste] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/radar/meu-radar')
      .then(res => (res.ok ? res.json() : { radar: null }))
      .then(data => setRadar({ ativo: !!data.radar?.alertas_ativos, total: data.radar?.especialidade_ids?.length ?? 0 }))
      .catch(() => setRadar({ ativo: false, total: 0 }))

    fetch('/api/agendar-reteste')
      .then(res => (res.ok ? res.json() : { agendado: false }))
      .then(data => setReteste({ agendado: !!data.agendado, data: data.data }))
      .catch(() => setReteste({ agendado: false }))

    fetch('/api/indicacoes')
      .then(res => (res.ok ? res.json() : { codigo: null, confirmadas: 0, meta: 3 }))
      .then(data => setIndicacao({ codigo: data.codigo, confirmadas: data.confirmadas ?? 0, meta: data.meta ?? 3 }))
      .catch(() => setIndicacao({ codigo: null, confirmadas: 0, meta: 3 }))

    fetch('/api/produtos-digitais/kit-top3/status')
      .then(async res => (res.ok ? { data: await res.json(), consultaFalhou: false } : { data: null, consultaFalhou: true }))
      .then(({ data, consultaFalhou }) => setKitTop3({ desbloqueado: data?.status === 'desbloqueado', consultaFalhou }))
      .catch(() => setKitTop3({ desbloqueado: false, consultaFalhou: true }))
  }, [])

  async function ativarRadar() {
    setAtivandoRadar(true)
    try {
      const res = await fetch('/api/radar/meu-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ especialidade_ids: top3.map(e => e.id), ufs: [], alertas_ativos: true }),
      })
      if (res.ok) {
        setRadar({ ativo: true, total: top3.length })
        posthog.capture('pos_resultado_radar_ativado')
      }
    } finally {
      setAtivandoRadar(false)
    }
  }

  async function agendarReteste6m() {
    setAgendandoReteste(true)
    try {
      const res = await fetch('/api/agendar-reteste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultadoId, meses: 6 }),
      })
      const data = await res.json()
      if (data.ok) {
        setReteste({ agendado: true, data: data.data })
        posthog.capture('pos_resultado_reteste_agendado')
      }
    } finally {
      setAgendandoReteste(false)
    }
  }

  function copiarLinkIndicacao() {
    if (indicacao === 'loading' || !indicacao.codigo) return
    const link = `${window.location.origin}/?ref=${indicacao.codigo}`
    navigator.clipboard.writeText(link)
    setCopiado(true)
    posthog.capture('pos_resultado_indicacao_copiada')
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <section>
      <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Seus próximos passos</h2>
      <div className="w-10 h-1 bg-teal-400 rounded mb-5" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kitTop3 === 'loading' ? (
          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-5">
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ) : (
          <KitTop3OfertaCard desbloqueado={kitTop3.desbloqueado} origem="pos_resultado" compacto consultaFalhou={kitTop3.consultaFalhou} />
        )}

        {/* Radar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <div className="text-2xl">🎯</div>
          {radar === 'loading' ? (
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ) : radar.ativo ? (
            <>
              <div>
                <p className="font-bold text-blue-900 text-sm">Radar ativo</p>
                <p className="text-xs text-gray-500 mt-1">
                  {radar.total} especialidade{radar.total !== 1 ? 's' : ''} monitorada{radar.total !== 1 ? 's' : ''}. Avisamos por e-mail sobre novos editais.
                </p>
              </div>
              <Link
                href="/radar/meu-radar"
                onClick={() => posthog.capture('pos_resultado_radar_ajustar_clicado')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Ajustar radar →
              </Link>
            </>
          ) : (
            <>
              <div>
                <p className="font-bold text-blue-900 text-sm">Ative seu radar</p>
                <p className="text-xs text-gray-500 mt-1">Alerta por e-mail de editais das suas top 3 especialidades.</p>
              </div>
              <button
                onClick={ativarRadar}
                disabled={ativandoRadar}
                className="text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-3 py-2 disabled:opacity-60"
              >
                {ativandoRadar ? 'Ativando...' : 'Ativar radar'}
              </button>
            </>
          )}
        </div>

        {/* Reteste */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <div className="text-2xl">📅</div>
          {reteste === 'loading' ? (
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ) : reteste.agendado ? (
            <>
              <div>
                <p className="font-bold text-blue-900 text-sm">Reteste agendado</p>
                <p className="text-xs text-gray-500 mt-1">Te avisamos em <strong>{reteste.data}</strong> pra refazer o teste.</p>
              </div>
              <Link href="/perfil?tab=cronograma" className="text-xs font-bold text-blue-700 hover:underline">
                Mudar data →
              </Link>
            </>
          ) : (
            <>
              <div>
                <p className="font-bold text-blue-900 text-sm">Acompanhe sua evolução</p>
                <p className="text-xs text-gray-500 mt-1">Agende um lembrete pra refazer o teste em 6 meses.</p>
              </div>
              <button
                onClick={agendarReteste6m}
                disabled={agendandoReteste}
                className="text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-3 py-2 disabled:opacity-60"
              >
                {agendandoReteste ? 'Agendando...' : 'Agendar lembrete'}
              </button>
            </>
          )}
        </div>

        {/* Indicação */}
        {indicacao === 'loading' ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ) : indicacao.codigo ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="text-2xl">🤝</div>
            <div>
              <p className="font-bold text-blue-900 text-sm">Indique um colega</p>
              <p className="text-xs text-gray-500 mt-1">{indicacao.confirmadas} de {indicacao.meta} indicações confirmadas.</p>
            </div>
            <button
              onClick={copiarLinkIndicacao}
              className="text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-3 py-2"
            >
              {copiado ? 'Link copiado!' : 'Copiar meu link'}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
