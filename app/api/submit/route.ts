import { NextRequest, NextResponse, after } from 'next/server'
import { z } from 'zod'
import { calcularMatch, QuizAnswers } from '@/lib/scoring'
import { supabase } from '@/lib/supabase'
import { sendResultEmail } from '@/lib/email'
import { gerarNarrativasTop3 } from '@/lib/narrativa-ia'

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

    // Gera a narrativa personalizada do top 3 via IA. Bloqueia a resposta (a UI já
    // mostra o resultado logo em seguida), mas com timeout curto embutido no fallback:
    // se falhar ou não houver ANTHROPIC_API_KEY, retorna null e a UI usa o texto template.
    const narrativaIA = await gerarNarrativasTop3({
      nome: answers.nome,
      demographics: answers.demographics,
      hollandList: answers.holland,
      jungSelected: answers.jung,
      c04bAnswers: answers.c04b,
      top3: result.ranking.slice(0, 3),
    })

    if (narrativaIA) {
      await supabase.from('resultados').update({ narrativa_ia: narrativaIA }).eq('id', data.id)
    }

    // Envia o e-mail do resultado em background (não atrasa a resposta pro usuário).
    // O cron diário serve de rede de segurança caso esse envio falhe.
    after(async () => {
      try {
        await sendResultEmail({
          resultadoId: data.id,
          nome: answers.nome,
          email: answers.email,
          ranking: result.ranking,
        })
        await supabase
          .from('resultados')
          .update({ email_enviado: true, email_enviado_at: new Date().toISOString() })
          .eq('id', data.id)
      } catch (emailErr) {
        console.error('[submit] Erro ao enviar email de resultado:', emailErr)
      }
    })

    return NextResponse.json({ result, id: data.id, narrativaIA })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
