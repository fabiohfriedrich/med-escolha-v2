# Preview público sem credenciais de produção

## Contexto

O Preview da Vercel da antiga PR #1 falhava durante a coleta de `/api/admin/compradores` porque `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` não estavam disponíveis no ambiente Preview. Uma primeira correção baseada em `Proxy` permitiu o build, mas adiou erros de configuração para runtime sem deixar claro quais variáveis estavam ausentes.

A investigação do novo deploy confirmou também que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` não está configurada no Preview. O build fica `READY`, mas a requisição para `/` responde 500 durante a execução do middleware do Clerk.

Não é seguro copiar `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY` ou outras credenciais de Production para branches de Preview. Código não mesclado passaria a ter acesso administrativo aos serviços reais.

## Objetivo

Permitir que deploys de Preview sem credenciais carreguem a experiência pública do Med Escolha, especialmente a landing page, mantendo todas as áreas autenticadas e administrativas fechadas. Production deve conservar exatamente o comportamento atual quando suas variáveis estiverem configuradas.

## Abordagens consideradas

### 1. Preview público com degradação explícita

Quando o Clerk não estiver configurado, o aplicativo renderiza somente a experiência pública e o middleware bloqueia rotas que exigem autenticação. O cliente administrativo do Supabase continua sendo criado apenas no momento de uma operação real.

Vantagens:

- não compartilha credenciais de Production;
- permite validar landing, layout, imagens e navegação pública;
- falha de forma fechada em áreas protegidas;
- não muda Production quando as variáveis existem.

Limitação:

- recursos autenticados e integrações de backend não são testáveis nesse Preview.

### 2. Ambiente de staging completo

Criar projetos separados no Clerk, Supabase, Upstash e demais integrações, com variáveis específicas para Preview.

Vantagem:

- permite testes completos sem tocar nos dados reais.

Limitação:

- exige provisionamento e manutenção de uma infraestrutura de staging, além do escopo desta correção.

### 3. Reutilizar credenciais de Production

Foi descartada. Embora seja simples, permitiria que código de qualquer branch de Preview lesse ou modificasse dados reais com privilégios elevados.

## Decisão

Adotar a abordagem 1. Um staging completo pode ser criado futuramente como trabalho separado.

## Arquitetura

### Cliente administrativo do Supabase

`getSupabaseAdmin()` continua responsável por validar `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`, criar um único cliente e reutilizá-lo. Nenhum módulo pode chamar essa função no escopo global.

Cada página dinâmica ou Route Handler obtém o cliente somente dentro da função executada em runtime. Em `/api/admin/compradores`, a validação do cookie administrativo acontece antes da criação do cliente.

### Middleware do Clerk

O middleware seleciona um dos dois fluxos com base em `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`:

- configurada: usa o middleware atual do Clerk, incluindo troca obrigatória de senha e proteção de rotas;
- ausente: executa um middleware público restrito, sem inicializar o Clerk.

No fluxo restrito:

- a landing `/` e páginas públicas que não usam hooks do Clerk seguem normalmente;
- `/admin/login` permanece acessível;
- demais páginas `/admin/*` continuam protegidas pelo cookie administrativo e redirecionam para o login quando necessário;
- todas as rotas `/api/*` respondem 503, pois o Preview não possui as credenciais necessárias para executar integrações com segurança;
- páginas que importam hooks ou componentes do Clerk respondem 503. A lista inclui `/comparar`, `/criar-senha`, `/esqueci-senha`, `/login`, `/perfil`, `/sso-callback` e `/teste`, além dos segmentos `/resultado/*` e `/radar/*`.

Em Production, as APIs administrativas continuam protegidas por `isAdminRequest()` dentro dos próprios handlers.

### Layout e página inicial

O layout só monta `ClerkProvider` e componentes dependentes de `useUser()` quando a chave pública estiver configurada.

Sem Clerk:

- o layout mantém fontes, analytics que não dependem de autenticação e o conteúdo da página;
- componentes globais que chamam hooks do Clerk não são montados;
- a página inicial renderiza diretamente `MedEscolhaLandingPage`;
- links da landing para páginas dependentes de Clerk continuam visíveis, mas o destino responde 503 no Preview;
- nenhuma tentativa de detectar sessão é feita.

Com Clerk, o layout e a página inicial preservam o comportamento atual, inclusive o dashboard para usuários autenticados.

## Fluxo de dados

1. O build avalia os módulos sem criar clientes Supabase ou Clerk.
2. No Preview sem credenciais, uma requisição pública passa pelo middleware restrito.
3. O layout identifica que o Clerk não está configurado e monta a árvore pública.
4. A página inicial entrega a landing page.
5. Uma requisição para API ou página dependente de Clerk recebe 503 antes de executar código autenticado.
6. Em Production, as variáveis existentes selecionam o fluxo normal sem alteração funcional.

## Tratamento de erros

- A ausência de variáveis Supabase produz erro explícito apenas quando uma operação de backend é chamada.
- A ausência de Clerk no modo público não gera exceção em middleware, layout ou página inicial.
- Rotas protegidas sem Clerk retornam mensagem genérica e status 503.
- Nenhuma resposta inclui nomes ou valores de segredos.

## Validação

Antes de preparar o merge:

1. `npx tsc --noEmit` deve passar.
2. O lint dos arquivos alterados deve passar, separando erros antigos fora das linhas modificadas.
3. `npm run build` deve passar com as variáveis Supabase e Clerk removidas.
4. Um novo deploy Vercel Preview deve ficar `READY`.
5. Os logs devem listar `/api/admin/compradores` como rota dinâmica e concluir a coleta das 168 páginas.
6. `GET /` no Preview deve responder 200 e conter conteúdo da landing.
7. Uma rota protegida no Preview deve responder 503 ou redirecionamento seguro, nunca 200 com conteúdo privado.
8. Os checks do commit devem estar verdes antes da abertura da PR de acompanhamento.

## Fora de escopo

- criar projetos de staging no Clerk, Supabase ou Upstash;
- copiar credenciais de Production para Preview;
- tornar fluxos autenticados funcionais sem os serviços correspondentes;
- alterar banco, RLS, migrations ou dados de Production;
- corrigir avisos e erros de lint preexistentes sem relação com esta falha.
