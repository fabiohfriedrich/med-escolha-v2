'use client'

import { useState } from 'react'

type Specialty = { id: number; nome: string }

const CRITERIOS = [
  { key: 'remuneracao',   label: 'Remuneração',                        hint: 'O quanto a faixa salarial desta especialidade te agrada?' },
  { key: 'procedimento',  label: 'Procedimento',                       hint: 'O quanto te agrada ter (ou não ter) procedimentos nesta especialidade?' },
  { key: 'rotina',        label: 'Rotina',                             hint: 'Ambulatorial, hospitalar ou cirúrgica — o quanto essa rotina combina com você?' },
  { key: 'teoria',        label: 'Interesse pela teoria',              hint: 'O quanto você se interessa pela base teórica desta área?' },
  { key: 'maleabilidade', label: 'Maleabilidade da rotina',            hint: 'O quanto a flexibilidade de horários desta especialidade te agrada?' },
  { key: 'resolutividade',label: 'Resolutividade',                     hint: 'O quanto te satisfaz o nível de resolução dos casos nesta área?' },
  { key: 'geografico',    label: 'Fit geográfico',                     hint: 'O quanto esta especialidade está presente na região onde você quer viver?' },
]

const MAX = CRITERIOS.length * 5

const HOTMART_URL = 'https://pay.hotmart.com/Y86347681C?off=y014gd40&checkoutMode=10&bid=1781225502432'

type Scores = Record<string, number>
type Step = 'pick' | 'rate' | 'email' | 'result'

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100
  const color = pct >= 70 ? '#15803d' : pct >= 45 ? '#1d6fe8' : '#94a3b8'
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ width: '100%', height: 8, borderRadius: 999, background: '#f1f5f9' }}>
        <div style={{ width: `${pct}%`, height: 8, borderRadius: 999, background: color, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function RatingRow({ label, hint, valueA, valueB, onChangeA, onChangeB }: {
  label: string; hint: string
  valueA: number; valueB: number
  onChangeA: (v: number) => void; onChangeB: (v: number) => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 1fr', gap: 0, borderBottom: '1px solid #f1f5f9', padding: '16px 0' }}>
      {/* Nota A */}
      <div style={{ paddingRight: 16 }}>
        <NotaButtons value={valueA} onChange={onChangeA} side="A" />
      </div>
      {/* Label central */}
      <div style={{ textAlign: 'center', padding: '0 8px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f2d5e', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.4 }}>{hint}</p>
      </div>
      {/* Nota B */}
      <div style={{ paddingLeft: 16 }}>
        <NotaButtons value={valueB} onChange={onChangeB} side="B" />
      </div>
    </div>
  )
}

function NotaButtons({ value, onChange, side }: { value: number; onChange: (v: number) => void; side: 'A' | 'B' }) {
  const activeColor = side === 'A' ? '#1d6fe8' : '#f59e0b'
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: side === 'A' ? 'flex-end' : 'flex-start' }}>
      {[0, 1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: value === n ? 'none' : '1px solid #e2e8f0',
            background: value === n ? activeColor : 'white',
            color: value === n ? 'white' : '#64748b',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export default function ComparadorClient({ specialties }: { specialties: Specialty[] }) {
  const [step, setStep] = useState<Step>('pick')
  const [a, setA] = useState<number | null>(null)
  const [b, setB] = useState<number | null>(null)
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')
  const [openA, setOpenA] = useState(false)
  const [openB, setOpenB] = useState(false)
  const [scoresA, setScoresA] = useState<Scores>({})
  const [scoresB, setScoresB] = useState<Scores>({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const specA = specialties.find(s => s.id === a)
  const specB = specialties.find(s => s.id === b)

  const filteredA = specialties.filter(s =>
    s.nome.toLowerCase().includes(searchA.toLowerCase()) && s.id !== b
  ).slice(0, 12)
  const filteredB = specialties.filter(s =>
    s.nome.toLowerCase().includes(searchB.toLowerCase()) && s.id !== a
  ).slice(0, 12)

  const totalA = CRITERIOS.reduce((sum, c) => sum + (scoresA[c.key] ?? 0), 0)
  const totalB = CRITERIOS.reduce((sum, c) => sum + (scoresB[c.key] ?? 0), 0)
  const allRated = CRITERIOS.every(c => scoresA[c.key] !== undefined && scoresB[c.key] !== undefined)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Não foi possível realizar a inscrição. Tente novamente.')
        return
      }
      setStep('result')
    } catch {
      setError('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── STEP: PICK ────────────────────────────────────────────────
  if (step === 'pick') {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {(['A', 'B'] as const).map(side => {
            const selected = side === 'A' ? specA : specB
            const search = side === 'A' ? searchA : searchB
            const setSearch = side === 'A' ? setSearchA : setSearchB
            const setSelected = side === 'A' ? setA : setB
            const filtered = side === 'A' ? filteredA : filteredB
            const open = side === 'A' ? openA : openB
            const setOpen = side === 'A' ? setOpenA : setOpenB
            const color = side === 'A' ? '#1d6fe8' : '#f59e0b'
            const bgLight = side === 'A' ? '#eff6ff' : '#fffbeb'
            const border = side === 'A' ? '#3b82f6' : '#f59e0b'

            return (
              <div key={side}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 8 }}>
                  Especialidade {side}
                </p>
                {selected ? (
                  <div style={{ background: bgLight, border: `2px solid ${border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f2d5e', fontSize: 15 }}>{selected.nome}</span>
                    <button onClick={() => { setSelected(null); setSearch('') }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input
                      value={search}
                      onChange={e => { setSearch(e.target.value); setOpen(true) }}
                      onFocus={() => setOpen(true)}
                      onBlur={() => setTimeout(() => setOpen(false), 150)}
                      placeholder="Buscar especialidade..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                    {open && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, maxHeight: 240, overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginTop: 4 }}>
                        {(search ? filtered : specialties.filter(s => s.id !== (side === 'A' ? b : a)).slice(0, 12)).map(s => (
                          <button
                            key={s.id}
                            onMouseDown={() => { setSelected(s.id); setSearch(''); setOpen(false) }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#374151', borderBottom: '1px solid #f1f5f9' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            {s.nome}
                          </button>
                        ))}
                        {search && filtered.length === 0 && (
                          <p style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13, margin: 0 }}>Nenhuma encontrada</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            disabled={!a || !b}
            onClick={() => setStep('rate')}
            style={{ background: a && b ? '#0f2d5e' : '#e2e8f0', color: a && b ? 'white' : '#94a3b8', border: 'none', borderRadius: 12, padding: '14px 40px', fontSize: 16, fontWeight: 700, cursor: a && b ? 'pointer' : 'not-allowed' }}
          >
            Avaliar critérios →
          </button>
          {(!a || !b) && (
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>Selecione as duas especialidades para continuar</p>
          )}
        </div>
      </div>
    )
  }

  // ── STEP: RATE ────────────────────────────────────────────────
  if (step === 'rate') {
    return (
      <div>
        {/* Header colunas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 1fr', marginBottom: 4 }}>
          <div style={{ textAlign: 'right', paddingRight: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 4 }}>Especialidade A</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#1d6fe8', margin: 0 }}>{specA?.nome}</p>
          </div>
          <div />
          <div style={{ paddingLeft: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 4 }}>Especialidade B</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#b45309', margin: 0 }}>{specB?.nome}</p>
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '4px 12px', marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0', textAlign: 'center' }}>
            Dê uma nota de <strong>0</strong> (não combina nada) a <strong>5</strong> (combina muito) para cada critério em cada especialidade
          </p>
        </div>

        {CRITERIOS.map(c => (
          <RatingRow
            key={c.key}
            label={c.label}
            hint={c.hint}
            valueA={scoresA[c.key] ?? -1}
            valueB={scoresB[c.key] ?? -1}
            onChangeA={v => setScoresA(prev => ({ ...prev, [c.key]: v }))}
            onChangeB={v => setScoresB(prev => ({ ...prev, [c.key]: v }))}
          />
        ))}

        {/* Placar parcial */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 1fr', marginTop: 20, alignItems: 'center' }}>
          <div style={{ textAlign: 'right', paddingRight: 16 }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#1d6fe8', margin: 0 }}>{totalA}</p>
            <ScoreBar score={totalA} max={MAX} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', margin: 0 }}>Pontuação</p>
            <p style={{ fontSize: 11, color: '#cbd5e1', margin: '2px 0 0' }}>máx. {MAX}</p>
          </div>
          <div style={{ paddingLeft: 16 }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#b45309', margin: 0 }}>{totalB}</p>
            <ScoreBar score={totalB} max={MAX} />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            disabled={!allRated}
            onClick={() => setStep('email')}
            style={{ background: allRated ? '#0f2d5e' : '#e2e8f0', color: allRated ? 'white' : '#94a3b8', border: 'none', borderRadius: 12, padding: '14px 40px', fontSize: 16, fontWeight: 700, cursor: allRated ? 'pointer' : 'not-allowed' }}
          >
            Ver resultado final →
          </button>
          {!allRated && (
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>Avalie todos os critérios para continuar</p>
          )}
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setStep('pick')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>
              ← Trocar especialidades
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP: EMAIL ───────────────────────────────────────────────
  if (step === 'email') {
    return (
      <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f2d5e', marginBottom: 8 }}>
          Seu resultado está pronto!
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, color: '#1d6fe8', fontWeight: 700, marginBottom: 2 }}>{specA?.nome}</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#0f2d5e', margin: 0 }}>{totalA} pts</p>
          </div>
          <div style={{ fontSize: 22, color: '#94a3b8', alignSelf: 'center' }}>vs</div>
          <div>
            <p style={{ fontSize: 13, color: '#b45309', fontWeight: 700, marginBottom: 2 }}>{specB?.nome}</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#0f2d5e', margin: 0 }}>{totalB} pts</p>
          </div>
        </div>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
          Digite seu e-mail para ver o comparativo completo com o resultado detalhado — de graça.
        </p>
        <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 15, textAlign: 'center', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#1d6fe8', color: 'white', border: 'none', borderRadius: 10, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Aguarde...' : 'Ver resultado grátis →'}
          </button>
          {error && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>}
        </form>
        <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 16 }}>
          Sem spam. Você receberá insights sobre escolha de especialidade médica.
        </p>
        <button onClick={() => setStep('rate')} style={{ marginTop: 8, background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>
          ← Voltar para avaliação
        </button>
      </div>
    )
  }

  // ── STEP: RESULT ──────────────────────────────────────────────
  const winner = totalA > totalB ? 'A' : totalB > totalA ? 'B' : 'tie'

  return (
    <div>
      {/* Placar final */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'stretch', marginBottom: 28 }}>
        <div style={{ background: winner === 'A' ? '#eff6ff' : '#f8fafc', border: winner === 'A' ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: 16, padding: 20, textAlign: 'center', position: 'relative' }}>
          {winner === 'A' && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1d6fe8', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>VENCEDOR</div>}
          <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Especialidade A</p>
          <p style={{ fontSize: 17, fontWeight: 900, color: '#0f2d5e', marginBottom: 8 }}>{specA?.nome}</p>
          <p style={{ fontSize: 42, fontWeight: 900, color: '#1d6fe8', margin: 0 }}>{totalA}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>de {MAX} pontos</p>
          <ScoreBar score={totalA} max={MAX} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#94a3b8' }}>vs</span>
        </div>
        <div style={{ background: winner === 'B' ? '#fffbeb' : '#f8fafc', border: winner === 'B' ? '2px solid #f59e0b' : '1px solid #e2e8f0', borderRadius: 16, padding: 20, textAlign: 'center', position: 'relative' }}>
          {winner === 'B' && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>VENCEDOR</div>}
          <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Especialidade B</p>
          <p style={{ fontSize: 17, fontWeight: 900, color: '#0f2d5e', marginBottom: 8 }}>{specB?.nome}</p>
          <p style={{ fontSize: 42, fontWeight: 900, color: '#b45309', margin: 0 }}>{totalB}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>de {MAX} pontos</p>
          <ScoreBar score={totalB} max={MAX} />
        </div>
      </div>

      {/* Detalhamento por critério */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        {CRITERIOS.map((c, i) => {
          const sA = scoresA[c.key] ?? 0
          const sB = scoresB[c.key] ?? 0
          const winnerRow = sA > sB ? 'A' : sB > sA ? 'B' : 'tie'
          return (
            <div key={c.key} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr', borderBottom: i < CRITERIOS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: winnerRow === 'A' ? '#1d6fe8' : '#cbd5e1' }}>{sA}</span>
                {winnerRow === 'A' && <span>✅</span>}
              </div>
              <div style={{ padding: '12px 8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.5, color: '#94a3b8', textAlign: 'center' }}>{c.label}</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {winnerRow === 'B' && <span>✅</span>}
                <span style={{ fontSize: 20, fontWeight: 900, color: winnerRow === 'B' ? '#b45309' : '#cbd5e1' }}>{sB}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empate */}
      {winner === 'tie' && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: '#92400e', fontWeight: 700, margin: 0 }}>
            Empate! As duas especialidades ficaram com a mesma pontuação. O teste completo pode ajudar a desempatar com 95 questões.
          </p>
        </div>
      )}

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #1d4a8a 100%)', borderRadius: 16, padding: 28, color: 'white', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#93c5fd', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Isso foi só o começo</p>
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12, lineHeight: 1.3 }}>
          O teste completo cruza seu perfil com as 55 especialidades ao mesmo tempo
        </h3>
        <p style={{ fontSize: 14, color: '#bfdbfe', marginBottom: 20 }}>
          95 questões, ranking personalizado, dados do DMB 2025 e vídeos com especialistas.
        </p>
        <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#f59e0b', color: '#1c1917', textDecoration: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 900 }}>
          Quero fazer o teste completo →
        </a>
        <p style={{ fontSize: 12, color: '#93c5fd', marginTop: 12 }}>R$ 149 · acesso imediato · 95 questões</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={() => { setA(null); setB(null); setScoresA({}); setScoresB({}); setEmail(''); setStep('pick') }}
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 20px', fontSize: 14, color: '#64748b', cursor: 'pointer' }}
        >
          Comparar outras especialidades
        </button>
      </div>
    </div>
  )
}
