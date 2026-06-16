import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

export async function POST() {
  const supabaseBrowser = createSupabaseBrowser()
  const { data: { user } } = await supabaseBrowser.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { error } = await getSupabaseAdmin()
    .from('compradores')
    .update({ primeiro_acesso: false })
    .eq('email', user.email.toLowerCase())

  if (error) {
    console.error('[marcar-senha-criada] Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
