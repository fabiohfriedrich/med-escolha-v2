'use client'

import { useState, useEffect, useCallback } from 'react'
import posthog from 'posthog-js'

interface Props {
  nome: string
  email: string
  resultadoId?: string
}

interface ItemCronograma {
  id: string
  step_num: number
  titulo: string
  status: 'pendente' | 'em_andamento' | 'concluido'
  data_alvo: string | null
  custom: boolean
}

const OPCOES_MESES = [
  { meses: 3, label: '3 meses', desc: 'Ideal se você está no início do internato' },
  { meses: 6, label: '6 meses', desc: 'Recomendado — tempo suficiente para novas experiências', destaque: true },
  { meses: 12, label: '12 meses', desc: 'Bom para quem quer comparar ao longo de um ano inteiro' },
]

const STEPS_INFO = [
  { num: 1, emoji: '📖', titulo: 'Aprofunde seu conhecimento', subtitulo: 'Conteúdo do Amo Medicina sobre suas especialidades', cor: '#0D2150', corBg: '#eff6ff' },
  { num: 2, emoji: '🩺', titulo: 'Conheça a rotina real', subtitulo: 'Depoimentos e entrevistas com especialistas', cor: '#0f766e', corBg: '#f0fdfa' },
  { num: 3, emoji: '📊', titulo: 'Compare suas especialidades', subtitulo: 'Entenda o mercado e tome uma decisão mais informada', cor: '#7c3aed', corBg: '#f5f3ff' },
  { num: 4, emoji: '🗓️', titulo: 'Agende seu próximo teste', subtitulo: 'Acompanhe sua evolução ao longo da graduação', cor: '#b45309', corBg: '#fffbeb' },
]

export default function PostTest({ nome, email, resultadoId }: Props) {
  const [itens, setItens] = useState<ItemCronograma[]>([])
  const [loadingItens, setLoadingItens] = useState(true)
  const [stepAtivo, setStepAtivo] = useState<number | null>(1)
  const [novaTarefa, setNovaTarefa] = useState<Record<number, string>>({})

  const [mesesSelecionado, setMesesSelecionado] = useState<number | null>(null)
  const [agendado, setAgendado] = useState(false)
  const [dataAgendada, setDataAgendada] = useState('')
  const [loadingAgendar, setLoadingAgendar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const primeiroNome = nome.split(' ')[0]

  const carregarItens = useCallback(async () => {
    try {
      const params = new URLSearchParams({ email })
      if (resultadoId) params.set('resultadoId', resultadoId)
      const res = await fetch(`/api/cronograma?${params.toString()}`)
      const data = await res.json()
      setItens(data.itens ?? [])
    } finally {
      setLoadingItens(false)
    }
  }, [email, resultadoId])

  useEffect(() => { carregarItens() }, [carregarItens])

  useEffect(() => {
    fetch('/api/agendar-reteste')
      .then(res => res.json())
      .then(data => {
        if (data.agendado) {
          setAgendado(true)
          setDataAgendada(data.data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!erro) return
    const t = setTimeout(() => setErro(null), 4000)
    return () => clearTimeout(t)
  }, [erro])

  async function alternarStatus(item: ItemCronograma) {
    const novoStatus = item.status === 'concluido' ? 'pendente' : 'concluido'
    await marcarStatus(item.id, novoStatus)
    if (novoStatus === 'concluido') {
      posthog.capture('cronograma_item_concluido', { step_num: item.step_num, custom: item.custom })
    }
  }

  async function marcarStatus(itemId: string, status: ItemCronograma['status']) {
    const anterior = itens.find(i => i.id === itemId)?.status
    setItens(prev => prev.map(i => i.id === itemId ? { ...i, status } : i))
    const res = await fetch(`/api/cronograma/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok && anterior) {
      setItens(prev => prev.map(i => i.id === itemId ? { ...i, status: anterior } : i))
      setErro('Não consegui salvar essa alteração. Tenta de novo.')
    }
  }

  async function alterarData(item: ItemCronograma, dataAlvo: string) {
    const anterior = item.data_alvo
    setItens(prev => prev.map(i => i.id === item.id ? { ...i, data_alvo: dataAlvo || null } : i))
    const res = await fetch(`/api/cronograma/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataAlvo: dataAlvo || null }),
    })
    if (!res.ok) {
      setItens(prev => prev.map(i => i.id === item.id ? { ...i, data_alvo: anterior } : i))
      setErro('Não consegui salvar essa data. Tenta de novo.')
    }
  }

  async function adicionarTarefa(stepNum: number) {
    const titulo = (novaTarefa[stepNum] || '').trim()
    if (!titulo) return
    const res = await fetch('/api/cronograma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resultadoId, stepNum, titulo }),
    })
    if (!res.ok) {
      setErro('Não consegui adicionar essa tarefa. Tenta de novo.')
      return
    }
    const data = await res.json()
    if (data.item) setItens(prev => [...prev, data.item])
    setNovaTarefa(prev => ({ ...prev, [stepNum]: '' }))
  }

  async function removerTarefa(item: ItemCronograma) {
    setItens(prev => prev.filter(i => i.id !== item.id))
    const res = await fetch(`/api/cronograma/${item.id}`, { method: 'DELETE' })
    if (!res.ok) {
      setItens(prev => [...prev, item])
      setErro('Não consegui remover essa tarefa. Tenta de novo.')
    }
  }

  async function agendar() {
    if (!mesesSelecionado) return
    setLoadingAgendar(true)
    try {
      const res = await fetch('/api/agendar-reteste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nome, resultadoId, meses: mesesSelecionado }),
      })
      const data = await res.json()
      if (data.ok) {
        setAgendado(true)
        setDataAgendada(data.data)
        posthog.capture('reteste_agendado', { meses: mesesSelecionado })
        const itemPasso4 = itens.find(i => i.step_num === 4 && !i.custom)
        if (itemPasso4) marcarStatus(itemPasso4.id, 'concluido')
      } else {
        setErro('Não consegui agendar o lembrete. Tenta de novo.')
      }
    } finally {
      setLoadingAgendar(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Meu cronograma</h2>
        <div className="w-10 h-1 bg-teal-400 rounded mb-3" />
        <p className="text-gray-600 text-sm">
          {primeiroNome}, o Med Escolha é apenas o começo da sua jornada de escolha. Marque, edite e acompanhe os próximos passos no seu ritmo.
        </p>
      </div>

      {erro && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 16px' }}
          className="flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">{erro}</p>
          <button onClick={() => setErro(null)} className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">✕</button>
        </div>
      )}

      {loadingItens && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Steps */}
      {!loadingItens && STEPS_INFO.map(step => {
        const itensDoStep = itens.filter(i => i.step_num === step.num)
        const concluidos = itensDoStep.filter(i => i.status === 'concluido').length

        return (
          <div key={step.num} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header do step */}
            <button
              className="w-full text-left p-5 flex items-center gap-4"
              onClick={() => setStepAtivo(stepAtivo === step.num ? null : step.num)}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{ background: step.corBg }}>
                {step.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: step.cor }}>
                    Passo {step.num}
                  </span>
                  {itensDoStep.length > 0 && (
                    <span className="text-xs font-semibold text-gray-400">
                      {concluidos}/{itensDoStep.length} concluído{concluidos !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="font-extrabold text-gray-900 text-base">{step.titulo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{step.subtitulo}</p>
              </div>
              <span className="text-gray-400 flex-shrink-0 text-lg">
                {stepAtivo === step.num ? '▲' : '▼'}
              </span>
            </button>

            {/* Conteúdo do step */}
            {stepAtivo === step.num && (
              <div className="px-5 pb-6 border-t border-gray-100">
                <div className="pt-4 space-y-2">
                  {itensDoStep.map(item => (
                    <div key={item.id} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px' }}
                      className="flex items-start gap-3">
                      <button
                        onClick={() => alternarStatus(item)}
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          borderColor: item.status === 'concluido' ? step.cor : '#d1d5db',
                          background: item.status === 'concluido' ? step.cor : 'transparent',
                        }}
                      >
                        {item.status === 'concluido' && <span className="text-white text-xs">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.status === 'concluido' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {item.titulo}
                        </p>
                        <input
                          type="date"
                          value={item.data_alvo ?? ''}
                          onChange={e => alterarData(item, e.target.value)}
                          className="mt-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1"
                        />
                      </div>
                      {item.custom && (
                        <button onClick={() => removerTarefa(item)} className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Adicionar tarefa */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Adicionar uma tarefa..."
                      value={novaTarefa[step.num] ?? ''}
                      onChange={e => setNovaTarefa(prev => ({ ...prev, [step.num]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && adicionarTarefa(step.num)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      onClick={() => adicionarTarefa(step.num)}
                      className="text-sm font-semibold px-3 py-2 rounded-lg"
                      style={{ background: step.corBg, color: step.cor }}
                    >
                      + Adicionar
                    </button>
                  </div>

                  {step.num === 1 && (
                    <div style={{ background: '#fffbeb', borderRadius: 12, padding: '12px 16px', borderLeft: '4px solid #f59e0b' }} className="mt-2">
                      <p className="text-xs font-semibold text-amber-700">💡 Enquanto isso</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Acesse <a href="https://euamomedicina.com" target="_blank" className="text-blue-600 font-semibold underline">euamomedicina.com</a> e explore todos os conteúdos disponíveis sobre carreiras médicas.
                      </p>
                    </div>
                  )}

                  {step.num === 3 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Volte à aba <strong>&quot;Meu Resultado&quot;</strong> e explore o ranking completo com esse olhar analítico.
                    </p>
                  )}

                  {/* STEP 4: Agendar reteste */}
                  {step.num === 4 && (
                    <div className="pt-4 space-y-4">
                      {!agendado ? (
                        <>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quando quer ser lembrado?</p>
                          <div className="space-y-2">
                            {OPCOES_MESES.map(op => (
                              <button
                                key={op.meses}
                                onClick={() => setMesesSelecionado(op.meses)}
                                className="w-full text-left p-4 rounded-xl border-2 transition flex items-center justify-between"
                                style={{
                                  borderColor: mesesSelecionado === op.meses ? '#0D2150' : op.destaque ? '#2dd4bf' : '#e5e7eb',
                                  background: mesesSelecionado === op.meses ? '#eff6ff' : op.destaque ? '#f0fdfa' : '#fff',
                                }}
                              >
                                <div>
                                  <p className="font-bold text-sm text-gray-900">{op.label}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{op.desc}</p>
                                </div>
                                {op.destaque && (
                                  <span style={{ background: '#ccfbf1', color: '#0f766e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                                    Recomendado
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={agendar}
                            disabled={!mesesSelecionado || loadingAgendar}
                            className="w-full font-bold py-3.5 rounded-xl transition text-white disabled:opacity-50"
                            style={{ background: mesesSelecionado ? '#0D2150' : '#9ca3af' }}
                          >
                            {loadingAgendar ? 'Agendando...' : `Agendar lembrete para ${mesesSelecionado ? `${mesesSelecionado} meses` : '...'}`}
                          </button>
                        </>
                      ) : (
                        <div style={{ background: '#f0fdfa', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
                          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                          <p className="font-extrabold text-teal-900 text-lg mb-2">Lembrete agendado!</p>
                          <p className="text-sm text-teal-700">
                            Vamos te avisar em <strong>{email}</strong><br />
                            no dia <strong>{dataAgendada}</strong> para refazer o Med Escolha.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
