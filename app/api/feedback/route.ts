import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { publicFormRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const { success } = await publicFormRateLimit.limit(getClientIp(req))
  if (!success) {
    return NextResponse.json({ error: 'Muitas requisições. Tente novamente em instantes.' }, { status: 429 })
  }

  const { resultadoId, nota, texto } = await req.json()
  if (!resultadoId) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  if (nota !== undefined && (nota < 1 || nota > 10)) return NextResponse.json({ error: 'Nota inválida' }, { status: 400 })

  const { error } = await getSupabaseAdmin()
    .from('resultados')
    .update({ feedback_nota: nota ?? null, feedback_texto: texto ?? null })
    .eq('id', resultadoId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
