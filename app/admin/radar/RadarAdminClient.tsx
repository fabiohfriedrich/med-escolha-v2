'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDateBR, getStatusVisual, TIPO_LABEL, type EditalComInstituicao, type Instituicao } from '@/lib/radar'

const TIPOS = Object.keys(TIPO_LABEL)

interface Props {
  instituicoes: Instituicao[]
  editais: EditalComInstituicao[]
}

export default function RadarAdminClient({ instituicoes, editais }: Props) {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [salvandoId, setSalvandoId] = useState<string | null>(null)
  const [mostrarFormInstituicao, setMostrarFormInstituicao] = useState(false)

  const editaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return editais
    return editais.filter(
      (e) => e.instituicao.nome.toLowerCase().includes(termo) || e.instituicao.sigla.toLowerCase().includes(termo)
    )
  }, [editais, busca])

  async function mudarStatus(editalId: string, status: string) {
    setSalvandoId(editalId)
    await fetch(`/api/admin/radar/editais/${editalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setSalvandoId(null)
    router.refresh()
  }

  async function duplicar(editalId: string, instituicaoNome: string) {
    const temporada = window.prompt(`Nova temporada pro edital duplicado de ${instituicaoNome} (ex: 2027/2028):`)
    if (!temporada) return
    const res = await fetch('/api/admin/radar/editais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duplicateFromId: editalId, temporada }),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
      alert(`Não consegui duplicar: ${error}`)
      return
    }
    router.refresh()
  }

  async function excluir(editalId: string, instituicaoNome: string) {
    if (!window.confirm(`Excluir o edital de ${instituicaoNome}? Essa ação não pode ser desfeita.`)) return
    await fetch(`/api/admin/radar/editais/${editalId}`, { method: 'DELETE' })
    router.refresh()
  }

  async function criarInstituicao(formData: FormData) {
    const payload = Object.fromEntries(formData.entries())
    const res = await fetch('/api/admin/radar/instituicoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
      alert(`Não consegui criar: ${error}`)
      return
    }
    setMostrarFormInstituicao(false)
    router.refresh()
  }

  async function criarEditalPrevisto(instituicaoId: string, temporada: string) {
    if (!temporada) return
    const res = await fetch('/api/admin/radar/editais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instituicao_id: instituicaoId, temporada }),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
      alert(`Não consegui criar: ${error}`)
      return
    }
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-blue-900">Radar de Residência</h1>
        <input
          type="text"
          placeholder="Buscar instituição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border border-gray-200 w-64"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Instituição</th>
              <th className="text-left px-4 py-3">Temporada</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Inscrições</th>
              <th className="text-left px-4 py-3">Prova</th>
              <th className="text-left px-4 py-3">Vagas</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {editaisFiltrados.map((edital) => {
              const status = getStatusVisual(edital)
              const nVagas = (edital.edital_vagas ?? []).length
              return (
                <tr key={edital.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <p className="font-bold text-blue-900">{edital.instituicao.sigla}</p>
                    <p className="text-xs text-gray-400">{edital.instituicao.uf ?? 'Nacional'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{edital.temporada}</td>
                  <td className="px-4 py-3">
                    <select
                      value={edital.status}
                      disabled={salvandoId === edital.id}
                      onChange={(e) => mudarStatus(edital.id, e.target.value)}
                      style={{ background: status.background, color: status.color }}
                      className="text-xs font-bold px-2 py-1.5 rounded-lg border-0 cursor-pointer"
                    >
                      <option value="previsto">Previsto</option>
                      <option value="aberto">Aberto</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {formatDateBR(edital.inscricao_inicio)} – {formatDateBR(edital.inscricao_fim)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDateBR(edital.data_prova)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{nVagas > 0 ? `${nVagas} espec.` : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <Link href={`/admin/radar/editais/${edital.id}`} className="text-blue-700 hover:text-blue-900">
                        Editar
                      </Link>
                      <button onClick={() => duplicar(edital.id, edital.instituicao.sigla)} className="text-teal-600 hover:text-teal-800">
                        Duplicar
                      </button>
                      <button onClick={() => excluir(edital.id, edital.instituicao.sigla)} className="text-red-500 hover:text-red-700">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-blue-900">Instituições ({instituicoes.length})</h2>
          <button
            onClick={() => setMostrarFormInstituicao((v) => !v)}
            className="text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            {mostrarFormInstituicao ? 'Cancelar' : '+ Nova instituição'}
          </button>
        </div>

        {mostrarFormInstituicao && (
          <form
            action={criarInstituicao}
            className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 p-4 bg-gray-50 rounded-xl"
          >
            <input name="nome" placeholder="Nome oficial" required className="col-span-2 text-sm px-3 py-2 rounded-lg border border-gray-200" />
            <input name="sigla" placeholder="Sigla" required className="text-sm px-3 py-2 rounded-lg border border-gray-200" />
            <input name="uf" placeholder="UF (ou vazio)" maxLength={2} className="text-sm px-3 py-2 rounded-lg border border-gray-200" />
            <select name="tipo" required className="text-sm px-3 py-2 rounded-lg border border-gray-200">
              {TIPOS.map((t) => (
                <option key={t} value={t}>{TIPO_LABEL[t]}</option>
              ))}
            </select>
            <input name="site" placeholder="https://..." required className="col-span-2 md:col-span-4 text-sm px-3 py-2 rounded-lg border border-gray-200" />
            <button type="submit" className="bg-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-800 transition">
              Criar
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {instituicoes.map((inst) => (
            <div key={inst.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-gray-50">
              <div>
                <span className="font-bold text-blue-900">{inst.sigla}</span>{' '}
                <span className="text-gray-500 text-xs">{inst.uf ?? 'Nacional'} · {TIPO_LABEL[inst.tipo]}</span>
              </div>
              <button
                onClick={() => {
                  const temporada = window.prompt(`Temporada do novo edital "previsto" pra ${inst.sigla} (ex: 2026/2027):`)
                  if (temporada) criarEditalPrevisto(inst.id, temporada)
                }}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800"
              >
                + edital
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
