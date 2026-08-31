'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Registro {
  id: string
  pacote_id: string
  data_call: string
  resumo: string
  created_at: string
}

interface Comprador {
  id: string
  nome: string | null
  email: string
  sessoes_total: number
  sessoes_usadas: number
  saldo: number
  ativo: boolean
  created_at: string
  registros: Registro[]
}

export default function PsicologoAdminPage() {
  const router = useRouter()
  const [compradores, setCompradores] = useState<Comprador[] | null>(null)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)
  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [dataCall, setDataCall] = useState('')
  const [resumo, setResumo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function carregar() {
    fetch('/api/admin-psicologo/compradores')
      .then((r) => {
        if (r.status === 401) {
          router.push('/admin/psicologo/login')
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (d) setCompradores(d.compradores ?? [])
      })
      .catch(() => setErroCarregamento('Não foi possível carregar a lista.'))
  }

  useEffect(carregar, [])

  async function sair() {
    await fetch('/api/admin-psicologo/login', { method: 'DELETE' })
    router.push('/admin/psicologo/login')
  }

  function abrirFormulario(id: string) {
    setAbertoId(id)
    setDataCall('')
    setResumo('')
    setErroForm(null)
  }

  async function salvarRegistro(pacoteId: string) {
    if (!dataCall || !resumo.trim()) {
      setErroForm('Preencha a data e o resumo.')
      return
    }
    setSalvando(true)
    setErroForm(null)
    const res = await fetch('/api/admin-psicologo/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pacote_id: pacoteId, data_call: dataCall, resumo }),
    })
    setSalvando(false)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setErroForm(body?.error ?? 'Erro ao salvar.')
      return
    }
    setAbertoId(null)
    carregar()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-extrabold text-sm tracking-wide">MED ESCOLHA · SESSÕES</span>
          <button onClick={sair} className="text-blue-300 hover:text-white text-xs font-medium transition">
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-extrabold text-blue-900 mb-1">Quem comprou o pacote de sessões</h1>
        <p className="text-sm text-gray-500 mb-6">
          Depois de cada call, registre a data e um resumo pra descontar a sessão do pacote da pessoa.
        </p>

        {erroCarregamento && <p className="text-red-500 text-sm mb-4">{erroCarregamento}</p>}
        {compradores === null && !erroCarregamento && <p className="text-gray-400 text-sm">Carregando...</p>}
        {compradores?.length === 0 && (
          <p className="text-gray-400 text-sm">Ninguém comprou o pacote ainda.</p>
        )}

        <div className="space-y-3">
          {compradores?.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">{c.nome || c.email}</p>
                  <p className="text-xs text-gray-400">{c.email}</p>
                </div>
                <span
                  className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
                    c.saldo > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {c.saldo} de {c.sessoes_total} disponíve{c.saldo === 1 ? 'l' : 'is'}
                </span>
              </div>

              {c.registros.length > 0 && (
                <div className="mt-4 space-y-2">
                  {c.registros.map((r) => (
                    <div key={r.id} className="text-xs bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-600 mb-1">
                        {new Date(r.data_call + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-gray-500 whitespace-pre-wrap">{r.resumo}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                {abertoId === c.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Data da call</label>
                      <input
                        type="date"
                        value={dataCall}
                        onChange={(e) => setDataCall(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Resumo da sessão</label>
                      <textarea
                        value={resumo}
                        onChange={(e) => setResumo(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="O que foi conversado, próximos passos..."
                      />
                    </div>
                    {erroForm && <p className="text-red-500 text-xs">{erroForm}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => salvarRegistro(c.id)}
                        disabled={salvando}
                        className="bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-60"
                      >
                        {salvando ? 'Salvando...' : 'Salvar e descontar sessão'}
                      </button>
                      <button
                        onClick={() => setAbertoId(null)}
                        className="text-gray-500 text-sm font-medium px-4 py-2 hover:text-gray-700 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => abrirFormulario(c.id)}
                    disabled={c.saldo <= 0}
                    className="text-blue-700 text-sm font-bold hover:text-blue-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + registrar sessão realizada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
