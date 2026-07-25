import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json()
  if (!email || !senha) return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
  if (senha.length < 6) return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })

  const emailLower = email.toLowerCase().trim()
  const client = await clerkClient()

  // Busca o usuário no Clerk pelo email
  const { data: usuarios } = await client.users.getUserList({ emailAddress: [emailLower] })
  const user = usuarios[0]
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado no sistema de autenticação' }, { status: 404 })

  try {
    await client.users.updateUser(user.id, { password: senha })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar senha'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
