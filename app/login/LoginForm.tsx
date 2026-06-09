'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

const ERROS: Record<string, string> = {
  link_invalido: 'O link de acesso expirou ou é inválido. Solicite um novo acesso.',
  credenciais: 'E-mail ou senha incorretos. Verifique e tente novamente.',
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  useEffect(() => {
    const erroParam = searchParams.get('erro')
    if (erroParam && ERROS[erroParam]) setErro(ERROS[erroParam])
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !senha) return
    setLoading(true)
    setErro(null)

    const supabase = createSupabaseBrowser()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: senha,
    })

    if (error) {
      setErro(ERROS['credenciais'])
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  async function handleEsqueceuSenha() {
    if (!email.trim() || !email.includes('@')) {
      setErro('Digite seu e-mail acima antes de solicitar a redefinição.')
      return
    }
    setLoading(true)
    const supabase = createSupabaseBrowser()
    await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setLoading(false)
    setErro(null)
    alert('Se o e-mail estiver cadastrado, você receberá as instruções em instantes.')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
            <span className="text-3xl">🩺</span>
          </div>
          <h1 className="text-3xl font-extrabold text-blue-900">Med Escolha</h1>
          <p className="text-gray-500 mt-1 text-sm">Teste de Compatibilidade com Especialidades Médicas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-1">Entrar na plataforma</h2>
          <p className="text-gray-500 text-sm mb-6">
            Use o e-mail e a senha cadastrados na sua conta.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErro(null) }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setErro(null) }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition disabled:opacity-60 text-sm"
            >
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleEsqueceuSenha}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Esqueci minha senha
            </button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Primeiro acesso?</p>
          <p className="text-blue-600 text-xs leading-relaxed">
            Após a compra na Hotmart, você receberá um e-mail automático para criar sua senha.
            Verifique também a caixa de spam. Se não recebeu:{' '}
            <span className="font-semibold">contato@euamomedicina.com</span>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Med Escolha · por <span className="text-blue-500">Amo Medicina</span>
        </p>
      </div>
    </div>
  )
}
