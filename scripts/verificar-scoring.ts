// Verificação pontual do algoritmo de scoring (v2), rodada uma vez pra confirmar a correção
// do viés relatado na auditoria de 18/08/2026 (95,3% dos resultados caindo em Medicina
// Esportiva por causa da normalização min-max sobre soma bruta, sem dividir pela densidade
// de associações de cada especialidade).
//
// Reimplementa a mesma fórmula de lib/scoring.ts (não importa o arquivo direto porque os
// scripts fora do Next não resolvem o alias "@/"). Se a fórmula em lib/scoring.ts mudar,
// atualizar aqui também.
//
// Rodar: node --env-file=.env.local scripts/verificar-scoring.ts

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')

function loadJson(nome: string) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, nome), 'utf-8'))
}

const specialties = loadJson('specialties.json').specialties as Array<{ id: number; nome: string }>
const perguntas = loadJson('c04b_perguntas.json').questions as Array<{ id: string; scores: Record<string, number> }>

function scoreC04b(especialidadeId: number, respostas: Record<string, number>): number {
  let soma = 0
  let contagem = 0
  perguntas.forEach(q => {
    if ((q.scores[String(especialidadeId)] ?? 0) === 1) {
      contagem += 1
      soma += respostas[q.id] ?? 5
    }
  })
  return contagem > 0 ? 100 * (soma / (10 * contagem)) : 0
}

let falhas = 0
function checar(nome: string, condicao: boolean, detalhe: string) {
  if (condicao) {
    console.log(`  OK   ${nome}`)
  } else {
    falhas += 1
    console.log(`  FALHOU ${nome} — ${detalhe}`)
  }
}

console.log('Casos sintéticos (lib/scoring.ts, C04b, peso 85% do resultado final):\n')

// Caso 1: todas as respostas em 0 → todas as especialidades em 0
{
  const respostas: Record<string, number> = {}
  perguntas.forEach(q => { respostas[q.id] = 0 })
  const scores = specialties.map(s => scoreC04b(s.id, respostas))
  checar('todas as respostas em 0 → todas as especialidades em 0', scores.every(s => s === 0), `scores: min=${Math.min(...scores)} max=${Math.max(...scores)}`)
}

// Caso 2: todas as respostas em 10 → todas as especialidades em 100
{
  const respostas: Record<string, number> = {}
  perguntas.forEach(q => { respostas[q.id] = 10 })
  const scores = specialties.map(s => scoreC04b(s.id, respostas))
  checar('todas as respostas em 10 → todas as especialidades em 100', scores.every(s => Math.abs(s - 100) < 1e-9), `scores: min=${Math.min(...scores)} max=${Math.max(...scores)}`)
}

// Caso 3: todas as respostas em 5 → todas as especialidades em 50, independente da quantidade de itens
{
  const respostas: Record<string, number> = {}
  perguntas.forEach(q => { respostas[q.id] = 5 })
  const scores = specialties.map(s => scoreC04b(s.id, respostas))
  checar('todas as respostas em 5 → todas as especialidades em 50 (qualquer densidade de matriz)', scores.every(s => Math.abs(s - 50) < 1e-9), `scores: min=${Math.min(...scores)} max=${Math.max(...scores)}`)
}

// Caso 4: duas especialidades com a mesma média nas perguntas relevantes, mas quantidades
// diferentes de itens associados, devem receber o mesmo score.
{
  const contagemPorEsp: Record<number, number> = {}
  specialties.forEach(s => { contagemPorEsp[s.id] = 0 })
  perguntas.forEach(q => {
    specialties.forEach(s => { if ((q.scores[String(s.id)] ?? 0) === 1) contagemPorEsp[s.id] += 1 })
  })
  const comAlgumaAssociacao = specialties.filter(s => contagemPorEsp[s.id] > 0)
  const menosItens = [...comAlgumaAssociacao].sort((a, b) => contagemPorEsp[a.id] - contagemPorEsp[b.id])[0]
  const maisItens = [...comAlgumaAssociacao].sort((a, b) => contagemPorEsp[b.id] - contagemPorEsp[a.id])[0]

  const respostas: Record<string, number> = {}
  perguntas.forEach(q => { respostas[q.id] = 7 }) // média constante em todas as perguntas
  const scoreMenos = scoreC04b(menosItens.id, respostas)
  const scoreMais = scoreC04b(maisItens.id, respostas)
  checar(
    `${menosItens.nome} (${contagemPorEsp[menosItens.id]} itens) e ${maisItens.nome} (${contagemPorEsp[maisItens.id]} itens) com a mesma média → mesmo score`,
    Math.abs(scoreMenos - scoreMais) < 1e-9,
    `${menosItens.nome}=${scoreMenos.toFixed(2)} vs ${maisItens.nome}=${scoreMais.toFixed(2)}`
  )
}

console.log(`\n${falhas === 0 ? 'Todos os casos passaram.' : `${falhas} caso(s) falharam.`}`)
process.exit(falhas === 0 ? 0 : 1)
