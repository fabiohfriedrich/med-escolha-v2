import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { clerkClient } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Eventos que liberam o acesso
const EVENTOS_APROVADOS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']
// Eventos que revogam o acesso
const EVENTOS_CANCELADOS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED']

const APP_URL = 'https://app.medescolha.com'

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 75" fill="none" width="160" height="43">
  <rect x="8" y="4" width="38" height="28" rx="10" fill="#E63946"/>
  <rect x="4" y="22" width="48" height="34" rx="11" fill="#1D6FE8"/>
  <path d="M14 56 L8 70 L26 58" fill="#1D6FE8"/>
  <circle cx="16" cy="39" r="3.2" fill="white"/>
  <circle cx="28" cy="39" r="3.2" fill="white"/>
  <circle cx="40" cy="39" r="3.2" fill="white"/>
  <text x="68" y="34" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="24" fill="#1B2E5E" letter-spacing="-0.5">Med Escolha</text>
  <text x="70" y="52" font-family="Arial, sans-serif" font-weight="400" font-size="12" fill="#9CA3AF">por amo medicina</text>
</svg>`

function emailComSenhaHtml(titulo: string, subtitulo: string, senhaTemporaria: string, linkAcesso: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F0F4FA;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4FA;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td align="center" style="padding-bottom:28px;">${LOGO_SVG}</td></tr>
      <tr><td style="background:#ffffff;border-radius:16px;padding:40px 40px 36px;border:1px solid #E5EAF2;">
        <h1 style="font-family:Arial Black,Arial,sans-serif;font-size:24px;color:#1B2E5E;margin:0 0 12px;text-align:center;">${titulo}</h1>
        <p style="font-size:16px;color:#374151;line-height:1.6;text-align:center;margin:0 0 24px;">${subtitulo}</p>
        <div style="background:#F0F4FA;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
          <p style="font-size:13px;color:#6b7280;margin:0 0 6px;">Sua senha temporária de acesso:</p>
          <p style="font-family:monospace;font-size:22px;font-weight:700;color:#1B2E5E;letter-spacing:1px;margin:0;">${senhaTemporaria}</p>
        </div>
        <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0 0 24px;">
          Por segurança, você será solicitado a criar uma senha definitiva no primeiro acesso.
        </p>
        <div style="text-align:center;">
          <a href="${linkAcesso}" style="display:inline-block;background:#1D6FE8;color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">Acessar a plataforma</a>
        </div>
      </td></tr>
      <tr><td style="padding:24px 0 8px;" align="center">
        <p style="font-size:12px;color:#9CA3AF;margin:0;">Med Escolha · por Amo Medicina<br>
        <a href="${APP_URL}" style="color:#9CA3AF;">app.medescolha.com</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

async function criarOuAtualizarAcessoClerk(emailLower: string, nome: string) {
  const primeiroNome = nome.split(' ')[0] || 'Médico(a)'
  const senhaTemporaria = process.env.CLERK_MIGRATION_DEFAULT_PASSWORD
  if (!senhaTemporaria) {
    console.error('[webhook] CLERK_MIGRATION_DEFAULT_PASSWORD não configurada')
    return
  }

  const client = await clerkClient()
  const { data: usuariosExistentes } = await client.users.getUserList({ emailAddress: [emailLower] })
  const usuarioExistente = usuariosExistentes[0]

  let assunto: string
  let titulo: string
  let subtitulo: string

  try {
    if (usuarioExistente) {
      await client.users.updateUser(usuarioExistente.id, { password: senhaTemporaria })
      await client.users.updateUserMetadata(usuarioExistente.id, {
        publicMetadata: { mustChangePassword: true },
      })
      assunto = 'Acesse o Med Escolha — sua senha temporária'
      titulo = `Bem-vindo de volta, ${primeiroNome}!`
      subtitulo = 'Sua compra foi confirmada. Use a senha temporária abaixo para acessar a plataforma.'
    } else {
      await client.users.createUser({
        emailAddress: [emailLower],
        firstName: nome.split(' ')[0],
        lastName: nome.split(' ').slice(1).join(' ') || undefined,
        password: senhaTemporaria,
        publicMetadata: { mustChangePassword: true },
      })
      assunto = 'Seu acesso ao Med Escolha está pronto'
      titulo = `Bem-vindo ao Med Escolha, ${primeiroNome}!`
      subtitulo = 'Sua compra foi confirmada. Use a senha temporária abaixo para acessar a plataforma.'
    }
  } catch (err) {
    console.error('[webhook] Erro ao criar/atualizar usuário no Clerk:', err)
    return
  }

  const resend = new Resend((process.env.RESEND_API_KEY ?? '').replace(/^﻿/, '').trim())
  const { error: emailError } = await resend.emails.send({
    from: 'Med Escolha <noreply@medescolha.com>',
    to: emailLower,
    subject: assunto,
    html: emailComSenhaHtml(titulo, subtitulo, senhaTemporaria, `${APP_URL}/login`),
  })

  if (emailError) console.error('[webhook] Erro ao enviar email via Resend:', emailError)
  else console.log(`[webhook] Email enviado via Resend: ${emailLower}`)
}

export async function POST(req: NextRequest) {
  try {
    // Valida hottok — token fixo que a Hotmart inclui em todo webhook
    const hottok = process.env.HOTMART_HOTTOK
    if (hottok) {
      const receivedToken = req.headers.get('x-hotmart-hottok') ?? req.nextUrl.searchParams.get('hottok') ?? ''
      if (receivedToken !== hottok) {
        console.warn('[webhook] hottok inválido:', receivedToken)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await req.json()
    const event: string = body?.event ?? ''

    // Ignora eventos que não precisamos processar — retorna 200 para a Hotmart não retentar
    const EVENTOS_CONHECIDOS = [...EVENTOS_APROVADOS, ...EVENTOS_CANCELADOS]
    if (!EVENTOS_CONHECIDOS.includes(event)) {
      return NextResponse.json({ ok: true, action: 'ignorado', event })
    }

    const email: string = body?.data?.buyer?.email ?? ''
    const nome: string = body?.data?.buyer?.name ?? ''
    const transactionId: string = body?.data?.purchase?.transaction ?? ''

    if (!email) {
      console.warn(`[webhook] Evento ${event} sem email no payload`)
      return NextResponse.json({ ok: true, action: 'ignorado', reason: 'sem-email' })
    }

    const emailLower = email.toLowerCase().trim()

    if (EVENTOS_APROVADOS.includes(event)) {
      // 1. Registra/ativa o comprador no banco
      const { error } = await getSupabaseAdmin()
        .from('compradores')
        .upsert(
          {
            email: emailLower,
            nome,
            hotmart_transaction_id: transactionId,
            ativo: true,
            status_pagamento: 'pago',
            tipo: 'comprador',
          },
          { onConflict: 'email', ignoreDuplicates: false }
        )

      if (error) {
        console.error('Supabase upsert error:', error)
        return NextResponse.json({ error: 'Erro ao salvar comprador' }, { status: 500 })
      }

      // 2. Cria/atualiza o usuário no Clerk com senha temporária e envia o e-mail de acesso
      await criarOuAtualizarAcessoClerk(emailLower, nome)

      console.log(`[webhook] Comprador liberado: ${emailLower} (${event})`)
      return NextResponse.json({ ok: true, action: 'liberado', email: emailLower })
    }

    if (EVENTOS_CANCELADOS.includes(event)) {
      const statusMap: Record<string, string> = {
        PURCHASE_REFUNDED: 'reembolsado',
        PURCHASE_CHARGEBACK: 'chargeback',
        PURCHASE_CANCELED: 'cancelado',
      }
      const status_pagamento = statusMap[event] ?? 'cancelado'
      const { error } = await getSupabaseAdmin()
        .from('compradores')
        .update({ ativo: false, status_pagamento })
        .eq('email', emailLower)

      if (error) console.error('Supabase update error:', error)

      console.log(`[webhook] Acesso revogado: ${emailLower} (${event})`)
      return NextResponse.json({ ok: true, action: 'revogado', email: emailLower })
    }

    return NextResponse.json({ ok: true, action: 'ignorado', event })
  } catch (err) {
    const msg = err instanceof Error ? `${err.message} | ${err.stack}` : String(err)
    console.error('[webhook] Erro:', msg)
    return NextResponse.json({ error: 'Erro interno', detail: msg }, { status: 500 })
  }
}

// A Hotmart também faz um GET para verificar se a URL está ativa
export async function GET() {
  return NextResponse.json({ status: 'Med Escolha webhook ativo' })
}
