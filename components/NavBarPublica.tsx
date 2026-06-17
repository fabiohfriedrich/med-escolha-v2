'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function NavBarPublica() {
  const path = usePathname()

  return (
    <nav className="text-white sticky top-0 z-50 shadow-md" style={{ background: '#0f2d5e' }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Image
            src="/med-escolha-logo-dark.svg"
            alt="Med Escolha"
            width={160}
            height={49}
            priority
          />
        </a>

        {/* Links */}
        <div className="flex items-center gap-1">
          <Link href="/guias"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              path.startsWith('/guias')
                ? 'bg-blue-700 text-white'
                : 'text-blue-200 hover:text-white hover:bg-blue-800'
            }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Especialidades</span>
          </Link>

          <Link href="/quiz-rapido"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              path === '/quiz-rapido'
                ? 'bg-blue-700 text-white'
                : 'text-blue-200 hover:text-white hover:bg-blue-800'
            }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Quiz rápido</span>
          </Link>

          <Link href="/ebooks"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              path.startsWith('/ebooks')
                ? 'bg-blue-700 text-white'
                : 'text-blue-200 hover:text-white hover:bg-blue-800'
            }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Ebooks</span>
          </Link>

          <a href="https://match.medescolha.com/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition bg-blue-500 hover:bg-blue-400 text-white ml-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            <span>Teste completo</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
