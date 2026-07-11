'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs/legacy'
import Image from 'next/image'

const ERROS: Record<string, string> = {
  link_invalido: 'O link de acesso expirou ou é inválido. Solicite um novo acesso.',
  credenciais: 'E-mail ou senha incorretos. Verifique e tente novamente.',
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, isLoaded, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [codigo, setCodigo] = useState('')
  const [precisaCodigo, setPrecisaCodigo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  useEffect(() => {
    const erroParam = searchParams.get('erro')
    if (erroParam && ERROS[erroParam]) setErro(ERROS[erroParam])
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) { setErro('Autenticação carregando, aguarde e tente novamente.'); return }
    if (!email.trim() || !senha) return
    setLoading(true)
    setErro(null)

    try {
      const result = await signIn.create({
        identifier: email.toLowerCase().trim(),
        password: senha,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
        router.refresh()
        return
      }

      // Dispositivo/navegador novo — Clerk exige confirmar por código de e-mail
      if (result.status === 'needs_client_trust') {
        await signIn.prepareSecondFactor({ strategy: 'email_code' })
        setPrecisaCodigo(true)
        setLoading(false)
        return
      }

      setErro(ERROS['credenciais'])
      setLoading(false)
    } catch {
      setErro(ERROS['credenciais'])
      setLoading(false)
    }
  }

  async function handleConfirmarCodigo(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded || codigo.length < 4) return
    setLoading(true)
    setErro(null)

    try {
      const result = await signIn.attemptSecondFactor({ strategy: 'email_code', code: codigo })
      if (result.status !== 'complete') {
        setErro('Código inválido ou expirado.')
        setLoading(false)
        return
      }
      await setActive({ session: result.createdSessionId })
      router.push('/')
      router.refresh()
    } catch {
      setErro('Código inválido ou expirado.')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    if (!isLoaded) return
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    })
  }

  function handleEsqueceuSenha() {
    if (!email.trim() || !email.includes('@')) {
      setErro('Digite seu e-mail acima antes de solicitar a redefinição.')
      return
    }
    router.push(`/esqueci-senha?email=${encodeURIComponent(email.toLowerCase().trim())}`)
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
            {precisaCodigo ? 'Confirme seu acesso' : 'Entrar na plataforma'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {precisaCodigo
              ? `Novo dispositivo detectado. Enviamos um código para ${email}.`
              : 'Use o e-mail e a senha cadastrados na sua conta.'}
          </p>

          {precisaCodigo ? (
            <form onSubmit={handleConfirmarCodigo} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código de verificação</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition tracking-widest"
                  placeholder="000000"
                  value={codigo}
                  onChange={e => { setCodigo(e.target.value); setErro(null) }}
                />
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-700 text-sm">{erro}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || codigo.length < 4}
                className="w-full font-bold py-3.5 rounded-xl text-white text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: loading ? '#93c5fd' : '#1d6fe8' }}
              >
                {loading ? 'Confirmando...' : <>Confirmar <span>→</span></>}
              </button>

              <button
                type="button"
                onClick={() => { setPrecisaCodigo(false); setCodigo(''); setErro(null) }}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
              >
                ← Voltar
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition mb-5"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z"/>
                  <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
                </svg>
                Continuar com Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
