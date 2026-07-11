// Migração única: recria no Clerk todos os usuários que hoje existem no Supabase Auth,
// com uma senha temporária e a flag mustChangePassword=true (força troca no 1º login).
//
// Rodar uma vez, manualmente, depois de configurar as chaves do Clerk no .env.local:
//   node --env-file=.env.local scripts/migrate-users-to-clerk.mjs
//
// Não é uma API route — não faz parte do runtime do app.

import { createClient } from '@supabase/supabase-js'
import { createClerkClient } from '@clerk/backend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const clerkSecretKey = process.env.CLERK_SECRET_KEY
const senhaTemporaria = process.env.CLERK_MIGRATION_DEFAULT_PASSWORD

if (!supabaseUrl || !supabaseServiceKey) throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
if (!clerkSecretKey) throw new Error('Falta CLERK_SECRET_KEY')
if (!senhaTemporaria) throw new Error('Falta CLERK_MIGRATION_DEFAULT_PASSWORD')

const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
const clerk = createClerkClient({ secretKey: clerkSecretKey })

async function listarTodosUsuariosSupabase() {
  const usuarios = []
  let page = 1
  const perPage = 200
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    usuarios.push(...data.users)
    if (data.users.length < perPage) break
    page++
  }
  return usuarios
}

async function main() {
  const usuarios = await listarTodosUsuariosSupabase()
  console.log(`Encontrados ${usuarios.length} usuários no Supabase Auth.`)

  const resultado = { criados: 0, jaExistiam: 0, erros: 0 }

  for (const u of usuarios) {
    const email = u.email?.toLowerCase().trim()
    if (!email) continue

    const nomeCompleto = u.user_metadata?.full_name ?? ''
    const [firstName, ...resto] = nomeCompleto.split(' ').filter(Boolean)
    const lastName = resto.join(' ') || undefined

    try {
      const { data: existentes } = await clerk.users.getUserList({ emailAddress: [email] })
      if (existentes.length > 0) {
        console.log(`[já existe no Clerk] ${email}`)
        resultado.jaExistiam++
        continue
      }

      await clerk.users.createUser({
        emailAddress: [email],
        firstName,
        lastName,
        password: senhaTemporaria,
        publicMetadata: { mustChangePassword: true },
      })
      console.log(`[criado] ${email}`)
      resultado.criados++
    } catch (err) {
      console.error(`[erro] ${email}:`, err instanceof Error ? err.message : err)
      resultado.erros++
    }
  }

  console.log('\nResumo da migração:', resultado)
}

main().catch(err => {
  console.error('Falha na migração:', err)
  process.exit(1)
})
