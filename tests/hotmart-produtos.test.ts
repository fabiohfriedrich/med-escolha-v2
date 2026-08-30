import { describe, expect, it } from 'vitest'
import {
  classificarOfertaKit,
  classificarProdutoHotmart,
  type ConfiguracaoProdutosHotmart,
} from '../lib/hotmart-produtos'

const configuracao: ConfiguracaoProdutosHotmart = {
  produtoPrincipalId: '100',
  psicologoId: '200',
  kitTop3Id: '300',
  ofertaKitBump: 'kit-bump',
  ofertaKitAvulsa: 'kit-avulsa',
}

describe('classificarProdutoHotmart', () => {
  it.each([
    ['100', 'principal'],
    [100, 'principal'],
    ['200', 'psicologo'],
    [200, 'psicologo'],
    ['300', 'kit-top3'],
    [300, 'kit-top3'],
  ] as const)('classifica o produto %s como %s', (productId, esperado) => {
    expect(classificarProdutoHotmart(productId, configuracao)).toBe(esperado)
  })

  it.each([undefined, null, '', '999'])('mantém produto desconhecido fechado: %s', (productId) => {
    expect(classificarProdutoHotmart(productId, configuracao)).toBe('desconhecido')
  })
})

describe('classificarOfertaKit', () => {
  it('distingue o order bump', () => {
    expect(classificarOfertaKit('kit-bump', configuracao)).toBe('bump')
  })

  it('distingue a oferta avulsa', () => {
    expect(classificarOfertaKit('kit-avulsa', configuracao)).toBe('avulsa')
  })

  it.each([undefined, null, '', 'outra-oferta'])('não inventa origem para %s', (offerCode) => {
    expect(classificarOfertaKit(offerCode, configuracao)).toBe('desconhecida')
  })
})
