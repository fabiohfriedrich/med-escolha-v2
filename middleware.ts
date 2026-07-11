import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rotas públicas — qualquer pessoa pode acessar sem estar logada
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/esqueci-senha(.*)',
  '/sso-callback(.*)',
  '/api/webhook/(.*)',
  '/api/verificar-acesso(.*)',
  '/api/feedback(.*)',
  '/api/submit(.*)',
  '/api/subscribe(.*)',
  '/api/pdf(.*)',
  '/api/agendar-reteste(.*)',
  '/api/cron/(.*)',
  '/admin(.*)',
  '/especialidades(.*)',
  '/guias(.*)',
  '/ebooks(.*)',
  '/comparar(.*)',
  '/quiz-rapido(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
