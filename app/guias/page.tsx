import guiasData from '@/data/guias_especialidades.json'
import GuiasGrid from '@/components/GuiasGrid'

export const metadata = {
  title: 'Guias de Especialidades Médicas | Med Escolha',
  description: 'As 20 especialidades médicas mais buscadas do Brasil. Mercado, remuneração, residência e perfil ideal — tudo em um lugar.',
}

export default function GuiasPage() {
  const especialidades = (guiasData as any).especialidades
  return <GuiasGrid especialidades={especialidades} />
}
