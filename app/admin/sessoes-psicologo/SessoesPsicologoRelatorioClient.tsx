'use client'

import { useEffect, useState } from 'react'

interface Registro {
  id: string
  pacote_id: string
  data_call: string
  resumo: string
  created_at: string
  pacotes_psicologo: { email: string; nome: string | null } | null
}

interface Relatorio {
  total_geral: number
  por_mes: { mes: string; total: number; compradores_distintos: number }[]
  registros: Registro[]
}

const MESES_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function formatarMes(mes: string) {
  const [ano, mesNum] = mes.split('-')
  return `${MESES_PT[Number(mesNum) - 1]}/${ano}`
}

export default function SessoesPsicologoRelatorioClient() {
  const [dados, setDados] = useState<Relatorio | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/sessoes-psicologo-relatorio')
      .then((r) => r.json())
      .then((d) => (d.error ? setErro(d.error) : setDados(d)))
      .catch(() => setErro('Não foi possível carregar o relatório.'))
  }, [])

  if (erro) return <p className="text-red-500 text-sm">{erro}</p>
  if (!dados) return <p className="text-gray-400 text-sm">Carregando...</p>

  const maxMes = Math.max(...dados.por_mes.map((m) => m.total), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">Sessões realizadas (total)</p>
          <p className="text-2xl font-extrabold text-blue-900">{dados.total_geral}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">Meses com sessão registrada</p>
          <p className="text-2xl font-extrabold text-blue-900">{dados.por_mes.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-400 mb-4">Sessões por mês</p>
        {dados.por_mes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma sessão registrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {dados.por_mes.map((m) => {
              const pct = Math.max((m.total / maxMes) * 100, 4)
              return (
                <div key={m.mes}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500 capitalize">{formatarMes(m.mes)}</span>
                    <span className="text-sm font-bold text-blue-700">
                      {m.total} sessõe{m.total !== 1 ? 's' : ''} · {m.compradores_distintos} comprador{m.compradores_distintos !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-400 mb-4">Histórico completo</p>
        {dados.registros.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma sessão registrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {dados.registros.map((r) => (
              <div key={r.id} className="text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    {r.pacotes_psicologo?.nome || r.pacotes_psicologo?.email || '(comprador removido)'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.data_call + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{r.resumo}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
