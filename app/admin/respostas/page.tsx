import { supabase } from '@/lib/supabase'

export default async function AdminRespostas({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email: emailFiltro } = await searchParams

  let query = supabase
    .from('resultados')
    .select('id, nome, email, created_at, ranking_json, perfil_json')
    .order('created_at', { ascending: false })
    .limit(200)

  if (emailFiltro) {
    query = query.eq('email', emailFiltro)
  }

  const { data: respostas } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Respostas</h1>
          {emailFiltro ? (
            <p className="text-gray-500 text-sm mt-1">
              Filtrando por: <span className="font-semibold text-blue-700">{emailFiltro}</span>
              {' '}&mdash; {respostas?.length ?? 0} testes
              <a href="/admin/respostas" className="ml-3 text-xs text-blue-500 underline">Limpar filtro</a>
            </p>
          ) : (
            <p className="text-gray-500 text-sm mt-1">{respostas?.length ?? 0} testes realizados</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Top 3 Especialidades</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Holland</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {(respostas ?? []).map((r: any) => {
                const top3 = (r.ranking_json ?? []).slice(0, 3)
                const holland = r.perfil_json?.holland ?? []
                return (
                  <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">{r.nome}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{r.email}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        {top3.map((e: any, i: number) => (
                          <span key={i} className="text-xs">
                            <span className="font-semibold text-gray-700">{i + 1}. {e.nome}</span>
                            <span className="text-gray-400 ml-1">{e.pct}%</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {holland.map((h: string) => (
                          <span key={h} className="bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">{h}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )
              })}
              {!respostas?.length && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  {emailFiltro ? 'Nenhum teste encontrado para este email.' : 'Nenhuma resposta ainda.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
