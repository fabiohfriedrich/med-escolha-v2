'use client'

import { useEffect, useState } from 'react'
import { Poppins } from 'next/font/google'
import {
  Target, CalendarClock, UserRound, Users, ArrowLeftRight, LayoutGrid, Gift,
  ArrowUpRight, ArrowRight, Check,
} from 'lucide-react'
import posthog from 'posthog-js'
import styles from './MedEscolhaLanding.module.css'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap' })

interface Especialidade { id: number; nome: string; pct: number }
interface ItemCronograma { id: string; titulo: string; status: string; step_num: number }

interface DashboardData {
  ultimoResultado: { id: string; createdAt: string; top3: Especialidade[] } | null
  totalTestes: number
  radar: { ativo: boolean } | null
  proximoEdital: { frase: string; subtitulo: string; totalRelevantes: number } | null
  reteste: { agendado: boolean; data?: string }
  cronograma: { total: number; concluidos: number; itens: ItemCronograma[] }
  indicacao: { codigo: string | null; confirmadas: number; meta: number }
}

interface Props {
  primeiroNome: string
  onIrParaCronograma: () => void
  onIrParaResultados: () => void
  onIrParaEvolucao: () => void
  onIrParaIndicacoes: () => void
}

const HERO_BG = 'linear-gradient(160deg, #12306b 0%, #0b1d47 55%, #081434 100%)'

export default function PerfilDashboard({ primeiroNome, onIrParaCronograma, onIrParaResultados, onIrParaEvolucao, onIrParaIndicacoes }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [itens, setItens] = useState<ItemCronograma[]>([])
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((d: DashboardData | null) => {
        setData(d)
        if (d) setItens(d.cronograma.itens)
      })
      .catch(() => setData(null))
  }, [])

  async function toggleItem(item: ItemCronograma) {
    const novoStatus = item.status === 'concluido' ? 'pendente' : 'concluido'
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: novoStatus } : i)))
    const res = await fetch(`/api/cronograma/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    })
    if (!res.ok) {
      setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: item.status } : i)))
    } else if (novoStatus === 'concluido') {
      posthog.capture('dashboard_checklist_item_concluido', { step_num: item.step_num })
    }
  }

  function copiarLinkIndicacao() {
    if (!data?.indicacao.codigo) return
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${data.indicacao.codigo}`)
    setCopiado(true)
    posthog.capture('dashboard_indicacao_copiada')
    setTimeout(() => setCopiado(false), 2000)
  }

  if (!data) {
    return (
      <div className={poppins.className}>
        <div style={{ height: 320, background: HERO_BG, borderRadius: 24 }} />
      </div>
    )
  }

  if (!data.ultimoResultado) {
    return (
      <div className={`${poppins.className} ${styles.landingRoot}`}>
        <div style={{ background: HERO_BG, borderRadius: 24, padding: 40, textAlign: 'center', color: '#fff' }}>
          <span className={styles.eyebrow}>seu painel</span>
          <h2 style={{ margin: 0, color: '#fff' }}>faça seu primeiro teste</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
            depois do teste, seu radar de editais, reteste e cronograma aparecem aqui.
          </p>
          <a href="/teste" className={styles.btn}>fazer meu primeiro teste</a>
        </div>
      </div>
    )
  }

  const { ultimoResultado, totalTestes, radar, proximoEdital, reteste, indicacao } = data
  const top1 = ultimoResultado.top3[0]
  const dataTeste = new Date(ultimoResultado.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className={poppins.className}>
      <div style={{ background: HERO_BG, borderRadius: 24, padding: '24px', color: '#fff', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            Oi, {primeiroNome} · último teste em {dataTeste}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ultimoResultado.top3.slice(1, 3).map((e, i) => (
              <span key={e.id} style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
                {i + 2}º {e.nome}
              </span>
            ))}
          </div>
        </div>

        {top1 && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>Seu match: {top1.nome}</h1>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#2dd4bf', margin: 0 }}>{top1.pct.toFixed(1)}% de compatibilidade</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={onIrParaResultados}
            style={{ background: '#1FBFA8', color: '#04231f', fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 999, border: 0, cursor: 'pointer' }}
          >
            Ver resultado completo
          </button>
          {totalTestes >= 2 && (
            <button
              onClick={onIrParaEvolucao}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.35)', cursor: 'pointer' }}
            >
              <ArrowUpRight size={14} /> Minha evolução ({totalTestes} testes)
            </button>
          )}
        </div>

        {/* 3 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Radar */}
          <MiniCard
            icon={<Target size={17} />}
            label="Radar de residência"
            valor={radar?.ativo ? (proximoEdital?.frase ?? 'nenhum edital aberto pras tuas especialidades') : 'seu radar ainda não tá ativo'}
            subtitulo={radar?.ativo ? (proximoEdital?.subtitulo ?? 'te avisamos assim que abrir') : 'ative pra receber alertas de edital'}
            linkLabel={proximoEdital ? `Ver ${proximoEdital.totalRelevantes} edital${proximoEdital.totalRelevantes !== 1 ? 'is' : ''} do meu radar` : 'ver radar'}
            href="/radar"
          />

          {/* Reteste */}
          <MiniCard
            icon={<CalendarClock size={17} />}
            label="Próximo reteste"
            valor={reteste.agendado ? reteste.data! : 'nenhum reteste agendado'}
            subtitulo={totalTestes < 2 ? 'refaça o teste pra ver sua evolução.' : 'te avisamos por e-mail na hora certa.'}
            linkLabel={reteste.agendado ? 'ajustar data' : 'agendar reteste'}
            onClick={() => { onIrParaCronograma(); posthog.capture('dashboard_reteste_clicado') }}
          />

          {/* Slot comercial: indicação (upsell do psicólogo entra aqui quando existir) */}
          {indicacao.codigo ? (
            <MiniCard
              icon={<Users size={17} />}
              label="Indique e ganhe"
              valor={`${indicacao.confirmadas} de ${indicacao.meta} indicações`}
              subtitulo="Indique colegas e ganhe um ebook exclusivo."
              linkLabel={copiado ? 'link copiado!' : 'copiar meu link'}
              onClick={copiarLinkIndicacao}
            />
          ) : (
            <MiniCard
              icon={<ArrowLeftRight size={17} />}
              label="Compare especialidades"
              valor="Salário, saturação e crescimento"
              subtitulo="Compare suas top 3 lado a lado com dados do DMB 2025."
              linkLabel="abrir comparador"
              href="/comparar"
            />
          )}
        </div>

        {/* Checklist */}
        {itens.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Próximos passos da sua escolha</p>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                {itens.filter((i) => i.status === 'concluido').length} de {itens.length} concluídos
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {itens.map((item) => {
                const feito = item.status === 'concluido'
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: 0, borderRadius: 12, padding: '11px 14px', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: feito ? '#1FBFA8' : 'transparent', border: feito ? 'none' : '1.5px solid rgba(255,255,255,0.4)',
                    }}>
                      {feito && <Check size={12} color="#04231f" strokeWidth={3} />}
                    </span>
                    <span style={{ fontSize: 13, color: feito ? 'rgba(255,255,255,0.45)' : '#fff', textDecoration: feito ? 'line-through' : 'none' }}>
                      {item.titulo}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Atalhos discretos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 14 }}>
        <FooterTile icon={<LayoutGrid size={16} />} label="55 especialidades" href="/especialidades" />
        <FooterTile icon={<ArrowLeftRight size={16} />} label="Comparador" href="/comparar" />
        <FooterTile icon={<Gift size={16} />} label="Bônus" href="/ferramentas" />
        <FooterTile icon={<UserRound size={16} />} label="Indique e ganhe" onClick={onIrParaIndicacoes} />
      </div>
    </div>
  )
}

function MiniCard({ icon, label, valor, subtitulo, linkLabel, href, onClick, destacado }: {
  icon: React.ReactNode
  label: string
  valor: string
  subtitulo: string
  linkLabel: string
  href?: string
  onClick?: () => void
  destacado?: boolean
}) {
  const conteudo = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600 }}>
        {icon} {label}
      </div>
      <p style={{ fontWeight: 700, fontSize: 15, margin: '10px 0 4px', color: '#fff', lineHeight: 1.3 }}>{valor}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' }}>{subtitulo}</p>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#2dd4bf', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {linkLabel} <ArrowRight size={12} />
      </span>
    </>
  )

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: destacado ? '1px solid #2dd4bf' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    textAlign: 'left',
    display: 'block',
    cursor: 'pointer',
  }

  if (href) {
    return <a href={href} style={cardStyle}>{conteudo}</a>
  }
  return <button onClick={onClick} style={{ ...cardStyle, width: '100%', border: cardStyle.border }}>{conteudo}</button>
}

function FooterTile({ icon, label, href, onClick }: { icon: React.ReactNode; label: string; href?: string; onClick?: () => void }) {
  const style: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, background: '#0E1F4D', color: 'rgba(255,255,255,0.85)',
    fontSize: 12, fontWeight: 600, padding: '12px 14px', borderRadius: 14, border: 0, cursor: 'pointer',
  }
  if (href) return <a href={href} style={{ ...style, textDecoration: 'none' }}>{icon} {label}</a>
  return <button onClick={onClick} style={style}>{icon} {label}</button>
}
