'use client'

import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import NavBar from './NavBar'

const PUBLIC_PREFIXES = ['/guias', '/quiz-rapido', '/ebooks']

// Páginas que têm seu próprio header público (LandingHeader) pra visitante
// deslogado — não duplica a navbar autenticada (com "Meu perfil"/"Sair") nelas.
const HIDDEN_FOR_LOGGED_OUT = ['/', '/comparar']

export default function NavBarCondicional() {
  const path = usePathname()
  const { isSignedIn, isLoaded } = useUser()
  const isPublic = PUBLIC_PREFIXES.some(p => path.startsWith(p))
  if (isPublic) return null

  if (HIDDEN_FOR_LOGGED_OUT.includes(path) && isLoaded && !isSignedIn) return null

  return <NavBar />
}
