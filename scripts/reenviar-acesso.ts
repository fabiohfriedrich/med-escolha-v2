// Reenvio pontual de acesso: pra compradores que já têm conta no Clerk (compra processada
// certinho) mas não receberam o e-mail com a senha temporária (entrega falhou/foi pra spam).
// Gera uma senha temporária nova, atualiza no Clerk e reenvia o e-mail de acesso via Resend.
//
// Rodar: node --env-file=.env.local scripts/reenviar-acesso.ts email1@x.com email2@x.com

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
if (!resendApiKey) throw new Error('Falta RESEND_API_KEY')

const APP_URL = 'https://app.medescolha.com'
const emails = process.argv.slice(2).map(e => e.toLowerCase().trim())
if (emails.length === 0) throw new Error('Passe pelo menos um e-mail como argumento')

const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
const clerk = createClerkClient({ secretKey: clerkSecretKey })
const resend = new Resend(resendApiKey)

function gerarSenhaTemporaria(): string {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 10; i++) senha += alfabeto[randomInt(alfabeto.length)]
  return senha
}

function emailHtml(nome: string, senhaTemporaria: string) {
  const primeiroNome = nome.split(' ')[0] || 'colega'
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#F0F4FA;padding:40px 16px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #E5EAF2">
      <h1 style="font-size:20px;color:#1B2E5E;text-align:center">Seu acesso ao Med Escolha está pronto</h1>
      <p style="font-size:14px;color:#374151;text-align:center">Olá, ${primeiroNome}! Reenviamos seu acesso à plataforma.</p>
      <div style="background:#F0F4FA;border-radius:12px;padding:16px;text-align:center;margin:20px 0">
        <p style="font-size:12px;color:#6b7280;margin:0 0 4px">Sua senha temporária:</p>
        <p style="font-family:monospace;font-size:20px;font-weight:700;color:#1B2E5E;margin:0">${senhaTemporaria}</p>
      </div>
      <p style="font-size:12px;color:#9CA3AF;text-align:center">Você será solicitado a criar uma senha definitiva no primeiro acesso.</p>
      <div style="text-align:center;margin-top:20px">
        <a href="${APP_URL}/login" style="display:inline-block;background:#1D6FE8;color:#fff;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px">Acessar a plataforma</a>
      </div>
    </div></body></html>`
}

async function main() {
  for (const email of emails) {
    const { data: comprador } = await supabase.from('compradores').select('nome').eq('email', email).maybeSingle()
    const nome = comprador?.nome ?? ''

    const { data: usuarios } = await clerk.users.getUserList({ emailAddress: [email] })
    const user = usuarios[0]
    if (!user) {
      console.error(`  [erro] ${email}: sem conta no Clerk (rode reconciliar-clerk-compradores.ts primeiro)`)
      continue
    }

    const senhaTemporaria = gerarSenhaTemporaria()
    await clerk.users.updateUser(user.id, { password: senhaTemporaria })
    await clerk.users.updateUserMetadata(user.id, { publicMetadata: { mustChangePassword: true } })

    const { error } = await resend.emails.send({
      from: 'Med Escolha <noreply@medescolha.com>',
      to: email,
      subject: 'Seu acesso ao Med Escolha está pronto',
      html: emailHtml(nome, senhaTemporaria),
    })

    if (error) console.error(`  [erro ao enviar e-mail] ${email}:`, error)
    else console.log(`  [ok] ${email} (${nome || 'sem nome'}) — senha resetada e e-mail reenviado`)
  }
}

main().catch(err => {
  console.error('Falha no reenvio:', err)
  process.exit(1)
})
