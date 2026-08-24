import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null
let _lazyClient: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _client
}

// Adia inclusive o acesso às variáveis para quando uma operação for executada.
// Isso permite coletar as rotas no build sem expor credenciais ao ambiente de Preview.
export function getSupabaseAdmin(): SupabaseClient {
  if (!_lazyClient) {
    _lazyClient = new Proxy({} as SupabaseClient, {
      get(_target, property) {
        const client = getClient()
        const value = Reflect.get(client, property, client)
        return typeof value === 'function' ? value.bind(client) : value
      },
    })
  }

  return _lazyClient
}
