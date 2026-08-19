import crypto from 'node:crypto'

// Complementa o InitiateCheckout/begin_checkout do lado do cliente (lib/ad-tracking.ts) com
// uma confirmação de Purchase enviada pelo servidor no momento em que o webhook da Hotmart
// aprova a compra. Isso não depende de cookie (fbc) sobrevivendo ao redirecionamento pra
// fora do domínio — a auditoria de 18/08/2026 encontrou que só 11,3% das compras carregavam
// esse cookie, o que fazia campanhas ativas de tráfego pago mostrarem venda zerada mesmo
// tendo venda real.

const META_PIXEL_ID = '486908010162611'
const GA4_MEASUREMENT_ID = 'G-KR2TGEFGXN'
const MOEDA = 'BRL'
const VALOR_PADRAO = 149

function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

interface PurchaseParams {
  email: string
  transactionId: string
  valor?: number
}

export async function enviarPurchaseMetaCapi({ email, transactionId, valor }: PurchaseParams): Promise<void> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  if (!accessToken) {
    console.warn('[ad-tracking] META_CAPI_ACCESS_TOKEN não configurada, Purchase não enviado ao Meta')
    return
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: transactionId,
          action_source: 'website',
          user_data: { em: [hashEmail(email)] },
          custom_data: { currency: MOEDA, value: valor ?? VALOR_PADRAO },
        }],
      }),
    })
    if (!res.ok) {
      console.error('[ad-tracking] Erro ao enviar Purchase ao Meta CAPI:', res.status, await res.text())
    }
  } catch (err) {
    console.error('[ad-tracking] Erro ao chamar Meta CAPI:', err)
  }
}

export async function enviarPurchaseGA4({ email, transactionId, valor }: PurchaseParams): Promise<void> {
  const apiSecret = process.env.GA4_MEASUREMENT_PROTOCOL_API_SECRET
  if (!apiSecret) {
    console.warn('[ad-tracking] GA4_MEASUREMENT_PROTOCOL_API_SECRET não configurada, purchase não enviado ao GA4')
    return
  }

  try {
    // client_id determinístico a partir do e-mail: não é o client_id real do navegador que
    // clicou no anúncio (não temos como levar esse dado até aqui sem conflitar com o
    // parâmetro sck, já usado pelo sistema de indicação em lib/referral.ts), então esse
    // evento conta certo no total de conversões e receita do GA4, mas pode não se atribuir
    // com precisão à sessão/campanha original.
    const clientId = hashEmail(email).slice(0, 32)

    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          events: [{
            name: 'purchase',
            params: { transaction_id: transactionId, currency: MOEDA, value: valor ?? VALOR_PADRAO },
          }],
        }),
      }
    )
    if (!res.ok) {
      console.error('[ad-tracking] Erro ao enviar purchase ao GA4:', res.status, await res.text())
    }
  } catch (err) {
    console.error('[ad-tracking] Erro ao chamar GA4 Measurement Protocol:', err)
  }
}
