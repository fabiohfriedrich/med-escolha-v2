import 'server-only'

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  acessoAtivoDeTransacoes,
  normalizarEmailProdutoDigital,
  type StatusPagamentoProdutoDigital,
} from '@/lib/produtos-digitais-core'
import type { OrigemKitTop3 } from '@/lib/hotmart-produtos'

export const PRODUTO_DIGITAL_KIT_TOP3 = 'kit-top3'

type RegistrarCompraProdutoDigitalInput = {
  email: string
  produtoSlug: string
  hotmartProductId: string
  hotmartOfferCode?: string
  hotmartTransactionId: string
  origem: OrigemKitTop3
  valorBruto?: number
  moeda?: string
}

export async function registrarCompraProdutoDigital(input: RegistrarCompraProdutoDigitalInput): Promise<void> {
  const transactionId = input.hotmartTransactionId.trim()
  if (!transactionId) throw new Error('Transação Hotmart ausente para o produto digital')

  const { error } = await getSupabaseAdmin()
    .from('acessos_produtos_digitais')
    .upsert(
      {
        email: normalizarEmailProdutoDigital(input.email),
        produto_slug: input.produtoSlug,
        hotmart_product_id: input.hotmartProductId,
        hotmart_offer_code: input.hotmartOfferCode?.trim() || null,
        hotmart_transaction_id: transactionId,
        origem: input.origem,
        valor_bruto: Number.isFinite(input.valorBruto) ? input.valorBruto : null,
        moeda: input.moeda?.trim().toUpperCase() || 'BRL',
        ativo: true,
        status_pagamento: 'pago',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'hotmart_transaction_id', ignoreDuplicates: false }
    )

  if (error) throw new Error(`Erro ao salvar acesso ao produto digital: ${error.message}`)
}

export async function revogarCompraProdutoDigital(
  hotmartTransactionId: string,
  statusPagamento: Exclude<StatusPagamentoProdutoDigital, 'pago'>
): Promise<void> {
  const transactionId = hotmartTransactionId.trim()
  if (!transactionId) throw new Error('Transação Hotmart ausente para revogar o produto digital')

  const { error } = await getSupabaseAdmin()
    .from('acessos_produtos_digitais')
    .update({
      ativo: false,
      status_pagamento: statusPagamento,
      updated_at: new Date().toISOString(),
    })
    .eq('hotmart_transaction_id', transactionId)

  if (error) throw new Error(`Erro ao revogar acesso ao produto digital: ${error.message}`)
}

export async function temAcessoProdutoDigital(email: string, produtoSlug: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from('acessos_produtos_digitais')
    .select('ativo,status_pagamento')
    .eq('email', normalizarEmailProdutoDigital(email))
    .eq('produto_slug', produtoSlug)

  if (error) throw new Error(`Erro ao consultar acesso ao produto digital: ${error.message}`)
  return acessoAtivoDeTransacoes(data ?? [])
}
