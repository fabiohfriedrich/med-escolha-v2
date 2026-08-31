import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { PRODUTO_DIGITAL_KIT_TOP3, temAcessoProdutoDigital } from '@/lib/produtos-digitais'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress
  if (!email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const desbloqueado = await temAcessoProdutoDigital(email, PRODUTO_DIGITAL_KIT_TOP3)
    return NextResponse.json(
      { status: desbloqueado ? 'desbloqueado' : 'bloqueado' },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  } catch (error) {
    console.error('[kit-top3] Erro ao consultar status:', error)
    return NextResponse.json({ error: 'Não foi possível consultar o acesso' }, { status: 500 })
  }
}
