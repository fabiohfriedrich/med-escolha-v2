'use client'

import { useEffect, useState, useCallback } from 'react'
import GraficoGastoReceita from './GraficoGastoReceita'

type PresetFiltro = 'hoje' | 'ontem' | '7dias' | 'este_mes' | 'mes_passado'
type Filtro = PresetFiltro | 'personalizado'

const OPCOES_FILTRO: { valor: Filtro; label: string }[] = [
  { valor: 'hoje', label: 'Hoje' },
  { valor: 'ontem', label: 'Ontem' },
  { valor: '7dias', label: 'Últimos 7 dias' },
  { valor: 'este_mes', label: 'Este mês' },
  { valor: 'mes_passado', label: 'Mês passado' },
  { valor: 'personalizado', label: 'Personalizado' },
]

interface GastoCampanha { id: string; nome: string; gasto: number; impressoes: number; cliques: number }
interface ReceitaProduto { id: string; nome: string; vendas: number; receita: number; receitaLiquida: number }
interface CriativoPerformance {
  id: string; nome: string; campanha: string; gasto: number; impressoes: number
  cliques: number; compras: number; ctr: number; cpm: number; custoPorClique: number | null
}

interface RespostaApi {
  faixa: { from: string; to: string }
  gasto: { configurado: boolean; total: number; campanhas: GastoCampanha[] }
  receita: { configurado: boolean; total: number; totalLiquido: number; vendas: number; cancelamentos: number; produtos: ReceitaProduto[] }
  criativos: { configurado: boolean; criativos: CriativoPerformance[] }
}

const fmtMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtNum = (v: number) => v.toLocaleString('pt-BR')
const fmtDataBr = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

function Card({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function AvisoNaoConfigurado({ nome }: { nome: string }) {
  return (
    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
      {nome} não configurado — faltam variáveis de ambiente no Vercel.
    </p>
  )
}

export default function FinanceiroClient() {
  const [filtro, setFiltro] = useState<Filtro>('hoje')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [dados, setDados] = useState<RespostaApi | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const buscar = useCallback(async (preset: PresetFiltro | null, from?: string, to?: string) => {
    setCarregando(true)
    setErro(null)
    try {
      const params = new URLSearchParams()
      if (preset) params.set('preset', preset)
      else if (from && to) { params.set('from', from); params.set('to', to) }

      const res = await fetch(`/api/admin/financeiro?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Erro ao carregar dados')
      setDados(json)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (filtro === 'personalizado') return
    buscar(filtro)
  }, [filtro, buscar])

  function aplicarPersonalizado() {
    if (!customFrom || !customTo) return
    buscar(null, customFrom, customTo)
  }

  const gasto = dados?.gasto
  const receita = dados?.receita
  const criativos = dados?.criativos
  const roas = gasto && gasto.total > 0 && receita ? receita.total / gasto.total : null

  const rankeaveis = (criativos?.criativos ?? []).filter(c => c.cliques > 0)
  const melhorId = rankeaveis.length
    ? rankeaveis.reduce((m, c) => (c.custoPorClique! < m.custoPorClique! ? c : m)).id
    : null
  const piorId = rankeaveis.length > 1
    ? rankeaveis.reduce((m, c) => (c.custoPorClique! > m.custoPorClique! ? c : m)).id
    : null

  return (
    <div className="space-y-8">
      {/* Filtros de data */}
      <div className="flex flex-wrap items-center gap-2">
        {OPCOES_FILTRO.map(op => (
          <button
            key={op.valor}
            onClick={() => setFiltro(op.valor)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtro === op.valor ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {op.label}
          </button>
        ))}

        {filtro === 'personalizado' && (
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700" />
            <span className="text-gray-400 text-sm">até</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700" />
            <button onClick={aplicarPersonalizado} disabled={!customFrom || !customTo}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-700 text-white disabled:opacity-40">
              Aplicar
            </button>
          </div>
        )}
      </div>

      {dados && (
        <p className="text-xs text-gray-400">
          Período: {fmtDataBr(dados.faixa.from)} até {fmtDataBr(dados.faixa.to)}
        </p>
      )}

      {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{erro}</p>}

      {carregando && !dados && <p className="text-gray-400 text-sm">Carregando…</p>}

      {dados && (
        <>
          {/* Resumo geral */}
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Resumo geral</h2>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <Card label="Gasto em campanhas" value={fmtMoeda(gasto?.total ?? 0)} color="text-red-600" />
              <Card label="Receita bruta" value={fmtMoeda(receita?.total ?? 0)} color="text-green-600" />
              <Card label="Receita líquida" value={fmtMoeda(receita?.totalLiquido ?? 0)} sub="Após taxa da Hotmart" color="text-emerald-600" />
              <Card label="Vendas aprovadas" value={fmtNum(receita?.vendas ?? 0)}
                sub={receita && receita.vendas > 0 ? `Ticket médio: ${fmtMoeda(receita.total / receita.vendas)}` : undefined}
                color="text-blue-700" />
              <Card label="Cancelamentos" value={fmtNum(receita?.cancelamentos ?? 0)}
                sub={receita && receita.vendas + receita.cancelamentos > 0
                  ? `Taxa: ${((receita.cancelamentos / (receita.vendas + receita.cancelamentos)) * 100).toFixed(1)}%`
                  : undefined}
                color="text-orange-600" />
              <Card label="ROAS" value={roas !== null ? `${roas.toFixed(2)}x` : '—'} sub="Receita bruta / Gasto" color="text-purple-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GraficoGastoReceita gasto={gasto?.total ?? 0} receita={receita?.total ?? 0} />
              <div className="flex flex-col justify-center gap-2">
                {gasto && !gasto.configurado && <AvisoNaoConfigurado nome="Meta Ads" />}
                {receita && !receita.configurado && <AvisoNaoConfigurado nome="Hotmart" />}
              </div>
            </div>
          </div>

          {/* Detalhado */}
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Detalhado</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Receita por produto (Hotmart)</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendas</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Receita bruta</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Receita líquida</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(receita?.produtos ?? []).map(p => (
                        <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-5 py-3 font-medium text-gray-800">{p.nome}</td>
                          <td className="px-5 py-3 text-right text-gray-600">{fmtNum(p.vendas)}</td>
                          <td className="px-5 py-3 text-right font-semibold text-green-700">{fmtMoeda(p.receita)}</td>
                          <td className="px-5 py-3 text-right text-emerald-600">{fmtMoeda(p.receitaLiquida)}</td>
                          <td className="px-5 py-3 text-right text-gray-500">{fmtMoeda(p.receita / p.vendas)}</td>
                        </tr>
                      ))}
                      {!(receita?.produtos ?? []).length && (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                          {receita?.configurado ? 'Nenhuma venda no período.' : 'Hotmart não configurado.'}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Gasto por campanha (Meta Ads)</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Campanha</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Gasto</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliques</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Custo/clique</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(gasto?.campanhas ?? []).map(c => (
                        <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-5 py-3 font-medium text-gray-800">{c.nome}</td>
                          <td className="px-5 py-3 text-right font-semibold text-red-600">{fmtMoeda(c.gasto)}</td>
                          <td className="px-5 py-3 text-right text-gray-600">{fmtNum(c.cliques)}</td>
                          <td className="px-5 py-3 text-right text-gray-500">{c.cliques > 0 ? fmtMoeda(c.gasto / c.cliques) : '—'}</td>
                        </tr>
                      ))}
                      {!(gasto?.campanhas ?? []).length && (
                        <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                          {gasto?.configurado ? 'Nenhuma campanha [ME] com gasto no período.' : 'Meta Ads não configurado.'}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Performance de criativos (Meta Ads)</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="max-h-[520px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Criativo</th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Gasto</th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliques</th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Compras</th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">CTR</th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">CPM</th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Custo/clique</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(criativos?.criativos ?? []).map(c => (
                          <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-5 py-3 font-medium text-gray-800">
                              <div className="flex items-center gap-2">
                                <span className="max-w-xs truncate" title={c.nome}>{c.nome}</span>
                                {c.id === melhorId && (
                                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Melhor</span>
                                )}
                                {c.id === piorId && (
                                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Pior</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">{c.campanha}</span>
                            </td>
                            <td className="px-5 py-3 text-right font-semibold text-red-600">{fmtMoeda(c.gasto)}</td>
                            <td className="px-5 py-3 text-right text-gray-600">{fmtNum(c.cliques)}</td>
                            <td className="px-5 py-3 text-right text-gray-600">{fmtNum(c.compras)}</td>
                            <td className="px-5 py-3 text-right text-gray-500">{c.ctr.toFixed(2)}%</td>
                            <td className="px-5 py-3 text-right text-gray-500">{fmtMoeda(c.cpm)}</td>
                            <td className="px-5 py-3 text-right text-gray-500">{c.custoPorClique !== null ? fmtMoeda(c.custoPorClique) : '—'}</td>
                          </tr>
                        ))}
                        {!(criativos?.criativos ?? []).length && (
                          <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                            {criativos?.configurado ? 'Nenhum criativo com gasto no período.' : 'Meta Ads não configurado.'}
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
