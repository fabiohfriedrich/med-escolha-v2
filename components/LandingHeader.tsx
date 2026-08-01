'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import styles from './MedEscolhaLanding.module.css'

const NAV_LINKS = [
  { href: '#como-funciona', label: 'como funciona' },
  { href: '#depoimentos', label: 'depoimentos' },
  { href: '#garantia', label: 'garantia' },
  { href: '#faq', label: 'perguntas frequentes' },
]

type LandingHeaderProps = {
  checkoutUrl: string
  onCtaClick: () => void
}

export default function LandingHeader({ checkoutUrl, onCtaClick }: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || document.documentElement.scrollTop) > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <header className={`${styles.siteHeader} ${scrolled ? styles.siteHeaderScrolled : ''}`}>
      <div className={`${styles.container} ${styles.siteHeaderInner}`}>
        <a href="#" className={styles.siteHeaderLogo}>
          <img src="/med-escolha-logo.svg" alt="Med Escolha" />
        </a>

        <nav className={styles.siteHeaderNav}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.siteHeaderLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.siteHeaderActions}>
          <a href="/login" className={styles.siteHeaderLoginLink}>
            já tem acesso? entrar
          </a>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.siteHeaderCta}
            onClick={onCtaClick}
          >
            fazer o teste
          </a>
        </div>

        <button
          type="button"
          className={styles.siteHeaderBurger}
          aria-label={drawerOpen ? 'fechar menu' : 'abrir menu'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          {drawerOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className={styles.mobileDrawer}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <nav className={styles.mobileDrawerNav}>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={closeDrawer} className={styles.mobileDrawerLink}>
                  {link.label}
                </a>
              ))}
              <a href="/login" onClick={closeDrawer} className={styles.mobileDrawerLoginLink}>
                já tem acesso? entrar
              </a>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileDrawerCta}
                onClick={() => {
                  onCtaClick()
                  closeDrawer()
                }}
              >
                fazer o teste
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
