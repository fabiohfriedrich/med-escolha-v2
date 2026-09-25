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

  try {
    const [gasto, receita, criativos, gastoMes, receitaMes] = await Promise.all([
      buscarGastoMeta(faixa.from, faixa.to),
      buscarReceitaHotmart(inicioDiaSPms(faixa.from), fimDiaSPms(faixa.to)),
      buscarPerformanceCriativos(faixa.from, faixa.to),
      filtroEhMes ? null : buscarGastoMeta(faixaMes.from, faixaMes.to),
      filtroEhMes ? null : buscarReceitaHotmart(inicioDiaSPms(faixaMes.from), fimDiaSPms(faixaMes.to)),
    ])

    const mes = { faixa: faixaMes, gasto: gastoMes ?? gasto, receita: receitaMes ?? receita }

    return NextResponse.json({ faixa, gasto, receita, criativos, mes })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
