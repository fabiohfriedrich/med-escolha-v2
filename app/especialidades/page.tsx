import { supabase } from '@/lib/supabase'
import descriptionsData from '@/data/descriptions.json'
import dmbData from '@/data/dmb_data.json'
import EspecialidadesLibrary from '@/components/EspecialidadesLibrary'

export const metadata = {
  title: 'Especialidades Médicas | Med Escolha',
  description: '55 especialidades reconhecidas pelo CFM com dados do DMB 2025. Descrições, rotinas, mercado e muito mais.',
}

export default async function EspecialidadesPage() {
  // Fetch DMB stats from Supabase
  const { data: supaEsp } = await supabase
    .from('especialidades')
    .select('id, especialistas, por_100k_hab, pct_mulheres, media_idade, pct_capital, pct_sudeste')

  const supaMap: Record<number, any> = {}
  for (const row of supaEsp || []) supaMap[row.id] = row

  const descriptions = (descriptionsData as any).specialties as Array<{
    id: number; nome: string; descricao: string; rotina_tipica: string
  }>
  const dmb = (dmbData as any).specialties as Array<{
    id: number; salario_min: number; salario_max: number; anos_formacao: number
    saturacao: string; crescimento_projetado: string; medicos_ativos: number
  }>

  const dmbMap: Record<number, any> = {}
  for (const d of dmb) dmbMap[d.id] = d

  const especialidades = descriptions.map(d => ({
    id: d.id,
    nome: d.nome,
    descricao: d.descricao,
    rotina_tipica: d.rotina_tipica,
    especialistas: supaMap[d.id]?.especialistas ?? null,
    por_100k_hab: supaMap[d.id]?.por_100k_hab ?? null,
    pct_mulheres: supaMap[d.id]?.pct_mulheres ?? null,
    media_idade: supaMap[d.id]?.media_idade ?? null,
    pct_capital: supaMap[d.id]?.pct_capital ?? null,
    pct_sudeste: supaMap[d.id]?.pct_sudeste ?? null,
    salario_min: dmbMap[d.id]?.salario_min,
    salario_max: dmbMap[d.id]?.salario_max,
    anos_formacao: dmbMap[d.id]?.anos_formacao,
    saturacao: dmbMap[d.id]?.saturacao,
    crescimento: dmbMap[d.id]?.crescimento_projetado,
  }))

  return <EspecialidadesLibrary especialidades={especialidades} />
}
