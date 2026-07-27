import Link from 'next/link'
import BaixarPdfButton from './BaixarPdfButton'

export const metadata = {
  title: 'Guia de Instagram para Médicos | Med Escolha',
  description: 'Guia gratuito com as configurações básicas de perfil e um cronograma de posts pra você começar a gerar valor no seu Instagram como médico.',
}

const CONFIGURACOES = [
  { titulo: 'Foto de perfil', desc: 'Uma foto sua, de rosto visível, com boa iluminação — de preferência de jaleco ou em ambiente clínico.' },
  { titulo: 'Nome de usuário', desc: 'Use seu nome (ou nome + especialidade de interesse). Evite números aleatórios ou apelidos que dificultem a busca.' },
  { titulo: 'Biografia', desc: 'Quem você é + o que você mostra por ali. Ex: "Médico(a) recém-formado(a) · compartilhando minha rotina na residência".' },
  { titulo: 'Destaques (stories fixados)', desc: 'Crie destaques como "Rotina", "Residência", "Estudos" — ajuda quem chega no perfil a entender rápido o que você posta.' },
  { titulo: 'Conta profissional', desc: 'Mude pra conta profissional/criador de conteúdo — libera métricas básicas de alcance e engajamento.' },
]

const TIPOS_POST = [
  { icon: '📸', titulo: 'Bastidores da rotina', desc: 'Um dia de plantão, a bancada de estudos, o trajeto pro hospital — mostra o lado humano da medicina.' },
  { icon: '📚', titulo: 'Conteúdo educativo simples', desc: 'Explique um conceito, mito ou dúvida comum de forma acessível pro público leigo ou pra colegas.' },
  { icon: '💬', titulo: 'Bastidor de decisão de carreira', desc: 'Compartilhe por que escolheu (ou está escolhendo) uma especialidade — gera identificação com quem está na mesma fase.' },
  { icon: '🎯', titulo: 'Marcos e conquistas', desc: 'Aprovação na residência, primeiro plantão, primeira cirurgia acompanhada — celebre e documente sua jornada.' },
]

const CRONOGRAMA_SEMANAL = [
  { dia: 'Segunda', post: 'Bastidor da rotina (foto ou vídeo curto)' },
  { dia: 'Quarta', post: 'Conteúdo educativo simples (carrossel ou vídeo)' },
  { dia: 'Sexta', post: 'Bastidor de decisão de carreira ou reflexão pessoal' },
  { dia: 'Domingo', post: 'Story de bastidor livre — mantém a conta ativa sem exigir produção' },
]

export default function GuiaInstagramPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', color: 'white', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="print:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Link href="/ferramentas" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, textDecoration: 'none' }}>← Ferramentas</Link>
          </div>
          <div className="print:hidden" style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            📱 Guia gratuito · Med Escolha
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            Guia de Instagram para médicos
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, maxWidth: 580 }}>
            Configuração básica de perfil, tipos de post pra começar e um cronograma semanal pronto pra você postar sem travar.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Configuração de perfil */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 16 }}>1. Configuração básica de perfil</h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {CONFIGURACOES.map(c => (
              <div key={c.titulo} style={{ background: '#faf5ff', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{c.titulo}</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de post */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 16 }}>2. Tipos de post pra começar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {TIPOS_POST.map(t => (
              <div key={t.titulo} style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 18px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{t.titulo}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cronograma semanal */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2d5e', marginBottom: 8 }}>3. Cronograma semanal sugerido</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 20 }}>
            Comece com essa frequência simples. Menos posts publicados com constância vale mais do que muitos posts sem regularidade.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
            {CRONOGRAMA_SEMANAL.map(c => (
              <div key={c.dia} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', width: 70, flexShrink: 0 }}>{c.dia}</span>
                <span style={{ fontSize: 13, color: '#374151' }}>{c.post}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download */}
        <div style={{ textAlign: 'center' as const }}>
          <BaixarPdfButton />
        </div>
      </div>
    </div>
  )
}
