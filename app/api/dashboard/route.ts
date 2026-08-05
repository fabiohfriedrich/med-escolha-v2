import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { obterOuSemearItens } from '@/lib/cronograma'
import specialtiesData from '@/data/specialties.json'
import {
  ordenarEditais,
  editalCorrespondeAoRadar,
  especialidadesEmComum,
  diasAte,
  type EditalComInstituicao,
  type RadarConfig,
} from '@/lib/radar'

const NOME_ESPECIALIDADE: Record<number, string> = Object.fromEntries(
  (specialtiesData.specialties as { id: number; nome: string }[]).map((s) => [s.id, s.nome])
)

function fraseEdital(edital: EditalComInstituicao): string {
  const nome = edital.instituicao.sigla || edital.instituicao.nome
  if (edital.status === 'aberto') {
    if (edital.inscricao_fim) {
      const dias = diasAte(edital.inscricao_fim)
      if (dias >= 0 && dias <= 10) {
        if (dias === 0) return `${nome} encerra inscrições hoje`
        if (dias === 1) return `${nome} encerra inscrições amanhã`
        return `${nome} encerra inscrições em ${dias} dias`
      }
    }
    return `${nome} com inscrições abertas`
  }
  if (edital.inscricao_inicio) {
    const dias = diasAte(edital.inscricao_inicio)
    if (dias >= 0) {
      if (dias === 0) return `${nome} abre inscrições hoje`
      if (dias === 1) return `${nome} abre inscrições amanhã`
      return `${nome} abre inscrições em ${dias} dias`
    }
  }
  return `${nome} · fique de olho`
}

function subtituloEdital(edital: EditalComInstituicao, especialidadeIds: number[]): string {
  const uf = edital.instituicao.uf
  const matchIds = especialidadesEmComum(edital, especialidadeIds)
  if (matchIds.length > 0) {
    const nome = NOME_ESPECIALIDADE[matchIds[0]]
    if (nome) return `Vagas de ${nome}${uf ? ` · ${uf}` : ''}`
  }
  return uf ? `Edital · ${uf}` : 'Edital nacional'
}

export async function GET() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!user || !email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const [{ data: resultados }, { data: radarUsuario }, { data: editaisData }, { data: reteste }, { data: comprador }] = await Promise.all([
    supabase
      .from('resultados')
      .select('id, created_at, ranking_json')
      .eq('email', email)
      .order('created_at', { ascending: false }),
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
    supabase.from('compradores').select('codigo_indicacao').eq('email', email).maybeSingle(),
  ])

  const ultimoResultado = resultados?.[0] ?? null
  const top3 = ((ultimoResultado?.ranking_json ?? []) as Array<{ id: number; nome: string; pct: number }>).slice(0, 3)

  let proximoEdital: { frase: string; subtitulo: string; totalRelevantes: number } | null = null
  if (radarUsuario) {
    const config: RadarConfig = { especialidade_ids: radarUsuario.especialidade_ids ?? [], ufs: radarUsuario.ufs ?? [] }
    const editais = (editaisData ?? []) as unknown as EditalComInstituicao[]
    const relevantes = ordenarEditais(editais).filter((e) => editalCorrespondeAoRadar(e, config))
    const primeiro = relevantes[0]
    if (primeiro) {
      proximoEdital = {
        frase: fraseEdital(primeiro),
        subtitulo: subtituloEdital(primeiro, config.especialidade_ids),
        totalRelevantes: relevantes.length,
      }
    }
  }

  let cronograma = { total: 0, concluidos: 0, itens: [] as Array<{ id: string; titulo: string; status: string; step_num: number }> }
  if (ultimoResultado) {
    const { itens } = await obterOuSemearItens(email, ultimoResultado.id)
    if (itens) {
      cronograma = { total: itens.length, concluidos: itens.filter((i) => i.status === 'concluido').length, itens }
    }
  }

  let indicacoesConfirmadas = 0
  if (comprador?.codigo_indicacao) {
    const { count } = await supabase
      .from('indicacoes')
      .select('id', { count: 'exact', head: true })
      .eq('codigo_indicacao', comprador.codigo_indicacao)
    indicacoesConfirmadas = count ?? 0
  }

  return NextResponse.json({
    ultimoResultado: ultimoResultado ? { id: ultimoResultado.id, createdAt: ultimoResultado.created_at, top3 } : null,
    totalTestes: resultados?.length ?? 0,
    radar: radarUsuario ? { ativo: radarUsuario.alertas_ativos } : null,
    proximoEdital,
    reteste: reteste
      ? { agendado: true, data: new Date(`${reteste.data_agendada}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }
      : { agendado: false },
    cronograma,
    indicacao: { codigo: comprador?.codigo_indicacao ?? null, confirmadas: indicacoesConfirmadas, meta: 3 },
  })
}
