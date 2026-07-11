'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs/legacy'

function EsqueciSenhaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, isLoaded, setActive } = useSignIn()

  const [step, setStep] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded || !email.includes('@')) return
    setLoading(true)
    setErro(null)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.toLowerCase().trim(),
      })
    } catch {
      // Não revela se o e-mail existe ou não — segue para a próxima etapa de qualquer forma
    } finally {
      setStep('codigo')
      setLoading(false)
    }
  }

  async function handleRedefinir(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    if (novaSenha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    setLoading(true)
    setErro(null)
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: codigo,
        password: novaSenha,
      })
      if (result.status !== 'complete') {
        setErro('Código inválido ou expirado. Solicite um novo.')
        setLoading(false)
        return
      }
      await setActive({ session: result.createdSessionId })
      router.push('/')
      router.refresh()
    } catch {
      setErro('Código inválido ou expirado. Solicite um novo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900">Med Escolha</h1>
          <p className="text-gray-500 mt-1 text-sm">Redefinir senha</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 'email' ? (
            <>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">Esqueceu sua senha?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Digite seu e-mail cadastrado. Vamos enviar um código de verificação.
              </p>
              <form onSubmit={handleEnviarCodigo} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email.includes('@')}
                  className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition disabled:opacity-50 text-sm"
                >
                  {loading ? 'Enviando...' : 'Enviar código →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">Digite o código</h2>
              <p className="text-gray-500 text-sm mb-6">
                Se <strong>{email}</strong> estiver cadastrado, você recebeu um código de 6 dígitos. Digite abaixo junto com sua nova senha.
              </p>
              <form onSubmit={handleRedefinir} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Código de verificação</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
                    placeholder="000000"
                    value={codigo}
                    onChange={e => { setCodigo(e.target.value); setErro(null) }}
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
                    value={novaSenha}
                    onChange={e => { setNovaSenha(e.target.value); setErro(null) }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar nova senha</label>
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

                {erro && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-700 text-sm">{erro}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || codigo.length < 4 || novaSenha.length < 8 || novaSenha !== confirmar}
                  className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition disabled:opacity-50 text-sm"
                >
                  {loading ? 'Redefinindo...' : 'Redefinir senha e entrar →'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setErro(null) }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Usar outro e-mail
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Problemas? <span className="text-blue-500">contato@euamomedicina.com</span>
        </p>
      </div>
    </div>
  )
}

export default function EsqueciSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EsqueciSenhaContent />
    </Suspense>
  )
}
