'use client'

import { useState } from 'react'
import Link from 'next/link'
import posthog from 'posthog-js'

const SPECS: Record<string, { nome: string; icon: string; salario: string; dur: string; tags: string[] }> = {
  'dermatologia':       { nome: 'Dermatologia',                     icon: '🔬', salario: 'R$ 15k–60k+', dur: '3 anos',          tags: ['Qualidade de vida', 'Alta renda', 'Consultório próprio'] },
  'psiquiatria':        { nome: 'Psiquiatria',                      icon: '🧠', salario: 'R$ 12k–35k',  dur: '3 anos',          tags: ['+246% crescimento', 'Alta demanda', 'Vínculo com paciente'] },
  'ortopedia':          { nome: 'Ortopedia',                        icon: '🦴', salario: 'R$ 15k–50k',  dur: '3 anos',          tags: ['Cirurgia', 'Alta renda', 'Técnica manual'] },
  'ginecologia':        { nome: 'Ginecologia e Obstetrícia',        icon: '🌸', salario: 'R$ 12k–40k',  dur: '3 anos',          tags: ['Alta demanda', 'SUS e privado'] },
  'oftalmologia':       { nome: 'Oftalmologia',                     icon: '👁',  salario: 'R$ 15k–60k+', dur: '3 anos',          tags: ['Qualidade de vida', 'Alta renda', 'Tecnologia'] },
  'cardiologia':        { nome: 'Cardiologia',                      icon: '❤️', salario: 'R$ 15k–55k',  dur: '4 anos',          tags: ['Alto prestígio', 'Procedimentos', 'Alta demanda'] },
  'neurologia':         { nome: 'Neurologia',                       icon: '🧬', salario: 'R$ 12k–40k',  dur: '4 anos',          tags: ['Desafio intelectual', 'Crescimento'] },
  'pediatria':          { nome: 'Pediatria',                        icon: '👶', salario: 'R$ 8k–25k',   dur: '2 anos',          tags: ['Vocação', 'SUS', 'Vínculo familiar'] },
  'clinica-medica':     { nome: 'Clínica Médica',                   icon: '🩺', salario: 'R$ 8k–25k',   dur: '2 anos',          tags: ['Base sólida', 'Hospitalista'] },
  'endocrinologia':     { nome: 'Endocrinologia',                   icon: '⚗️', salario: 'R$ 10k–30k',  dur: '4 anos',          tags: ['Qualidade de vida', 'Epidemia diabetes'] },
  'radiologia':         { nome: 'Radiologia',                       icon: '📡', salario: 'R$ 18k–70k+', dur: '3 anos',          tags: ['Trabalho remoto', 'Alta renda', 'IA'] },
  'anestesiologia':     { nome: 'Anestesiologia',                   icon: '💉', salario: 'R$ 18k–60k+', dur: '3 anos',          tags: ['Alta renda', 'Sem consultório'] },
  'otorrinolaringologia': { nome: 'Otorrinolaringologia',           icon: '👂', salario: 'R$ 15k–50k',  dur: '3 anos',          tags: ['Cirurgia', 'Estética', 'Qualidade de vida'] },
  'urologia':           { nome: 'Urologia',                         icon: '🫁', salario: 'R$ 15k–50k',  dur: '3 anos',          tags: ['Cirurgia robótica', 'Crescimento'] },
  'gastroenterologia':  { nome: 'Gastroenterologia',                icon: '🫃', salario: 'R$ 12k–35k',  dur: '4 anos',          tags: ['Endoscopia', 'Alta prevalência'] },
  'medicina-familia':   { nome: 'Medicina de Família e Comunidade', icon: '🏡', salario: 'R$ 8k–20k',   dur: '2 anos',          tags: ['+163% crescimento', 'Fácil entrada', 'SUS'] },
  'cirurgia-geral':     { nome: 'Cirurgia Geral',                   icon: '🔧', salario: 'R$ 12k–40k',  dur: '2 anos',          tags: ['Base cirúrgica', 'Bariátrica'] },
  'geriatria':          { nome: 'Geriatria',                        icon: '👴', salario: 'R$ 10k–28k',  dur: '3 anos',          tags: ['+113% crescimento', 'Déficit enorme'] },
  'reumatologia':       { nome: 'Reumatologia',                     icon: '🦾', salario: 'R$ 10k–28k',  dur: '4 anos',          tags: ['Consultório', 'Autoimune'] },
  'medicina-do-trabalho': { nome: 'Medicina do Trabalho',           icon: '⚙️', salario: 'R$ 10k–25k',  dur: '1 ano',           tags: ['Zero plantão', 'Horário comercial'] },
  'medicina-intensiva': { nome: 'Medicina Intensiva (UTI)',          icon: '🏥', salario: 'R$ 15k–50k',  dur: '3 anos',          tags: ['Alta renda', 'UTI'] },
}

const QUESTIONS = [
  {
    id: 'q1', tag: 'Estilo de vida',
    text: 'Como você imagina sua rotina ideal como médico?',
    sub: 'Pense no dia a dia, não no momento mais glamouroso da carreira.',
    options: [
      { icon: '📅', label: 'Horário comercial, sem plantão', desc: 'Previsibilidade acima de tudo.',
        scores: { dermatologia: 3, radiologia: 3, 'medicina-do-trabalho': 5, 'medicina-familia': 3, endocrinologia: 3, reumatologia: 3, oftalmologia: 3 } },
      { icon: '⚡', label: 'Plantões intensos com dias livres', desc: 'Trabalhar forte em blocos e ter folgas maiores.',
        scores: { anestesiologia: 4, 'medicina-intensiva': 5, 'cirurgia-geral': 3, pediatria: 2 } },
      { icon: '🏥', label: 'Rotina hospitalar com variedade', desc: 'Ambulatório, enfermaria, urgência — gosto de tudo.',
        scores: { 'clinica-medica': 4, neurologia: 3, geriatria: 3, gastroenterologia: 3, cardiologia: 2 } },
      { icon: '🏃', label: 'Cirurgias e procedimentos técnicos', desc: 'Sala cirúrgica, instrumentos nas mãos.',
        scores: { ortopedia: 4, 'cirurgia-geral': 4, urologia: 4, anestesiologia: 3, oftalmologia: 3, otorrinolaringologia: 3 } },
    ],
  },
  {
    id: 'q2', tag: 'Relação com paciente',
    text: 'Como você quer se relacionar com seus pacientes?',
    sub: 'Não existe certo ou errado — é sobre o que te energiza.',
    options: [
      { icon: '🔗', label: 'Vínculo de longo prazo', desc: 'Acompanhar a mesma pessoa por anos.',
        scores: { endocrinologia: 4, 'medicina-familia': 5, geriatria: 4, pediatria: 4, psiquiatria: 3, reumatologia: 3 } },
      { icon: '⚡', label: 'Encontros pontuais e resolutivos', desc: 'Resolver o problema e seguir em frente.',
        scores: { radiologia: 5, anestesiologia: 4, 'medicina-intensiva': 3, 'cirurgia-geral': 3 } },
      { icon: '🎯', label: 'Foco no problema técnico', desc: 'Prefiro resolver; o vínculo é secundário.',
        scores: { radiologia: 4, anestesiologia: 3, ortopedia: 3 } },
      { icon: '💬', label: 'Consultas aprofundadas', desc: 'Escutar muito, investigar, tratar a pessoa como um todo.',
        scores: { psiquiatria: 5, neurologia: 3, 'clinica-medica': 4, gastroenterologia: 3, cardiologia: 3 } },
    ],
  },
  {
    id: 'q3', tag: 'Perfil técnico',
    text: 'Onde você se sente mais competente e motivado?',
    sub: 'Pense nas estações do internato que mais gostou.',
    options: [
      { icon: '🔬', label: 'Diagnóstico clínico e raciocínio', desc: 'Investigar, montar o quebra-cabeça diagnóstico.',
        scores: { 'clinica-medica': 4, neurologia: 4, psiquiatria: 3, endocrinologia: 3, reumatologia: 4, cardiologia: 3 } },
      { icon: '🔪', label: 'Habilidade manual e cirurgia', desc: 'Precisão, instrumentos — a cirurgia me atrai.',
        scores: { ortopedia: 5, 'cirurgia-geral': 4, urologia: 4, otorrinolaringologia: 3, oftalmologia: 4 } },
      { icon: '💊', label: 'Manejo medicamentoso e crônico', desc: 'Acompanhar e ajustar tratamentos ao longo do tempo.',
        scores: { endocrinologia: 4, psiquiatria: 4, geriatria: 4, reumatologia: 3, 'clinica-medica': 3 } },
      { icon: '📊', label: 'Tecnologia, imagem e dados', desc: 'Laudo, imagem — prefiro a parte analítica.',
        scores: { radiologia: 5, 'medicina-do-trabalho': 2, cardiologia: 3 } },
    ],
  },
  {
    id: 'q4', tag: 'Prioridades', multi: true, max: 2,
    text: 'O que pesa mais na sua decisão de especialidade?',
    sub: 'Seja honesto — não existe resposta errada. Escolha até 2.',
    options: [
      { icon: '💰', label: 'Remuneração alta', desc: 'Quero garantir renda acima da média.',
        scores: { dermatologia: 4, radiologia: 4, anestesiologia: 4, urologia: 3, ortopedia: 3, oftalmologia: 3, 'medicina-intensiva': 3 } },
      { icon: '🌿', label: 'Qualidade de vida', desc: 'Menos plantões, mais controle do meu tempo.',
        scores: { dermatologia: 4, radiologia: 4, 'medicina-do-trabalho': 5, endocrinologia: 3, reumatologia: 3, oftalmologia: 3, 'medicina-familia': 3 } },
      { icon: '🧠', label: 'Desafio intelectual', desc: 'Quero casos complexos, diagnósticos difíceis.',
        scores: { neurologia: 4, psiquiatria: 3, 'clinica-medica': 4, cardiologia: 3, reumatologia: 3, gastroenterologia: 3 } },
      { icon: '🎯', label: 'Impacto social', desc: 'Quero fazer diferença em muitas vidas.',
        scores: { 'medicina-familia': 5, pediatria: 4, psiquiatria: 3, geriatria: 3, 'clinica-medica': 3 } },
      { icon: '🔬', label: 'Inovação e tecnologia', desc: 'Quero estar na fronteira — IA, robótica, biológicos.',
        scores: { radiologia: 4, cardiologia: 3, urologia: 2, reumatologia: 2 } },
      { icon: '🏆', label: 'Prestígio e reconhecimento', desc: 'Importa ser referência na minha área.',
        scores: { dermatologia: 3, cardiologia: 3, neurologia: 3, ortopedia: 2 } },
    ],
  },
  {
    id: 'q5', tag: 'Pressão',
    text: 'Como você lida com situações de alta pressão e urgência?',
    sub: 'Pense nos plantões do internato — o que sentiu.',
    options: [
      { icon: '🔥', label: 'Adoro — a adrenalina me energiza', desc: 'Urgência me deixa focado e no meu melhor.',
        scores: { 'medicina-intensiva': 5, anestesiologia: 4, 'cirurgia-geral': 3, ortopedia: 3, cardiologia: 3 } },
      { icon: '✅', label: 'Lido bem, mas prefiro evitar', desc: 'Consigo, mas prefiro rotina mais previsível.',
        scores: { dermatologia: 3, endocrinologia: 3, radiologia: 3, oftalmologia: 3, 'medicina-do-trabalho': 3 } },
      { icon: '😰', label: 'Me estressa muito', desc: 'Prefiro especialidades tranquilas e programadas.',
        scores: { radiologia: 4, 'medicina-do-trabalho': 5, 'medicina-familia': 3, reumatologia: 3, endocrinologia: 3 } },
      { icon: '🧠', label: 'Pressão intelectual sim, física não', desc: 'Casos complexos ok; correria e plantão pesado não.',
        scores: { neurologia: 4, psiquiatria: 3, reumatologia: 3, gastroenterologia: 3, 'clinica-medica': 3 } },
    ],
  },
  {
    id: 'q6', tag: 'Ambiente',
    text: 'Onde você se imagina trabalhando principalmente?',
    sub: 'Não precisa ser só um — mas qual pesa mais?',
    options: [
      { icon: '🏥', label: 'Hospital público (SUS)', desc: 'Impacto em escala, diversidade de casos.',
        scores: { 'medicina-familia': 4, 'clinica-medica': 3, pediatria: 3, geriatria: 3, psiquiatria: 3, neurologia: 3 } },
      { icon: '🏢', label: 'Consultório / clínica privada', desc: 'Autonomia, agenda própria, pacientes pagantes.',
        scores: { dermatologia: 5, endocrinologia: 4, oftalmologia: 4, reumatologia: 3, 'medicina-do-trabalho': 3, otorrinolaringologia: 3 } },
      { icon: '💻', label: 'Remoto / telerradiologia', desc: 'Trabalhar de casa ou de qualquer lugar.',
        scores: { radiologia: 6, 'medicina-do-trabalho': 3 } },
      { icon: '⚙️', label: 'Centro cirúrgico / sala de procedimentos', desc: 'Ambiente de alta tecnologia, time cirúrgico.',
        scores: { ortopedia: 4, anestesiologia: 4, urologia: 4, 'cirurgia-geral': 4, oftalmologia: 3, otorrinolaringologia: 3 } },
    ],
  },
  {
    id: 'q7', tag: 'Emocional',
    text: 'Como você se sente diante da morte e do sofrimento dos pacientes?',
    sub: 'Seja honesto — essa resposta não tem impacto negativo.',
    options: [
      { icon: '🛡', label: 'Consigo separar bem profissional e emocional', desc: 'Aprendi a criar distância saudável.',
        scores: { radiologia: 3, anestesiologia: 3, 'medicina-intensiva': 3, 'cirurgia-geral': 2 } },
      { icon: '💙', label: 'Sinto, mas uso como motivação', desc: 'A dor do paciente me move — quero fazer mais.',
        scores: { psiquiatria: 3, 'medicina-familia': 4, geriatria: 3, pediatria: 3 } },
      { icon: '😔', label: 'Me afeta muito — prefiro evitar esse contato', desc: 'Prefiro desfechos mais controláveis.',
        scores: { dermatologia: 4, radiologia: 4, 'medicina-do-trabalho': 4, endocrinologia: 3, oftalmologia: 3 } },
      { icon: '🎯', label: 'Prefiro casos onde posso resolver o problema', desc: 'Gosto quando há solução clara — cirurgia, diagnóstico fechado.',
        scores: { ortopedia: 4, anestesiologia: 3, urologia: 3, 'cirurgia-geral': 3 } },
    ],
  },
  {
    id: 'q8', tag: 'Perfil acadêmico',
    text: 'Como foi sua trajetória até aqui?',
    sub: 'Isso nos ajuda a calibrar a realidade da concorrência.',
    options: [
      { icon: '🥇', label: 'Top da minha turma, currículo forte', desc: 'Sempre muito dedicado, tenho diferenciais acadêmicos.',
        scores: { dermatologia: 4, neurologia: 3, cardiologia: 3, radiologia: 3, urologia: 3, otorrinolaringologia: 3 } },
      { icon: '📖', label: 'Bom desempenho, consistente', desc: 'Não fui o número 1, mas sempre me saí bem.',
        scores: { endocrinologia: 3, gastroenterologia: 3, 'clinica-medica': 3, psiquiatria: 3, ginecologia: 3, pediatria: 3 } },
      { icon: '🏃', label: 'Mediano — preciso me preparar mais', desc: 'Sei que preciso evoluir no estudo para residência.',
        scores: { 'medicina-familia': 4, 'medicina-do-trabalho': 4, 'clinica-medica': 3, pediatria: 3, geriatria: 3 } },
      { icon: '🔄', label: 'Já me formei e estou reorientando', desc: 'Tenho experiência clínica e estou repensando meu caminho.',
        scores: { psiquiatria: 3, 'medicina-familia': 4, 'medicina-do-trabalho': 3, geriatria: 3, 'clinica-medica': 3 } },
    ],
  },
  {
    id: 'q9', tag: 'Visão financeira',
    text: 'Qual é sua relação com dinheiro e carreira?',
    sub: 'Sem julgamento — é uma variável real na escolha.',
    options: [
      { icon: '🎯', label: 'Quero maximizar minha renda no longo prazo', desc: 'Disposto a investir anos de preparação para ganhar muito.',
        scores: { dermatologia: 5, radiologia: 4, anestesiologia: 4, ortopedia: 3, urologia: 3, oftalmologia: 3 } },
      { icon: '⚖️', label: 'Equilíbrio entre renda e vida pessoal', desc: 'Renda boa, sem abrir mão da minha vida fora do trabalho.',
        scores: { endocrinologia: 4, gastroenterologia: 3, cardiologia: 3, dermatologia: 3, ginecologia: 3 } },
      { icon: '🌱', label: 'Renda suficiente já me basta', desc: 'Prefiro fazer o que amo mesmo que ganhe menos.',
        scores: { 'medicina-familia': 4, pediatria: 4, psiquiatria: 3, geriatria: 3 } },
      { icon: '🚀', label: 'Quero empreender — consultório, clínica', desc: 'Penso em ter meu negócio, não só ser assalariado.',
        scores: { dermatologia: 4, oftalmologia: 3, otorrinolaringologia: 3, endocrinologia: 3, radiologia: 3 } },
    ],
  },
  {
    id: 'q10', tag: 'Momento de vida',
    text: 'Qual frase descreve melhor onde você está agora?',
    sub: 'Isso calibra nossa recomendação final.',
    options: [
      { icon: '🎓', label: '"Vou terminar a faculdade e quero logo entrar na residência"', desc: 'Determinado, já tenho direção.',
        scores: { dermatologia: 2, radiologia: 2, psiquiatria: 2, 'medicina-familia': 3, 'clinica-medica': 2 } },
      { icon: '🔍', label: '"Estou em dúvida entre algumas especialidades"', desc: 'Tenho interesse em mais de uma área.',
        scores: { endocrinologia: 2, neurologia: 2, cardiologia: 2, gastroenterologia: 2 } },
      { icon: '🔄', label: '"Já estou na residência mas quero confirmar ou mudar"', desc: 'Comecei a residência, mas não estou 100% seguro.',
        scores: { psiquiatria: 3, 'medicina-familia': 3, 'medicina-do-trabalho': 3, geriatria: 2 } },
      { icon: '⏳', label: '"Já me formei, trabalhei, e agora quero me especializar"', desc: 'Tenho experiência prática e quero uma especialidade.',
        scores: { 'medicina-familia': 4, 'medicina-do-trabalho': 4, psiquiatria: 3, geriatria: 3, 'clinica-medica': 3 } },
    ],
  },
]

type Scores = Record<string, number>

function calcDims(scores: Scores) {
  const keys = Object.keys(SPECS)
  const get = (...ks: string[]) => ks.reduce((s, k) => s + (scores[k] || 0), 0) / ks.length
  const qv  = get('dermatologia', 'medicina-do-trabalho', 'radiologia', 'oftalmologia')
  const cir = get('ortopedia', 'cirurgia-geral', 'anestesiologia', 'urologia')
  const int = get('neurologia', 'clinica-medica', 'reumatologia', 'psiquiatria')
  const ren = get('radiologia', 'dermatologia', 'anestesiologia', 'ortopedia')
  const soc = get('medicina-familia', 'psiquiatria', 'pediatria', 'geriatria')
  const mx  = Math.max(qv, cir, int, ren, soc) * 1.1 || 1
  const n   = (v: number) => Math.min(98, Math.max(12, Math.round((v / mx) * 100)))
  return [
    { l: 'Qualidade de vida',    v: n(qv) },
    { l: 'Perfil cirúrgico',     v: n(cir) },
    { l: 'Raciocínio clínico',   v: n(int) },
    { l: 'Foco em remuneração',  v: n(ren) },
    { l: 'Impacto social',       v: n(soc) },
  ]
}

export default function QuizRapido() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'email' | 'result'>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [scores, setScores] = useState<Scores>(() => Object.fromEntries(Object.keys(SPECS).map(k => [k, 0])))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const q = QUESTIONS[current]
  const sel = answers[q?.id] || []
  const isMulti = !!(q as any)?.multi
  const pct = Math.round(((current + 1) / QUESTIONS.length) * 100)

  function selectOpt(i: number) {
    const id = q.id
    if (isMulti) {
      const max = (q as any).max || 2
      const cur = answers[id] || []
      const idx = cur.indexOf(i)
      if (idx >= 0) setAnswers({ ...answers, [id]: cur.filter(x => x !== i) })
      else if (cur.length < max) setAnswers({ ...answers, [id]: [...cur, i] })
    } else {
      setAnswers({ ...answers, [id]: [i] })
    }
  }

  function applyScores(qIdx: number) {
    const question = QUESTIONS[qIdx]
    const sel = answers[question.id] || []
    const newScores = { ...scores }
    sel.forEach(i => {
      const sc = (question.options[i] as any).scores || {}
      Object.entries(sc).forEach(([k, v]) => { if (newScores[k] !== undefined) newScores[k] += v as number })
    })
    setScores(newScores)
    return newScores
  }

  function goNext() {
    applyScores(current)
    if (current < QUESTIONS.length - 1) setCurrent(c => c + 1)
    else setStep('email')
  }

  function goBack() {
    if (current === 0) { setStep('intro'); return }
    setCurrent(c => c - 1)
  }

  const top3 = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, sc]) => {
      const max = Object.values(scores).reduce((a, b) => Math.max(a, b), 1)
      return { id, spec: SPECS[id], pct: Math.min(99, Math.round((sc / (max * 1.05)) * 100)) }
    })

  function showResult() {
    posthog.capture('quiz_completo', { tipo: 'rapido' })
    posthog.capture('resultado_visualizado', { tipo: 'rapido', especialidade_top1: top3[0]?.spec?.nome })
    setStep('result')
  }

  const dims = calcDims(scores)

  /* ---- INTRO ---- */
  if (step === 'intro') return (
    <div style={shell}>
      <div style={card}>
        <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1e3a5f', marginBottom: 10, lineHeight: 1.25 }}>
            Qual especialidade médica combina com você?
          </h1>
          <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, marginBottom: 22, maxWidth: 420, margin: '0 auto 22px' }}>
            Responda 10 perguntas sobre seu perfil, valores e estilo de vida. Receba um resultado personalizado com as especialidades que mais combinam com você.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[['⏱', '~4 minutos'], ['📊', '20 especialidades'], ['🎁', '100% gratuito']].map(([fi, fp], i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>{fi}</div>
                <p style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 500, margin: 0 }}>{fp}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { posthog.capture('quiz_iniciado', { tipo: 'rapido' }); setStep('quiz') }} style={btnPrimary}>Começar o quiz →</button>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>+3.200 médicos já descobriram sua especialidade ideal</p>
        </div>
      </div>
    </div>
  )

  /* ---- QUIZ ---- */
  if (step === 'quiz') return (
    <div style={shell}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>
          <span>Pergunta {current + 1} de {QUESTIONS.length}</span>
          <span style={{ fontWeight: 700, color: '#1e3a5f' }}>{pct}%</span>
        </div>
        <div style={{ background: '#e5e7eb', borderRadius: 99, height: 6 }}>
          <div style={{ width: `${pct}%`, height: 6, borderRadius: 99, background: 'linear-gradient(90deg, #1e3a5f, #3b82f6)', transition: 'width .4s ease' }} />
        </div>
      </div>
      <div style={card}>
        <span style={{ display: 'inline-block', background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {q.tag}
        </span>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111', lineHeight: 1.35, marginBottom: 6 }}>{q.text}</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18, lineHeight: 1.5 }}>{q.sub}</p>
        {isMulti && <p style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 10 }}>☑ Escolha até {(q as any).max} opções</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {q.options.map((o, i) => {
            const isSel = sel.includes(i)
            return (
              <div key={i} onClick={() => selectOpt(i)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 13, padding: '13px 15px',
                border: `2px solid ${isSel ? '#1e3a5f' : '#e5e7eb'}`,
                borderRadius: 11, cursor: 'pointer', background: isSel ? '#eff6ff' : 'white', transition: 'all .15s',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: isSel ? '#1e3a5f' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, transition: 'all .15s' }}>
                  {o.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#111', marginBottom: 3 }}>{o.label}</h4>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.45, margin: 0 }}>{o.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={goBack} style={btnBack}>{current === 0 ? 'Início' : 'Voltar'}</button>
          <button onClick={goNext} disabled={sel.length === 0} style={{ ...btnPrimary, flex: 2, opacity: sel.length === 0 ? 0.4 : 1, cursor: sel.length === 0 ? 'default' : 'pointer' }}>
            {current === QUESTIONS.length - 1 ? 'Ver resultado →' : 'Próxima →'}
          </button>
        </div>
      </div>
    </div>
  )

  /* ---- EMAIL ---- */
  if (step === 'email') return (
    <div style={shell}>
      <div style={card}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>🎉</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Seu resultado está pronto!</h2>
        <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 20, lineHeight: 1.55 }}>
          Informe seu e-mail para receber o resultado detalhado e um guia personalizado.
        </p>
        <input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)}
          style={inputStyle} />
        <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
          style={{ ...inputStyle, marginTop: 10 }} />
        <button onClick={showResult} style={{ ...btnPrimary, width: '100%', marginTop: 14 }}>
          Ver meu resultado →
        </button>
        <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>🔒 Sem spam. Cancele quando quiser.</p>
      </div>
    </div>
  )

  /* ---- RESULT ---- */
  return (
    <div style={shell}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f', marginBottom: 6 }}>Sua especialidade ideal é…</h2>
        <p style={{ fontSize: 13.5, color: '#6b7280' }}>Com base nas suas 10 respostas, calculamos compatibilidade com 20 especialidades.</p>
      </div>

      {/* Top 3 */}
      {top3.map((item, rank) => (
        <div key={item.id} style={{
          borderRadius: 14, padding: '18px 20px', marginBottom: 10,
          background: rank === 0 ? 'linear-gradient(135deg, #1e3a5f, #2d6a9f)' : 'white',
          border: rank === 0 ? 'none' : '1px solid #e5e7eb',
          color: rank === 0 ? 'white' : '#111',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 26 }}>{item.spec.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                {['🥇 Melhor match', '🥈 2º lugar', '🥉 3º lugar'][rank]}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>{item.spec.nome}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: rank === 0 ? '#7dd3fc' : '#1e3a5f' }}>{item.pct}%</div>
          </div>
          <div style={{ background: rank === 0 ? 'rgba(255,255,255,.2)' : '#f3f4f6', borderRadius: 99, height: 6, marginBottom: 10 }}>
            <div style={{ width: `${item.pct}%`, height: 6, borderRadius: 99, background: rank === 0 ? '#7dd3fc' : '#1e3a5f', transition: 'width .8s ease' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {item.spec.tags.map((t, i) => (
              <span key={i} style={{
                fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                background: rank === 0 ? 'rgba(255,255,255,.15)' : '#eff6ff',
                color: rank === 0 ? 'white' : '#1d4ed8',
              }}>{t}</span>
            ))}
          </div>
          {rank === 0 && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
              <strong>{item.spec.salario}</strong> · Residência: {item.spec.dur}
            </div>
          )}
        </div>
      ))}

      {/* Perfil */}
      <div style={{ ...card, marginTop: 12, background: '#f8fafc' }}>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#2d6a9f', marginBottom: 12 }}>
          Seu perfil médico
        </p>
        {dims.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 130, fontSize: 12, color: '#374151', fontWeight: 500, flexShrink: 0 }}>{d.l}</span>
            <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 99, height: 5 }}>
              <div style={{ width: `${d.v}%`, height: 5, borderRadius: 99, background: '#1e3a5f', transition: 'width 1s ease' }} />
            </div>
            <span style={{ width: 32, fontSize: 11, fontWeight: 700, color: '#1e3a5f', textAlign: 'right' }}>{d.v}%</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        <Link href={`/guias/${top3[0]?.id}`} style={{ textDecoration: 'none' }}>
          <button style={{ ...btnPrimary, width: '100%' }}>
            📖 Ver guia completo de {top3[0]?.spec.nome} →
          </button>
        </Link>
        <Link href="/guias" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', background: 'white', color: '#1e3a5f', fontSize: 14, fontWeight: 600, padding: '13px', borderRadius: 10, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            Ver todas as especialidades
          </button>
        </Link>
      </div>
      <p onClick={() => { setStep('intro'); setCurrent(0); setAnswers({}); setScores(Object.fromEntries(Object.keys(SPECS).map(k => [k, 0]))) }}
        style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 14, cursor: 'pointer' }}>
        ↺ Refazer o quiz
      </p>
    </div>
  )
}

const shell: React.CSSProperties = { maxWidth: 600, margin: '0 auto', padding: '20px 16px 48px' }
const card: React.CSSProperties = { background: 'white', borderRadius: 16, padding: '26px 22px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }
const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg,#1e3a5f,#2d6a9f)', color: 'white', fontSize: 14, fontWeight: 700, padding: '13px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', flex: 2 }
const btnBack: React.CSSProperties = { flex: 1, background: '#f3f4f6', color: '#374151', fontSize: 14, fontWeight: 600, padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', display: 'block', boxSizing: 'border-box' as const }
