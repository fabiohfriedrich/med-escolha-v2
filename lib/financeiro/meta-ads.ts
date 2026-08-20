// Gasto em campanhas do Med Escolha via Meta Marketing API (Graph API Insights).
// Mesmo padrão usado em scripts/diagnostico_ads_med_escolha.py: conta compartilhada
// "AM - CA01" (também tem campanhas da Amo Medicina e Tríade), então sempre filtra
// pelo prefixo [ME] no nome da campanha.

const GRAPH_VERSION = 'v21.0'
const ACCOUNT_ID = 'act_692539635216356'
const CAMPAIGN_PREFIX = '[ME]'

export interface GastoCampanha {
  id: string
  nome: string
  gasto: number
  impressoes: number
  cliques: number
}

export interface GastoMeta {
  configurado: boolean
  total: number
  campanhas: GastoCampanha[]
}

export async function buscarGastoMeta(from: string, to: string): Promise<GastoMeta> {
  const token = process.env.META_ADS_TOKEN
  if (!token) return { configurado: false, total: 0, campanhas: [] }

  const params = new URLSearchParams({
    level: 'campaign',
    time_range: JSON.stringify({ since: from, until: to }),
    fields: 'campaign_id,campaign_name,spend,impressions,actions',
    limit: '500',
    access_token: token,
  })

  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${ACCOUNT_ID}/insights?${params.toString()}`, {
    cache: 'no-store',
  })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Erro ao buscar gasto no Meta Ads')
  }

  const campanhas: GastoCampanha[] = (data.data ?? [])
    .filter((linha: Record<string, unknown>) => String(linha.campaign_name ?? '').startsWith(CAMPAIGN_PREFIX))
    .map((linha: Record<string, unknown>) => {
      const actions = (linha.actions as Array<{ action_type: string; value: string }> | undefined) ?? []
      const cliques = actions.find(a => a.action_type === 'link_click')?.value
      return {
        id: String(linha.campaign_id),
        nome: String(linha.campaign_name),
        gasto: Number(linha.spend) || 0,
        impressoes: Number(linha.impressions) || 0,
        cliques: Number(cliques) || 0,
      }
    })
    .sort((a: GastoCampanha, b: GastoCampanha) => b.gasto - a.gasto)

  const total = campanhas.reduce((soma, c) => soma + c.gasto, 0)

  return { configurado: true, total, campanhas }
}

// "Resultado" de compra direto do pixel, na mesma ordem de prioridade que o Ads Manager usa
// pra mostrar "Compras" por padrão (omni_purchase é a métrica unificada mais nova da Meta).
const ACOES_COMPRA = ['omni_purchase', 'offsite_conversion.fb_pixel_purchase', 'web_in_store_purchase']

function extrairCompras(actions: Array<{ action_type: string; value: string }> | undefined): number {
  if (!actions) return 0
  for (const tipo of ACOES_COMPRA) {
    const acao = actions.find(a => a.action_type === tipo)
    if (acao) return Number(acao.value) || 0
  }
  return 0
}

export interface CriativoPerformance {
  id: string
  nome: string
  campanha: string
  gasto: number
  impressoes: number
  cliques: number
  compras: number
  ctr: number
  cpm: number
  custoPorClique: number | null
}

export interface PerformanceCriativos {
  configurado: boolean
  criativos: CriativoPerformance[]
}

export async function buscarPerformanceCriativos(from: string, to: string): Promise<PerformanceCriativos> {
  const token = process.env.META_ADS_TOKEN
  if (!token) return { configurado: false, criativos: [] }

  const criativos: CriativoPerformance[] = []
  let after: string | undefined

  do {
    const params = new URLSearchParams({
      level: 'ad',
      time_range: JSON.stringify({ since: from, until: to }),
      fields: 'ad_id,ad_name,campaign_name,spend,impressions,clicks,actions,cpm',
      limit: '500',
      access_token: token,
    })
    if (after) params.set('after', after)

    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${ACCOUNT_ID}/insights?${params.toString()}`, {
      cache: 'no-store',
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error?.message ?? 'Erro ao buscar criativos no Meta Ads')
    }

    for (const linha of (data.data ?? []) as Record<string, unknown>[]) {
      if (!String(linha.campaign_name ?? '').startsWith(CAMPAIGN_PREFIX)) continue

      const gasto = Number(linha.spend) || 0
      if (gasto <= 0) continue // ignora criativos sem gasto no período (ruído)

      const actions = linha.actions as Array<{ action_type: string; value: string }> | undefined
      const impressoes = Number(linha.impressions) || 0
      const cliques = Number(actions?.find(a => a.action_type === 'link_click')?.value) || 0

      criativos.push({
        id: String(linha.ad_id),
        nome: String(linha.ad_name),
        campanha: String(linha.campaign_name),
        gasto,
        impressoes,
        cliques,
        compras: extrairCompras(actions),
        ctr: impressoes > 0 ? (cliques / impressoes) * 100 : 0,
        cpm: Number(linha.cpm) || 0,
        custoPorClique: cliques > 0 ? gasto / cliques : null,
      })
    }

    const paging = data?.paging as { next?: string; cursors?: { after?: string } } | undefined
    after = paging?.next ? paging.cursors?.after : undefined
  } while (after)

  criativos.sort((a, b) => b.gasto - a.gasto)

  return { configurado: true, criativos }
}
