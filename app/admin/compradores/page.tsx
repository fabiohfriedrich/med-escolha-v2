import { supabase } from '@/lib/supabase'
import CompradoresClient from './CompradoresClient'

export default async function AdminCompradores() {
  const { data: compradores } = await supabase
    .from('compradores')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Compradores</h1>
        <p className="text-gray-500 text-sm mt-1">{compradores?.length ?? 0} compradores cadastrados</p>
      </div>
      <CompradoresClient compradores={compradores ?? []} />
    </div>
  )
}
