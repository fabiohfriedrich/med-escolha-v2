import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendAlertaAdminEmail } from '@/lib/email'

// Chamado pela tela /criar-senha quando a usuária não consegue trocar a senha temporária —
// avisa o admin por e-mail em vez de o erro só aparecer silenciosamente pra usuária.
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { email, erro } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  await sendAlertaAdminEmail({
    assunto: 'Usuária travou ao criar a senha definitiva',
    contexto: {
      'E-mail': email,
      'Erro do Clerk': erro ?? 'desconhecido',
    },
  }).catch(err => console.error('[alerta-erro-senha] Erro ao enviar alerta:', err))

  return NextResponse.json({ ok: true })
}
