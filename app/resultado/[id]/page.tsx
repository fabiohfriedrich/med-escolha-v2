import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ResultadoClient from './ResultadoClient'

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('resultados')
    .select('id, nome, email, ranking_json, perfil_json, answers_json, created_at')
    .eq('id', id)
    .single()

  if (error || !data) return notFound()

  return (
    <ResultadoClient
      id={data.id}
      nome={data.nome}
      email={data.email}
      ranking={data.ranking_json || []}
      perfil={data.perfil_json || {}}
      answers={data.answers_json || {}}
    />
  )
}
