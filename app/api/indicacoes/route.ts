import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const META_INDICACOES = 3

export async function GET() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!email) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const supabase = getSupabaseAdmin()

  const { data: comprador } = await supabase
    .from('compradores')
    .select('codigo_indicacao')
    .eq('email', email)
    .maybeSingle()

  if (!comprador?.codigo_indicacao) {
    return NextResponse.json({ codigo: null, confirmadas: 0, meta: META_INDICACOES, desbloqueado: false })
  }

  const { count } = await supabase
    .from('indicacoes')
    .select('id', { count: 'exact', head: true })
    .eq('codigo_indicacao', comprador.codigo_indicacao)

  const confirmadas = count ?? 0

  return NextResponse.json({
    codigo: comprador.codigo_indicacao,
    confirmadas,
    meta: META_INDICACOES,
    desbloqueado: confirmadas >= META_INDICACOES,
  })
}
