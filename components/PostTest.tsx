'use client'

import { useState } from 'react'

interface Props {
  nome: string
  email: string
  resultadoId?: string
  top3: Array<{ nome: string; pct: number }>
}

const OPCOES_MESES = [
  { meses: 3, label: '3 meses', desc: 'Ideal se você está no início do internato' },
  { meses: 6, label: '6 meses', desc: 'Recomendado — tempo suficiente para novas experiências', destaque: true },
  { meses: 12, label: '12 meses', desc: 'Bom para quem quer comparar ao longo de um ano inteiro' },
]

// Placeholder de conteúdo — será preenchido com links reais do Amo Medicina
const CONTEUDO_PLACEHOLDER = [
  {
    especialidade: 'Endocrinologia e Metabologia',
    artigos: [
      { titulo: 'Como é a rotina de um endocrinologista no Brasil', url: 'https://euamomedicina.com' },
      { titulo: 'Endocrinologia: mercado, residência e carreira', url: 'https://euamomedicina.com' },
    ],
    podcast: { titulo: 'Episódio: escolhendo endocrinologia', url: 'https://euamomedicina.com' },
  },
]

export default function PostTest({ nome, email, resultadoId, top3 }: Props) {
  const [mesesSelecionado, setMesesSelecionado] = useState<number | null>(null)
  const [agendado, setAgendado] = useState(false)
  const [dataAgendada, setDataAgendada] = useState('')
  const [loading, setLoading] = useState(false)
  const [stepAtivo, setStepAtivo] = useState<number | null>(1)

  const primeiroNome = nome.split(' ')[0]

  async function agendar() {
    if (!mesesSelecionado) return
    setLoading(true)
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
      }
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      num: 1,
      emoji: '📖',
      titulo: 'Aprofunde seu conhecimento',
      subtitulo: 'Conteúdo do Amo Medicina sobre suas especialidades',
      cor: '#0D2150',
      corBg: '#eff6ff',
    },
    {
      num: 2,
      emoji: '🩺',
      titulo: 'Conheça a rotina real',
      subtitulo: 'Depoimentos e entrevistas com especialistas',
      cor: '#0f766e',
      corBg: '#f0fdfa',
    },
    {
      num: 3,
      emoji: '📊',
      titulo: 'Compare suas especialidades',
      subtitulo: 'Entenda o mercado e tome uma decisão mais informada',
      cor: '#7c3aed',
      corBg: '#f5f3ff',
    },
    {
      num: 4,
      emoji: '🗓️',
      titulo: 'Agende seu próximo teste',
      subtitulo: 'Acompanhe sua evolução ao longo da graduação',
      cor: '#b45309',
      corBg: '#fffbeb',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Próximos passos</h2>
        <div className="w-10 h-1 bg-teal-400 rounded mb-3" />
        <p className="text-gray-600 text-sm">
          {primeiroNome}, o Med Escolha é apenas o começo da sua jornada de escolha. Siga os passos abaixo para aprofundar sua decisão.
        </p>
      </div>

      {/* Steps */}
      {steps.map(step => (
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

              {/* STEP 1: Aprofunde conhecimento */}
              {step.num === 1 && (
                <div className="pt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    Selecionamos conteúdos do Amo Medicina especificamente sobre as suas especialidades mais compatíveis. Em breve você encontrará artigos, episódios de podcast e vídeos sobre cada uma delas.
                  </p>
                  <div className="space-y-3">
                    {top3.map((e, i) => (
                      <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px' }}>
                        <p className="font-bold text-sm text-blue-900 mb-2">{e.nome}</p>
                        <div className="space-y-2">
                          <div style={{ background: '#e0f2fe', borderRadius: 8, padding: '10px 14px' }}>
                            <p className="text-xs font-semibold text-blue-700 mb-0.5">📝 Artigos</p>
                            <p className="text-xs text-gray-500 italic">Conteúdo sendo preparado pelo time Amo Medicina...</p>
                          </div>
                          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px' }}>
                            <p className="text-xs font-semibold text-green-700 mb-0.5">🎙️ Podcast</p>
                            <p className="text-xs text-gray-500 italic">Episódio sendo preparado...</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#fffbeb', borderRadius: 12, padding: '12px 16px', borderLeft: '4px solid #f59e0b' }}>
                    <p className="text-xs font-semibold text-amber-700">💡 Enquanto isso</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Acesse <a href="https://euamomedicina.com" target="_blank" className="text-blue-600 font-semibold underline">euamomedicina.com</a> e explore todos os conteúdos disponíveis sobre carreiras médicas.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Rotina real */}
              {step.num === 2 && (
                <div className="pt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    Nada substitui ouvir diretamente de quem vive aquela especialidade no dia a dia. Estamos preparando entrevistas e depoimentos com especialistas nas suas áreas de maior compatibilidade.
                  </p>
                  <div className="space-y-3">
                    {top3.map((e, i) => (
                      <div key={i} style={{ background: '#f0fdfa', borderRadius: 12, padding: '14px 16px', borderLeft: '4px solid #2dd4bf' }}>
                        <p className="font-bold text-sm text-teal-900">{e.nome}</p>
                        <p className="text-xs text-gray-500 mt-1 italic">Depoimento de especialista em breve...</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#fffbeb', borderRadius: 12, padding: '12px 16px', borderLeft: '4px solid #f59e0b' }}>
                    <p className="text-xs font-semibold text-amber-700">💡 Dica prática</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Procure médicos especialistas nas suas áreas de interesse e peça para fazer um dia de job shadowing (acompanhar a rotina). É a melhor forma de validar se a especialidade combina com você na prática.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Compare especialidades */}
              {step.num === 3 && (
                <div className="pt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    Seu resultado mostra muito mais do que as 3 primeiras especialidades. O ranking completo revela padrões importantes sobre o que o seu perfil busca em uma carreira médica.
                  </p>
                  <div className="space-y-3">
                    {[
                      { titulo: 'Observe o padrão do seu top 10', desc: 'São especialidades cirúrgicas, clínicas ou de diagnóstico? Isso revela traços fundamentais do seu perfil.' },
                      { titulo: 'Compare saturação vs. compatibilidade', desc: 'Uma especialidade com alta compatibilidade e baixa saturação de mercado pode ser uma oportunidade estratégica.' },
                      { titulo: 'Considere o tempo de formação', desc: 'O número de anos de residência impacta diretamente quando você começará a exercer a especialidade.' },
                    ].map((dica, i) => (
                      <div key={i} style={{ background: '#f5f3ff', borderRadius: 12, padding: '14px 16px' }}>
                        <p className="font-bold text-sm text-purple-900">💡 {dica.titulo}</p>
                        <p className="text-xs text-gray-600 mt-1">{dica.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Volte à aba <strong>"Meu Resultado"</strong> e explore o ranking completo com esse olhar analítico.
                  </p>
                </div>
              )}

              {/* STEP 4: Agendar reteste */}
              {step.num === 4 && (
                <div className="pt-4 space-y-4">
                  {!agendado ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Seu perfil evolui conforme você avança na graduação e tem novas experiências. Agende agora um lembrete para refazer o teste e comparar os resultados.
                      </p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quando quer ser lembrado?</p>
                      <div className="space-y-2">
                        {OPCOES_MESES.map(op => (
                          <button
                            key={op.meses}
                            onClick={() => setMesesSelecionado(op.meses)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center justify-between`}
                            style={{
                              borderColor: mesesSelecionado === op.meses ? '#0D2150' : op.destaque ? '#2dd4bf' : '#e5e7eb',
                              background: mesesSelecionado === op.meses ? '#eff6ff' : op.destaque ? '#f0fdfa' : '#fff',
                            }}
                          >
                            <div>
                              <p className="font-bold text-sm text-gray-900">{op.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{op.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              {op.destaque && (
                                <span style={{ background: '#ccfbf1', color: '#0f766e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                                  Recomendado
                                </span>
                              )}
                              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                style={{ borderColor: mesesSelecionado === op.meses ? '#0D2150' : '#d1d5db' }}>
                                {mesesSelecionado === op.meses && (
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0D2150' }} />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={agendar}
                        disabled={!mesesSelecionado || loading}
                        className="w-full font-bold py-3.5 rounded-xl transition text-white disabled:opacity-50"
                        style={{ background: mesesSelecionado ? '#0D2150' : '#9ca3af' }}
                      >
                        {loading ? 'Agendando...' : `Agendar lembrete para ${mesesSelecionado ? `${mesesSelecionado} meses` : '...'}`}
                      </button>
                      <p className="text-xs text-gray-400 text-center">
                        Você receberá um email em <strong>{email}</strong> na data escolhida.
                      </p>
                    </>
                  ) : (
                    <div style={{ background: '#f0fdfa', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                      <p className="font-extrabold text-teal-900 text-lg mb-2">Lembrete agendado!</p>
                      <p className="text-sm text-teal-700">
                        Vamos te avisar em <strong>{email}</strong><br />
                        no dia <strong>{dataAgendada}</strong> para refazer o Med Escolha.
                      </p>
                      <p className="text-xs text-gray-500 mt-3">
                        Compare os resultados e acompanhe como seu perfil evolui ao longo da graduação.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
