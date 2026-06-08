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
}

export default function ResultadoClient({ nome, email, ranking, perfil, answers }: Props) {
  const result: MatchResult = { ranking, perfil: { nome, email, ...perfil } }
  return <Results result={result} answers={answers} onRestart={() => window.location.href = '/'} />
}
