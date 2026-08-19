import { NextRequest, NextResponse, after } from 'next/server'
import { z } from 'zod'
import { currentUser } from '@clerk/nextjs/server'
import { calcularMatch, QuizAnswers } from '@/lib/scoring'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendResultEmail } from '@/lib/email'
import { gerarNarrativasTop3 } from '@/lib/narrativa-ia'
import { agendarReteste } from '@/lib/reteste'
import { publicFormRateLimit, getClientIp } from '@/lib/rate-limit'

const MESES_RETESTE_PADRAO = 6

const supabase = getSupabaseAdmin()

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
    const { success } = await publicFormRateLimit.limit(getClientIp(req))
    if (!success) {
      return NextResponse.json({ error: 'Muitas requisições. Tente novamente em instantes.' }, { status: 429 })
    }

    // Exige sessão Clerk e comprador ativo com saldo de testes antes de calcular/gravar
    // resultado. O middleware protege a página /teste, mas não a API — sem essa checagem,
    // uma chamada direta gerava resultado, consumia IA e agendava reteste sem compra.
    const clerkUser = await currentUser()
    const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
    if (!clerkUser || !clerkEmail) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: comprador, error: compradorError } = await supabase
      .from('compradores')
      .select('ativo, testes_realizados, testes_limite')
      .eq('email', clerkEmail)
      .maybeSingle()

    if (compradorError) {
      console.error('[submit] Erro ao verificar comprador:', compradorError)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
    if (!comprador || !comprador.ativo) {
      return NextResponse.json({ error: 'Acesso não encontrado ou inativo' }, { status: 403 })
    }
    if (comprador.testes_realizados >= comprador.testes_limite) {
      return NextResponse.json({ error: 'Limite de testes atingido' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = QuizSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Nome/e-mail sempre vêm da sessão autenticada, nunca do corpo da requisição —
    // evita que alguém grave resultado em nome de outro comprador.
    const answers = {
      ...(parsed.data as QuizAnswers),
      email: clerkEmail,
      nome: parsed.data.nome || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' '),
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
        scoring_version: result.scoring_version,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ result, id: null })
    }

    // Incrementa o contador de testes do comprador
    await supabase.rpc('incrementar_teste', { p_email: answers.email })

    // Motor pós-resultado: radar auto-configurado (opt-out) com o top 3 do resultado, e
    // régua de reteste automática aos 6 meses — nenhum dos dois depende do usuário clicar
    // em nada. O radar só é criado na primeira vez (upsert com ignoreDuplicates) pra não
    // sobrescrever um radar que o usuário já tenha ajustado manualmente; o reteste sempre
    // reagenda pra 6 meses a partir do teste mais recente.
    const top3Ids = result.ranking.slice(0, 3).map((r) => r.id)
    await supabase
      .from('radar_usuario')
      .upsert(
        { user_id: clerkUser.id, especialidade_ids: top3Ids, ufs: [], alertas_ativos: true },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )
    const reteste = await agendarReteste({
      email: answers.email,
      nome: answers.nome,
      resultadoId: data.id,
      meses: MESES_RETESTE_PADRAO,
    })
    if (reteste.error) {
      console.error('[submit] Erro ao agendar reteste automático:', reteste.error)
    }

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
