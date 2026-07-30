import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isAdminRequest } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, sigla, uf, site, tipo } = await req.json()
  if (!nome || !sigla || !site || !tipo) {
    return NextResponse.json({ error: 'nome, sigla, site e tipo são obrigatórios' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('instituicoes')
    .insert({ nome, sigla, uf: uf || null, site, tipo })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}
