import descriptionsData from '@/data/descriptions.json'
import dmbData from '@/data/dmb_data.json'
import ComparadorClient from './ComparadorClient'

export const metadata = {
  title: 'Compare Especialidades | Med Escolha',
  description: 'Compare duas especialidades médicas lado a lado: salário, saturação, residência e crescimento projetado — de graça.',
}

export default function ComparadorPage() {
  const descriptions = (descriptionsData as any).specialties as Array<{ id: number; nome: string; categoria?: string }>
  const dmb = (dmbData as any).specialties as Array<{
    id: number
    salario_min: number
    salario_max: number
    anos_formacao: number
    saturacao: string
    crescimento_projetado: string
  }>

  const specialties = descriptions
    .map(d => {
      const data = dmb.find(x => x.id === d.id)
      if (!data || !data.salario_min) return null
      return {
        id: d.id,
        nome: d.nome,
        categoria: d.categoria,
        salario_min: data.salario_min,
        salario_max: data.salario_max,
        anos_formacao: data.anos_formacao,
        saturacao: data.saturacao,
        crescimento_projetado: data.crescimento_projetado,
      }
    })
    .filter(Boolean) as any[]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero */}
      <div style={{ background: '#0f2d5e', color: 'white' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', marginBottom: 12 }}>
            Ferramenta gratuita · Med Escolha
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
            Compare duas especialidades médicas
          </h1>
          <p style={{ fontSize: 16, color: '#bfdbfe', maxWidth: 520, margin: '0 auto' }}>
            Salário estimado, tempo de residência, saturação do mercado e crescimento projetado — dados reais do DMB 2025.
          </p>
        </div>
      </div>

      {/* Comparador */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 32 }}>
          <ComparadorClient specialties={specialties} />
        </div>
      </div>

      {/* Footer mínimo */}
      <div style={{ textAlign: 'center', padding: '24px 24px 40px', color: '#94a3b8', fontSize: 13 }}>
        Dados: DMB 2025 · FMUSP/AMB &nbsp;·&nbsp;{' '}
        <a href="/" style={{ color: '#60a5fa', textDecoration: 'none' }}>Med Escolha 2.0</a>
      </div>
    </div>
  )
}
