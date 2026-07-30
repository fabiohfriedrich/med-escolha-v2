import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isAdminRequest } from '@/lib/admin-auth'

// Cria um edital novo. Se vier duplicateFromId, copia a instituição e as especialidades
// (com vagas zeradas) de um edital existente, resetando status/datas/taxa pra começar limpo
// numa temporada nova.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const supabase = getSupabaseAdmin()

  if (body.duplicateFromId) {
    const { data: original, error: origError } = await supabase
      .from('editais')
      .select('instituicao_id, edital_vagas(especialidade_id, acesso_direto)')
      .eq('id', body.duplicateFromId)
      .single()

    if (origError || !original) return NextResponse.json({ error: origError?.message ?? 'Edital original não encontrado' }, { status: 404 })
    if (!body.temporada) return NextResponse.json({ error: 'Informe a temporada do novo edital' }, { status: 400 })

    const { data: novo, error: novoError } = await supabase
      .from('editais')
      .insert({ instituicao_id: original.instituicao_id, temporada: body.temporada, status: 'previsto' })
      .select('id')
      .single()

    if (novoError || !novo) return NextResponse.json({ error: novoError?.message }, { status: 500 })

    const vagasOriginais = (original.edital_vagas ?? []) as Array<{ especialidade_id: number; acesso_direto: boolean }>
    if (vagasOriginais.length > 0) {
      await supabase.from('edital_vagas').insert(
        vagasOriginais.map((v) => ({ edital_id: novo.id, especialidade_id: v.especialidade_id, acesso_direto: v.acesso_direto, vagas: null }))
      )
    }

    return NextResponse.json({ ok: true, id: novo.id })
  }

  const { instituicao_id, temporada } = body
  if (!instituicao_id || !temporada) {
    return NextResponse.json({ error: 'instituicao_id e temporada são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('editais')
    .insert({ instituicao_id, temporada, status: 'previsto' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}
