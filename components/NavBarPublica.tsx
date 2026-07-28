'use client'

import { useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

type Item = { href: string; label: string; match: (p: string) => boolean; icon: React.ReactNode }

const ITEMS: Item[] = [
  {
    href: '/guias',
    label: 'Especialidades',
    match: (p) => p.startsWith('/guias'),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/quiz-rapido',
    label: 'Quiz rápido',
    match: (p) => p === '/quiz-rapido',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: '/ebooks',
    label: 'Ebooks',
    match: (p) => p.startsWith('/ebooks'),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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
]

function itemClass(active: boolean) {
  return `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
    active ? 'bg-blue-700 text-white' : 'text-blue-200 hover:text-white hover:bg-blue-800'
  }`
}

export default function NavBarPublica() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="text-white sticky top-0 z-50 shadow-md" style={{ background: '#0f2d5e' }}>
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
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

        {/* Links (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {ITEMS.map((item) => (
            <a key={item.href} href={item.href} className={itemClass(item.match(path))}>
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}

          <a href="https://match.medescolha.com/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition bg-blue-500 hover:bg-blue-400 text-white ml-2 whitespace-nowrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <span>Teste completo</span>
          </a>
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
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className={itemClass(item.match(path))}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
            <a href="https://match.medescolha.com/" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition bg-blue-500 hover:bg-blue-400 text-white whitespace-nowrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              <span>Teste completo</span>
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
