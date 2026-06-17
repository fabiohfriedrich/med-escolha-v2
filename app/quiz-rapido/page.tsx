import QuizRapido from '@/components/QuizRapido'

export const metadata = {
  title: 'Quiz de Especialidade Médica | Med Escolha',
  description: 'Descubra qual especialidade médica combina com seu perfil. 10 perguntas, resultado personalizado com as melhores especialidades para você.',
}

export default function QuizRapidoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', paddingTop: 24 }}>
      <QuizRapido />
    </div>
  )
}
