'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Quiz from '@/components/Quiz'
import ResultLayout from '@/components/ResultLayout'
import { MatchResult, QuizAnswers } from '@/lib/scoring'

export default function TestePage() {
  const { user } = useUser()
  const [state, setState] = useState<'quiz' | 'loading' | 'result'>('quiz')
  const [result, setResult] = useState<MatchResult | null>(null)
  const [savedAnswers, setSavedAnswers] = useState<QuizAnswers | null>(null)
  const [resultadoId, setResultadoId] = useState<string | undefined>()
  const [narrativaIA, setNarrativaIA] = useState<Record<number, string> | null>(null)

  async function handleComplete(answers: QuizAnswers) {
    setSavedAnswers(answers)
    setState('loading')
    try {
      const email = user?.primaryEmailAddress?.emailAddress
      const answersFinais = email
        ? { ...answers, email, nome: answers.nome || [user?.firstName, user?.lastName].filter(Boolean).join(' ') }
        : answers

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answersFinais),
      })
      const data = await res.json()
      setResult(data.result)
      setResultadoId(data.id)
      setNarrativaIA(data.narrativaIA ?? null)
      setState('result')
    } catch (err) {
      console.error(err)
      setState('quiz')
      alert('Erro ao calcular resultado. Tente novamente.')
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-extrabold text-blue-900 mb-2">Calculando seu resultado...</h2>
          <p className="text-gray-500">Comparando seu perfil com 55 especialidades</p>
        </div>
      </div>
    )
  }

  if (state === 'result' && result) {
    return (
      <ResultLayout
        result={result}
        answers={savedAnswers}
        resultadoId={resultadoId}
        narrativaIA={narrativaIA}
        onRestart={() => { setResult(null); setResultadoId(undefined); setNarrativaIA(null); setState('quiz') }}
      />
    )
  }

  return <Quiz onComplete={handleComplete} emailPreenchido="" nomePreenchido="" />
}
