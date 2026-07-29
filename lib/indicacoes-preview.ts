// E-mails com acesso liberado ao bônus de indicação sem precisar bater a meta —
// uso interno pra revisar o material antes de divulgar o programa.
const EMAILS_PREVIA = ['fabiohfriedrich@gmail.com']

export function temAcessoPrevia(email: string | null | undefined): boolean {
  if (!email) return false
  return EMAILS_PREVIA.includes(email.toLowerCase().trim())
}
