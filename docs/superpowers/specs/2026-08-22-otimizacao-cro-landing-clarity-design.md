# Otimização CRO da landing com base no Microsoft Clarity

## Contexto

A landing pública em `app.medescolha.com` recebeu 944 sessões nos últimos 3 dias. O tráfego é predominantemente mobile e vindo de ambientes de navegador incorporado:

- 45,44% das sessões vieram do navegador interno do Instagram;
- 30,08% vieram do Mobile Safari;
- 78,35% foi a profundidade média de rolagem;
- 16,63% das sessões tiveram clique morto;
- o CTA `quero fazer o match` concentrou 96 cliques mortos no mapa mobile;
- a página teve LCP de 4 s e INP de 290 ms.

Um teste controlado confirmou que os links de âncora funcionam, mas os CTAs intermediários de maior intenção apenas levam o usuário até a seção de oferta. A ação comunicada pelo texto não corresponde ao resultado imediato do clique. Além disso, cliques informativos e cliques que abrem a Hotmart usam hoje o mesmo evento `compra_iniciada`, misturando curiosidade com intenção real de checkout.

## Objetivo

Reduzir fricção entre intenção e ação, melhorar a qualidade dos eventos de conversão e reduzir o custo de carregamento da landing, sem reestruturar a narrativa completa da página nesta rodada.

O experimento deve permitir comparar os próximos 3 a 7 dias com a linha de base atual.

## Abordagens consideradas

### 1. Correção mínima

Alterar somente os três CTAs intermediários para abrir a Hotmart.

Vantagem: mudança pequena e rápida.

Limitação: mantém eventos ambíguos, carregamento de imagens sem otimização e elementos que continuam gerando cliques mortos.

### 2. Correção equilibrada, escolhida

Corrigir os CTAs, separar a taxonomia de eventos, medir o comparador, otimizar imagens e remover falsas affordances dos exemplos visuais.

Vantagem: ataca os gargalos identificados no Clarity e melhora a capacidade de medir o resultado sem mudar a estrutura comercial da página.

Limitação: exige validar eventos e renderização em mais de um viewport.

### 3. Reestruturação ampla

Além das correções anteriores, antecipar oferta, preço e prova social na página.

Vantagem: pode aumentar a exposição da oferta.

Limitação: muda muitas variáveis ao mesmo tempo e dificulta atribuir o resultado. Fica fora desta rodada.

## Fluxo de CTA

### CTA informativo

O CTA `saiba mais` do hero continua levando para `#como-funciona`. Sua função é atender visitantes que ainda estão explorando a solução.

Esse clique não representa início de checkout e não deve disparar eventos de conversão para Meta ou GA4.

### CTAs de alta intenção

Os seguintes CTAs passam a abrir diretamente o checkout da Hotmart em nova aba, preservando o código de indicação montado por `comCodigoIndicacao`:

| Origem | Texto atual | Destino novo |
|---|---|---|
| `mecanismo` | quero fazer o match | Hotmart |
| `plano-pos-resultado` | quero meu plano de decisão | Hotmart |
| `preco` | decidir minha especialidade agora | Hotmart |

Os CTAs que já apontam diretamente para a Hotmart continuam com o comportamento atual: header, oferta, garantia, CTA final e barra fixa.

## Taxonomia de eventos

### `cta_informativa_clicada`

Evento do PostHog para ações que mantêm o usuário na página.

Propriedades mínimas:

- `origem`;
- `destino`;
- `tipo: 'ancora'`.

O CTA `saiba mais` usa este evento.

### `compra_iniciada`

O evento existente do PostHog passa a ser usado somente quando o clique abre a Hotmart. O nome será preservado para não quebrar relatórios e integrações atuais.

Propriedades mínimas:

- `origem`;
- `destino: 'hotmart'`;
- `produto: 'med-escolha'`;
- `valor: 149`;
- `moeda: 'BRL'`.

No mesmo clique devem continuar sendo disparados:

- `InitiateCheckout` para Meta;
- `begin_checkout` para GA4 e Google Ads.

Os cliques informativos deixam de usar `compra_iniciada`. A análise deve anotar a data da correção, pois o histórico anterior contém cliques de âncora misturados. Quando o relatório histórico permitir, deve-se filtrar pelas origens que já representavam links diretos para a Hotmart.

### `comparador_aberto`

Evento do PostHog para os links da landing que levam a `/comparar`.

Propriedades mínimas:

- `origem`, diferenciando hero, seção do comparador e FAQ;
- `destino: '/comparar'`.

Não dispara evento de checkout.

### Contexto automático

PostHog já captura propriedades de sessão, página, navegador e dispositivo. A implementação não deve duplicar esses campos manualmente. Parâmetros UTM presentes na página devem continuar disponíveis no contexto da sessão.

## Imagens e desempenho

As imagens da landing usam hoje elementos `img` nativos sem indicação explícita de prioridade ou carregamento tardio.

A implementação deve:

- migrar as imagens fotográficas em PNG e JPG para `next/image` seguindo a documentação instalada da versão 16.2.7;
- priorizar somente a imagem principal do hero;
- definir `sizes` coerentes com os layouts desktop e mobile;
- manter proporção e enquadramento atuais;
- deixar imagens abaixo da primeira dobra com carregamento tardio;
- evitar alteração perceptível na composição visual ou deslocamento de layout.

Logotipos e SVGs pequenos podem permanecer como estão se a migração não trouxer ganho mensurável ou aumentar o risco de regressão visual.

A meta operacional é reduzir o LCP observado de 4 s, buscando ficar abaixo de 3 s no tráfego real mobile. O valor de 2,5 s continua sendo a referência ideal, mas não será tratado como garantia desta única mudança.

## Elementos com aparência clicável

Os mapas de calor mostram cliques mortos em rótulos e exemplos do ranking. Nesta rodada, esses elementos não ganharão uma navegação artificial.

A composição do hero e o exemplo de resultado devem deixar explícito que são demonstrações:

- manter ou reforçar o rótulo `exemplo ilustrativo`;
- reduzir o tratamento de botão no selo `ranking claro`;
- remover estados de hover ou cursor de ação, se existirem;
- manter os cards como conteúdo estático e acessível.

Não haverá redesenho da identidade visual. A landing preserva Poppins, paleta, espaçamento, ordem das seções e a composição de ranking como assinatura visual. A intervenção será funcional e discreta.

## Acessibilidade e comportamento

- links externos devem usar `target="_blank"` e `rel="noopener noreferrer"`;
- CTAs devem manter foco visível por teclado;
- imagens devem preservar textos alternativos úteis;
- animações existentes devem continuar respeitando `prefers-reduced-motion`;
- nenhum CTA pode depender apenas de JavaScript para possuir um destino válido;
- o comportamento deve funcionar em viewport mobile semelhante ao navegador interno do Instagram.

## Validação no preview

### Código

- executar lint e build de produção;
- revisar o uso de APIs conforme a documentação local do Next.js 16.2.7;
- verificar que nenhum CTA de alta intenção ainda aponta para `#checkout`;
- verificar que somente CTAs da Hotmart disparam Meta e GA4;
- verificar que o código de indicação continua presente no checkout.

### Navegador

Validar no preview da PR:

1. desktop em largura comum;
2. mobile com largura aproximada de 390 px;
3. comportamento da barra fixa após rolagem;
4. hero, oferta, garantia e CTA final;
5. os três CTAs alterados;
6. os links do comparador;
7. navegação por teclado e foco;
8. ausência de deslocamentos visuais relevantes durante o carregamento.

## Leitura do experimento

Usar janelas equivalentes e evitar comparar métricas de fontes ou períodos diferentes.

Indicadores principais:

- cliques mortos no CTA `quero fazer o match`;
- sessões com cliques mortos na landing;
- `compra_iniciada` por origem, considerando somente cliques que abrem a Hotmart;
- taxa de visualização da landing até abertura de checkout;
- taxa de checkout até compra na Hotmart;
- LCP e INP em mobile;
- uso de `/comparar` por origem.

Guardrails:

- profundidade média de rolagem;
- saída precoce da landing;
- erros JavaScript;
- conversão final em compra.

## Critério de sucesso

Após 3 a 7 dias, a mudança será considerada positiva se:

- os cliques mortos nos CTAs alterados caírem para perto de zero;
- houver eventos de checkout separados e utilizáveis por origem;
- não houver regressão relevante em erros JavaScript ou compra final;
- o LCP mobile apresentar melhora em relação à linha de base de 4 s.

Como o volume de compra é baixo para significância estatística em poucos dias, a decisão inicial será direcional. Mudanças adicionais de estrutura ou copy só serão propostas depois de observar o comportamento desta rodada.

## Publicação

O trabalho será feito na branch `codex/clarity-cro-landing-2026-08-22` e entregue em uma PR com preview. Produção só será alterada depois da validação do preview e aprovação explícita para merge.

## Fora de escopo

- reorganizar seções da landing;
- mudar preço, oferta, garantia ou bônus;
- alterar a identidade visual;
- remover o comparador gratuito;
- modificar checkout ou pixels configurados dentro da Hotmart;
- criar um teste A/B nesta primeira rodada.
