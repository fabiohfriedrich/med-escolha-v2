import { NextRequest, NextResponse } from 'next/server'

function getAdminPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD
  if (!pwd) throw new Error('ADMIN_PASSWORD env var não configurada')
  return pwd
}

function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET env var não configurada')
  return secret
}

async function generateSessionToken(secret: string): Promise<string> {
  const uuid = crypto.randomUUID()
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(uuid))
  const sigHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return `${uuid}.${sigHex}`
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const [uuid, sigHex] = token.split('.')
  if (!uuid || !sigHex) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(uuid))
  const expectedHex = Array.from(new Uint8Array(expectedSig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Comparação em tempo constante para evitar timing attacks
  if (expectedHex.length !== sigHex.length) return false
  let diff = 0
  for (let i = 0; i < expectedHex.length; i++) {
    diff |= expectedHex.charCodeAt(i) ^ sigHex.charCodeAt(i)
  }
  return diff === 0
}

export async function POST(req: NextRequest) {
  try {
    const adminPassword = getAdminPassword()
    const jwtSecret = getJwtSecret()
    const { password } = await req.json()

    if (password !== adminPassword) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const sessionToken = await generateSessionToken(jwtSecret)
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_auth', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    })
    return res
  } catch (err) {
    console.error('[admin/login] Erro:', err)
    return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('admin_auth')
  return res
}
