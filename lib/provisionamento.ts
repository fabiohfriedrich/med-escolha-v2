import { randomInt } from 'node:crypto'
import { Resend } from 'resend'
import { clerkClient } from '@clerk/nextjs/server'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendAlertaAdminEmail } from '@/lib/email'

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

function emailComSenhaHtml(titulo: string, subtitulo: string, senhaTemporaria: string) {
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
          <a href="${APP_URL}/login" style="display:inline-block;background:#1D6FE8;color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">Acessar a plataforma</a>
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

// Gera uma senha temporária única por comprador. Antes usávamos uma senha fixa
// (CLERK_MIGRATION_DEFAULT_PASSWORD) igual pra todo mundo — como muitas contas compartilhavam
// a mesma senha, o detector de senha vazada/reutilizada do Clerk passou a barrar login e troca
// de senha de compradores novos. Evita caracteres ambíguos (0/O, 1/l/I) pra facilitar digitação.
function gerarSenhaTemporaria(): string {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 10; i++) senha += alfabeto[randomInt(alfabeto.length)]
  return senha
}

interface ResultadoProvisionamento {
  ok: boolean
  skipped?: boolean
}

/**
 * Cria/atualiza a conta no Clerk e envia o e-mail de acesso com senha temporária, gravando o
 * progresso em `compradores.status_provisionamento` a cada etapa. Chamada por: webhook da
 * Hotmart (provisionamento automático), endpoint do admin e script de reenvio em lote (reenvio
 * manual, `forcar: true`).
 *
 * Sem `forcar`, reivindica a linha atomicamente via a função `reclamar_provisionamento` no
 * Postgres antes de mexer no Clerk — evita a corrida de duas chamadas concorrentes (ex:
 * PURCHASE_APPROVED e PURCHASE_COMPLETE da mesma transação chegando quase juntos) gerarem duas
 * senhas e dois e-mails pro mesmo comprador. Com `forcar`, sempre gera senha nova e reenvia.
 */
export async function provisionarAcesso(
  email: string,
  nome: string,
  opts: { forcar?: boolean } = {}
): Promise<ResultadoProvisionamento> {
  const emailLower = email.toLowerCase().trim()
  const supabaseAdmin = getSupabaseAdmin()

  const { data: reclamoData, error: reclamoError } = await supabaseAdmin
    .rpc('reclamar_provisionamento', { p_email: emailLower, p_forcar: opts.forcar ?? false })
    .single()

  if (reclamoError) {
    console.error(`[provisionamento] Erro ao reclamar provisionamento de ${emailLower}:`, reclamoError.message)
    return { ok: false }
  }

  const reclamo = reclamoData as { reclamado: boolean; ja_existia: boolean; tentativa_atual: number }
  if (!reclamo.reclamado) {
    return { ok: true, skipped: true }
  }

  const tentativaAtual = reclamo.tentativa_atual
  const primeiroNome = nome.split(' ')[0] || 'Médico(a)'
  const senhaTemporaria = gerarSenhaTemporaria()

  let titulo: string
  let subtitulo: string
  let assunto: string

  try {
    const client = await clerkClient()
    const { data: usuariosExistentes } = await client.users.getUserList({ emailAddress: [emailLower] })
    const usuarioExistente = usuariosExistentes[0]

    if (opts.forcar) {
      assunto = 'Seu acesso ao Med Escolha foi reenviado'
      titulo = `Acesso reenviado, ${primeiroNome}!`
      subtitulo = 'Aqui está sua nova senha temporária de acesso.'
    } else if (usuarioExistente) {
      assunto = 'Acesse o Med Escolha — sua senha temporária'
      titulo = `Bem-vindo de volta, ${primeiroNome}!`
      subtitulo = 'Sua compra foi confirmada. Use a senha temporária abaixo para acessar a plataforma.'
    } else {
      assunto = 'Seu acesso ao Med Escolha está pronto'
      titulo = `Bem-vindo ao Med Escolha, ${primeiroNome}!`
      subtitulo = 'Sua compra foi confirmada. Use a senha temporária abaixo para acessar a plataforma.'
    }

    if (usuarioExistente) {
      await client.users.updateUser(usuarioExistente.id, { password: senhaTemporaria })
      await client.users.updateUserMetadata(usuarioExistente.id, { publicMetadata: { mustChangePassword: true } })
    } else {
      try {
        await client.users.createUser({
          emailAddress: [emailLower],
          firstName: nome.split(' ')[0],
          lastName: nome.split(' ').slice(1).join(' ') || undefined,
          password: senhaTemporaria,
          publicMetadata: { mustChangePassword: true },
        })
      } catch (createErr) {
        // Corrida: o Clerk já tem conta pra esse e-mail, mas a busca acima (getUserList)
        // não achou a tempo. Busca de novo e cai no fluxo de resetar senha em vez de desistir.
        const codigo = isClerkAPIResponseError(createErr) ? createErr.errors[0]?.code : undefined
        if (codigo !== 'form_identifier_exists') throw createErr

        const { data: retry } = await client.users.getUserList({ emailAddress: [emailLower] })
        const usuarioRecemEncontrado = retry[0]
        if (!usuarioRecemEncontrado) throw createErr

        await client.users.updateUser(usuarioRecemEncontrado.id, { password: senhaTemporaria })
        await client.users.updateUserMetadata(usuarioRecemEncontrado.id, { publicMetadata: { mustChangePassword: true } })
      }
    }

    const { error: erroContaCriada } = await supabaseAdmin
      .from('compradores')
      .update({ status_provisionamento: 'conta_criada' })
      .eq('email', emailLower)
    if (erroContaCriada) console.error(`[provisionamento] Erro ao gravar status 'conta_criada' de ${emailLower}:`, erroContaCriada.message)

    const resend = new Resend((process.env.RESEND_API_KEY ?? '').replace(/^﻿/, '').trim())
    const { data: envio, error: emailError } = await resend.emails.send({
      from: 'Med Escolha <noreply@medescolha.com>',
      to: emailLower,
      subject: assunto,
      html: emailComSenhaHtml(titulo, subtitulo, senhaTemporaria),
    })

    if (emailError) throw new Error(emailError.message ?? JSON.stringify(emailError))

    const { error: erroEmailEnviado } = await supabaseAdmin
      .from('compradores')
      .update({
        status_provisionamento: 'email_enviado',
        email_enviado_em: new Date().toISOString(),
        resend_email_id: envio?.id ?? null,
      })
      .eq('email', emailLower)
    if (erroEmailEnviado) {
      // Clerk e Resend já tiveram sucesso — o comprador recebeu o acesso. Só a nossa gravação de
      // status falhou; a linha fica em 'conta_criada'/'processando' e é reclamável de novo depois
      // (ver reclamar_provisionamento), então não é uma falha de provisionamento de verdade.
      console.error(`[provisionamento] Erro ao gravar status 'email_enviado' de ${emailLower}:`, erroEmailEnviado.message)
    }

    console.log(`[provisionamento] Acesso provisionado: ${emailLower} (tentativa ${tentativaAtual})`)
    return { ok: true }
  } catch (err) {
    const mensagemErro = err instanceof Error ? err.message : String(err)
    console.error(`[provisionamento] Falha ao provisionar acesso de ${emailLower}:`, mensagemErro)

    const { error: erroFalhou } = await supabaseAdmin
      .from('compradores')
      .update({ status_provisionamento: 'falhou', ultimo_erro: mensagemErro })
      .eq('email', emailLower)
    if (erroFalhou) console.error(`[provisionamento] Erro ao gravar status 'falhou' de ${emailLower}:`, erroFalhou.message)

    await sendAlertaAdminEmail({
      assunto: 'Falha ao provisionar acesso de comprador',
      contexto: {
        'E-mail do comprador': emailLower,
        Nome: nome,
        Tentativa: String(tentativaAtual),
        Erro: mensagemErro,
      },
    }).catch(alertaErr => console.error('[provisionamento] Erro ao enviar alerta:', alertaErr))

    return { ok: false }
  }
}
