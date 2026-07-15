'use client'

import Link from 'next/link'
import posthog from 'posthog-js'
import { useUser } from '@clerk/nextjs'

// TODO: substitua pela URL real do produto na Hotmart
const HOTMART_URL = 'https://pay.hotmart.com/Y86347681C?off=y014gd40&checkoutMode=10&bid=1781225502432'

// ─── Dashboard (usuários com acesso) ───────────────────────────────────────────

const steps = [
  {
    number: '01',
    title: 'Faça o teste',
    description: 'Responda 95 questões sobre seus valores, estilo de trabalho e preferências. O algoritmo compara seu perfil com 55 especialidades reconhecidas pelo CFM.',
  },
  {
    number: '02',
    title: 'Conheça as especialidades',
    description: 'Explore as especialidades mais compatíveis em profundidade: rotina, mercado, salário, saturação e dados reais do DMB 2025.',
  },
  {
    number: '03',
    title: 'Converse com especialistas',
    description: 'Busque médicos que atuam nas especialidades do seu interesse. Uma conversa real sobre o dia a dia vale mais do que qualquer descrição.',
  },
  {
    number: '04',
    title: 'Refaça o teste no momento certo',
    description: 'Ao final da faculdade, da residência ou após vivenciar a área, refaça o teste. Veja se sua compatibilidade evoluiu — e tome a decisão com mais segurança.',
  },
]

function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-black mb-4 leading-tight" style={{ color: '#0f2d5e' }}>
            Bem-vindo ao Med Escolha 2.0
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A plataforma que ajuda médicos e estudantes a descobrir quais especialidades combinam de verdade com seu perfil.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <Link href="/teste" className="group text-white rounded-2xl p-8 flex flex-col gap-4 shadow-lg transition-colors cursor-pointer" style={{ background: '#0f2d5e' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold mb-2">Faça seu teste</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#bfdbfe' }}>
                95 questões · 55 especialidades · ~20 minutos. Descubra quais especialidades combinam com o seu perfil.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-white group-hover:gap-2 transition-all">
              Começar agora →
            </span>
          </Link>

          <Link href="/especialidades" className="group bg-white hover:shadow-xl text-gray-900 rounded-2xl p-8 flex flex-col gap-4 shadow-md border border-gray-100 transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" style={{ color: '#0f2d5e' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: '#0f2d5e' }}>Conheça as especialidades</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                55 especialidades com rotina, mercado, salário, saturação e dados reais do DMB 2025.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color: '#0f2d5e' }}>
              Explorar →
            </span>
          </Link>

          <Link href="/perfil" className="group bg-white hover:shadow-xl text-gray-900 rounded-2xl p-8 flex flex-col gap-4 shadow-md border border-gray-100 transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" style={{ color: '#0f2d5e' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: '#0f2d5e' }}>Meu perfil</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Veja seus resultados anteriores, acompanhe sua evolução e agende o reteste no momento certo.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color: '#0f2d5e' }}>
              Ver perfil →
            </span>
          </Link>

          <Link href="/perfil?tab=resultados" className="group bg-white hover:shadow-xl text-gray-900 rounded-2xl p-8 flex flex-col gap-4 shadow-md border border-gray-100 transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" style={{ color: '#0f2d5e' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: '#0f2d5e' }}>Meus testes</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Consulte seus resultados anteriores e acompanhe como seu perfil evolui ao longo do tempo.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color: '#0f2d5e' }}>
              Ver histórico →
            </span>
          </Link>

        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#0f2d5e' }}>Como funciona o Med Escolha</h2>
          <p className="text-gray-500 mb-8 text-sm">Quatro passos para escolher sua especialidade com mais clareza e segurança.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 text-white rounded-xl flex items-center justify-center font-black text-sm" style={{ background: '#0f2d5e' }}>
                  {step.number}
                </div>
                <div>
                  <h3 className="font-extrabold mb-1" style={{ color: '#0f2d5e' }}>{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── Landing Page (visitantes sem acesso) ──────────────────────────────────────

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Teste de compatibilidade',
    description: '95 questões que mapeiam seus valores, estilo de trabalho e preferências de rotina. Algoritmo desenvolvido com base em critérios reais de cada especialidade.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: '55 especialidades analisadas',
    description: 'Todas as especialidades reconhecidas pelo CFM. Rotina, mercado de trabalho, remuneração, saturação e perspectivas de carreira.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Dados reais do DMB 2025',
    description: 'Cada especialidade é enriquecida com dados do Demographic Medical Brazil 2025: número de médicos, distribuição regional, crescimento e muito mais.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Reteste no momento certo',
    description: 'Refaça o teste ao longo da formação e acompanhe como seu perfil evolui. A decisão certa hoje pode ser diferente daqui a dois anos.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Relatório detalhado em PDF',
    description: 'Resultado completo para guardar, compartilhar com mentores ou usar como ponto de partida em conversas com médicos das especialidades top do seu perfil.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Acesso vitalício à plataforma',
    description: 'Pague uma vez e acesse para sempre. Suas respostas, resultados e histórico ficam salvos enquanto você precisar.',
  },
]

const howItWorks = [
  {
    number: '01',
    title: 'Compre e crie sua conta',
    description: 'Após a compra na Hotmart, você recebe um e-mail para criar sua senha e acessar a plataforma.',
  },
  {
    number: '02',
    title: 'Faça o teste de compatibilidade',
    description: '95 questões em ~20 minutos. Responda com honestidade — não existe resposta certa ou errada.',
  },
  {
    number: '03',
    title: 'Explore seu resultado',
    description: 'Veja o ranking das suas especialidades mais compatíveis com score detalhado e dados de mercado.',
  },
  {
    number: '04',
    title: 'Aprofunde e evolua',
    description: 'Explore cada especialidade, baixe seu relatório e refaça o teste quando fizer sentido para você.',
  },
]

function LandingPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="text-white" style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #1a4a8a 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">

          <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.12)', color: '#93c5fd' }}>
            Med Escolha 2.0 — nova versão disponível
          </span>

          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            Descubra qual especialidade<br className="hidden md:block" />
            <span style={{ color: '#60a5fa' }}> combina com você.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#bfdbfe' }}>
            95 questões. 55 especialidades reconhecidas pelo CFM. Dados reais do DMB 2025.
            Tome a decisão de carreira mais importante da sua vida com mais clareza e segurança.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href={HOTMART_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog.capture('compra_iniciada', { origem: 'hero' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-black transition-transform hover:scale-105 active:scale-100"
              style={{ background: '#2563eb', color: '#fff', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}
            >
              Quero acessar o Med Escolha 2.0 →
            </a>
            <Link
              href="/login"
              className="text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: '#93c5fd' }}
            >
              Já tenho acesso → Entrar
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {[
              { value: '55', label: 'especialidades CFM' },
              { value: '95', label: 'questões no teste' },
              { value: '~20min', label: 'para concluir' },
              { value: 'DMB 2025', label: 'dados de mercado' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: '#93c5fd' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O que está incluído ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#0f2d5e' }}>
            Tudo que você precisa para escolher sua especialidade
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Uma ferramenta desenvolvida para médicos e estudantes que querem tomar essa decisão com dados reais — não com achismo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#eff6ff', color: '#0f2d5e' }}>
                {f.icon}
              </div>
              <h3 className="font-extrabold text-lg mb-2" style={{ color: '#0f2d5e' }}>{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section className="py-20" style={{ background: '#f8fafc' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#0f2d5e' }}>
              Como funciona
            </h2>
            <p className="text-gray-500">Da compra ao resultado em poucos passos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItWorks.map((step) => (
              <div key={step.number} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ background: '#0f2d5e' }}>
                  {step.number}
                </div>
                <div>
                  <h3 className="font-extrabold mb-1" style={{ color: '#0f2d5e' }}>{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para quem é ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="rounded-2xl p-8 border" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2" style={{ color: '#0f2d5e' }}>
              <span className="text-green-500">✓</span> Para quem é
            </h3>
            <ul className="space-y-3">
              {[
                'Estudantes de medicina em qualquer fase',
                'Médicos recém-formados escolhendo a residência',
                'Residentes repensando a especialidade',
                'Quem quer dados concretos antes de decidir',
                'Quem está indeciso entre duas ou mais áreas',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-8 border border-gray-100" style={{ background: '#fafafa' }}>
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2" style={{ color: '#374151' }}>
              <span className="text-gray-400">✕</span> Para quem não é
            </h3>
            <ul className="space-y-3">
              {[
                'Quem já tem 100% de certeza da especialidade',
                'Quem busca um teste de vocação genérico',
                'Quem não quer se aprofundar no resultado',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="text-white" style={{ background: '#0f2d5e' }}>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Pronto para descobrir sua especialidade ideal?
          </h2>
          <p className="mb-10 leading-relaxed" style={{ color: '#93c5fd' }}>
            Acesso vitalício. Resultado em ~20 minutos. Dados de mercado reais para uma decisão que vai durar a vida toda.
          </p>
          <a
            href={HOTMART_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => posthog.capture('compra_iniciada', { origem: 'footer' })}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-black transition-transform hover:scale-105 active:scale-100"
            style={{ background: '#2563eb', color: '#fff', boxShadow: '0 8px 24px rgba(37,99,235,0.5)' }}
          >
            Quero acessar o Med Escolha 2.0 →
          </a>
          <p className="mt-6 text-sm" style={{ color: '#60a5fa' }}>
            Já tem acesso?{' '}
            <Link href="/login" className="font-bold underline hover:opacity-80">
              Entre aqui
            </Link>
          </p>
        </div>
      </section>

    </main>
  )
}

// ─── Página principal — detecta auth e decide o que renderizar ─────────────────

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()

  // A troca de senha obrigatória (primeiro acesso) já é forçada globalmente
  // pelo componente ForcarTrocaSenha, com base no metadata do Clerk.
  if (!isLoaded) return null

  return isSignedIn ? <Dashboard /> : <LandingPage />
}
