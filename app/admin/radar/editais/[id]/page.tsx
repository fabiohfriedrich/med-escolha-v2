import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import EditalEditClient from './EditalEditClient'
import type { EditalComInstituicao } from '@/lib/radar'

export const dynamic = 'force-dynamic'

export default async function EditarEditalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data: edital } = await supabase
    .from('editais')
    .select('*, instituicao:instituicoes(*), edital_vagas(*)')
    .eq('id', id)
    .single()

  if (!edital) return notFound()

  return <EditalEditClient edital={edital as unknown as EditalComInstituicao} />
}
