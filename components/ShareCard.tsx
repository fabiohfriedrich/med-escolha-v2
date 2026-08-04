'use client'

import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import posthog from 'posthog-js'

interface Especialidade {
  id: number
  nome: string
  pct: number
}

interface Props {
  nome: string
  top3: Especialidade[]
  onClose: () => void
}

const CARD_W = 270
const CARD_H = 480
const EXPORT_SCALE = 4 // 270×480 × 4 ≈ 1080×1920 (formato Stories)

export default function ShareCard({ nome, top3, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState(false)
  const [codigoIndicacao, setCodigoIndicacao] = useState<string | null>(null)
  const [linkCopiado, setLinkCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/indicacoes')
      .then(res => (res.ok ? res.json() : { codigo: null }))
      .then(data => setCodigoIndicacao(data.codigo ?? null))
      .catch(() => setCodigoIndicacao(null))
  }, [])

  const linkIndicacao = codigoIndicacao && typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${codigoIndicacao}`
    : null

  async function gerarBlob(): Promise<Blob | null> {
    if (!cardRef.current) return null
    const dataUrl = await toPng(cardRef.current, { pixelRatio: EXPORT_SCALE, cacheBust: true })
    const res = await fetch(dataUrl)
    return res.blob()
  }

  async function baixar() {
    setGerando(true)
    setErro(false)
    try {
      const blob = await gerarBlob()
      if (!blob) throw new Error('sem blob')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'meu-match-med-escolha.png'
      a.click()
      URL.revokeObjectURL(url)
      posthog.capture('resultado_compartilhado', { metodo: 'download' })
    } catch {
      setErro(true)
    } finally {
      setGerando(false)
    }
  }

  async function compartilhar() {
    setGerando(true)
    setErro(false)
    try {
      const blob = await gerarBlob()
      if (!blob) throw new Error('sem blob')
      const file = new File([blob], 'meu-match-med-escolha.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Meu match Med Escolha',
          text: linkIndicacao
            ? `Descobri minha especialidade médica com o Med Escolha! Faz o seu também: ${linkIndicacao}`
            : 'Descobri minha especialidade médica com o Med Escolha!',
        })
        posthog.capture('resultado_compartilhado', { metodo: 'web_share' })
      } else {
        await baixar()
      }
    } catch {
      // usuário cancelou o share nativo — não é erro
    } finally {
      setGerando(false)
    }
  }

  const [first, second, third] = top3

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.75)' }}
      onClick={onClose}
    >
      <div className="flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
        <div
          ref={cardRef}
          style={{
            width: CARD_W,
            height: CARD_H,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 20,
            background: 'radial-gradient(120% 100% at 50% 0%, #12306b 0%, #081434 60%, #050c22 100%)',
            fontFamily: 'var(--font-hank), Arial, sans-serif',
            color: 'white',
            padding: '22px 20px',
            boxShadow: '0 20px 60px rgba(0,0,0,.4)',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(31,191,168,.25)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(31,191,168,.15)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7fd8c9', marginBottom: 4 }}>
              Med Escolha · Amo Medicina
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)', marginBottom: 18 }}>
              {nome ? `o match de ${nome.split(' ')[0]}` : 'meu match de especialidade médica'}
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#1FBFA8', marginBottom: 2 }}>🥇 top 1</div>
              <div style={{ fontSize: 25, fontWeight: 900, lineHeight: 1.1, marginBottom: 6 }}>{first?.nome}</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: '#1FBFA8', lineHeight: 1 }}>{first?.pct.toFixed(0)}%</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.55)' }}>de compatibilidade</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'auto' }}>
              {[second, third].map((e, i) => e && (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '8px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{i === 0 ? '🥈' : '🥉'} {e.nome}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#1FBFA8' }}>{e.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.15)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>descubra o seu match</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1FBFA8' }}>
                {codigoIndicacao ? `match.medescolha.com/?ref=${codigoIndicacao}` : 'match.medescolha.com'}
              </div>
            </div>
          </div>
        </div>

        {erro && <p className="text-red-300 text-xs">Deu ruim pra gerar a imagem. Tenta de novo.</p>}

        {linkIndicacao && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(linkIndicacao)
              setLinkCopiado(true)
              posthog.capture('resultado_link_indicacao_copiado')
              setTimeout(() => setLinkCopiado(false), 2000)
            }}
            className="text-white/80 text-xs font-semibold underline"
          >
            {linkCopiado ? 'Link copiado!' : 'Copiar meu link de indicação'}
          </button>
        )}

        <div className="flex gap-3">
          <button
            onClick={baixar}
            disabled={gerando}
            className="bg-white text-blue-900 font-bold text-sm px-5 py-3 rounded-xl disabled:opacity-60"
          >
            {gerando ? 'gerando...' : '⬇️ baixar imagem'}
          </button>
          <button
            onClick={compartilhar}
            disabled={gerando}
            className="bg-teal-400 text-blue-900 font-bold text-sm px-5 py-3 rounded-xl disabled:opacity-60"
          >
            📤 compartilhar
          </button>
        </div>
        <button onClick={onClose} className="text-white/70 text-sm underline">fechar</button>
      </div>
    </div>
  )
}
