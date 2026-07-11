import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const email = user.primaryEmailAddress?.emailAddress

  if (!email) {
    return NextResponse.json({ error: 'Usuário sem e-mail principal' }, { status: 400 })
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: { mustChangePassword: null },
  })

  const { error } = await getSupabaseAdmin()
    .from('compradores')
    .update({ primeiro_acesso: false })
    .eq('email', email.toLowerCase())

  if (error) {
    console.error('[marcar-senha-criada] Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
