import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const supabase = getSupabaseAdmin()

type StepDefault = { step_num: number; titulo: string }

function defaultSteps(top3Nomes: string[]): StepDefault[] {
  const especialidades = top3Nomes.length > 0 ? top3Nomes.join(', ') : 'suas especialidades mais compatíveis'
  return [
    { step_num: 1, titulo: `Ler conteúdo do Amo Medicina sobre ${especialidades}` },
    { step_num: 2, titulo: 'Buscar um depoimento ou dia de job shadowing com um especialista' },
    { step_num: 3, titulo: 'Comparar o ranking completo de especialidades do seu resultado' },
    { step_num: 4, titulo: 'Agendar o próximo reteste' },
  ]
}

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
  const { email, resultadoId } = auth

  const query = supabase
    .from('cronograma_itens')
    .select('*')
    .eq('email', email)
    .order('step_num', { ascending: true })
    .order('ordem', { ascending: true })

  const { data: existentes, error } = resultadoId
    ? await query.eq('resultado_id', resultadoId)
    : await query.is('resultado_id', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (existentes && existentes.length > 0) {
    return NextResponse.json({ itens: existentes })
  }

  // Sem itens ainda: semeia os passos padrão
  let top3Nomes: string[] = []
  if (resultadoId) {
    const { data: resultado } = await supabase
      .from('resultados')
      .select('ranking_json')
      .eq('id', resultadoId)
      .single()
    const ranking = (resultado?.ranking_json ?? []) as Array<{ nome: string }>
    top3Nomes = ranking.slice(0, 3).map(e => e.nome)
  }

  const seeds = defaultSteps(top3Nomes).map(s => ({
    email,
    resultado_id: resultadoId,
    step_num: s.step_num,
    titulo: s.titulo,
    ordem: 0,
    custom: false,
  }))

  const { data: inseridos, error: insertError } = await supabase
    .from('cronograma_itens')
    .insert(seeds)
    .select('*')

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ itens: inseridos })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const auth = await autorizar(body.resultadoId || null)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { email, resultadoId } = auth

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
