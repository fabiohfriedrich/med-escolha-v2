// Faixas de data do dashboard financeiro, sempre calculadas em America/Sao_Paulo.
// Brasil está fixo em UTC-3 desde 2019 (sem horário de verão), então meia-noite em
// São Paulo corresponde sempre a 03:00 UTC do mesmo dia — não precisa de lib de timezone.

export type PresetFiltro = 'hoje' | 'ontem' | '7dias' | 'este_mes' | 'mes_passado'

export interface FaixaData {
  from: string // YYYY-MM-DD, em America/Sao_Paulo
  to: string // YYYY-MM-DD, em America/Sao_Paulo
}

const TZ = 'America/Sao_Paulo'
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/

function dataSP(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

// Soma/subtrai dias sobre uma data (YYYY-MM-DD) usando meio-dia UTC como referência,
// pra nunca virar de dia por causa do fuso ao fazer a aritmética.
function somarDias(dataStr: string, dias: number): string {
  const d = new Date(`${dataStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function resolverFaixa(preset: PresetFiltro | null, fromParam: string | null, toParam: string | null): FaixaData {
  const hojeStr = dataSP(new Date())

  if (!preset) {
    if (fromParam && toParam && REGEX_DATA.test(fromParam) && REGEX_DATA.test(toParam) && fromParam <= toParam) {
      return { from: fromParam, to: toParam }
    }
    return { from: hojeStr, to: hojeStr }
  }

  switch (preset) {
    case 'hoje':
      return { from: hojeStr, to: hojeStr }
    case 'ontem': {
      const ontem = somarDias(hojeStr, -1)
      return { from: ontem, to: ontem }
    }
    case '7dias':
      return { from: somarDias(hojeStr, -6), to: hojeStr }
    case 'este_mes':
      return { from: `${hojeStr.slice(0, 7)}-01`, to: hojeStr }
    case 'mes_passado': {
      const primeiroDiaEsteMes = `${hojeStr.slice(0, 7)}-01`
      const ultimoDiaMesPassado = somarDias(primeiroDiaEsteMes, -1)
      const primeiroDiaMesPassado = `${ultimoDiaMesPassado.slice(0, 7)}-01`
      return { from: primeiroDiaMesPassado, to: ultimoDiaMesPassado }
    }
    default:
      return { from: hojeStr, to: hojeStr }
  }
}

export function inicioDiaSPms(dataStr: string): number {
  return new Date(`${dataStr}T03:00:00.000Z`).getTime()
}

export function fimDiaSPms(dataStr: string): number {
  return inicioDiaSPms(dataStr) + 24 * 60 * 60 * 1000 - 1
}
