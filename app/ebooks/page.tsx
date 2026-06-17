import Link from 'next/link'

export const metadata = {
  title: 'Ebooks Gratuitos sobre Especialidades Médicas | Med Escolha',
  description: 'Guias gratuitos sobre especialidades médicas: as mais procuradas, as que mais cresceram e o melhor momento para a residência.',
}

const EBOOKS = [
  {
    slug: 'especialidades-mais-procuradas',
    titulo: 'As especialidades mais procuradas',
    subtitulo: 'Dois rankings que todo médico deveria conhecer antes de escolher uma especialidade',
    icon: '🔍',
    cor: '#2563eb',
    corFundo: '#eff6ff',
    tag: 'Demanda de mercado',
    destaques: ['Top 10 mais buscadas por pacientes', 'Top 8 mais concorridas na residência', 'Análise de 4 tendências regionais'],
  },
  {
    slug: 'especialidades-que-mais-cresceram',
    titulo: 'As especialidades que mais cresceram',
    subtitulo: 'Crescimento de profissionais ativos no CFM entre 2014 e 2024 — e o que isso significa para você',
    icon: '📈',
    cor: '#059669',
    corFundo: '#ecfdf5',
    tag: 'Dados CFM 2014–2024',
    destaques: ['Psiquiatria +246% em 10 anos', '4 forças macro por trás do crescimento', 'Projeções para os próximos anos'],
  },
  {
    slug: 'momento-da-residencia',
    titulo: 'O melhor momento para a residência',
    subtitulo: 'Quando entrar: direto após a formatura, após plantões ou depois de trabalhar? Análise estratégica',
    icon: '⏳',
    cor: '#d97706',
    corFundo: '#fffbeb',
    tag: 'Guia estratégico',
    destaques: ['3 perfis analisados com prós e contras', '6 fatores críticos para a decisão', 'Cronograma por fase da carreira'],
  },
]

export default function EbooksPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #1e4d8c 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            📚 Guias gratuitos · Med Escolha
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Ebooks sobre especialidades médicas
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
            Guias com dados reais para te ajudar a escolher a especialidade certa — ou confirmar que você já escolheu.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
          {EBOOKS.map((e) => (
            <Link key={e.slug} href={`/ebooks/${e.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)', transition: 'box-shadow .2s', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: 0 }}>
                  {/* Faixa colorida */}
                  <div style={{ width: 6, background: e.cor, flexShrink: 0 }} />
                  <div style={{ padding: '28px 28px 24px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: e.corFundo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                        {e.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: e.corFundo, color: e.cor }}>
                            {e.tag}
                          </span>
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f2d5e', marginBottom: 6, lineHeight: 1.3 }}>{e.titulo}</h2>
                        <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.55, marginBottom: 14 }}>{e.subtitulo}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                          {e.destaques.map((d, i) => (
                            <span key={i} style={{ fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>
                              ✓ {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, color: e.cor }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 40, background: '#0f2d5e', borderRadius: 16, padding: '32px 28px', textAlign: 'center' as const }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🎯</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>Quer uma análise personalizada?</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.55, marginBottom: 20 }}>
            O Teste Med Escolha usa 95 questões e o Mapa de Burnout para cruzar seu perfil com as 55 especialidades do CFM.
          </p>
          <a href="https://match.medescolha.com/" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}>
            Fazer o teste completo →
          </a>
        </div>
      </div>
    </div>
  )
}
