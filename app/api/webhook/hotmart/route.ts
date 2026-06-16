import { NextRequest, NextResponse } from 'next/server'
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

      // Envia convite por email apenas quando a plataforma v2 estiver disponível.
      // Para ativar: defina INVITE_EMAILS_ENABLED=true no .env
      // Cria conta no Supabase Auth com senha padrão (aluno troca no primeiro acesso)
      const senhaDefault = process.env.DEFAULT_USER_PASSWORD ?? 'MedEscolha@2025'
      const { error: authError } = await getSupabaseAdmin().auth.admin.createUser({
        email: emailLower,
        password: senhaDefault,
        user_metadata: { full_name: nome },
        email_confirm: true,
      })
      if (authError && authError.message !== 'User already registered') {
        console.error('[webhook] Erro ao criar usuário:', authError.message)
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
      // Desativa o acesso sem apagar os dados
      const { error } = await getSupabaseAdmin()
        .from('compradores')
        .update({ ativo: false, status_pagamento })
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
