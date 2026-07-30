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
  etapas: number | null
  data_prova: string | null
  data_gabarito: string | null
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

export function diasAte(dataISO: string, referencia: Date = new Date()): number {
  const hoje = new Date(referencia)
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

export function formatEtapas(etapas: number | null): string {
  if (etapas == null) return 'A definir'
  return `${etapas} etapa${etapas === 1 ? '' : 's'}`
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

export interface RadarConfig {
  especialidade_ids: number[]
  ufs: string[]
}

// Especialidades do radar do usuário que batem com as vagas cadastradas nesse edital.
export function especialidadesEmComum(edital: Pick<EditalComInstituicao, 'edital_vagas'>, especialidadeIds: number[]): number[] {
  const vagas = edital.edital_vagas ?? []
  return vagas.map((v) => v.especialidade_id).filter((id) => especialidadeIds.includes(id))
}

// Mesma regra usada tanto no filtro do /radar quanto no cron de alertas, pra nunca divergir:
// o que o usuário vê filtrado é exatamente o que ele recebe alerta.
// UF: nacional (uf null, ex ENARE) sempre bate, e nenhuma UF selecionada = sem filtro de UF.
// Especialidade: nenhuma selecionada = sem filtro; se o edital ainda não tem vagas cadastradas
// (comum em editais "previsto"), não excluímos, porque pode acabar incluindo a especialidade
// assim que as vagas forem publicadas.
export function editalCorrespondeAoRadar(edital: EditalComInstituicao, config: RadarConfig): boolean {
  const okUf = config.ufs.length === 0 || edital.instituicao.uf == null || config.ufs.includes(edital.instituicao.uf)
  const vagas = edital.edital_vagas ?? []
  const okEspecialidade =
    config.especialidade_ids.length === 0 ||
    vagas.length === 0 ||
    especialidadesEmComum(edital, config.especialidade_ids).length > 0
  return okUf && okEspecialidade
}

export type TipoAlerta = 'novo_edital' | 'inscricao_abriu' | 'ultimos_dias' | 'vespera_prova'

// Não avisamos de "novo edital" pra algo que já encerrou (ex: radar configurado depois do fato).
export function alertaNovoEditalDevido(edital: Pick<Edital, 'status'>): boolean {
  return edital.status !== 'encerrado'
}

export function alertaInscricaoAbriuDevido(edital: Pick<Edital, 'inscricao_inicio'>, hoje: Date = new Date()): boolean {
  if (!edital.inscricao_inicio) return false
  return diasAte(edital.inscricao_inicio, hoje) === 0
}

// Janela (não dia exato) pra tolerar o cron não ter rodado ontem e ainda assim avisar a tempo.
export function alertaUltimosDiasDevido(edital: Pick<Edital, 'status' | 'inscricao_fim'>, hoje: Date = new Date()): boolean {
  if (edital.status !== 'aberto' || !edital.inscricao_fim) return false
  const dias = diasAte(edital.inscricao_fim, hoje)
  return dias >= 0 && dias <= 3
}

// Esse é dia exato mesmo (não janela): "véspera" perde o sentido se mandado com 2+ dias de atraso.
export function alertaVesperaProvaDevido(edital: Pick<Edital, 'data_prova'>, hoje: Date = new Date()): boolean {
  if (!edital.data_prova) return false
  return diasAte(edital.data_prova, hoje) === 1
}
