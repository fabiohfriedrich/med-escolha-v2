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
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: '#0f2d5e', color: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          {backHref && (
            <Link href={backHref} style={{ color: '#93c5fd', fontSize: 14, display: 'inline-block', marginBottom: 20 }}>
              ← Voltar ao resultado
            </Link>
          )}
          <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            Med Escolha · por Amo Medicina
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Biblioteca de Especialidades</h1>
          <p style={{ color: '#93c5fd', fontSize: 14 }}>
            {especialidades.length} especialidades reconhecidas pelo CFM · Dados do DMB 2025 (FMUSP/AMB)
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 24px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar especialidade..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {[
            { value: catFiltro, onChange: (v: string) => setCatFiltro(v), options: categorias },
            { value: satFiltro, onChange: (v: string) => setSatFiltro(v), options: ['Todas', 'Baixa', 'Média', 'Alta'] },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
              style={{ fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 12px', background: '#f8fafc', outline: 'none' }}>
              {sel.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          <select value={ordenar} onChange={e => setOrdenar(e.target.value as any)}
            style={{ fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 12px', background: '#f8fafc', outline: 'none' }}>
            <option value="nome">A–Z</option>
            <option value="especialistas">Mais especialistas</option>
            <option value="salario">Maior salário</option>
          </select>
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{filtradas.length} especialidades</span>
        </div>
      </div>

      {/* Grade */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
            <p style={{ fontWeight: 700 }}>Nenhuma especialidade encontrada</p>
            <button onClick={() => { setBusca(''); setCatFiltro('Todas'); setSatFiltro('Todas') }}
              style={{ marginTop: 16, fontSize: 13, color: '#1d6fe8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtradas.map(e => {
              const sat = e.saturacao ? SAT_STYLE[e.saturacao] : undefined
              const cresc = e.crescimento ? CRESC_STYLE[e.crescimento] : undefined
              const cat = getCat(e.id)

              return (
                <Link key={e.id} href={`/especialidades/${e.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', boxSizing: 'border-box', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#60a5fa' }}>{cat}</span>
                      {e.especialistas && (
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>{e.especialistas.toLocaleString('pt-BR')} esp.</span>
                      )}
                    </div>

                    <h3 style={{ fontWeight: 900, color: '#0f2d5e', fontSize: 15, lineHeight: 1.3, margin: 0 }}>{e.nome}</h3>

                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {e.descricao}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                      {sat && e.saturacao && (
                        <span style={{ ...sat, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 8 }}>Sat. {e.saturacao}</span>
                      )}
                      {cresc && e.crescimento && (
                        <span style={{ ...cresc, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 8 }}>Cresc. {e.crescimento}</span>
                      )}
                      {e.anos_formacao && (
                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 8 }}>{e.anos_formacao} anos res.</span>
                      )}
                      {e.por_100k_hab && (
                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 8 }}>{e.por_100k_hab}/100k hab.</span>
                      )}
                    </div>
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
