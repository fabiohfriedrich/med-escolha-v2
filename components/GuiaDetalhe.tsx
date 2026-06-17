'use client'

import Link from 'next/link'

interface Area { icon: string; titulo: string; descricao: string }
interface AnoRes { ano: string; titulo: string; descricao: string }
interface Salario { label: string; pct: number; valor: string }
interface Especialidade {
  slug: string; nome: string; icon: string; badges: { texto: string; cor: string }[]
  resumo: string; salario_faixa: string; duracao: string; concorrencia: number
  cfm_ativos: string; crescimento_10a: string; candidatos_vaga: string
  mercado: string; areas: Area[]; residencia: AnoRes[]; salarios: Salario[]
  vantagens: string[]; desafios: string[]
  alerta?: { tipo: string; texto: string }
  relacionadas: string[]
}

const BADGE_STYLE: Record<string, React.CSSProperties> = {
  hot:    { background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.25)' },
  up:     { background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.25)' },
  blue:   { background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.25)' },
  yellow: { background: '#fbbf24', color: '#1e3a5f', border: 'none' },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', marginBottom: 14 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em',
        color: '#2d6a9f', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {title}
        <span style={{ flex: 1, height: 1, background: '#f1f5f9', display: 'block' }} />
      </p>
      {children}
    </div>
  )
}

export default function GuiaDetalhe({
  especialidade,
  relacionadasData,
}: {
  especialidade: Especialidade
  relacionadasData: { slug: string; nome: string; icon: string; salario_faixa: string }[]
}) {
  const e = especialidade

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)', color: 'white', padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <Link href="/guias" style={{ color: '#7dd3fc', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
            ← Todas as especialidades
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)' }}>
              Guia completo · Med Escolha
            </span>
            {e.badges.map((b, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, ...BADGE_STYLE[b.cor] }}>
                {b.texto}
              </span>
            ))}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
            {e.icon} {e.nome}
          </h1>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 20, maxWidth: 520, lineHeight: 1.6 }}>{e.resumo}</p>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[
              { v: e.duracao, l: 'duração da residência' },
              { v: e.candidatos_vaga, l: 'candidatos por vaga' },
              { v: e.salario_faixa, l: 'remuneração sênior' },
              { v: e.crescimento_10a, l: 'crescimento 10 anos' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#7dd3fc' }}>{s.v}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 48px', display: 'grid', gridTemplateColumns: '1fr 270px', gap: 16, alignItems: 'flex-start' }}>

        {/* Main */}
        <div>
          {/* Mercado */}
          <Section title="Mercado">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { v: e.cfm_ativos, l: 'profissionais ativos (CFM)' },
                { v: e.crescimento_10a, l: 'crescimento em 10 anos' },
                { v: e.candidatos_vaga, l: 'candidatos/vaga' },
              ].map((s, i) => (
                <div key={i} style={{ background: i === 0 ? '#eff6ff' : '#f8fafc', border: `1px solid ${i === 0 ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '12px 14px', display: 'flex', gap: 9 }}>
              <span>💡</span>
              <p style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.55, margin: 0 }}>{e.mercado}</p>
            </div>
          </Section>

          {/* Áreas */}
          <Section title="Áreas de atuação">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {e.areas.map((a, i) => (
                <div key={i} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 9, padding: '12px 14px' }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{a.icon}</div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{a.titulo}</h4>
                  <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 }}>{a.descricao}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Remuneração */}
          <Section title="Remuneração estimada (2024–2025)">
            {e.salarios.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < e.salarios.length - 1 ? 10 : 0 }}>
                <span style={{ width: 160, fontSize: 12, color: '#374151', fontWeight: 500, flexShrink: 0 }}>{s.label}</span>
                <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 99, height: 7 }}>
                  <div style={{ width: `${s.pct}%`, height: 7, borderRadius: 99, background: 'linear-gradient(90deg, #1e3a5f, #2d6a9f)' }} />
                </div>
                <span style={{ width: 100, fontSize: 12, fontWeight: 700, color: '#1e3a5f', textAlign: 'right', flexShrink: 0 }}>{s.valor}</span>
              </div>
            ))}
          </Section>

          {/* Residência */}
          <Section title="Como é a residência">
            {e.alerta && (
            <div style={{
              background: e.alerta.tipo === 'warn' ? '#fefce8' : '#eff6ff',
              border: `1px solid ${e.alerta.tipo === 'warn' ? '#fde68a' : '#bfdbfe'}`,
              borderRadius: 9, padding: '12px 14px', display: 'flex', gap: 9, marginBottom: 14,
            }}>
              <span>{e.alerta.tipo === 'warn' ? '⚠️' : '💡'}</span>
              <p style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.55, margin: 0 }} dangerouslySetInnerHTML={{ __html: e.alerta.texto }} />
            </div>
            )}
            {e.residencia.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < e.residencia.length - 1 ? 12 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e3a5f', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {r.ano.length > 2 ? '↓' : r.ano}
                  </div>
                  {i < e.residencia.length - 1 && <div style={{ flex: 1, width: 2, background: '#e5e7eb', margin: '3px auto', minHeight: 12 }} />}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{r.titulo}</h4>
                  <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>{r.descricao}</p>
                </div>
              </div>
            ))}
          </Section>

          {/* Vantagens e desafios */}
          <Section title="Vantagens e desafios">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '12px 14px' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 8 }}>✅ Vantagens</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {e.vantagens.map((v, i) => (
                    <li key={i} style={{ fontSize: 12, padding: '2px 0', display: 'flex', gap: 6, color: '#374151' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span> {v}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 9, padding: '12px 14px' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#c2410c', marginBottom: 8 }}>⚠️ Desafios</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {e.desafios.map((d, i) => (
                    <li key={i} style={{ fontSize: 12, padding: '2px 0', display: 'flex', gap: 6, color: '#374151' }}>
                      <span style={{ color: '#ea580c', fontWeight: 700, flexShrink: 0 }}>!</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Relacionadas */}
          {relacionadasData.length > 0 && (
            <Section title="Outras especialidades para explorar">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {relacionadasData.map(r => (
                  <Link key={r.slug} href={`/guias/${r.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', cursor: 'pointer' }}
                      onMouseEnter={el => { (el.currentTarget as HTMLDivElement).style.borderColor = '#93c5fd'; (el.currentTarget as HTMLDivElement).style.background = '#eff6ff' }}
                      onMouseLeave={el => { (el.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'; (el.currentTarget as HTMLDivElement).style.background = '#f8fafc' }}
                    >
                      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{r.icon} {r.nome}</h4>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{r.salario_faixa}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* Footer CTA */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)', borderRadius: 14, padding: '24px 28px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 4 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 5 }}>{e.nome} é a certa para você?</h3>
              <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>Descubra com base no seu perfil e estilo de vida.</p>
            </div>
            <Link href="/quiz-rapido" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <button style={{ background: '#fbbf24', color: '#1e3a5f', fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                Fazer o quiz →
              </button>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* CTA Card */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)', borderRadius: 14, padding: '20px', color: 'white', textAlign: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>
              Essa especialidade combina com você?
            </h3>
            <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 16, lineHeight: 1.5 }}>
              Responda 10 perguntas e descubra as especialidades que mais combinam com seu perfil.
            </p>
            <Link href="/quiz-rapido" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'block', width: '100%', background: '#fbbf24', color: '#1e3a5f', fontWeight: 700, fontSize: 13, padding: '12px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 8 }}>
                🎯 Fazer quiz gratuito
              </button>
            </Link>
            <p style={{ fontSize: 10, opacity: 0.6, margin: 0 }}>+3.200 médicos já fizeram o quiz</p>
          </div>

          {/* Índice */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Neste guia</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {['Visão do mercado', 'Áreas de atuação', 'Remuneração', 'Como é a residência', 'Vantagens e desafios'].map((item, i) => (
                <li key={i}>
                  <span style={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d1d5db', flexShrink: 0, display: 'inline-block' }} />
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats rápidos */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Resumo</p>
            {[
              { l: 'Duração', v: e.duracao },
              { l: 'Concorrência', v: ['—', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][e.concorrencia] },
              { l: 'Crescimento 10a', v: e.crescimento_10a },
              { l: 'Médicos ativos', v: e.cfm_ativos },
              { l: 'Candidatos/vaga', v: e.candidatos_vaga },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{s.l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>{s.v}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
