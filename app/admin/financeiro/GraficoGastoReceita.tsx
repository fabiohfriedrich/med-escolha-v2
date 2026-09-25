'use client'

interface Props {
  gasto: number
  receita: number
  receitaLiquida: number
}

const fmtMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export default function GraficoGastoReceita({ gasto, receita, receitaLiquida }: Props) {
  const max = Math.max(gasto, receita, receitaLiquida, 1)
  const saldo = receitaLiquida - gasto

  const barras = [
    { label: 'Gasto em campanhas', valor: gasto, cor: '#dc2626' },
    { label: 'Receita bruta', valor: receita, cor: '#16a34a' },
    { label: 'Receita líquida', valor: receitaLiquida, cor: '#059669' },
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
      <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-3">
        <span className="text-xs font-medium text-gray-500">Saldo (líquida menos gasto)</span>
        <span className={`text-sm font-extrabold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {saldo < 0 ? '-' : ''}{fmtMoeda(Math.abs(saldo))}
        </span>
      </div>
    </div>
  )
}
