import NavBarPublica from '@/components/NavBarPublica'

export default function GuiasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBarPublica />
      {children}
    </>
  )
}
