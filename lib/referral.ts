const STORAGE_KEY = 'med_escolha_ref'
const DIAS_VALIDADE = 30

export function capturarRefDaUrl(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (!ref) return
  const expiraEm = Date.now() + DIAS_VALIDADE * 24 * 60 * 60 * 1000
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ codigo: ref, expiraEm }))
  } catch {
    // localStorage indisponível (modo privado, etc) — ignora
  }
}

export function getRefArmazenado(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { codigo, expiraEm } = JSON.parse(raw)
    if (!codigo || Date.now() > expiraEm) return null
    return codigo as string
  } catch {
    return null
  }
}

export function comCodigoIndicacao(url: string): string {
  const ref = getRefArmazenado()
  if (!ref) return url
  const separador = url.includes('?') ? '&' : '?'
  return `${url}${separador}sck=${encodeURIComponent(ref)}`
}
