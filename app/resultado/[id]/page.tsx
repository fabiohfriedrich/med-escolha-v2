import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import ResultadoClient from './ResultadoClient'

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getSupabaseAdmin()
    .from('resultados')
    .select('id, nome, ranking_json, perfil_json, answers_json, narrativa_ia, created_at')
    .eq('id', id)
    .single()

  if (error || !data) return notFound()

  return (
    <ResultadoClient
      id={data.id}
      nome={data.nome}
      ranking={data.ranking_json || []}
      perfil={data.perfil_json || {}}
      answers={data.answers_json || {}}
      narrativaIA={data.narrativa_ia || null}
    />
  )
}
