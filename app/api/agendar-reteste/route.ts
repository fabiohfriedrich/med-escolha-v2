import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { agendarReteste } from '@/lib/reteste'

const supabase = getSupabaseAdmin()

export async function GET() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data } = await supabase
    .from('agendamentos_reteste')
    .select('data_agendada')
    .eq('email', email)
    .eq('lembrete_enviado', false)
    .order('data_agendada', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) {
    return NextResponse.json({ agendado: false })
  }

  return NextResponse.json({
    agendado: true,
    data: new Date(`${data.data_agendada}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
  })
}

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

  const resultado = await agendarReteste({ email, nome, resultadoId, meses: Number(meses) })

  if (resultado.error) {
    console.error('Erro ao agendar reteste:', resultado.error)
    return NextResponse.json({ error: resultado.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data: resultado.dataFormatada })
}
