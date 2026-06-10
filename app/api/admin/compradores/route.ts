import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Adicionar comprador manualmente
export async function POST(req: NextRequest) {
  const { email, nome, tipo, notas, testes_limite } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const { error } = await supabase
    .from('compradores')
    .upsert({
      email: email.toLowerCase().trim(),
      nome,
      tipo: tipo ?? 'comprador',
      notas: notas ?? null,
      testes_limite: testes_limite ?? 2,
      status_pagamento: tipo === 'parceria' || tipo === 'cortesia' ? 'pago' : 'pago',
      ativo: true,
    }, { onConflict: 'email' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Atualizar comprador (ativar/desativar ou resetar testes)
export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const { error } = await supabase.from('compradores').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
