'use client'

import { useState, useEffect } from 'react'

interface IndicacaoStats {
  codigo: string | null
  confirmadas: number
  meta: number
  desbloqueado: boolean
}

export default function IndicacaoTab() {
  const [stats, setStats] = useState<IndicacaoStats | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/indicacoes')
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  if (!stats) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats.codigo) {
    return (
      <p className="text-gray-400 text-sm text-center py-10">
        Não encontramos seu link de indicação. Se você acabou de comprar, tenta de novo em alguns minutos.
      </p>
    )
  }

  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${stats.codigo}`

  function copiarLink() {
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const pct = Math.min(100, (stats!.confirmadas / stats!.meta) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-blue-900 mb-1">Indique e ganhe</h2>
        <p className="text-sm text-gray-500">
          Indique {stats.meta} colegas que comprarem o Med Escolha e ganhe um ebook exclusivo: <strong>renda extra pro médico recém-formado</strong>.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seu link de indicação</label>
        <div className="flex gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50 truncate"
            onFocus={e => e.target.select()}
          />
          <button
            onClick={copiarLink}
            className="flex-shrink-0 bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-800 transition"
          >
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Progresso</span>
          <span className="text-sm font-extrabold text-blue-900">{stats.confirmadas} de {stats.meta}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="h-2.5 rounded-full bg-teal-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {stats.desbloqueado ? (
        <div style={{ background: '#f0fdfa', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
          <p className="font-extrabold text-teal-900 text-lg mb-2">Bônus desbloqueado!</p>
          <p className="text-sm text-teal-700 mb-4">Você já pode acessar o ebook exclusivo.</p>
          <a
            href="/ferramentas/renda-extra"
            className="inline-block bg-teal-500 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-teal-600 transition"
          >
            Ler o ebook →
          </a>
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Faltam {stats.meta - stats.confirmadas} indicação{stats.meta - stats.confirmadas !== 1 ? 'ões' : ''} confirmada{stats.meta - stats.confirmadas !== 1 ? 's' : ''}. A indicação conta quando a pessoa compra usando seu link.
        </p>
      )}
    </div>
  )
}
