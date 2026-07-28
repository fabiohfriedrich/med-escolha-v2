'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

type Item = {
  href: string
  label: string
  match: (pathname: string) => boolean
  icon: React.ReactNode
}

const ITEMS: Item[] = [
  {
    href: '/teste',
    label: 'Faça seu teste',
    match: (p) => p === '/teste',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: '/especialidades',
    label: 'Especialidades',
    match: (p) => p.startsWith('/especialidades'),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/comparar',
    label: 'Comparar',
    match: (p) => p.startsWith('/comparar'),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v18" /><path d="M16 3v18" /><path d="M3 8h5" /><path d="M16 8h5" /><path d="M3 16h5" /><path d="M16 16h5" />
      </svg>
    ),
  },
  {
    href: '/ferramentas',
    label: 'Bônus',
    match: (p) => p.startsWith('/ferramentas'),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    href: '/perfil',
    label: 'Meu perfil',
    match: (p) => p === '/perfil',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

function itemClass(active: boolean) {
  return `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
    active ? 'bg-blue-700 text-white' : 'text-blue-200 hover:text-white hover:bg-blue-800'
  }`
}

export default function NavMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isLogin = pathname === '/login'

  if (isLogin) return null

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-1">
        {ITEMS.map((item) => (
          <a key={item.href} href={item.href} className={itemClass(item.match(pathname))}>
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
        <LogoutButton />
      </div>

      {/* Botão hambúrguer (mobile) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-blue-200 hover:text-white hover:bg-blue-800 transition shrink-0"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Painel mobile */}
      {open && (
        <div
          className="md:hidden absolute top-full left-0 right-0 flex flex-col gap-1 p-3 shadow-lg"
          style={{ background: '#0f2d5e' }}
        >
          {ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className={itemClass(item.match(pathname))}>
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
          <div className="border-t border-blue-800 my-1" />
          <LogoutButton />
        </div>
      )}
    </>
  )
}
