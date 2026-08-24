// Receita de vendas do Med Escolha via Hotmart Sales History API.
// Credenciais em developers.hotmart.com > Ferramentas > Credenciais de acesso (OAuth
// client credentials, diferente do HOTMART_HOTTOK usado no webhook de compra).

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const AUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token'
const SALES_URL = 'https://developers.hotmart.com/payments/api/v1/sales/history'

// A API de vendas da Hotmart fica atrás de um WAF (CloudFront) que bloqueia a assinatura TLS
// do fetch()/undici do Node com um 400 genérico — mesmo request via curl funciona normalmente
// (confirmado testando local e da rede de quem criou a credencial). Por isso essa chamada
// específica usa o binário curl do sistema em vez de fetch. O login OAuth (obterTokenHotmart)
// não tem esse problema e continua em fetch normal.
async function curlGetJson(url: string, headers: Record<string, string>): Promise<any> {
  const args = ['-s']
  for (const [chave, valor] of Object.entries(headers)) args.push('-H', `${chave}: ${valor}`)
  args.push(url)
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 20 * 1024 * 1024 })
  return JSON.parse(stdout)
}

// Só esses status representam venda paga (mesmo critério do webhook em
// app/api/webhook/hotmart/route.ts, EVENTOS_APROVADOS).
const STATUS_RECEITA = new Set(['APPROVED', 'COMPLETE'])

// Equivalente aos eventos EVENTOS_CANCELADOS do webhook (REFUNDED, CHARGEBACK, CANCELED),
// mas usando os valores de purchase.status da Sales History API.
const STATUS_CANCELAMENTO = new Set(['CANCELLED', 'REFUNDED', 'CHARGEBACK', 'PARTIALLY_REFUNDED'])

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
  purchase?: { status?: string; price?: { value?: number }; hotmart_fee?: { total?: number } }
}

export interface ReceitaProduto {
  id: string
  nome: string
  vendas: number
  receita: number
  receitaLiquida: number
}

export interface ReceitaHotmart {
  configurado: boolean
  total: number
  totalLiquido: number
  vendas: number
  cancelamentos: number
  produtos: ReceitaProduto[]
}

export async function buscarReceitaHotmart(fromMs: number, toMs: number): Promise<ReceitaHotmart> {
  if (!process.env.HOTMART_CLIENT_ID) return { configurado: false, total: 0, totalLiquido: 0, vendas: 0, cancelamentos: 0, produtos: [] }

  const token = await obterTokenHotmart()

  // Opcional: restringir a produtos específicos do Med Escolha (ex: se a mesma conta
  // Hotmart também vender outros produtos da Amo Medicina). Sem essa env, traz tudo.
  const idsPermitidos = (process.env.HOTMART_PRODUCT_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean)

  const produtos = new Map<string, ReceitaProduto>()
  let total = 0
  let totalLiquido = 0
  let vendas = 0
  let cancelamentos = 0
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      start_date: String(fromMs),
      end_date: String(toMs),
      max_results: '500',
    })
    if (pageToken) params.set('page_token', pageToken)

    const data = await curlGetJson(`${SALES_URL}?${params.toString()}`, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    })

    if (data?.error) {
      throw new Error(data?.error_description ?? data?.message ?? 'Erro ao buscar vendas na Hotmart')
    }

    for (const item of (data.items ?? []) as SaleHistoryItem[]) {
      const status = String(item.purchase?.status ?? '').toUpperCase()
      const produtoId = String(item.product?.id ?? 'sem-id')
      if (idsPermitidos.length && !idsPermitidos.includes(produtoId)) continue

      if (STATUS_CANCELAMENTO.has(status)) {
        cancelamentos += 1
        continue
      }

      if (!STATUS_RECEITA.has(status)) continue

      const valor = Number(item.purchase?.price?.value) || 0
      const taxaHotmart = Number(item.purchase?.hotmart_fee?.total) || 0
      const liquido = valor - taxaHotmart
      const nome = item.product?.name ?? 'Produto sem nome'

      total += valor
      totalLiquido += liquido
      vendas += 1

      const atual = produtos.get(produtoId) ?? { id: produtoId, nome, vendas: 0, receita: 0, receitaLiquida: 0 }
      atual.vendas += 1
      atual.receita += valor
      atual.receitaLiquida += liquido
      produtos.set(produtoId, atual)
    }

    pageToken = data?.page_info?.next_page_token || undefined
  } while (pageToken)

  return {
    configurado: true,
    total,
    totalLiquido,
    vendas,
    cancelamentos,
    produtos: Array.from(produtos.values()).sort((a, b) => b.receita - a.receita),
  }
}
