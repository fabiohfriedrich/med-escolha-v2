'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import specialtiesData from '@/data/specialties.json'
import type { EditalComInstituicao } from '@/lib/radar'

const SPECIALTIES = specialtiesData.specialties as { id: number; nome: string }[]

interface VagaRow {
  especialidade_id: number
  vagas: number | null
  acesso_direto: boolean
}

function toInputDate(v: string | null) {
  return v ?? ''
}

export default function EditalEditClient({ edital }: { edital: EditalComInstituicao }) {
  const router = useRouter()
  const [form, setForm] = useState({
    status: edital.status,
    temporada: edital.temporada,
    link_oficial: edital.link_oficial ?? '',
    inscricao_inicio: toInputDate(edital.inscricao_inicio),
    inscricao_fim: toInputDate(edital.inscricao_fim),
    taxa: edital.taxa ?? '',
    etapas: edital.etapas ?? '',
    data_prova: toInputDate(edital.data_prova),
    data_gabarito: toInputDate(edital.data_gabarito),
    data_resultado: toInputDate(edital.data_resultado),
    observacoes: edital.observacoes ?? '',
  })
  const [vagas, setVagas] = useState<VagaRow[]>(
    (edital.edital_vagas ?? []).map((v) => ({ especialidade_id: v.especialidade_id, vagas: v.vagas, acesso_direto: v.acesso_direto }))
  )
  const [novaEspecialidade, setNovaEspecialidade] = useState<number | ''>('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const especialidadesDisponiveis = SPECIALTIES.filter((s) => !vagas.some((v) => v.especialidade_id === s.id))

  function atualizarCampo<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
    setSalvo(false)
  }

  function adicionarVaga() {
    if (novaEspecialidade === '') return
    setVagas((v) => [...v, { especialidade_id: novaEspecialidade, vagas: null, acesso_direto: false }])
    setNovaEspecialidade('')
    setSalvo(false)
  }

  function removerVaga(especialidadeId: number) {
    setVagas((v) => v.filter((x) => x.especialidade_id !== especialidadeId))
    setSalvo(false)
  }

  function atualizarVaga(especialidadeId: number, campo: keyof VagaRow, valor: number | boolean | null) {
    setVagas((v) => v.map((x) => (x.especialidade_id === especialidadeId ? { ...x, [campo]: valor } : x)))
    setSalvo(false)
  }

  async function salvar() {
    setSalvando(true)
    setSalvo(false)
    const res = await fetch(`/api/admin/radar/editais/${edital.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        taxa: form.taxa === '' ? null : Number(form.taxa),
        etapas: form.etapas === '' ? null : Number(form.etapas),
        inscricao_inicio: form.inscricao_inicio || null,
        inscricao_fim: form.inscricao_fim || null,
        data_prova: form.data_prova || null,
        data_gabarito: form.data_gabarito || null,
        data_resultado: form.data_resultado || null,
        link_oficial: form.link_oficial || null,
        observacoes: form.observacoes || null,
        vagas,
      }),
    })
    setSalvando(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
      alert(`Não consegui salvar: ${error}`)
      return
    }
    setSalvo(true)
    router.refresh()
  }

  const inputClass = 'w-full text-sm px-3 py-2 rounded-lg border border-gray-200'
  const labelClass = 'text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1'

  return (
    <div>
      <Link href="/admin/radar" className="text-sm text-blue-700 hover:text-blue-900 font-semibold">
        ← Radar de Residência
      </Link>
      <h1 className="text-2xl font-extrabold text-blue-900 mt-2 mb-1">{edital.instituicao.nome}</h1>
      <p className="text-sm text-gray-400 mb-6">{edital.instituicao.uf ?? 'Nacional'} · {edital.instituicao.sigla}</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Temporada</label>
          <input className={inputClass} value={form.temporada} onChange={(e) => atualizarCampo('temporada', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => atualizarCampo('status', e.target.value as typeof form.status)}>
            <option value="previsto">Previsto</option>
            <option value="aberto">Aberto</option>
            <option value="encerrado">Encerrado</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Taxa (R$)</label>
          <input type="number" step="0.01" className={inputClass} value={form.taxa} onChange={(e) => atualizarCampo('taxa', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Etapas do processo</label>
          <input type="number" min={1} step="1" className={inputClass} value={form.etapas} onChange={(e) => atualizarCampo('etapas', e.target.value)} placeholder="Ex: 2" />
        </div>
        <div>
          <label className={labelClass}>Inscrições de</label>
          <input type="date" className={inputClass} value={form.inscricao_inicio} onChange={(e) => atualizarCampo('inscricao_inicio', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Inscrições até</label>
          <input type="date" className={inputClass} value={form.inscricao_fim} onChange={(e) => atualizarCampo('inscricao_fim', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Data da prova</label>
          <input type="date" className={inputClass} value={form.data_prova} onChange={(e) => atualizarCampo('data_prova', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Data do gabarito</label>
          <input type="date" className={inputClass} value={form.data_gabarito} onChange={(e) => atualizarCampo('data_gabarito', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Data do resultado</label>
          <input type="date" className={inputClass} value={form.data_resultado} onChange={(e) => atualizarCampo('data_resultado', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Link oficial (se vazio, usa o site da instituição)</label>
          <input className={inputClass} value={form.link_oficial} onChange={(e) => atualizarCampo('link_oficial', e.target.value)} placeholder={edital.instituicao.site} />
        </div>
        <div className="md:col-span-3">
          <label className={labelClass}>Observações</label>
          <textarea className={inputClass} rows={2} value={form.observacoes} onChange={(e) => atualizarCampo('observacoes', e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-blue-900 mb-4">Vagas por especialidade ({vagas.length})</h2>

        {vagas.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {vagas.map((v) => {
              const nome = SPECIALTIES.find((s) => s.id === v.especialidade_id)?.nome ?? `#${v.especialidade_id}`
              return (
                <div key={v.especialidade_id} className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span className="flex-1 font-semibold text-gray-700">{nome}</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="vagas"
                    className="w-24 text-sm px-2 py-1 rounded border border-gray-200"
                    value={v.vagas ?? ''}
                    onChange={(e) => atualizarVaga(v.especialidade_id, 'vagas', e.target.value === '' ? null : Number(e.target.value))}
                  />
                  <label className="flex items-center gap-1 text-xs text-gray-500">
                    <input
                      type="checkbox"
                      checked={v.acesso_direto}
                      onChange={(e) => atualizarVaga(v.especialidade_id, 'acesso_direto', e.target.checked)}
                    />
                    acesso direto
                  </label>
                  <button onClick={() => removerVaga(v.especialidade_id)} className="text-red-500 hover:text-red-700 text-xs font-bold">
                    remover
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2">
          <select
            className={inputClass}
            value={novaEspecialidade}
            onChange={(e) => setNovaEspecialidade(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Adicionar especialidade...</option>
            {especialidadesDisponiveis.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
          <button onClick={adicionarVaga} className="bg-gray-100 text-gray-700 font-bold text-sm px-4 rounded-lg hover:bg-gray-200 transition whitespace-nowrap">
            + Adicionar
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-blue-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-800 transition disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        {salvo && <span className="text-green-700 font-bold text-sm">Salvo ✓</span>}
      </div>
    </div>
  )
}
