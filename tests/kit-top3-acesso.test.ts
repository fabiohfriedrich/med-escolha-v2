import { describe, expect, it } from 'vitest'
import {
  acessoAtivoDeTransacoes,
  normalizarEmailProdutoDigital,
  statusPagamentoPorEvento,
} from '../lib/produtos-digitais-core'

describe('normalizarEmailProdutoDigital', () => {
  it('normaliza caixa e espaços', () => {
    expect(normalizarEmailProdutoDigital('  Medico@Exemplo.COM ')).toBe('medico@exemplo.com')
  })
})

describe('statusPagamentoPorEvento', () => {
  it.each([
    ['PURCHASE_APPROVED', 'pago'],
    ['PURCHASE_COMPLETE', 'pago'],
    ['PURCHASE_REFUNDED', 'reembolsado'],
    ['PURCHASE_CHARGEBACK', 'chargeback'],
    ['PURCHASE_CANCELED', 'cancelado'],
  ] as const)('converte %s em %s', (evento, esperado) => {
    expect(statusPagamentoPorEvento(evento)).toBe(esperado)
  })

  it('rejeita um evento sem regra financeira', () => {
    expect(statusPagamentoPorEvento('SUBSCRIPTION_CANCELLATION')).toBeNull()
  })
})

describe('acessoAtivoDeTransacoes', () => {
  it('libera acesso com uma transação paga e ativa', () => {
    expect(acessoAtivoDeTransacoes([{ ativo: true, status_pagamento: 'pago' }])).toBe(true)
  })

  it('não libera somente com transação reembolsada', () => {
    expect(acessoAtivoDeTransacoes([{ ativo: false, status_pagamento: 'reembolsado' }])).toBe(false)
  })

  it('mantém uma segunda compra válida após o reembolso da primeira', () => {
    expect(
      acessoAtivoDeTransacoes([
        { ativo: false, status_pagamento: 'reembolsado' },
        { ativo: true, status_pagamento: 'pago' },
      ])
    ).toBe(true)
  })

  it('não libera uma linha inconsistente', () => {
    expect(acessoAtivoDeTransacoes([{ ativo: true, status_pagamento: 'chargeback' }])).toBe(false)
  })
})
