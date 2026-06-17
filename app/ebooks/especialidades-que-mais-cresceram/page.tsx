import Link from 'next/link'

export const metadata = {
  title: 'As Especialidades Médicas que Mais Cresceram em 10 Anos | Med Escolha',
  description: 'Ranking das especialidades com maior crescimento no Brasil entre 2014 e 2024. Dados CFM atualizados.',
}

const RANKING = [
  {
    pos: 1, nome: 'Psiquiatria', crescimento: '+246%', ativos_antes: '~5.000', ativos_hoje: '~22.000',
    icon: '🧠', cor: '#9333ea', tagCor: '#f3e8ff', tagText: '#7e22ce',
    motivo: 'Pandemia, burnout e crescimento explosivo de diagnósticos de ansiedade e depressão.',
    futuro: 'Déficit de 1 psiquiatra para cada 10.000 brasileiros. Demanda garantida por décadas.',
  },
  {
    pos: 2, nome: 'Medicina do Trabalho', crescimento: '+165%', ativos_antes: '~8.500', ativos_hoje: '~22.000',
    icon: '⚙️', cor: '#0891b2', tagCor: '#e0f2fe', tagText: '#0369a1',
    motivo: 'Legislação trabalhista obriga empresas a contratar médicos do trabalho. Telemedicina ocupacional.',
    futuro: 'Zero plantão, horário comercial e demanda corporativa crescente com ESG.',
  },
  {
    pos: 3, nome: 'Medicina de Família e Comunidade', crescimento: '+163%', ativos_antes: '~7.000', ativos_hoje: '~18.000',
    icon: '🏡', cor: '#059669', tagCor: '#d1fae5', tagText: '#065f46',
    motivo: 'Programa Mais Médicos, ESF e valorização da Atenção Primária à Saúde.',
    futuro: 'APS privada crescendo. Telemedicina e clínicas de APS pagam R$ 15k–20k.',
  },
  {
    pos: 4, nome: 'Geriatria', crescimento: '+113%', ativos_antes: '~2.100', ativos_hoje: '~4.500',
    icon: '👴', cor: '#d97706', tagCor: '#fef3c7', tagText: '#92400e',
    motivo: 'Brasil envelhece aceleradamente. Até 2050, 1 em cada 5 brasileiros terá mais de 65 anos.',
    futuro: 'Déficit brutal: 1 geriatra para cada 6.600 idosos. Profissionais em falta por décadas.',
  },
  {
    pos: 5, nome: 'Medicina Intensiva (UTI)', crescimento: '+55%', ativos_antes: '~8.000', ativos_hoje: '~12.400',
    icon: '🏥', cor: '#dc2626', tagCor: '#fee2e2', tagText: '#991b1b',
    motivo: 'Covid-19 acelerou expansão de UTIs no Brasil e profissionalizou a medicina intensiva.',
    futuro: 'Alta renda por plantão. Expansão de UTIs em hospitais secundários e terciários.',
  },
  {
    pos: 6, nome: 'Neurologia', crescimento: '+52%', ativos_antes: '~7.700', ativos_hoje: '~11.800',
    icon: '🧬', cor: '#7c3aed', tagCor: '#ede9fe', tagText: '#5b21b6',
    motivo: 'Envelhecimento da população aumenta AVC, Parkinson e demências. Déficit histórico.',
    futuro: 'Fora de SP e RJ, a posição é garantida com salário competitivo.',
  },
  {
    pos: 7, nome: 'Endocrinologia', crescimento: '+61%', ativos_antes: '~5.200', ativos_hoje: '~9.800',
    icon: '⚗️', cor: '#d97706', tagCor: '#fef3c7', tagText: '#92400e',
    motivo: 'Epidemia de diabetes tipo 2 e obesidade. Semaglutida e novas terapias ampliaram o mercado.',
    futuro: 'Fila de espera em qualquer consultório de endocrinologia do Brasil.',
  },
  {
    pos: 8, nome: 'Radiologia', crescimento: '+35%', ativos_antes: '~13.000', ativos_hoje: '~17.800',
    icon: '📡', cor: '#0f2d5e', tagCor: '#dbeafe', tagText: '#1e40af',
    motivo: 'Telerradiologia e expansão de tomógrafos e ressonâncias em todo o Brasil.',
    futuro: 'IA como ferramenta (não substituta). Trabalho 100% remoto possível.',
  },
]

const MACRO_TENDENCIAS = [
  {
    icon: '🧓',
    titulo: 'Envelhecimento populacional',
    texto: 'Brasil terá 64 milhões de pessoas acima de 60 anos em 2050. Geriatria, cardiologia, neurologia e ortopedia serão as mais demandadas.',
  },
  {
    icon: '🧠',
    titulo: 'Saúde mental como prioridade',
    texto: 'Pós-pandemia triplicou os diagnósticos de transtornos mentais. Psiquiatria tem déficit estrutural que levará décadas para ser resolvido.',
  },
  {
    icon: '💊',
    titulo: 'Novos medicamentos = novas especialidades',
    texto: 'Semaglutida (obesidade), biológicos (reumatologia, dermatologia) e imunoterapia (oncologia) elevaram o valor de especialidades específicas.',
  },
  {
    icon: '💻',
    titulo: 'Telemedicina redistribui a demanda',
    texto: 'Psiquiatria, dermatologia, endocrinologia e medicina do trabalho explodiram fora das capitais graças à telemedicina.',
  },
]

export default function EbookMaisCresceram() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #1e4d8c 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Link href="/ebooks" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, textDecoration: 'none' }}>← Ebooks</Link>
            <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>Especialidades que mais cresceram</span>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            📈 Dados CFM 2014–2024
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            As especialidades que mais<br />cresceram nos últimos 10 anos
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, maxWidth: 600 }}>
            Crescimento de profissionais ativos no CFM entre 2014 e 2024. Entenda por que cada especialidade explodiu — e o que isso significa para o futuro da sua carreira.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 28, flexWrap: 'wrap' as const }}>
            {[['10 anos', 'de dados'], ['8 especialidades', 'analisadas'], ['Tendências', 'e projeções']].map(([v, l]) => (
              <div key={v}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Ranking */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 6 }}>Ranking de crescimento 2014–2024</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 24, lineHeight: 1.55 }}>
            Variação no número de especialistas ativos registrados no CFM.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
            {RANKING.map((e) => (
              <div key={e.pos} style={{ borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: e.cor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                    {e.pos}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{e.icon}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{e.nome}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, padding: '2px 10px', borderRadius: 20, background: e.tagCor, color: e.tagText }}>{e.crescimento}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                      <span>2014: <strong>{e.ativos_antes}</strong></span>
                      <span>→</span>
                      <span>2024: <strong style={{ color: '#111' }}>{e.ativos_hoje}</strong></span>
                    </div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: '0 0 6px' }}><strong>Por quê cresceu:</strong> {e.motivo}</p>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0 }}><strong>E o futuro:</strong> {e.futuro}</p>
                  </div>
                </div>
                {/* Barra de crescimento */}
                <div style={{ background: '#f9fafb', padding: '8px 20px 10px 70px', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ background: '#e5e7eb', borderRadius: 99, height: 5 }}>
                    <div style={{ width: `${Math.min(100, parseInt(e.crescimento) / 2.5)}%`, height: 5, borderRadius: 99, background: e.cor }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Macro tendências */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 20 }}>As 4 forças por trás do crescimento</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {MACRO_TENDENCIAS.map((t, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>{t.titulo}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>{t.texto}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>Crescimento passado não garante futuro — mas estrutural sim</div>
              <p style={{ fontSize: 13, color: '#1e3a8a', lineHeight: 1.6, margin: 0 }}>
                As especialidades no topo deste ranking cresceram por razões <strong>estruturais</strong> — envelhecimento, epidemias crônicas, mudanças legislativas. Essas forças não vão desaparecer. Quem entra agora ainda pega uma demanda muito acima da oferta.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link href="/guias" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#0f2d5e', color: 'white', borderRadius: 12, padding: '20px 22px', textAlign: 'center' as const }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>📖</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Ver guias de especialidade</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Mercado, salário e residência das 55 especialidades</div>
            </div>
          </Link>
          <Link href="/quiz-rapido" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1e4d8c', color: 'white', borderRadius: 12, padding: '20px 22px', textAlign: 'center' as const }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Fazer o quiz rápido</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Descubra qual especialidade combina com você</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
