import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { provisionarAcesso } from '@/lib/provisionamento'
import { isAdminRequest } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const emailLower = email.toLowerCase().trim()
  const { data: comprador } = await getSupabaseAdmin()
    .from('compradores')
    .select('nome')
    .eq('email', emailLower)
    .maybeSingle()

  const resultado = await provisionarAcesso(emailLower, comprador?.nome ?? '', { forcar: true })
  if (!resultado.ok) return NextResponse.json({ error: 'Falha ao reenviar acesso — veja o alerta enviado por e-mail' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
