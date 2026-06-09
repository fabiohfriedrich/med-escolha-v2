import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'medescolha2025'

// Rotas que não exigem login Supabase
const PUBLIC_PREFIXES = ['/login', '/criar-senha', '/auth/callback', '/api/', '/especialidades', '/admin', '/_next', '/favicon']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Proteção do painel admin (autenticação simples por cookie) ──
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const cookie = request.cookies.get('admin_auth')?.value
    if (cookie !== ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // ── Rotas públicas (sem verificação Supabase) ──
  const isPublic = PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

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

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.svg|.*\\.ico|.*\\.png).*)'],
}
