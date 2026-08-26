import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { obterOuSemearItens } from '@/lib/cronograma'

async function emailDaSessao(): Promise<string | null> {
  const user = await currentUser()
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() ?? null
}

/**
 * Logado: usa o e-mail da própria sessão, e só associa ao resultadoId se ele
 * realmente pertencer a esse usuário. Sem login: o resultadoId funciona como
 * "chave secreta" (mesmo UUID imprevisível que já protege /resultado/[id]) — cobre
 * quem acabou de fazer o teste em /teste sem ter criado conta ainda.
 */
async function autorizar(resultadoId: string | null): Promise<{ email: string; resultadoId: string | null } | null> {
  const sessionEmail = await emailDaSessao()

  if (resultadoId) {
    const supabase = getSupabaseAdmin()
    const { data: resultado } = await supabase
      .from('resultados')
      .select('email')
      .eq('id', resultadoId)
      .single()
    const dono = resultado?.email?.toLowerCase().trim()

    if (sessionEmail) {
      return { email: sessionEmail, resultadoId: dono === sessionEmail ? resultadoId : null }
    }
    return dono ? { email: dono, resultadoId } : null
  }

  return sessionEmail ? { email: sessionEmail, resultadoId: null } : null
}

export async function GET(req: NextRequest) {
  const auth = await autorizar(req.nextUrl.searchParams.get('resultadoId'))
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { itens, error } = await obterOuSemearItens(auth.email, auth.resultadoId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ itens })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const auth = await autorizar(body.resultadoId || null)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { email, resultadoId } = auth
  const supabase = getSupabaseAdmin()

  const { stepNum, titulo, dataAlvo } = body
  if (!stepNum || !titulo) {
    return NextResponse.json({ error: 'stepNum e titulo são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cronograma_itens')
    .insert({
      email,
      resultado_id: resultadoId,
      step_num: stepNum,
      titulo,
      data_alvo: dataAlvo || null,
      custom: true,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}
