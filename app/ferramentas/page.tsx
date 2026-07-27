import Link from 'next/link'

export const metadata = {
  title: 'Ferramentas Gratuitas para Médicos | Med Escolha',
  description: 'Planilha financeira e guia de Instagram gratuitos pra te ajudar a estruturar o início da carreira médica.',
}

const FERRAMENTAS = [
  {
    slug: 'planilha-financeira',
    titulo: 'Planilha financeira para início de carreira',
    subtitulo: 'Organize receitas, despesas e reserva de emergência num modelo pronto pra preencher',
    icon: '💰',
    cor: '#059669',
    corFundo: '#ecfdf5',
    tag: 'Download .xlsx',
    destaques: ['Receitas e despesas fixas/variáveis', 'Cálculo automático de saldo', 'Meta de reserva de emergência'],
  },
  {
    slug: 'guia-instagram',
    titulo: 'Guia de Instagram para médicos',
    subtitulo: 'Configuração básica de perfil e cronograma semanal pra começar a postar sem travar',
    icon: '📱',
    cor: '#7c3aed',
    corFundo: '#faf5ff',
    tag: 'Guia gratuito',
    destaques: ['Checklist de configuração de perfil', 'Tipos de post pra começar', 'Cronograma semanal sugerido'],
  },
]

export default function FerramentasPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #1e4d8c 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            🛠️ Ferramentas · Med Escolha
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Ferramentas gratuitas pra começar bem a carreira
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
            Além de descobrir sua especialidade, o Med Escolha te ajuda a estruturar os primeiros passos da carreira médica.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
          {FERRAMENTAS.map((f) => (
            <Link key={f.slug} href={`/ferramentas/${f.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)', transition: 'box-shadow .2s', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: 0 }}>
                  <div style={{ width: 6, background: f.cor, flexShrink: 0 }} />
                  <div style={{ padding: '28px 28px 24px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: f.corFundo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                        {f.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: f.corFundo, color: f.cor }}>
                            {f.tag}
                          </span>
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f2d5e', marginBottom: 6, lineHeight: 1.3 }}>{f.titulo}</h2>
                        <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.55, marginBottom: 14 }}>{f.subtitulo}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                          {f.destaques.map((d, i) => (
                            <span key={i} style={{ fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>
                              ✓ {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, color: f.cor }}>
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
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>Ainda não fez o teste?</h3>
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
