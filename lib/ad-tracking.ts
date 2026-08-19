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

// Clique em CTA que não leva direto ao checkout da Hotmart (ex: "saiba mais", âncora pra
// seção de preço) — só analytics de produto, não é sinal de intenção de compra pras
// plataformas de anúncio.
export function trackCtaClick(origem: string) {
  posthog.capture('compra_iniciada', { origem })
}

// Clique em CTA que leva direto ao checkout da Hotmart. Além do PostHog, dispara
// InitiateCheckout (Meta) e begin_checkout (GA4/Google Ads) — sem isso as campanhas pagas
// não recebem nenhum sinal de intenção de compra, só pageview (achado da auditoria de
// 18/08/2026, "o funil de receita não fecha").
export function trackCheckoutIntent(origem: string) {
  posthog.capture('compra_iniciada', { origem })
  window.fbq?.('track', 'InitiateCheckout', { content_name: 'med-escolha', currency: MOEDA, value: VALOR_PADRAO })
  window.gtag?.('event', 'begin_checkout', { currency: MOEDA, value: VALOR_PADRAO })
}
