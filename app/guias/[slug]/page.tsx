import { notFound } from 'next/navigation'
import guiasData from '@/data/guias_especialidades.json'
import GuiaDetalhe from '@/components/GuiaDetalhe'

const especialidades = (guiasData as any).especialidades as any[]

export async function generateStaticParams() {
  return especialidades.map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = especialidades.find(x => x.slug === slug)
  if (!e) return {}
  return {
    title: `${e.nome} — Guia Completo | Med Escolha`,
    description: `${e.resumo} Mercado, remuneração, residência e perfil ideal para ${e.nome}.`,
  }
}

export default async function GuiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const especialidade = especialidades.find(e => e.slug === slug)
  if (!especialidade) return notFound()

  const relacionadasData = (especialidade.relacionadas as string[])
    .map((s: string) => especialidades.find(e => e.slug === s))
    .filter(Boolean)
    .map((e: any) => ({ slug: e.slug, nome: e.nome, icon: e.icon, salario_faixa: e.salario_faixa }))

  return <GuiaDetalhe especialidade={especialidade} relacionadasData={relacionadasData} />
}
