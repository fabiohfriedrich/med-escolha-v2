import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) return NextResponse.json({ permitido: false, motivo: 'Email obrigatório' })

  const emailLower = email.toLowerCase().trim()

  const { data, error } = await supabase
    .from('compradores')
    .select('email, nome, testes_realizados, testes_limite, ativo')
    .eq('email', emailLower)
    .single()

  if (error || !data) {
    return NextResponse.json({ permitido: false, motivo: 'email_nao_encontrado' })
  }

  if (!data.ativo) {
    return NextResponse.json({ permitido: false, motivo: 'acesso_revogado' })
  }

  if (data.testes_realizados >= data.testes_limite) {
    return NextResponse.json({
      permitido: false,
      motivo: 'limite_atingido',
      testes_realizados: data.testes_realizados,
      testes_limite: data.testes_limite,
    })
  }

  return NextResponse.json({
    permitido: true,
    nome: data.nome,
    testes_realizados: data.testes_realizados,
    testes_limite: data.testes_limite,
    testes_restantes: data.testes_limite - data.testes_realizados,
  })
}
