import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calcularMatch, QuizAnswers } from '@/lib/scoring'
import { supabase } from '@/lib/supabase'

const QuizSchema = z.object({
  nome: z.string().min(1).max(200).trim(),
  email: z.string().email().toLowerCase().trim(),
  demographics: z.object({
    genero: z.string().min(1).max(50),
    faculdade: z.string().max(200).default(''),
    anoFormatura: z.string().max(10).default(''),
  }),
  c04a: z.record(z.string(), z.boolean()),
  c04b: z.record(z.string(), z.number().min(0).max(10)),
  c02: z.array(z.number().int().nonnegative()),
  jung: z.array(z.string()),
  holland: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = QuizSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const answers = parsed.data as QuizAnswers
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
    await supabase.rpc('incrementar_teste', { p_email: answers.email })

    return NextResponse.json({ result, id: data.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
