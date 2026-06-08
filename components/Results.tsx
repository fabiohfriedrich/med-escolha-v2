'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MatchResult } from '@/lib/scoring'
import descriptionsData from '@/data/descriptions.json'
import c04bData from '@/data/c04b_perguntas.json'

const DESCRIPTIONS = (descriptionsData as any).specialties as Array<{
  id: number; nome: string; descricao: string; rotina_tipica: string
}>
const C04B_QUESTIONS = (c04bData as any).questions as Array<{
  id: string; enunciado_pt: string; scores: Record<string, number>
}>

// ── Jung ──────────────────────────────────────────────────────────────────────
const JUNG_MAP = {
  EI: { E: ['temp-15','temp-16'], I: ['temp-01','temp-02','temp-17'] },
  TF: { T: ['temp-03','temp-07','temp-08','temp-19'], F: ['temp-04','temp-05','temp-18','temp-20'] },
  SN: { S: ['temp-10','temp-11','temp-23'], N: ['temp-09','temp-12','temp-13','temp-21','temp-22','temp-24','temp-25'] },
}
const JUNG_LABELS: Record<string, string> = {
  E:'Extroversão', I:'Introversão', T:'Pensamento', F:'Sentimento', S:'Sensação', N:'Intuição'
}
const JUNG_TEXTS: Record<string, string> = {
  I: 'O introvertido é guiado pelos fatores subjetivos, dirige a sua atenção para o seu mundo interior. Geralmente é introspectivo e aprecia mais a companhia de livros do que das pessoas. Caracteriza-se por uma certa hesitação diante da ação necessária, tende à reflexão. Normalmente é controlado e retraído, exceto quando em companhia de pessoas íntimas. Está mais voltado para atividades solitárias e que se processam em seu interior.',
  E: 'O extrovertido é voltado para o mundo exterior, orienta-se pelo objeto e pelo que é objetivamente dado. É expansivo, comunicativo e de fácil relacionamento. Tende a agir primeiro e pensar depois. Recarrega suas energias em contato com pessoas e em situações sociais. É animado, prático e orientado para a ação.',
  F: 'Toma decisões com base em seus próprios valores pessoais ou de outras pessoas, mesmo que estas decisões não tenham lógica e objetividade. Sempre vai levar em conta o que sente em relação a algo como, também, os sentimentos dos outros. Voltado para as relações pessoais, mostra-se receptivo e bom para lidar com pessoas.',
  T: 'Toma decisões baseadas na lógica e na análise objetiva. É consistente e justo, pois aplica os mesmos padrões a todos. Prefere clareza e busca a verdade acima da harmonia. Tende a ser crítico e analítico. É orientado a tarefas e à resolução de problemas de forma sistemática.',
  S: 'Confia em seus órgãos dos sentidos para compreender objetivamente uma situação. Está mais interessado no aqui e agora, no dado imediato e real. Prefere trabalhar com dados reais e objetivos, sendo assim, prático e realista. Tem facilidade para lidar com objetos e máquinas que exijam precisão e cuidados.',
  N: 'Confia principalmente em sua imaginação para criar novas possibilidades. Está mais interessado em padrões, significados e possibilidades do que nos fatos do momento. Orientado para o futuro, gosta de inovação, de explorar novas ideias e de trabalhar com conceitos abstratos.',
}

// ── Holland ───────────────────────────────────────────────────────────────────
const HOLLAND_INFO: Record<string, { emoji: string; desc: string }> = {
  Realista:      { emoji: '⚙️', desc: 'Gosta de trabalhar com as mãos, com equipamentos, máquinas e outros objetos concretos.' },
  Investigativo: { emoji: '🔬', desc: 'Gosta de ler, pensar e investigar as causas e soluções dos problemas.' },
  Artístico:     { emoji: '🎨', desc: 'Apresenta crenças não convencionais, relativiza pontos de vista e se interessa por aspectos estéticos.' },
  Social:        { emoji: '🤝', desc: 'Gosta de interação, de ensinar e/ou de ajudar a resolver os problemas dos outros.' },
  Empreendedor:  { emoji: '🏆', desc: 'Gosta de posições de liderança, de competição e de influenciar os outros.' },
  Convencional:  { emoji: '📋', desc: 'Valoriza normas e regras, no sentido de manutenção da rotina.' },
}

// ── Pré-requisitos ────────────────────────────────────────────────────────────
const PRE_REQ: Record<number, string> = {
  1:'acesso direto',2:'acesso direto',3:'acesso direto',4:'cirurgia geral',5:'clínica médica',
  6:'cirurgia geral',7:'cirurgia geral',8:'cirurgia geral',9:'cirurgia geral',10:'acesso direto',
  11:'cirurgia geral',12:'cirurgia geral',13:'cirurgia geral',14:'cirurgia geral',15:'cirurgia geral',
  16:'acesso direto',17:'cirurgia geral',18:'acesso direto',19:'clínica médica',20:'clínica médica',
  21:'clínica médica',22:'clínica médica',23:'clínica médica',24:'acesso direto',25:'clínica médica',
  26:'acesso direto',27:'clínica médica',28:'cirurgia geral',29:'acesso direto',30:'acesso direto',
  31:'acesso direto',32:'acesso direto',33:'acesso direto',34:'acesso direto',35:'clínica médica',
  36:'acesso direto',37:'acesso direto',38:'acesso direto',39:'clínica médica',40:'acesso direto',
  41:'clínica médica',42:'clínica médica',43:'acesso direto',44:'clínica médica',45:'acesso direto',
  46:'acesso direto',47:'acesso direto',48:'acesso direto',49:'acesso direto',50:'clínica médica',
  51:'acesso direto',52:'acesso direto',53:'acesso direto',54:'clínica médica',55:'clínica médica',
}

// ── Holland → specialty affinity ──────────────────────────────────────────────
const HOLLAND_SPEC: Record<string, number[]> = {
  Realista: [3,7,9,10,14,15,33,34,45],
  Investigativo: [2,19,22,25,27,41,44,47,50,54],
  Artístico: [1,13,18,33,46],
  Social: [23,24,30,34,42,49,51],
  Empreendedor: [5,11,13,18,40,43,55],
  Convencional: [31,32,36,37,47,48,52],
}
const JUNG_SPEC: Record<string, number[]> = {
  I:[22,27,37,47,48,52,54], E:[10,16,29,30,35,49],
  F:[23,24,30,42,44,49,51], T:[5,19,22,25,27,41,50,54],
  N:[19,22,27,38,41,44],    S:[3,6,7,13,15,43,45],
}
const HOLLAND_CONTEXT: Record<string, string> = {
  Realista: 'atividades práticas e procedurais com destreza manual',
  Investigativo: 'raciocínio diagnóstico complexo e resolução de problemas intelectuais',
  Artístico: 'criatividade, originalidade e abordagens não convencionais',
  Social: 'relações humanas, empatia e cuidado longitudinal com pacientes',
  Empreendedor: 'liderança, tomada de decisão e resultados de alto impacto',
  Convencional: 'organização, protocolos estruturados e ambientes controlados',
}

function resolveAxis(sel: string[], a: string[], b: string[]) {
  return sel.filter(s => a.includes(s)).length >= sel.filter(s => b.includes(s)).length ? 'A' : 'B'
}

function gerarNarrativa(specId: number, specNome: string, holland: string[], jungDom: { EI: string; TF: string; SN: string }, topTraits: string[]) {
  const matchH = holland.filter(h => (HOLLAND_SPEC[h] || []).includes(specId))
  const jAll = [jungDom.EI, jungDom.TF, jungDom.SN]
  const matchJ = jAll.filter(j => (JUNG_SPEC[j] || []).includes(specId))
  let text = `Sua compatibilidade com ${specNome} reflete a convergência entre seu perfil e as exigências desta especialidade. `
  if (matchH.length > 0) {
    text += `Seu perfil ${matchH.join(' e ')} é especialmente alinhado com esta área, que valoriza ${HOLLAND_CONTEXT[matchH[0]] || matchH[0]}. `
  }
  if (matchJ.length > 0) {
    text += `Seu temperamento de ${matchJ.map(j => JUNG_LABELS[j]).join(' e ')} também favorece o cotidiano desta especialidade. `
  }
  if (topTraits.length >= 2) {
    text += `Entre as características que mais conectam você a esta área destacam-se: ${topTraits.slice(0, 3).join(', ')}.`
  }
  return text
}

// ── Inline badge styles (evita purge do Tailwind) ────────────────────────────
const SAT_STYLE: Record<string, { bg: string; color: string }> = {
  Baixa: { bg: '#dcfce7', color: '#15803d' },
  Média: { bg: '#fef3c7', color: '#b45309' },
  Alta:  { bg: '#fee2e2', color: '#dc2626' },
}
const CRESC_STYLE: Record<string, { bg: string; color: string }> = {
  Alto:  { bg: '#dcfce7', color: '#15803d' },
  Médio: { bg: '#dbeafe', color: '#1d4ed8' },
  Baixo: { bg: '#f3f4f6', color: '#6b7280' },
}

function Badge({ label, val, sat }: { label: string; val: string; sat?: string }) {
  const s = sat ? (SAT_STYLE[val] || { bg: '#f3f4f6', color: '#374151' }) : (CRESC_STYLE[val] || { bg: '#f3f4f6', color: '#374151' })
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 10 }}>
      {label}: {val}
    </span>
  )
}

interface Props {
  result: MatchResult
  answers?: any
  onRestart: () => void
  hideRestartButton?: boolean
}

export default function Results({ result, answers, onRestart, hideRestartButton }: Props) {
  const [showAll, setShowAll] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [openId, setOpenId] = useState<number | null>(null)

  const { ranking, perfil } = result
  const top3 = ranking.slice(0, 3)
  const displayed = showAll ? ranking : ranking.slice(0, 20)

  const jungSelected: string[] = answers?.jung || perfil.jung || []
  const eiResult = resolveAxis(jungSelected, JUNG_MAP.EI.E, JUNG_MAP.EI.I) === 'A' ? 'E' : 'I'
  const tfResult = resolveAxis(jungSelected, JUNG_MAP.TF.T, JUNG_MAP.TF.F) === 'A' ? 'T' : 'F'
  const snResult = resolveAxis(jungSelected, JUNG_MAP.SN.S, JUNG_MAP.SN.N) === 'A' ? 'S' : 'N'
  const jungDom = { EI: eiResult, TF: tfResult, SN: snResult }

  const hollandList: string[] = answers?.holland || perfil.holland || []
  const c04bAnswers: Record<string, number> = answers?.c04b || {}

  function getCompatItems(specId: number) {
    return C04B_QUESTIONS
      .filter(q => q.scores[String(specId)] === 1 && (c04bAnswers[q.id] || 0) > 0)
      .map(q => ({ label: q.enunciado_pt, score: c04bAnswers[q.id] || 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  async function downloadPDF() {
    setPrinting(true)
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfil, ranking, answers }),
      })
      const html = await res.text()
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
        setTimeout(() => win.print(), 800)
      }
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Med Escolha · por Amo Medicina</p>
          <h1 className="text-3xl font-extrabold mb-1">{perfil.nome}</h1>
          <p className="text-blue-200 text-sm mb-6">{new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}</p>
          <button onClick={downloadPDF} disabled={printing}
            className="inline-flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-blue-900 font-bold px-6 py-3 rounded-xl transition disabled:opacity-60 text-sm">
            {printing ? '⏳ Gerando PDF...' : '📄 Baixar resultado completo em PDF'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* ── 1. SEU MATCH ── */}
        <section>
          <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Seu match</h2>
          <div className="w-10 h-1 bg-teal-400 rounded mb-5" />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6 mb-4">
            <div className="text-5xl">🎯</div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Especialidade #1</p>
              <p className="text-2xl font-extrabold text-blue-900 leading-tight">{ranking[0]?.nome}</p>
              <p className="text-teal-600 font-bold mt-1">{ranking[0]?.pct.toFixed(1)}% de compatibilidade</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top 3 especialidades</p>
            {top3.map((e, i) => (
              <div key={e.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-800">{['🥇','🥈','🥉'][i]} {e.nome}</span>
                  <span className="text-sm font-extrabold text-blue-700">{e.pct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-teal-400 h-2 rounded-full" style={{ width: `${e.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. PERFIL ── */}
        <section>
          <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Perfil</h2>
          <div className="w-10 h-1 bg-teal-400 rounded mb-5" />
          <p className="text-sm text-gray-600 mb-3">Os perfis de personalidade que melhor o definem são:</p>
          <div className="grid gap-3 mb-8">
            {hollandList.slice(0, 3).map(h => {
              const info = HOLLAND_INFO[h] || { emoji: '•', desc: h }
              return (
                <div key={h} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{info.emoji}</span>
                  <div>
                    <p className="font-bold text-blue-900">{h}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{info.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <h3 className="text-xl font-extrabold text-blue-900 mb-1">Temperamento</h3>
          <div className="w-10 h-1 bg-teal-400 rounded mb-4" />
          <p className="text-sm text-gray-600 mb-4">Os temperamentos que melhor o definem são:</p>
          <div className="space-y-4">
            {[
              { label: 'Extroversão × Introversão', result: eiResult },
              { label: 'Pensamento × Sentimento',   result: tfResult },
              { label: 'Sensação × Intuição',        result: snResult },
            ].map(ax => (
              <div key={ax.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-4 pb-5">
                  <p className="text-sm text-gray-500 mb-1">{ax.label}</p>
                  <div className="w-8 h-0.5 bg-teal-400 rounded mb-3" />
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                    style={{ background: '#ccfbf1', color: '#0f766e' }}>
                    {JUNG_LABELS[ax.result]}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{JUNG_TEXTS[ax.result]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. RESULTADOS DETALHADOS ── */}
        <section>
          <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Resultados detalhados</h2>
          <div className="w-10 h-1 bg-teal-400 rounded mb-5" />
          {top3.map((e, i) => {
            const desc = DESCRIPTIONS.find(d => d.id === e.id)
            const compatItems = getCompatItems(e.id)
            const narrativa = gerarNarrativa(e.id, e.nome, hollandList, jungDom, compatItems.slice(0, 3).map(x => x.label))
            const pctEsp = ((e.medicos_ativos / 550000) * 100).toFixed(2)
            const por100k = (e.medicos_ativos / 2150).toFixed(2)
            const isOpen = openId === e.id || (i === 0 && openId === null)
            const sat = SAT_STYLE[e.saturacao] || { bg: '#f3f4f6', color: '#374151' }
            const cresc = CRESC_STYLE[e.crescimento] || { bg: '#f3f4f6', color: '#374151' }

            return (
              <div key={e.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                {/* Header card */}
                <button className="w-full text-left p-5" onClick={() => setOpenId(isOpen ? -1 : e.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{['🥇','🥈','🥉'][i]}</span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-blue-900 text-lg leading-tight">{e.nome}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span style={{ background: sat.bg, color: sat.color, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 10 }}>
                            Saturação {e.saturacao}
                          </span>
                          <span style={{ background: cresc.bg, color: cresc.color, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 10 }}>
                            Crescimento {e.crescimento}
                          </span>
                          <span style={{ background: '#f3f4f6', color: '#374151', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 10 }}>
                            {e.anos_formacao} anos formação
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-2xl font-extrabold" style={{ color: '#0d9488' }}>{e.pct.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">compatibilidade</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                    <div className="h-2 rounded-full" style={{ width: `${e.pct}%`, background: '#2dd4bf' }} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 pt-2 border-t border-gray-100 space-y-5">

                    {/* Stats */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informações</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Especialistas', val: e.medicos_ativos?.toLocaleString('pt-BR') || '—' },
                          { label: '% do total', val: `${pctEsp}%` },
                          { label: 'Por 100k hab.', val: por100k },
                          { label: 'Anos formação', val: `${e.anos_formacao} anos` },
                        ].map(s => (
                          <div key={s.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                            <p style={{ fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>{s.val}</p>
                            <p style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Salário */}
                    {e.salario_min > 0 && (
                      <div style={{ background: '#eff6ff', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 24 }}>💰</span>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Faixa salarial</p>
                          <p style={{ fontSize: 15, fontWeight: 800, color: '#1e3a5f' }}>
                            R$ {e.salario_min.toLocaleString('pt-BR')} – R$ {e.salario_max.toLocaleString('pt-BR')}/mês
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pré-req + Duração */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Pré-requisito', val: PRE_REQ[e.id] || 'acesso direto' },
                        { label: 'Duração da residência', val: `${e.anos_formacao} anos` },
                      ].map(s => (
                        <div key={s.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{s.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Sobre + Dia a dia */}
                    {desc && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sobre a especialidade</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{desc.descricao}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">O dia a dia</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{desc.rotina_tipica}</p>
                        </div>
                      </div>
                    )}

                    {/* Por que combina */}
                    <div style={{ background: '#f0fdf4', borderLeft: '4px solid #2dd4bf', borderRadius: '0 12px 12px 0', padding: '14px 16px' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', marginBottom: 6 }}>Por que combina com você</p>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65 }}>{narrativa}</p>
                    </div>

                    {/* Compatibilidade */}
                    {compatItems.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Compatibilidade — características presentes</p>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                          {compatItems.map(item => {
                            const pct = Math.round((item.score / 10) * 100)
                            return (
                              <div key={item.label}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-700">{item.label}</span>
                                  <span className="text-xs font-bold text-blue-700 ml-2 flex-shrink-0">{pct}%</span>
                                </div>
                                <div className="bg-gray-100 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#2dd4bf' }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-xs text-gray-400 mt-3">* O percentual de match compreende também outros resultados além dos descritos acima.</p>
                      </div>
                    )}

                    {/* Link para página completa na biblioteca */}
                    <div className="pt-2 border-t border-gray-100">
                      <Link href={`/especialidades/${e.id}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 transition">
                        📖 Ver página completa de {e.nome} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {/* ── 4. RANKING GERAL ── */}
        <section>
          <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Resultados gerais</h2>
          <div className="w-10 h-1 bg-teal-400 rounded mb-2" />
          <p className="text-sm text-gray-500 mb-4">Confira o ranking completo das {ranking.length} especialidades</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Cabeçalho */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200"
              style={{ background: '#0D2150' }}>
              <span className="w-7 text-center flex-shrink-0 text-xs font-bold" style={{ color: '#94a3b8' }}>#</span>
              <div className="flex-1 min-w-0 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Especialidade</div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider w-24 text-center" style={{ color: '#94a3b8' }}>Saturação</span>
                <span className="text-xs font-bold uppercase tracking-wider w-12 text-right" style={{ color: '#94a3b8' }}>Match</span>
              </div>
            </div>
            {/* Linhas */}
            {displayed.map((e, i) => {
              const sat = SAT_STYLE[e.saturacao] || { bg: '#f3f4f6', color: '#374151' }
              return (
                <Link key={e.id} href={`/especialidades/${e.id}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition group"
                  style={{ background: i < 3 ? '#f0fdfa' : undefined }}>
                  <span className="w-7 text-center text-sm font-bold flex-shrink-0" style={{ color: '#94a3b8' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700 transition">{e.nome}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full" style={{ width: `${e.pct}%`, background: '#2dd4bf' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full w-24 text-center"
                      style={{ background: sat.bg, color: sat.color }}>
                      Mercado {e.saturacao}
                    </span>
                    <span className="font-extrabold text-sm w-12 text-right" style={{ color: '#1d4ed8' }}>
                      {e.pct.toFixed(1)}%
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          {!showAll && ranking.length > 20 && (
            <button onClick={() => setShowAll(true)}
              className="w-full mt-3 text-sm text-blue-600 font-semibold py-3 border border-blue-200 rounded-xl hover:bg-blue-50 transition">
              Ver todas as {ranking.length} especialidades
            </button>
          )}
        </section>

        {/* ── BIBLIOTECA ── */}
        <section>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">📚</span>
            <div className="flex-1">
              <h3 className="font-extrabold text-blue-900 text-base mb-1">Biblioteca de Especialidades</h3>
              <p className="text-sm text-gray-500 mb-4">
                Explore todas as 55 especialidades reconhecidas pelo CFM — descrições, rotinas, dados do DMB 2025 e muito mais.
              </p>
              <a href="/especialidades"
                className="inline-flex items-center gap-2 bg-blue-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition">
                Explorar especialidades →
              </a>
            </div>
          </div>
        </section>

        {/* ── AÇÕES ── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-10">
          <button onClick={downloadPDF} disabled={printing}
            className="flex-1 bg-blue-900 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition disabled:opacity-60">
            {printing ? '⏳ Gerando...' : '📄 Baixar PDF completo'}
          </button>
          {!hideRestartButton && (
            <button onClick={onRestart}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition">
              Refazer o teste
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
