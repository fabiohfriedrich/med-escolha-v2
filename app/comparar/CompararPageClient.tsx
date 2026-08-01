'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Poppins } from 'next/font/google'
import posthog from 'posthog-js'
import styles from '@/components/MedEscolhaLanding.module.css'
import LandingHeader, { type LandingNavLink } from '@/components/LandingHeader'
import ComparadorClient from './ComparadorClient'
import { capturarRefDaUrl, comCodigoIndicacao } from '@/lib/referral'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const HOTMART_URL = 'https://pay.hotmart.com/Y86347681C?off=y014gd40&checkoutMode=10&bid=1781225502432'

const NAV_LINKS: LandingNavLink[] = [
  { href: '/#como-funciona', label: 'como funciona' },
  { href: '/#depoimentos', label: 'depoimentos' },
  { href: '/#garantia', label: 'garantia' },
  { href: '/#faq', label: 'perguntas frequentes' },
]

function track(origem: string) {
  posthog.capture('compra_iniciada', { origem })
}

type Specialty = { id: number; nome: string; categoria?: string }

export default function CompararPageClient({ specialties }: { specialties: Specialty[] }) {
  const { isLoaded, isSignedIn } = useUser()
  const [checkoutUrl, setCheckoutUrl] = useState(HOTMART_URL)

  useEffect(() => {
    capturarRefDaUrl()
    setCheckoutUrl(comCodigoIndicacao(HOTMART_URL))
  }, [])

  return (
    <div className={`${poppins.className} ${styles.landingRoot}`}>
      {isLoaded && !isSignedIn && (
        <LandingHeader checkoutUrl={checkoutUrl} onCtaClick={() => track('comparar_header')} navLinks={NAV_LINKS} />
      )}

      {/* ============ HERO ============ */}
      <section className={styles.sectionNavy}>
        <div className={styles.containerNarrow} style={{ textAlign: 'center' }}>
          <span className={styles.eyebrow}>ferramenta gratuita · med escolha</span>
          <h1>compare duas especialidades médicas</h1>
          <p className={styles.lead}>
            salário estimado, tempo de residência, saturação do mercado e crescimento projetado, dados reais do DMB 2025.
          </p>
        </div>
      </section>

      {/* ============ COMPARADOR ============ */}
      <div className={styles.container} style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            background: 'var(--white)',
            borderRadius: 20,
            border: '1px solid var(--border)',
            padding: 32,
          }}
        >
          <ComparadorClient specialties={specialties} />
        </div>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className={styles.siteFooter}>
        <div className={styles.container}>
          <img src="/med-escolha-logo-dark.svg" alt="Med Escolha" />
          <p>med escolha 2.0, por amo medicina.</p>
          <p>dados: DMB 2025 · FMUSP/AMB</p>
          <div className={styles.siteFooterLinks}>
            <Link href="/">med escolha 2.0</Link>
            <span>·</span>
            <Link href="/privacidade">política de privacidade</Link>
            <span>·</span>
            <Link href="/termos">termos de uso</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
