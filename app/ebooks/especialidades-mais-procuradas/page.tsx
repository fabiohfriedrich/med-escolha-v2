import Link from 'next/link'

export const metadata = {
  title: 'As Especialidades Médicas Mais Procuradas do Brasil 2025 | Med Escolha',
  description: 'Ranking atualizado das especialidades mais buscadas por pacientes e mais concorridas na residência médica. Dados reais de 2025.',
}

const TOP_PACIENTES = [
  { pos: 1, nome: 'Ortopedia e Traumatologia', pct: '17,6%', motivo: 'Dores musculares, fraturas, artrose e lesões esportivas', icone: '🦴', cor: '#ef4444' },
  { pos: 2, nome: 'Ginecologia e Obstetrícia', pct: '16,2%', motivo: 'Saúde da mulher, pré-natal e acompanhamento ginecológico', icone: '🌸', cor: '#ec4899' },
  { pos: 3, nome: 'Oftalmologia', pct: '15,4%', motivo: 'Miopia, catarata, glaucoma e cirurgia refrativa', icone: '👁', cor: '#8b5cf6' },
  { pos: 4, nome: 'Cardiologia', pct: '13,1%', motivo: 'Principal causa de morte no Brasil — demanda constante', icone: '❤️', cor: '#dc2626' },
  { pos: 5, nome: 'Urologia', pct: '11,8%', motivo: 'Próstata, infecções urinárias e disfunção erétil', icone: '🩺', cor: '#2563eb' },
  { pos: 6, nome: 'Dermatologia', pct: '10,9%', motivo: 'Acne, pele, estética e oncodermatologia', icone: '🔬', cor: '#0891b2' },
  { pos: 7, nome: 'Neurologia', pct: '9,2%', motivo: 'Cefaleia, AVC, Parkinson e epilepsia', icone: '🧬', cor: '#7c3aed' },
  { pos: 8, nome: 'Pediatria', pct: '8,7%', motivo: 'Saúde infantil e acompanhamento do desenvolvimento', icone: '👶', cor: '#059669' },
  { pos: 9, nome: 'Endocrinologia', pct: '7,4%', motivo: 'Diabetes, tireoide e obesidade', icone: '⚗️', cor: '#d97706' },
  { pos: 10, nome: 'Psiquiatria', pct: '6,8%', motivo: 'Ansiedade, depressão e saúde mental', icone: '🧠', cor: '#9333ea' },
]

const TOP_RESIDENCIA = [
  { pos: 1, nome: 'Dermatologia', ratio: '35–80:1', nota: 'Acima de 80% em USP e UNIFESP', cor: '#ef4444' },
  { pos: 2, nome: 'Psiquiatria', ratio: '20–50:1', nota: 'Explosão pós-pandemia', cor: '#9333ea' },
  { pos: 3, nome: 'Urologia', ratio: '20–92:1', nota: '92 candidatos/vaga no SES-GO 2024', cor: '#2563eb' },
  { pos: 4, nome: 'Otorrinolaringologia', ratio: '15–51:1', nota: 'Média de 51,12 candidatos/vaga', cor: '#0891b2' },
  { pos: 5, nome: 'Oftalmologia', ratio: '20–45:1', nota: 'Especialmente forte no Sudeste', cor: '#8b5cf6' },
  { pos: 6, nome: 'Ortopedia', ratio: '15–30:1', nota: 'Mais buscada por pacientes', cor: '#d97706' },
  { pos: 7, nome: 'Cardiologia', ratio: '15–35:1', nota: 'Exige pré-requisito de Clínica Médica', cor: '#dc2626' },
  { pos: 8, nome: 'Anestesiologia', ratio: '15–35:1', nota: 'Alta remuneração atrai candidatos', cor: '#059669' },
]

const INSIGHTS = [
  { icon: '📍', titulo: 'Norte e Centro-Oeste buscam mais ortopedia', texto: 'As regiões com menor densidade de especialistas têm busca desproporcional por ortopedia — oportunidade para quem pensa em interior.' },
  { icon: '💊', titulo: 'Saúde mental dobrou a busca em 3 anos', texto: 'Psiquiatria e psicologia cresceram mais de 100% nas buscas desde 2020. A pandemia criou uma demanda reprimida enorme.' },
  { icon: '👴', titulo: 'Envelhecimento muda o ranking', texto: 'Geriatria e cardiologia ganham força ano a ano. Até 2040, 1 em cada 5 brasileiros terá mais de 60 anos.' },
  { icon: '📱', titulo: 'Telemedicina ampliou o acesso', texto: 'Especialidades que adotaram telemedicina (psiquiatria, dermatologia, endocrinologia) viram demanda crescer além das capitais.' },
]

export default function EbookMaisProcuradas() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #1e4d8c 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Link href="/ebooks" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, textDecoration: 'none' }}>← Ebooks</Link>
            <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>Especialidades mais procuradas</span>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            📊 Dados 2025 · MedGuias + CFM
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            As especialidades médicas<br />mais procuradas do Brasil
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, maxWidth: 580 }}>
            Dois rankings que todo médico deveria conhecer antes de escolher uma especialidade: o que os pacientes mais buscam e onde a concorrência na residência é mais intensa.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 28, flexWrap: 'wrap' as const }}>
            {[['10 min', 'de leitura'], ['Dados 2025', 'atualizados'], ['2 rankings', 'completos']].map(([v, l]) => (
              <div key={v}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Ranking 1 */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>🔍</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e' }}>O que os pacientes mais buscam</h2>
          </div>
          <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 24, lineHeight: 1.55 }}>
            Ranking por volume de buscas no Google em 2025 (MedGuias). Reflete onde há mais demanda não atendida no Brasil.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {TOP_PACIENTES.map((e) => (
              <div key={e.pos} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: e.pos <= 3 ? e.cor : '#f3f4f6', color: e.pos <= 3 ? 'white' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                  {e.pos <= 3 ? ['🥇','🥈','🥉'][e.pos-1] : e.pos}
                </div>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{e.icone}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 2 }}>{e.nome}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{e.motivo}</div>
                </div>
                <div style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: 13, padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>
                  {e.pct}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 14 }}>Fonte: MedGuias 2025 · % do total de buscas por especialidade médica</p>
        </div>

        {/* Ranking 2 */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>🔥</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e' }}>As mais concorridas na residência</h2>
          </div>
          <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 24, lineHeight: 1.55 }}>
            Candidatos por vaga nos principais programas do Brasil em 2024–2025. Alta demanda de pacientes + alta remuneração = alta concorrência.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {TOP_RESIDENCIA.map((e) => (
              <div key={e.pos} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, background: e.pos === 1 ? '#fef2f2' : '#f9fafb', border: `1px solid ${e.pos === 1 ? '#fecaca' : '#f3f4f6'}` }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: e.cor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {e.pos}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 2 }}>{e.nome}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{e.nota}</div>
                </div>
                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: e.cor }}>{e.ratio}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>candidatos/vaga</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 14 }}>Fonte: Medway, Estratégia MR, dados públicos CNRM 2024–2025</p>
        </div>

        {/* O que isso significa */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 20 }}>O que esses dados significam para você</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {INSIGHTS.map((ins, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 18px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{ins.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>{ins.titulo}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>{ins.texto}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight box */}
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Alta demanda de pacientes ≠ boa escolha de carreira</div>
              <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, margin: 0 }}>
                Especialidades muito buscadas pelos pacientes costumam atrair muitos médicos, aumentando a concorrência. A estratégia inteligente é encontrar a interseção entre <strong>demanda de mercado</strong>, <strong>perfil pessoal</strong> e <strong>viabilidade de entrada na residência</strong>.
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
              <div style={{ fontSize: 12, opacity: 0.75 }}>Descubra qual especialidade combina com seu perfil</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
