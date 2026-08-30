export type StatusPagamentoProdutoDigital = 'pago' | 'reembolsado' | 'chargeback' | 'cancelado'

export type EstadoTransacaoProdutoDigital = {
  ativo: boolean
  status_pagamento: string
}

const STATUS_POR_EVENTO: Record<string, StatusPagamentoProdutoDigital> = {
  PURCHASE_APPROVED: 'pago',
  PURCHASE_COMPLETE: 'pago',
  PURCHASE_REFUNDED: 'reembolsado',
  PURCHASE_CHARGEBACK: 'chargeback',
  PURCHASE_CANCELED: 'cancelado',
}

export function normalizarEmailProdutoDigital(email: string): string {
  return email.toLowerCase().trim()
}

export function statusPagamentoPorEvento(evento: string): StatusPagamentoProdutoDigital | null {
  return STATUS_POR_EVENTO[evento] ?? null
}

export function acessoAtivoDeTransacoes(transacoes: EstadoTransacaoProdutoDigital[]): boolean {
  return transacoes.some((transacao) => transacao.ativo && transacao.status_pagamento === 'pago')
}
