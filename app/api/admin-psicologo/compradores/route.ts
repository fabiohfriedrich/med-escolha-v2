import { NextResponse } from 'next/server'
import { isPsicologoRequest } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  if (!(await isPsicologoRequest())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { data: pacotes, error: errPacotes } = await supabaseAdmin
    .from('pacotes_psicologo')
    .select('id, nome, email, sessoes_total, sessoes_usadas, ativo, created_at')
    .order('created_at', { ascending: false })

  if (errPacotes) {
    console.error('[admin-psicologo/compradores] Erro ao buscar pacotes:', errPacotes)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  const { data: registros, error: errRegistros } = await supabaseAdmin
    .from('registros_sessoes_psicologo')
    .select('id, pacote_id, data_call, resumo, created_at')
    .order('data_call', { ascending: false })

  if (errRegistros) {
    console.error('[admin-psicologo/compradores] Erro ao buscar registros:', errRegistros)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  const compradores = (pacotes ?? []).map((p) => ({
    ...p,
    saldo: p.sessoes_total - p.sessoes_usadas,
    registros: (registros ?? []).filter((r) => r.pacote_id === p.id),
  }))

  return NextResponse.json({ compradores })
}
