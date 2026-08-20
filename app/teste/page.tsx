'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Quiz from '@/components/Quiz'
import ResultLayout from '@/components/ResultLayout'
import { MatchResult, QuizAnswers } from '@/lib/scoring'

export default function TestePage() {
  const { user } = useUser()
  const [state, setState] = useState<'quiz' | 'loading' | 'result' | 'error'>('quiz')
  const [result, setResult] = useState<MatchResult | null>(null)
  const [savedAnswers, setSavedAnswers] = useState<QuizAnswers | null>(null)
  const [resultadoId, setResultadoId] = useState<string | undefined>()
  const [narrativaIA, setNarrativaIA] = useState<Record<number, string> | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

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

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Não foi possível calcular seu resultado.')
        setState('error')
        return
      }

      setResult(data.result)
      setResultadoId(data.id)
      setNarrativaIA(data.narrativaIA ?? null)
      setState('result')
    } catch (err) {
      console.error(err)
      setErrorMsg('Erro de conexão. Verifique sua internet e tente novamente.')
      setState('error')
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

  // Erro no envio: as respostas já estão em savedAnswers, então "tentar novamente" reenvia
  // sem fazer a pessoa refazer o teste inteiro.
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-extrabold text-blue-900 mb-2">Não deu pra calcular seu resultado</h2>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <button
            onClick={() => savedAnswers && handleComplete(savedAnswers)}
            className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition"
          >
            Tentar novamente
          </button>
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
