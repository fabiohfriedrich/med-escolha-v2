import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY não configurada')
  return new Resend(key)
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-escolha-v2.vercel.app'
const FROM_EMAIL = process.env.EMAIL_FROM || 'Med Escolha <medescolha@euamomedicina.com>'

interface SendResultEmailParams {
  resultadoId: string
  nome: string
  email: string
  ranking: Array<{ nome: string; pct: number; saturacao: string; crescimento: string }>
}

export async function sendResultEmail({ resultadoId, nome, email, ranking }: SendResultEmailParams) {
  const top3 = ranking.slice(0, 3)
  const primeiroNome = nome.split(' ')[0]
  const medals = ['🥇', '🥈', '🥉']
  const resultUrl = `${APP_URL}/resultado/${resultadoId}`

  const satColor: Record<string, string> = { Baixa: '#16a34a', Média: '#ea580c', Alta: '#dc2626' }
  const satBg: Record<string, string> = { Baixa: '#dcfce7', Média: '#fef3c7', Alta: '#fee2e2' }

  const top3HTML = top3.map((e, i) => `
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:12px;border-left:4px solid #00C9A7">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span style="font-size:18px">${medals[i]}</span>
          <span style="font-size:16px;font-weight:700;color:#0D2150;margin-left:8px">${e.nome}</span>
        </div>
        <span style="font-size:20px;font-weight:800;color:#00C9A7">${e.pct.toFixed(1)}%</span>
      </div>
      <div style="margin-top:8px">
        <div style="background:#e5e7eb;border-radius:4px;height:6px;width:100%">
          <div style="background:#00C9A7;width:${e.pct}%;height:6px;border-radius:4px"></div>
        </div>
      </div>
      <div style="margin-top:8px">
        <span style="background:${satBg[e.saturacao] || '#f3f4f6'};color:${satColor[e.saturacao] || '#6b7280'};font-size:11px;font-weight:600;padding:2px 8px;border-radius:8px">
          Mercado ${e.saturacao}
        </span>
        <span style="background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:600;padding:2px 8px;border-radius:8px;margin-left:6px">
          Crescimento ${e.crescimento}
        </span>
      </div>
    </div>`).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:#0D2150;padding:32px 40px;text-align:center">
      <div style="font-size:32px;font-weight:900;color:#fff;letter-spacing:-1px">
        med<span style="display:inline-block;width:12px;height:12px;background:#00C9A7;border-radius:50%;vertical-align:middle;margin:0 2px;position:relative;top:-3px"></span>escolha
      </div>
      <div style="font-size:13px;color:#00C9A7;font-weight:600;margin-top:4px">por amo medicina</div>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px">
      <h1 style="font-size:22px;font-weight:800;color:#0D2150;margin:0 0 8px">
        Olá, ${primeiroNome}! Seu resultado chegou 🎯
      </h1>
      <p style="font-size:14px;color:#495057;line-height:1.7;margin:0 0 24px">
        Seu teste de compatibilidade com especialidades médicas foi analisado.<br>
        Veja abaixo as <strong>3 especialidades com maior afinidade</strong> com o seu perfil:
      </p>

      ${top3HTML}

      <div style="text-align:center;margin:32px 0">
        <a href="${resultUrl}"
           style="display:inline-block;background:#00C9A7;color:#fff;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.3px">
          Ver resultado completo e baixar PDF →
        </a>
      </div>

      <p style="font-size:12px;color:#6c757d;line-height:1.7;margin:0">
        O link acima dá acesso ao seu resultado completo com todas as 55 especialidades ranqueadas, análise de perfil Holland e temperamento, além do PDF para download.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center">
      <p style="font-size:11px;color:#9ca3af;margin:0">
        Med Escolha · por Amo Medicina · euamomedicina.com<br>
        Você recebeu este email porque realizou o teste Med Escolha.
      </p>
    </div>
  </div>
</body>
</html>`

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${primeiroNome}, seu resultado do Med Escolha chegou! 🎯`,
    html,
  })
}

// ── Email de lembrete de reteste ──────────────────────────────────────────────
export async function sendRetesteEmail({ email, nome }: { email: string; nome: string }) {
  const primeiroNome = nome.split(' ')[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-escolha-v2.vercel.app'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#0D2150;padding:32px 40px;text-align:center">
      <div style="font-size:32px;font-weight:900;color:#fff;letter-spacing:-1px">
        med<span style="display:inline-block;width:12px;height:12px;background:#00C9A7;border-radius:50%;vertical-align:middle;margin:0 2px;position:relative;top:-3px"></span>escolha
      </div>
      <div style="font-size:13px;color:#00C9A7;font-weight:600;margin-top:4px">por amo medicina</div>
    </div>
    <div style="padding:32px 40px">
      <h1 style="font-size:22px;font-weight:800;color:#0D2150;margin:0 0 12px">
        ${primeiroNome}, chegou a hora de refazer o teste! 🔄
      </h1>
      <p style="font-size:14px;color:#495057;line-height:1.7;margin:0 0 20px">
        Você agendou um reteste do <strong>Med Escolha</strong> para hoje. Ao longo dos seus estudos, seu perfil e interesses podem evoluir — por isso comparar os resultados ao longo do tempo é muito valioso.
      </p>
      <p style="font-size:14px;color:#495057;line-height:1.7;margin:0 0 28px">
        Clique abaixo para acessar o teste e ver como seu match com as especialidades mudou:
      </p>
      <div style="text-align:center;margin-bottom:28px">
        <a href="${appUrl}" style="display:inline-block;background:#00C9A7;color:#fff;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">
          Refazer o Med Escolha →
        </a>
      </div>
      <p style="font-size:12px;color:#6c757d;line-height:1.7">
        Dica: ao comparar seu novo resultado com o anterior, observe se as especialidades do topo se mantiveram ou se houve mudanças — isso reflete sua evolução ao longo da graduação.
      </p>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center">
      <p style="font-size:11px;color:#9ca3af;margin:0">Med Escolha · por Amo Medicina · euamomedicina.com</p>
    </div>
  </div>
</body>
</html>`

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${primeiroNome}, chegou a hora de refazer o Med Escolha! 🔄`,
    html,
  })
}
