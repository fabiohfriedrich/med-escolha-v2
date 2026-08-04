import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const supabase = getSupabaseAdmin()

export async function POST(req: NextRequest) {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { nome, resultadoId, meses } = await req.json()

  if (!meses) {
    return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
  }

  const dataAgendada = new Date()
  dataAgendada.setMonth(dataAgendada.getMonth() + Number(meses))
  const dataStr = dataAgendada.toISOString().split('T')[0]

  // Cancela agendamento anterior do mesmo email se existir
  await supabase
    .from('agendamentos_reteste')
    .delete()
    .eq('email', email)
    .eq('lembrete_enviado', false)

  const { error } = await supabase.from('agendamentos_reteste').insert({
    email,
    nome,
    resultado_id: resultadoId || null,
    data_agendada: dataStr,
  })

  if (error) {
    console.error('Erro ao agendar reteste:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    data: dataAgendada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
  })
}
