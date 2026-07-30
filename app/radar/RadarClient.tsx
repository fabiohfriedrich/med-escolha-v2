'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import specialtiesData from '@/data/specialties.json'
import {
  UFS,
  TIPO_LABEL,
  getStatusVisual,
  formatPeriodo,
  formatDateBR,
  formatTaxa,
  ordenarEditais,
  editalCorrespondeAoRadar,
  type EditalComInstituicao,
  type RadarConfig,
} from '@/lib/radar'

const SPECIALTIES = specialtiesData.specialties as { id: number; nome: string }[]

interface Props {
  editais: EditalComInstituicao[]
  isLoggedIn: boolean
  radarConfig: RadarConfig | null
}

export default function RadarClient({ editais, isLoggedIn, radarConfig }: Props) {
  const [especialidadesSel, setEspecialidadesSel] = useState<number[]>(radarConfig?.especialidade_ids ?? [])
  const [ufsSel, setUfsSel] = useState<string[]>(radarConfig?.ufs ?? [])
  const [buscaEspecialidade, setBuscaEspecialidade] = useState('')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  const temFiltroAtivo = especialidadesSel.length > 0 || ufsSel.length > 0

  const especialidadesFiltradas = useMemo(() => {
    const termo = buscaEspecialidade.trim().toLowerCase()
    if (!termo) return SPECIALTIES
    return SPECIALTIES.filter((s) => s.nome.toLowerCase().includes(termo))
  }, [buscaEspecialidade])

  const editaisOrdenados = useMemo(() => ordenarEditais(editais), [editais])

  const editaisFiltrados = useMemo(() => {
    if (!temFiltroAtivo) return editaisOrdenados
    const config: RadarConfig = { especialidade_ids: especialidadesSel, ufs: ufsSel }
    return editaisOrdenados.filter((e) => editalCorrespondeAoRadar(e, config))
  }, [editaisOrdenados, temFiltroAtivo, ufsSel, especialidadesSel])

  function toggleEspecialidade(id: number) {
    setEspecialidadesSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  function toggleUf(sigla: string) {
    setUfsSel((prev) => (prev.includes(sigla) ? prev.filter((x) => x !== sigla) : [...prev, sigla]))
  }
  function limparFiltros() {
    setEspecialidadesSel([])
    setUfsSel([])
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero */}
      <div style={{ background: '#0f2d5e', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 350, height: 350, borderRadius: '50%', background: '#1a4a8a', opacity: 0.15, transform: 'translate(30%, -30%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            Med Escolha
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>Radar de Residência</h1>
          <p style={{ fontSize: 14, color: '#cbd5e1', maxWidth: 560, margin: 0 }}>
            Todos os editais de residência médica da temporada, num lugar só. Configure seu radar
            pessoal e receba aviso por e-mail na hora certa.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 64px' }}>
        {/* Filtros */}
        <div style={{ position: 'relative', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => isLoggedIn && setFiltrosAbertos((v) => !v)}
              disabled={!isLoggedIn}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: isLoggedIn ? 'pointer' : 'not-allowed', color: '#0f2d5e', fontWeight: 800, fontSize: 15 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filtrar por especialidade e estado
              {!isLoggedIn && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isLoggedIn && (
                <Link href="/radar/meu-radar" style={{ fontSize: 12, fontWeight: 700, color: '#1d6fe8', textDecoration: 'none' }}>
                  Editar meu radar →
                </Link>
              )}
              {temFiltroAtivo && (
                <button type="button" onClick={limparFiltros} style={{ fontSize: 12, fontWeight: 700, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Ver tudo
                </button>
              )}
            </div>
          </div>

          {isLoggedIn && filtrosAbertos && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <input
                  type="text"
                  placeholder="Buscar especialidade..."
                  value={buscaEspecialidade}
                  onChange={(e) => setBuscaEspecialidade(e.target.value)}
                  className="w-full max-w-xs text-sm px-3 py-2 rounded-lg border border-gray-200 mb-2"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                  {especialidadesFiltradas.map((s) => {
                    const ativo = especialidadesSel.includes(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleEspecialidade(s.id)}
                        style={{
                          fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: '1px solid',
                          borderColor: ativo ? '#1d6fe8' : '#e2e8f0',
                          background: ativo ? '#dbeafe' : '#f8fafc',
                          color: ativo ? '#1d4ed8' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {s.nome}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Estados</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {UFS.map((uf) => {
                    const ativo = ufsSel.includes(uf.sigla)
                    return (
                      <button
                        key={uf.sigla}
                        type="button"
                        onClick={() => toggleUf(uf.sigla)}
                        title={uf.nome}
                        style={{
                          fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 8, border: '1px solid',
                          borderColor: ativo ? '#1d6fe8' : '#e2e8f0',
                          background: ativo ? '#dbeafe' : '#f8fafc',
                          color: ativo ? '#1d4ed8' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {uf.sigla}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div
              style={{
                position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(255,255,255,0.85)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 13, color: '#475569', margin: 0, maxWidth: 320 }}>
                Entre pra filtrar pelas suas especialidades e estados, e receber alerta por e-mail.
              </p>
              <Link
                href="/login"
                style={{ background: '#0f2d5e', color: 'white', fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 10, textDecoration: 'none' }}
              >
                Entrar
              </Link>
            </div>
          )}
        </div>

        {/* Lista de editais */}
        {editaisFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
            <p style={{ fontSize: 14, margin: 0 }}>Nenhum edital bate com esse filtro ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {editaisFiltrados.map((edital) => (
              <EditalCard key={edital.id} edital={edital} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function EditalCard({ edital }: { edital: EditalComInstituicao }) {
  const link = edital.link_oficial ?? edital.instituicao.site
  const status = getStatusVisual(edital)

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#2563eb', margin: 0 }}>
            {edital.instituicao.uf ?? 'Nacional'} · {TIPO_LABEL[edital.instituicao.tipo] ?? edital.instituicao.tipo}
          </p>
          <h2 style={{ fontWeight: 900, color: '#0f2d5e', fontSize: 17, margin: '4px 0 0' }}>{edital.instituicao.nome}</h2>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: status.background, color: status.color, whiteSpace: 'nowrap' }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
        <Info label="Inscrições" value={formatPeriodo(edital.inscricao_inicio, edital.inscricao_fim)} />
        <Info label="Taxa" value={formatTaxa(edital.taxa)} />
        <Info label="Prova" value={formatDateBR(edital.data_prova)} />
      </div>

      <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, color: '#1d6fe8', textDecoration: 'none' }}>
        Ver edital oficial →
      </a>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '2px 0 0' }}>{value}</p>
    </div>
  )
}
