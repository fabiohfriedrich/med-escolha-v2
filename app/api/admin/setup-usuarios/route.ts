import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const SENHA_PADRAO = 'Me2026.'

export async function POST(req: NextRequest) {
  // Proteção simples: exige a senha de admin no header
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: compradores, error } = await supabase
    .from('compradores')
    .select('email, nome')
    .eq('ativo', true)

  if (error || !compradores) {
    return NextResponse.json({ error: 'Erro ao buscar compradores' }, { status: 500 })
  }

  const admin = getSupabaseAdmin()
  const resultados: { email: string; status: string }[] = []

  for (const c of compradores) {
    try {
      // Tenta criar — se já existe, atualiza a senha
      const { data: existing } = await admin.auth.admin.listUsers()
      const jaExiste = existing?.users?.find(u => u.email === c.email)

      if (jaExiste) {
        await admin.auth.admin.updateUserById(jaExiste.id, { password: SENHA_PADRAO })
        resultados.push({ email: c.email, status: 'senha_atualizada' })
      } else {
        await admin.auth.admin.createUser({
          email: c.email,
          password: SENHA_PADRAO,
          email_confirm: true,
          user_metadata: { full_name: c.nome },
        })
        resultados.push({ email: c.email, status: 'usuario_criado' })
      }
    } catch (err) {
      resultados.push({ email: c.email, status: `erro: ${err}` })
    }
  }

  return NextResponse.json({ ok: true, total: resultados.length, resultados })
}
