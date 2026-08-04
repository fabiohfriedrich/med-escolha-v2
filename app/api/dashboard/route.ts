import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { ordenarEditais, editalCorrespondeAoRadar, getStatusVisual, type EditalComInstituicao, type RadarConfig } from '@/lib/radar'

export async function GET() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!user || !email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const [{ data: resultados }, { data: radarUsuario }, { data: editaisData }, { data: reteste }] = await Promise.all([
    supabase
      .from('resultados')
      .select('id, created_at, ranking_json')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('radar_usuario')
      .select('especialidade_ids, ufs, alertas_ativos')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('editais')
      .select('*, instituicao:instituicoes(*), edital_vagas(*)')
      .in('status', ['aberto', 'previsto']),
    supabase
      .from('agendamentos_reteste')
      .select('data_agendada')
      .eq('email', email)
      .eq('lembrete_enviado', false)
      .order('data_agendada', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const ultimoResultado = resultados?.[0] ?? null
  const top3 = ((ultimoResultado?.ranking_json ?? []) as Array<{ id: number; nome: string; pct: number }>).slice(0, 3)

  let proximoEdital: { instituicao: string; uf: string | null; status: ReturnType<typeof getStatusVisual> } | null = null
  if (radarUsuario) {
    const config: RadarConfig = { especialidade_ids: radarUsuario.especialidade_ids ?? [], ufs: radarUsuario.ufs ?? [] }
    const editais = (editaisData ?? []) as unknown as EditalComInstituicao[]
    const relevantes = ordenarEditais(editais).filter((e) => editalCorrespondeAoRadar(e, config))
    const primeiro = relevantes[0]
    if (primeiro) {
      proximoEdital = {
        instituicao: primeiro.instituicao.nome,
        uf: primeiro.instituicao.uf,
        status: getStatusVisual(primeiro),
      }
    }
  }

  let cronograma = { total: 0, concluidos: 0 }
  if (ultimoResultado) {
    const { data: itens } = await supabase
      .from('cronograma_itens')
      .select('status')
      .eq('email', email)
      .eq('resultado_id', ultimoResultado.id)
    if (itens) {
      cronograma = { total: itens.length, concluidos: itens.filter((i) => i.status === 'concluido').length }
    }
  }

  return NextResponse.json({
    ultimoResultado: ultimoResultado ? { id: ultimoResultado.id, createdAt: ultimoResultado.created_at, top3 } : null,
    radar: radarUsuario ? { ativo: radarUsuario.alertas_ativos, total: radarUsuario.especialidade_ids?.length ?? 0 } : null,
    proximoEdital,
    reteste: reteste
      ? { agendado: true, data: new Date(`${reteste.data_agendada}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }
      : { agendado: false },
    cronograma,
  })
}
