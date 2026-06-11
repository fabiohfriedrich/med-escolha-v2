'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Comprador {
  id: string
  email: string
  nome: string | null
  testes_realizados: number
  testes_limite: number
  ativo: boolean
  status_pagamento: string
  tipo: string
  notas: string | null
  created_at: string
}

interface Props {
  compradores: Comprador[]
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pago:                 { label: 'Pago',               cls: 'bg-green-100 text-green-700' },
  reembolso_solicitado: { label: 'Reembolso solicitado', cls: 'bg-yellow-100 text-yellow-700' },
  reembolsado:          { label: 'Reembolsado',         cls: 'bg-orange-100 text-orange-700' },
  chargeback:           { label: 'Chargeback',          cls: 'bg-red-100 text-red-700' },
  cancelado:            { label: 'Cancelado',           cls: 'bg-gray-100 text-gray-500' },
}

const TIPO_CONFIG: Record<string, { label: string; cls: string }> = {
  comprador: { label: 'Comprador', cls: 'bg-blue-50 text-blue-700' },
  parceria:  { label: 'Parceria',  cls: 'bg-purple-50 text-purple-700' },
  cortesia:  { label: 'Cortesia',  cls: 'bg-pink-50 text-pink-700' },
}

type Filtro = 'todos' | 'ativos' | 'inativos' | 'sem_teste' | 'reembolso'

export default function CompradoresClient({ compradores }: Props) {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [notasEditando, setNotasEditando] = useState('')
  const [limiteEditando, setLimiteEditando] = useState<number>(2)
  const [senhaId, setSenhaId] = useState<string | null>(null)
  const [novaSenha, setNovaSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [senhaMsg, setSenhaMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  // Formulário de novo comprador
  const [novoEmail, setNovoEmail] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [novoTipo, setNovoTipo] = useState('comprador')
  const [novoNotas, setNovoNotas] = useState('')
  const [novoLimite, setNovoLimite] = useState(2)
  const [adicionando, setAdicionando] = useState(false)

  const filtrados = useMemo(() => {
    let lista = compradores
    if (busca) {
      const q = busca.toLowerCase()
      lista = lista.filter(c =>
        c.email.toLowerCase().includes(q) || (c.nome ?? '').toLowerCase().includes(q)
      )
    }
    if (filtro === 'ativos') lista = lista.filter(c => c.ativo)
    if (filtro === 'inativos') lista = lista.filter(c => !c.ativo)
    if (filtro === 'sem_teste') lista = lista.filter(c => c.testes_realizados === 0 && c.ativo)
    if (filtro === 'reembolso') lista = lista.filter(c => c.status_pagamento === 'reembolso_solicitado' || c.status_pagamento === 'reembolsado')
    return lista
  }, [compradores, busca, filtro])

  async function adicionarManual() {
    if (!novoEmail.includes('@')) return
    setAdicionando(true)
    await fetch('/api/admin/compradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: novoEmail, nome: novoNome, tipo: novoTipo, notas: novoNotas, testes_limite: novoLimite }),
    })
    setAdicionando(false)
    setNovoEmail(''); setNovoNome(''); setNovoTipo('comprador'); setNovoNotas(''); setNovoLimite(2)
    setShowForm(false)
    router.refresh()
  }

  async function patch(id: string, fields: Record<string, unknown>) {
    setLoadingId(id)
    await fetch('/api/admin/compradores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    })
    setLoadingId(null)
    router.refresh()
  }

  function toggleAtivo(c: Comprador) {
    const newAtivo = !c.ativo
    const fields: Record<string, unknown> = { ativo: newAtivo }
    if (newAtivo) fields.status_pagamento = 'pago'
    patch(c.id, fields)
  }

  async function salvarSenha(email: string) {
    if (novaSenha.length < 6) { setSenhaMsg({ ok: false, texto: 'Mínimo 6 caracteres' }); return }
    setSalvandoSenha(true)
    setSenhaMsg(null)
    const res = await fetch('/api/admin/compradores/senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha: novaSenha }),
    })
    const data = await res.json()
    setSalvandoSenha(false)
    if (res.ok) {
      setSenhaMsg({ ok: true, texto: 'Senha alterada!' })
      setTimeout(() => { setSenhaId(null); setNovaSenha(''); setSenhaMsg(null) }, 1500)
    } else {
      setSenhaMsg({ ok: false, texto: data.error ?? 'Erro ao salvar' })
    }
  }

  function exportarCSV() {
    const header = ['Nome', 'Email', 'Tipo', 'Status Pagamento', 'Ativo', 'Testes', 'Limite', 'Notas', 'Cadastro']
    const rows = filtrados.map(c => [
      c.nome ?? '',
      c.email,
      TIPO_CONFIG[c.tipo]?.label ?? c.tipo,
      STATUS_CONFIG[c.status_pagamento]?.label ?? c.status_pagamento,
      c.ativo ? 'Sim' : 'Não',
      c.testes_realizados,
      c.testes_limite,
      (c.notas ?? '').replace(/\n/g, ' '),
      new Date(c.created_at).toLocaleDateString('pt-BR'),
    ])
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'compradores.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const chips: { key: Filtro; label: string; count: number }[] = [
    { key: 'todos',     label: 'Todos',             count: compradores.length },
    { key: 'ativos',    label: 'Ativos',             count: compradores.filter(c => c.ativo).length },
    { key: 'inativos',  label: 'Inativos',           count: compradores.filter(c => !c.ativo).length },
    { key: 'sem_teste', label: 'Nunca testaram',     count: compradores.filter(c => c.testes_realizados === 0 && c.ativo).length },
    { key: 'reembolso', label: 'Reembolso',          count: compradores.filter(c => c.status_pagamento === 'reembolso_solicitado' || c.status_pagamento === 'reembolsado').length },
  ]

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <button
          onClick={exportarCSV}
          className="bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm whitespace-nowrap"
        >
          ↓ Exportar CSV
        </button>
        <button
          onClick={() => setShowForm(f => !f)}
          className="bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-800 transition text-sm whitespace-nowrap"
        >
          + Adicionar manualmente
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2">
        {chips.map(chip => (
          <button
            key={chip.key}
            onClick={() => setFiltro(chip.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
              filtro === chip.key
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            {chip.label}
            <span className={`ml-1.5 ${filtro === chip.key ? 'text-blue-200' : 'text-gray-400'}`}>
              {chip.count}
            </span>
          </button>
        ))}
      </div>

      {/* Formulário de adição manual */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-bold text-blue-800">Novo comprador / parceria</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemplo.com" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nome</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo" value={novoNome} onChange={e => setNovoNome(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={novoTipo} onChange={e => setNovoTipo(e.target.value)}>
                <option value="comprador">Comprador</option>
                <option value="parceria">Parceria</option>
                <option value="cortesia">Cortesia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Limite de testes</label>
              <input type="number" min={1} max={10} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={novoLimite} onChange={e => setNovoLimite(Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notas internas</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: parceria com faculdade X, cortesia para evento Y..." value={novoNotas} onChange={e => setNovoNotas(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={adicionarManual} disabled={adicionando}
              className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-60">
              {adicionando ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 text-sm px-3 py-2 hover:text-gray-800">Cancelar</button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome / Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Testes</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cadastro</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => {
                const statusCfg = STATUS_CONFIG[c.status_pagamento] ?? { label: c.status_pagamento, cls: 'bg-gray-100 text-gray-500' }
                const tipoCfg = TIPO_CONFIG[c.tipo] ?? { label: c.tipo, cls: 'bg-gray-50 text-gray-600' }
                const isEditing = editandoId === c.id
                return (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-800">{c.nome || '—'}</div>
                      <div className="text-gray-400 text-xs">{c.email}</div>
                      {c.notas && !isEditing && (
                        <div className="text-xs text-gray-400 italic mt-0.5 max-w-xs truncate" title={c.notas}>
                          📝 {c.notas}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tipoCfg.cls}`}>
                        {tipoCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input type="number" min={1} max={20}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                          value={limiteEditando}
                          onChange={e => setLimiteEditando(Number(e.target.value))}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min((c.testes_realizados / c.testes_limite) * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                            {c.testes_realizados}/{c.testes_limite}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-[180px]">
                          <textarea
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs resize-none"
                            rows={2} placeholder="Notas internas..."
                            value={notasEditando}
                            onChange={e => setNotasEditando(e.target.value)}
                          />
                          <div className="flex gap-1">
                            <select
                              className="flex-1 border border-gray-300 rounded px-1 py-1 text-xs"
                              defaultValue={c.status_pagamento}
                              id={`status-${c.id}`}
                            >
                              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={async () => {
                                const sel = document.getElementById(`status-${c.id}`) as HTMLSelectElement
                                await patch(c.id, {
                                  testes_limite: limiteEditando,
                                  notas: notasEditando,
                                  status_pagamento: sel?.value ?? c.status_pagamento,
                                })
                                setEditandoId(null)
                              }}
                              disabled={loadingId === c.id}
                              className="flex-1 text-xs font-semibold px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Salvar
                            </button>
                            <button onClick={() => setEditandoId(null)}
                              className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => toggleAtivo(c)}
                            disabled={loadingId === c.id}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${c.ativo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} disabled:opacity-50`}
                          >
                            {c.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          {c.testes_realizados > 0 && (
                            <button
                              onClick={() => patch(c.id, { testes_realizados: 0 })}
                              disabled={loadingId === c.id}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition disabled:opacity-50"
                            >
                              Resetar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditandoId(c.id)
                              setNotasEditando(c.notas ?? '')
                              setLimiteEditando(c.testes_limite)
                            }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                          >
                            Editar
                          </button>
                          <a
                            href={`/admin/respostas?email=${encodeURIComponent(c.email)}`}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          >
                            Ver testes
                          </a>
                          <button
                            onClick={() => { setSenhaId(c.id); setNovaSenha(''); setSenhaMsg(null) }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                          >
                            Senha
                          </button>
                        </div>
                        {senhaId === c.id && (
                          <div className="mt-2 flex flex-col gap-1.5 min-w-[180px]">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                              placeholder="Nova senha (mín. 6 caracteres)"
                              value={novaSenha}
                              onChange={e => { setNovaSenha(e.target.value); setSenhaMsg(null) }}
                            />
                            {senhaMsg && (
                              <p className={`text-xs font-semibold ${senhaMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                                {senhaMsg.texto}
                              </p>
                            )}
                            <div className="flex gap-1">
                              <button
                                onClick={() => salvarSenha(c.email)}
                                disabled={salvandoSenha}
                                className="flex-1 text-xs font-semibold px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                {salvandoSenha ? 'Salvando...' : 'Salvar'}
                              </button>
                              <button
                                onClick={() => { setSenhaId(null); setNovaSenha(''); setSenhaMsg(null) }}
                                className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!filtrados.length && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Nenhum comprador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

}
