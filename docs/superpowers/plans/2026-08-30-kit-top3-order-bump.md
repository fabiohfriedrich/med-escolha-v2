# Plano de implementação: Kit Valide Seu Top 3

## Objetivo

Implementar a especificação `2026-08-30-kit-top3-order-bump-design.md` sem alterar o acesso do produto principal nem o pacote de psicólogo. O trabalho será feito em uma branch própria, publicado primeiro em preview e ativado na Hotmart somente depois dos testes de compra e reembolso.

## Princípios de execução

- Tratar produto principal, psicólogo e kit por uma allowlist explícita no webhook.
- Separar o direito de acesso ao kit das tabelas `compradores` e `pacotes_psicologo`.
- Manter os arquivos pagos fora de `public/` e servir somente após autenticação e autorização.
- Usar o código da oferta da Hotmart para distinguir order bump e compra avulsa.
- Não enviar receita do kit para Meta ou GA4 até validar o payload real da Hotmart.
- Produzir PDFs preenchíveis, imprimíveis e utilizáveis em celular e desktop.
- Não ativar a oferta para tráfego real antes do teste completo de compra, entrega e revogação.

## Etapa 1: preparar branch e testes de segurança

Arquivos:

- `package.json`
- `package-lock.json`
- `vitest.config.ts`
- `tests/hotmart-produtos.test.ts`
- `tests/kit-top3-acesso.test.ts`

Ações:

1. Criar a branch `codex/kit-top3-order-bump` a partir do commit que contém a especificação aprovada.
2. Adicionar Vitest como dependência de desenvolvimento e o script `npm test`.
3. Criar fixtures mínimas de compra aprovada, compra completa, reembolso, chargeback e produto desconhecido.
4. Escrever primeiro os testes de classificação de produto, classificação de oferta e convergência de status.
5. Garantir que os testes falhem antes da implementação dos novos helpers.

Critério de conclusão:

- Existe uma suíte rápida que protege a allowlist e as regras de acesso antes da alteração do webhook.

## Etapa 2: criar o modelo de direitos digitais

Arquivos:

- `supabase/migrations/20260830090000_create_acessos_produtos_digitais.sql`
- `lib/produtos-digitais.ts`
- `tests/kit-top3-acesso.test.ts`

Ações:

1. Criar `acessos_produtos_digitais` com uma linha por transação Hotmart.
2. Adicionar unicidade em `hotmart_transaction_id` e índice em `email, produto_slug`.
3. Restringir `origem` a `bump`, `avulsa` ou `desconhecida` e `status_pagamento` aos estados previstos.
4. Habilitar RLS sem policy pública, mantendo leitura e escrita pela service role.
5. Criar helpers de normalização de e-mail, classificação da oferta, upsert da compra, revogação por transação e consulta de acesso ativo.
6. Fazer a consulta considerar acesso válido quando existir pelo menos uma transação ativa e paga para o e-mail e o produto.
7. Cobrir compra repetida, reembolso de uma entre duas transações e oferta desconhecida nos testes.

Critério de conclusão:

- O kit possui um direito de acesso independente, idempotente e revogável por transação.

## Etapa 3: tornar o webhook explícito por produto

Arquivos:

- `.env.example`
- `app/api/webhook/hotmart/route.ts`
- `lib/hotmart-produtos.ts`
- `tests/hotmart-produtos.test.ts`

Ações:

1. Documentar `HOTMART_PRODUCT_ID_PRINCIPAL`, `HOTMART_PRODUCT_ID_PSICOLOGO`, `HOTMART_PRODUCT_ID_KIT_TOP3`, `HOTMART_OFFER_CODE_KIT_BUMP`, `HOTMART_OFFER_CODE_KIT_AVULSO` e `NEXT_PUBLIC_HOTMART_CHECKOUT_KIT_TOP3`.
2. Extrair a classificação dos três produtos para uma função pura e testável.
3. Falhar fechado para configuração incompleta dos produtos necessários.
4. Processar produto principal, psicólogo e kit em ramos separados.
5. Fazer produto desconhecido responder `200` com ação `ignorado`, sem gravar comprador nem provisionar Clerk.
6. No ramo do kit, salvar ou revogar somente `acessos_produtos_digitais`.
7. Impedir que compra do kit chame `provisionarAcesso`, altere senha, registre indicação ou escreva nas tabelas dos outros produtos.
8. Manter Meta CAPI e GA4 apenas no produto principal até a validação do payload real.
9. Registrar em log produto, oferta, transação e ação sem expor dados além do necessário.

Critério de conclusão:

- Todos os produtos conhecidos têm comportamento isolado e produto desconhecido não libera acesso.

## Etapa 4: implementar autorização e downloads protegidos

Arquivos:

- `lib/kit-top3.ts`
- `app/api/produtos-digitais/kit-top3/status/route.ts`
- `app/api/downloads/kit-top3/[arquivo]/route.ts`
- `tests/kit-top3-arquivos.test.ts`

Ações:

1. Definir uma allowlist imutável com os cinco PDFs e o ZIP.
2. Obter a sessão e o e-mail primário pelo Clerk no servidor.
3. Criar endpoint de status que informe apenas `desbloqueado`, `bloqueado` ou erro recuperável.
4. Criar rota de download que valide login, arquivo permitido e compra ativa.
5. Retornar `401` sem sessão, `403` sem compra, `404` para nome fora da allowlist e `500` para arquivo esperado ausente.
6. Definir `Content-Type`, `Content-Length`, cache privado e `Content-Disposition` de anexo.
7. Registrar o evento de download depois da autorização, sem tornar falha de analytics bloqueante.
8. Testar a allowlist e impedir travessia de diretório ou caminho arbitrário.

Critério de conclusão:

- Nenhum arquivo pago pode ser obtido por URL pública ou por manipulação do nome do arquivo.

## Etapa 5: produzir o conteúdo dos cinco módulos

Arquivos:

- `content/kit-top3/00-comece-por-aqui.md`
- `content/kit-top3/01-entrevista-com-especialistas.md`
- `content/kit-top3/02-checklist-observacao-da-rotina.md`
- `content/kit-top3/03-conversa-com-residentes.md`
- `content/kit-top3/04-matriz-decisao-top3.md`
- `content/kit-top3/README.md`

Ações:

1. Escrever os módulos completos no tom do Med Escolha 2.0.
2. Manter o material prático, sem prometer uma decisão definitiva nem aconselhamento individual.
3. Incluir instruções de uso, exemplos curtos, campos de evidência e espaço para as três especialidades.
4. Separar fato observado, opinião recebida, interpretação pessoal e incerteza.
5. Revisar coerência entre o plano de 14 dias e a sequência dos quatro instrumentos.
6. Revisar ortografia, anonimato do time, marca e ausência de travessão.

Critério de conclusão:

- Os cinco textos formam um método completo e podem ser usados separadamente sem perder contexto.

## Etapa 6: diagramar PDFs preenchíveis e ativos visuais

Arquivos:

- `scripts/kit-top3/gerar-materiais.mjs`
- `scripts/kit-top3/verificar-materiais.mjs`
- `assets/downloads/kit-top3/00-comece-por-aqui.pdf`
- `assets/downloads/kit-top3/01-entrevista-com-especialistas.pdf`
- `assets/downloads/kit-top3/02-checklist-observacao-da-rotina.pdf`
- `assets/downloads/kit-top3/03-conversa-com-residentes.pdf`
- `assets/downloads/kit-top3/04-matriz-decisao-top3.pdf`
- `assets/downloads/kit-top3/kit-valide-seu-top3.zip`
- `public/products/kit-top3-hotmart-600x600.png`
- `public/products/kit-top3-card.png`

Ações:

1. Criar um gerador reproduzível com a direção visual Dados editorial.
2. Usar A4, margens seguras, tipografia incorporada, contraste adequado e hierarquia baseada em números.
3. Adicionar campos AcroForm preenchíveis com nomes únicos e espaço equivalente para impressão.
4. Gerar os cinco PDFs e o ZIP com exatamente os arquivos aprovados.
5. Gerar a imagem quadrada de 600 por 600 pixels e a miniatura para a plataforma.
6. Criar validações automáticas de existência, quantidade de páginas, formulários, nomes, tamanho e conteúdo do ZIP.
7. Renderizar todas as páginas como imagens e fazer inspeção visual em cor e escala de cinza.
8. Testar preenchimento e salvamento em Preview do macOS, Adobe Acrobat e um leitor mobile disponível.

Critério de conclusão:

- Os arquivos são reproduzíveis, preenchíveis, legíveis, imprimíveis e passam pela revisão visual página a página.

## Etapa 7: criar a experiência na área de membros

Arquivos:

- `app/ferramentas/kit-top3/page.tsx`
- `app/ferramentas/kit-top3/kit-top3.module.css`
- `components/KitTop3Card.tsx`
- `components/KitTop3Oferta.tsx`
- `app/ferramentas/page.tsx`
- `components/PosResultadoActions.tsx`
- `lib/ad-tracking.ts`

Ações:

1. Criar a página do kit com estado decidido no servidor para evitar exibir downloads antes da autorização.
2. No estado desbloqueado, mostrar instruções, cinco cards e download do pacote.
3. No estado bloqueado, mostrar promessa, entregas, preço, garantia e checkout avulso.
4. Não renderizar checkout funcional se a variável pública estiver ausente.
5. Adicionar o card à biblioteca de ferramentas com CTA de acordo com o direito de acesso.
6. Adicionar oferta contextual no pós-resultado sem desvalorizar o ranking principal.
7. Instrumentar visualização da oferta, início do checkout, abertura da página e clique de download no PostHog.
8. Garantir que os eventos do kit não chamem Meta Pixel nem GA4 enquanto a estrutura da transação não estiver validada.
9. Validar layout em desktop, tablet e celular, inclusive estados de erro e carregamento.

Critério de conclusão:

- Compradores acessam o kit com poucos cliques e não compradores veem uma oferta clara e honesta.

## Etapa 8: configurar produto e ofertas na Hotmart

Dependências externas:

- Conta Hotmart autenticada.
- Checkout principal do Med Escolha 2.0.
- URL pública do webhook e página de entrega.

Ações:

1. Criar o produto `Kit Valide Seu Top 3 | Med Escolha 2.0` por R$ 47.
2. Subir a imagem de produto e definir a garantia de sete dias.
3. Criar uma oferta identificada para order bump e outra para venda avulsa.
4. Vincular a oferta de bump ao checkout principal com o texto aprovado.
5. Configurar o webhook do produto para os eventos aprovados, completos, reembolsados, chargeback e cancelados.
6. Registrar IDs, códigos e URL avulsa nas variáveis do ambiente de preview.
7. Manter o bump desativado no checkout de produção até concluir a etapa de validação real.

Critério de conclusão:

- Produto, duas ofertas e webhook existem, mas a exibição para todo o tráfego ainda está controlada.

## Etapa 9: validação técnica e comercial

Ações automatizadas:

1. Rodar `npm test`.
2. Rodar `npm run lint`.
3. Rodar `npm run build`.
4. Rodar o verificador dos PDFs e do ZIP.
5. Rodar `git diff --check` e revisar ausência de arquivos pagos em `public/`.

Ações no preview:

1. Validar usuário sem login, usuário sem kit e usuário com kit.
2. Testar os seis downloads, inclusive nome inválido e tentativa de travessia de diretório.
3. Testar eventos do PostHog e os CTAs nas duas origens.
4. Confirmar que o produto principal e o pacote de psicólogo mantêm o comportamento atual.
5. Confirmar que um produto Hotmart desconhecido não cria comprador.

Compra real de baixo risco:

1. Fazer uma compra do fluxo principal com o bump.
2. Capturar o payload real dos eventos sem registrar dados pessoais no repositório.
3. Confirmar se a Hotmart envia transação, produto, oferta e valor separados ou combinados.
4. Verificar liberação do produto principal e do kit em qualquer ordem de webhook.
5. Baixar e preencher os materiais.
6. Solicitar o reembolso da transação de teste.
7. Confirmar revogação apenas do kit e preservação do acesso principal quando aplicável.
8. Só então decidir a implementação correta de receita do kit em Meta e GA4.

Critério de conclusão:

- Compra, entrega, uso e reembolso funcionam ponta a ponta sem efeito colateral nos outros produtos.

## Etapa 10: publicação controlada

Ações:

1. Organizar commits por fundação, materiais, interface e configuração.
2. Enviar a branch e abrir uma PR com checklist de validação.
3. Revisar o preview da Vercel e as migrations aplicáveis.
4. Mesclar somente depois da aprovação do preview.
5. Aplicar variáveis e migration em produção.
6. Ativar o order bump no checkout principal.
7. Monitorar por 72 horas erros de webhook, concessões, reembolsos, attach rate e conversão do produto principal.
8. Comparar attach rate com a meta inicial de 20% a 30% e registrar aprendizados antes de considerar a versão interativa.

Critério de conclusão:

- O kit está vendendo e sendo entregue com mensuração confiável e rollback operacional claro.

## Ordem dos commits

1. `test: protege classificação dos produtos Hotmart`
2. `feat: adiciona direitos digitais do kit top 3`
3. `fix: restringe webhook Hotmart por produto`
4. `feat: protege downloads do kit top 3`
5. `content: cria módulos do kit top 3`
6. `feat: gera PDFs e ativos do kit top 3`
7. `feat: adiciona oferta do kit à plataforma`
8. `docs: registra validação da Hotmart e lançamento`

## Plano de reversão

- Desativar o order bump e a oferta avulsa na Hotmart.
- Remover ou ocultar os CTAs da área de membros por configuração.
- Manter a tabela e os registros de acesso para auditoria, sem apagar compras.
- Reverter a interface e o roteamento em um commit próprio se necessário.
- Não remover arquivos de compradores que já adquiriram o kit enquanto o direito estiver ativo.
