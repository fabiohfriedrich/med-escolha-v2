import Link from 'next/link'

export const metadata = {
  title: 'O Melhor Momento para Começar a Residência Médica | Med Escolha',
  description: 'Guia completo sobre quando começar a residência médica: direto após a formatura, após plantões ou com mais experiência. Estratégias e dados reais.',
}

const MOMENTOS = [
  {
    id: 'direto',
    titulo: 'Direto após a formatura',
    icon: '🎓',
    cor: '#2563eb',
    tagCor: '#dbeafe',
    tagText: '#1e40af',
    tag: 'Estratégia clássica',
    pros: [
      'Conteúdo fresco da faculdade — melhor desempenho nas provas',
      'Sem hábitos clínicos para "desfazer"',
      'Termina a residência mais jovem',
      'Processo seletivo mais previsível com estudo contínuo',
    ],
    contras: [
      'Alto nível de ansiedade e insegurança ainda',
      'Pode não saber ainda o que realmente quer',
      'Sem autonomia financeira durante a residência',
      'Burnout elevado quando vem de 6 anos seguidos de pressão',
    ],
    perfil: 'Ideal para quem já sabe a especialidade desejada, tem alta disciplina de estudo e quer terminar a formação o mais cedo possível.',
    dados: '60% dos residentes do Brasil entram até 1 ano após a colação de grau.',
  },
  {
    id: 'plantoes',
    titulo: '1–2 anos de plantões primeiro',
    icon: '🏥',
    cor: '#059669',
    tagCor: '#d1fae5',
    tagText: '#065f46',
    tag: 'Estratégia mais comum',
    pros: [
      'Independência financeira durante a preparação',
      'Exposição clínica que confirma (ou muda) a escolha',
      'Tempo para estudar sem pressão acadêmica imediata',
      'Maturidade profissional que ajuda na residência',
    ],
    contras: [
      'Plantões desgastam e reduzem tempo de estudo',
      'Risco de acomodar e nunca entrar na residência',
      'Conteúdo da faculdade começa a "esfriar"',
      'Cada ano de espera = 1 ano mais na formação total',
    ],
    perfil: 'Ideal para quem precisa de clareza sobre a especialidade, quer independência financeira e tem disciplina para estudar mesmo trabalhando.',
    dados: '35% dos residentes passaram 1–3 anos trabalhando antes de entrar.',
  },
  {
    id: 'depois',
    titulo: 'Mudar de especialidade já formado',
    icon: '🔄',
    cor: '#d97706',
    tagCor: '#fef3c7',
    tagText: '#92400e',
    tag: 'Cada vez mais comum',
    pros: [
      'Decisão muito mais madura e fundamentada',
      'Já sabe o que não quer — evita arrependimento',
      'Experiência clínica é valorizada na residência',
      'Especialidades como MFC e Med. do Trabalho têm entrada facilitada',
    ],
    contras: [
      'Formação mais tardia',
      'Dificuldade de voltar ao ritmo de estudo',
      'Menor nota de corte para especialidades concorridas',
      'Impacto emocional de "recomeçar"',
    ],
    perfil: 'Ideal para médicos que perceberam que a área escolhida não combina, ou que descobriram uma nova paixão clínica durante a atuação.',
    dados: 'O percentual de médicos que trocam de especialidade cresceu 40% na última década.',
  },
]

const FATORES = [
  { icon: '🎯', titulo: 'Clareza sobre a especialidade', peso: 'Crítico', desc: 'Entrar na residência sem saber o que quer é o maior erro. Um ano a mais estudando com clareza vale mais que anos na especialidade errada.' },
  { icon: '📚', titulo: 'Nível de preparo para o REVALIDA/R1', peso: 'Alto', desc: 'Para especialidades concorridas (derm, psiq, oftalmo), a prep começa 2–3 anos antes da prova. Começo tardio = menor chance.' },
  { icon: '💰', titulo: 'Situação financeira', peso: 'Alto', desc: 'Residência paga R$ 3.300–4k/mês. Se você tem dívidas ou dependentes, planeje antes de entrar.' },
  { icon: '❤️', titulo: 'Saúde mental e física', peso: 'Crítico', desc: 'Entrar na residência em burnout é receita para desistência. Cuide de você antes de entrar — não depois.' },
  { icon: '🏠', titulo: 'Cidade e logística', peso: 'Médio', desc: 'Residência pode exigir mudança. Vale avaliar onde os melhores programas da sua especialidade estão.' },
  { icon: '🏆', titulo: 'Nota e competitividade', peso: 'Alto', desc: 'Para especialidades com 80+ candidatos/vaga, cada mês de estudo estruturado conta.' },
]

const CRONOGRAMA = [
  { fase: 'Início da faculdade (1º–2º ano)', acao: 'Exploração ampla. Ainda não escolha especialidade — apenas observe.' },
  { fase: 'Internato (5º–6º ano)', acao: 'Período mais crítico: estágios definem muito. Participe ativamente de todas as áreas.' },
  { fase: '6 meses antes da formatura', acao: 'Hora de decidir: especialidade definida, estudo do REVALIDA/R1 começando.' },
  { fase: '0–12 meses após formatura', acao: 'Janela ideal para provas de residência. Conteúdo fresco, ritmo de estudo ativo.' },
  { fase: '1–2 anos trabalhando', acao: 'Ok para especialidades menos concorridas. Para concorridas, manter estudo paralelo é essencial.' },
  { fase: '3+ anos sem residência', acao: 'Requer plano estruturado de retomada. Considere especialidades de entrada mais acessível.' },
]

export default function EbookMomentoResidencia() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #1e4d8c 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Link href="/ebooks" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, textDecoration: 'none' }}>← Ebooks</Link>
            <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>O melhor momento para a residência</span>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            ⏳ Guia estratégico · 2025
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            O melhor momento para<br />começar a residência médica
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, maxWidth: 600 }}>
            Não existe uma resposta única — existe a resposta certa para o seu perfil. Este guia te ajuda a entender os prós e contras de cada momento e a tomar a decisão mais estratégica.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 28, flexWrap: 'wrap' as const }}>
            {[['3 momentos', 'analisados'], ['6 fatores', 'críticos'], ['Cronograma', 'prático']].map(([v, l]) => (
              <div key={v}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Spoiler */}
        <div style={{ background: '#0f2d5e', color: 'white', borderRadius: 14, padding: '22px 26px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>A resposta curta</p>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            O melhor momento é quando você tem <strong style={{ color: '#7dd3fc' }}>clareza sobre a especialidade</strong> + <strong style={{ color: '#7dd3fc' }}>preparo adequado para a prova</strong> + <strong style={{ color: '#7dd3fc' }}>condições de saúde mental</strong> para encarar a residência. Esses três elementos raramente aparecem juntos logo após a formatura — mas esperar demais também tem custo.
          </p>
        </div>

        {/* 3 momentos */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16, marginBottom: 24 }}>
          {MOMENTOS.map((m) => (
            <div key={m.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <div style={{ background: m.cor, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>{m.titulo}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: 'rgba(255,255,255,.2)', color: 'white' }}>{m.tag}</span>
                </div>
              </div>
              <div style={{ padding: '22px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>✓ Vantagens</p>
                    {m.pros.map((p, i) => (
                      <p key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 5, paddingLeft: 12, borderLeft: '2px solid #d1fae5' }}>{p}</p>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>✗ Riscos</p>
                    {m.contras.map((c, i) => (
                      <p key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 5, paddingLeft: 12, borderLeft: '2px solid #fee2e2' }}>{c}</p>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 9, padding: '12px 14px', marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: m.cor, marginBottom: 4 }}>👤 Perfil ideal</p>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0 }}>{m.perfil}</p>
                </div>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>📊 {m.dados}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 6 fatores */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 6 }}>Os 6 fatores que realmente decidem o momento certo</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 22, lineHeight: 1.55 }}>Avalie cada um deles antes de tomar sua decisão.</p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {FATORES.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{f.titulo}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: f.peso === 'Crítico' ? '#fee2e2' : f.peso === 'Alto' ? '#fef3c7' : '#f0fdf4', color: f.peso === 'Crítico' ? '#dc2626' : f.peso === 'Alto' ? '#92400e' : '#059669' }}>
                      {f.peso}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cronograma */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 20 }}>Cronograma estratégico por fase</h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
            {CRONOGRAMA.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < CRONOGRAMA.length - 1 ? 20 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#0f2d5e', border: '2px solid #0f2d5e', flexShrink: 0 }} />
                  {i < CRONOGRAMA.length - 1 && <div style={{ width: 2, flex: 1, background: '#e5e7eb', marginTop: 4 }} />}
                </div>
                <div style={{ paddingBottom: i < CRONOGRAMA.length - 1 ? 8 : 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0f2d5e', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 4 }}>{c.fase}</p>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, margin: 0 }}>{c.acao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta final */}
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>O maior erro: esperar sem agir</div>
              <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, margin: 0 }}>
                Muitos médicos passam anos "pensando em entrar na residência" sem estudar de forma estruturada. O resultado é uma queda progressiva de desempenho nas provas e uma sensação crescente de que "ficou tarde demais". <strong>Não existe tarde demais — existe começar errado.</strong> O estudo estruturado precisa começar no máximo 18 meses antes da prova desejada.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link href="/guias" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#0f2d5e', color: 'white', borderRadius: 12, padding: '20px 22px', textAlign: 'center' as const }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>📖</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Explorar especialidades</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Guias com mercado, residência e salário</div>
            </div>
          </Link>
          <a href="https://match.medescolha.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1e4d8c', color: 'white', borderRadius: 12, padding: '20px 22px', textAlign: 'center' as const }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Fazer o teste completo</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>95 questões · 55 especialidades · DMB 2025</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
