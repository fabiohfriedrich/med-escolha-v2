import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendRadarAlertaEmail } from '@/lib/email'
import specialtiesData from '@/data/specialties.json'
import {
  editalCorrespondeAoRadar,
  especialidadesEmComum,
  alertaNovoEditalDevido,
  alertaInscricaoAbriuDevido,
  alertaUltimosDiasDevido,
  alertaVesperaProvaDevido,
  diasAte,
  type EditalComInstituicao,
  type RadarConfig,
  type TipoAlerta,
} from '@/lib/radar'

const SPECIALTIES = specialtiesData.specialties as { id: number; nome: string }[]
const NOME_ESPECIALIDADE: Record<number, string> = Object.fromEntries(SPECIALTIES.map((s) => [s.id, s.nome]))

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const [{ data: radaresData, error: radaresError }, { data: editaisData, error: editaisError }, { data: logsData }] = await Promise.all([
    supabase.from('radar_usuario').select('user_id, especialidade_ids, ufs').eq('alertas_ativos', true),
    supabase.from('editais').select('*, instituicao:instituicoes(*), edital_vagas(*)'),
    supabase.from('alertas_log').select('user_id, edital_id, tipo_alerta'),
  ])

  if (radaresError || editaisError) {
    console.error('[cron radar-alertas] erro ao carregar dados:', radaresError?.message, editaisError?.message)
    return NextResponse.json({ error: radaresError?.message ?? editaisError?.message }, { status: 500 })
  }

  const radares = radaresData ?? []
  const editais = (editaisData ?? []) as unknown as EditalComInstituicao[]
  const jaEnviados = new Set((logsData ?? []).map((l) => `${l.user_id}|${l.edital_id}|${l.tipo_alerta}`))

  if (radares.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0, usuarios: 0 })
  }

  const clerk = await clerkClient()
  const { data: usuarios } = await clerk.users.getUserList({
    userId: radares.map((r) => r.user_id),
    limit: radares.length,
  })
  const usuarioPorId = new Map(usuarios.map((u) => [u.id, u]))

  const hoje = new Date()
  let enviados = 0
  const erros: string[] = []

  for (const radar of radares) {
    const usuario = usuarioPorId.get(radar.user_id)
    const email = usuario?.primaryEmailAddress?.emailAddress
    if (!email) continue
    const nome = usuario?.firstName || 'colega'

    const config: RadarConfig = { especialidade_ids: radar.especialidade_ids ?? [], ufs: radar.ufs ?? [] }
    const editaisDoRadar = editais.filter((e) => editalCorrespondeAoRadar(e, config))

    for (const edital of editaisDoRadar) {
      const candidatos: Array<{ tipo: TipoAlerta; devido: boolean }> = [
        { tipo: 'novo_edital', devido: alertaNovoEditalDevido(edital) },
        { tipo: 'inscricao_abriu', devido: alertaInscricaoAbriuDevido(edital, hoje) },
        { tipo: 'ultimos_dias', devido: alertaUltimosDiasDevido(edital, hoje) },
        { tipo: 'vespera_prova', devido: alertaVesperaProvaDevido(edital, hoje) },
      ]

      for (const { tipo, devido } of candidatos) {
        if (!devido) continue
        const chave = `${radar.user_id}|${edital.id}|${tipo}`
        if (jaEnviados.has(chave)) continue

        const idsComuns = especialidadesEmComum(edital, config.especialidade_ids)
        const especialidadeDestaque = idsComuns.length > 0 ? NOME_ESPECIALIDADE[idsComuns[0]] ?? null : null
        const diasRestantes = edital.inscricao_fim ? diasAte(edital.inscricao_fim, hoje) : null

        // Reserva o registro ANTES de enviar (não depois): se duas execuções colidissem no
        // mesmo instante, só uma consegue inserir e só essa manda o e-mail. Se o envio falhar
        // depois, desfazemos a reserva pra próxima execução poder tentar de novo.
        const { error: reservaError } = await supabase
          .from('alertas_log')
          .insert({ user_id: radar.user_id, edital_id: edital.id, tipo_alerta: tipo })

        if (reservaError) {
          if (reservaError.code !== '23505') {
            erros.push(`${chave}: falha ao reservar - ${reservaError.message}`)
          }
          jaEnviados.add(chave)
          continue
        }

        try {
          await sendRadarAlertaEmail({
            email,
            nome,
            tipo,
            instituicaoNome: edital.instituicao.nome,
            instituicaoUf: edital.instituicao.uf,
            status: edital.status,
            temporada: edital.temporada,
            inscricaoInicio: edital.inscricao_inicio,
            inscricaoFim: edital.inscricao_fim,
            dataProva: edital.data_prova,
            dataGabarito: edital.data_gabarito,
            taxa: edital.taxa,
            etapas: edital.etapas,
            diasRestantes,
            linkOficial: edital.link_oficial ?? edital.instituicao.site,
            especialidadeDestaque,
          })
          jaEnviados.add(chave)
          enviados++
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          erros.push(`${chave}: falha ao enviar - ${msg}`)
          console.error(`[cron radar-alertas] erro ao enviar ${chave}:`, msg)
          // Desfaz a reserva pra essa combinação poder ser tentada de novo na próxima execução.
          await supabase.from('alertas_log').delete().eq('user_id', radar.user_id).eq('edital_id', edital.id).eq('tipo_alerta', tipo)
        }
      }
    }
  }

  return NextResponse.json({ ok: true, enviados, usuarios: radares.length, erros: erros.length ? erros : undefined })
}
