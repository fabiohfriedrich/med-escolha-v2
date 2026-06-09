'use client'

import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default function NavMenu() {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  if (isLogin) return null

  return (
    <div className="flex items-center gap-1">
      <a href="/especialidades"
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-blue-200 hover:text-white hover:bg-blue-800 transition">
        <span>📚</span>
        <span>Especialidades</span>
      </a>
      <a href="/perfil"
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-blue-200 hover:text-white hover:bg-blue-800 transition">
        <span>👤</span>
        <span>Meu Perfil</span>
      </a>
      <LogoutButton />
    </div>
  )
}
