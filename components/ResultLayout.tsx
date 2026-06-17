'use client'

import { useState } from 'react'
import Results from './Results'
import PostTest from './PostTest'
import FeedbackBox from './FeedbackBox'
import { MatchResult } from '@/lib/scoring'

type Tab = 'resultado' | 'proximos' | 'refazer'

interface Props {
  result: MatchResult
  answers?: any
  resultadoId?: string
  onRestart: () => void
}

export default function ResultLayout({ result, answers, resultadoId, onRestart }: Props) {
  const [tab, setTab] = useState<Tab>('resultado')

  const tabs = [
    { id: 'resultado' as Tab, label: '🎯 Meu Resultado' },
    { id: 'proximos' as Tab,  label: '📚 Próximos Passos' },
    { id: 'refazer' as Tab,   label: '🔄 Refazer Teste' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegação com abas */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id === 'refazer') {
                    if (confirm('Tem certeza que quer refazer o teste? Seu resultado atual será perdido.')) {
                      onRestart()
                    }
                  } else {
                    setTab(t.id)
                  }
                }}
                className="flex-1 py-4 text-sm font-semibold transition-all border-b-2"
                style={{
                  borderColor: tab === t.id ? '#0D2150' : 'transparent',
                  color: tab === t.id ? '#0D2150' : '#6b7280',
                  background: 'transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo da aba */}
      {tab === 'resultado' && (
        <>
          <Results result={result} answers={answers} resultId={resultadoId} onRestart={onRestart} hideRestartButton />
          {resultadoId && <FeedbackBox resultadoId={resultadoId} />}
        </>
      )}

      {tab === 'proximos' && (
        <PostTest
          nome={result.perfil.nome}
          email={result.perfil.email}
          resultadoId={resultadoId}
          top3={result.ranking.slice(0, 3)}
        />
      )}
    </div>
  )
}
