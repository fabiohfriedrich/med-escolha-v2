import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import MeuRadarForm from './MeuRadarForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Meu Radar | Med Escolha',
  description: 'Configure suas especialidades e estados de interesse pra receber alerta de residência médica.',
}

export default async function MeuRadarPage() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()

  const { data: radarUsuario } = await getSupabaseAdmin()
    .from('radar_usuario')
    .select('especialidade_ids, ufs, alertas_ativos')
    .eq('user_id', user!.id)
    .maybeSingle()

  let top3: number[] = []
  if (!radarUsuario && email) {
    const { data: resultado } = await supabase
      .from('resultados')
      .select('ranking_json')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const ranking = (resultado?.ranking_json ?? []) as Array<{ id: number }>
    top3 = ranking.slice(0, 3).map((r) => r.id)
  }

  return (
    <MeuRadarForm
      configInicial={
        radarUsuario ?? { especialidade_ids: top3, ufs: [], alertas_ativos: true }
      }
      preSelecionadoDoTeste={!radarUsuario && top3.length > 0}
    />
  )
}
