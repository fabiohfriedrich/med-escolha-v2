import { getSupabaseAdmin } from '@/lib/supabase-admin'
import RadarAdminClient from './RadarAdminClient'
import type { EditalComInstituicao, Instituicao } from '@/lib/radar'

export const dynamic = 'force-dynamic'

export default async function AdminRadarPage() {
  const supabase = getSupabaseAdmin()

  const [{ data: instituicoes }, { data: editais }] = await Promise.all([
    supabase.from('instituicoes').select('*').order('nome'),
    supabase
      .from('editais')
      .select('*, instituicao:instituicoes(*), edital_vagas(*)')
      .order('atualizado_em', { ascending: false }),
  ])

  return (
    <RadarAdminClient
      instituicoes={(instituicoes ?? []) as Instituicao[]}
      editais={(editais ?? []) as unknown as EditalComInstituicao[]}
    />
  )
}
