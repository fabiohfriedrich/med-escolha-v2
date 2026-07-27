import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()
  const resultadoId = req.nextUrl.searchParams.get('resultadoId')

  if (!email) {
    return NextResponse.json({ error: 'email é obrigatório' }, { status: 400 })
  }

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
    resultado_id: resultadoId || null,
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
  const { email, resultadoId, stepNum, titulo, dataAlvo } = await req.json()

  if (!email || !stepNum || !titulo) {
    return NextResponse.json({ error: 'email, stepNum e titulo são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cronograma_itens')
    .insert({
      email: email.toLowerCase().trim(),
      resultado_id: resultadoId || null,
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
