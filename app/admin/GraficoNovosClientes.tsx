'use client'

interface Props {
  dados: { label: string; count: number }[]
}

export default function GraficoNovosClientes({ dados }: Props) {
  const max = Math.max(...dados.map(d => d.count), 1)
  const total = dados.reduce((s, d) => s + d.count, 0)

  const W = 700
  const H = 160
  const padL = 32
  const padR = 16
  const padT = 16
  const padB = 40
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const n = dados.length
  const barW = Math.floor(chartW / n) - 8

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">Últimas 8 semanas · <span className="font-semibold text-gray-600">{total} novos no período</span></p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Gráfico de novos clientes por semana">
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padT + chartH * (1 - pct)
          const val = Math.round(max * pct)
          return (
            <g key={pct}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#bbb">{val}</text>
            </g>
          )
        })}

        {/* Bars */}
        {dados.map((d, i) => {
          const slotW = chartW / n
          const x = padL + slotW * i + (slotW - barW) / 2
          const barH = d.count === 0 ? 2 : Math.max((d.count / max) * chartH, 4)
          const y = padT + chartH - barH
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx="4"
                fill={d.count > 0 ? '#2563eb' : '#e5e7eb'} opacity={d.count > 0 ? 0.85 : 1} />
              {d.count > 0 && (
                <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1d4ed8">
                  {d.count}
                </text>
              )}
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
