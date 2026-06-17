import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Eventos que liberam o acesso
const EVENTOS_APROVADOS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']
// Eventos que revogam o acesso
const EVENTOS_CANCELADOS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED']

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.medescolha.com'

async function enviarConviteAcesso(emailLower: string, nome: string) {
  const supabase = getSupabaseAdmin()

  // Verifica se usuário já existe no Auth
  const { data: listData } = await supabase.auth.admin.listUsers()
  const jaExiste = listData?.users?.some(u => u.email === emailLower)

  if (jaExiste) {
    // Usuário já tem conta — envia link de redefinição de senha para ele acessar
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: emailLower,
      options: { redirectTo: `${APP_URL}/criar-senha` },
    })
    if (error) console.error('[webhook] Erro ao gerar link recovery:', error.message)
    else console.log(`[webhook] Link de acesso reenviado: ${emailLower}`)
  } else {
    // Usuário novo — convite com link direto para criar senha
    const { error } = await supabase.auth.admin.inviteUserByEmail(emailLower, {
      data: { full_name: nome },
      redirectTo: `${APP_URL}/criar-senha`,
    })
    if (error) console.error('[webhook] Erro ao enviar convite:', error.message)
    else console.log(`[webhook] Convite enviado: ${emailLower}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Valida hottok — token fixo que a Hotmart inclui em todo webhook
    const hottok = process.env.HOTMART_HOTTOK
    if (hottok) {
      const receivedToken = req.headers.get('x-hotmart-hottok') ?? req.nextUrl.searchParams.get('hottok') ?? ''
      if (receivedToken !== hottok) {
        console.warn('[webhook] hottok inválido:', receivedToken)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await req.json()
    const event: string = body?.event ?? ''

    // Ignora eventos que não precisamos processar — retorna 200 para a Hotmart não retentar
    const EVENTOS_CONHECIDOS = [...EVENTOS_APROVADOS, ...EVENTOS_CANCELADOS]
    if (!EVENTOS_CONHECIDOS.includes(event)) {
      return NextResponse.json({ ok: true, action: 'ignorado', event })
    }

    const email: string = body?.data?.buyer?.email ?? ''
    const nome: string = body?.data?.buyer?.name ?? ''
    const transactionId: string = body?.data?.purchase?.transaction ?? ''

    if (!email) {
      console.warn(`[webhook] Evento ${event} sem email no payload`)
      return NextResponse.json({ ok: true, action: 'ignorado', reason: 'sem-email' })
    }

    const emailLower = email.toLowerCase().trim()

    if (EVENTOS_APROVADOS.includes(event)) {
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

      // 2. Envia email de acesso (convite para novo usuário, link recovery para quem já tem conta)
      await enviarConviteAcesso(emailLower, nome)

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
    console.error('[webhook] Erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// A Hotmart também faz um GET para verificar se a URL está ativa
export async function GET() {
  return NextResponse.json({ status: 'Med Escolha webhook ativo' })
}
