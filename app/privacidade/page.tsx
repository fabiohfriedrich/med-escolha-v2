export const metadata = {
  title: 'Política de Privacidade | Med Escolha',
  description: 'Como o Med Escolha coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
}

const wrap = { minHeight: '100vh', background: '#f8fafc' }
const hero = { background: '#0f2d5e', color: 'white' }
const heroInner = { maxWidth: 760, margin: '0 auto', padding: '48px 24px 40px' }
const body = { maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px', color: '#1e293b', lineHeight: 1.7, fontSize: 15.5 }
const h2 = { fontSize: 19, fontWeight: 800, color: '#0f2d5e', marginTop: 36, marginBottom: 12 }
const p = { marginBottom: 14 }
const ul = { marginBottom: 14, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 6 }

export default function PrivacidadePage() {
  return (
    <div style={wrap}>
      <div style={hero}>
        <div style={heroInner}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', marginBottom: 12 }}>
            Med Escolha · Amo Medicina
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Política de Privacidade</h1>
          <p style={{ fontSize: 15, color: '#bfdbfe' }}>Última atualização: 27 de julho de 2026</p>
        </div>
      </div>

      <div style={body}>
        <p style={p}>
          Esta política explica quais dados o Med Escolha coleta quando você faz o teste, cria uma conta ou navega pelo site,
          para que serve cada dado e quais direitos você tem sobre eles, em conformidade com a Lei Geral de Proteção de Dados
          (Lei 13.709/2018, LGPD). O Med Escolha é um produto da Amo Medicina.
        </p>

        <h2 style={h2}>1. Quais dados coletamos</h2>
        <ul style={ul}>
          <li><strong>Dados de cadastro:</strong> nome, e-mail e telefone, informados no cadastro ou na compra.</li>
          <li><strong>Respostas do teste:</strong> suas respostas às 95 questões do teste de compatibilidade e ao Mapa de Burnout, usadas para calcular seu resultado.</li>
          <li><strong>Dados de compra:</strong> confirmação de pagamento processada pela Hotmart (não armazenamos dados de cartão).</li>
          <li><strong>Dados de navegação:</strong> páginas visitadas, cliques e origem do acesso, coletados via cookies e pixels de terceiros.</li>
        </ul>

        <h2 style={h2}>2. Para que usamos esses dados</h2>
        <ul style={ul}>
          <li>Calcular e apresentar o resultado do seu teste de compatibilidade;</li>
          <li>Autenticar seu acesso e manter seu histórico de resultados na área de membro;</li>
          <li>Enviar e-mails transacionais (confirmação de compra, lembrete de reteste) e, quando você autorizar, comunicações da newsletter;</li>
          <li>Medir desempenho de anúncios e melhorar o produto, de forma agregada.</li>
        </ul>

        <h2 style={h2}>3. Com quem compartilhamos dados</h2>
        <p style={p}>Usamos os seguintes fornecedores para operar o Med Escolha, cada um tratando apenas os dados necessários à sua função:</p>
        <ul style={ul}>
          <li><strong>Clerk:</strong> autenticação e gestão de conta;</li>
          <li><strong>Supabase:</strong> armazenamento do banco de dados (respostas, resultados, cadastro);</li>
          <li><strong>Hotmart:</strong> processamento de pagamento e emissão de nota;</li>
          <li><strong>Resend:</strong> envio de e-mails transacionais;</li>
          <li><strong>Beehiiv:</strong> envio da newsletter, para quem optar por assinar;</li>
          <li><strong>Meta, Google e PostHog:</strong> pixels e analytics, para medir anúncios e uso do produto.</li>
        </ul>
        <p style={p}>Não vendemos seus dados pessoais a terceiros.</p>

        <h2 style={h2}>4. Cookies e pixels</h2>
        <p style={p}>
          O site usa cookies próprios (para manter sua sessão logada) e cookies de terceiros (Meta Pixel, Google Ads/Analytics
          e PostHog) para medir a origem de tráfego e o desempenho de campanhas. Você pode bloquear cookies nas configurações
          do seu navegador, o que pode limitar algumas funções do site.
        </p>

        <h2 style={h2}>5. Por quanto tempo guardamos seus dados</h2>
        <p style={p}>
          Mantemos seus dados enquanto sua conta estiver ativa ou pelo tempo necessário para cumprir obrigações legais,
          fiscais e contratuais. Após esse período, ou mediante seu pedido de exclusão, os dados são removidos ou anonimizados.
        </p>

        <h2 style={h2}>6. Seus direitos</h2>
        <p style={p}>Conforme o art. 18 da LGPD, você pode, a qualquer momento, solicitar:</p>
        <ul style={ul}>
          <li>Confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>Correção de dados incompletos, desatualizados ou incorretos;</li>
          <li>Exclusão ou anonimização de dados desnecessários;</li>
          <li>Portabilidade dos dados a outro fornecedor;</li>
          <li>Revogação do consentimento (por exemplo, cancelar a newsletter a qualquer momento pelo link no rodapé do e-mail).</li>
        </ul>
        <p style={p}>
          Para exercer qualquer um desses direitos, escreva para{' '}
          <a href="mailto:contato@euamomedicina.com" style={{ color: '#2563eb' }}>contato@euamomedicina.com</a>.
        </p>

        <h2 style={h2}>7. Alterações nesta política</h2>
        <p style={p}>
          Podemos atualizar esta política para refletir mudanças no produto ou na legislação. A data no topo da página sempre
          indica a versão mais recente.
        </p>

        <p style={{ ...p, marginTop: 32 }}>
          Veja também os <a href="/termos" style={{ color: '#2563eb' }}>Termos de Uso</a>.
        </p>
      </div>
    </div>
  )
}
