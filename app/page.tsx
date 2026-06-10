'use client'

import Link from 'next/link'

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

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-black text-blue-900 mb-4 leading-tight">
            Bem-vindo ao Med Escolha 2.0
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A plataforma que ajuda médicos e estudantes a descobrir quais especialidades combinam de verdade com seu perfil.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1 — Faça seu teste */}
          <Link
            href="/teste"
            className="group bg-blue-700 hover:bg-blue-800 text-white rounded-2xl p-8 flex flex-col gap-4 shadow-lg transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold mb-2">Faça seu teste</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                95 questões · 55 especialidades · ~20 minutos. Descubra quais especialidades combinam com o seu perfil.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-white group-hover:gap-2 transition-all">
              Começar agora →
            </span>
          </Link>

          {/* Card 2 — Especialidades */}
          <Link
            href="/especialidades"
            className="group bg-white hover:shadow-xl text-gray-900 rounded-2xl p-8 flex flex-col gap-4 shadow-md border border-gray-100 transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-blue-900 mb-2">Conheça as especialidades</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                55 especialidades com rotina, mercado, salário, saturação e dados reais do DMB 2025.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-blue-700 group-hover:gap-2 transition-all">
              Explorar →
            </span>
          </Link>

          {/* Card 3 — Meu perfil */}
          <Link
            href="/perfil"
            className="group bg-white hover:shadow-xl text-gray-900 rounded-2xl p-8 flex flex-col gap-4 shadow-md border border-gray-100 transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-blue-900 mb-2">Meu perfil</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Veja seus resultados anteriores, acompanhe sua evolução e agende o reteste no momento certo.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-blue-700 group-hover:gap-2 transition-all">
              Ver perfil →
            </span>
          </Link>

          {/* Card 4 — Meus testes */}
          <Link
            href="/perfil?tab=resultados"
            className="group bg-white hover:shadow-xl text-gray-900 rounded-2xl p-8 flex flex-col gap-4 shadow-md border border-gray-100 transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-blue-900 mb-2">Meus testes</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Consulte seus resultados anteriores e acompanhe como seu perfil evolui ao longo do tempo.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-blue-700 group-hover:gap-2 transition-all">
              Ver histórico →
            </span>
          </Link>

        </div>
      </section>

      {/* Passo a passo */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-extrabold text-blue-900 mb-2">Como funciona o Med Escolha</h2>
          <p className="text-gray-500 mb-8 text-sm">Quatro passos para escolher sua especialidade com mais clareza e segurança.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-sm">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-extrabold text-blue-900 mb-1">{step.title}</h3>
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
