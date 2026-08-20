'use client'

interface Props {
  gasto: number
  receita: number
}

const fmtMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export default function GraficoGastoReceita({ gasto, receita }: Props) {
  const max = Math.max(gasto, receita, 1)

  const barras = [
    { label: 'Gasto em campanhas', valor: gasto, cor: '#dc2626' },
    { label: 'Receita', valor: receita, cor: '#16a34a' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 mb-4">Gasto x receita no período</p>
      <div className="space-y-4">
        {barras.map(b => {
          const pct = Math.max((b.valor / max) * 100, b.valor > 0 ? 2 : 0)
          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">{b.label}</span>
                <span className="text-sm font-bold" style={{ color: b.cor }}>{fmtMoeda(b.valor)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: b.cor }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
