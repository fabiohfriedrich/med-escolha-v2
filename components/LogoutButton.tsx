'use client'

import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'

export default function LogoutButton() {
  const router = useRouter()
  const { signOut } = useClerk()

  async function handleLogout() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-blue-200 hover:text-white hover:bg-blue-800 transition"
    >
      Sair
    </button>
  )
}
