'use client'

import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import NavBar from './NavBar'

const PUBLIC_PREFIXES = ['/guias', '/quiz-rapido', '/ebooks']

export default function NavBarCondicional() {
  const path = usePathname()
  const { isSignedIn, isLoaded } = useUser()
  const isPublic = PUBLIC_PREFIXES.some(p => path.startsWith(p))
  if (isPublic) return null

  // Na home, visitante deslogado vê a landing de vendas, que já tem sua própria
  // marca e rodapé — não duplica a navbar autenticada (com "Meu perfil"/"Sair").
  if (path === '/' && isLoaded && !isSignedIn) return null

  return <NavBar />
}
