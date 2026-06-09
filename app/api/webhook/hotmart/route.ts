import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Eventos que liberam o acesso
const EVENTOS_APROVADOS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']
// Eventos que revogam o acesso
const EVENTOS_CANCELADOS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const event: string = body?.event ?? ''
    const email: string = body?.data?.buyer?.email ?? ''
    const nome: string = body?.data?.buyer?.name ?? ''
    const transactionId: string = body?.data?.purchase?.transaction ?? ''

    if (!email) {
      return NextResponse.json({ error: 'Email não encontrado no payload' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()

    if (EVENTOS_APROVADOS.includes(event)) {
      // Upsert: cria o comprador ou, se já existe, garante que está ativo
      const { error } = await supabase
        .from('compradores')
        .upsert(
          {
            email: emailLower,
            nome,
            hotmart_transaction_id: transactionId,
            ativo: true,
          },
          { onConflict: 'email', ignoreDuplicates: false }
        )

      if (error) {
        console.error('Supabase upsert error:', error)
        return NextResponse.json({ error: 'Erro ao salvar comprador' }, { status: 500 })
      }

      // Envia convite por email apenas quando a plataforma v2 estiver disponível.
      // Para ativar: defina INVITE_EMAILS_ENABLED=true no .env
      if (process.env.INVITE_EMAILS_ENABLED === 'true') {
        const { error: inviteError } = await getSupabaseAdmin().auth.admin.inviteUserByEmail(emailLower, {
          data: { full_name: nome },
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        })
        if (inviteError && inviteError.message !== 'User already registered') {
          console.error('[webhook] Erro ao convidar usuário:', inviteError.message)
        }
      }

      console.log(`[webhook] Comprador liberado: ${emailLower} (${event})`)
      return NextResponse.json({ ok: true, action: 'liberado', email: emailLower })
    }

    if (EVENTOS_CANCELADOS.includes(event)) {
      // Desativa o acesso sem apagar os dados
      const { error } = await supabase
        .from('compradores')
        .update({ ativo: false })
        .eq('email', emailLower)

      if (error) console.error('Supabase update error:', error)

      console.log(`[webhook] Acesso revogado: ${emailLower} (${event})`)
      return NextResponse.json({ ok: true, action: 'revogado', email: emailLower })
    }

    // Evento ignorado (ex: PURCHASE_BILLET_PRINTED, etc.)
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
