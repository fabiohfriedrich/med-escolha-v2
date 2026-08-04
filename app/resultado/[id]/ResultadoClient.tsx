'use client'

import Results from '@/components/Results'
import { MatchResult } from '@/lib/scoring'

interface Props {
  id: string
  nome: string
  ranking: any[]
  perfil: any
  answers: any
  narrativaIA?: Record<number, string> | null
}

export default function ResultadoClient({ id, nome, ranking, perfil, answers, narrativaIA }: Props) {
  // email não é exposto nesta página pública (link compartilhável) e não é usado por Results
  const result: MatchResult = { ranking, perfil: { nome, email: '', ...perfil } }
  return <Results result={result} answers={answers} resultId={id} onRestart={() => window.location.href = '/'} narrativaIA={narrativaIA} />
}
