import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function emailDaSessao(): Promise<string | null> {
  const user = await currentUser()
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() ?? null
}

/**
 * Logado: só autoriza se o item pertencer ao e-mail da sessão. Sem login: já ter
 * o id do item (uuid imprevisível) é suficiente — só se chega até aqui tendo
 * antes passado pela autorização do GET/POST de /api/cronograma.
 */
async function autorizarItem(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data: item } = await supabase
    .from('cronograma_itens')
    .select('email')
    .eq('id', id)
    .single()
  if (!item) return false

  const sessionEmail = await emailDaSessao()
  if (sessionEmail) {
    return item.email?.toLowerCase().trim() === sessionEmail
  }
  return true
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!(await autorizarItem(id))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { status, titulo, dataAlvo } = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status !== undefined) updates.status = status
  if (titulo !== undefined) updates.titulo = titulo
  if (dataAlvo !== undefined) updates.data_alvo = dataAlvo || null

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('cronograma_itens')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!(await autorizarItem(id))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('cronograma_itens')
    .delete()
    .eq('id', id)
    .eq('custom', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
