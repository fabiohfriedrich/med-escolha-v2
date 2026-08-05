import { getSupabaseAdmin } from '@/lib/supabase-admin'

export interface ItemCronograma {
  id: string
  step_num: number
  titulo: string
  status: 'pendente' | 'em_andamento' | 'concluido'
  data_alvo: string | null
  custom: boolean
}

function defaultSteps(top3Nomes: string[]) {
  const especialidades = top3Nomes.length > 0 ? top3Nomes.join(', ') : 'suas especialidades mais compatíveis'
  return [
    { step_num: 1, titulo: `Ler conteúdo do Amo Medicina sobre ${especialidades}` },
    { step_num: 2, titulo: 'Buscar um depoimento ou dia de job shadowing com um especialista' },
    { step_num: 3, titulo: 'Comparar o ranking completo de especialidades do seu resultado' },
    { step_num: 4, titulo: 'Agendar o próximo reteste' },
  ]
}

/**
 * Busca os itens do cronograma do usuário e, se ainda não existirem, semeia os passos
 * padrão. Extraído pra lib porque tanto /api/cronograma (aba detalhada) quanto
 * /api/dashboard (checklist resumido) precisam do mesmo comportamento — o dashboard virou
 * a aba padrão, então pode ser o primeiro lugar que o usuário visita, sem passar pela
 * aba cronograma que fazia a semeadura antes.
 */
export async function obterOuSemearItens(
  email: string,
  resultadoId: string | null
): Promise<{ itens: ItemCronograma[] | null; error: { message: string } | null }> {
  const supabase = getSupabaseAdmin()
  const query = supabase
    .from('cronograma_itens')
    .select('*')
    .eq('email', email)
    .order('step_num', { ascending: true })
    .order('ordem', { ascending: true })

  const { data: existentes, error } = resultadoId
    ? await query.eq('resultado_id', resultadoId)
    : await query.is('resultado_id', null)

  if (error) return { itens: null, error }
  if (existentes && existentes.length > 0) return { itens: existentes, error: null }

  let top3Nomes: string[] = []
  if (resultadoId) {
    const { data: resultado } = await supabase.from('resultados').select('ranking_json').eq('id', resultadoId).single()
    const ranking = (resultado?.ranking_json ?? []) as Array<{ nome: string }>
    top3Nomes = ranking.slice(0, 3).map((e) => e.nome)
  }

  const seeds = defaultSteps(top3Nomes).map((s) => ({
    email,
    resultado_id: resultadoId,
    step_num: s.step_num,
    titulo: s.titulo,
    ordem: 0,
    custom: false,
  }))

  const { data: inseridos, error: insertError } = await supabase.from('cronograma_itens').insert(seeds).select('*')
  return { itens: inseridos, error: insertError }
}
