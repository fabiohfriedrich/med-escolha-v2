import { describe, expect, it } from 'vitest'
import { ARQUIVOS_KIT_TOP3, obterArquivoKitTop3, urlDownloadKitTop3 } from '../lib/kit-top3'

describe('allowlist do Kit Top 3', () => {
  it('contém cinco PDFs e um ZIP', () => {
    expect(ARQUIVOS_KIT_TOP3).toHaveLength(6)
    expect(ARQUIVOS_KIT_TOP3.filter((arquivo) => arquivo.contentType === 'application/pdf')).toHaveLength(5)
    expect(ARQUIVOS_KIT_TOP3.filter((arquivo) => arquivo.contentType === 'application/zip')).toHaveLength(1)
  })

  it('usa nomes de arquivo únicos', () => {
    expect(new Set(ARQUIVOS_KIT_TOP3.map((arquivo) => arquivo.nomeArquivo)).size).toBe(6)
  })

  it.each(['../segredo', '..%2Fsegredo', '/etc/passwd', '00-comece-por-aqui.pdf', ''])('rejeita caminho fora da allowlist: %s', (slug) => {
    expect(obterArquivoKitTop3(slug)).toBeNull()
  })

  it('gera a URL usando somente o slug conhecido', () => {
    expect(urlDownloadKitTop3('matriz-decisao')).toBe('/api/downloads/kit-top3/matriz-decisao')
  })
})
