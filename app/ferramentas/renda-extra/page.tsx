import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import BaixarPdfButton from './BaixarPdfButton'

export const metadata = {
  title: 'Renda Extra para o Médico Recém-Formado | Med Escolha',
  description: 'Ebook exclusivo de indicação: fontes de renda extra pra medicina, comparadas, com checklist e cronograma de início.',
}

const META_INDICACOES = 3

const FONTES = [
  {
    icon: '🏥',
    titulo: 'Plantão coringa/extra',
    tempo: 'começa em dias',
    desc: 'O clássico. Rede de contatos em grupos de plantão, hospitais próximos e clínicas de pronto atendimento. Renda mais previsível das cinco, mas trava sua agenda física.',
  },
  {
    icon: '💻',
    titulo: 'Telemedicina',
    tempo: 'começa em 1-2 semanas',
    desc: 'Plataformas de teleconsulta pagam por atendimento ou por hora de disponibilidade. Exige só conexão estável e um espaço silencioso. Boa pra quem já tem residência ou área definida.',
  },
  {
    icon: '📱',
    titulo: 'Criação de conteúdo',
    tempo: 'começa em 1 dia, renda demora meses',
    desc: 'Redes sociais, newsletter, parcerias com marcas de saúde. Não paga rápido no início, mas é o único item da lista que constrói um ativo que cresce sozinho com o tempo.',
  },
  {
    icon: '📋',
    titulo: 'Pareceres e laudos à distância',
    tempo: 'começa em 2-4 semanas',
    desc: 'Empresas de seguro, perícia e auditoria médica contratam laudos e segundas opiniões remotas. Paga por demanda entregue, não por hora, então rende bem pra quem escreve rápido.',
  },
  {
    icon: '🎓',
    titulo: 'Aulas e mentoria pra vestibular/residência',
    tempo: 'começa em 2-4 semanas',
    desc: 'Cursinhos, plataformas de mentoria e aulas particulares pra quem estuda pra entrar ou pra prestar residência. Aproveita o que você acabou de viver, ainda fresco na memória.',
  },
]

const CHECKLIST = [
  { titulo: 'CRM regularizado e anuidade em dia', desc: 'Sem isso, nenhuma das cinco fontes acima é possível de forma legal.' },
  { titulo: 'Como você vai declarar essa renda', desc: 'Autônomo (RPA) ou abrir CNPJ como PJ. Cada fonte tem uma forma mais comum, pergunta antes de aceitar o primeiro pagamento.' },
  { titulo: 'Contrato ou termo por escrito', desc: 'Mesmo pra plantão avulso. Sem contrato, você não tem como cobrar em caso de calote ou cancelamento em cima da hora.' },
  { titulo: 'Seguro de responsabilidade civil médica', desc: 'Mais importante em telemedicina e pareceres à distância, onde o volume de atendimento por mês costuma ser maior.' },
  { titulo: 'Carga horária que sobra de verdade', desc: 'Residência e plantão fixo já consomem a maior parte da semana. Antes de aceitar, soma as horas reais que sobram, não as que você gostaria de ter.' },
]

const CRONOGRAMA = [
  { periodo: 'mês 1', foco: 'Regularize CRM e decida RPA ou CNPJ. Entra em 2-3 grupos de plantão coringa da sua região.' },
  { periodo: 'mês 2', foco: 'Faz o cadastro em 1 plataforma de telemedicina. Testa o primeiro plantão extra fora da sua rotina fixa.' },
  { periodo: 'mês 3', foco: 'Se sobrou tempo e gostou de escrever, testa pareceres à distância. Se gostou de ensinar, oferece a primeira aula avulsa.' },
  { periodo: 'a partir do mês 4', foco: 'Com o que sobrou de energia, começa a publicar conteúdo com constância. É o único item que não paga rápido, mas é o que mais cresce com o tempo.' },
]

export default async function RendaExtraPage() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()

  let desbloqueado = false
  if (email) {
    const supabase = getSupabaseAdmin()
    const { data: comprador } = await supabase
      .from('compradores')
      .select('codigo_indicacao')
      .eq('email', email)
      .maybeSingle()

    if (comprador?.codigo_indicacao) {
      const { count } = await supabase
        .from('indicacoes')
        .select('id', { count: 'exact', head: true })
        .eq('codigo_indicacao', comprador.codigo_indicacao)
      desbloqueado = (count ?? 0) >= META_INDICACOES
    }
  }

  if (!desbloqueado) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 32px', maxWidth: 440, textAlign: 'center' as const, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 10 }}>Esse ebook é exclusivo pra quem indicou colegas</h1>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
            Indique {META_INDICACOES} colegas que comprarem o Med Escolha com o seu link e desbloqueie o guia de renda extra automaticamente.
          </p>
          <Link href="/perfil?tab=indicacoes" style={{ display: 'inline-block', background: '#0f2d5e', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}>
            Ver meu link de indicação →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="print:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Link href="/perfil?tab=indicacoes" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, textDecoration: 'none' }}>← Indique e ganhe</Link>
          </div>
          <div className="print:hidden" style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            🎁 Bônus de indicação · Med Escolha
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Renda extra pro médico recém-formado
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, maxWidth: 580 }}>
            5 fontes de renda extra comparadas, um checklist antes de aceitar qualquer uma delas, e um cronograma de 4 meses pra começar sem virar refém do plantão.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Intro */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 12 }}>Por que pensar em renda extra logo no início</h2>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
            A maioria dos médicos recém-formados depende de uma fonte só de renda: plantão. É rentável, mas troca hora por dinheiro sem parar, e some se você fica doente, muda de cidade pra residência ou simplesmente quer uma folga. Ter uma segunda fonte, mesmo pequena, dá margem pra escolher a especialidade certa em vez da que paga mais rápido.
          </p>
        </div>

        {/* Fontes */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 16 }}>1. Cinco fontes de renda extra, comparadas</h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            {FONTES.map(f => (
              <div key={f.titulo} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 18px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111' }}>{f.titulo}</p>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap' as const }}>
                    {f.tempo}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 16 }}>2. Checklist antes de aceitar qualquer uma delas</h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {CHECKLIST.map(c => (
              <div key={c.titulo} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#059669', fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{c.titulo}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cronograma */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 8 }}>3. Cronograma de 4 meses pra começar</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 20 }}>
            Ordem sugerida do mais rápido de começar pro que mais demora, mas mais cresce com o tempo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
            {CRONOGRAMA.map(c => (
              <div key={c.periodo} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#059669', width: 100, flexShrink: 0 }}>{c.periodo}</span>
                <span style={{ fontSize: 13, color: '#374151' }}>{c.foco}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download */}
        <div style={{ textAlign: 'center' as const }}>
          <BaixarPdfButton />
        </div>
      </div>
    </div>
  )
}
