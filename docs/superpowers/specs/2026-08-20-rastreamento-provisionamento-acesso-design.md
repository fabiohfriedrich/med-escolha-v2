# Rastreamento de provisionamento de acesso (Hotmart → Clerk → Resend)

## Contexto

Hoje o webhook da Hotmart cria a conta no Clerk e envia o e-mail de acesso com senha temporária via Resend, mas não existe nenhum rastro do que aconteceu depois disso: se o e-mail foi entregue, se caiu em spam, se deu bounce. Quando o comprador não recebe o acesso, a única forma de descobrir é consultar o Supabase e o Clerk manualmente e resolver via script ad-hoc (caso real: 2 compradoras sem acesso em 19/08/2026, resolvido manualmente).

Este spec cobre a "frente 1" da correção: instrumentação e um caminho de autoatendimento pro admin. A migração pra link mágico/OTP (eliminando senha do primeiro acesso) fica para uma fase futura, fora de escopo aqui.

## Modelo de dados

Novas colunas em `compradores` (sem tabela nova):

| coluna | tipo | default | uso |
|---|---|---|---|
| `status_provisionamento` | text | `'pendente'` | `pendente` → `conta_criada` → `email_enviado` → `email_entregue`, ou `falhou` a qualquer momento |
| `email_enviado_em` | timestamptz | null | quando o Resend aceitou o envio |
| `email_entregue_em` | timestamptz | null | quando o webhook do Resend confirmou entrega |
| `ultimo_erro` | text | null | mensagem do último erro (Clerk ou Resend) |
| `tentativas_provisionamento` | integer | 0 | conta quantas vezes o provisionamento foi tentado |
| `resend_email_id` | text | null | id retornado pelo Resend no envio — chave pra casar com o webhook de entrega |

`primeiro_acesso` (já existe, não muda) continua marcando o passo final: vira `false` quando o comprador troca a senha temporária pela definitiva.

## Função de provisionamento compartilhada

Extrair a lógica hoje em `criarOuAtualizarAcessoClerk` (dentro de `app/api/webhook/hotmart/route.ts`) para `lib/provisionamento.ts`, reutilizável por três chamadores: o webhook da Hotmart, o novo endpoint do admin, e o script `scripts/reenviar-acesso.ts`.

Comportamento:

1. Lê `status_provisionamento` do comprador.
   - Se já é `conta_criada`, `email_enviado` ou `email_entregue` → **idempotente, não reprovisiona** (evita resetar senha de comprador que já recebeu acesso em caso de reenvio duplicado do evento).
   - Se é `pendente` ou `falhou` → tenta provisionar.
2. Cria/atualiza usuário no Clerk (mesma lógica de hoje, incluindo o retry de corrida em `form_identifier_exists`) → grava `status_provisionamento = 'conta_criada'`, incrementa `tentativas_provisionamento`.
3. Envia o e-mail via Resend, guarda o `resend_email_id` da resposta → grava `status_provisionamento = 'email_enviado'`, `email_enviado_em = now()`.
4. Qualquer erro nos passos 2–3 → grava `ultimo_erro` (mensagem do erro) e `status_provisionamento = 'falhou'`, dispara `sendAlertaAdminEmail` (contexto já existente + número da tentativa).

Uma chamada explícita de "reenviar" (do botão do admin ou do script) ignora a checagem de idempotência do passo 1 — sempre gera senha nova e reenvia, independente do status atual.

## Mudanças no webhook da Hotmart

- O dedup existente (`hotmart_eventos_processados`) deixa de envolver o provisionamento — passa a proteger só as chamadas ao Meta CAPI/GA4 (que é o motivo original dele: não contar a mesma venda duas vezes). O provisionamento vira idempotente pelos próprios status da tabela `compradores` (ver acima).
- Quando o provisionamento termina em `falhou`, a rota responde **500** em vez de 200 — a Hotmart reagenda o reenvio do webhook automaticamente, reforçando (não substituindo) o alerta por e-mail e o botão manual no admin.
- Nenhum teto de tentativas nem retry em loop nesta fase — a Hotmart já reagenda sozinha, e existe o botão manual como rede de segurança. Um teto pode ser adicionado depois se os alertas ficarem ruidosos.

## Webhook de entrega do Resend

Nova rota `app/api/webhook/resend/route.ts`:

- Verifica a assinatura via Svix (novo pacote — é o que o Resend usa pra assinar webhooks), usando um secret novo `RESEND_WEBHOOK_SECRET`.
- Escuta os eventos `email.delivered`, `email.bounced`, `email.complained`.
- Casa o evento com o comprador pelo `resend_email_id`.
- `email.delivered` → `email_entregue_em = now()`, `status_provisionamento = 'email_entregue'`.
- `email.bounced` / `email.complained` → `status_provisionamento = 'falhou'`, `ultimo_erro` com o motivo do Resend, dispara `sendAlertaAdminEmail`. Não tenta reenviar sozinho — bounce geralmente significa e-mail inválido/errado, decisão fica com o admin.

## Painel admin (`app/admin/compradores`)

- Cada linha ganha um botão **"Reenviar acesso"** em destaque, chamando um novo endpoint (`POST /api/admin/compradores/reenviar-acesso`) que usa a função de provisionamento compartilhada em modo "reenvio forçado" (gera senha nova, atualiza Clerk, reenvia e-mail, atualiza status).
- O campo de definir senha manualmente (`/api/admin/compradores/senha`, já existe) continua disponível, mas secundário — pra casos excepcionais onde reenviar e-mail não é o que se quer.
- A linha mostra um badge com o `status_provisionamento` atual (ex: entregue / falhou), com `ultimo_erro` em tooltip — dá visibilidade sem precisar consultar o Supabase direto.

## Script `reenviar-acesso.ts`

Passa a chamar a mesma função compartilhada de `lib/provisionamento.ts` em vez de duplicar a lógica. Continua existindo como via CLI, útil pra reenvio em lote (o botão do admin é um-a-um).

## Teste

Projeto não tem suíte automatizada (nenhuma rota tem testes hoje) — validação manual, seguindo o padrão do projeto:

1. `npm run dev` + payload de teste pro webhook da Hotmart com e-mail real de teste — conferir as colunas de status em cada etapa no Supabase.
2. Usar o endereço de bounce de teste do Resend (`bounce@resend.dev`) pra forçar uma falha e confirmar que `status_provisionamento` vira `falhou` e o alerta chega.
3. Assinar um payload de teste do Svix e bater manualmente na rota `/api/webhook/resend` local.
4. Testar o botão "Reenviar acesso" no admin ponta a ponta contra um comprador de teste.

## Fora de escopo (fase futura)

Migração do primeiro acesso pra link mágico/OTP via Clerk sign-in tokens, eliminando a senha temporária. Fica pra depois, como frente separada.
