'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import NavMenu from './NavMenu'

export default function NavBar() {
  const pathname = usePathname()

  // Oculta a navbar nas páginas de autenticação
  const hideNav = pathname === '/login' || pathname === '/criar-senha'
  if (hideNav) return null

  return (
    <nav className="text-white sticky top-0 z-50 shadow-md" style={{ background: '#0f2d5e' }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <Image
            src="/med-escolha-logo-dark.svg"
            alt="Med Escolha"
            width={160}
            height={49}
            priority
          />
        </a>
        <NavMenu />
      </div>
    </nav>
  )
}
