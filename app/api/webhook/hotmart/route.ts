import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { provisionarAcesso } from '@/lib/provisionamento'
import { enviarPurchaseMetaCapi, enviarPurchaseGA4 } from '@/lib/ad-tracking-server'
import {
  carregarConfiguracaoProdutosHotmart,
  classificarOfertaKit,
  classificarProdutoHotmart,
} from '@/lib/hotmart-produtos'
import {
  PRODUTO_DIGITAL_KIT_TOP3,
  registrarCompraProdutoDigital,
  revogarCompraProdutoDigital,
} from '@/lib/produtos-digitais'
import { statusPagamentoPorEvento } from '@/lib/produtos-digitais-core'

// Eventos que liberam o acesso
const EVENTOS_APROVADOS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']
// Eventos que revogam o acesso
const EVENTOS_CANCELADOS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED']

async function registrarIndicacao(codigoOrigem: string, emailIndicado: string, transactionId: string) {
  if (!codigoOrigem) return
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: referrer } = await supabaseAdmin
      .from('compradores')
      .select('email')
      .eq('codigo_indicacao', codigoOrigem)
      .maybeSingle()

    if (!referrer || referrer.email === emailIndicado) return

    const { error } = await supabaseAdmin
      .from('indicacoes')
      .insert({ codigo_indicacao: codigoOrigem, email_indicado: emailIndicado, hotmart_transaction_id: transactionId })

    // Ignora erro de unicidade (e-mail já indicado antes) — qualquer outro erro é logado
    if (error && error.code !== '23505') {
      console.error('[webhook] Erro ao registrar indicação:', error)
    } else if (!error) {
      console.log(`[webhook] Indicação confirmada: ${codigoOrigem} → ${emailIndicado}`)
    }
  } catch (err) {
    console.error('[webhook] Erro ao processar indicação:', err)
  }
}

async function processarCompraPsicologo(emailLower: string, nome: string, transactionId: string) {
  const { error } = await getSupabaseAdmin()
    .from('pacotes_psicologo')
    .upsert(
      {
        email: emailLower,
        nome,
        hotmart_transaction_id: transactionId,
        sessoes_total: 2,
        sessoes_usadas: 0,
        ativo: true,
        status_pagamento: 'pago',
      },
      { onConflict: 'hotmart_transaction_id', ignoreDuplicates: false }
    )

  if (error) {
    console.error('[webhook] Erro ao salvar pacote de psicólogo:', error)
    return NextResponse.json({ error: 'Erro ao salvar pacote' }, { status: 500 })
  }

  // Só cria conta nova + senha temporária se o e-mail ainda não existe no Clerk.
  // Se já existe (ex: comprador do produto principal comprando o pacote depois),
  // não mexe na senha dele, ele já tem acesso à plataforma.
  const client = await clerkClient()
  const { data: usuariosExistentes } = await client.users.getUserList({ emailAddress: [emailLower] })
  if (!usuariosExistentes[0]) {
    const resultadoProvisionamento = await provisionarAcesso(emailLower, nome, { tabela: 'pacotes_psicologo' })
    if (!resultadoProvisionamento.ok) {
      // Mesmo tratamento do fluxo principal: devolve erro pra Hotmart reagendar o reenvio do
      // webhook, em vez de responder sucesso com o comprador ainda sem acesso.
      console.error(`[webhook] Falha ao provisionar acesso (psicólogo), devolvendo 500 pra retry: ${emailLower}`)
      return NextResponse.json({ error: 'Falha ao provisionar acesso', email: emailLower }, { status: 500 })
    }
  }

  console.log(`[webhook] Pacote de psicólogo liberado: ${emailLower} (${transactionId})`)
  return NextResponse.json({ ok: true, action: 'liberado', produto: 'psicologo', email: emailLower })
}

async function processarCompraKit(
  emailLower: string,
  transactionId: string,
  productId: string,
  offerCode: string,
  valorBruto: number | undefined,
  moeda: string,
) {
  const configuracao = carregarConfiguracaoProdutosHotmart()
  const origem = classificarOfertaKit(offerCode, configuracao)

  await registrarCompraProdutoDigital({
    email: emailLower,
    produtoSlug: PRODUTO_DIGITAL_KIT_TOP3,
    hotmartProductId: productId,
    hotmartOfferCode: offerCode,
    hotmartTransactionId: transactionId,
    origem,
    valorBruto,
    moeda,
  })

  console.log(`[webhook] Kit Top 3 liberado: ${transactionId} (${origem})`)
  return NextResponse.json({ ok: true, action: 'liberado', produto: PRODUTO_DIGITAL_KIT_TOP3, origem })
}

// Dedup de eventos aprovados: evita que um reenvio legítimo da Hotmart do mesmo evento
// resete a senha de um comprador que já recebeu acesso (a senha temporária é única por
// provisionamento — resetar de novo pode invalidar uma senha que o comprador ainda nem leu).
async function eventoJaProcessado(transactionId: string, event: string): Promise<boolean> {
  if (!transactionId) return false
  const { data, error } = await getSupabaseAdmin()
    .from('hotmart_eventos_processados')
    .upsert({ transaction_id: transactionId, event }, { onConflict: 'transaction_id,event', ignoreDuplicates: true })
    .select()

  if (error) {
    console.error('[webhook] Erro ao checar idempotência do evento:', error)
    return false
  }
  return !data || data.length === 0
}

async function processarCancelamentoPsicologo(transactionId: string, status_pagamento: string) {
  const { error } = await getSupabaseAdmin()
    .from('pacotes_psicologo')
    .update({ ativo: false, status_pagamento })
    .eq('hotmart_transaction_id', transactionId)

  if (error) console.error('[webhook] Erro ao revogar pacote de psicólogo:', error)

  console.log(`[webhook] Pacote de psicólogo revogado: transação ${transactionId}`)
  return NextResponse.json({ ok: true, action: 'revogado', produto: 'psicologo' })
}

async function processarCancelamentoKit(transactionId: string, event: string) {
  const status = statusPagamentoPorEvento(event)
  if (!status || status === 'pago') {
    return NextResponse.json({ ok: true, action: 'ignorado', event })
  }

  await revogarCompraProdutoDigital(transactionId, status)
  console.log(`[webhook] Kit Top 3 revogado: ${transactionId} (${status})`)
  return NextResponse.json({ ok: true, action: 'revogado', produto: PRODUTO_DIGITAL_KIT_TOP3 })
}

export async function POST(req: NextRequest) {
  try {
    // Valida hottok — token fixo que a Hotmart inclui em todo webhook. Se a variável não
    // estiver configurada, falha fechado em vez de aceitar qualquer payload sem checagem.
    const hottok = process.env.HOTMART_HOTTOK
    if (!hottok) {
      console.error('[webhook] HOTMART_HOTTOK não configurada')
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })
    }
    const receivedToken = req.headers.get('x-hotmart-hottok') ?? req.nextUrl.searchParams.get('hottok') ?? ''
    if (receivedToken !== hottok) {
      console.warn('[webhook] hottok inválido:', receivedToken)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const event: string = body?.event ?? ''

    // Ignora eventos que não precisamos processar — retorna 200 para a Hotmart não retentar
    const EVENTOS_CONHECIDOS = [...EVENTOS_APROVADOS, ...EVENTOS_CANCELADOS]
    if (!EVENTOS_CONHECIDOS.includes(event)) {
      return NextResponse.json({ ok: true, action: 'ignorado', event })
    }

    const configuracaoProdutos = carregarConfiguracaoProdutosHotmart()
    const productId = String(body?.data?.product?.id ?? '').trim()
    const produto = classificarProdutoHotmart(productId, configuracaoProdutos)

    if (produto === 'desconhecido') {
      console.warn(`[webhook] Produto ignorado: ${productId || 'sem-id'} (${event})`)
      return NextResponse.json({ ok: true, action: 'ignorado', reason: 'produto-desconhecido' })
    }

    const email: string = body?.data?.buyer?.email ?? ''
    const nome: string = body?.data?.buyer?.name ?? ''
    const transactionId: string = body?.data?.purchase?.transaction ?? ''
    const codigoIndicacaoOrigem: string = body?.data?.purchase?.origin?.sck ?? ''
    const offerCode: string = body?.data?.purchase?.offer?.code ?? ''
    const valorPayload = Number(body?.data?.purchase?.price?.value)
    const valorBruto = Number.isFinite(valorPayload) ? valorPayload : undefined
    const moeda: string = body?.data?.purchase?.price?.currency_value ?? 'BRL'

    if (!email) {
      console.warn(`[webhook] Evento ${event} sem email no payload`)
      return NextResponse.json({ ok: true, action: 'ignorado', reason: 'sem-email' })
    }

    if (!transactionId) {
      console.warn(`[webhook] Evento ${event} do produto ${produto} sem transação`)
      return NextResponse.json({ ok: true, action: 'ignorado', reason: 'sem-transacao' })
    }

    const emailLower = email.toLowerCase().trim()

    if (EVENTOS_APROVADOS.includes(event)) {
      if (produto === 'psicologo') return await processarCompraPsicologo(emailLower, nome, transactionId)
      if (produto === 'kit-top3') {
        return await processarCompraKit(
          emailLower,
          transactionId,
          productId,
          offerCode,
          valorBruto,
          moeda,
        )
      }

      // 1. Registra/ativa o comprador no banco
      const { error } = await getSupabaseAdmin()
        .from('compradores')
        .upsert(
          {
            email: emailLower,
            nome,
            hotmart_transaction_id: transactionId,
            ativo: true,
            status_pagamento: 'pago',
            tipo: 'comprador',
          },
          { onConflict: 'email', ignoreDuplicates: false }
        )

      if (error) {
        console.error('Supabase upsert error:', error)
        return NextResponse.json({ error: 'Erro ao salvar comprador' }, { status: 500 })
      }

      // 2. Cria/atualiza o usuário no Clerk com senha temporária e envia o e-mail de acesso.
      // Idempotente pelo próprio status_provisionamento do comprador (ver lib/provisionamento.ts)
      // — não depende do dedup abaixo, então um reenvio legítimo da Hotmart tenta de novo se a
      // tentativa anterior tiver falhado, em vez de ficar preso pra sempre.
      const resultadoProvisionamento = await provisionarAcesso(emailLower, nome)

      // 3. Confirma a compra pro Meta CAPI e pro GA4 (server-side, não depende do cookie fbc
      // sobreviver ao redirecionamento pra fora do domínio) — só se esse evento (transactionId
      // + tipo) ainda não tiver sido processado, pra não contar a mesma venda duas vezes.
      // Observação: PURCHASE_APPROVED e PURCHASE_COMPLETE da mesma transação contam como eventos
      // diferentes aqui, então em tese os dois podem chegar e disparar a confirmação duas vezes;
      // o Meta dedupe sozinho via event_id (=transactionId), o GA4 não garante isso com a mesma força.
      const jaProcessado = await eventoJaProcessado(transactionId, event)
      if (jaProcessado) {
        console.log(`[webhook] Evento já processado, pulando confirmação de compra: ${transactionId} (${event})`)
      } else {
        await Promise.all([
          enviarPurchaseMetaCapi({ email: emailLower, transactionId, valor: valorBruto }),
          enviarPurchaseGA4({ email: emailLower, transactionId, valor: valorBruto }),
        ])
      }

      // 4. Se veio de um link de indicação (?ref= → &sck= no checkout), registra a indicação confirmada
      await registrarIndicacao(codigoIndicacaoOrigem, emailLower, transactionId)

      if (!resultadoProvisionamento.ok) {
        // Devolve erro pra Hotmart reagendar o reenvio do webhook — o provisionamento fica
        // pendente de retry automático além do alerta e do botão manual no admin.
        console.error(`[webhook] Falha ao provisionar acesso, devolvendo 500 pra retry: ${emailLower}`)
        return NextResponse.json({ error: 'Falha ao provisionar acesso', email: emailLower }, { status: 500 })
      }

      console.log(`[webhook] Comprador liberado: ${emailLower} (${event})`)
      return NextResponse.json({ ok: true, action: 'liberado', email: emailLower })
    }

    if (EVENTOS_CANCELADOS.includes(event)) {
      const statusMap: Record<string, string> = {
        PURCHASE_REFUNDED: 'reembolsado',
        PURCHASE_CHARGEBACK: 'chargeback',
        PURCHASE_CANCELED: 'cancelado',
      }
      const status_pagamento = statusMap[event] ?? 'cancelado'

      if (produto === 'psicologo') return await processarCancelamentoPsicologo(transactionId, status_pagamento)
      if (produto === 'kit-top3') return await processarCancelamentoKit(transactionId, event)

      const { error } = await getSupabaseAdmin()
        .from('compradores')
        .update({ ativo: false, status_pagamento })
        .eq('email', emailLower)

      if (error) console.error('Supabase update error:', error)

      console.log(`[webhook] Acesso revogado: ${emailLower} (${event})`)
      return NextResponse.json({ ok: true, action: 'revogado', email: emailLower })
    }

    return NextResponse.json({ ok: true, action: 'ignorado', event })
  } catch (err) {
    const msg = err instanceof Error ? `${err.message} | ${err.stack}` : String(err)
    console.error('[webhook] Erro:', msg)
    return NextResponse.json({ error: 'Erro interno', detail: msg }, { status: 500 })
  }
}

// A Hotmart também faz um GET para verificar se a URL está ativa
export async function GET() {
  return NextResponse.json({ status: 'Med Escolha webhook ativo' })
}
