import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { count, error } = await supabase
      .from('resultados')
      .select('id', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json(
      { count: count ?? 0 },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } }
    )
  } catch {
    return NextResponse.json({ count: null }, { status: 500 })
  }
}
