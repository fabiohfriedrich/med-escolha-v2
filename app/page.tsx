'use client'

import { useState } from 'react'
import Quiz from '@/components/Quiz'
import ResultLayout from '@/components/ResultLayout'
import EmailGate from '@/components/EmailGate'
import { MatchResult, QuizAnswers } from '@/lib/scoring'

// Controle de acesso: true = exige compra na Hotmart, false = livre
const ACESSO_RESTRITO = process.env.NEXT_PUBLIC_ACESSO_RESTRITO === 'true'

type AppState = 'gate' | 'quiz' | 'loading' | 'result'

export default function Home() {
  const [state, setState] = useState<AppState>(ACESSO_RESTRITO ? 'gate' : 'quiz')
  const [result, setResult] = useState<MatchResult | null>(null)
  const [savedAnswers, setSavedAnswers] = useState<QuizAnswers | null>(null)
  const [resultadoId, setResultadoId] = useState<string | undefined>()
  const [emailVerificado, setEmailVerificado] = useState('')
  const [nomeVerificado, setNomeVerificado] = useState('')

  function handleAcessoLiberado(email: string, nome: string) {
    setEmailVerificado(email)
    setNomeVerificado(nome)
    setState('quiz')
  }

  async function handleComplete(answers: QuizAnswers) {
    // Se passou pelo gate, usa o email verificado
    const answersFinais = emailVerificado
      ? { ...answers, email: emailVerificado, nome: answers.nome || nomeVerificado }
      : answers

    setSavedAnswers(answersFinais)
    setState('loading')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answersFinais),
      })
      const data = await res.json()
      setResult(data.result)
      setResultadoId(data.id)
      setState('result')
    } catch (err) {
      console.error(err)
      setState('quiz')
      alert('Erro ao calcular resultado. Tente novamente.')
    }
  }

  if (state === 'gate') {
    return <EmailGate onAcessoLiberado={handleAcessoLiberado} />
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
        onRestart={() => { setResult(null); setResultadoId(undefined); setState(ACESSO_RESTRITO ? 'gate' : 'quiz') }}
      />
    )
  }

  return <Quiz onComplete={handleComplete} emailPreenchido={emailVerificado} nomePreenchido={nomeVerificado} />
}
