'use client'

import { useEffect, useState } from 'react'
import { Poppins } from 'next/font/google'
import posthog from 'posthog-js'
import landing from './MedEscolhaLanding.module.css'
import styles from './OfertaPsicologo.module.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const CHECKOUT_URL = 'https://pay.hotmart.com/R93740613A?bid=1787871097949'
const VALOR = 347
const MOEDA = 'BRL'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

function trackCheckoutIntent(origem: string) {
  posthog.capture('oferta_psicologo_cta_clicado', { origem, valor: VALOR, moeda: MOEDA })
  window.fbq?.('track', 'InitiateCheckout', { content_name: 'psicologo-pos-teste', currency: MOEDA, value: VALOR })
  window.gtag?.('event', 'begin_checkout', { currency: MOEDA, value: VALOR })
}

export default function OfertaPsicologoPage() {
  const [stickyVisible, setStickyVisible] = useState(false)

  useEffect(() => {
    posthog.capture('oferta_psicologo_visualizada')
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setStickyVisible(y > 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`${poppins.className} ${landing.landingRoot} ${stickyVisible ? landing.stickyActivePad : ''}`}>
      <div className={styles.miniHeader}>
        <img src="/med-escolha-logo.svg" alt="Med Escolha" />
      </div>

      {/* ============ HERO + VÍDEO ============ */}
      <section className={landing.sectionNavy} style={{ paddingTop: 24 }}>
        <div className={landing.container}>
          <div className={landing.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.confirmBadge}>✓ compra do med escolha confirmada</span>
            <h2 style={{ color: 'var(--white)' }}>
              seu resultado vai te dizer <span style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(244, 209, 78, 0.5) 60%)', padding: '0 6px' }}>o quê</span>.
              <br />
              uma conversa te ajuda a entender <span style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(244, 209, 78, 0.5) 60%)', padding: '0 6px' }}>o porquê</span>.
            </h2>
            <p className={landing.lead}>
              antes de fazer o teste, conheça o acompanhamento com Eduardo Braune, psicólogo especializado em orientação de carreira médica, feito especialmente pra interpretar o seu resultado assim que ele sair.
            </p>
          </div>

          <div className={styles.videoWrap}>
            <video
              src="/videos/oferta-psicologo.mp4"
              poster="/videos/oferta-psicologo-poster.jpg"
              controls
              playsInline
              preload="metadata"
            />
          </div>
          <p className={styles.videoCaption}>
            <strong>Eduardo Braune</strong> · psicólogo, especialista em orientação de carreira
          </p>
        </div>
      </section>

      {/* ============ POR QUE UMA CONVERSA MUDA TUDO ============ */}
      <section className={landing.sectionOffwhite}>
        <div className={landing.container}>
          <div className={landing.textCenter} style={{ marginBottom: 32 }}>
            <span className={landing.eyebrow}>por que isso importa</span>
            <h2>um mapa mostra o caminho. <span className={landing.highlightUnderline}>não decide por você</span></h2>
          </div>

          <div className={landing.mechanismGrid}>
            <div className={landing.mechanismCard}>
              <div className={landing.mechanismCardHead}>
                <div className={landing.mechanismIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </div>
              </div>
              <h3>o resultado mostra padrões, não decide por você</h3>
              <p>é comum abrir o resultado, ver uma porcentagem, e ficar com mais dúvida do que tinha antes. isso é normal, e é exatamente aí que entra a conversa.</p>
            </div>

            <div className={landing.mechanismCard}>
              <div className={landing.mechanismCardHead}>
                <div className={landing.mechanismIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                </div>
              </div>
              <h3>uma conversa enxerga o que o teste não vê</h3>
              <p>sua rotina na faculdade, o que te energiza, o que te esgota. isso não aparece em nenhum número, mas muda completamente como você lê o seu top 3.</p>
            </div>

            <div className={landing.mechanismCard}>
              <div className={landing.mechanismCardHead}>
                <div className={landing.mechanismIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z" />
                  </svg>
                </div>
              </div>
              <h3>mais de 15 anos em orientação de carreira</h3>
              <p>Eduardo Braune trabalha junto com o Med Escolha ajudando médicos a entenderem de verdade o que o resultado significa pra decisão deles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ O QUE VOCÊ RECEBE ============ */}
      <section>
        <div className={landing.container}>
          <div className={landing.textCenter} style={{ marginBottom: 32 }}>
            <span className={landing.eyebrow}>o que você recebe</span>
            <h2>2 sessões individuais, <span className={landing.highlightUnderline}>feitas em cima do seu resultado</span></h2>
          </div>

          <div className={styles.checklistCard}>
            <div className={styles.checklistItem}>
              <span className={styles.checklistCheck}>✓</span>
              <div className={styles.checklistText}>
                <strong>2 sessões individuais de 45 minutos, 100% online</strong>
                <span>direto com o Eduardo, sem turma, sem grupo.</span>
              </div>
            </div>
            <div className={styles.checklistItem}>
              <span className={styles.checklistCheck}>✓</span>
              <div className={styles.checklistText}>
                <strong>sessão 1 · perfil de personalidade e temperamento</strong>
                <span>o que desses resultados é realmente você, e o que talvez seja só uma tendência que você desenvolveu com o tempo.</span>
              </div>
            </div>
            <div className={styles.checklistItem}>
              <span className={styles.checklistCheck}>✓</span>
              <div className={styles.checklistText}>
                <strong>sessão 2 · mergulho nas especialidades do seu top 3</strong>
                <span>não pra validar um número, mas pra testar se você se imagina de verdade no dia a dia de cada uma.</span>
              </div>
            </div>
            <div className={styles.checklistItem}>
              <span className={styles.checklistCheck}>✓</span>
              <div className={styles.checklistText}>
                <strong>conversa feita em cima do seu resultado</strong>
                <span>assim que ele sair, não é um roteiro genérico igual pra todo mundo.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ OFERTA ============ */}
      <section className={landing.sectionTeal}>
        <div className={landing.container}>
          <div className={landing.textCenter} style={{ marginBottom: 32 }}>
            <span className={landing.eyebrow} style={{ background: 'rgba(14,31,77,0.18)', color: 'var(--white)' }}>a oferta</span>
            <h2 style={{ color: 'var(--white)' }}>vagas limitadas, atendimento individual</h2>
          </div>

          <div className={landing.priceCard}>
            <div className={landing.priceCardStrikes}>
              <div className={landing.strikeRow}>
                <span className={landing.strikeX}>✕</span>
                <div className={landing.strikeContent}>
                  <div className={landing.strikeAmount}>R$ 700</div>
                  <div className={landing.strikeLabel}>valor normal das 2 sessões (R$350 cada, avulsas)</div>
                </div>
              </div>
            </div>

            <div className={landing.priceCardHero}>
              <div className={landing.heroEyebrow}>só por ter comprado o med escolha, você garante as duas por</div>
              <div className={landing.heroAmount}>R$ 347</div>
              <div className={landing.heroMeta}>menos da metade do valor cheio</div>
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${landing.btn} ${landing.btnLarge} ${landing.btnUppercase} ${landing.priceCta}`}
                onClick={() => trackCheckoutIntent('oferta')}
              >
                quero minha sessão com o eduardo
              </a>
            </div>
          </div>

          <p className={styles.reassurance} style={{ color: 'rgba(255,255,255,0.75)' }}>
            sem obrigação: você recebe o acesso ao Med Escolha por e-mail do mesmo jeito, com ou sem essa sessão.
          </p>
        </div>
      </section>

      {/* ============ AUTORIA ============ */}
      <section className={landing.sectionOffwhite}>
        <div className={landing.container}>
          <div className={styles.authorSimple}>
            <div className={styles.authorAvatar}>EB</div>
            <div className={styles.authorName}>Eduardo Braune</div>
            <div className={styles.authorRole}>psicólogo · especialista em orientação de carreira médica</div>
          </div>
        </div>
      </section>

      {/* ============ STICKY CTA ============ */}
      <div className={`${landing.stickyCta} ${stickyVisible ? landing.stickyCtaVisible : ''}`}>
        <div className={landing.stickyCtaInner}>
          <div className={landing.stickyCtaInfo}>
            <span className={landing.stickyProduct}>sessões com o Eduardo Braune</span>
            <span className={landing.stickyPrice}>de R$700 por R$347</span>
          </div>
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${landing.btn} ${landing.stickyCtaBtn} ${landing.btnUppercase}`}
            onClick={() => trackCheckoutIntent('sticky')}
          >
            quero minha sessão
          </a>
        </div>
      </div>
    </div>
  )
}
