import { NextRequest, NextResponse } from 'next/server'
import { calcularMatch, QuizAnswers } from '@/lib/scoring'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const answers: QuizAnswers = await req.json()

    if (!answers.nome || !answers.email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
    }

    const result = calcularMatch(answers)

    const { data, error } = await supabase
      .from('resultados')
      .insert({
        nome: answers.nome,
        email: answers.email,
        answers_json: answers,
        ranking_json: result.ranking,
        perfil_json: result.perfil,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ result, id: null })
    }

    // Incrementa o contador de testes do comprador
    await supabase.rpc('incrementar_teste', { p_email: answers.email.toLowerCase().trim() })

    return NextResponse.json({ result, id: data.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
