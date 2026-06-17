import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'

const supabase = getSupabaseAdmin()
const PAGE_SIZE = 50

export default async function AdminRespostas({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; page?: string }>
}) {
  const { email: emailFiltro, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Conta total para calcular número de páginas
  let countQuery = supabase
    .from('resultados')
    .select('id', { count: 'exact', head: true })
  if (emailFiltro) countQuery = countQuery.eq('email', emailFiltro)
  const { count: total } = await countQuery

  // Busca página atual
  let query = supabase
    .from('resultados')
    .select('id, nome, email, created_at, ranking_json, perfil_json')
    .order('created_at', { ascending: false })
    .range(from, to)
  if (emailFiltro) query = query.eq('email', emailFiltro)
  const { data: respostas } = await query

  const totalPages = Math.ceil((total ?? 0) / PAGE_SIZE)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (emailFiltro) params.set('email', emailFiltro)
    params.set('page', String(p))
    return `/admin/respostas?${params}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Respostas</h1>
          {emailFiltro ? (
            <p className="text-gray-500 text-sm mt-1">
              Filtrando por: <span className="font-semibold text-blue-700">{emailFiltro}</span>
              {' '}— {total ?? 0} testes
              <Link href="/admin/respostas" className="ml-3 text-xs text-blue-500 underline">Limpar filtro</Link>
            </p>
          ) : (
            <p className="text-gray-500 text-sm mt-1">
              {total ?? 0} testes realizados · página {page} de {totalPages || 1}
            </p>
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

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">
              Mostrando {from + 1}–{Math.min(to + 1, total ?? 0)} de {total ?? 0}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={pageUrl(page - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-white transition"
                >
                  ← Anterior
                </Link>
              )}
              {/* Janela de páginas ao redor da atual */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-gray-400">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={pageUrl(p as number)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        p === page
                          ? 'bg-blue-700 border-blue-700 text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-white'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
              {page < totalPages && (
                <Link
                  href={pageUrl(page + 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-white transition"
                >
                  Próxima →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
