import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import ResultadoClient from './ResultadoClient'

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getSupabaseAdmin()
    .from('resultados')
    .select('id, nome, email, ranking_json, perfil_json, answers_json, narrativa_ia, created_at, scoring_version')
    .eq('id', id)
    .single()

  if (error || !data) return notFound()

  // Só o dono do resultado pode ver: o ShareCard compartilha uma imagem (blob/Web
  // Share API), não a URL desta página, então não existe fluxo legítimo de terceiro
  // acessando por link. O admin já tem /admin/respostas pra ver resultados de outros.
  const user = await currentUser()
  const sessionEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!sessionEmail || data.email?.toLowerCase().trim() !== sessionEmail) {
    return notFound()
  }

  return (
    <ResultadoClient
      id={data.id}
      nome={data.nome}
      ranking={data.ranking_json || []}
      perfil={data.perfil_json || {}}
      answers={data.answers_json || {}}
      narrativaIA={data.narrativa_ia || null}
      scoringVersion={data.scoring_version ?? 1}
    />
  )
}
