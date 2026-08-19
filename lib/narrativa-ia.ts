import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import c04bData from '@/data/c04b_perguntas.json'

const C04B_QUESTIONS = (c04bData as any).questions as Array<{
  id: string; enunciado_pt: string; scores: Record<string, number>
}>

const JUNG_MAP = {
  EI: { E: ['temp-15', 'temp-16'], I: ['temp-01', 'temp-02', 'temp-17'] },
  TF: { T: ['temp-03', 'temp-07', 'temp-08', 'temp-19'], F: ['temp-04', 'temp-05', 'temp-18', 'temp-20'] },
  SN: { S: ['temp-10', 'temp-11', 'temp-23'], N: ['temp-09', 'temp-12', 'temp-13', 'temp-21', 'temp-22', 'temp-24', 'temp-25'] },
}
const JUNG_LABELS: Record<string, string> = {
  E: 'Extroversão', I: 'Introversão', T: 'Pensamento', F: 'Sentimento', S: 'Sensação', N: 'Intuição',
}

function resolveAxis(selected: string[], sideA: string[], sideB: string[]): 'A' | 'B' {
  const countA = selected.filter(s => sideA.includes(s)).length
  const countB = selected.filter(s => sideB.includes(s)).length
  return countA >= countB ? 'A' : 'B'
}

function getCompatItems(specId: number, c04bAnswers: Record<string, number>) {
  return C04B_QUESTIONS
    .filter(q => q.scores[String(specId)] === 1 && (c04bAnswers[q.id] || 0) > 0)
    .map(q => ({ label: q.enunciado_pt, score: c04bAnswers[q.id] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

const NarrativaSchema = z.object({
  narrativas: z.array(z.object({
    especialidade_id: z.number(),
    texto: z.string().describe('Narrativa de 2 a 3 frases, tom direto e acessível, explicando por que essa especialidade combina com o perfil da pessoa.'),
  })),
})

interface Top3Input {
  id: number
  nome: string
  pct: number
  saturacao: string
  crescimento: string
}

interface GerarNarrativasParams {
  nome: string
  demographics: { genero: string; anoFormatura: string }
  hollandList: string[]
  jungSelected: string[]
  c04bAnswers: Record<string, number>
  top3: Top3Input[]
}

export async function gerarNarrativasTop3({
  nome,
  demographics,
  hollandList,
  jungSelected,
  c04bAnswers,
  top3,
}: GerarNarrativasParams): Promise<Record<number, string> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  try {
    const client = new Anthropic({ apiKey })
    const primeiroNome = (nome || 'Participante').split(' ')[0]

    const eiResult = resolveAxis(jungSelected, JUNG_MAP.EI.E, JUNG_MAP.EI.I) === 'A' ? 'E' : 'I'
    const tfResult = resolveAxis(jungSelected, JUNG_MAP.TF.T, JUNG_MAP.TF.F) === 'A' ? 'T' : 'F'
    const snResult = resolveAxis(jungSelected, JUNG_MAP.SN.S, JUNG_MAP.SN.N) === 'A' ? 'S' : 'N'

    const especialidadesTexto = top3.map((e, i) => {
      const traits = getCompatItems(e.id, c04bAnswers).map(t => t.label)
      return `${i + 1}. ${e.nome} (${e.pct.toFixed(1)}% de compatibilidade, mercado ${(e.saturacao ?? 'média').toLowerCase()}, crescimento ${(e.crescimento ?? 'médio').toLowerCase()})${traits.length ? `\n   Respostas que mais pesaram: ${traits.join('; ')}` : ''}`
    }).join('\n')

    const prompt = `Perfil: ${primeiroNome}${demographics?.anoFormatura ? `, previsão de formatura em ${demographics.anoFormatura}` : ''}.
Perfil Holland (interesses vocacionais): ${hollandList.join(', ') || 'não informado'}.
Temperamento predominante: ${JUNG_LABELS[eiResult]}, ${JUNG_LABELS[tfResult]}, ${JUNG_LABELS[snResult]}.

Top 3 especialidades do match, em ordem:
${especialidadesTexto}

Para cada uma das 3 especialidades acima, escreva uma narrativa curta (2 a 3 frases) explicando especificamente por que ela combina com o perfil dessa pessoa. Use as respostas que mais pesaram e o perfil Holland/temperamento como base real da explicação, não genérica. Tom: direto, acessível, como um médico falando com outro médico. Não use travessão (—). Retorne uma narrativa para cada uma das 3 especialidades, na mesma ordem.`

    const response = await client.messages.parse({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: zodOutputFormat(NarrativaSchema) },
    })

    const parsed = response.parsed_output
    if (!parsed) return null

    const map: Record<number, string> = {}
    for (const n of parsed.narrativas) map[n.especialidade_id] = n.texto
    return map
  } catch (err) {
    console.error('[narrativa-ia] Erro ao gerar narrativa:', err)
    return null
  }
}
