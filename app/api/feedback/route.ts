import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { publicFormRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const { success } = await publicFormRateLimit.limit(getClientIp(req))
  if (!success) {
    return NextResponse.json({ error: 'Muitas requisições. Tente novamente em instantes.' }, { status: 429 })
  }

  const clerkUser = await currentUser()
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!clerkEmail) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { resultadoId, nota, texto } = await req.json()
  if (!resultadoId) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  if (nota !== undefined && (nota < 1 || nota > 10)) return NextResponse.json({ error: 'Nota inválida' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Confirma que o resultado pertence a quem está autenticado antes de sobrescrever o
  // feedback — sem isso, qualquer UUID de resultado alheio podia ser alterado.
  const { data: resultado, error: fetchError } = await supabase
    .from('resultados')
    .select('email')
    .eq('id', resultadoId)
    .maybeSingle()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!resultado || resultado.email.toLowerCase().trim() !== clerkEmail) {
    return NextResponse.json({ error: 'Resultado não encontrado' }, { status: 403 })
  }

  const { error } = await supabase
    .from('resultados')
    .update({ feedback_nota: nota ?? null, feedback_texto: texto ?? null })
    .eq('id', resultadoId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
