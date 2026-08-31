import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { data: registros, error } = await supabaseAdmin
    .from('registros_sessoes_psicologo')
    .select('id, pacote_id, data_call, resumo, created_at, pacotes_psicologo(email, nome)')
    .order('data_call', { ascending: false })

  if (error) {
    console.error('[admin/sessoes-psicologo-relatorio] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  const lista = registros ?? []

  const porMesMap = new Map<string, { total: number; compradores: Set<string> }>()
  for (const r of lista) {
    const mes = r.data_call.slice(0, 7) // 'YYYY-MM'
    if (!porMesMap.has(mes)) porMesMap.set(mes, { total: 0, compradores: new Set() })
    const bucket = porMesMap.get(mes)!
    bucket.total += 1
    bucket.compradores.add(r.pacote_id)
  }

  const por_mes = Array.from(porMesMap.entries())
    .map(([mes, b]) => ({ mes, total: b.total, compradores_distintos: b.compradores.size }))
    .sort((a, b) => b.mes.localeCompare(a.mes))

  return NextResponse.json({
    total_geral: lista.length,
    por_mes,
    registros: lista,
  })
}
