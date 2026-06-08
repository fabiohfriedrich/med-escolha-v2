'use client'

import { useState } from 'react'

interface AccessInfo {
  permitido: boolean
  nome?: string
  testes_restantes?: number
  testes_realizados?: number
  testes_limite?: number
  motivo?: string
}

interface Props {
  onAcessoLiberado: (email: string, nome: string) => void
}

const MENSAGENS: Record<string, { titulo: string; texto: string }> = {
  email_nao_encontrado: {
    titulo: 'E-mail não encontrado',
    texto: 'Este e-mail não possui uma compra registrada. Verifique se usou o mesmo e-mail da compra na Hotmart ou adquira o teste em nosso site.',
  },
  acesso_revogado: {
    titulo: 'Acesso indisponível',
    texto: 'O acesso associado a este e-mail foi cancelado. Entre em contato com o suporte.',
  },
  limite_atingido: {
    titulo: 'Limite de testes atingido',
    texto: 'Você já utilizou os 2 testes incluídos na sua compra. Para realizar um novo teste, adquira novamente.',
  },
}

export default function EmailGate({ onAcessoLiberado }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<{ titulo: string; texto: string } | null>(null)
  const [acesso, setAcesso] = useState<AccessInfo | null>(null)

  async function verificar() {
    if (!email.trim() || !email.includes('@')) {
      setErro({ titulo: 'E-mail inválido', texto: 'Digite um e-mail válido para continuar.' })
      return
    }
    setLoading(true)
    setErro(null)

    try {
      const res = await fetch('/api/verificar-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data: AccessInfo = await res.json()
      setAcesso(data)

      if (!data.permitido) {
        setErro(MENSAGENS[data.motivo ?? ''] ?? { titulo: 'Acesso negado', texto: 'Não foi possível verificar seu acesso.' })
      }
    } catch {
      setErro({ titulo: 'Erro de conexão', texto: 'Não foi possível verificar seu acesso. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  function continuar() {
    if (acesso?.permitido) {
      onAcessoLiberado(email.toLowerCase().trim(), acesso.nome ?? '')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900">Med Escolha</h1>
          <p className="text-gray-500 mt-2 text-sm">Teste de Compatibilidade com Especialidades Médicas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Estado: acesso liberado */}
          {acesso?.permitido ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                {acesso.nome ? `Olá, ${acesso.nome.split(' ')[0]}!` : 'Acesso confirmado!'}
              </h2>
              <p className="text-gray-500 text-sm mb-1">
                {acesso.testes_restantes === 2
                  ? 'Você ainda não realizou nenhum teste.'
                  : `Você já realizou ${acesso.testes_realizados} de ${acesso.testes_limite} testes.`}
              </p>
              <p className="text-blue-600 text-sm font-semibold mb-6">
                {acesso.testes_restantes === 1 ? '⚠️ Este é seu último teste disponível.' : `${acesso.testes_restantes} teste(s) restante(s).`}
              </p>
              <button
                onClick={continuar}
                className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition text-base"
              >
                Iniciar o teste →
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">Verificar acesso</h2>
              <p className="text-gray-500 text-sm mb-6">
                Digite o e-mail usado na compra do Med Escolha na Hotmart.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail da compra</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErro(null); setAcesso(null) }}
                    onKeyDown={e => e.key === 'Enter' && verificar()}
                  />
                </div>

                {/* Mensagem de erro */}
                {erro && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="font-semibold text-red-800 text-sm">{erro.titulo}</p>
                    <p className="text-red-600 text-xs mt-1 leading-relaxed">{erro.texto}</p>
                  </div>
                )}

                <button
                  onClick={verificar}
                  disabled={loading}
                  className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition disabled:opacity-60"
                >
                  {loading ? 'Verificando...' : 'Verificar acesso'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Problemas? Entre em contato em <span className="text-blue-500">contato@euamomedicina.com</span>
        </p>
      </div>
    </div>
  )
}
