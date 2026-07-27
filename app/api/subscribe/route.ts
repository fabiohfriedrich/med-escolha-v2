import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const raw = await request.json()
  const email = typeof raw.email === 'string' ? raw.email.toLowerCase().trim() : ''

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
  }

  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    // Em dev, sem credenciais configuradas, apenas retorna sucesso
    return NextResponse.json({ ok: true })
  }

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'comparador',
        utm_medium: 'isca_digital',
        utm_campaign: 'comparador_especialidades',
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    console.error('Beehiiv error:', res.status, body)
    return NextResponse.json({ error: 'Não foi possível realizar a inscrição. Tente novamente.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
