'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import NavMenu from './NavMenu'

export default function NavBar() {
  const pathname = usePathname()

  // Oculta a navbar nas páginas de autenticação
  const hideNav = pathname === '/login' || pathname === '/criar-senha' || pathname.startsWith('/admin')
  if (hideNav) return null

  return (
    <nav className="text-white sticky top-0 z-50 shadow-md" style={{ background: '#0f2d5e' }}>
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center shrink-0">
          <Image
            src="/med-escolha-logo-dark.svg"
            alt="Med Escolha"
            width={140}
            height={43}
            priority
            className="w-[120px] md:w-[160px] h-auto"
          />
        </a>
        <NavMenu />
      </div>
    </nav>
  )
}
