import NavBarPublica from '@/components/NavBarPublica'

export default function QuizRapidoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBarPublica />
      {children}
    </>
  )
}
