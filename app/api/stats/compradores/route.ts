import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Vendas registradas antes da tabela `compradores` existir (histórico pré-sistema).
// O total exibido é essa base + a contagem atual, então cada venda nova soma +1 automaticamente.
const BASE_HISTORICO = 1450

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { count, error } = await supabase
      .from('compradores')
      .select('id', { count: 'exact', head: true })
      .eq('tipo', 'comprador')

    if (error) throw error

    return NextResponse.json(
      { count: BASE_HISTORICO + (count ?? 0) },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } }
    )
  } catch {
    return NextResponse.json({ count: null }, { status: 500 })
  }
}
