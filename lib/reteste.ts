import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface AgendarRetesteParams {
  email: string
  nome?: string
  resultadoId?: string | null
  meses: number
}

/**
 * Cancela qualquer agendamento não enviado do e-mail e cria um novo. Usado tanto pelo
 * agendamento manual (tela de cronograma) quanto pela régua automática aos 6 meses
 * disparada no envio do teste — reagendar sempre reinicia a contagem a partir do teste
 * mais recente.
 */
export async function agendarReteste({ email, nome, resultadoId, meses }: AgendarRetesteParams) {
  const supabase = getSupabaseAdmin()

  const dataAgendada = new Date()
  dataAgendada.setMonth(dataAgendada.getMonth() + meses)
  const dataStr = dataAgendada.toISOString().split('T')[0]

  const { error: deleteError } = await supabase
    .from('agendamentos_reteste')
    .delete()
    .eq('email', email)
    .eq('lembrete_enviado', false)

  if (deleteError) return { error: deleteError }

  const { error } = await supabase.from('agendamentos_reteste').insert({
    email,
    nome,
    resultado_id: resultadoId || null,
    data_agendada: dataStr,
  })

  if (error) return { error }

  return {
    error: null,
    dataStr,
    dataFormatada: dataAgendada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
  }
}
