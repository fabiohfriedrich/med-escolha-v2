'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Especialidade {
  id: number
  nome: string
  descricao: string
  rotina_tipica: string
  especialistas: number | null
  por_100k_hab: number | null
  pct_mulheres: number | null
  media_idade: number | null
  // from dmb_data.json
  salario_min?: number
  salario_max?: number
  anos_formacao?: number
  saturacao?: string
  crescimento?: string
}

const SAT_STYLE: Record<string, { bg: string; color: string }> = {
  Baixa: { bg: '#dcfce7', color: '#15803d' },
  Média: { bg: '#fef3c7', color: '#b45309' },
  Alta:  { bg: '#fee2e2', color: '#dc2626' },
}
const CRESC_STYLE: Record<string, { bg: string; color: string }> = {
  Alto:  { bg: '#dcfce7', color: '#15803d' },
  Médio: { bg: '#dbeafe', color: '#1d4ed8' },
  Baixo: { bg: '#f3f4f6', color: '#6b7280' },
}

const CATEGORIAS: Record<string, number[]> = {
  'Clínicas': [2,5,16,17,19,20,21,23,24,25,27,29,30,32,34,35,39,41,42,44,50,51,54],
  'Cirúrgicas': [3,6,7,8,9,10,11,12,13,14,15,17,40,43,45,46,55],
  'Diagnóstico': [37,47,48,52],
  'Preventiva / Social': [31,32,36,38],
  'Procedurais': [4,20,33],
  'Integrativas': [1,26],
}

function getCat(id: number) {
  for (const [cat, ids] of Object.entries(CATEGORIAS)) {
    if (ids.includes(id)) return cat
  }
  return 'Outras'
}

interface Props {
  especialidades: Especialidade[]
  backHref?: string
}

export default function EspecialidadesLibrary({ especialidades, backHref }: Props) {
  const [busca, setBusca] = useState('')
  const [catFiltro, setCatFiltro] = useState('Todas')
  const [satFiltro, setSatFiltro] = useState('Todas')
  const [ordenar, setOrdenar] = useState<'nome' | 'especialistas' | 'salario'>('nome')

  const categorias = ['Todas', ...Array.from(new Set(especialidades.map(e => getCat(e.id)))).sort()]

  const filtradas = useMemo(() => {
    let list = [...especialidades]
    if (busca.trim()) {
      const q = busca.toLowerCase()
      list = list.filter(e => e.nome.toLowerCase().includes(q) || e.descricao?.toLowerCase().includes(q))
    }
    if (catFiltro !== 'Todas') list = list.filter(e => getCat(e.id) === catFiltro)
    if (satFiltro !== 'Todas') list = list.filter(e => e.saturacao === satFiltro)

    list.sort((a, b) => {
      if (ordenar === 'especialistas') return (b.especialistas ?? 0) - (a.especialistas ?? 0)
      if (ordenar === 'salario') return (b.salario_max ?? 0) - (a.salario_max ?? 0)
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })
    return list
  }, [especialidades, busca, catFiltro, satFiltro, ordenar])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {backHref && (
            <Link href={backHref} className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white text-sm mb-6 transition">
              ← Voltar ao resultado
            </Link>
          )}
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Med Escolha · por Amo Medicina</p>
          <h1 className="text-3xl font-extrabold mb-2">Biblioteca de Especialidades</h1>
          <p className="text-blue-200 text-sm">
            {especialidades.length} especialidades reconhecidas pelo CFM · Dados do DMB 2025 (FMUSP/AMB)
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
          {/* Busca */}
          <div className="relative flex-1 min-w-[180px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar especialidade..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Categoria */}
          <select value={catFiltro} onChange={e => setCatFiltro(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300">
            {categorias.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Saturação */}
          <select value={satFiltro} onChange={e => setSatFiltro(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option>Todas</option>
            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
          </select>

          {/* Ordenar */}
          <select value={ordenar} onChange={e => setOrdenar(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="nome">A–Z</option>
            <option value="especialistas">Mais especialistas</option>
            <option value="salario">Maior salário</option>
          </select>

          <span className="text-xs text-gray-400 ml-auto hidden sm:inline">{filtradas.length} especialidades</span>
        </div>
      </div>

      {/* Grade */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {filtradas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold">Nenhuma especialidade encontrada</p>
            <button onClick={() => { setBusca(''); setCatFiltro('Todas'); setSatFiltro('Todas') }}
              className="mt-4 text-sm text-blue-600 underline">Limpar filtros</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtradas.map(e => {
              const sat = e.saturacao ? SAT_STYLE[e.saturacao] : undefined
              const cresc = e.crescimento ? CRESC_STYLE[e.crescimento] : undefined
              const cat = getCat(e.id)

              return (
                <Link key={e.id} href={`/especialidades/${e.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 flex flex-col gap-3 group">
                  {/* Categoria tag */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{cat}</span>
                    {e.especialistas && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {e.especialistas.toLocaleString('pt-BR')} esp.
                      </span>
                    )}
                  </div>

                  {/* Nome */}
                  <h3 className="font-extrabold text-blue-900 text-base leading-tight group-hover:text-blue-700 transition">
                    {e.nome}
                  </h3>

                  {/* Descrição resumida */}
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                    {e.descricao}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-50">
                    {sat && e.saturacao && (
                      <span style={{ background: sat.bg, color: sat.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                        Sat. {e.saturacao}
                      </span>
                    )}
                    {cresc && e.crescimento && (
                      <span style={{ background: cresc.bg, color: cresc.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                        Cresc. {e.crescimento}
                      </span>
                    )}
                    {e.anos_formacao && (
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8 }}>
                        {e.anos_formacao} anos
                      </span>
                    )}
                    {e.por_100k_hab && (
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8 }}>
                        {e.por_100k_hab}/100k hab.
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
