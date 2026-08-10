import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPacotesAtivos, calcularSaldo } from '@/lib/sessoes-psicologo'

export async function GET() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim()
  if (!email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const pacotes = await getPacotesAtivos(email)
    const { saldo, total, usadas } = calcularSaldo(pacotes)
    return NextResponse.json({ temPacote: total > 0, saldo, sessoes_total: total, sessoes_usadas: usadas })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao buscar saldo' }, { status: 500 })
  }
}
