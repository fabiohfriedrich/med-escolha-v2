import type { Metadata } from 'next'
import OfertaPsicologoPage from '@/components/OfertaPsicologoPage'

export const metadata: Metadata = {
  title: 'Sessões com Eduardo Braune | Med Escolha',
  description: 'Interprete seu resultado do Med Escolha com quem entende de orientação de carreira médica. 2 sessões individuais, online.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <OfertaPsicologoPage />
}
