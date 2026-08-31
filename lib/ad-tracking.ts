'use client'

import posthog from 'posthog-js'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

const VALOR_PADRAO = 149
const MOEDA = 'BRL'
const PRODUTO = 'med-escolha'

// Clique informativo que mantém a pessoa na landing. Não é sinal de intenção de compra
// para as plataformas de anúncio.
export function trackCtaClick(origem: string, destino: string) {
  posthog.capture('cta_informativa_clicada', {
    origem,
    destino,
    tipo: 'ancora',
  })
}

export function trackComparatorOpen(origem: string) {
  posthog.capture('comparador_aberto', {
    origem,
    destino: '/comparar',
  })
}

// Clique em CTA que leva direto ao checkout da Hotmart. Além do PostHog, dispara
// InitiateCheckout (Meta) e begin_checkout (GA4/Google Ads) — sem isso as campanhas pagas
// não recebem nenhum sinal de intenção de compra, só pageview (achado da auditoria de
// 18/08/2026, "o funil de receita não fecha").
export function trackCheckoutIntent(origem: string) {
  posthog.capture('compra_iniciada', {
    origem,
    destino: 'hotmart',
    produto: PRODUTO,
    valor: VALOR_PADRAO,
    moeda: MOEDA,
  })
  window.fbq?.('track', 'InitiateCheckout', { content_name: PRODUTO, currency: MOEDA, value: VALOR_PADRAO })
  window.gtag?.('event', 'begin_checkout', { currency: MOEDA, value: VALOR_PADRAO })
}

export type OrigemOfertaKitTop3 = 'ferramentas' | 'pos_resultado' | 'pagina_kit'

export function trackKitTop3OfferView(origem: OrigemOfertaKitTop3) {
  posthog.capture('kit_top3_oferta_vista', { origem })
}

export function trackKitTop3Checkout(origem: OrigemOfertaKitTop3) {
  posthog.capture('kit_top3_checkout_iniciado', {
    origem,
    produto: 'kit-top3',
    valor: 47,
    moeda: MOEDA,
  })
}

export function trackKitTop3Page(desbloqueado: boolean) {
  posthog.capture('kit_top3_pagina_aberta', {
    acesso: desbloqueado ? 'desbloqueado' : 'bloqueado',
  })
}

export function trackKitTop3Download(arquivo: string, tipo: 'individual' | 'pacote') {
  posthog.capture('kit_top3_download', { arquivo, tipo })
}
