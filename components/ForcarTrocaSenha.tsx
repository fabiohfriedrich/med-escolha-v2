'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const ROTAS_ISENTAS = ['/criar-senha', '/login', '/esqueci-senha', '/sso-callback']

export default function ForcarTrocaSenha() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || !user) return
    if (ROTAS_ISENTAS.some(r => pathname.startsWith(r))) return
    if (user.publicMetadata?.mustChangePassword) {
      router.replace('/criar-senha')
    }
  }, [isLoaded, user, pathname, router])

  return null
}
