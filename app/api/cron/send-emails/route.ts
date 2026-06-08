import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendResultEmail } from '@/lib/email'

// Horário de envio: 9h–18h, segunda a sexta, horário de Brasília (UTC-3)
function dentroDoHorario(): boolean {
  const agora = new Date()
  // Converter para horário de Brasília
  const brasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const hora = brasilia.getHours()
  const diaSemana = brasilia.getDay() // 0=dom, 1=seg, ..., 5=sex, 6=sab
  const ehDiaUtil = diaSemana >= 1 && diaSemana <= 5
  const ehHorarioUtil = hora >= 9 && hora < 18
  return ehDiaUtil && ehHorarioUtil
}

export async function GET(req: NextRequest) {
  // Verificar token de segurança (para evitar chamadas externas)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!dentroDoHorario()) {
    return NextResponse.json({ ok: true, message: 'Fora do horário de envio (seg–sex 9h–18h)' })
  }

  // Buscar resultados com email pendente (criados há mais de 2 minutos)
  const { data: pendentes, error } = await supabase
    .from('resultados')
    .select('id, nome, email, ranking_json')
    .eq('email_enviado', false)
    .lt('created_at', new Date(Date.now() - 2 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })
    .limit(20) // máx 20 por execução

  if (error) {
    console.error('[cron] Erro ao buscar pendentes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!pendentes || pendentes.length === 0) {
    return NextResponse.json({ ok: true, message: 'Nenhum email pendente', enviados: 0 })
  }

  let enviados = 0
  let erros = 0

  for (const resultado of pendentes) {
    try {
      await sendResultEmail({
        resultadoId: resultado.id,
        nome: resultado.nome,
        email: resultado.email,
        ranking: resultado.ranking_json || [],
      })

      await supabase
        .from('resultados')
        .update({ email_enviado: true, email_enviado_at: new Date().toISOString() })
        .eq('id', resultado.id)

      enviados++
      console.log(`[cron] Email enviado: ${resultado.email}`)
    } catch (err) {
      erros++
      console.error(`[cron] Erro ao enviar para ${resultado.email}:`, err)
    }
  }

  // ── Lembretes de reteste ─────────────────────────────────────────────────
  const hoje = new Date().toISOString().split('T')[0]
  const { data: retestes } = await supabase
    .from('agendamentos_reteste')
    .select('id, email, nome, resultado_id')
    .eq('lembrete_enviado', false)
    .lte('data_agendada', hoje)
    .limit(20)

  let lembretes = 0
  for (const r of retestes || []) {
    try {
      const { sendRetesteEmail } = await import('@/lib/email')
      await sendRetesteEmail({ email: r.email, nome: r.nome || 'Aluno' })
      await supabase
        .from('agendamentos_reteste')
        .update({ lembrete_enviado: true, lembrete_enviado_at: new Date().toISOString() })
        .eq('id', r.id)
      lembretes++
      console.log(`[cron] Lembrete reteste enviado: ${r.email}`)
    } catch (err) {
      console.error(`[cron] Erro lembrete ${r.email}:`, err)
    }
  }

  return NextResponse.json({ ok: true, enviados, erros, total: pendentes.length, lembretes })
}
