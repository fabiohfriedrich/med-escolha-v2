'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'

const PUBLIC_PREFIXES = ['/guias', '/quiz-rapido', '/ebooks']

export default function NavBarCondicional() {
  const path = usePathname()
  const isPublic = PUBLIC_PREFIXES.some(p => path.startsWith(p))
  if (isPublic) return null
  return <NavBar />
}
