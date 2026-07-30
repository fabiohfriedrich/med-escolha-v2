import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const especialidade_ids = Array.isArray(body.especialidade_ids)
    ? body.especialidade_ids.filter((n: unknown) => typeof n === 'number')
    : []
  const ufs = Array.isArray(body.ufs) ? body.ufs.filter((s: unknown) => typeof s === 'string') : []
  const alertas_ativos = body.alertas_ativos !== false

  const { error } = await getSupabaseAdmin()
    .from('radar_usuario')
    .upsert({ user_id: userId, especialidade_ids, ufs, alertas_ativos }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
