import Link from 'next/link'

export const metadata = {
  title: 'Planilha Financeira para Início de Carreira Médica | Med Escolha',
  description: 'Planilha gratuita pra organizar receitas, despesas e reserva de emergência no começo da residência ou primeiro emprego médico.',
}

const ABAS = [
  { icon: '💰', titulo: 'Receitas', desc: 'Bolsa de residência, plantões extras, PJ e outras rendas' },
  { icon: '🏠', titulo: 'Despesas fixas', desc: 'Moradia, transporte, plano de saúde e mensalidades' },
  { icon: '🎯', titulo: 'Despesas variáveis', desc: 'Lazer, equipamentos e imprevistos do mês' },
  { icon: '🛟', titulo: 'Reserva de emergência', desc: 'Calcule sua meta com base nos seus próprios gastos' },
  { icon: '📊', titulo: 'Resumo', desc: 'Saldo do mês e % da renda que sobrou, calculado automaticamente' },
]

export default function PlanilhaFinanceiraPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Link href="/ferramentas" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, textDecoration: 'none' }}>← Ferramentas</Link>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            📥 Download gratuito · Med Escolha
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Planilha financeira pra início de carreira
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, maxWidth: 560 }}>
            Organize bolsa de residência, plantões e primeiras rendas num modelo pronto, com fórmulas prontas pra você só preencher.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* O que tem dentro */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f2d5e', marginBottom: 16 }}>O que tem dentro da planilha</h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {ABAS.map(a => (
              <div key={a.titulo} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{a.titulo}</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center' as const }}>
          <a
            href="/api/downloads/planilha-financeira"
            download
            style={{ display: 'inline-block', background: '#059669', color: 'white', fontWeight: 700, fontSize: 14, padding: '14px 32px', borderRadius: 10, textDecoration: 'none' }}
          >
            ⬇️ Baixar planilha (.xlsx)
          </a>
        </div>

        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' as const, marginTop: 16 }}>
          Arquivo .xlsx compatível com Excel e Google Sheets.
        </p>
      </div>
    </div>
  )
}
