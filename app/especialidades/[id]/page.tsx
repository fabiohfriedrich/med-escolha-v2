import { supabase } from '@/lib/supabase'
import descriptionsData from '@/data/descriptions.json'
import dmbData from '@/data/dmb_data.json'
import videosData from '@/data/videos.json'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import VideosEspecialidade from '@/components/VideosEspecialidade'

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

const SAT_STYLE: Record<string, { background: string; color: string }> = {
  Baixa: { background: '#dcfce7', color: '#15803d' },
  Média: { background: '#fef3c7', color: '#b45309' },
  Alta:  { background: '#fee2e2', color: '#dc2626' },
}
const CRESC_STYLE: Record<string, { background: string; color: string }> = {
  Alto:  { background: '#dcfce7', color: '#15803d' },
  Médio: { background: '#dbeafe', color: '#1d4ed8' },
  Baixo: { background: '#f3f4f6', color: '#6b7280' },
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
  return { title: `${d.nome} | Med Escolha`, description: d.descricao?.substring(0, 160) }
}

export default async function EspecialidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  if (isNaN(id) || id < 1 || id > 55) return notFound()

  const descriptions = (descriptionsData as any).specialties as Array<{
    id: number; nome: string; descricao: string; rotina_tipica: string; categoria?: string
  }>
  const desc = descriptions.find(d => d.id === id)
  if (!desc) return notFound()

  const dmb = (dmbData as any).specialties as Array<{
    id: number; salario_min: number; salario_max: number
    anos_formacao: number; saturacao: string; crescimento_projetado: string
  }>
  const dmbSpec = dmb.find(d => d.id === id)

  const { data: supaRow } = await supabase
    .from('especialidades')
    .select('especialistas, por_100k_hab, pct_mulheres, media_idade, pct_capital, pct_sudeste, pct_55_plus')
    .eq('id', id)
    .single()

  const videos = (videosData as Array<{ youtubeId: string; especialidadeId: number; medico: string | null }>)
    .filter(v => v.especialidadeId === id)

  const prev = id > 1 ? descriptions.find(d => d.id === id - 1) : null
  const next = id < 55 ? descriptions.find(d => d.id === id + 1) : null

  const sat = dmbSpec?.saturacao ? SAT_STYLE[dmbSpec.saturacao] : undefined
  const cresc = dmbSpec?.crescimento_projetado ? CRESC_STYLE[dmbSpec.crescimento_projetado] : undefined

  const badge = (label: string, style: React.CSSProperties) => (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, ...style }}>{label}</span>
  )

  const card = (children: React.ReactNode) => (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, marginBottom: 16 }}>
      {children}
    </div>
  )

  const sectionTitle = (icon: string, label: string) => (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, color: '#94a3b8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{icon}</span> {label}
    </p>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Hero */}
      <div style={{ background: '#0f2d5e', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 350, height: 350, borderRadius: '50%', background: '#1a4a8a', opacity: 0.15, transform: 'translate(30%, -30%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
          <Link href="/especialidades" style={{ color: '#93c5fd', fontSize: 13, fontWeight: 500, display: 'inline-block', marginBottom: 20, textDecoration: 'none' }}>
            ← Todas as especialidades
          </Link>
          {desc.categoria && (
            <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              {desc.categoria} · Med Escolha
            </p>
          )}
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>{desc.nome}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dmbSpec?.saturacao && sat && badge(`Saturação ${dmbSpec.saturacao}`, sat)}
            {dmbSpec?.crescimento_projetado && cresc && badge(`Crescimento ${dmbSpec.crescimento_projetado}`, cresc)}
            {dmbSpec?.anos_formacao && badge(`${dmbSpec.anos_formacao} anos de residência`, { background: 'rgba(255,255,255,0.15)', color: '#e2e8f0' })}
            {badge(`Pré-req.: ${PRE_REQ[id] || 'Acesso direto'}`, { background: 'rgba(255,255,255,0.15)', color: '#e2e8f0' })}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Coluna principal */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {card(<>
              {sectionTitle('📋', 'Sobre a especialidade')}
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{desc.descricao}</p>
            </>)}

            {card(<>
              {sectionTitle('🕐', 'Rotina típica')}
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{desc.rotina_tipica}</p>
            </>)}

            <VideosEspecialidade videos={videos} />

            {dmbSpec && dmbSpec.salario_min > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>💰</div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#92400e', marginBottom: 4 }}>Faixa salarial estimada</p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: '#0f2d5e', margin: 0 }}>
                    R$ {dmbSpec.salario_min.toLocaleString('pt-BR')} – R$ {dmbSpec.salario_max.toLocaleString('pt-BR')}/mês
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>Valores estimados para especialistas estabelecidos</p>
                </div>
              </div>
            )}

            {supaRow?.pct_mulheres && card(<>
              {sectionTitle('👥', 'Distribuição por gênero')}
              {[
                { label: 'Mulheres', pct: Number(supaRow.pct_mulheres), color: '#db2777', bg: '#fce7f3' },
                { label: 'Homens', pct: 100 - Number(supaRow.pct_mulheres), color: '#1d6fe8', bg: '#dbeafe' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    <span style={{ color: item.color }}>{item.label}</span>
                    <span style={{ color: item.color }}>{item.pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 10, borderRadius: 999, background: item.bg }}>
                    <div style={{ width: `${item.pct}%`, height: 10, borderRadius: 999, background: item.color }} />
                  </div>
                </div>
              ))}
            </>)}

            {supaRow?.pct_capital && card(<>
              {sectionTitle('📍', 'Onde estão')}
              {[
                { label: 'Nas capitais', pct: Number(supaRow.pct_capital), color: '#1d6fe8' },
                { label: 'No Sudeste', pct: Number(supaRow.pct_sudeste || 0), color: '#0d9488' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#374151', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 700 }}>{item.pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: 10, borderRadius: 999, background: '#f1f5f9' }}>
                    <div style={{ width: `${item.pct}%`, height: 10, borderRadius: 999, background: item.color }} />
                  </div>
                </div>
              ))}
            </>)}
          </div>

          {/* Sidebar */}
          {supaRow && (
            <div style={{ width: 260, flexShrink: 0, position: 'sticky', top: 80 }}>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                {sectionTitle('📊', 'Dados do mercado')}
                <p style={{ fontSize: 10, color: '#cbd5e1', marginBottom: 16, marginTop: -8 }}>Fonte: DMB 2025 · FMUSP/AMB</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Especialistas', value: (supaRow.especialistas ?? 0).toLocaleString('pt-BR') },
                    { label: 'Por 100k hab.', value: supaRow.por_100k_hab ? Number(supaRow.por_100k_hab).toFixed(2) : '—' },
                    { label: 'Mulheres', value: supaRow.pct_mulheres ? `${supaRow.pct_mulheres}%` : '—' },
                    { label: 'Média de idade', value: supaRow.media_idade ? `${supaRow.media_idade}` : '—' },
                    { label: 'Com 55+ anos', value: supaRow.pct_55_plus ? `${supaRow.pct_55_plus}%` : '—' },
                    { label: 'Residência', value: dmbSpec?.anos_formacao ? `${dmbSpec.anos_formacao} anos` : '—' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                      <p style={{ fontSize: 16, fontWeight: 900, color: '#0f2d5e', margin: 0 }}>{stat.value}</p>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, marginBottom: 0 }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prev / Next */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {prev ? (
            <Link href={`/especialidades/${prev.id}`} style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', textDecoration: 'none', display: 'block' }}>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>← Anterior</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2d5e', margin: 0 }}>{prev.nome}</p>
            </Link>
          ) : <div style={{ flex: 1 }} />}
          {next ? (
            <Link href={`/especialidades/${next.id}`} style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', textDecoration: 'none', display: 'block', textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Próxima →</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2d5e', margin: 0 }}>{next.nome}</p>
            </Link>
          ) : <div style={{ flex: 1 }} />}
        </div>

        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Link href="/especialidades" style={{ fontSize: 14, fontWeight: 700, color: '#1d6fe8', textDecoration: 'none' }}>
            ← Ver todas as especialidades
          </Link>
        </div>
      </div>
    </div>
  )
}
