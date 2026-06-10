import { getSupabaseAdmin } from '@/lib/supabase-admin'
const supabase = getSupabaseAdmin()
import GraficoNovosClientes from './GraficoNovosClientes'

async function getStats() {
  const [
    { count: totalRespostas },
    { count: totalCompradores },
    { data: recentes },
    { data: todosCompradores },
  ] = await Promise.all([
    supabase.from('resultados').select('*', { count: 'exact', head: true }),
    supabase.from('compradores').select('*', { count: 'exact', head: true }),
    supabase.from('resultados').select('nome, email, created_at, ranking_json').order('created_at', { ascending: false }).limit(5),
    supabase.from('compradores').select('created_at, ativo, testes_realizados').order('created_at', { ascending: true }),
  ])

  const { count: compradoresAtivos } = await supabase
    .from('compradores').select('*', { count: 'exact', head: true }).eq('ativo', true)

  const { count: semTestes } = await supabase
    .from('compradores').select('*', { count: 'exact', head: true }).eq('testes_realizados', 0).eq('ativo', true)

  // Agrupa novos compradores por semana (últimas 8 semanas)
  const agora = new Date()
  const semanas: { label: string; count: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const inicio = new Date(agora)
    inicio.setDate(agora.getDate() - i * 7 - 6)
    inicio.setHours(0, 0, 0, 0)
    const fim = new Date(agora)
    fim.setDate(agora.getDate() - i * 7)
    fim.setHours(23, 59, 59, 999)
    const count = (todosCompradores ?? []).filter(c => {
      const d = new Date(c.created_at)
      return d >= inicio && d <= fim
    }).length
    const label = inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    semanas.push({ label, count })
  }

  return { totalRespostas, totalCompradores, compradoresAtivos, semTestes, recentes, semanas }
}

function StatCard({ label, value, sub, color }: { label: string; value: number | null; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className={`text-4xl font-extrabold mt-1 ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminDashboard() {
  const { totalRespostas, totalCompradores, compradoresAtivos, semTestes, recentes, semanas } = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do Med Escolha</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Testes realizados" value={totalRespostas} color="text-blue-700" />
        <StatCard label="Compradores" value={totalCompradores} sub={`${compradoresAtivos} ativos`} color="text-green-600" />
        <StatCard label="Ainda não fizeram" value={semTestes} sub="compraram mas não testaram" color="text-orange-500" />
        <StatCard
          label="Taxa de uso"
          value={totalCompradores ? Math.round(((totalCompradores - (semTestes ?? 0)) / totalCompradores) * 100) : 0}
          sub="% dos compradores testaram"
          color="text-purple-600"
        />
      </div>

      {/* Gráfico de novos clientes por semana */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-800 mb-4">Novos clientes por semana</h2>
        <GraficoNovosClientes dados={semanas} />
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-gray-800 mb-4">Últimos testes</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">1º Lugar</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {(recentes ?? []).map((r: any, i: number) => {
                const top1 = r.ranking_json?.[0]
                return (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{r.nome}</td>
                    <td className="px-5 py-3 text-gray-500">{r.email}</td>
                    <td className="px-5 py-3">
                      {top1 ? (
                        <span className="bg-blue-50 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {top1.nome} · {top1.pct}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
              {!recentes?.length && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Nenhum teste realizado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
