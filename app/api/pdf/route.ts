import { NextRequest, NextResponse } from 'next/server'
import descriptionsData from '@/data/descriptions.json'
import c04bData from '@/data/c04b_perguntas.json'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const PDF_BUCKET = 'pdfs'

async function getCachedHtml(resultId: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage
      .from(PDF_BUCKET)
      .download(`${resultId}.html`)
    if (error || !data) return null
    return await data.text()
  } catch {
    return null
  }
}

async function cacheHtml(resultId: string, html: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    await supabase.storage
      .from(PDF_BUCKET)
      .upload(`${resultId}.html`, new Blob([html], { type: 'text/html' }), {
        upsert: false,
        contentType: 'text/html; charset=utf-8',
      })
  } catch {
    // falha silenciosa — cache é opcional, não bloqueia o usuário
  }
}

const DESCRIPTIONS = (descriptionsData as any).specialties as Array<{
  id: number; nome: string; descricao: string; rotina_tipica: string
}>

const C04B_QUESTIONS = (c04bData as any).questions as Array<{
  id: string; bloco: string; enunciado_pt: string; scores: Record<string, number>
}>

// ── Jung map ─────────────────────────────────────────────────────────────────
const JUNG_MAP = {
  EI: { E: ['temp-15', 'temp-16'], I: ['temp-01', 'temp-02', 'temp-17'] },
  TF: { T: ['temp-03', 'temp-07', 'temp-08', 'temp-19'], F: ['temp-04', 'temp-05', 'temp-18', 'temp-20'] },
  SN: { S: ['temp-10', 'temp-11', 'temp-23'], N: ['temp-09', 'temp-12', 'temp-13', 'temp-21', 'temp-22', 'temp-24', 'temp-25'] },
}

function resolveJungAxis(selected: string[], sideA: string[], sideB: string[]): 'A' | 'B' {
  const countA = selected.filter(s => sideA.includes(s)).length
  const countB = selected.filter(s => sideB.includes(s)).length
  return countA >= countB ? 'A' : 'B'
}

const JUNG_TEXTS: Record<string, string> = {
  I: 'o introvertido é guiado pelos fatores subjetivos, dirige a sua atenção para o seu mundo interior. geralmente é introspectivo e aprecia mais a companhia de livros do que das pessoas. caracteriza-se por uma certa hesitação diante da ação necessária, tende à reflexão. normalmente é controlado e retraído, exceto quando em companhia de pessoas íntimas. está mais voltado para atividades solitárias e que se processam em seu interior; <strong>prefere compreender a realidade antes de posicionar-se nela</strong>.',
  E: 'o extrovertido é voltado para o mundo exterior, orienta-se pelo objeto e pelo que é objetivamente dado. é expansivo, comunicativo e de fácil relacionamento. <strong>tende a agir primeiro e pensar depois</strong>. recarrega suas energias em contato com pessoas e em situações sociais. é animado, prático e orientado para a ação.',
  F: 'toma decisões com base em seus próprios valores pessoais ou de outras pessoas, mesmo que estas decisões não tenham lógica e objetividade. <strong>sempre vai levar em conta o que sente em relação a algo como, também, os sentimentos dos outros</strong>. voltado para as relações pessoais, mostra-se receptivo e bom para lidar com pessoas. <strong>tem forte atração pela história e pelas tradições</strong>.',
  T: 'toma decisões baseadas na lógica e na análise objetiva. é consistente e justo, pois aplica os mesmos padrões a todos. <strong>prefere clareza e busca a verdade acima da harmonia</strong>. tende a ser crítico e analítico. é orientado a tarefas e à resolução de problemas de forma sistemática.',
  S: 'confia em seus órgãos dos sentidos para compreender objetivamente uma situação. está mais interessado no aqui e agora, no dado imediato e real. <strong>prefere trabalhar com dados reais e objetivos, sendo assim, prático e realista</strong>. sua impressão do mundo não é influenciada pela imaginação. <strong>tem facilidade para lidar com objetos e máquinas que exijam precisão e cuidados</strong>. gosta de manter as coisas funcionando, prefere executar a planejar e necessita de dados concretos para avaliar.',
  N: 'confia principalmente em sua imaginação para criar novas possibilidades. <strong>está mais interessado em padrões, significados e possibilidades do que nos fatos do momento</strong>. orientado para o futuro, gosta de inovação, de explorar novas ideias e de trabalhar com conceitos abstratos.',
}

const JUNG_LABELS: Record<string, string> = {
  E: 'Extroversão', I: 'Introversão',
  T: 'Pensamento', F: 'Sentimento',
  S: 'Sensação', N: 'Intuição',
}

// ── Holland descriptions + icons ──────────────────────────────────────────────
const HOLLAND_INFO: Record<string, { icon: string; desc: string }> = {
  Realista: {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#E0F2FE"/><path d="M16 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6c-3 0-8 1.5-8 4.5V20h16v-1.5C24 15.5 19 14 16 14z" fill="#0D2150"/><path d="M10 22h12v1H10z" fill="#00C9A7"/></svg>`,
    desc: 'prefere atividades práticas que envolvem o uso de ferramentas, máquinas ou animais. tem habilidades mecânicas, manuais e técnicas.',
  },
  Investigativo: {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#E0F2FE"/><circle cx="14" cy="14" r="6" stroke="#0D2150" stroke-width="2" fill="none"/><line x1="19" y1="19" x2="25" y2="25" stroke="#00C9A7" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    desc: 'gosta de observar, aprender, investigar, analisar e avaliar. tem curiosidade intelectual e prefere trabalhar com ideias e problemas complexos.',
  },
  Artístico: {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#E0F2FE"/><polygon points="16,8 19,14 26,14 20.5,18 22.5,25 16,21 9.5,25 11.5,18 6,14 13,14" fill="#00C9A7"/></svg>`,
    desc: 'prefere atividades criativas, expressivas e não estruturadas. tem habilidades artísticas, musicais, literárias ou dramáticas.',
  },
  Social: {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#E0F2FE"/><circle cx="11" cy="13" r="3" fill="#0D2150"/><circle cx="21" cy="13" r="3" fill="#0D2150"/><path d="M7 23c0-3 3-5 4-5h10c1 0 4 2 4 5" stroke="#00C9A7" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    desc: 'gosta de trabalhar com pessoas, ensinar, ajudar, aconselhar e cuidar. é empático, cooperativo e comunicativo.',
  },
  Empreendedor: {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#E0F2FE"/><polygon points="16,8 18,13 24,13 19.5,16.5 21.5,22 16,18.5 10.5,22 12.5,16.5 8,13 14,13" fill="#00C9A7" stroke="#0D2150" stroke-width="0.5"/></svg>`,
    desc: 'gosta de liderar, persuadir e influenciar pessoas. é ambicioso, autoconfiante e orientado a resultados e status.',
  },
  Convencional: {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#E0F2FE"/><rect x="10" y="8" width="12" height="16" rx="2" fill="none" stroke="#0D2150" stroke-width="2"/><line x1="13" y1="13" x2="19" y2="13" stroke="#00C9A7" stroke-width="1.5"/><line x1="13" y1="16" x2="19" y2="16" stroke="#00C9A7" stroke-width="1.5"/><line x1="13" y1="19" x2="17" y2="19" stroke="#00C9A7" stroke-width="1.5"/></svg>`,
    desc: 'prefere atividades estruturadas, ordenadas e com regras claras. é preciso, confiável e orientado a detalhes.',
  },
}

// ── Holland → specialty affinity ─────────────────────────────────────────────
const HOLLAND_SPEC: Record<string, number[]> = {
  Realista:      [3,7,9,10,14,15,33,34,45],
  Investigativo: [2,19,22,25,27,41,44,47,50,54],
  Artístico:     [1,13,18,33,46],
  Social:        [23,24,30,34,42,49,51],
  Empreendedor:  [5,11,13,18,40,43,55],
  Convencional:  [31,32,36,37,47,48,52],
}

// ── Jung → specialty affinity ─────────────────────────────────────────────────
const JUNG_SPEC: Record<string, number[]> = {
  I: [22,27,37,47,48,52,54],
  E: [10,16,29,30,35,49],
  F: [23,24,30,42,44,49,51],
  T: [5,19,22,25,27,41,50,54],
  N: [19,22,27,38,41,44],
  S: [3,6,7,13,15,43,45],
}

const HOLLAND_CONTEXT: Record<string, string> = {
  Realista: 'atividades práticas e procedurais com destreza manual e precisão técnica',
  Investigativo: 'raciocínio diagnóstico complexo, pesquisa e resolução de problemas intelectuais',
  Artístico: 'criatividade, originalidade estética e abordagens não convencionais',
  Social: 'relações humanas, empatia e cuidado longitudinal com pacientes',
  Empreendedor: 'liderança, tomada de decisão e resultados de alto impacto',
  Convencional: 'organização, protocolos estruturados e ambientes controlados',
}

function gerarNarrativa(
  specId: number,
  specNome: string,
  hollandList: string[],
  jungDominant: { EI: string; TF: string; SN: string },
  topTraits: string[]
): string {
  const matchingHolland = hollandList.filter(h => (HOLLAND_SPEC[h] || []).includes(specId))
  const jungAll = [jungDominant.EI, jungDominant.TF, jungDominant.SN]
  const matchingJung = jungAll.filter(j => (JUNG_SPEC[j] || []).includes(specId))

  let text = `sua compatibilidade com <strong>${specNome}</strong> reflete a convergência entre seu perfil e as exigências desta especialidade. `

  if (matchingHolland.length > 0) {
    const ctx = HOLLAND_CONTEXT[matchingHolland[0]] || matchingHolland[0]
    text += `seu perfil <strong>${matchingHolland.join(' e ')}</strong> é especialmente alinhado com esta área, que valoriza ${ctx}. `
  }

  if (matchingJung.length > 0) {
    const jungNames = matchingJung.map(j => `<strong>${JUNG_LABELS[j]}</strong>`).join(' e ')
    text += `seu temperamento de ${jungNames} também favorece o cotidiano desta especialidade. `
  }

  if (topTraits.length >= 2) {
    text += `entre as características que mais conectam você a esta área destacam-se: <strong>${topTraits.slice(0, 3).join('</strong>, <strong>')}</strong>.`
  }

  return text
}

// ── Badge helpers ─────────────────────────────────────────────────────────────
function satBadge(s: string) {
  const map: Record<string, string> = { Baixa:'#16a34a;background:#dcfce7', Média:'#ea580c;background:#fef3c7', Alta:'#dc2626;background:#fee2e2' }
  const style = map[s] || '#6b7280;background:#f3f4f6'
  const icon = s === 'Baixa' ? '🟢' : s === 'Alta' ? '🔴' : '🟡'
  return `<span style="color:${style};font-size:10px;font-weight:600;padding:3px 10px;border-radius:10px;display:inline-flex;align-items:center;gap:4px">${icon} <span>Saturação de mercado: <strong>${s}</strong></span></span>`
}
function crescBadge(c: string) {
  const map: Record<string, string> = { Alto:'#16a34a;background:#dcfce7', Médio:'#1d4ed8;background:#dbeafe', Baixo:'#6b7280;background:#f3f4f6' }
  const style = map[c] || '#6b7280;background:#f3f4f6'
  const icon = c === 'Alto' ? '📈' : c === 'Baixo' ? '📉' : '➡️'
  return `<span style="color:${style};font-size:10px;font-weight:600;padding:3px 10px;border-radius:10px;display:inline-flex;align-items:center;gap:4px;margin-left:6px">${icon} <span>Crescimento projetado: <strong>${c}</strong></span></span>`
}

// ── Pre-requisitos ────────────────────────────────────────────────────────────
const PRE_REQUISITO: Record<number, string> = {
  1:'acesso direto', 2:'acesso direto', 3:'acesso direto', 4:'cirurgia geral',
  5:'clínica médica', 6:'cirurgia geral', 7:'cirurgia geral', 8:'cirurgia geral',
  9:'cirurgia geral', 10:'acesso direto', 11:'cirurgia geral', 12:'cirurgia geral',
  13:'cirurgia geral', 14:'cirurgia geral', 15:'cirurgia geral', 16:'acesso direto',
  17:'cirurgia geral', 18:'acesso direto', 19:'clínica médica', 20:'clínica médica',
  21:'clínica médica', 22:'clínica médica', 23:'clínica médica', 24:'acesso direto',
  25:'clínica médica', 26:'acesso direto', 27:'clínica médica', 28:'cirurgia geral',
  29:'acesso direto', 30:'acesso direto', 31:'acesso direto', 32:'acesso direto',
  33:'acesso direto', 34:'acesso direto', 35:'clínica médica', 36:'acesso direto',
  37:'acesso direto', 38:'acesso direto', 39:'clínica médica', 40:'acesso direto',
  41:'clínica médica', 42:'clínica médica', 43:'acesso direto', 44:'clínica médica',
  45:'acesso direto', 46:'acesso direto', 47:'acesso direto', 48:'acesso direto',
  49:'acesso direto', 50:'clínica médica', 51:'acesso direto', 52:'acesso direto',
  53:'acesso direto', 54:'clínica médica', 55:'clínica médica',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function footer(nome: string, email: string, data: string, page: number) {
  return `
  <div style="margin-top:24px;padding-top:8px;border-top:1px solid #dee2e6;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:10px;color:#6c757d">nome: ${nome} | email: ${email}</span>
    <span style="font-size:10px;color:#6c757d">Med Escolha | data: ${data} | pág. ${page}</span>
  </div>`
}

function tealUnderline() {
  return `<div style="width:40px;height:3px;background:#00C9A7;border-radius:2px;margin-top:4px;margin-bottom:20px"></div>`
}

function horizBar(pct: number, label: string, value: string) {
  return `
  <div style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
      <span style="font-size:11px;color:#1a1a2e;flex:1;margin-right:8px">${label}</span>
      <span style="font-size:11px;font-weight:700;color:#0D2150;width:36px;text-align:right">${value}</span>
    </div>
    <div style="background:#e9ecef;border-radius:4px;height:7px">
      <div style="background:#00C9A7;width:${Math.min(pct, 100)}%;height:7px;border-radius:4px"></div>
    </div>
  </div>`
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { perfil, ranking, answers, resultId } = await req.json()

    // Retorna cache se disponível
    if (resultId) {
      const cached = await getCachedHtml(resultId)
      if (cached) {
        return new NextResponse(cached, {
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Cache': 'HIT' },
        })
      }
    }

    const nome: string = perfil.nome || 'Participante'
    const email: string = perfil.email || ''
    const dataBR = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const dataBRLong = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

    // Jung resolution
    const jungSelected: string[] = answers?.jung || perfil.jung || []
    const eiResult = resolveJungAxis(jungSelected, JUNG_MAP.EI.E, JUNG_MAP.EI.I) === 'A' ? 'E' : 'I'
    const tfResult = resolveJungAxis(jungSelected, JUNG_MAP.TF.T, JUNG_MAP.TF.F) === 'A' ? 'T' : 'F'
    const snResult = resolveJungAxis(jungSelected, JUNG_MAP.SN.S, JUNG_MAP.SN.N) === 'A' ? 'S' : 'N'

    const top3 = ranking.slice(0, 3)
    const hollandList: string[] = answers?.holland || perfil.holland || []
    const c04bAnswers: Record<string, number> = answers?.c04b || {}

    // ── PAGE 1: CAPA ─────────────────────────────────────────────────────────
    const page1 = `
<div class="page" style="background:#fff;padding:0">
  <!-- Logo area -->
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 48px 40px">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:48px;font-weight:900;color:#0D2150;letter-spacing:-2px;line-height:1">
        med<span style="display:inline-block;width:18px;height:18px;background:#00C9A7;border-radius:50%;vertical-align:middle;margin:0 2px;position:relative;top:-4px"></span>escolha
      </div>
      <div style="font-size:16px;color:#00C9A7;font-weight:600;letter-spacing:1px;margin-top:4px">por amo medicina</div>
      <div style="font-size:13px;color:#6c757d;font-style:italic;margin-top:12px;max-width:360px;line-height:1.5">seu guia de orientação profissional para especialidades médicas</div>
    </div>

    <!-- Card central -->
    <div style="border:1.5px solid #dee2e6;border-radius:16px;padding:32px 40px;max-width:480px;width:100%;background:#F8F9FA;text-align:center">
      <div style="font-size:13px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">resultado de</div>
      <div style="font-size:26px;font-weight:800;color:#0D2150;margin-bottom:4px">${nome}</div>
      <div style="font-size:12px;color:#6c757d;margin-bottom:24px">${dataBRLong}</div>
      <div style="border-top:1px solid #dee2e6;padding-top:20px;text-align:left">
        <div style="font-size:11px;font-weight:700;color:#0D2150;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">índice</div>
        <div style="display:grid;gap:6px;font-size:12px;color:#1a1a2e">
          <div style="display:flex;justify-content:space-between"><span>seu match</span><span style="color:#00C9A7;font-weight:700">p. 2</span></div>
          <div style="display:flex;justify-content:space-between"><span>perfil</span><span style="color:#00C9A7;font-weight:700">p. 3</span></div>
          <div style="display:flex;justify-content:space-between"><span>resultados detalhados</span><span style="color:#00C9A7;font-weight:700">p. 4 – 6</span></div>
          <div style="display:flex;justify-content:space-between"><span>resultados gerais</span><span style="color:#00C9A7;font-weight:700">p. 7</span></div>
          <div style="display:flex;justify-content:space-between"><span>referências</span><span style="color:#00C9A7;font-weight:700">p. 8</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Faixa navy inferior -->
  <div style="background:#0D2150;height:60px;display:flex;align-items:center;padding:0 40px">
    <span style="color:#ffffff;font-size:11px;opacity:0.7">med escolha · por amo medicina · euamomedicina.com</span>
  </div>
</div>`

    // ── PAGE 2: SEU MATCH ─────────────────────────────────────────────────────
    const top1 = ranking[0]
    const top3barsHTML = top3.map((e: any) => {
      return horizBar(e.pct, e.nome, e.pct.toFixed(1) + '%')
    }).join('')

    const page2 = `
<div class="page page-break" style="padding:0">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid #dee2e6">
    <div style="font-size:22px;font-weight:900;color:#0D2150;letter-spacing:-1px">
      med<span style="display:inline-block;width:10px;height:10px;background:#00C9A7;border-radius:50%;vertical-align:middle;margin:0 2px;position:relative;top:-2px"></span>escolha
    </div>
    <div style="font-size:11px;color:#00C9A7;font-weight:600">por amo medicina</div>
  </div>

  <p style="font-size:13px;color:#1a1a2e;margin-bottom:16px;line-height:1.6">
    esse é o resultado do seu teste do <strong>med escolha</strong>, o seu match!
  </p>
  <p style="font-size:12px;color:#495057;line-height:1.7;margin-bottom:28px">
    o resultado leva em conta suas respostas, considerando as características pessoais, valores, necessidades, entre outros. com isso, o match visa apoiar a tomada de decisão sobre a carreira médica, fornecendo indicativos valiosos para a orientação de carreira, baseados em estudos nacionais e internacionais, selecionando instrumentos e contribuições testadas nas áreas de medicina e psicologia.
  </p>

  <!-- Seu match -->
  <div style="margin-bottom:32px">
    <div style="font-size:20px;font-weight:800;color:#0D2150">seu match</div>
    ${tealUnderline()}
    <div style="display:flex;align-items:center;gap:24px;background:#F8F9FA;border-radius:16px;padding:24px">
      <!-- Target icon -->
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="28" stroke="#0D2150" stroke-width="2" fill="none"/>
        <circle cx="30" cy="30" r="20" stroke="#00C9A7" stroke-width="2" fill="none"/>
        <circle cx="30" cy="30" r="12" stroke="#0D2150" stroke-width="2" fill="none"/>
        <circle cx="30" cy="30" r="5" fill="#00C9A7"/>
        <line x1="30" y1="2" x2="30" y2="12" stroke="#0D2150" stroke-width="1.5"/>
        <line x1="30" y1="48" x2="30" y2="58" stroke="#0D2150" stroke-width="1.5"/>
        <line x1="2" y1="30" x2="12" y2="30" stroke="#0D2150" stroke-width="1.5"/>
        <line x1="48" y1="30" x2="58" y2="30" stroke="#0D2150" stroke-width="1.5"/>
      </svg>
      <div>
        <div style="font-size:10px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">especialidade #1</div>
        <div style="font-size:30px;font-weight:900;color:#0D2150;line-height:1">${top1.nome}</div>
        <div style="font-size:14px;color:#00C9A7;font-weight:700;margin-top:4px">${top1.pct.toFixed(1)}% de compatibilidade</div>
      </div>
    </div>
  </div>

  <!-- Top 3 -->
  <div>
    <div style="font-size:18px;font-weight:800;color:#0D2150">top 3 🏆🏆🏆</div>
    ${tealUnderline()}
    <p style="font-size:12px;color:#495057;margin-bottom:16px">as três especialidades com a maior compatibilidade:</p>
    <div style="background:#F8F9FA;border-radius:12px;padding:20px">
      ${top3barsHTML}
    </div>
  </div>

  ${footer(nome, email, dataBR, 2)}
</div>`

    // ── PAGE 3: PERFIL ────────────────────────────────────────────────────────
    const hollandCardsHTML = hollandList.slice(0, 3).map((h: string) => {
      const info = HOLLAND_INFO[h] || { icon: '', desc: h }
      return `
      <div style="border:1px solid #dee2e6;border-radius:12px;padding:16px;display:flex;gap:12px;align-items:flex-start">
        <div style="flex-shrink:0">${info.icon}</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#0D2150;margin-bottom:4px">${h}</div>
          <div style="font-size:11px;color:#495057;line-height:1.5">${info.desc}</div>
        </div>
      </div>`
    }).join('')

    const jungPairs = [
      { axis: 'EI', labelA: 'Extroversão', labelB: 'Introversão', result: eiResult },
      { axis: 'TF', labelA: 'Pensamento', labelB: 'Sentimento', result: tfResult },
      { axis: 'SN', labelA: 'Sensação', labelB: 'Intuição', result: snResult },
    ]

    const jungCardsHTML = jungPairs.map(p => {
      const isDominantA = (p.axis === 'EI' && p.result === 'E') || (p.axis === 'TF' && p.result === 'T') || (p.axis === 'SN' && p.result === 'S')
      const labelA = isDominantA ? `<strong>${p.labelA}</strong>` : p.labelA
      const labelB = !isDominantA ? `<strong>${p.labelB}</strong>` : p.labelB
      const textKey = p.result
      const descText = JUNG_TEXTS[textKey] || ''
      return `
      <div style="margin-bottom:20px">
        <div style="font-size:13px;color:#1a1a2e;margin-bottom:6px">${labelA} <span style="color:#6c757d">×</span> ${labelB}</div>
        <div style="width:40px;height:2px;background:#00C9A7;border-radius:2px;margin-bottom:12px"></div>
        <div style="background:#F8F9FA;border-radius:10px;padding:14px">
          <div style="font-size:11px;font-weight:700;color:#00C9A7;text-transform:uppercase;margin-bottom:6px">${JUNG_LABELS[p.result]}</div>
          <div style="font-size:11px;color:#495057;line-height:1.7">${descText}</div>
        </div>
      </div>`
    }).join('')

    const page3 = `
<div class="page page-break" style="padding:0">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid #dee2e6">
    <div style="font-size:22px;font-weight:900;color:#0D2150;letter-spacing:-1px">
      med<span style="display:inline-block;width:10px;height:10px;background:#00C9A7;border-radius:50%;vertical-align:middle;margin:0 2px;position:relative;top:-2px"></span>escolha
    </div>
    <div style="font-size:11px;color:#00C9A7;font-weight:600">por amo medicina</div>
  </div>

  <div style="font-size:24px;font-weight:800;color:#0D2150">perfil</div>
  ${tealUnderline()}

  <!-- Holland -->
  <div style="margin-bottom:28px">
    <p style="font-size:13px;color:#1a1a2e;margin-bottom:14px">os perfis de personalidade que melhor o definem são:</p>
    <div style="display:grid;gap:10px">
      ${hollandCardsHTML}
    </div>
  </div>

  <!-- Temperamento -->
  <div style="font-size:20px;font-weight:800;color:#0D2150">temperamento</div>
  <div style="width:40px;height:3px;background:#00C9A7;border-radius:2px;margin-top:4px;margin-bottom:14px"></div>
  <p style="font-size:12px;color:#495057;margin-bottom:16px">os temperamentos que melhor o definem são:</p>
  ${jungCardsHTML}

  ${footer(nome, email, dataBR, 3)}
</div>`

    // ── PAGES 4-6: ESPECIALIDADE DETALHADA ────────────────────────────────────
    const jungDominant = { EI: eiResult, TF: tfResult, SN: snResult }

    const detailPages = top3.map((e: any, idx: number) => {
      const desc = DESCRIPTIONS.find(d => d.id === e.id)
      const pageNum = 4 + idx
      const preReq = PRE_REQUISITO[e.id] || 'acesso direto'
      const pctEspecialistas = ((e.medicos_ativos / 550000) * 100).toFixed(2)
      const por100k = (e.medicos_ativos / 2150).toFixed(2)
      const salarioFmt = (v: number) => v ? `R$ ${v.toLocaleString('pt-BR')}` : '—'

      // Compatibility bars
      const specIdStr = String(e.id)
      const compatItems = C04B_QUESTIONS
        .filter(q => q.scores[specIdStr] === 1 && c04bAnswers[q.id] > 0)
        .map(q => ({ label: q.enunciado_pt, score: c04bAnswers[q.id] }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

      const half = Math.ceil(compatItems.length / 2)
      const col1 = compatItems.slice(0, half)
      const col2 = compatItems.slice(half)

      const topTraitNames = compatItems.slice(0, 3).map(i => i.label)
      const narrativa = gerarNarrativa(e.id, e.nome, hollandList, jungDominant, topTraitNames)

      function compatBar(item: { label: string; score: number }) {
        const pct = Math.round((item.score / 10) * 100)
        return `
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
            <span style="font-size:10px;color:#1a1a2e">${item.label}</span>
            <span style="font-size:10px;font-weight:700;color:#0D2150;margin-left:4px;white-space:nowrap">${pct}%</span>
          </div>
          <div style="background:#e9ecef;border-radius:3px;height:5px">
            <div style="background:#00C9A7;width:${pct}%;height:5px;border-radius:3px"></div>
          </div>
        </div>`
      }

      return `
<div class="page page-break" style="padding:0">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #dee2e6">
    <div style="font-size:22px;font-weight:900;color:#0D2150;letter-spacing:-1px">
      med<span style="display:inline-block;width:10px;height:10px;background:#00C9A7;border-radius:50%;vertical-align:middle;margin:0 2px;position:relative;top:-2px"></span>escolha
    </div>
    <div style="font-size:11px;color:#00C9A7;font-weight:600">por amo medicina</div>
  </div>

  <!-- Título + match + badges numa linha -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
    <div style="font-size:24px;font-weight:800;color:#0D2150;flex:1">${e.nome}</div>
    <!-- Match circle -->
    <div style="text-align:center;flex-shrink:0;margin-left:16px">
      <div style="font-size:10px;color:#6c757d;margin-bottom:4px">compatibilidade</div>
      <div style="border:3px solid #00C9A7;border-radius:50%;width:60px;height:60px;display:flex;align-items:center;justify-content:center">
        <span style="font-size:13px;font-weight:800;color:#0D2150">${e.pct.toFixed(1)}%</span>
      </div>
    </div>
  </div>
  <div style="width:40px;height:3px;background:#00C9A7;border-radius:2px;margin:6px 0 10px"></div>

  <!-- Badges: saturação, crescimento, salário -->
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
    ${satBadge(e.saturacao)}
    ${crescBadge(e.crescimento)}
    ${e.salario_min ? `<span style="color:#0D2150;background:#e0f2fe;font-size:10px;font-weight:600;padding:3px 10px;border-radius:10px;display:inline-flex;align-items:center;gap:4px;margin-left:6px">💰 <span>Faixa salarial: <strong>${salarioFmt(e.salario_min)} – ${salarioFmt(e.salario_max)}/mês</strong></span></span>` : ''}
  </div>

  <!-- Informações grid -->
  <div style="margin-bottom:14px">
    <div style="font-size:12px;font-weight:700;color:#0D2150;margin-bottom:8px">informações</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      <div style="background:#F8F9FA;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:13px;font-weight:800;color:#0D2150">${e.medicos_ativos?.toLocaleString('pt-BR')}</div>
        <div style="font-size:9px;color:#6c757d;margin-top:2px">especialistas</div>
      </div>
      <div style="background:#F8F9FA;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:13px;font-weight:800;color:#0D2150">${pctEspecialistas}%</div>
        <div style="font-size:9px;color:#6c757d;margin-top:2px">do total de médicos</div>
      </div>
      <div style="background:#F8F9FA;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:13px;font-weight:800;color:#0D2150">${por100k}</div>
        <div style="font-size:9px;color:#6c757d;margin-top:2px">por 100 mil hab.</div>
      </div>
      <div style="background:#F8F9FA;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:13px;font-weight:800;color:#0D2150">${e.anos_formacao} anos</div>
        <div style="font-size:9px;color:#6c757d;margin-top:2px">de formação</div>
      </div>
    </div>
  </div>

  <!-- Sobre a especialidade + O dia a dia lado a lado -->
  ${desc ? `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
    <div>
      <div style="font-size:11px;font-weight:700;color:#0D2150;margin-bottom:4px">sobre a especialidade</div>
      <p style="font-size:10px;color:#495057;line-height:1.65">${desc.descricao}</p>
    </div>
    <div>
      <div style="font-size:11px;font-weight:700;color:#0D2150;margin-bottom:4px">o dia a dia</div>
      <p style="font-size:10px;color:#495057;line-height:1.65">${desc.rotina_tipica}</p>
    </div>
  </div>` : ''}

  <!-- Pré-requisito, duração e por que combina numa linha -->
  <div style="display:grid;grid-template-columns:auto auto 1fr;gap:10px;margin-bottom:14px;align-items:start">
    <div style="background:#F8F9FA;border-radius:8px;padding:8px 12px">
      <div style="font-size:9px;font-weight:700;color:#6c757d;text-transform:uppercase;margin-bottom:3px">pré-requisito</div>
      <div style="font-size:11px;color:#0D2150;font-weight:600">${preReq}</div>
    </div>
    <div style="background:#F8F9FA;border-radius:8px;padding:8px 12px">
      <div style="font-size:9px;font-weight:700;color:#6c757d;text-transform:uppercase;margin-bottom:3px">duração</div>
      <div style="font-size:11px;color:#0D2150;font-weight:600">${e.anos_formacao} anos</div>
    </div>
    <!-- Por que combina -->
    <div style="background:#F0FDF4;border-left:3px solid #00C9A7;border-radius:0 8px 8px 0;padding:8px 12px">
      <div style="font-size:9px;font-weight:700;color:#00C9A7;text-transform:uppercase;margin-bottom:4px">por que combina com você</div>
      <p style="font-size:10px;color:#374151;line-height:1.6">${narrativa}</p>
    </div>
  </div>

  <!-- Compatibilidade -->
  <div>
    <div style="font-size:12px;font-weight:700;color:#0D2150;margin-bottom:4px">compatibilidade</div>
    <p style="font-size:10px;color:#495057;margin-bottom:10px">as características que mais conectam você a esta especialidade:</p>
    ${compatItems.length > 0 ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px">
      <div>${col1.map(compatBar).join('')}</div>
      <div>${col2.map(compatBar).join('')}</div>
    </div>
    <p style="font-size:9px;color:#6c757d;margin-top:6px">* percentual do seu match compreende também outros resultados além dos descritos acima.</p>` :
    '<p style="font-size:10px;color:#6c757d;font-style:italic">responda as perguntas de comportamento para ver suas características de compatibilidade.</p>'}
  </div>

  ${footer(nome, email, dataBR, pageNum)}
</div>`
    }).join('')

    // ── PAGE 7: RESULTADOS GERAIS — tabela 4 colunas (2 pares) ──────────────────
    // Split ranking into two halves for side-by-side display
    const half7 = Math.ceil(ranking.length / 2)
    const col7A = ranking.slice(0, half7)
    const col7B = ranking.slice(half7)

    function rankRow(e: any, i: number, offset: number) {
      const pos = i + 1 + offset
      const bg = i % 2 === 0 ? '#fff' : '#F8F9FA'
      return `
      <tr style="background:${bg}">
        <td style="padding:4px 8px;font-size:10px;font-weight:700;color:#00C9A7;width:28px;white-space:nowrap">${pos}º</td>
        <td style="padding:4px 8px;font-size:10px;color:#1a1a2e">${e.nome}</td>
        <td style="padding:4px 8px;font-size:10px;font-weight:700;color:#0D2150;width:44px;text-align:right;white-space:nowrap">${e.pct.toFixed(1)}%</td>
      </tr>`
    }

    const colARows = col7A.map((e: any, i: number) => rankRow(e, i, 0)).join('')
    const colBRows = col7B.map((e: any, i: number) => rankRow(e, i, half7)).join('')

    const tableStyle = `width:100%;border-collapse:collapse;table-layout:fixed`
    const thStyle = `padding:6px 8px;text-align:left;font-size:9px;color:#fff;font-weight:600`

    const page7 = `
<div class="page page-break" style="padding:0">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #dee2e6">
    <div style="font-size:22px;font-weight:900;color:#0D2150;letter-spacing:-1px">
      med<span style="display:inline-block;width:10px;height:10px;background:#00C9A7;border-radius:50%;vertical-align:middle;margin:0 2px;position:relative;top:-2px"></span>escolha
    </div>
    <div style="font-size:11px;color:#00C9A7;font-weight:600">por amo medicina</div>
  </div>

  <div style="font-size:22px;font-weight:800;color:#0D2150">resultados gerais</div>
  ${tealUnderline()}
  <p style="font-size:11px;color:#495057;margin-bottom:16px">confira o ranking de todas as ${ranking.length} especialidades</p>

  <!-- Tabela 4 colunas: pos | especialidade | compatibilidade || pos | especialidade | compatibilidade -->
  <div style="display:grid;grid-template-columns:1fr 8px 1fr;gap:0 8px">
    <!-- Coluna A -->
    <table style="${tableStyle}">
      <thead>
        <tr style="background:#0D2150">
          <th style="${thStyle};width:28px">#</th>
          <th style="${thStyle}">especialidade</th>
          <th style="${thStyle};width:44px;text-align:right">compat.</th>
        </tr>
      </thead>
      <tbody>${colARows}</tbody>
    </table>
    <!-- Separador vertical -->
    <div style="background:#0D2150;border-radius:4px"></div>
    <!-- Coluna B -->
    <table style="${tableStyle}">
      <thead>
        <tr style="background:#0D2150">
          <th style="${thStyle};width:28px">#</th>
          <th style="${thStyle}">especialidade</th>
          <th style="${thStyle};width:44px;text-align:right">compat.</th>
        </tr>
      </thead>
      <tbody>${colBRows}</tbody>
    </table>
  </div>

  ${footer(nome, email, dataBR, 7)}
</div>`

    // ── PAGE 8: FEEDBACK + REFERÊNCIAS ────────────────────────────────────────
    const page8 = `
<div class="page page-break" style="padding:0">
  <div style="padding:40px 48px 60px;flex:1">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid #dee2e6">
      <div style="font-size:22px;font-weight:900;color:#0D2150;letter-spacing:-1px">
        med<span style="display:inline-block;width:10px;height:10px;background:#00C9A7;border-radius:50%;vertical-align:middle;margin:0 2px;position:relative;top:-2px"></span>escolha
      </div>
      <div style="font-size:11px;color:#00C9A7;font-weight:600">por amo medicina</div>
    </div>

    <!-- Obrigado -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:22px;font-weight:800;color:#0D2150;margin-bottom:8px">obrigado por participar do med escolha!</div>
      <p style="font-size:13px;color:#495057;line-height:1.7;max-width:480px;margin:0 auto 20px">
        que tal agora deixar seu depoimento de como foi a sua participação, e auxiliar outros futuros médicos na escolha da especialidade médica?
      </p>
      <!-- Link de feedback -->
      <div style="display:inline-block;background:#F0FDF4;border:2px solid #00C9A7;border-radius:16px;padding:20px 40px;margin-bottom:8px">
        <a href="https://tally.so/r/mK5POD" style="font-size:16px;font-weight:800;color:#00C9A7;text-decoration:underline;letter-spacing:0.3px">
          clique aqui e deixe seu feedback
        </a>
      </div>
    </div>

    <!-- Referências -->
    <div>
      <div style="font-size:18px;font-weight:800;color:#0D2150">referências</div>
      ${tealUnderline()}
      <div style="font-size:10px;color:#495057;line-height:1.8">
        <p style="margin-bottom:6px">BARROS, Alexandra. Inventário de Crenças de Carreira e Empregabilidade. <em>Aval. psicol.</em>, Itatiba, v. 19, n. 1, p. 79–86, abr. 2020.</p>
        <p style="margin-bottom:6px">BORGES, N. J., NAVARRO, A. M., Grover, A., &amp; Hoban, J. D. (2010). How, when, and why do physicians choose careers in academic medicine? <em>Academic medicine: journal of the Association of American Colleges</em>, 85(4), 680–686.</p>
        <p style="margin-bottom:6px">CORSI, Paulo Roberto et al. Fatores que influenciam o aluno na escolha da especialidade médica. <em>Rev. Bras. Educ. Med.</em>, Rio de Janeiro, v. 38, n. 02, p. 213–220, abr. 2014.</p>
        <p style="margin-bottom:6px">HOLLAND, J. L., Fritzsche, B. A. &amp; Powell, A. B. (1994). <em>SDS Self-Directed Search Technical Manual.</em> Florida Psychological Assessment Resources, Inc.</p>
        <p style="margin-bottom:6px">MAGALHÃES, M. O. (2013). <em>Matriz de habilidades e Interesses profissionais.</em> São Paulo, SP: Casa do Psicólogo.</p>
        <p style="margin-bottom:6px">NEMA, K.M.C. (2008). <em>Critérios para escolhas profissionais</em> (2a ed.). São Paulo: Vetor Editorial.</p>
        <p style="margin-bottom:6px">NUNES, Caio; SANTANA, Marco Antonio. <em>Como escolher a sua Residência Médica e guia para a escolha mais importante da carreira do médico.</em> 2a ed. Salvador: SANAR, 2016.</p>
        <p style="margin-bottom:6px">SCHEFFER, M. et al. <em>Demografia Médica no Brasil 2023.</em> São Paulo, SP: FMUSP, AMB, 2023.</p>
      </div>
    </div>
  </div>

  <!-- Faixa navy inferior -->
  <div style="background:#0D2150;height:48px;display:flex;align-items:center;padding:0 40px">
    <span style="color:#fff;font-size:10px;opacity:0.7">med escolha · por amo medicina · euamomedicina.com</span>
  </div>

  ${footer(nome, email, dataBR, 8)}
</div>`

    // ── Assemble HTML ─────────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Med Escolha — ${nome}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box }
  body {
    font-family: -apple-system, 'Segoe UI', Arial, sans-serif;
    color:#1a1a2e;
    background:#fff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  .page { background:#fff; padding:14mm 16mm 12mm }
  .page-break { page-break-before: always }

  @media print {
    @page { size: A4 portrait; margin: 0 }
    html, body { margin:0; padding:0 }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .page {
      page-break-after: always;
      page-break-inside: auto;
      overflow: visible;
    }
    .page:last-child { page-break-after: auto }

    /* Evita cortes em elementos internos críticos */
    div, p, table, tr, td, span { page-break-inside: avoid }
    table { page-break-inside: auto }
    tr { page-break-inside: avoid; page-break-after: auto }
  }
</style>
</head>
<body>
${page1}
${page2}
${page3}
${detailPages}
${page7}
${page8}
</body>
</html>`

    // Persiste no cache para requests futuros
    if (resultId) {
      await cacheHtml(resultId, html)
    }

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Cache': 'MISS' },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
