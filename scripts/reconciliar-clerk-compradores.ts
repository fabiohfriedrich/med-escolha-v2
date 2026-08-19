// Reconciliação pontual: lista compradores ativos no Supabase sem conta correspondente no
// Clerk (o padrão de falha descrito na auditoria de 18/08/2026 — 20 casos de
// "email_address_exists" onde a busca prévia não achou o usuário a tempo e o comprador
// ficou sem acesso, sem retry). O código do webhook (app/api/webhook/hotmart/route.ts) já
// foi corrigido pra se autorreparar nesse cenário dali pra frente — este script é só pra
// destravar quem já ficou preso antes da correção.
//
// Por padrão roda em modo consulta (não cria nada). Só cria conta + envia e-mail de acesso
// de verdade com a flag --apply.
//
// Rodar (consulta): node --env-file=.env.local scripts/reconciliar-clerk-compradores.ts
// Rodar (aplicar):  node --env-file=.env.local scripts/reconciliar-clerk-compradores.ts --apply

import { randomInt } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { createClerkClient } from '@clerk/backend'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const clerkSecretKey = process.env.CLERK_SECRET_KEY
const resendApiKey = (process.env.RESEND_API_KEY ?? '').replace(/^﻿/, '').trim()

if (!supabaseUrl || !supabaseServiceKey) throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
if (!clerkSecretKey) throw new Error('Falta CLERK_SECRET_KEY')

const APLICAR = process.argv.includes('--apply')
const APP_URL = 'https://app.medescolha.com'

const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
const clerk = createClerkClient({ secretKey: clerkSecretKey })

function gerarSenhaTemporaria(): string {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 10; i++) senha += alfabeto[randomInt(alfabeto.length)]
  return senha
}

async function enviarEmailAcesso(email: string, nome: string, senhaTemporaria: string) {
  if (!resendApiKey) {
    console.warn(`  [aviso] RESEND_API_KEY ausente — conta criada, mas e-mail não enviado pra ${email}`)
    return
  }
  const primeiroNome = nome.split(' ')[0] || 'colega'
  const resend = new Resend(resendApiKey)
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#F0F4FA;padding:40px 16px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #E5EAF2">
      <h1 style="font-size:20px;color:#1B2E5E;text-align:center">Seu acesso ao Med Escolha está pronto</h1>
      <p style="font-size:14px;color:#374151;text-align:center">Olá, ${primeiroNome}! Encontramos sua compra confirmada e liberamos seu acesso.</p>
      <div style="background:#F0F4FA;border-radius:12px;padding:16px;text-align:center;margin:20px 0">
        <p style="font-size:12px;color:#6b7280;margin:0 0 4px">Sua senha temporária:</p>
        <p style="font-family:monospace;font-size:20px;font-weight:700;color:#1B2E5E;margin:0">${senhaTemporaria}</p>
      </div>
      <p style="font-size:12px;color:#9CA3AF;text-align:center">Você será solicitado a criar uma senha definitiva no primeiro acesso.</p>
      <div style="text-align:center;margin-top:20px">
        <a href="${APP_URL}/login" style="display:inline-block;background:#1D6FE8;color:#fff;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px">Acessar a plataforma</a>
      </div>
    </div></body></html>`

  const { error } = await resend.emails.send({
    from: 'Med Escolha <noreply@medescolha.com>',
    to: email,
    subject: 'Seu acesso ao Med Escolha está pronto',
    html,
  })
  if (error) console.error(`  [erro ao enviar e-mail] ${email}:`, error)
  else console.log(`  [e-mail enviado] ${email}`)
}

async function main() {
  console.log(`Modo: ${APLICAR ? 'APLICAR (vai criar contas e enviar e-mail de verdade)' : 'consulta (dry-run, nada será criado)'}\n`)

  const { data: compradores, error } = await supabase
    .from('compradores')
    .select('email, nome')
    .eq('ativo', true)
    .eq('tipo', 'comprador')

  if (error) throw error
  console.log(`${compradores.length} compradores ativos no Supabase.\n`)

  const semContaClerk: Array<{ email: string; nome: string }> = []

  for (const c of compradores) {
    const email = c.email.toLowerCase().trim()
    const { data: existentes } = await clerk.users.getUserList({ emailAddress: [email] })
    if (existentes.length === 0) semContaClerk.push({ email, nome: c.nome ?? '' })
  }

  console.log(`${semContaClerk.length} comprador(es) ativo(s) sem conta no Clerk:\n`)
  semContaClerk.forEach(c => console.log(`  - ${c.email} (${c.nome || 'sem nome'})`))

  if (!APLICAR) {
    console.log('\nRodando em modo consulta — nada foi criado. Rode de novo com --apply pra criar as contas e enviar o e-mail de acesso.')
    return
  }

  console.log('\nCriando contas e enviando e-mails...\n')
  for (const c of semContaClerk) {
    try {
      const senhaTemporaria = gerarSenhaTemporaria()
      await clerk.users.createUser({
        emailAddress: [c.email],
        firstName: c.nome.split(' ')[0] || undefined,
        lastName: c.nome.split(' ').slice(1).join(' ') || undefined,
        password: senhaTemporaria,
        publicMetadata: { mustChangePassword: true },
      })
      console.log(`  [conta criada] ${c.email}`)
      await enviarEmailAcesso(c.email, c.nome, senhaTemporaria)
    } catch (err) {
      console.error(`  [erro] ${c.email}:`, err instanceof Error ? err.message : err)
    }
  }
}

main().catch(err => {
  console.error('Falha na reconciliação:', err)
  process.exit(1)
})
