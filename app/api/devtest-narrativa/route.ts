import { NextResponse } from 'next/server'
import { gerarNarrativasTop3 } from '@/lib/narrativa-ia'

export async function GET() {
  const result = await gerarNarrativasTop3({
    nome: 'Maria Teste',
    demographics: { genero: 'F', anoFormatura: '2026' },
    hollandList: ['Investigativo', 'Social'],
    jungSelected: ['temp-01', 'temp-03'],
    c04bAnswers: { '2001': 8 },
    top3: [
      { id: 1, nome: 'Dermatologia', pct: 94.3, saturacao: 'Alta', crescimento: 'Alto' },
      { id: 2, nome: 'Psiquiatria', pct: 88.1, saturacao: 'Média', crescimento: 'Alto' },
      { id: 3, nome: 'Oftalmologia', pct: 85.6, saturacao: 'Média', crescimento: 'Médio' },
    ],
  })
  return NextResponse.json({ result })
}
