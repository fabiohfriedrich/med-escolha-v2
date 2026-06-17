import NavBarPublica from '@/components/NavBarPublica'

export default function EbooksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBarPublica />
      {children}
    </>
  )
}
