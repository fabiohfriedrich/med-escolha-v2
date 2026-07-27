import * as XLSX from 'xlsx'
import path from 'path'

const wb = XLSX.utils.book_new()

// ── Aba: Como usar ────────────────────────────────────────────────────────
const comoUsar = XLSX.utils.aoa_to_sheet([
  ['Planilha Financeira para Início de Carreira Médica'],
  ['por Amo Medicina'],
  [],
  ['Como usar:'],
  ['1. Preencha a aba "Receitas" com o que você recebe todo mês (bolsa de residência, plantões, PJ, etc.)'],
  ['2. Preencha "Despesas fixas" e "Despesas variáveis" com seus gastos do mês'],
  ['3. A aba "Resumo" calcula automaticamente seu saldo e quanto sobra pra poupar'],
  ['4. Use a aba "Reserva de emergência" pra planejar sua meta de segurança financeira'],
  [],
  ['Dica: no início da carreira, a renda costuma variar bastante (plantões extras, PJ, bolsa).'],
  ['Reavalie essa planilha todo mês, principalmente nos primeiros meses de residência ou primeiro emprego.'],
])
comoUsar['!cols'] = [{ wch: 90 }]
XLSX.utils.book_append_sheet(wb, comoUsar, 'Como usar')

// ── Aba: Receitas ─────────────────────────────────────────────────────────
const receitas = XLSX.utils.aoa_to_sheet([
  ['Receitas mensais', 'Valor (R$)'],
  ['Bolsa de residência', 0],
  ['Plantões extras', 0],
  ['Renda PJ / consultório', 0],
  ['Outras rendas', 0],
  ['Total de receitas', { f: 'SUM(B2:B5)' }],
])
receitas['!cols'] = [{ wch: 30 }, { wch: 16 }]
XLSX.utils.book_append_sheet(wb, receitas, 'Receitas')

// ── Aba: Despesas fixas ───────────────────────────────────────────────────
const despesasFixas = XLSX.utils.aoa_to_sheet([
  ['Despesas fixas', 'Valor (R$)'],
  ['Moradia (aluguel/financiamento)', 0],
  ['Condomínio', 0],
  ['Transporte', 0],
  ['Alimentação', 0],
  ['Plano de saúde', 0],
  ['Celular/internet', 0],
  ['Mensalidade cursos/residência', 0],
  ['Outras despesas fixas', 0],
  ['Total de despesas fixas', { f: 'SUM(B2:B8)' }],
])
despesasFixas['!cols'] = [{ wch: 32 }, { wch: 16 }]
XLSX.utils.book_append_sheet(wb, despesasFixas, 'Despesas fixas')

// ── Aba: Despesas variáveis ───────────────────────────────────────────────
const despesasVariaveis = XLSX.utils.aoa_to_sheet([
  ['Despesas variáveis', 'Valor (R$)'],
  ['Lazer', 0],
  ['Roupas/jaleco/equipamentos', 0],
  ['Presentes', 0],
  ['Imprevistos', 0],
  ['Outras despesas variáveis', 0],
  ['Total de despesas variáveis', { f: 'SUM(B2:B5)' }],
])
despesasVariaveis['!cols'] = [{ wch: 32 }, { wch: 16 }]
XLSX.utils.book_append_sheet(wb, despesasVariaveis, 'Despesas variáveis')

// ── Aba: Reserva de emergência ────────────────────────────────────────────
const reserva = XLSX.utils.aoa_to_sheet([
  ['Reserva de emergência', ''],
  ['Meses de despesas que você quer guardar', 6],
  ['Total de despesas fixas + variáveis (mês)', { f: "'Despesas fixas'!B9+'Despesas variáveis'!B7" }],
  ['Meta de reserva de emergência', { f: 'B2*B3' }],
  ['Quanto você já tem guardado hoje', 0],
  ['Quanto ainda falta', { f: 'B4-B5' }],
])
reserva['!cols'] = [{ wch: 38 }, { wch: 16 }]
XLSX.utils.book_append_sheet(wb, reserva, 'Reserva de emergência')

// ── Aba: Resumo ───────────────────────────────────────────────────────────
const resumo = XLSX.utils.aoa_to_sheet([
  ['Resumo do mês', ''],
  ['Total de receitas', { f: 'Receitas!B6' }],
  ['Total de despesas fixas', { f: "'Despesas fixas'!B9" }],
  ['Total de despesas variáveis', { f: "'Despesas variáveis'!B7" }],
  ['Saldo do mês', { f: 'B2-B3-B4' }],
  ['% da renda que sobrou', { f: 'IF(B2=0,0,B5/B2)', z: '0%' }],
])
resumo['!cols'] = [{ wch: 30 }, { wch: 16 }]
XLSX.utils.book_append_sheet(wb, resumo, 'Resumo')

const outPath = path.join(__dirname, '..', 'public', 'downloads', 'planilha-financeira-medico.xlsx')
XLSX.writeFile(wb, outPath)
console.log('Planilha gerada em', outPath)
