'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Poppins } from 'next/font/google'
import posthog from 'posthog-js'
import styles from './MedEscolhaLanding.module.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const HOTMART_URL = 'https://pay.hotmart.com/Y86347681C?off=y014gd40&checkoutMode=10&bid=1781225502432'

function track(origem: string) {
  posthog.capture('compra_iniciada', { origem })
}

export default function MedEscolhaLandingPage() {
  const [stickyVisible, setStickyVisible] = useState(false)

  useEffect(() => {
    const showAfter = 700
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setStickyVisible(y > showAfter)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`${poppins.className} ${styles.landingRoot} ${stickyVisible ? styles.stickyActivePad : ''}`}>

      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroTextTop}>
              <span className={`${styles.eyebrow} ${styles.eyebrowCompact}`}>para estudantes e médicos recém-formados</span>
              <h1>o <span className={styles.highlightTeal}>match</span> da especialidade médica, <span className={styles.highlightTeal}>sem achismos.</span></h1>
              <p className={styles.lead}>o <strong>match da especialidade médica</strong> cruza suas respostas com as <strong>55 especialidades reconhecidas no Brasil</strong>, usando dados reais do <strong>DMB 2025</strong>. ranking + narrativa pra você fechar a decisão de vez.</p>
            </div>
            <div className={styles.heroImageWrap}>
              <div className={styles.heroPhotoFrame}>
                <div className={styles.heroPhotoCards}>
                  <div className={styles.heroCardPill}>decisão definitiva</div>
                  <div className={styles.heroCardBadge}>
                    <div className={styles.badgeStat}>55</div>
                    <div className={styles.badgeText}>especialidades cruzadas com seu perfil</div>
                  </div>
                </div>
                <div className={styles.heroPhotoImg}>
                  <img src="/landing/hero-medica.png" alt="Médica jovem sorrindo, jaleco branco e tablet" />
                </div>
              </div>
            </div>
            <div className={styles.heroTextBottom}>
              <ul className={styles.heroPills}>
                <li>95 perguntas</li>
                <li>55 especialidades</li>
                <li>+ acervo 50 lives</li>
                <li>+ curso de IA na medicina</li>
                <li>7 dias garantia</li>
              </ul>
              <div className={styles.ctaBlock} style={{ textAlign: 'left' }}>
                <a href="#checkout" className={`${styles.btn} ${styles.btnUppercase} ${styles.btnHeroCta}`} onClick={() => track('hero')}>definir minha especialidade</a>
                <p className={styles.ctaFriction} style={{ marginTop: 12 }}>
                  já tem acesso?{' '}
                  <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 700, textDecoration: 'underline' }}>entrar</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className={styles.trustStripSection}>
        <div className={styles.container}>
          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✓</span>
              <div className={styles.trustCopy}>
                <strong>95 perguntas</strong>
                <span>em 6 eixos do seu perfil</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✓</span>
              <div className={styles.trustCopy}>
                <strong>55 especialidades</strong>
                <span>reconhecidas no Brasil</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✓</span>
              <div className={styles.trustCopy}>
                <strong>ranking + narrativa</strong>
                <span>do porquê de cada match</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✓</span>
              <div className={styles.trustCopy}>
                <strong>dados do DMB 2025</strong>
                <span>mercado, salário e saturação</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✓</span>
              <div className={styles.trustCopy}>
                <strong>7 dias</strong>
                <span>garantia incondicional</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✓</span>
              <div className={styles.trustCopy}>
                <strong>salvo na área de membro</strong>
                <span>refaça o teste quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM ============ */}
      <section className={styles.sectionOffwhite}>
        <div className={styles.container}>
          <div className={styles.problemHero}>
            <div className={styles.problemPhoto}>
              <img src="/landing/problem-student.png" alt="Estudante de medicina estudando à noite, pensativa" />
            </div>
            <div className={styles.problemIntro}>
              <span className={styles.eyebrow}>a sua realidade hoje</span>
              <h2>essa <span className={styles.highlightUnderline}>provavelmente</span> é a sua realidade hoje:</h2>
              <p className={styles.lead}>você não tá perdido. só tá usando ferramentas que não foram feitas pra essa decisão.</p>
            </div>
          </div>
        </div>
        <div className={styles.containerNarrow} style={{ marginTop: 48 }}>

          <div className={styles.problemStep} style={{ borderBottomColor: 'var(--border)' }}>
            <span className={styles.stepEyebrow} style={{ color: 'var(--teal)' }}>a dor visível</span>
            <h3>todo mundo parece saber, menos você.</h3>
            <p>você termina mais um plantão exausto, abre o instagram, vê um colega comentando que vai pra cirurgia plástica, outro pra radiologia, e a sensação volta.</p>
            <p>já tentou listar prós e contras numa folha. já conversou com professor, com R3, com tio médico. já fez quiz na internet (e o resultado deu três especialidades completamente opostas). nenhuma das tentativas fechou.</p>
          </div>

          <div className={styles.problemStep} style={{ borderBottomColor: 'var(--border)' }}>
            <span className={styles.stepEyebrow} style={{ color: 'var(--teal)' }}>o custo invisível</span>
            <h3>cada semestre de indecisão tem um custo que ninguém te conta.</h3>
            <p>o R3 que você vai começar 1 ano depois. a residência que você vai escolher por exclusão (porque &quot;a inscrição fechou amanhã&quot;). a vaga em hospital top que vai pra quem decidiu antes.</p>
            <p>e tem o custo emocional, o que dói mais: a pressão da família, o medo de chegar no quinto ano sem rumo, o silêncio nas reuniões quando perguntam &quot;e aí, vai ser o quê?&quot;.</p>
          </div>

          <div className={styles.problemStep} style={{ borderBottomColor: 'var(--border)' }}>
            <span className={styles.stepEyebrow} style={{ color: 'var(--teal)' }}>a consequência projetada</span>
            <h3>30 anos.</h3>
            <p>é mais ou menos isso que você vai passar dentro da especialidade que escolher agora. escolher errado significa rotina, plantão, jornada, pacientes, ambiente, salário e estilo de vida travados por uma decisão tomada com pressa, achismo e pressão dos outros.</p>
            <p><strong>a maioria dos médicos generalistas que você conhece não escolheu ser generalista. foi parando lá.</strong></p>
          </div>
        </div>
      </section>

      {/* ============ FAILED SOLUTIONS ============ */}
      <section className={styles.sectionNavy}>
        <div className={styles.container}>
          <div className={styles.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow}>o que você já tentou</span>
            <h2>e por que <span className={styles.highlightTeal}>não fechou</span></h2>
          </div>

          <div className={styles.failedGrid}>
            <div className={styles.failedCard}>
              <div className={styles.failedX}>✕</div>
              <div className={styles.failedIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M9 9h.01M9 13h.01M9 17h.01M13 9h2M13 13h2M13 17h2" />
                </svg>
              </div>
              <h3>quiz gratuito de internet</h3>
              <p>10 a 30 perguntas genéricas. resultado muda toda vez. cobre 5 a 10 áreas só.</p>
            </div>

            <div className={styles.failedCard}>
              <div className={styles.failedX}>✕</div>
              <div className={styles.failedIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  <path d="M9 10h.01M13 10h.01M17 10h.01" />
                </svg>
              </div>
              <h3>conversa com professor</h3>
              <p>você ouve a história dele, não a sua. o que serviu aos 50 dele não serve aos seus 24.</p>
            </div>

            <div className={styles.failedCard}>
              <div className={styles.failedX}>✕</div>
              <div className={styles.failedIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
                  <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12s4.5 10 10 10" />
                  <path d="M12 6v6l3 2" />
                  <path d="M16 22l4-4-4-4M16 18h6" />
                </svg>
              </div>
              <h3>decidir pela rotação que gostou</h3>
              <p>rotação dura 4 a 8 semanas. especialidade dura 30 anos. internato não é o cenário da carreira.</p>
            </div>

            <div className={styles.failedCard}>
              <div className={styles.failedX}>✕</div>
              <div className={styles.failedIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              </div>
              <h3>esperar &quot;bater o estalo&quot;</h3>
              <p>estalo é viés de confirmação. bate pela última vivência que te marcou, não pela compatibilidade real.</p>
            </div>
          </div>

          <div className={styles.winnerCard}>
            <div className={styles.winnerBadge}>✓ a alternativa que fecha</div>
            <div className={styles.winnerGrid}>
              <div className={styles.winnerIconWrap}>
                <div className={styles.winnerIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className={styles.winnerContent}>
                <span className={styles.winnerEyebrow}>med escolha 2.0</span>
                <h3>o match da especialidade médica.</h3>
                <p>95 perguntas em 6 eixos cruzadas com as <strong>55 especialidades reconhecidas no Brasil</strong>, enriquecidas com dados reais do <strong>DMB 2025</strong>. ranking ordenado + narrativa do porquê de cada match.</p>
                <ul className={styles.winnerPoints}>
                  <li>cobre o universo inteiro de especialidades, não só as 5 ou 10 mais óbvias</li>
                  <li>narrativa explica POR QUE cada especialidade combina com você</li>
                  <li>explore as 55 especialidades dentro da própria plataforma, com rotina, mercado e salário</li>
                  <li>resultado salvo na sua área de membro, refaça o teste quando quiser</li>
                  <li>você sai com decisão fechada, não com nova confusão</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MECHANISM ============ */}
      <section className={styles.sectionOffwhite}>
        <div className={styles.container}>
          <div className={styles.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow}>como funciona</span>
            <h2>como o <span className={styles.highlightUnderline}>match da especialidade médica</span> funciona</h2>
            <p className={styles.lead}>a maioria dos &quot;testes vocacionais&quot; online tem 10 a 30 perguntas e cruza com 5 a 10 carreiras. resultado: você fecha a página igual confuso. o match do med escolha foi desenhado pra fazer o oposto.</p>
          </div>

          <div className={styles.mechanismGrid}>
            <div className={styles.mechanismCard}>
              <div className={styles.mechanismCardHead}>
                <div className={styles.stepNum}>1</div>
                <div className={styles.mechanismIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M8 7h8M8 11h8M8 15h5" />
                  </svg>
                </div>
              </div>
              <h3>95 perguntas em 6 eixos</h3>
              <ul className={styles.axisList}>
                <li>aptidão técnica</li>
                <li>perfil emocional</li>
                <li>estilo de vida</li>
                <li>tolerância a plantão</li>
                <li>motivação financeira</li>
                <li>ambição acadêmica</li>
              </ul>
            </div>

            <div className={styles.mechanismCard}>
              <div className={styles.mechanismCardHead}>
                <div className={styles.stepNum}>2</div>
                <div className={styles.mechanismIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <h3>cruzamento com as 55 especialidades</h3>
              <p>sua resposta é cruzada com uma base que mapeia rotina, perfil, requisitos e tendências de carreira de cada área, enriquecida com dados reais do DMB 2025 (Demografia Médica no Brasil).</p>
              <div className={styles.mechanismCallout}>→ as 55 reconhecidas no Brasil, da clínica geral à neurocirurgia</div>
            </div>

            <div className={styles.mechanismCard}>
              <div className={styles.mechanismCardHead}>
                <div className={styles.stepNum}>3</div>
                <div className={styles.mechanismIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h12M3 12h9M3 18h6" />
                    <path d="M17 18l3 3 4-5" transform="translate(-1, -3)" />
                  </svg>
                </div>
              </div>
              <h3>ranking + narrativa do porquê</h3>
              <p>você não recebe &quot;tenta cirurgia&quot;. recebe um ranking ordenado <strong>com narrativa explicando porque cada match bateu com seu perfil</strong>, salvo na sua conta pra você rever quando quiser.</p>
              <div className={styles.mechanismCallout}>→ a parte que muda decisão</div>
            </div>
          </div>

          <div className={styles.resultPreviewWrap}>
            <div className={styles.resultPreviewIntro}>
              <span className={styles.eyebrow} style={{ background: 'rgba(244, 209, 78, 0.2)', color: 'var(--navy)' }}>exemplo de resultado</span>
              <h3>é exatamente isso que chega no seu painel:</h3>
              <p>seu ranking ordenado das 55 especialidades, com narrativa pra cada match no top. exemplo ilustrativo abaixo.</p>
            </div>

            <div className={styles.resultMockup}>
              <div className={styles.resultMockupHeader}>
                <div className={styles.mockupTitle}>
                  <span className={styles.mockupLabel}>seu match com as 55 especialidades</span>
                  <span className={styles.mockupDate}>resultado, 9 de maio</span>
                </div>
                <div className={styles.mockupPill}>top 3</div>
              </div>

              <div className={`${styles.resultRow} ${styles.resultRowTop}`}>
                <div className={styles.resultRank}>01</div>
                <div className={styles.resultInfo}>
                  <div className={styles.resultName}>anestesiologia</div>
                  <div className={styles.resultBar}><div className={styles.resultFill} style={{ width: '89%' }} /></div>
                </div>
                <div className={styles.resultPct}>89%</div>
              </div>

              <div className={styles.resultRow}>
                <div className={styles.resultRank}>02</div>
                <div className={styles.resultInfo}>
                  <div className={styles.resultName}>medicina de família</div>
                  <div className={styles.resultBar}><div className={styles.resultFill} style={{ width: '82%' }} /></div>
                </div>
                <div className={styles.resultPct}>82%</div>
              </div>

              <div className={styles.resultRow}>
                <div className={styles.resultRank}>03</div>
                <div className={styles.resultInfo}>
                  <div className={styles.resultName}>cirurgia geral</div>
                  <div className={styles.resultBar}><div className={styles.resultFill} style={{ width: '76%' }} /></div>
                </div>
                <div className={styles.resultPct}>76%</div>
              </div>

              <div className={styles.resultNarrative}>
                <strong>+ narrativa do porquê de cada match:</strong>
                &quot;anestesiologia apareceu no topo do seu ranking porque seu perfil mostra alta tolerância a procedimento, raciocínio rápido sob pressão e preferência por rotina previsível, padrão típico das R3 dessa área...&quot;
                <em>(continua no seu painel, 1 narrativa por especialidade do top 3)</em>
              </div>
            </div>
          </div>

          <div className={`${styles.ctaBlock} ${styles.mt5}`}>
            <a href="#checkout" className={`${styles.btn} ${styles.btnLarge} ${styles.btnUppercase}`} onClick={() => track('mecanismo')}>quero fazer o match, R$ 149</a>
          </div>
        </div>
      </section>

      {/* ============ PULLED QUOTE ============ */}
      <section className={styles.pulledQuoteSection}>
        <blockquote className={styles.pulledQuote}>
          <span className={styles.quoteMark}>&quot;</span>
          <p className={styles.quoteText}>o relatório me permitiu entender minhas aptidões, meu temperamento e meu perfil profissional. recebi uma lista completa das especialidades dentro da minha aptidão, com um <span className={styles.quoteEmphasis}>top 3 que bateu com o que penso em seguir</span>.</p>
          <footer className={styles.quoteAttribution}>
            <strong>João Vitor Carvalho</strong>
            <span>médico, formado pela universidade federal do amazonas</span>
          </footer>
        </blockquote>
      </section>

      {/* ============ BENEFITS ============ */}
      <section>
        <div className={styles.container}>
          <div className={styles.benefitsHero}>
            <div className={styles.benefitsHeroPhoto}>
              <img src="/landing/benefits-doctor.png" alt="Médica jovem confiante em corredor de hospital" />
            </div>
            <div className={styles.benefitsHeroContent}>
              <span className={styles.eyebrow}>o impacto na prática</span>
              <h2>o que cada parte do match <span className={styles.highlightUnderline}>resolve por você</span></h2>
              <p className={styles.lead}>cada elemento do programa foi desenhado pra atacar uma fricção específica da sua decisão. veja o que muda no <strong>funcional, no bolso e na cabeça</strong>.</p>
            </div>
          </div>

          <div className={styles.benefitsGrid}>
            <div className={styles.benefitRow}>
              <div className={styles.benefitIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></svg></div>
              <div className={`${styles.benefitCell} ${styles.benefitFeature}`}><span className={styles.cellLabel}>o que é</span>match com 95 perguntas em 6 eixos</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>funcional</span>mapeia compatibilidade real entre seu perfil e cada uma das 55 especialidades</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>financeiro</span>você não desperdiça os R$ 50.000+ de uma residência errada</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>emocional</span>para de sentir que jogou 6 anos numa escolha aleatória</div>
            </div>
            <div className={styles.benefitRow}>
              <div className={styles.benefitIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg></div>
              <div className={`${styles.benefitCell} ${styles.benefitFeature}`}><span className={styles.cellLabel}>o que é</span>cobertura das 55 especialidades, com dados do DMB 2025</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>funcional</span>especialidades menos óbvias entram no seu radar, com rotina, mercado, salário e saturação</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>financeiro</span>chance maior de descobrir nichos com menor competição e melhor remuneração-por-esforço</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>emocional</span>para de se sentir limitado às 5 ou 6 áreas famosas</div>
            </div>
            <div className={styles.benefitRow}>
              <div className={styles.benefitIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3V9z" fill="currentColor" /></svg></div>
              <div className={`${styles.benefitCell} ${styles.benefitFeature}`}><span className={styles.cellLabel}>o que é</span>bônus: acervo com 50+ lives de especialistas</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>funcional</span>você assiste no seu ritmo o que cada especialidade é de verdade no dia a dia</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>financeiro</span>50+ horas de mentoria que custariam R$ 15 mil em sessões individuais</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>emocional</span>para de imaginar e começa a ver a rotina de quem já está nela</div>
            </div>
            <div className={styles.benefitRow}>
              <div className={styles.benefitIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
              <div className={`${styles.benefitCell} ${styles.benefitFeature}`}><span className={styles.cellLabel}>o que é</span>conta na plataforma com histórico salvo</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>funcional</span>refaça o teste quando quiser e compare sua evolução ao longo da formação</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>financeiro</span>incluso no acesso vitalício, sem pagar de novo pra reavaliar</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>emocional</span>a decisão não trava no dia do resultado, evolui com você</div>
            </div>
            <div className={styles.benefitRow}>
              <div className={styles.benefitIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" /><path d="M7 9.5V15c0 1.1 2.24 3 5 3s5-1.9 5-3V9.5" /><path d="M21 7.5v6" /></svg></div>
              <div className={`${styles.benefitCell} ${styles.benefitFeature}`}><span className={styles.cellLabel}>o que é</span>bônus: curso IA na Medicina, da teoria à prática</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>funcional</span>12h em vídeo sobre IA aplicada à prática clínica, com templates de prompt prontos pra usar</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>financeiro</span>curso vendido a R$ 497 fora daqui, incluso sem custo extra</div>
              <div className={styles.benefitCell}><span className={styles.cellLabel}>emocional</span>sai na frente com uma ferramenta que já mudou como se pratica medicina</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className={styles.sectionOffwhite}>
        <div className={styles.container}>
          <div className={styles.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow}>depoimentos reais</span>
            <h2>quem já fechou a decisão pelo <span className={styles.highlightUnderline}>med escolha</span></h2>
          </div>

          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>&quot;faculdade inteira fiquei em dúvida entre 3 especializações. nunca achei algo que pudesse me mostrar tão fidedignamente o que se encaixaria melhor pra mim. o med escolha proporcionou isso na íntegra, com um teste minuciosamente feito. ele me trouxe tão fiel as 3 especialidades que eu sempre tive dúvida, e ainda mostrou qual delas mais combinava com meu perfil. sanou minha dúvida e fez eu bater o martelo. faria 1 milhão de vezes novamente.&quot;</div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}><img src="/landing/testimonial-vanessa.jpg" alt="Vanessa" /></div>
                <div className={styles.testimonialMeta}>
                  <div className={styles.name}>Vanessa</div>
                  <div className={styles.role}>médica, graduada há 2 anos</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>&quot;antes do med escolha eu não tinha a menor ideia do que queria cursar pra residência. sempre tive amor por pediatria e ginecologia obstetrícia, mas não conseguia me decidir. respondi o questionário e o resultado mostrou que minha prioridade deveria ser GO. dentro da pediatria também foram elencadas áreas que compensam o padrão de vida que desejo, como pediatria intensiva e urgência emergência. meu coração ficou mais em paz com meu futuro.&quot;</div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}><img src="/landing/testimonial-julia.jpg" alt="Júlia" /></div>
                <div className={styles.testimonialMeta}>
                  <div className={styles.name}>Júlia</div>
                  <div className={styles.role}>estudante de medicina, 5º período, Faculdade Pequeno Príncipe</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>&quot;o med escolha me ajudou a decidir qual especialidade vou seguir. score criterioso, com embasamento científico. o relatório me permitiu entender minhas aptidões, meu temperamento e meu perfil profissional. recebi uma lista completa das especialidades dentro da minha aptidão, com um top 3 que bateu com o que penso em seguir. realmente um ótimo investimento.&quot;</div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}><img src="/landing/testimonial-joao.jpg" alt="João Vitor Carvalho" /></div>
                <div className={styles.testimonialMeta}>
                  <div className={styles.name}>João Vitor Carvalho</div>
                  <div className={styles.role}>médico, formado pela UFAM</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>&quot;fui uma das primeiras a testar a plataforma. para chegar no resultado parece fácil, mas respondi tantas perguntas e a análise é tão profunda que é um negócio totalmente profissional, de outro nível. meu top 1 foi medicina física e reabilitação, com 80% e poucos de match, uma especialidade que eu nem pensava antes. eles dão todo um perfil da especialidade e o porquê de você ser compatível. diferenciado do que já tem no mercado.&quot;</div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}><img src="/landing/testimonial-camila.jpg" alt="Camila" /></div>
                <div className={styles.testimonialMeta}>
                  <div className={styles.name}>Camila</div>
                  <div className={styles.role}>estudante de medicina</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ OFFER STACK ============ */}
      <section id="checkout" className={styles.sectionNavy}>
        <div className={styles.container}>
          <div className={styles.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow}>a oferta</span>
            <h2>tudo o que você recebe<br />por <span className={styles.highlightTeal}>R$ 149.</span></h2>
          </div>

          <div className={styles.offerStack}>
            <h3>tudo o que você recebe hoje:</h3>
            <div className={styles.stackRow}>
              <div className={styles.stackIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className={styles.stackItem}>
                <strong>match da especialidade médica</strong>
                <ul className={styles.stackBullets}>
                  <li>95 perguntas em 6 eixos do seu perfil</li>
                  <li>cruzamento com as 55 especialidades reconhecidas no Brasil, com dados do DMB 2025</li>
                  <li>ranking ordenado + narrativa do porquê de cada match</li>
                  <li>resultado salvo na sua área de membro, refaça o teste quando quiser</li>
                </ul>
              </div>
              <div className={styles.stackValue}>R$ 497</div>
            </div>
            <div className={`${styles.stackRow} ${styles.stackRowBonus}`}>
              <div className={styles.stackIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
                </svg>
              </div>
              <div className={styles.stackItem}>
                <span className={styles.bonusTag}>bônus</span>
                <strong>acervo com 50+ lives de médicos especialistas</strong>
                <ul className={styles.stackBullets}>
                  <li>acesso vitalício a todas as gravações</li>
                  <li>lives novas entram no acervo automaticamente</li>
                  <li>especialistas das principais áreas médicas</li>
                </ul>
              </div>
              <div className={styles.stackValue}>R$ 750</div>
            </div>
            <div className={`${styles.stackRow} ${styles.stackRowBonus}`}>
              <div className={styles.stackIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                  <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
                  <path d="M7 9.5V15c0 1.1 2.24 3 5 3s5-1.9 5-3V9.5" />
                  <path d="M21 7.5v6" />
                </svg>
              </div>
              <div className={styles.stackItem}>
                <span className={styles.bonusTag}>bônus</span>
                <strong>curso IA na Medicina: da teoria à prática</strong>
                <ul className={styles.stackBullets}>
                  <li>12h em vídeo, acesso vitalício, direto ao ponto</li>
                  <li>templates de prompt prontos pra usar no dia a dia clínico</li>
                  <li>certificado emitido pela Hotmart + comunidade de alunos</li>
                </ul>
              </div>
              <div className={styles.stackValue}>R$ 497</div>
            </div>
            <div className={styles.stackTotal}>
              <div className={styles.totalLabel}>valor total real</div>
              <div className={styles.totalStrike}>R$ 1.744</div>
              <div className={styles.totalLabel} style={{ color: 'var(--teal)', marginTop: 12 }}>você paga hoje</div>
              <div className={styles.totalNow}>R$ 149<small> à vista</small></div>
              <div className={styles.totalInstallments}>ou em até 12x de R$ 14,90 no cartão</div>
            </div>
            <div className={`${styles.ctaBlock} ${styles.mt3}`}>
              <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnLarge} ${styles.btnUppercase}`} onClick={() => track('oferta')}>quero garantir meu acesso, R$ 149</a>
              <p className={styles.ctaFriction} style={{ color: 'var(--text-soft)' }}>compra 100% protegida. 7 dias de garantia. acesso imediato.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICE CONTRAST ============ */}
      <section className={styles.sectionTeal}>
        <div className={styles.container}>
          <div className={styles.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow} style={{ background: 'rgba(14,31,77,0.18)', color: 'var(--white)' }}>o preço</span>
            <h2 style={{ color: 'var(--white)' }}>quanto custa fechar a decisão da sua <span style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(244, 209, 78, 0.5) 60%)', padding: '0 6px' }}>especialidade</span></h2>
          </div>

          <div className={styles.priceCard}>
            <div className={styles.priceCardStrikes}>
              <div className={styles.strikeRow}>
                <span className={styles.strikeX}>✕</span>
                <div className={styles.strikeContent}>
                  <div className={styles.strikeAmount}>R$ 2.000+</div>
                  <div className={styles.strikeLabel}>uma mentoria 1:1 com profissional médico</div>
                </div>
              </div>
              <div className={styles.strikeRow}>
                <span className={styles.strikeX}>✕</span>
                <div className={styles.strikeContent}>
                  <div className={styles.strikeAmount}>R$ 5.000+</div>
                  <div className={styles.strikeLabel}>um curso completo de residência</div>
                </div>
              </div>
              <div className={styles.strikeRow}>
                <span className={styles.strikeX}>✕</span>
                <div className={styles.strikeContent}>
                  <div className={styles.strikeAmount}>R$ 250+</div>
                  <div className={styles.strikeLabel}>a taxa da próxima prova de residência</div>
                </div>
              </div>
            </div>

            <div className={styles.priceCardHero}>
              <div className={styles.heroEyebrow}>você paga apenas</div>
              <div className={styles.heroAmount}>R$ 149</div>
              <div className={styles.heroMeta}>à vista, ou 12x de R$ 14,90 no cartão</div>
              <p className={styles.heroAside}>menos do que você gastou comendo no hospital essa semana.</p>
              <a href="#checkout" className={`${styles.btn} ${styles.btnLarge} ${styles.btnUppercase} ${styles.priceCta}`} onClick={() => track('preco')}>decidir minha especialidade agora</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GUARANTEE ============ */}
      <section>
        <div className={styles.container}>
          <div className={styles.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow}>risco zero do seu lado</span>
            <h2>garantia incondicional de <span className={styles.highlightUnderline}>7 dias</span></h2>
          </div>
          <div className={styles.guaranteeCard}>
            <div className={styles.guaranteeBadge}>
              <div className={styles.badgeNum}>7</div>
              <div className={styles.badgeLabel}>dias</div>
            </div>
            <h3>você tem 7 dias pra usar o programa inteiro.</h3>
            <p>faz o teste. lê o ranking das 55 especialidades. assiste as lives do bônus e as aulas do curso de IA. testa, repete, refaz se quiser.</p>
            <p>se em algum momento até o 7º dia você sentir que isso não é pra você, pede reembolso integral. <strong>sem perguntas, sem fricção, sem formulário cheio de campos.</strong></p>

            <div className={styles.satisfactionExtras}>
              <p style={{ color: 'var(--navy)', fontWeight: 600, marginBottom: 8 }}>e se for pra você, seu acesso é <strong>vitalício</strong>:</p>
              <ul>
                <li>seu ranking e a narrativa de cada match ficam salvos na sua área de membro pra rever quando quiser</li>
                <li>refaça o teste quando quiser e compare sua evolução, sem custo adicional</li>
                <li>acervo de 50+ lives sempre crescendo, lives novas entram automaticamente</li>
                <li>curso IA na Medicina liberado por completo, no seu ritmo</li>
                <li>nenhuma mensalidade, nenhuma taxa de renovação</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AUTHORITY ============ */}
      <section className={styles.sectionYellow}>
        <div className={styles.container}>
          <div className={styles.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow} style={{ background: 'rgba(14, 31, 77, 0.1)', color: 'var(--navy)' }}>desenvolvido por</span>
            <h2>quem entende de carreira médica<br />melhor do que <span className={styles.highlightUnderline}>a faculdade</span></h2>
          </div>

          <div className={styles.authorityCardV2}>
            <div className={styles.authorityBrand}>
              <img src="/landing/logo-amo-medicina-v2.png" alt="Amo Medicina" className={styles.authorityLogo} />
              <p className={styles.authorityTag}>a newsletter do médico</p>
              <p className={styles.authorityDesc}>conteúdo gratuito sobre medicina, finanças, marketing e tecnologia médica, lido por médicos e estudantes do Brasil inteiro. <strong>o med escolha nasceu dentro desse ecossistema</strong>, materializando anos de conversa com a audiência sobre a decisão mais adiada da carreira médica.</p>
            </div>

            <div className={styles.authorityDividerVert}></div>

            <div className={styles.authorityStatBlock}>
              <div className={styles.authorityStatEyebrow}>o mercado em números</div>
              <div className={styles.authorityStatNum}>570 mil+</div>
              <p className={styles.authorityStatLabel}>médicos ativos no Brasil, distribuídos entre <strong>as 55 especialidades reconhecidas no país</strong>.</p>
              <div className={styles.authorityStatPill}>a maioria escolheu no escuro.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section>
        <div className={styles.containerNarrow}>
          <div className={styles.textCenter} style={{ marginBottom: 32 }}>
            <span className={styles.eyebrow}>faq</span>
            <h2>dúvidas que aparecem antes de <span className={styles.highlightUnderline}>decidir</span></h2>
          </div>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>o med escolha é só mais um quiz online?</summary>
              <div className={styles.faqAnswer}>não. é o match da especialidade médica. 95 perguntas em 6 eixos, cruzadas com as 55 especialidades reconhecidas no Brasil e dados reais do DMB 2025, ranking ordenado, narrativa explicando o porquê de cada match. quiz é o que você já fez antes e não fechou nada.</div>
            </details>

            <details className={styles.faqItem}>
              <summary>e se eu não gostar do programa?</summary>
              <div className={styles.faqAnswer}>7 dias de garantia incondicional. faz o teste, lê o ranking, assiste algumas lives. se não for pra você, pede reembolso integral, sem perguntas, sem fricção.</div>
            </details>

            <details className={styles.faqItem}>
              <summary>quanto tempo leva pra finalizar o teste?</summary>
              <div className={styles.faqAnswer}>entre 20 e 45 minutos pra responder. resultado liberado direto na sua conta logo após a análise. decisão fechada no mesmo dia (caso mais comum entre alunos).</div>
            </details>

            <details className={styles.faqItem}>
              <summary>quais especialidades estão cobertas?</summary>
              <div className={styles.faqAnswer}>todas. as 55 especialidades médicas reconhecidas no Brasil estão no cruzamento, da clínica geral à neurocirurgia, da medicina de família à radiologia intervencionista. dá pra explorar qualquer uma delas dentro da plataforma, com dados de mercado do DMB 2025. nenhuma fica de fora do seu ranking.</div>
            </details>

            <details className={styles.faqItem}>
              <summary>posso refazer o teste se mudar de ideia?</summary>
              <div className={styles.faqAnswer}>quantas vezes quiser, pra sempre. acesso vitalício, sem mensalidade, sem taxa de renovação. seu histórico fica salvo na sua conta pra você comparar a evolução.</div>
            </details>

            <details className={styles.faqItem}>
              <summary>as lives do acervo ficam disponíveis pra sempre?</summary>
              <div className={styles.faqAnswer}>sim. todas as 50+ lives gravadas ficam disponíveis na sua conta, vitalício. lives novas também entram no acervo conforme são gravadas.</div>
            </details>

            <details className={styles.faqItem}>
              <summary>o que é o bônus do curso de IA na Medicina?</summary>
              <div className={styles.faqAnswer}>é o curso completo &quot;IA na Medicina: da teoria à prática&quot;, 12h em vídeo ensinando a usar inteligência artificial no dia a dia clínico, com templates de prompt prontos e certificado emitido pela Hotmart. vendido separadamente por R$ 497, incluso sem custo extra pra quem compra o match.</div>
            </details>

            <details className={styles.faqItem}>
              <summary>sou estudante do 2º ano, ainda dá pra fazer?</summary>
              <div className={styles.faqAnswer}>o programa é desenhado pros anos finais, mas estudantes mais novos também usam. quanto antes você decide, mais tempo tem pra direcionar estudo, estágio e foco.</div>
            </details>

            <details className={styles.faqItem}>
              <summary>funciona pra médico que já está formado mas quer mudar de área?</summary>
              <div className={styles.faqAnswer}>sim. o teste é desenhado pra qualquer momento da carreira médica, não só pra quem está começando. médicos formados há anos usam pra aproveitar habilidades já desenvolvidas e migrar pra uma especialidade mais alinhada com o perfil que mudou ao longo da prática.</div>
            </details>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className={`${styles.sectionNavy} ${styles.finalCta}`}>
        <div className={styles.finalCtaImage}>
          <img src="/landing/closing-doctors.png" alt="Médicos jovens caminhando juntos pelo hospital, sorrindo" />
        </div>
        <div className={styles.containerNarrow}>
          <span className={styles.eyebrow}>decida hoje</span>
          <h2>menos dúvidas, <span className={styles.highlightTeal}>mais certezas</span>.</h2>
          <p className={styles.lead}>a sua próxima especialidade médica não precisa ser decidida no escuro.</p>
          <p className={styles.lead}>match da especialidade médica + acervo com 50+ lives + curso IA na Medicina + acesso vitalício + 7 dias de garantia.</p>
          <p className={styles.lead}><strong>R$ 149 à vista. ou 12x de R$ 14,90 no cartão.</strong></p>

          <div className={`${styles.ctaBlock} ${styles.mt4}`}>
            <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnLarge} ${styles.btnUppercase}`} onClick={() => track('cta_final')}>quero definir minha especialidade agora</a>
            <p className={styles.ctaFriction}>7 dias de garantia. acesso imediato.</p>
            <p className={styles.ctaFriction} style={{ marginTop: 8 }}>
              já tem acesso?{' '}
              <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 700, textDecoration: 'underline' }}>entre aqui</Link>
            </p>
          </div>

          <div className={styles.psBlock}>
            <p><span className={styles.psLabel}>P.S.</span>a residência que você vai começar daqui a 1 ano vai ser decidida nos próximos meses. ou agora, com o match da especialidade médica cobrindo as 55 áreas reconhecidas, narrativa explicativa, resultado salvo na sua área de membro e garantia de 7 dias. ou no escuro, depois, na pressão da inscrição. R$ 149 contra 30 anos de carreira: a matemática mais simples que você vai resolver hoje.</p>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className={styles.siteFooter}>
        <div className={styles.container}>
          <img src="/med-escolha-logo-dark.svg" alt="Med Escolha" />
          <p>med escolha 2.0, por amo medicina.</p>
          <p>compra processada via Hotmart. garantia de 7 dias.</p>
        </div>
      </footer>

      {/* ============ STICKY CTA BAR ============ */}
      <div className={`${styles.stickyCta} ${stickyVisible ? styles.stickyCtaVisible : ''}`}>
        <div className={styles.stickyCtaInner}>
          <div className={styles.stickyCtaInfo}>
            <span className={styles.stickyCtaRating}>★★★★★</span>
            <span className={styles.stickyProduct}>match da especialidade médica</span>
            <span className={styles.stickyPrice}>R$ 149 ou 12x R$ 14,90</span>
          </div>
          <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.stickyCtaBtn} ${styles.btnUppercase}`} onClick={() => track('sticky')}>garantir acesso</a>
        </div>
      </div>
    </div>
  )
}
