import { NextRequest, NextResponse } from 'next/server'
import { isPsicologoRequest } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  if (!(await isPsicologoRequest())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { pacote_id, data_call, resumo } = await req.json()

  if (!pacote_id || !data_call || !resumo?.trim()) {
    return NextResponse.json({ error: 'pacote_id, data_call e resumo são obrigatórios' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  // A RPC só incrementa se sessoes_usadas < sessoes_total; retorna null se o pacote já
  // está esgotado, o que usamos como trava contra registrar sessão sem saldo.
  const { data: pacoteAtualizado, error: rpcError } = await supabaseAdmin.rpc('incrementar_sessao_psicologo', {
    p_pacote_id: pacote_id,
  })

  if (rpcError) {
    console.error('[admin-psicologo/registros] Erro ao incrementar sessão:', rpcError)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
  if (!pacoteAtualizado) {
    return NextResponse.json({ error: 'Esse pacote já não tem sessões disponíveis' }, { status: 409 })
  }

  const { data: registro, error: insertError } = await supabaseAdmin
    .from('registros_sessoes_psicologo')
    .insert({ pacote_id, data_call, resumo: resumo.trim() })
    .select('id, pacote_id, data_call, resumo, created_at')
    .single()

  if (insertError) {
    console.error('[admin-psicologo/registros] Erro ao salvar registro:', insertError)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, registro, pacote: pacoteAtualizado })
}
