import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  carregarConfiguracaoProdutosHotmart,
  classificarOfertaKit,
  classificarProdutoHotmart,
  type ConfiguracaoProdutosHotmart,
} from '../lib/hotmart-produtos'

afterEach(() => {
  vi.unstubAllEnvs()
})

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

describe('carregarConfiguracaoProdutosHotmart', () => {
  it('usa o primeiro ID legado como fallback do produto principal', () => {
    vi.stubEnv('HOTMART_PRODUCT_IDS', '100, 101')
    vi.stubEnv('HOTMART_PRODUCT_ID_PRINCIPAL', '')
    vi.stubEnv('HOTMART_PRODUCT_ID_PSICOLOGO', '200')
    vi.stubEnv('HOTMART_PRODUCT_ID_KIT_TOP3', '300')
    vi.stubEnv('HOTMART_OFFER_CODE_KIT_BUMP', 'kit-bump')
    vi.stubEnv('HOTMART_OFFER_CODE_KIT_AVULSO', 'kit-avulsa')

    expect(carregarConfiguracaoProdutosHotmart()).toEqual(configuracao)
  })

  it('prioriza o ID explícito do produto principal', () => {
    vi.stubEnv('HOTMART_PRODUCT_IDS', '999')
    vi.stubEnv('HOTMART_PRODUCT_ID_PRINCIPAL', '100')
    vi.stubEnv('HOTMART_PRODUCT_ID_PSICOLOGO', '200')
    vi.stubEnv('HOTMART_PRODUCT_ID_KIT_TOP3', '300')
    vi.stubEnv('HOTMART_OFFER_CODE_KIT_BUMP', 'kit-bump')
    vi.stubEnv('HOTMART_OFFER_CODE_KIT_AVULSO', 'kit-avulsa')

    expect(carregarConfiguracaoProdutosHotmart()).toEqual(configuracao)
  })
})
