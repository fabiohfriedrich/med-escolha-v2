import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/app/api/admin/login/route'

// Rotas que exigem sessão Supabase válida
const PROTECTED_PREFIXES = ['/teste', '/resultado', '/perfil']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Proteção do painel admin (token HMAC assinado) ──
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const jwtSecret = process.env.ADMIN_JWT_SECRET
    if (!jwtSecret) {
      console.error('[proxy] ADMIN_JWT_SECRET não configurada')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const cookie = request.cookies.get('admin_auth')?.value
    if (!cookie || !(await verifySessionToken(cookie, jwtSecret))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // ── Só protege rotas que realmente exigem login ──
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // ── Proteção via Supabase Auth ──
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.svg|.*\\.ico|.*\\.png).*)'],
}
