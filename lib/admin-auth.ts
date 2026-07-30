import { cookies } from 'next/headers'
import { verifySessionToken } from '@/app/api/admin/login/route'

// As páginas /admin/* já são protegidas pelo proxy.ts (cookie admin_auth), mas rotas de API
// não passam por ali (proxy só intercepta pathname.startsWith('/admin')), então toda rota
// de escrita em app/api/admin/** precisa chamar isso no início.
export async function isAdminRequest(): Promise<boolean> {
  const jwtSecret = process.env.ADMIN_JWT_SECRET
  if (!jwtSecret) return false
  const cookieStore = await cookies()
  const cookie = cookieStore.get('admin_auth')?.value
  if (!cookie) return false
  return verifySessionToken(cookie, jwtSecret)
}
