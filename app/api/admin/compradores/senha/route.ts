import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json()
  if (!email || !senha) return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
  if (senha.length < 6) return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })

  const admin = getSupabaseAdmin()

  // Busca o usuário auth pelo email
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  const user = users.find(u => u.email === email.toLowerCase().trim())
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado no sistema de autenticação' }, { status: 404 })

  const { error } = await admin.auth.admin.updateUserById(user.id, { password: senha })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
