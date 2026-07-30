// Seed do Radar de Residência: instituições reais + editais "previsto" da temporada atual.
//
// Rodar: node --env-file=.env.local scripts/seed-radar.ts
// Com editais fictícios de teste (marcados EXEMPLO DE DESENVOLVIMENTO): passar --with-examples
//
// Idempotente: instituições existentes (por sigla) e editais existentes (por instituicao_id +
// temporada) são pulados, nunca sobrescritos. Isso é o que garante que rodar de novo no futuro
// não apague dados reais que o admin já preencheu.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.')
  console.error('Rode assim: node --env-file=.env.local scripts/seed-radar.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type Tipo = 'enare' | 'universidade' | 'hospital' | 'secretaria_saude' | 'associacao_medica'

interface InstituicaoSeed {
  nome: string
  sigla: string
  uf: string | null
  site: string
  tipo: Tipo
}

const TEMPORADA_ATUAL = '2026/2027'

// Sites verificados via busca em jul/2026. Vários processos rodam de fato por bancas/portais
// externos (Vunesp, IADES, Instituto Verbena, FundMed, EBSERH...) que mudam a cada edital —
// por isso aqui sempre aponta pro hub institucional estável, não pra URL de um ciclo específico.
// Revisar esses links ao menos 1x/ano (setembro/outubro, quando os editais novos costumam sair).
const INSTITUICOES: InstituicaoSeed[] = [
  { nome: 'Exame Nacional de Residência (Enare)', sigla: 'ENARE', uf: null, tipo: 'enare',
    site: 'https://www.gov.br/ebserh/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare' },
  { nome: 'Hospital das Clínicas da Faculdade de Medicina da USP (HCFMUSP)', sigla: 'HCFMUSP', uf: 'SP', tipo: 'hospital',
    site: 'https://fm.usp.br/coreme/residencia/processo-seletivo' },
  { nome: 'Faculdade de Medicina de Ribeirão Preto da USP (FMRP-USP)', sigla: 'USP Ribeirão', uf: 'SP', tipo: 'universidade',
    site: 'https://site.hcrp.usp.br/residenciamedica/' },
  { nome: 'Universidade Federal de São Paulo', sigla: 'Unifesp', uf: 'SP', tipo: 'universidade',
    site: 'https://site.unifesp.br/coreme/' },
  { nome: 'Universidade Estadual de Campinas', sigla: 'Unicamp', uf: 'SP', tipo: 'universidade',
    site: 'https://portal.fcm.unicamp.br/residencias-em-saude/residencia-medica/' },
  { nome: 'Universidade Estadual Paulista (Faculdade de Medicina de Botucatu)', sigla: 'Unesp', uf: 'SP', tipo: 'universidade',
    site: 'https://www.fmb.unesp.br/' },
  { nome: 'Comissão Especial de Residência Médica (CERM/SES-SP)', sigla: 'SUS-SP', uf: 'SP', tipo: 'secretaria_saude',
    site: 'https://saude.sp.gov.br/coordenadoria-de-recursos-humanos/areas-da-crh/escola-de-saude-publica/comissao-especial-de-residencia-medica/cerm-comissao-especial-de-residencia-medica' },
  { nome: 'Processo Seletivo Unificado de Minas Gerais (AREMG)', sigla: 'PSU-MG', uf: 'MG', tipo: 'associacao_medica',
    site: 'https://www.aremg.org.br/' },
  { nome: 'Universidade Federal de Minas Gerais (HC-UFMG)', sigla: 'UFMG', uf: 'MG', tipo: 'universidade',
    site: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/regiao-sudeste/hc-ufmg/ensino-e-pesquisa/residencia-medica/processo-seletivo' },
  { nome: 'Secretaria de Estado de Saúde do Distrito Federal', sigla: 'SES-DF', uf: 'DF', tipo: 'secretaria_saude',
    site: 'https://www.saude.df.gov.br/residenciamedica' },
  { nome: 'Secretaria de Estado da Saúde de Goiás', sigla: 'SES-GO', uf: 'GO', tipo: 'secretaria_saude',
    site: 'https://www.institutoverbena.ufg.br/' },
  { nome: 'Universidade Federal do Rio de Janeiro', sigla: 'UFRJ', uf: 'RJ', tipo: 'universidade',
    site: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/regiao-sudeste/ch-ufrj' },
  { nome: 'Universidade do Estado do Rio de Janeiro', sigla: 'UERJ', uf: 'RJ', tipo: 'universidade',
    site: 'https://www.cepuerj.uerj.br/' },
  { nome: 'Universidade Federal Fluminense (HUAP)', sigla: 'UFF', uf: 'RJ', tipo: 'universidade',
    site: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/regiao-sudeste/huap-uff' },
  { nome: 'Hospital de Clínicas de Porto Alegre (HCPA/UFRGS)', sigla: 'HCPA', uf: 'RS', tipo: 'hospital',
    site: 'https://www.hcpa.edu.br/ensino/ensino-residencia/residencia-medica/residencia-medica-processo-seletivo' },
  { nome: 'Universidade Federal de Ciências da Saúde de Porto Alegre', sigla: 'UFCSPA', uf: 'RS', tipo: 'universidade',
    site: 'https://ufcspa.edu.br/estude-na-ufcspa/residencia-medica' },
  { nome: 'Universidade Federal do Paraná', sigla: 'UFPR', uf: 'PR', tipo: 'universidade',
    site: 'https://www.nc.ufpr.br/' },
  { nome: 'Universidade Federal de Santa Catarina', sigla: 'UFSC', uf: 'SC', tipo: 'universidade',
    site: 'https://residenciamedica.ufsc.br/' },
  { nome: 'Universidade Federal da Bahia', sigla: 'UFBA', uf: 'BA', tipo: 'universidade',
    site: 'https://fmb.ufba.br/content/residência-médica-coreme' },
  { nome: 'Universidade Federal de Pernambuco (HC-UFPE)', sigla: 'UFPE', uf: 'PE', tipo: 'universidade',
    site: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/regiao-nordeste/hc-ufpe/ensino-e-pesquisa/sitenovogep/ensino/copy_of_residencias-em-saude/residencia-medica' },
  { nome: 'Universidade Federal do Ceará (Complexo Hospitalar UFC)', sigla: 'UFC', uf: 'CE', tipo: 'universidade',
    site: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/regiao-nordeste/ch-ufc/ensino-e-pesquisa/residencia-medica-resmed' },
  { nome: 'Universidade Federal do Rio Grande do Norte (HUOL)', sigla: 'UFRN', uf: 'RN', tipo: 'universidade',
    site: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/regiao-nordeste/huol-ufrn/ensino-e-pesquisa/setor-de-gestao-do-ensino-sge/unidade-de-gerenciamento-das-atividades-de-pos-graduacao-ugap/residencia-medica' },
  { nome: 'Universidade Federal de Goiás', sigla: 'UFG', uf: 'GO', tipo: 'universidade',
    site: 'https://pos.ufg.br/p/residencia-medica/' },
  { nome: 'Universidade Federal de Uberlândia', sigla: 'UFU', uf: 'MG', tipo: 'universidade',
    site: 'https://www.famed.ufu.br/pos-graduacao-lato-sensu/residencia-medica/conheca' },
  { nome: 'Universidade Federal do Espírito Santo', sigla: 'UFES', uf: 'ES', tipo: 'universidade',
    site: 'https://residenciamedica.ufes.br/processo-seletivo' },
  { nome: 'Universidade Federal de Mato Grosso do Sul', sigla: 'UFMS', uf: 'MS', tipo: 'universidade',
    site: 'https://propp.ufms.br/dict/seres/coreme/programas-de-residencia-medica-especialidades/' },
  { nome: 'Universidade Federal de Mato Grosso', sigla: 'UFMT', uf: 'MT', tipo: 'universidade',
    site: 'https://www.concursos.ufmt.br/Portal' },
  { nome: 'Universidade Federal do Pará', sigla: 'UFPA', uf: 'PA', tipo: 'universidade',
    site: 'https://www.ceps.ufpa.br/' },
  { nome: 'Universidade Federal do Amazonas (HUGV)', sigla: 'UFAM', uf: 'AM', tipo: 'universidade',
    site: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/regiao-norte/hugv-ufam/ensino-e-pesquisa/residencia-medica' },
  { nome: 'Hospital Israelita Albert Einstein', sigla: 'Hospital Albert Einstein', uf: 'SP', tipo: 'hospital',
    site: 'https://ensino.einstein.br/pos-graduacao/residencia/residencia-medica' },
  { nome: 'Hospital Sírio-Libanês', sigla: 'Hospital Sírio-Libanês', uf: 'SP', tipo: 'hospital',
    site: 'https://www.faculdadesiriolibanes.org.br/fsl/residencia' },
  { nome: 'Hospital Moinhos de Vento', sigla: 'Hospital Moinhos de Vento', uf: 'RS', tipo: 'hospital',
    site: 'https://faculdademoinhos.com.br/residencia-medica/' },
  { nome: 'Irmandade da Santa Casa de Misericórdia de São Paulo', sigla: 'Santa Casa SP', uf: 'SP', tipo: 'hospital',
    site: 'https://santacasasp.org.br/residencia-medica/' },
  { nome: 'Santa Casa de Misericórdia de Belo Horizonte', sigla: 'Santa Casa BH', uf: 'MG', tipo: 'hospital',
    site: 'https://faculdadesantacasabh.org.br/residenciaeespecializacao/' },
  { nome: 'Associação Médica do Rio Grande do Sul', sigla: 'AMRIGS', uf: 'RS', tipo: 'associacao_medica',
    site: 'https://www.amrigs.org.br/prova/' },
  { nome: 'Associação Médica do Paraná', sigla: 'AMP', uf: 'PR', tipo: 'associacao_medica',
    site: 'https://ucamp.org.br/residencia-medica' },
  { nome: 'Faculdade de Medicina de Marília', sigla: 'Famema', uf: 'SP', tipo: 'universidade',
    site: 'https://www.famema.br/pos-graduacao-lato-sensu/residencia-medica/' },
  { nome: 'Faculdade de Medicina de São José do Rio Preto', sigla: 'Famerp', uf: 'SP', tipo: 'universidade',
    site: 'https://www.famerp.br/index.php/diretoria-de-pos-graduacao/coreme/' },
]

async function seedInstituicoes() {
  console.log(`\n== Instituições (${INSTITUICOES.length}) ==`)
  for (const inst of INSTITUICOES) {
    const { data: existente } = await supabase
      .from('instituicoes')
      .select('id')
      .eq('sigla', inst.sigla)
      .maybeSingle()

    if (existente) {
      console.log(`  já existe, pulando: ${inst.sigla}`)
      continue
    }

    const { error } = await supabase.from('instituicoes').insert(inst)
    if (error) {
      console.error(`  ERRO ao criar ${inst.sigla}: ${error.message}`)
    } else {
      console.log(`  criada: ${inst.sigla}`)
    }
  }
}

async function seedEditaisPrevistos() {
  console.log(`\n== Editais "previsto" (temporada ${TEMPORADA_ATUAL}) ==`)

  const { data: instituicoes, error } = await supabase.from('instituicoes').select('id, sigla')
  if (error || !instituicoes) {
    console.error('Não consegui carregar instituições:', error?.message)
    return
  }

  for (const inst of instituicoes) {
    const { data: existente } = await supabase
      .from('editais')
      .select('id')
      .eq('instituicao_id', inst.id)
      .eq('temporada', TEMPORADA_ATUAL)
      .maybeSingle()

    if (existente) {
      console.log(`  já existe edital ${TEMPORADA_ATUAL}, pulando: ${inst.sigla}`)
      continue
    }

    const { error: insertError } = await supabase.from('editais').insert({
      instituicao_id: inst.id,
      temporada: TEMPORADA_ATUAL,
      status: 'previsto',
    })

    if (insertError) {
      console.error(`  ERRO ao criar edital de ${inst.sigla}: ${insertError.message}`)
    } else {
      console.log(`  criado edital previsto: ${inst.sigla}`)
    }
  }
}

// Editais fictícios pra testar a interface (Fase 3). Só roda com --with-examples.
// Apaga depois de testar: filtrar por observacoes = 'EXEMPLO DE DESENVOLVIMENTO'.
async function seedExemplosDev() {
  console.log('\n== Editais de exemplo (EXEMPLO DE DESENVOLVIMENTO) ==')

  const siglasNecessarias = ['ENARE', 'UFMG', 'HCFMUSP']
  const { data: instituicoes, error } = await supabase
    .from('instituicoes')
    .select('id, sigla')
    .in('sigla', siglasNecessarias)

  if (error || !instituicoes || instituicoes.length !== siglasNecessarias.length) {
    console.error('Não encontrei todas as instituições necessárias pros exemplos:', error?.message)
    return
  }
  const idPorSigla = Object.fromEntries(instituicoes.map((i) => [i.sigla, i.id]))

  const hoje = new Date()
  const diasA = (n: number) => {
    const d = new Date(hoje)
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }

  const exemplos = [
    {
      sigla: 'ENARE',
      edital: {
        status: 'aberto',
        inscricao_inicio: diasA(-5),
        inscricao_fim: diasA(20),
        taxa: 220,
        etapas: 2,
        data_prova: diasA(75),
        data_gabarito: diasA(78),
        observacoes: 'EXEMPLO DE DESENVOLVIMENTO',
      },
      vagas: [
        { especialidade_nome: 'Clínica Médica', vagas: 120 },
        { especialidade_nome: 'Cirurgia Geral', vagas: 60 },
        { especialidade_nome: 'Pediatria', vagas: 80 },
        { especialidade_nome: 'Anestesiologia', vagas: 40 },
      ],
    },
    {
      sigla: 'UFMG',
      edital: {
        status: 'aberto',
        inscricao_inicio: diasA(-10),
        inscricao_fim: diasA(3),
        taxa: 180,
        etapas: 1,
        data_prova: diasA(40),
        data_gabarito: diasA(42),
        observacoes: 'EXEMPLO DE DESENVOLVIMENTO',
      },
      vagas: [
        { especialidade_nome: 'Anestesiologia', vagas: 8 },
        { especialidade_nome: 'Ortopedia e Traumatologia', vagas: 6 },
      ],
    },
    {
      sigla: 'HCFMUSP',
      edital: {
        status: 'encerrado',
        inscricao_inicio: diasA(-90),
        inscricao_fim: diasA(-60),
        taxa: 250,
        etapas: 3,
        data_prova: diasA(-20),
        data_gabarito: diasA(-18),
        data_resultado: diasA(-5),
        observacoes: 'EXEMPLO DE DESENVOLVIMENTO',
      },
      vagas: [{ especialidade_nome: 'Dermatologia', vagas: 4 }],
    },
  ]

  const { data: especialidades } = await supabase.from('especialidades').select('id, nome')
  const idPorEspecialidade = Object.fromEntries((especialidades ?? []).map((e) => [e.nome, e.id]))

  for (const ex of exemplos) {
    const instituicaoId = idPorSigla[ex.sigla]
    const { data: edital, error: editalError } = await supabase
      .from('editais')
      .insert({ instituicao_id: instituicaoId, temporada: TEMPORADA_ATUAL + ' (exemplo)', ...ex.edital })
      .select('id')
      .single()

    if (editalError || !edital) {
      console.error(`  ERRO ao criar edital de exemplo (${ex.sigla}): ${editalError?.message}`)
      continue
    }

    const vagasRows = ex.vagas
      .map((v) => ({
        edital_id: edital.id,
        especialidade_id: idPorEspecialidade[v.especialidade_nome],
        vagas: v.vagas,
      }))
      .filter((v) => v.especialidade_id != null)

    const { error: vagasError } = await supabase.from('edital_vagas').insert(vagasRows)
    if (vagasError) {
      console.error(`  ERRO ao criar vagas de exemplo (${ex.sigla}): ${vagasError.message}`)
    } else {
      console.log(`  criado edital de exemplo: ${ex.sigla} (${ex.edital.status})`)
    }
  }
}

async function main() {
  await seedInstituicoes()
  await seedEditaisPrevistos()

  if (process.argv.includes('--with-examples')) {
    await seedExemplosDev()
  } else {
    console.log('\nDica: rode com --with-examples pra criar editais fictícios e testar a interface.')
  }

  console.log('\nSeed concluído.')
}

main()
