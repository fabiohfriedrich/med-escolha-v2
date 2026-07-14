'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import c04aData from '@/data/c04a_valores.json'
import c04bData from '@/data/c04b_perguntas.json'
import specialtiesData from '@/data/specialties.json'

const VALORES = (c04aData as any).questions as Array<{ id: string; enunciado_pt: string }>
const PERGUNTAS = (c04bData as any).questions as Array<{ id: string; bloco: string; enunciado_pt: string }>
const ESPECIALIDADES = specialtiesData.specialties

// Blocos de perguntas C04b
const BLOCOS: Record<string, string> = {
  B2: 'Como você pensa',
  B3: 'Seu estilo de trabalho',
  B4: 'Você e as pessoas',
  B5: 'O que te motiva',
  B6: 'Seu perfil profissional',
  B7: 'Situações de trabalho',
  B8: 'Outras características',
}

// 23 afirmações Jung/MBTI originais (temp-01 a temp-25, sem temp-06 e temp-14)
const JUNG_STATEMENTS = [
  { id: 'temp-01', texto: 'Concentra-se nas suas tarefas' },
  { id: 'temp-02', texto: 'Irrita-se quando a agitação dos outros não o deixa trabalhar sossegado' },
  { id: 'temp-03', texto: 'Não se preocupa com a vida pessoal e os sentimentos dos colegas' },
  { id: 'temp-04', texto: 'Acha mais importante as pessoas que trabalham com você' },
  { id: 'temp-05', texto: 'Procura persuadir seu superior com muito tato e sensibilidade' },
  { id: 'temp-07', texto: 'É percebido como racional e imparcial' },
  { id: 'temp-08', texto: 'Costuma ser lógico e impessoal nas suas decisões profissionais' },
  { id: 'temp-09', texto: 'Aprecia participar de novas tarefas e projetos inovadores' },
  { id: 'temp-10', texto: 'Ao receber uma nova tarefa, precisa saber os passos necessários para realizá-la' },
  { id: 'temp-11', texto: 'Preocupa-se mais com as tarefas a serem realizadas no presente' },
  { id: 'temp-12', texto: 'Constantemente pensa em inovações e mudanças na rotina do trabalho' },
  { id: 'temp-13', texto: 'Sente-se melhor planejando algo novo' },
  { id: 'temp-15', texto: 'Tende a conversar constantemente com os colegas durante as aulas' },
  { id: 'temp-16', texto: 'Sente dificuldade para concentrar-se em um tema durante muito tempo' },
  { id: 'temp-17', texto: 'Prefere criar um pequeno grupo de amigos mais próximos' },
  { id: 'temp-18', texto: 'Sente-se mais à vontade com ciências humanas' },
  { id: 'temp-19', texto: 'Precisa compreender a lógica da matéria' },
  { id: 'temp-20', texto: 'Evita expor ideias divergentes das ideias do professor e dos colegas' },
  { id: 'temp-21', texto: 'Aprecia trabalhos criativos' },
  { id: 'temp-22', texto: 'Prefere matérias teóricas que permitam desdobramentos de ideias' },
  { id: 'temp-23', texto: 'É paciente a ponto de repetir o mesmo exercício para aprimorar-se' },
  { id: 'temp-24', texto: 'Prefere a elaboração de uma pesquisa científica' },
  { id: 'temp-25', texto: 'Procura novos conhecimentos teóricos' },
]

// Perguntas Holland — 3 por tipo, sistema calcula o perfil automaticamente
const HOLLAND_QUESTIONS = [
  { id: 'R1', tipo: 'Realista',      texto: 'Gosto de trabalhar com ferramentas, máquinas ou equipamentos' },
  { id: 'R2', tipo: 'Realista',      texto: 'Prefiro atividades práticas e concretas a atividades teóricas' },
  { id: 'R3', tipo: 'Realista',      texto: 'Tenho facilidade para trabalhos manuais e técnicos' },
  { id: 'I1', tipo: 'Investigativo', texto: 'Gosto de analisar e resolver problemas complexos' },
  { id: 'I2', tipo: 'Investigativo', texto: 'Tenho curiosidade científica e gosto de investigar causas e soluções' },
  { id: 'I3', tipo: 'Investigativo', texto: 'Prefiro trabalhar com ideias, dados e conceitos abstratos' },
  { id: 'A1', tipo: 'Artístico',     texto: 'Valorizo a criatividade e a expressão pessoal no meu trabalho' },
  { id: 'A2', tipo: 'Artístico',     texto: 'Prefiro ambientes não estruturados, com espaço para inovação' },
  { id: 'A3', tipo: 'Artístico',     texto: 'Tenho interesse por arte, design, literatura ou expressão cultural' },
  { id: 'S1', tipo: 'Social',        texto: 'Gosto de ajudar, ensinar ou aconselhar outras pessoas' },
  { id: 'S2', tipo: 'Social',        texto: 'Me sinto bem em trabalhos colaborativos e de grupo' },
  { id: 'S3', tipo: 'Social',        texto: 'Tenho facilidade de comunicação e empatia com as pessoas' },
  { id: 'E1', tipo: 'Empreendedor',  texto: 'Gosto de liderar, persuadir e influenciar pessoas' },
  { id: 'E2', tipo: 'Empreendedor',  texto: 'Tenho espírito competitivo e orientação a resultados' },
  { id: 'E3', tipo: 'Empreendedor',  texto: 'Prefiro assumir riscos e tomar decisões em vez de seguir instruções' },
  { id: 'C1', tipo: 'Convencional',  texto: 'Prefiro trabalhos organizados, com regras e procedimentos claros' },
  { id: 'C2', tipo: 'Convencional',  texto: 'Tenho atenção a detalhes e gosto de precisão nas tarefas' },
  { id: 'C3', tipo: 'Convencional',  texto: 'Me sinto confortável com rotinas estruturadas e previsíveis' },
]

// Calcula Holland a partir das respostas (retorna os 2 tipos com mais "sim")
function calcularHolland(respostas: Record<string, boolean>): string[] {
  const scores: Record<string, number> = {}
  HOLLAND_QUESTIONS.forEach(q => {
    if (respostas[q.id]) scores[q.tipo] = (scores[q.tipo] || 0) + 1
  })
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
    .slice(0, 3)
    .map(([k]) => k)
}

const SCALE_LABELS: Record<number, string> = { 0: 'Nada', 5: 'Moderado', 10: 'Totalmente' }

// Steps: 0=info+demo, 1=valores(c04a), 2=comportamentos(c04b), 3=jung, 4=holland, 5=c02
const TOTAL_STEPS = 6

interface Props {
  onComplete: (answers: any) => void
  emailPreenchido?: string
  nomePreenchido?: string
}

export default function Quiz({ onComplete, emailPreenchido = '', nomePreenchido = '' }: Props) {
  const [step, setStep] = useState(0)
  const [blocoIdx, setBlocoIdx] = useState(0)

  // Dados pessoais + demográficos
  const [info, setInfo] = useState({ nome: nomePreenchido, email: emailPreenchido })
  const [demo, setDemo] = useState({ genero: '', faculdade: '', anoFormatura: '' })

  // Respostas
  const [c04a, setC04a] = useState<Record<string, boolean>>({})
  // Sliders iniciam vazios — só entram no scoring quando o usuário interagir
  const [c04b, setC04b] = useState<Record<string, number>>({})
  const [jung, setJung] = useState<string[]>([])
  const [hollandRespostas, setHollandRespostas] = useState<Record<string, boolean>>({})
  const [c02, setC02] = useState<number[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const blocos = Object.keys(BLOCOS)
  const perguntasBloco = PERGUNTAS.filter(p => p.bloco === blocos[blocoIdx])

  const progress = step === 2
    ? Math.round(((2 + blocoIdx / blocos.length) / TOTAL_STEPS) * 100)
    : Math.round((step / TOTAL_STEPS) * 100)

  function nextStep() {
    if (step === 0) {
      const e: Record<string, string> = {}
      if (!info.nome.trim()) e.nome = 'Digite seu nome'
      if (!info.email.trim() || !info.email.includes('@')) e.email = 'Digite um email válido'
      if (Object.keys(e).length) { setErrors(e); return }
      posthog.capture('quiz_iniciado', { tipo: 'completo' })
    }
    if (step === 2 && blocoIdx < blocos.length - 1) {
      setBlocoIdx(b => b + 1)
      window.scrollTo(0, 0)
      return
    }
    setErrors({})
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }

  function prevStep() {
    if (step === 2 && blocoIdx > 0) { setBlocoIdx(b => b - 1); window.scrollTo(0, 0); return }
    setStep(s => Math.max(0, s - 1))
    window.scrollTo(0, 0)
  }

  function toggleJung(id: string) {
    setJung(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function toggleHollandResp(id: string) {
    setHollandRespostas(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleC02(id: number) {
    setC02(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function submit() {
    posthog.capture('quiz_completo', { tipo: 'completo' })
    onComplete({
      nome: info.nome,
      email: info.email,
      demographics: demo,
      c04a,
      c04b,
      c02,
      jung,
      holland: calcularHolland(hollandRespostas),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de progresso */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-900">Med Escolha</span>
            <span className="text-sm text-gray-500">{progress}% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-700 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── STEP 0: Informações + demográficos ── */}
        {step === 0 && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Med Escolha</h1>
              <p className="text-gray-600 text-lg">Descubra as especialidades médicas mais compatíveis com o seu perfil.</p>
              <p className="text-gray-500 mt-2 text-sm">~20 minutos · 95 questões · 55 especialidades</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nome completo *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome"
                    value={info.nome}
                    onChange={e => setInfo(i => ({ ...i, nome: e.target.value }))}
                  />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="seu@email.com"
                    type="email"
                    value={info.email}
                    onChange={e => setInfo(i => ({ ...i, email: e.target.value }))}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gênero</label>
                <div className="flex gap-3">
                  {['Masculino', 'Feminino', 'Outro'].map(g => (
                    <button
                      key={g}
                      onClick={() => setDemo(d => ({ ...d, genero: g }))}
                      className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition ${demo.genero === g ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >{g}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Faculdade de medicina</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da sua instituição"
                  value={demo.faculdade}
                  onChange={e => setDemo(d => ({ ...d, faculdade: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ano de formatura</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 2026"
                  value={demo.anoFormatura}
                  onChange={e => setDemo(d => ({ ...d, anoFormatura: e.target.value }))}
                />
              </div>
            </div>
            <button onClick={nextStep} className="mt-6 w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition text-base">
              Começar o teste →
            </button>
          </div>
        )}

        {/* ── STEP 1: Valores (C04a) ── */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Parte 1 de 5 · Valores</p>
              <h2 className="text-2xl font-extrabold text-blue-900">O que é importante para você?</h2>
              <p className="text-gray-500 mt-1 text-sm">Selecione tudo que considera importante na sua carreira médica.</p>
            </div>
            <div className="space-y-3">
              {VALORES.map(v => {
                const checked = !!c04a[v.id]
                return (
                  <button
                    key={v.id}
                    onClick={() => setC04a(prev => ({ ...prev, [v.id]: !prev[v.id] }))}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition font-medium text-sm flex items-center gap-3 ${checked ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    <span className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${checked ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                      {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    {v.enunciado_pt}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={prevStep} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">← Voltar</button>
              <button onClick={nextStep} className="flex-1 bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition">Próximo →</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Comportamentos 0-10 (C04b) ── */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Parte 2 de 5 · Como você é — Bloco {blocoIdx + 1}/{blocos.length}
              </p>
              <h2 className="text-2xl font-extrabold text-blue-900">{BLOCOS[blocos[blocoIdx]]}</h2>
              <p className="text-gray-500 mt-1 text-sm">Para cada afirmação, indique o quanto ela se aplica a você (0 = nada, 10 = totalmente).</p>
            </div>
            <div className="space-y-6">
              {perguntasBloco.map(p => {
                const val = c04b[p.id] ?? 5
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="font-semibold text-gray-800 text-sm mb-4">{p.enunciado_pt}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-10 text-center flex-shrink-0">0</span>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={val}
                        onChange={e => setC04b(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                        className="flex-1 h-2 appearance-none bg-gray-200 rounded-full cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs text-gray-400 w-10 text-center flex-shrink-0">10</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-400">Não me identifico</span>
                      <span className="text-base font-extrabold text-blue-700 tabular-nums">{val}</span>
                      <span className="text-xs text-gray-400">Me identifico totalmente</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={prevStep} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">← Voltar</button>
              <button onClick={nextStep} className="flex-1 bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition">
                {blocoIdx < blocos.length - 1 ? `Próximo bloco (${blocoIdx + 2}/${blocos.length}) →` : 'Próximo →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Jung (23 afirmações MBTI) ── */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Parte 3 de 5 · Temperamento</p>
              <h2 className="text-2xl font-extrabold text-blue-900">Quais afirmações combinam com você?</h2>
              <p className="text-gray-500 mt-1 text-sm">Selecione todas as que descrevem seu jeito de ser e trabalhar.</p>
            </div>
            <div className="space-y-3">
              {JUNG_STATEMENTS.map(s => {
                const selected = jung.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleJung(s.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition font-medium text-sm flex items-center gap-3 ${selected ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    <span className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                      {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    {s.texto}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={prevStep} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">← Voltar</button>
              <button onClick={nextStep} className="flex-1 bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition">Próximo →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Holland — perguntas comportamentais ── */}
        {step === 4 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Parte 4 de 5 · Perfil Holland</p>
              <h2 className="text-2xl font-extrabold text-blue-900">Quais afirmações combinam com você?</h2>
              <p className="text-gray-500 mt-1 text-sm">Selecione todas as que descrevem seu jeito de ser e trabalhar. Usaremos suas respostas para identificar seu perfil automaticamente.</p>
            </div>
            <div className="space-y-3">
              {HOLLAND_QUESTIONS.map(q => {
                const selected = !!hollandRespostas[q.id]
                return (
                  <button
                    key={q.id}
                    onClick={() => toggleHollandResp(q.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition font-medium text-sm flex items-center gap-3 ${selected ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    <span className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                      {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    {q.texto}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={prevStep} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">← Voltar</button>
              <button onClick={nextStep} className="flex-1 bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition">Próximo →</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Interesse direto (C02) ── */}
        {step === 5 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Parte 5 de 5 · Interesse direto</p>
              <h2 className="text-2xl font-extrabold text-blue-900">Já tem algum interesse?</h2>
              <p className="text-gray-500 mt-1 text-sm">Selecione especialidades que você já considera. Opcional — pule se não tiver preferência.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ESPECIALIDADES.map(e => {
                const selected = c02.includes(e.id)
                return (
                  <button
                    key={e.id}
                    onClick={() => toggleC02(e.id)}
                    className={`text-left px-3 py-3 rounded-xl border-2 transition text-xs font-medium ${selected ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    {e.nome}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={prevStep} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">← Voltar</button>
              <button onClick={submit} className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition text-base">
                Ver meu resultado 🎯
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
