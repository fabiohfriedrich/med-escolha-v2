import descriptionsData from '@/data/descriptions.json'
import dmbData from '@/data/dmb_data.json'
import CompararPageClient from './CompararPageClient'

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

  return <CompararPageClient specialties={specialties} />
}
