export type ProdutoHotmart = 'principal' | 'psicologo' | 'kit-top3' | 'desconhecido'
export type OrigemKitTop3 = 'bump' | 'avulsa' | 'desconhecida'

export type ConfiguracaoProdutosHotmart = {
  produtoPrincipalId: string
  psicologoId: string
  kitTop3Id: string
  ofertaKitBump: string
  ofertaKitAvulsa: string
}

function normalizarIdentificador(valor: unknown): string {
  if (typeof valor === 'number' && Number.isFinite(valor)) return String(valor)
  if (typeof valor !== 'string') return ''
  return valor.trim()
}

export function classificarProdutoHotmart(
  productId: unknown,
  configuracao: ConfiguracaoProdutosHotmart
): ProdutoHotmart {
  const id = normalizarIdentificador(productId)
  if (!id) return 'desconhecido'
  if (id === normalizarIdentificador(configuracao.produtoPrincipalId)) return 'principal'
  if (id === normalizarIdentificador(configuracao.psicologoId)) return 'psicologo'
  if (id === normalizarIdentificador(configuracao.kitTop3Id)) return 'kit-top3'
  return 'desconhecido'
}

export function classificarOfertaKit(
  offerCode: unknown,
  configuracao: ConfiguracaoProdutosHotmart
): OrigemKitTop3 {
  const codigo = normalizarIdentificador(offerCode)
  if (!codigo) return 'desconhecida'
  if (codigo === normalizarIdentificador(configuracao.ofertaKitBump)) return 'bump'
  if (codigo === normalizarIdentificador(configuracao.ofertaKitAvulsa)) return 'avulsa'
  return 'desconhecida'
}

export function carregarConfiguracaoProdutosHotmart(): ConfiguracaoProdutosHotmart {
  const configuracao: ConfiguracaoProdutosHotmart = {
    produtoPrincipalId: process.env.HOTMART_PRODUCT_ID_PRINCIPAL?.trim() ?? '',
    psicologoId: process.env.HOTMART_PRODUCT_ID_PSICOLOGO?.trim() ?? '',
    kitTop3Id: process.env.HOTMART_PRODUCT_ID_KIT_TOP3?.trim() ?? '',
    ofertaKitBump: process.env.HOTMART_OFFER_CODE_KIT_BUMP?.trim() ?? '',
    ofertaKitAvulsa: process.env.HOTMART_OFFER_CODE_KIT_AVULSO?.trim() ?? '',
  }

  const idsAusentes = [
    !configuracao.produtoPrincipalId && 'HOTMART_PRODUCT_ID_PRINCIPAL',
    !configuracao.psicologoId && 'HOTMART_PRODUCT_ID_PSICOLOGO',
    !configuracao.kitTop3Id && 'HOTMART_PRODUCT_ID_KIT_TOP3',
  ].filter(Boolean)

  if (idsAusentes.length > 0) {
    throw new Error(`Configuração de produtos Hotmart ausente: ${idsAusentes.join(', ')}`)
  }

  return configuracao
}
