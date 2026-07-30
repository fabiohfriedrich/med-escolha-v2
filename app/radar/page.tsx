import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { currentUser } from '@clerk/nextjs/server'
import RadarClient from './RadarClient'
import type { EditalComInstituicao } from '@/lib/radar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Radar de Residência | Med Escolha',
  description: 'Editais de residência médica por especialidade e estado, com alertas de prazo direto no seu e-mail.',
}

export default async function RadarPage() {
  const [{ data: editaisData, error }, user] = await Promise.all([
    supabase
      .from('editais')
      .select('*, instituicao:instituicoes(*), edital_vagas(*)'),
    currentUser(),
  ])

  if (error) {
    console.error('[radar] erro ao carregar editais:', error.message)
  }

  const editais = (editaisData ?? []) as unknown as EditalComInstituicao[]

  let radarConfig: { especialidade_ids: number[]; ufs: string[] } | null = null
  if (user) {
    const { data } = await getSupabaseAdmin()
      .from('radar_usuario')
      .select('especialidade_ids, ufs')
      .eq('user_id', user.id)
      .maybeSingle()
    radarConfig = data
  }

  return <RadarClient editais={editais} isLoggedIn={!!user} radarConfig={radarConfig} />
}
