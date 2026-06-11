import { getSupabaseAdmin } from '@/lib/supabase-admin'

const supabase = getSupabaseAdmin()

function Estrelas({ nota }: { nota: number }) {
  const cor = nota >= 9 ? 'text-green-600' : nota >= 7 ? 'text-yellow-500' : 'text-red-500'
  return (
    <span className={`text-2xl font-extrabold ${cor}`}>
      {nota}
      <span className="text-sm font-normal text-gray-400">/10</span>
    </span>
  )
}

export default async function AdminFeedbacks() {
  const { data: feedbacks } = await supabase
    .from('resultados')
    .select('id, nome, email, feedback_nota, feedback_texto, created_at')
    .not('feedback_nota', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const total = feedbacks?.length ?? 0
  const media = total > 0
    ? (feedbacks!.reduce((s, f) => s + (f.feedback_nota ?? 0), 0) / total).toFixed(1)
    : '—'
  const comTexto = feedbacks?.filter(f => f.feedback_texto).length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Feedbacks</h1>
        <p className="text-gray-500 text-sm mt-1">{total} avaliações recebidas</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-500">Nota média</p>
          <p className="text-4xl font-extrabold text-blue-700 mt-1">{media}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-500">Total de avaliações</p>
          <p className="text-4xl font-extrabold text-green-600 mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-500">Com comentário</p>
          <p className="text-4xl font-extrabold text-purple-600 mt-1">{comTexto}</p>
        </div>
      </div>

      {/* Lista de feedbacks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Aluno</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nota</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Comentário</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {(feedbacks ?? []).map((f: any) => (
                <tr key={f.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">{f.nome || '—'}</div>
                    <div className="text-gray-400 text-xs">{f.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <Estrelas nota={f.feedback_nota} />
                  </td>
                  <td className="px-5 py-3 text-gray-600 max-w-sm">
                    {f.feedback_texto || <span className="text-gray-300 italic">sem comentário</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(f.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {!feedbacks?.length && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Nenhum feedback ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
