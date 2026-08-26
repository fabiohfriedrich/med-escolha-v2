'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import MedEscolhaLandingPage from '@/components/MedEscolhaLandingPage'
import PerfilDashboard from '@/components/PerfilDashboard'

// ─── Dashboard (usuários com acesso) ───────────────────────────────────────────

function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const primeiroNome = user?.firstName || 'colega'

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PerfilDashboard
          primeiroNome={primeiroNome}
          onIrParaCronograma={() => router.push('/perfil?tab=cronograma')}
          onIrParaResultados={() => router.push('/perfil?tab=resultados')}
          onIrParaEvolucao={() => router.push('/perfil?tab=evolucao')}
          onIrParaIndicacoes={() => router.push('/perfil?tab=indicacoes')}
        />
      </div>
    </main>
  )
}

// ─── Página principal — detecta auth e decide o que renderizar ─────────────────

function ClerkHome() {
  const { isLoaded, isSignedIn } = useUser()

  // A troca de senha obrigatória (primeiro acesso) já é forçada globalmente
  // pelo componente ForcarTrocaSenha, com base no metadata do Clerk.
  if (!isLoaded) return null

  return isSignedIn ? <Dashboard /> : <MedEscolhaLandingPage />
}

export default function Home() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <MedEscolhaLandingPage />
  }

  return <ClerkHome />
}
