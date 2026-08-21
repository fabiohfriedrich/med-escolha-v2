import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendAlertaAdminEmail } from '@/lib/email'

// Eventos de entrega do Resend que nos interessam pra fechar o rastreamento de provisionamento
// (ver lib/provisionamento.ts). email.failed (falha no envio) e email.suppressed (endereço na
// lista de supressão do Resend) são falhas definitivas, tanto quanto bounce — sem isso, um
// e-mail que nunca chega a ser enviado de verdade ficava preso pra sempre em 'email_enviado'.
// email.delivery_delayed fica de fora de propósito: é só um atraso transitório, ainda pode
// entregar depois — não é uma falha.
const EVENTOS_ENTREGUE = ['email.delivered']
const EVENTOS_FALHA = ['email.bounced', 'email.complained', 'email.failed', 'email.suppressed']

interface ResendWebhookPayload {
  type: string
  data: {
    email_id?: string
    bounce?: { type?: string; subType?: string; message?: string }
    failed?: { reason?: string }
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

  // O comprador pode estar em `compradores` (produto principal) ou `pacotes_psicologo`
  // (pacote de psicólogo) — checa as duas, o resend_email_id só existe numa delas.
  const [buscaComprador, buscaPsicologo] = await Promise.all([
    supabaseAdmin.from('compradores').select('email, nome').eq('resend_email_id', emailId).maybeSingle(),
    supabaseAdmin.from('pacotes_psicologo').select('email, nome').eq('resend_email_id', emailId).maybeSingle(),
  ])
  if (buscaComprador.error || buscaPsicologo.error) {
    // Se o Supabase estiver indisponível aqui, não dá pra saber se existe comprador
    // correspondente — devolve erro pro Resend reagendar em vez de assumir "sem correspondente"
    // e perder a evidência de entrega/falha de vez.
    console.error('[webhook-resend] Erro ao buscar comprador correspondente:', buscaComprador.error?.message ?? buscaPsicologo.error?.message)
    return NextResponse.json({ error: 'Erro ao buscar comprador' }, { status: 500 })
  }

  const tabela = buscaComprador.data ? 'compradores' : buscaPsicologo.data ? 'pacotes_psicologo' : null
  const registro = buscaComprador.data ?? buscaPsicologo.data

  if (!tabela || !registro) {
    // Normal pra e-mails que não são de provisionamento de acesso (alertas internos, etc.)
    return NextResponse.json({ ok: true, action: 'sem-comprador-correspondente' })
  }

  if (EVENTOS_ENTREGUE.includes(evento.type)) {
    const { error } = await supabaseAdmin
      .from(tabela)
      .update({ status_provisionamento: 'email_entregue', email_entregue_em: new Date().toISOString() })
      .eq('email', registro.email)
    if (error) {
      // Devolve erro pro Resend reagendar a entrega desse evento de webhook — senão a evidência
      // de entrega se perde de vez (o Resend não reenvia o mesmo evento espontaneamente).
      console.error(`[webhook-resend] Erro ao gravar entrega de ${registro.email}:`, error.message)
      return NextResponse.json({ error: 'Erro ao gravar entrega' }, { status: 500 })
    }

    console.log(`[webhook-resend] E-mail de acesso entregue: ${registro.email}`)
    return NextResponse.json({ ok: true, action: 'entregue', email: registro.email })
  }

  // Bounce, reclamação, falha de envio ou supressão — grava o estado e alerta, mas não tenta
  // reenviar sozinho: geralmente significa e-mail inválido/errado, decisão de como resolver
  // fica com o admin.
  const motivo = evento.data.bounce?.message ?? evento.data.bounce?.type ?? evento.data.failed?.reason ?? evento.type
  const { error: erroFalha } = await supabaseAdmin
    .from(tabela)
    .update({ status_provisionamento: 'falhou', ultimo_erro: `Resend: ${motivo}` })
    .eq('email', registro.email)
  if (erroFalha) {
    console.error(`[webhook-resend] Erro ao gravar falha de ${registro.email}:`, erroFalha.message)
    return NextResponse.json({ error: 'Erro ao gravar falha' }, { status: 500 })
  }

  await sendAlertaAdminEmail({
    assunto: 'E-mail de acesso não entregue (bounce/reclamação)',
    contexto: {
      'E-mail do comprador': registro.email,
      Nome: registro.nome,
      Evento: evento.type,
      Motivo: motivo,
    },
  }).catch(alertaErr => console.error('[webhook-resend] Erro ao enviar alerta:', alertaErr))

  console.warn(`[webhook-resend] E-mail de acesso não entregue: ${registro.email} (${evento.type})`)
  return NextResponse.json({ ok: true, action: 'falha-registrada', email: registro.email })
}
