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
