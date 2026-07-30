export const UFS: { sigla: string; nome: string }[] = [
  { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' },
]

export const TIPO_LABEL: Record<string, string> = {
  enare: 'ENARE',
  universidade: 'Universidade',
  hospital: 'Hospital',
  secretaria_saude: 'Secretaria de Saúde',
  associacao_medica: 'Associação médica',
}

export interface Instituicao {
  id: string
  nome: string
  sigla: string
  uf: string | null
  site: string
  tipo: string
}

export interface EditalVaga {
  id: string
  especialidade_id: number
  vagas: number | null
  acesso_direto: boolean
}

export interface Edital {
  id: string
  instituicao_id: string
  temporada: string
  status: 'previsto' | 'aberto' | 'encerrado'
  link_oficial: string | null
  inscricao_inicio: string | null
  inscricao_fim: string | null
  taxa: number | null
  data_prova: string | null
  data_resultado: string | null
  observacoes: string | null
  atualizado_em: string
}

export interface EditalComInstituicao extends Edital {
  instituicao: Instituicao
  edital_vagas?: EditalVaga[]
}

export type StatusCor = 'amarelo' | 'verde' | 'vermelho' | 'cinza'

export interface StatusVisual {
  cor: StatusCor
  label: string
  background: string
  color: string
}

const CORES: Record<StatusCor, { background: string; color: string }> = {
  amarelo: { background: '#fef3c7', color: '#b45309' },
  verde: { background: '#dcfce7', color: '#15803d' },
  vermelho: { background: '#fee2e2', color: '#dc2626' },
  cinza: { background: '#f1f5f9', color: '#64748b' },
}

function diasAte(dataISO: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(dataISO + 'T00:00:00')
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000)
}

// Deriva o chip visual combinando o status salvo com a proximidade da data de fim de inscrição.
// Um edital "aberto" cuja inscricao_fim já passou é tratado como encerrado (rede de segurança
// pra quando o admin ainda não atualizou o status manualmente).
export function getStatusVisual(edital: Pick<Edital, 'status' | 'inscricao_fim'>): StatusVisual {
  if (edital.status === 'encerrado') {
    return { cor: 'cinza', label: 'Encerrado', ...CORES.cinza }
  }
  if (edital.status === 'previsto') {
    return { cor: 'amarelo', label: 'Previsto', ...CORES.amarelo }
  }
  // status === 'aberto'
  if (edital.inscricao_fim) {
    const dias = diasAte(edital.inscricao_fim)
    if (dias < 0) return { cor: 'cinza', label: 'Encerrado', ...CORES.cinza }
    if (dias <= 3) {
      const label = dias === 0 ? 'Encerra hoje' : dias === 1 ? 'Encerra amanhã' : `Encerra em ${dias} dias`
      return { cor: 'vermelho', label, ...CORES.vermelho }
    }
  }
  return { cor: 'verde', label: 'Inscrições abertas', ...CORES.verde }
}

export function formatDateBR(dataISO: string | null): string {
  if (!dataISO) return 'A definir'
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatPeriodo(inicio: string | null, fim: string | null): string {
  if (!inicio && !fim) return 'A definir'
  if (inicio && fim) return `${formatDateBR(inicio)} a ${formatDateBR(fim)}`
  return formatDateBR(inicio ?? fim)
}

export function formatTaxa(taxa: number | null): string {
  if (taxa == null) return 'A definir'
  if (taxa === 0) return 'Gratuita'
  return `R$ ${taxa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

// Ordena por urgência: quem tem inscricao_inicio conhecida vem primeiro (mais cedo primeiro),
// editais "a definir" (previsto, sem data) ficam depois, ordenados por nome da instituição.
export function ordenarEditais(editais: EditalComInstituicao[]): EditalComInstituicao[] {
  return [...editais].sort((a, b) => {
    if (a.inscricao_inicio && b.inscricao_inicio) {
      return a.inscricao_inicio.localeCompare(b.inscricao_inicio)
    }
    if (a.inscricao_inicio) return -1
    if (b.inscricao_inicio) return 1
    return a.instituicao.nome.localeCompare(b.instituicao.nome)
  })
}
