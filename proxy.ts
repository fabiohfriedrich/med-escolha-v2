import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { verifySessionToken } from '@/app/api/admin/login/route'

// Rotas que exigem sessão Clerk válida
const isProtectedRoute = createRouteMatcher(['/teste(.*)', '/resultado(.*)', '/perfil(.*)'])
// Rotas liberadas mesmo para quem está com troca de senha pendente
const isExemptFromForcedPasswordChange = createRouteMatcher([
  '/criar-senha', '/login', '/esqueci-senha', '/sso-callback', '/api(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl

  // ── Proteção do painel admin (token HMAC assinado, independente do Clerk) ──
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

  // ── Força troca de senha temporária antes de liberar qualquer página logada ──
  // Requer o claim `metadata` habilitado em Clerk Dashboard > Sessions > Customize session token
  const { userId, sessionClaims } = await auth()
  if (userId && !isExemptFromForcedPasswordChange(request)) {
    const metadata = sessionClaims?.metadata as { mustChangePassword?: boolean } | undefined
    if (metadata?.mustChangePassword) {
      return NextResponse.redirect(new URL('/criar-senha', request.url))
    }
  }

  // ── Proteção via Clerk ──
  if (isProtectedRoute(request)) {
    await auth.protect({ unauthenticatedUrl: new URL('/login', request.url).toString() })
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.svg|.*\\.ico|.*\\.png).*)'],
}
