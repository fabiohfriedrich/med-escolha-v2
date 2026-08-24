import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return client
}

// Mantém a API existente, mas só cria o cliente quando uma consulta é feita.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const currentClient = getClient()
    const value = Reflect.get(currentClient, property, currentClient)
    return typeof value === 'function' ? value.bind(currentClient) : value
  },
})
