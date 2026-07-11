'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function CriarSenhaPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [senhaTemporaria, setSenhaTemporaria] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/login')
      return
    }
    // Se não há troca de senha pendente, não há o que fazer aqui
    if (!user.publicMetadata?.mustChangePassword) {
      router.replace('/')
    }
  }, [isLoaded, user, router])

  async function handleDefinirSenha(e: React.FormEvent) {
    e.preventDefault()
    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    if (!user) return

    setLoading(true)
    setErro(null)

    try {
      await user.updatePassword({ currentPassword: senhaTemporaria, newPassword: senha })
    } catch {
      setErro('Senha temporária incorreta, ou a nova senha não atende aos requisitos mínimos.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/marcar-senha-criada', { method: 'POST' })
    if (!res.ok) {
      setErro('Senha alterada, mas houve um erro ao concluir o cadastro. Recarregue a página.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-blue-900">Med Escolha</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Bem-vindo, <span className="font-semibold text-blue-700">{(user.firstName ?? user.primaryEmailAddress?.emailAddress ?? '').split(' ')[0]}</span>!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-1">Crie sua senha definitiva</h2>
          <p className="text-gray-500 text-sm mb-6">
            Você acessou com uma senha temporária. Por segurança, defina agora uma senha só sua para continuar.
          </p>

          <form onSubmit={handleDefinirSenha} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Senha temporária (recebida por e-mail)</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={senhaTemporaria}
                onChange={e => { setSenhaTemporaria(e.target.value); setErro(null) }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nova senha</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 8 caracteres"
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro(null) }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar senha</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repita a senha"
                value={confirmar}
                onChange={e => { setConfirmar(e.target.value); setErro(null) }}
              />
            </div>

            {senha.length > 0 && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(n => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        senha.length >= n * 3
                          ? senha.length >= 12 ? 'bg-green-500' : senha.length >= 8 ? 'bg-yellow-400' : 'bg-red-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {senha.length < 8 ? 'Senha fraca — use pelo menos 8 caracteres' : senha.length < 12 ? 'Senha razoável' : 'Senha forte ✓'}
                </p>
              </div>
            )}

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || senha.length < 8 || senha !== confirmar || !senhaTemporaria}
              className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Salvando...' : 'Definir senha e entrar →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Problemas? <span className="text-blue-500">contato@euamomedicina.com</span>
        </p>
      </div>
    </div>
  )
}
