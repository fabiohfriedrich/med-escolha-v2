import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isAdminRequest } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { email, senha } = await req.json()
  if (!email || !senha) return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
  if (senha.length < 6) return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })

  const emailLower = email.toLowerCase().trim()
  const client = await clerkClient()

  // Busca o usuário no Clerk pelo email
  const { data: usuarios } = await client.users.getUserList({ emailAddress: [emailLower] })
  const user = usuarios[0]

  try {
    if (user) {
      await client.users.updateUser(user.id, { password: senha })
    } else {
      // Sem conta no Clerk (ex: falha silenciosa na criação via webhook da Hotmart) — cria agora
      const { data: comprador } = await getSupabaseAdmin()
        .from('compradores')
        .select('nome')
        .eq('email', emailLower)
        .maybeSingle()

      const nome = comprador?.nome ?? ''
      await client.users.createUser({
        emailAddress: [emailLower],
        firstName: nome.split(' ')[0] || undefined,
        lastName: nome.split(' ').slice(1).join(' ') || undefined,
        password: senha,
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao salvar senha'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
