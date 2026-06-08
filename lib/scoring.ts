import c04aData from '@/data/c04a_valores.json'
import c04bData from '@/data/c04b_perguntas.json'
import specialtiesData from '@/data/specialties.json'
import dmbData from '@/data/dmb_data.json'

const PESOS = { c02: 0.10, c04a: 0.05, c04b: 0.85 }

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
}

function normalize(val: number, min: number, max: number): number {
  if (max === min) return 50
  return ((val - min) / (max - min)) * 100
}

export function calcularMatch(answers: QuizAnswers): MatchResult {
  const specialties = specialtiesData.specialties
  const valores = (c04aData as any).questions as Array<{ id: string; scores: Record<string, number> }>
  const perguntas = (c04bData as any).questions as Array<{ id: string; scores: Record<string, number> }>
  const dmb = (dmbData as any).specialties as Array<{
    id: number; nome: string; saturacao: string; crescimento: string
    salario_min: number; salario_max: number; anos_formacao: number; medicos_ativos: number
  }>

  const scores: Record<number, { c02: number; c04a: number; c04b: number }> = {}
  specialties.forEach(s => { scores[s.id] = { c02: 0, c04a: 0, c04b: 0 } })

  // C02: interesse direto
  answers.c02.forEach(id => { if (scores[id]) scores[id].c02 = 100 })

  // C04a: valores
  valores.forEach(q => {
    const answered = answers.c04a[q.id]
    specialties.forEach(s => {
      const val = q.scores[String(s.id)] ?? 0
      if (val === 1 && answered) scores[s.id].c04a += 1
      if (val === -1 && answered) scores[s.id].c04a -= 1
    })
  })

  // C04b: comportamentos — escala 0-10, peso proporcional
  perguntas.forEach(q => {
    const score = answers.c04b[q.id] ?? 0
    if (score === 0) return
    specialties.forEach(s => {
      if ((q.scores[String(s.id)] ?? 0) === 1) scores[s.id].c04b += score / 10
    })
  })

  // Normalizar C04a e C04b
  const c04aVals = specialties.map(s => scores[s.id].c04a)
  const c04bVals = specialties.map(s => scores[s.id].c04b)
  const minC04a = Math.min(...c04aVals), maxC04a = Math.max(...c04aVals)
  const minC04b = Math.min(...c04bVals), maxC04b = Math.max(...c04bVals)

  const ranking: SpecialtyResult[] = specialties.map(s => {
    const sc = scores[s.id]
    const pct =
      PESOS.c02  * sc.c02 +
      PESOS.c04a * normalize(sc.c04a, minC04a, maxC04a) +
      PESOS.c04b * normalize(sc.c04b, minC04b, maxC04b)

    const d = dmb.find(x => x.id === s.id) ?? {
      saturacao: 'Média', crescimento: 'Médio',
      salario_min: 0, salario_max: 0, anos_formacao: 0, medicos_ativos: 0
    }
    return {
      id: s.id,
      nome: s.nome,
      pct: Math.round(pct * 10) / 10,
      saturacao: d.saturacao,
      crescimento: d.crescimento,
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
  }
}
