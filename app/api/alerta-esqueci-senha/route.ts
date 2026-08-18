import { NextRequest, NextResponse } from 'next/server'
import { publicFormRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendAlertaAdminEmail } from '@/lib/email'

// Chamado pela tela /esqueci-senha quando o Clerk retorna um erro inesperado ao enviar o
// código ou ao redefinir a senha — sem isso, a falha some silenciosamente (a tela nunca
// revela erro real ao usuário, por segurança) e ninguém ficava sabendo. Sem auth porque
// o usuário ainda não está logado nesta etapa; por isso é rate-limited por IP.
export async function POST(req: NextRequest) {
  const { success } = await publicFormRateLimit.limit(getClientIp(req))
  if (!success) return NextResponse.json({ ok: false }, { status: 429 })

  const { email, etapa, codigoErro, mensagem } = await req.json()
  if (!email || !etapa) return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })

  await sendAlertaAdminEmail({
    assunto: 'Usuário travou ao redefinir a senha (esqueci minha senha)',
    contexto: {
      'E-mail': email,
      Etapa: etapa,
      'Código do erro (Clerk)': codigoErro ?? 'desconhecido',
      Mensagem: mensagem ?? '-',
    },
  }).catch(err => console.error('[alerta-esqueci-senha] Erro ao enviar alerta:', err))

  return NextResponse.json({ ok: true })
}
