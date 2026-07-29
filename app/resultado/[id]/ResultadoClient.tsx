'use client'

import Results from '@/components/Results'
import { MatchResult } from '@/lib/scoring'

interface Props {
  id: string
  nome: string
  email: string
  ranking: any[]
  perfil: any
  answers: any
  narrativaIA?: Record<number, string> | null
}

export default function ResultadoClient({ id, nome, email, ranking, perfil, answers, narrativaIA }: Props) {
  const result: MatchResult = { ranking, perfil: { nome, email, ...perfil } }
  return <Results result={result} answers={answers} resultId={id} onRestart={() => window.location.href = '/'} narrativaIA={narrativaIA} />
}
