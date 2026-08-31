import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import {
  KitTop3CheckoutLink,
  KitTop3DownloadLink,
  KitTop3OfferTracker,
  KitTop3PageTracker,
} from '@/components/KitTop3Analytics'
import { ARQUIVOS_KIT_TOP3, urlDownloadKitTop3 } from '@/lib/kit-top3'
import { PRODUTO_DIGITAL_KIT_TOP3, temAcessoProdutoDigital } from '@/lib/produtos-digitais'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kit Valide Seu Top 3 | Med Escolha 2.0',
  description: 'Roteiros, checklist e matriz para investigar a rotina real das três especialidades do seu ranking.',
}

const ENTREGAS = [
  'Plano prático de validação em 14 dias',
  'Roteiro para entrevistar três especialistas',
  'Checklist para observar três rotinas reais',
  'Roteiro para conversar com três residentes',
  'Matriz preenchível para comparar seu Top 3',
]

export default async function KitTop3Page() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress
  let desbloqueado = false
  let falhaConsulta = false

  if (email) {
    try {
      desbloqueado = await temAcessoProdutoDigital(email, PRODUTO_DIGITAL_KIT_TOP3)
    } catch (error) {
      falhaConsulta = true
      console.error('[kit-top3] Erro ao montar página:', error)
    }
  }

  const checkoutUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_KIT_TOP3?.trim()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <KitTop3PageTracker desbloqueado={desbloqueado} />
      {!desbloqueado ? <KitTop3OfferTracker origem="pagina_kit" /> : null}

      <section className="bg-[#0B1F44] px-6 py-12 text-white sm:py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-9 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Link href="/ferramentas" className="text-sm font-bold text-teal-200 hover:text-white">
              ← Voltar para ferramentas
            </Link>
            <span className="mt-8 block text-sm font-black uppercase tracking-[0.18em] text-teal-300">
              Kit Valide Seu Top 3
            </span>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              Seu ranking virou um plano de investigação.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
              Use 14 dias para conversar, observar e comparar a rotina real das três especialidades que mais combinaram com você.
            </p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <Image src="/products/kit-top3-card.png" alt="Capa do Kit Valide Seu Top 3" fill priority sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        {desbloqueado ? (
          <div>
            <div className="mb-8 rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <p className="font-black text-teal-900">Kit liberado</p>
              <p className="mt-1 text-sm leading-6 text-teal-800">
                Comece pelo plano de 14 dias. Depois, baixe cada roteiro conforme avançar ou leve o pacote completo.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {ARQUIVOS_KIT_TOP3.filter((arquivo) => arquivo.tipo === 'individual').map((arquivo, index) => (
                <article key={arquivo.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-lg font-black text-white">
                      {String(index).padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-blue-950">{arquivo.titulo}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{arquivo.descricao}</p>
                    </div>
                  </div>
                  <KitTop3DownloadLink
                    href={urlDownloadKitTop3(arquivo.slug)}
                    arquivo={arquivo.slug}
                    tipo={arquivo.tipo}
                    className="mt-5 inline-flex rounded-xl bg-blue-950 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-900"
                  >
                    Baixar PDF
                  </KitTop3DownloadLink>
                </article>
              ))}
            </div>

            {ARQUIVOS_KIT_TOP3.filter((arquivo) => arquivo.tipo === 'pacote').map((arquivo) => (
              <article key={arquivo.slug} className="mt-6 flex flex-col justify-between gap-5 rounded-2xl bg-blue-950 p-7 text-white sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">Pacote completo</p>
                  <h2 className="mt-2 text-2xl font-black">Leve os cinco materiais de uma vez</h2>
                  <p className="mt-2 text-sm leading-6 text-blue-100">ZIP pronto para guardar no computador ou compartilhar entre seus próprios dispositivos.</p>
                </div>
                <KitTop3DownloadLink
                  href={urlDownloadKitTop3(arquivo.slug)}
                  arquivo={arquivo.slug}
                  tipo={arquivo.tipo}
                  className="shrink-0 rounded-xl bg-teal-400 px-5 py-3 text-center text-sm font-black text-blue-950 hover:bg-teal-300"
                >
                  Baixar kit completo
                </KitTop3DownloadLink>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_300px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-teal-700">O que você recebe</p>
              <h2 className="mt-3 text-3xl font-black text-blue-950">Pare de comparar especialidades só pela impressão.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                O kit organiza as conversas, observações e evidências que faltam entre ver seu Top 3 e tomar uma decisão com mais clareza.
              </p>
              <ul className="mt-7 space-y-3">
                {ENTREGAS.map((entrega) => (
                  <li key={entrega} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="font-black text-teal-600">✓</span>
                    {entrega}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="h-fit rounded-3xl bg-blue-950 p-7 text-white shadow-xl">
              <p className="text-sm font-bold text-teal-300">Acesso imediato</p>
              <p className="mt-3 text-4xl font-black">R$ 47</p>
              <p className="mt-2 text-sm leading-6 text-blue-100">Pagamento único e sete dias de garantia.</p>
              {falhaConsulta ? (
                <p className="mt-5 rounded-xl bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                  Não conseguimos confirmar seu acesso agora. Tente atualizar a página antes de comprar novamente.
                </p>
              ) : null}
              {checkoutUrl ? (
                <KitTop3CheckoutLink
                  href={checkoutUrl}
                  origem="pagina_kit"
                  className="mt-6 block rounded-xl bg-teal-400 px-5 py-3 text-center text-sm font-black text-blue-950 hover:bg-teal-300"
                >
                  Quero validar meu Top 3
                </KitTop3CheckoutLink>
              ) : (
                <p className="mt-6 rounded-xl border border-white/15 p-4 text-sm leading-6 text-blue-100">
                  A compra avulsa ainda não está disponível neste ambiente.
                </p>
              )}
              <p className="mt-4 text-xs leading-5 text-blue-200">O kit ajuda a organizar sua investigação. Ele não escolhe a especialidade por você.</p>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
