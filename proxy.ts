import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/app/api/admin/login/route'

// Rotas que exigem sessão Clerk válida
const isProtectedRoute = createRouteMatcher(['/teste(.*)', '/resultado(.*)', '/perfil(.*)', '/ferramentas(.*)', '/radar/meu-radar(.*)'])
// Rotas liberadas mesmo para quem está com troca de senha pendente
const isExemptFromForcedPasswordChange = createRouteMatcher([
  '/criar-senha', '/login', '/esqueci-senha', '/sso-callback', '/api(.*)',
])

const isClerkDependentPage = createRouteMatcher([
  '/comparar(.*)',
  '/criar-senha(.*)',
  '/esqueci-senha(.*)',
  '/ferramentas(.*)',
  '/login(.*)',
  '/perfil(.*)',
  '/radar(.*)',
  '/resultado(.*)',
  '/sso-callback(.*)',
  '/teste(.*)',
])

// Acesso escopado do psicólogo parceiro: cookie e senha separados do admin_auth do time
// interno, pra ele nunca alcançar financeiro/compradores/etc — só /admin/psicologo.
async function handlePsicologoRoute(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin/psicologo')) return null
  if (pathname === '/admin/psicologo/login') return NextResponse.next()

  const jwtSecret = process.env.ADMIN_JWT_SECRET
  if (!jwtSecret) {
    console.error('[proxy] ADMIN_JWT_SECRET não configurada')
    return NextResponse.redirect(new URL('/admin/psicologo/login', request.url))
  }

  const cookie = request.cookies.get('psico_auth')?.value
  if (!cookie || !(await verifySessionToken(cookie, jwtSecret))) {
    return NextResponse.redirect(new URL('/admin/psicologo/login', request.url))
  }

  return NextResponse.next()
}

async function handleAdminRoute(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl

  const psicologoResponse = await handlePsicologoRoute(request)
  if (psicologoResponse) return psicologoResponse

  if (!pathname.startsWith('/admin')) return null
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

const proxy = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware(async (auth, request) => {
      const adminResponse = await handleAdminRoute(request)
      if (adminResponse) return adminResponse

      // Força troca de senha temporária antes de liberar qualquer página logada.
      // Requer o claim `metadata` habilitado no token de sessão do Clerk.
      const { userId, sessionClaims } = await auth()
      if (userId && !isExemptFromForcedPasswordChange(request)) {
        const metadata = sessionClaims?.metadata as { mustChangePassword?: boolean } | undefined
        if (metadata?.mustChangePassword) {
          return NextResponse.redirect(new URL('/criar-senha', request.url))
        }
      }

      if (isProtectedRoute(request)) {
        await auth.protect({ unauthenticatedUrl: new URL('/login', request.url).toString() })
      }

      return NextResponse.next()
    })
  : async function publicPreviewProxy(request: NextRequest) {
      const adminResponse = await handleAdminRoute(request)
      if (adminResponse) return adminResponse

      const { pathname } = request.nextUrl
      if (pathname.startsWith('/api') || isClerkDependentPage(request)) {
        return NextResponse.json(
          { error: 'Recurso indisponível neste ambiente' },
          { status: 503 }
        )
      }

      return NextResponse.next()
    }

export default proxy

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.svg|.*\\.ico|.*\\.png).*)'],
}
