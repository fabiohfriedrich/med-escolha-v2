import Link from 'next/link'

export const metadata = {
  title: 'Curso IA na Medicina | Med Escolha',
  description: 'Curso completo sobre uso de inteligência artificial no dia a dia clínico, incluso pra quem já fez o Med Escolha.',
}

const AULAS = [
  { numero: 1, youtubeId: '2RJRoy6bDtE', titulo: 'Introdução à Inteligência Artificial na Medicina: Da Teoria à Prática' },
  { numero: 2, youtubeId: 'ZLxVGVueUsY', titulo: 'Deep Learning e Machine Learning na Medicina: Dos Conceitos Básicos às Aplicações Práticas' },
  { numero: 3, youtubeId: 'VEKajwYO92M', titulo: 'Inteligência Artificial na Medicina: Modelos Preditivos, Métricas de Avaliação e Aplicações Práticas' },
  { numero: 4, youtubeId: '8R5Byq02lF4', titulo: 'IA Generativa na Medicina: Da Teoria à Prática com Exemplos Reais' },
]

export default function CursoIaPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Link href="/ferramentas" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, textDecoration: 'none' }}>← Bônus</Link>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            🤖 Curso incluso · Med Escolha
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Curso IA na Medicina: da teoria à prática
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, maxWidth: 580 }}>
            {AULAS.length} aulas ensinando a usar inteligência artificial no dia a dia clínico. Assista direto aqui, no seu ritmo, quantas vezes quiser.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 24 }}>
          {AULAS.map((aula) => (
            <div key={aula.youtubeId} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', color: '#2563eb', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {aula.numero}
                </span>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f2d5e', lineHeight: 1.3 }}>{aula.titulo}</h2>
              </div>
              <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${aula.youtubeId}`}
                  title={aula.titulo}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' as const }}>
          <Link href="/ferramentas" style={{ color: '#2563eb', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>← Voltar pros bônus</Link>
        </div>
      </div>
    </div>
  )
}
