import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('resultados')
    .select('id, created_at, ranking_json')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ resultados: data ?? [] })
}
