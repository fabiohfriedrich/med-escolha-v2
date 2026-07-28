export const metadata = {
  title: 'Termos de Uso | Med Escolha',
  description: 'Regras de uso do Med Escolha: teste, conta, compra e garantia.',
}

const wrap = { minHeight: '100vh', background: '#f8fafc' }
const hero = { background: '#0f2d5e', color: 'white' }
const heroInner = { maxWidth: 760, margin: '0 auto', padding: '48px 24px 40px' }
const body = { maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px', color: '#1e293b', lineHeight: 1.7, fontSize: 15.5 }
const h2 = { fontSize: 19, fontWeight: 800, color: '#0f2d5e', marginTop: 36, marginBottom: 12 }
const p = { marginBottom: 14 }
const ul = { marginBottom: 14, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 6 }

export default function TermosPage() {
  return (
    <div style={wrap}>
      <div style={hero}>
        <div style={heroInner}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', marginBottom: 12 }}>
            Med Escolha · Amo Medicina
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Termos de Uso</h1>
          <p style={{ fontSize: 15, color: '#bfdbfe' }}>Última atualização: 27 de julho de 2026</p>
        </div>
      </div>

      <div style={body}>
        <p style={p}>
          Estes termos regulam o uso do Med Escolha, produto da Amo Medicina. Ao criar uma conta, fazer o teste ou comprar o
          Med Escolha, você concorda com as regras abaixo. Se você não concordar, não utilize o produto.
        </p>

        <h2 style={h2}>1. O que é o Med Escolha</h2>
        <p style={p}>
          O Med Escolha é um teste de compatibilidade que cruza suas respostas com dados de mercado das especialidades médicas
          reconhecidas pelo CFM, para ajudar na sua decisão de carreira. O resultado é orientativo: é uma ferramenta de apoio à
          decisão, não substitui orientação vocacional profissional, aconselhamento psicológico ou qualquer outro serviço
          especializado, e não garante aprovação em residência, remuneração ou trajetória de carreira.
        </p>

        <h2 style={h2}>2. Conta e cadastro</h2>
        <p style={p}>
          Para acessar seu resultado, histórico e materiais da área de membro, você precisa criar uma conta com nome, e-mail
          e senha. Você é responsável por manter suas credenciais em sigilo e por tudo o que acontecer na sua conta.
        </p>

        <h2 style={h2}>3. Compra, pagamento e garantia</h2>
        <ul style={ul}>
          <li>A compra é processada pela Hotmart, que emite a nota fiscal e gerencia o pagamento;</li>
          <li>Você tem 7 dias corridos após a compra para pedir reembolso integral, sem necessidade de justificativa, conforme o Código de Defesa do Consumidor;</li>
          <li>O acesso aos materiais inclusos na compra é vitalício, salvo descontinuação do produto, com aviso prévio.</li>
        </ul>

        <h2 style={h2}>4. Propriedade intelectual</h2>
        <p style={p}>
          O conteúdo do Med Escolha (perguntas, algoritmo, textos, materiais, aulas e demais recursos) pertence à Amo Medicina
          ou é licenciado a ela. A compra dá a você uma licença de uso pessoal e intransferível. É proibido reproduzir,
          redistribuir ou revender qualquer parte do conteúdo sem autorização.
        </p>

        <h2 style={h2}>5. Uso adequado</h2>
        <p style={p}>Ao usar o Med Escolha, você concorda em não:</p>
        <ul style={ul}>
          <li>Compartilhar seu acesso ou credenciais com terceiros;</li>
          <li>Tentar burlar, copiar ou explorar o algoritmo de compatibilidade;</li>
          <li>Usar o site para qualquer finalidade ilegal ou que prejudique outros usuários.</li>
        </ul>

        <h2 style={h2}>6. Limitação de responsabilidade</h2>
        <p style={p}>
          O resultado do teste é uma estimativa baseada nas respostas fornecidas e em dados de mercado disponíveis no momento
          do cálculo. A Amo Medicina não se responsabiliza por decisões de carreira tomadas exclusivamente com base no
          resultado, nem por indisponibilidades temporárias do site decorrentes de manutenção ou fatores fora do nosso
          controle.
        </p>

        <h2 style={h2}>7. Alterações destes termos</h2>
        <p style={p}>
          Podemos atualizar estes termos a qualquer momento, para refletir mudanças no produto ou na legislação. A data no
          topo da página sempre indica a versão mais recente. O uso contínuo do Med Escolha após uma atualização representa
          concordância com os novos termos.
        </p>

        <h2 style={h2}>8. Lei aplicável</h2>
        <p style={p}>
          Estes termos são regidos pela legislação brasileira. Fica eleito o foro do domicílio do consumidor para dirimir
          eventuais controvérsias, salvo disposição legal em contrário.
        </p>

        <h2 style={h2}>9. Contato</h2>
        <p style={p}>
          Dúvidas sobre estes termos, escreva para{' '}
          <a href="mailto:contato@euamomedicina.com" style={{ color: '#2563eb' }}>contato@euamomedicina.com</a>.
        </p>

        <p style={{ ...p, marginTop: 32 }}>
          Veja também a <a href="/privacidade" style={{ color: '#2563eb' }}>Política de Privacidade</a>.
        </p>
      </div>
    </div>
  )
}
