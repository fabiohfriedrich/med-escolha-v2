export type ArquivoKitTop3 = {
  slug: string
  nomeArquivo: string
  titulo: string
  descricao: string
  tipo: 'individual' | 'pacote'
  contentType: string
}

export const ARQUIVOS_KIT_TOP3: readonly ArquivoKitTop3[] = [
  {
    slug: 'comece-por-aqui',
    nomeArquivo: '00-comece-por-aqui.pdf',
    titulo: 'Comece por aqui',
    descricao: 'O método de validação em 14 dias e a ordem de uso dos materiais.',
    tipo: 'individual',
    contentType: 'application/pdf',
  },
  {
    slug: 'entrevista-especialistas',
    nomeArquivo: '01-entrevista-com-especialistas.pdf',
    titulo: 'Entrevista com especialistas',
    descricao: 'Perguntas para investigar rotina, formação, mercado e pontos de atenção.',
    tipo: 'individual',
    contentType: 'application/pdf',
  },
  {
    slug: 'observacao-rotina',
    nomeArquivo: '02-checklist-observacao-da-rotina.pdf',
    titulo: 'Observação da rotina',
    descricao: 'Checklist para estágio, ambulatório, plantão ou procedimento.',
    tipo: 'individual',
    contentType: 'application/pdf',
  },
  {
    slug: 'conversa-residentes',
    nomeArquivo: '03-conversa-com-residentes.pdf',
    titulo: 'Conversa com residentes',
    descricao: 'Roteiro para entender a formação real e comparar programas.',
    tipo: 'individual',
    contentType: 'application/pdf',
  },
  {
    slug: 'matriz-decisao',
    nomeArquivo: '04-matriz-decisao-top3.pdf',
    titulo: 'Matriz de decisão do Top 3',
    descricao: 'Uma comparação final baseada nas evidências que você coletou.',
    tipo: 'individual',
    contentType: 'application/pdf',
  },
  {
    slug: 'pacote-completo',
    nomeArquivo: 'kit-valide-seu-top3.zip',
    titulo: 'Kit completo',
    descricao: 'Os cinco PDFs reunidos em um único arquivo.',
    tipo: 'pacote',
    contentType: 'application/zip',
  },
] as const

const ARQUIVO_POR_SLUG = new Map(ARQUIVOS_KIT_TOP3.map((arquivo) => [arquivo.slug, arquivo]))

export function obterArquivoKitTop3(slug: string): ArquivoKitTop3 | null {
  return ARQUIVO_POR_SLUG.get(slug) ?? null
}

export function urlDownloadKitTop3(slug: string): string {
  return `/api/downloads/kit-top3/${encodeURIComponent(slug)}`
}
