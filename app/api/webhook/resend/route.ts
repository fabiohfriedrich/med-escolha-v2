import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendAlertaAdminEmail } from '@/lib/email'

// Eventos de entrega do Resend que nos interessam pra fechar o rastreamento de provisionamento
// (ver lib/provisionamento.ts). Outros eventos (sent, opened, clicked, delivery_delayed) são
// ignorados por enquanto.
const EVENTOS_ENTREGUE = ['email.delivered']
const EVENTOS_FALHA = ['email.bounced', 'email.complained']

interface ResendWebhookPayload {
  type: string
  data: {
    email_id?: string
    bounce?: { type?: string; subType?: string; message?: string }
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook-resend] RESEND_WEBHOOK_SECRET não configurada')
    return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })
  }

  const payload = await req.text()
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  }

  let evento: ResendWebhookPayload
  try {
    evento = new Webhook(secret).verify(payload, svixHeaders) as ResendWebhookPayload
  } catch (err) {
    console.warn('[webhook-resend] Assinatura inválida:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  const emailId = evento.data?.email_id
  if (!emailId || (!EVENTOS_ENTREGUE.includes(evento.type) && !EVENTOS_FALHA.includes(evento.type))) {
    return NextResponse.json({ ok: true, action: 'ignorado', tipo: evento.type })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { data: comprador } = await supabaseAdmin
    .from('compradores')
    .select('email, nome')
    .eq('resend_email_id', emailId)
    .maybeSingle()

  if (!comprador) {
    // Normal pra e-mails que não são de provisionamento de acesso (alertas internos, etc.)
    return NextResponse.json({ ok: true, action: 'sem-comprador-correspondente' })
  }

  if (EVENTOS_ENTREGUE.includes(evento.type)) {
    await supabaseAdmin
      .from('compradores')
      .update({ status_provisionamento: 'email_entregue', email_entregue_em: new Date().toISOString() })
      .eq('email', comprador.email)

    console.log(`[webhook-resend] E-mail de acesso entregue: ${comprador.email}`)
    return NextResponse.json({ ok: true, action: 'entregue', email: comprador.email })
  }

  // Bounce ou reclamação — grava o estado e alerta, mas não tenta reenviar sozinho: geralmente
  // significa e-mail inválido/errado, decisão de como resolver fica com o admin.
  const motivo = evento.data.bounce?.message ?? evento.data.bounce?.type ?? evento.type
  await supabaseAdmin
    .from('compradores')
    .update({ status_provisionamento: 'falhou', ultimo_erro: `Resend: ${motivo}` })
    .eq('email', comprador.email)

  await sendAlertaAdminEmail({
    assunto: 'E-mail de acesso não entregue (bounce/reclamação)',
    contexto: {
      'E-mail do comprador': comprador.email,
      Nome: comprador.nome,
      Evento: evento.type,
      Motivo: motivo,
    },
  }).catch(alertaErr => console.error('[webhook-resend] Erro ao enviar alerta:', alertaErr))

  console.warn(`[webhook-resend] E-mail de acesso não entregue: ${comprador.email} (${evento.type})`)
  return NextResponse.json({ ok: true, action: 'falha-registrada', email: comprador.email })
}
