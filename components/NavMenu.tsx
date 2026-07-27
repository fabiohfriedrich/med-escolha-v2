'use client'

import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import Image from 'next/image'

export default function NavMenu() {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  if (isLogin) return null

  return (
    <div className="flex items-center gap-1">
      {/* Faça seu teste */}
      <a href="/teste"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
          pathname === '/teste'
            ? 'bg-blue-700 text-white'
            : 'text-blue-200 hover:text-white hover:bg-blue-800'
        }`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        <span>Faça seu teste</span>
      </a>

      {/* Especialidades */}
      <a href="/especialidades"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
          pathname.startsWith('/especialidades')
            ? 'bg-blue-700 text-white'
            : 'text-blue-200 hover:text-white hover:bg-blue-800'
        }`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Especialidades</span>
      </a>

      {/* Kit de Carreira */}
      <a href="/ferramentas"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
          pathname.startsWith('/ferramentas')
            ? 'bg-blue-700 text-white'
            : 'text-blue-200 hover:text-white hover:bg-blue-800'
        }`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
        <span>Kit de Carreira</span>
      </a>

      {/* Meu Perfil */}
      <a href="/perfil"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
          pathname === '/perfil'
            ? 'bg-blue-700 text-white'
            : 'text-blue-200 hover:text-white hover:bg-blue-800'
        }`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Meu perfil</span>
      </a>

      <LogoutButton />
    </div>
  )
}
