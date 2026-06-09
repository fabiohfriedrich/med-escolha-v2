'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type Tab = 'dados' | 'senha'

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const [tab, setTab] = useState<Tab>('dados')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  // Dados pessoais
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')

  // Troca de senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login'); return }
      setNome(data.user.user_metadata?.full_name ?? '')
      setTelefone(data.user.user_metadata?.phone ?? '')
      setEmail(data.user.email ?? '')
      setLoading(false)
    })
  }, [])

  async function salvarDados(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)

    const updates: Record<string, unknown> = {
      data: { full_name: nome, phone: telefone },
    }
    if (email !== (await supabase.auth.getUser()).data.user?.email) {
      updates.email = email
    }

    const { error } = await supabase.auth.updateUser(updates as Parameters<typeof supabase.auth.updateUser>[0])
    setSalvando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar: ' + error.message })
    } else {
      setMensagem({ tipo: 'ok', texto: email !== (await supabase.auth.getUser()).data.user?.email
        ? 'Dados salvos! Confirme o novo e-mail na sua caixa de entrada.'
        : 'Dados salvos com sucesso!' })
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha.length < 8) {
      setMensagem({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 8 caracteres.' })
      return
    }
    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem.' })
      return
    }
    setSalvando(true)
    setMensagem(null)

    // Verifica a senha atual reautenticando
    const { data: { user } } = await supabase.auth.getUser()
    const { error: reautError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: senhaAtual,
    })
    if (reautError) {
      setSalvando(false)
      setMensagem({ tipo: 'erro', texto: 'Senha atual incorreta.' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao trocar senha: ' + error.message })
    } else {
      setMensagem({ tipo: 'ok', texto: 'Senha alterada com sucesso!' })
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-blue-900">Meu Perfil</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie seus dados e senha de acesso</p>
        </div>

        {/* Abas */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {(['dados', 'senha'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setMensagem(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                tab === t ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'dados' ? '👤 Dados pessoais' : '🔒 Trocar senha'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Mensagem de feedback */}
          {mensagem && (
            <div className={`rounded-xl p-3 mb-6 text-sm ${
              mensagem.tipo === 'ok'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {mensagem.texto}
            </div>
          )}

          {/* Aba: Dados pessoais */}
          {tab === 'dados' && (
            <form onSubmit={salvarDados} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome completo</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">Ao alterar o e-mail, você receberá uma confirmação.</p>
              </div>
              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition disabled:opacity-60 text-sm"
              >
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          )}

          {/* Aba: Trocar senha */}
          {tab === 'senha' && (
            <form onSubmit={trocarSenha} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Senha atual</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  value={senhaAtual}
                  onChange={e => setSenhaAtual(e.target.value)}
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
                  onChange={e => setNovaSenha(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar nova senha</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={salvando || !senhaAtual || novaSenha.length < 8 || novaSenha !== confirmarSenha}
                className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition disabled:opacity-50 text-sm"
              >
                {salvando ? 'Alterando...' : 'Alterar senha'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800">← Voltar ao teste</a>
        </div>
      </div>
    </div>
  )
}
