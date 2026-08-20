// Receita de vendas do Med Escolha via Hotmart Sales History API.
// Credenciais em developers.hotmart.com > Ferramentas > Credenciais de acesso (OAuth
// client credentials, diferente do HOTMART_HOTTOK usado no webhook de compra).

const AUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token'
const SALES_URL = 'https://developers.hotmart.com/payments/api/v1/sales/history'

// Só esses status representam venda paga (mesmo critério do webhook em
// app/api/webhook/hotmart/route.ts, EVENTOS_APROVADOS).
const STATUS_RECEITA = new Set(['APPROVED', 'COMPLETE'])

let tokenCache: { valor: string; expiraEm: number } | null = null

async function obterTokenHotmart(): Promise<string> {
  const clientId = process.env.HOTMART_CLIENT_ID
  const clientSecret = process.env.HOTMART_CLIENT_SECRET
  const basic = process.env.HOTMART_BASIC_TOKEN
  if (!clientId || !clientSecret || !basic) throw new Error('HOTMART_NAO_CONFIGURADO')

  if (tokenCache && tokenCache.expiraEm > Date.now()) return tokenCache.valor

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch(`${AUTH_URL}?${params.toString()}`, {
    method: 'POST',
    headers: { Authorization: basic },
    cache: 'no-store',
  })
  const data = await res.json()

  if (!res.ok || !data.access_token) {
    throw new Error(data?.error_description ?? 'Erro ao autenticar na Hotmart')
  }

  // Token vale 24h — renova com 5min de folga antes de expirar.
  tokenCache = { valor: data.access_token, expiraEm: Date.now() + (Number(data.expires_in ?? 3600) - 300) * 1000 }
  return tokenCache.valor
}

interface SaleHistoryItem {
  product?: { id?: number | string; name?: string }
  purchase?: { status?: string; price?: { value?: number } }
}

export interface ReceitaProduto {
  id: string
  nome: string
  vendas: number
  receita: number
}

export interface ReceitaHotmart {
  configurado: boolean
  total: number
  vendas: number
  produtos: ReceitaProduto[]
}

export async function buscarReceitaHotmart(fromMs: number, toMs: number): Promise<ReceitaHotmart> {
  if (!process.env.HOTMART_CLIENT_ID) return { configurado: false, total: 0, vendas: 0, produtos: [] }

  const token = await obterTokenHotmart()

  // Opcional: restringir a produtos específicos do Med Escolha (ex: se a mesma conta
  // Hotmart também vender outros produtos da Amo Medicina). Sem essa env, traz tudo.
  const idsPermitidos = (process.env.HOTMART_PRODUCT_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean)

  const produtos = new Map<string, ReceitaProduto>()
  let total = 0
  let vendas = 0
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      start_date: String(fromMs),
      end_date: String(toMs),
      max_results: '500',
    })
    if (pageToken) params.set('page_token', pageToken)

    const res = await fetch(`${SALES_URL}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error_description ?? data?.message ?? 'Erro ao buscar vendas na Hotmart')
    }

    for (const item of (data.items ?? []) as SaleHistoryItem[]) {
      const status = String(item.purchase?.status ?? '').toUpperCase()
      if (!STATUS_RECEITA.has(status)) continue

      const produtoId = String(item.product?.id ?? 'sem-id')
      if (idsPermitidos.length && !idsPermitidos.includes(produtoId)) continue

      const valor = Number(item.purchase?.price?.value) || 0
      const nome = item.product?.name ?? 'Produto sem nome'

      total += valor
      vendas += 1

      const atual = produtos.get(produtoId) ?? { id: produtoId, nome, vendas: 0, receita: 0 }
      atual.vendas += 1
      atual.receita += valor
      produtos.set(produtoId, atual)
    }

    pageToken = data?.page_info?.next_page_token || undefined
  } while (pageToken)

  return { configurado: true, total, vendas, produtos: Array.from(produtos.values()).sort((a, b) => b.receita - a.receita) }
}
