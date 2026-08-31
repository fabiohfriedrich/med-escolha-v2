'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { trackKitTop3Checkout, trackKitTop3OfferView, type OrigemOfertaKitTop3 } from '@/lib/ad-tracking'

type Props = {
  desbloqueado: boolean
  origem: Extract<OrigemOfertaKitTop3, 'ferramentas' | 'pos_resultado'>
  compacto?: boolean
  consultaFalhou?: boolean
}

export default function KitTop3OfertaCard({ desbloqueado, origem, compacto = false, consultaFalhou = false }: Props) {
  const checkoutConfigurado = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_KIT_TOP3?.trim()
  const checkoutUrl = consultaFalhou ? undefined : checkoutConfigurado

  useEffect(() => {
    trackKitTop3OfferView(origem)
  }, [origem])

  if (compacto) {
    const content = (
      <>
        <div className="text-2xl">🧭</div>
        <div>
          <p className="font-bold text-blue-900 text-sm">
            {desbloqueado ? 'Seu Kit Top 3' : consultaFalhou ? 'Verifique seu acesso' : 'Valide seu Top 3'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {desbloqueado
              ? 'Roteiros, checklist e matriz prontos para usar.'
              : consultaFalhou
                ? 'Não conseguimos confirmar sua compra agora.'
              : 'Investigue a rotina real das três opções por R$ 47.'}
          </p>
        </div>
        <span className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-2 text-center">
          {desbloqueado ? 'Usar meu kit' : consultaFalhou ? 'Verificar meu acesso' : checkoutUrl ? 'Validar meu Top 3' : 'Conhecer o kit'}
        </span>
      </>
    )

    if (desbloqueado || !checkoutUrl) {
      return (
        <Link href="/ferramentas/kit-top3" className="bg-white rounded-2xl border border-teal-100 shadow-sm p-5 flex flex-col gap-3 no-underline">
          {content}
        </Link>
      )
    }

    return (
      <a
        href={checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackKitTop3Checkout(origem)}
        className="bg-white rounded-2xl border border-teal-100 shadow-sm p-5 flex flex-col gap-3 no-underline"
      >
        {content}
      </a>
    )
  }

  const href = desbloqueado || !checkoutUrl ? '/ferramentas/kit-top3' : checkoutUrl
  const external = !desbloqueado && Boolean(checkoutUrl)
  const card = (
    <article className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#0B1F44]">
        <Image src="/products/kit-top3-card.png" alt="Kit Valide Seu Top 3" fill sizes="(max-width: 800px) 100vw, 760px" className="object-cover" />
      </div>
      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            {desbloqueado ? 'Comprado' : 'Produto adicional'}
          </span>
          {!desbloqueado && !consultaFalhou ? <span className="text-sm font-black text-blue-950">R$ 47</span> : null}
        </div>
        <h2 className="text-xl font-black text-blue-950">Kit Valide Seu Top 3</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Guia de 14 dias, roteiros de conversa, checklist de observação e matriz final para comparar a rotina real.
        </p>
        <span className="mt-5 inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white">
          {desbloqueado ? 'Acessar o kit' : consultaFalhou ? 'Verificar meu acesso' : external ? 'Conhecer por R$ 47' : 'Conhecer o kit'}
        </span>
      </div>
    </article>
  )

  if (!external) {
    return <Link href={href} className="block no-underline">{card}</Link>
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackKitTop3Checkout(origem)} className="block no-underline">
      {card}
    </a>
  )
}
