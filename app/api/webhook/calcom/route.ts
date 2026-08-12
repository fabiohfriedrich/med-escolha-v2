import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getPacotesAtivos, proximoPacoteComSaldo } from '@/lib/sessoes-psicologo'

async function assinaturaValida(rawBody: string, assinaturaRecebida: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (hex.length !== assinaturaRecebida.length) return false
  let diff = 0
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ assinaturaRecebida.charCodeAt(i)
  return diff === 0
}

const HORAS_MINIMAS_CANCELAMENTO = 24

export async function POST(req: NextRequest) {
  // A assinatura é calculada sobre os bytes brutos do corpo, não sobre o JSON re-serializado
  const rawBody = await req.text()

  const secret = process.env.CAL_COM_WEBHOOK_SECRET
  if (secret) {
    // TODO: confirmar contra a doc atual do Cal.com o nome exato do header e o formato do hash
    const assinatura = req.headers.get('x-cal-signature-256') ?? ''
    if (!(await assinaturaValida(rawBody, assinatura, secret))) {
      console.warn('[calcom] Assinatura inválida')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = JSON.parse(rawBody)
  const triggerEvent: string = body?.triggerEvent ?? ''
  // TODO: confirmar path exato do uid do booking e do e-mail do attendee no payload real do Cal.com
  const bookingUid: string = body?.payload?.uid ?? ''
  const email: string = (body?.payload?.attendees?.[0]?.email ?? '').toLowerCase().trim()
  const eventStartAt: string | null = body?.payload?.startTime ?? null

  if (!bookingUid || !email) {
    return NextResponse.json({ ok: true, action: 'ignorado', reason: 'payload incompleto' })
  }

  const supabaseAdmin = getSupabaseAdmin()

  if (triggerEvent === 'BOOKING_CREATED') {
    // Insert funciona como lock de idempotência: se já existe esse uid, é retry do Cal.com, ignora.
    const { error: insertError } = await supabaseAdmin
      .from('agendamentos_psicologo')
      .insert({ cal_booking_uid: bookingUid, email, status: 'pendente', event_start_at: eventStartAt })

    if (insertError) {
      if (insertError.code === '23505') return NextResponse.json({ ok: true, action: 'duplicado' })
      console.error('[calcom] Erro ao registrar booking:', insertError)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    const pacotes = await getPacotesAtivos(email)
    const pacote = proximoPacoteComSaldo(pacotes)

    if (!pacote) {
      // Não deveria acontecer via UI (o link só aparece com saldo > 0), mas se alguém usou o link
      // público direto sem saldo, fica registrado aqui pra ação manual. Sem cancelamento
      // automático via API do Cal.com nesta versão.
      await supabaseAdmin.from('agendamentos_psicologo').update({ status: 'sem_saldo' }).eq('cal_booking_uid', bookingUid)
      console.warn(`[calcom] Booking sem saldo disponível: ${email} (${bookingUid}), ação manual necessária`)
      return NextResponse.json({ ok: true, action: 'sem_saldo', email })
    }

    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('incrementar_sessao_psicologo', {
      p_pacote_id: pacote.id,
    })

    if (rpcError || !rpcData) {
      // Corrida rara: saldo zerou entre a leitura e o incremento, mesmo tratamento do caso acima.
      await supabaseAdmin.from('agendamentos_psicologo').update({ status: 'sem_saldo' }).eq('cal_booking_uid', bookingUid)
      return NextResponse.json({ ok: true, action: 'sem_saldo', email })
    }

    await supabaseAdmin
      .from('agendamentos_psicologo')
      .update({ status: 'confirmado', pacote_id: pacote.id })
      .eq('cal_booking_uid', bookingUid)

    return NextResponse.json({ ok: true, action: 'confirmado', email })
  }

  if (triggerEvent === 'BOOKING_CANCELLED') {
    const { data: log } = await supabaseAdmin
      .from('agendamentos_psicologo')
      .select('id, pacote_id, status, event_start_at')
      .eq('cal_booking_uid', bookingUid)
      .maybeSingle()

    if (!log || log.status !== 'confirmado' || !log.pacote_id) {
      return NextResponse.json({ ok: true, action: 'ignorado' })
    }

    const horasAteSessao = log.event_start_at
      ? (new Date(log.event_start_at).getTime() - Date.now()) / (1000 * 60 * 60)
      : 0
    const devolveCredito = horasAteSessao >= HORAS_MINIMAS_CANCELAMENTO

    if (devolveCredito) {
      await supabaseAdmin.rpc('decrementar_sessao_psicologo', { p_pacote_id: log.pacote_id })
    }

    await supabaseAdmin
      .from('agendamentos_psicologo')
      .update({ status: 'cancelado', credito_devolvido: devolveCredito })
      .eq('cal_booking_uid', bookingUid)

    return NextResponse.json({ ok: true, action: devolveCredito ? 'credito_devolvido' : 'sem_devolucao' })
  }

  return NextResponse.json({ ok: true, action: 'ignorado', triggerEvent })
}

// Health-check manual (Cal.com não faz GET automático, mas é útil pra testar se a rota está no ar)
export async function GET() {
  return NextResponse.json({ status: 'Cal.com webhook ativo' })
}
