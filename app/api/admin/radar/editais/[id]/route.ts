import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isAdminRequest } from '@/lib/admin-auth'

const CAMPOS_EDITAVEIS = [
  'status', 'link_oficial', 'inscricao_inicio', 'inscricao_fim',
  'taxa', 'etapas', 'data_prova', 'data_gabarito', 'data_resultado', 'observacoes', 'temporada',
] as const

interface VagaInput {
  especialidade_id: number
  vagas: number | null
  acesso_direto: boolean
}

// Atualiza os campos do edital e, se vier `vagas` no body, substitui a lista inteira de
// edital_vagas por ela (mais simples pro admin: um único "salvar" cobre o edital e suas vagas).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const supabase = getSupabaseAdmin()

  const updates: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  for (const campo of CAMPOS_EDITAVEIS) {
    if (body[campo] !== undefined) updates[campo] = body[campo] === '' ? null : body[campo]
  }

  const { error: updateError } = await supabase.from('editais').update(updates).eq('id', id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  if (Array.isArray(body.vagas)) {
    const vagas = body.vagas as VagaInput[]
    const { error: deleteError } = await supabase.from('edital_vagas').delete().eq('edital_id', id)
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

    if (vagas.length > 0) {
      const { error: insertError } = await supabase.from('edital_vagas').insert(
        vagas.map((v) => ({ edital_id: id, especialidade_id: v.especialidade_id, vagas: v.vagas, acesso_direto: !!v.acesso_direto }))
      )
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('editais').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
