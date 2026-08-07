import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Login do admin compara senha em texto puro sem 2FA — alvo direto de brute-force,
// por isso o limite é bem mais restrito que os outros endpoints.
export const adminLoginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'ratelimit:admin-login',
})

// Endpoints públicos de escrita (submit, subscribe): protege contra spam/bot e,
// no caso do /submit, contra custo de IA (Anthropic) e e-mail (Resend) por request.
export const publicFormRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:public-form',
})

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
