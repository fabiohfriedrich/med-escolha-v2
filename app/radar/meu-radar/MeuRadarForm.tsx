'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import specialtiesData from '@/data/specialties.json'
import { UFS } from '@/lib/radar'

const SPECIALTIES = specialtiesData.specialties as { id: number; nome: string }[]

interface Config {
  especialidade_ids: number[]
  ufs: string[]
  alertas_ativos: boolean
}

interface Props {
  configInicial: Config
  preSelecionadoDoTeste: boolean
}

export default function MeuRadarForm({ configInicial, preSelecionadoDoTeste }: Props) {
  const router = useRouter()
  const [especialidadesSel, setEspecialidadesSel] = useState<number[]>(configInicial.especialidade_ids)
  const [ufsSel, setUfsSel] = useState<string[]>(configInicial.ufs)
  const [alertasAtivos, setAlertasAtivos] = useState(configInicial.alertas_ativos)
  const [busca, setBusca] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const especialidadesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return SPECIALTIES
    return SPECIALTIES.filter((s) => s.nome.toLowerCase().includes(termo))
  }, [busca])

  function toggleEspecialidade(id: number) {
    setSalvo(false)
    setEspecialidadesSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  function toggleUf(sigla: string) {
    setSalvo(false)
    setUfsSel((prev) => (prev.includes(sigla) ? prev.filter((x) => x !== sigla) : [...prev, sigla]))
  }

  async function salvar() {
    setSalvando(true)
    setSalvo(false)
    try {
      const res = await fetch('/api/radar/meu-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ especialidade_ids: especialidadesSel, ufs: ufsSel, alertas_ativos: alertasAtivos }),
      })
      if (!res.ok) throw new Error('Falha ao salvar')
      setSalvo(true)
      router.refresh()
    } catch {
      alert('Não consegui salvar. Tenta de novo em alguns segundos.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: '#0f2d5e', color: 'white' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px' }}>
          <Link href="/radar" style={{ color: '#93c5fd', fontSize: 13, fontWeight: 500, display: 'inline-block', marginBottom: 16, textDecoration: 'none' }}>
            ← Radar de Residência
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Meu Radar</h1>
          <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0 }}>
            Escolhe as especialidades e os estados que te interessam. A gente te avisa por e-mail
            quando um edital abrir, faltar pouco pro fim das inscrições ou for véspera de prova.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 24px 100px' }}>
        {preSelecionadoDoTeste && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
            Pré-selecionamos as 3 especialidades com maior compatibilidade no seu resultado do teste.
            Ajusta à vontade.
          </div>
        )}

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Especialidades ({especialidadesSel.length} selecionada{especialidadesSel.length !== 1 ? 's' : ''})
          </p>
          <input
            type="text"
            placeholder="Buscar especialidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 mb-3"
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
            {especialidadesFiltradas.map((s) => {
              const ativo = especialidadesSel.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleEspecialidade(s.id)}
                  style={{
                    fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 20, border: '1px solid',
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

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Estados ({ufsSel.length} selecionado{ufsSel.length !== 1 ? 's' : ''})
          </p>
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
                    fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: '1px solid',
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
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
            Exames nacionais (como o ENARE) aparecem pra você independente do estado escolhido.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 700, color: '#0f2d5e', margin: 0, fontSize: 14 }}>Alertas por e-mail</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Edital novo, inscrição aberta, últimos dias e véspera de prova.</p>
          </div>
          <button
            type="button"
            onClick={() => setAlertasAtivos((v) => !v)}
            aria-pressed={alertasAtivos}
            style={{
              width: 48, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: alertasAtivos ? '#15803d' : '#cbd5e1', position: 'relative', transition: 'background 0.2s',
            }}
          >
            <span style={{ position: 'absolute', top: 3, left: alertasAtivos ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="bg-blue-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-800 transition disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar meu radar'}
          </button>
          {salvo && <span style={{ color: '#15803d', fontWeight: 700, fontSize: 13 }}>Salvo ✓</span>}
        </div>
      </div>
    </div>
  )
}
