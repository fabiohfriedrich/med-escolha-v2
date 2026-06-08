'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Comprador {
  id: string
  email: string
  nome: string | null
  testes_realizados: number
  testes_limite: number
  ativo: boolean
  created_at: string
}

interface Props {
  compradores: Comprador[]
}

export default function CompradoresClient({ compradores }: Props) {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [adicionando, setAdicionando] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const filtrados = compradores.filter(c =>
    c.email.toLowerCase().includes(busca.toLowerCase()) ||
    (c.nome ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  async function adicionarManual() {
    if (!novoEmail.includes('@')) return
    setAdicionando(true)
    await fetch('/api/admin/compradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: novoEmail, nome: novoNome }),
    })
    setAdicionando(false)
    setNovoEmail('')
    setNovoNome('')
    setShowForm(false)
    router.refresh()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    setLoadingId(id)
    await fetch('/api/admin/compradores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: !ativo }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function resetarTestes(id: string) {
    setLoadingId(id)
    await fetch('/api/admin/compradores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, testes_realizados: 0 }),
    })
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <button
          onClick={() => setShowForm(f => !f)}
          className="bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-800 transition text-sm whitespace-nowrap"
        >
          + Adicionar manualmente
        </button>
      </div>

      {/* Formulário de adição manual */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@exemplo.com"
              value={novoEmail}
              onChange={e => setNovoEmail(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nome</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do aluno"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
            />
          </div>
          <button
            onClick={adicionarManual}
            disabled={adicionando}
            className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-60 whitespace-nowrap"
          >
            {adicionando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome / Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Testes</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cadastro</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">{c.nome || '—'}</div>
                    <div className="text-gray-400 text-xs">{c.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${(c.testes_realizados / c.testes_limite) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {c.testes_realizados}/{c.testes_limite}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAtivo(c.id, c.ativo)}
                        disabled={loadingId === c.id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${c.ativo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} disabled:opacity-50`}
                      >
                        {c.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      {c.testes_realizados > 0 && (
                        <button
                          onClick={() => resetarTestes(c.id)}
                          disabled={loadingId === c.id}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition disabled:opacity-50"
                        >
                          Resetar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtrados.length && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Nenhum comprador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
