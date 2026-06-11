'use client'

import { useState } from 'react'

interface Props {
  resultadoId: string
}

export default function FeedbackBox({ resultadoId }: Props) {
  const [nota, setNota] = useState<number | null>(null)
  const [texto, setTexto] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function enviar() {
    if (!nota) return
    setEnviando(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultadoId, nota, texto: texto.trim() || null }),
    })
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">🙏</div>
          <p className="font-bold text-green-800 text-lg">Obrigado pelo feedback!</p>
          <p className="text-green-600 text-sm mt-1">Sua opinião nos ajuda a melhorar o Med Escolha.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">O que achou do teste?</h3>
          <p className="text-sm text-gray-500 mt-0.5">Leva menos de 1 minuto e nos ajuda muito. Opcional.</p>
        </div>

        {/* Escala 1–10 */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            De 1 a 10, quanto você recomendaria o Med Escolha para um colega?
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setNota(n)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border-2 ${
                  nota === n
                    ? 'bg-blue-700 text-white border-blue-700 scale-110'
                    : n <= 6
                    ? 'bg-red-50 text-red-600 border-red-100 hover:border-red-400'
                    : n <= 8
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:border-yellow-400'
                    : 'bg-green-50 text-green-700 border-green-100 hover:border-green-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-0.5">
            <span>Não recomendaria</span>
            <span>Recomendaria com certeza</span>
          </div>
        </div>

        {/* Comentário */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Comentário <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder:text-gray-400"
            placeholder="O que mais gostou? O que poderia melhorar?"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            maxLength={500}
          />
          {texto.length > 0 && (
            <p className="text-xs text-gray-400 text-right mt-0.5">{texto.length}/500</p>
          )}
        </div>

        <button
          onClick={enviar}
          disabled={!nota || enviando}
          className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {enviando ? 'Enviando...' : 'Enviar feedback'}
        </button>
        {!nota && (
          <p className="text-xs text-center text-gray-400 -mt-2">Selecione uma nota para enviar</p>
        )}
      </div>
    </div>
  )
}
