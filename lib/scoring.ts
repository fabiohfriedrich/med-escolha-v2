import c04aData from '@/data/c04a_valores.json'
import c04bData from '@/data/c04b_perguntas.json'
import specialtiesData from '@/data/specialties.json'
import dmbData from '@/data/dmb_data.json'

const PESOS = { c02: 0.10, c04a: 0.05, c04b: 0.85 }

// v2 corrige o viés estrutural do v1: o cálculo somava a pontuação bruta de cada
// especialidade e normalizava por min-max entre as 55, o que fazia a densidade de
// associações na matriz (4 a 64 por especialidade) dominar o ranking, em vez do
// perfil do usuário. v2 divide pela contagem de associações de cada especialidade
// (uma média), restaurando o comportamento do algoritmo original da planilha.
const SCORING_VERSION = 2

export interface QuizAnswers {
  nome: string
  email: string
  demographics: {
    genero: string
    faculdade: string
    anoFormatura: string
  }
  c04a: Record<string, boolean>   // questionId -> true/false
  c04b: Record<string, number>    // questionId -> 0-10 scale
  c02: number[]                   // specialty ids with direct interest
  jung: string[]                  // list of temp-XX ids the user identifies with
  holland: string[]
}

export interface SpecialtyResult {
  id: number
  nome: string
  pct: number
  saturacao: string
  crescimento: string
  salario_min: number
  salario_max: number
  anos_formacao: number
  medicos_ativos: number
}

export interface MatchResult {
  ranking: SpecialtyResult[]
  perfil: {
    nome: string
    email: string
    demographics: QuizAnswers['demographics']
    jung: string[]
    holland: string[]
  }
  scoring_version: number
}

export function calcularMatch(answers: QuizAnswers): MatchResult {
  const specialties = specialtiesData.specialties
  const valores = (c04aData as any).questions as Array<{ id: string; scores: Record<string, number> }>
  const perguntas = (c04bData as any).questions as Array<{ id: string; scores: Record<string, number> }>
  const dmb = (dmbData as any).specialties as Array<{
    id: number; nome: string; saturacao: string; crescimento_projetado: string
    salario_min: number; salario_max: number; anos_formacao: number; medicos_ativos: number
  }>

  // c04a: soma assinada (+1/-1) e contagem de associações (|M(v,s)|) por especialidade —
  // o denominador é o que torna o score comparável entre especialidades com quantidades
  // diferentes de valores associados.
  const c04aSoma: Record<number, number> = {}
  const c04aContagem: Record<number, number> = {}
  // c04b: soma das respostas (0-10) e contagem de perguntas associadas por especialidade.
  const c04bSoma: Record<number, number> = {}
  const c04bContagem: Record<number, number> = {}
  specialties.forEach(s => {
    c04aSoma[s.id] = 0; c04aContagem[s.id] = 0
    c04bSoma[s.id] = 0; c04bContagem[s.id] = 0
  })

  const c02: Record<number, number> = {}
  specialties.forEach(s => { c02[s.id] = 0 })
  answers.c02.forEach(id => { if (id in c02) c02[id] = 100 })

  valores.forEach(q => {
    const answered = answers.c04a[q.id]
    specialties.forEach(s => {
      const val = q.scores[String(s.id)] ?? 0
      if (val === 1 || val === -1) {
        c04aContagem[s.id] += 1
        if (answered) c04aSoma[s.id] += val
      }
    })
  })

  perguntas.forEach(q => {
    const resposta = answers.c04b[q.id] ?? 5
    specialties.forEach(s => {
      if ((q.scores[String(s.id)] ?? 0) === 1) {
        c04bContagem[s.id] += 1
        c04bSoma[s.id] += resposta
      }
    })
  })

  const ranking: SpecialtyResult[] = specialties.map(s => {
    const scoreC04a = c04aContagem[s.id] > 0 ? 100 * (c04aSoma[s.id] / c04aContagem[s.id]) : 0
    const scoreC04b = c04bContagem[s.id] > 0 ? 100 * (c04bSoma[s.id] / (10 * c04bContagem[s.id])) : 0

    const pct =
      PESOS.c02  * c02[s.id] +
      PESOS.c04a * scoreC04a +
      PESOS.c04b * scoreC04b

    const d = dmb.find(x => x.id === s.id) ?? {
      saturacao: 'Média', crescimento_projetado: 'Médio',
      salario_min: 0, salario_max: 0, anos_formacao: 0, medicos_ativos: 0
    }
    return {
      id: s.id,
      nome: s.nome,
      pct: Math.round(pct * 10) / 10,
      saturacao: d.saturacao,
      crescimento: d.crescimento_projetado,
      salario_min: d.salario_min,
      salario_max: d.salario_max,
      anos_formacao: d.anos_formacao,
      medicos_ativos: d.medicos_ativos,
    }
  }).sort((a, b) => b.pct - a.pct)

  return {
    ranking,
    perfil: {
      nome: answers.nome,
      email: answers.email,
      demographics: answers.demographics,
      jung: answers.jung,
      holland: answers.holland,
    },
    scoring_version: SCORING_VERSION,
  }
}
