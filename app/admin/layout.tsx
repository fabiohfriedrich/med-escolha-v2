'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/respostas', label: '📋 Respostas' },
  { href: '/admin/compradores', label: '👥 Compradores' },
  { href: '/admin/feedbacks', label: '⭐ Feedbacks' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') return <>{children}</>

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-extrabold text-sm tracking-wide">MED ESCOLHA · ADMIN</span>
            <nav className="flex gap-1">
              {NAV.map(n => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    pathname === n.href ? 'bg-white/20 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <button onClick={logout} className="text-blue-300 hover:text-white text-xs font-medium transition">
            Sair
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
