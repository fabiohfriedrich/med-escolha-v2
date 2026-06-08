import { supabase } from '@/lib/supabase'
import descriptionsData from '@/data/descriptions.json'
import dmbData from '@/data/dmb_data.json'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const PRE_REQ: Record<number, string> = {
  1:'Acesso direto',2:'Acesso direto',3:'Acesso direto',4:'Cirurgia Geral',5:'Clínica Médica',
  6:'Cirurgia Geral',7:'Cirurgia Geral',8:'Cirurgia Geral',9:'Cirurgia Geral',10:'Acesso direto',
  11:'Cirurgia Geral',12:'Cirurgia Geral',13:'Cirurgia Geral',14:'Cirurgia Geral',15:'Cirurgia Geral',
  16:'Acesso direto',17:'Cirurgia Geral',18:'Acesso direto',19:'Clínica Médica',20:'Clínica Médica',
  21:'Clínica Médica',22:'Clínica Médica',23:'Clínica Médica',24:'Acesso direto',25:'Clínica Médica',
  26:'Acesso direto',27:'Clínica Médica',28:'Cirurgia Geral',29:'Acesso direto',30:'Acesso direto',
  31:'Acesso direto',32:'Acesso direto',33:'Acesso direto',34:'Acesso direto',35:'Clínica Médica',
  36:'Acesso direto',37:'Acesso direto',38:'Acesso direto',39:'Clínica Médica',40:'Acesso direto',
  41:'Clínica Médica',42:'Clínica Médica',43:'Acesso direto',44:'Clínica Médica',45:'Acesso direto',
  46:'Acesso direto',47:'Acesso direto',48:'Acesso direto',49:'Acesso direto',50:'Clínica Médica',
  51:'Acesso direto',52:'Acesso direto',53:'Acesso direto',54:'Clínica Médica',55:'Clínica Médica',
}

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

export async function generateStaticParams() {
  const descriptions = (descriptionsData as any).specialties as Array<{ id: number }>
  return descriptions.map(d => ({ id: String(d.id) }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const descriptions = (descriptionsData as any).specialties as Array<{ id: number; nome: string; descricao: string }>
  const d = descriptions.find(x => x.id === parseInt(idStr))
  if (!d) return {}
  return {
    title: `${d.nome} | Med Escolha`,
    description: d.descricao?.substring(0, 160),
  }
}

export default async function EspecialidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  if (isNaN(id) || id < 1 || id > 55) return notFound()

  const descriptions = (descriptionsData as any).specialties as Array<{
    id: number; nome: string; descricao: string; rotina_tipica: string
  }>
  const desc = descriptions.find(d => d.id === id)
  if (!desc) return notFound()

  const dmb = (dmbData as any).specialties as Array<{
    id: number; salario_min: number; salario_max: number; medicos_ativos: number
    anos_formacao: number; saturacao: string; crescimento_projetado: string
  }>
  const dmbSpec = dmb.find(d => d.id === id)

  const { data: supaRow } = await supabase
    .from('especialidades')
    .select('especialistas, por_100k_hab, pct_mulheres, media_idade, pct_capital, pct_sudeste, pct_55_plus')
    .eq('id', id)
    .single()

  // Prev / Next navigation
  const prev = id > 1 ? descriptions.find(d => d.id === id - 1) : null
  const next = id < 55 ? descriptions.find(d => d.id === id + 1) : null

  const sat = dmbSpec?.saturacao ? SAT_STYLE[dmbSpec.saturacao] : undefined
  const cresc = dmbSpec?.crescimento_projetado ? CRESC_STYLE[dmbSpec.crescimento_projetado] : undefined

  function StatBox({ label, value }: { label: string; value: string }) {
    return (
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
        <p style={{ fontSize: 17, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.2 }}>{value}</p>
        <p style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>{label}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link href="/especialidades"
            className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white text-sm mb-6 transition">
            ← Todas as especialidades
          </Link>
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Med Escolha · por Amo Medicina</p>
          <h1 className="text-3xl font-extrabold leading-tight mb-3">{desc.nome}</h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {dmbSpec?.saturacao && sat && (
              <span style={{ ...sat, fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 10 }}>
                Saturação {dmbSpec.saturacao}
              </span>
            )}
            {dmbSpec?.crescimento_projetado && cresc && (
              <span style={{ ...cresc, fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 10 }}>
                Crescimento {dmbSpec.crescimento_projetado}
              </span>
            )}
            {dmbSpec?.anos_formacao && (
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 10 }}>
                {dmbSpec.anos_formacao} anos de residência
              </span>
            )}
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 10 }}>
              Pré-req.: {PRE_REQ[id] || 'Acesso direto'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Descrição + Rotina */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sobre a especialidade</p>
            <p className="text-sm text-gray-700 leading-relaxed">{desc.descricao}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Rotina típica</p>
            <p className="text-sm text-gray-700 leading-relaxed">{desc.rotina_tipica}</p>
          </div>
        </div>

        {/* Estatísticas DMB 2025 */}
        {supaRow && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dados do mercado</p>
            <p className="text-[10px] text-gray-300 mb-4">Fonte: DMB 2025 · FMUSP / AMB / Ministério da Saúde</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Especialistas" value={(supaRow.especialistas ?? 0).toLocaleString('pt-BR')} />
              <StatBox label="Por 100k hab." value={supaRow.por_100k_hab ? `${Number(supaRow.por_100k_hab).toFixed(2)}` : '—'} />
              <StatBox label="% Mulheres" value={supaRow.pct_mulheres ? `${supaRow.pct_mulheres}%` : '—'} />
              <StatBox label="Média de idade" value={supaRow.media_idade ? `${supaRow.media_idade} anos` : '—'} />
              <StatBox label="% nas capitais" value={supaRow.pct_capital ? `${supaRow.pct_capital}%` : '—'} />
              <StatBox label="% no Sudeste" value={supaRow.pct_sudeste ? `${supaRow.pct_sudeste}%` : '—'} />
              <StatBox label="% com 55+ anos" value={supaRow.pct_55_plus ? `${supaRow.pct_55_plus}%` : '—'} />
              {dmbSpec?.anos_formacao && <StatBox label="Duração residência" value={`${dmbSpec.anos_formacao} anos`} />}
            </div>
          </div>
        )}

        {/* Salário */}
        {dmbSpec && dmbSpec.salario_min > 0 && (
          <div style={{ background: '#eff6ff', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32 }}>💰</span>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Faixa salarial estimada</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>
                R$ {dmbSpec.salario_min.toLocaleString('pt-BR')} – R$ {dmbSpec.salario_max.toLocaleString('pt-BR')}/mês
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Valores estimados para especialistas estabelecidos</p>
            </div>
          </div>
        )}

        {/* Visualização proporcional de gênero */}
        {supaRow?.pct_mulheres && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Distribuição por gênero</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span style={{ color: '#ec4899' }}>👩 Mulheres</span>
                  <span style={{ color: '#ec4899' }}>{supaRow.pct_mulheres}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: `${supaRow.pct_mulheres}%`, background: '#f472b6' }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span style={{ color: '#3b82f6' }}>👨 Homens</span>
                  <span style={{ color: '#3b82f6' }}>{(100 - Number(supaRow.pct_mulheres)).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: `${100 - Number(supaRow.pct_mulheres)}%`, background: '#60a5fa' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribuição geográfica */}
        {supaRow?.pct_capital && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Onde estão os especialistas</p>
            <div className="space-y-3">
              {[
                { label: 'Nas capitais', pct: Number(supaRow.pct_capital), color: '#1d4ed8' },
                { label: 'No Sudeste', pct: Number(supaRow.pct_sudeste || 0), color: '#0d9488' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-bold" style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navegação prev/next */}
        <div className="flex gap-3 pt-2">
          {prev ? (
            <Link href={`/especialidades/${prev.id}`}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition text-sm">
              <p className="text-xs text-gray-400 mb-0.5">← Anterior</p>
              <p className="font-semibold text-blue-900 truncate">{prev.nome}</p>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link href={`/especialidades/${next.id}`}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition text-sm text-right">
              <p className="text-xs text-gray-400 mb-0.5">Próxima →</p>
              <p className="font-semibold text-blue-900 truncate">{next.nome}</p>
            </Link>
          ) : <div className="flex-1" />}
        </div>

        {/* Voltar */}
        <div className="pb-8 text-center">
          <Link href="/especialidades"
            className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition">
            ← Ver todas as especialidades
          </Link>
        </div>
      </div>
    </div>
  )
}
