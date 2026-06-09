'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import Image from 'next/image'

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
    <div className="min-h-screen flex">

      {/* Painel esquerdo — editorial azul escuro */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-10 relative min-h-screen"
        style={{ background: '#0f2d5e' }}
      >
        {/* Círculo decorativo */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20"
          style={{ background: '#1a4a8a', transform: 'translate(30%, -30%)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/med-escolha-logo-dark.svg"
            alt="Med Escolha"
            width={200}
            height={61}
            priority
          />
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 space-y-6">
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#60a5fa' }}>
            Teste de compatibilidade
          </p>
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Descubra a especialidade certa pra você.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#93c5fd' }}>
            95 questões, 55 especialidades reconhecidas pelo CFM e dados reais de mercado para uma decisão de carreira com segurança.
          </p>
        </div>

        {/* Stats rodapé */}
        <div className="relative z-10 flex gap-8 pt-6 border-t border-blue-800">
          {[
            { value: '55', label: 'especialidades' },
            { value: '95', label: 'questões' },
            { value: '~20', label: 'minutos' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs" style={{ color: '#93c5fd' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Image src="/med-escolha-logo.svg" alt="Med Escolha" width={160} height={49} priority />
          </div>

          <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#0f2d5e' }}>
            Entrar na plataforma
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Use o e-mail e a senha cadastrados na sua conta.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="seu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErro(null) }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-20"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setErro(null) }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
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
              className="w-full font-bold py-3.5 rounded-xl text-white text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: loading ? '#93c5fd' : '#1d6fe8' }}
            >
              {loading ? 'Entrando...' : <>Entrar <span>→</span></>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleEsqueceuSenha}
              className="text-sm font-medium transition"
              style={{ color: '#1d6fe8' }}
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="mt-8 rounded-xl p-4 text-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <p className="font-semibold mb-1" style={{ color: '#1e40af' }}>Primeiro acesso?</p>
            <p className="text-xs leading-relaxed" style={{ color: '#3b82f6' }}>
              Após a compra, você recebe um e-mail para criar sua senha. Não chegou?{' '}
              <a href="mailto:contato@euamomedicina.com" className="font-semibold underline">
                contato@euamomedicina.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
