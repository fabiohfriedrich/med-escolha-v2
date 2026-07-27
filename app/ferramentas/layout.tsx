import NavBarPublica from '@/components/NavBarPublica'

export default function FerramentasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBarPublica />
      {children}
    </>
  )
}
