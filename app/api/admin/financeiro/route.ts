import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { resolverFaixa, inicioDiaSPms, fimDiaSPms, type PresetFiltro } from '@/lib/financeiro/date-ranges'
import { buscarGastoMeta, buscarPerformanceCriativos } from '@/lib/financeiro/meta-ads'
import { buscarReceitaHotmart } from '@/lib/financeiro/hotmart'

const PRESETS_VALIDOS: PresetFiltro[] = ['hoje', 'ontem', '7dias', 'este_mes', 'mes_passado']

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const presetParam = searchParams.get('preset')
  const preset = PRESETS_VALIDOS.includes(presetParam as PresetFiltro) ? (presetParam as PresetFiltro) : null
  const faixa = resolverFaixa(preset, searchParams.get('from'), searchParams.get('to'))

  // Resumo do mês corrente é fixo, independente do filtro. Se o filtro já for o mês
  // corrente, reaproveita os mesmos dados em vez de chamar Meta/Hotmart de novo.
  const faixaMes = resolverFaixa('este_mes', null, null)
  const filtroEhMes = faixaMes.from === faixa.from && faixaMes.to === faixa.to

  // Cada fonte falha sozinha: se o token do Meta expirar, a Hotmart continua aparecendo
  // (e vice-versa). A falha volta no campo `erro` da própria fonte.
  const [gasto, receita, criativos, gastoMes, receitaMes] = await Promise.all([
    tentar(() => buscarGastoMeta(faixa.from, faixa.to), { configurado: true, total: 0, campanhas: [] }),
    tentar(() => buscarReceitaHotmart(inicioDiaSPms(faixa.from), fimDiaSPms(faixa.to)), RECEITA_VAZIA),
    tentar(() => buscarPerformanceCriativos(faixa.from, faixa.to), { configurado: true, criativos: [] }),
    filtroEhMes ? null : tentar(() => buscarGastoMeta(faixaMes.from, faixaMes.to), { configurado: true, total: 0, campanhas: [] }),
    filtroEhMes ? null : tentar(() => buscarReceitaHotmart(inicioDiaSPms(faixaMes.from), fimDiaSPms(faixaMes.to)), RECEITA_VAZIA),
  ])

  const mes = { faixa: faixaMes, gasto: gastoMes ?? gasto, receita: receitaMes ?? receita }

  return NextResponse.json({ faixa, gasto, receita, criativos, mes })
}

const RECEITA_VAZIA = { configurado: true, total: 0, totalLiquido: 0, vendas: 0, reembolsos: 0, produtos: [] }

async function tentar<T extends object>(fn: () => Promise<T>, vazio: T): Promise<T & { erro?: string }> {
  try {
    return await fn()
  } catch (err) {
    return { ...vazio, erro: err instanceof Error ? err.message : String(err) }
  }
}
