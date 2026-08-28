import { NextRequest, NextResponse } from 'next/server'
import { adminLoginRateLimit, getClientIp } from '@/lib/rate-limit'
import { generateSessionToken } from '@/app/api/admin/login/route'

function getPsicologoPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD_PSICOLOGO
  if (!pwd) throw new Error('ADMIN_PASSWORD_PSICOLOGO env var não configurada')
  return pwd
}

function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET env var não configurada')
  return secret
}

export async function POST(req: NextRequest) {
  try {
    const { success } = await adminLoginRateLimit.limit(getClientIp(req))
    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        { status: 429 }
      )
    }

    const psicologoPassword = getPsicologoPassword()
    const jwtSecret = getJwtSecret()
    const { password } = await req.json()

    if (password !== psicologoPassword) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const sessionToken = await generateSessionToken(jwtSecret)
    const res = NextResponse.json({ ok: true })
    res.cookies.set('psico_auth', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    })
    return res
  } catch (err) {
    console.error('[admin-psicologo/login] Erro:', err)
    return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('psico_auth')
  return res
}
