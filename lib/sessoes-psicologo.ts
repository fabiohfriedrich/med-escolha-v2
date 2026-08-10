import { getSupabaseAdmin } from '@/lib/supabase-admin'

type Pacote = { id: string; sessoes_total: number; sessoes_usadas: number }

export async function getPacotesAtivos(email: string): Promise<Pacote[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('pacotes_psicologo')
    .select('id, sessoes_total, sessoes_usadas')
    .eq('email', email)
    .eq('ativo', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export function calcularSaldo(pacotes: Pacote[]) {
  const total = pacotes.reduce((s, p) => s + p.sessoes_total, 0)
  const usadas = pacotes.reduce((s, p) => s + p.sessoes_usadas, 0)
  return { saldo: total - usadas, total, usadas }
}

export function proximoPacoteComSaldo(pacotes: Pacote[]): Pacote | null {
  return pacotes.find((p) => p.sessoes_usadas < p.sessoes_total) ?? null
}
