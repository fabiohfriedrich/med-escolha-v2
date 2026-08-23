# Plano de implementação: otimização CRO da landing

## Objetivo

Implementar a especificação `2026-08-22-otimizacao-cro-landing-clarity-design.md` em uma branch isolada, validar o preview e abrir uma PR sem alterar produção.

## Etapa 1: corrigir a taxonomia de eventos

Arquivos:

- `lib/ad-tracking.ts`
- `components/MedEscolhaLandingPage.tsx`

Ações:

1. Fazer `trackCtaClick` registrar `cta_informativa_clicada` com origem, destino e tipo.
2. Enriquecer `trackCheckoutIntent` sem alterar o nome `compra_iniciada`.
3. Adicionar `trackComparatorOpen` para os links que levam a `/comparar`.
4. Confirmar que Meta e GA4 são disparados somente por `trackCheckoutIntent`.

## Etapa 2: alinhar os CTAs de alta intenção

Arquivo:

- `components/MedEscolhaLandingPage.tsx`

Ações:

1. Trocar os destinos de `mecanismo`, `plano-pos-resultado` e `preco` de `#checkout` para `checkoutUrl`.
2. Abrir a Hotmart em nova aba com os atributos de segurança existentes.
3. Manter o CTA `saiba mais` como âncora informativa.
4. Instrumentar os três links do comparador por origem.

## Etapa 3: otimizar as imagens fotográficas

Arquivos:

- `components/MedEscolhaLandingPage.tsx`
- `components/MedEscolhaLanding.module.css`

Ações:

1. Usar imports estáticos e `next/image` nas fotografias do hero, problema, benefícios, depoimentos e CTA final.
2. Usar `preload` somente na imagem principal, conforme o Next.js 16.2.7.
3. Definir `sizes` para cada contexto responsivo.
4. Manter o carregamento tardio padrão nas imagens abaixo da dobra.
5. Preservar proporções, recortes e estilos atuais.

## Etapa 4: reduzir falsa affordance

Arquivos:

- `components/MedEscolhaLandingPage.tsx`
- `components/MedEscolhaLanding.module.css`

Ações:

1. Renomear o selo do hero para deixar claro que o ranking é uma prévia.
2. Reduzir visual de botão, sombra e contraste excessivo do selo.
3. Manter o card como conteúdo estático.

## Etapa 5: revisão e validação

1. Rodar `npm run lint`.
2. Rodar `npm run build`.
3. Revisar o diff com o checklist de React e Next.js.
4. Verificar ausência de travessão e mudanças públicas fora do escopo.
5. Rodar a aplicação local e validar desktop e mobile.
6. Testar destinos de CTA, indicação, eventos e barra fixa.
7. Criar commits de implementação.
8. Enviar a branch, abrir PR e validar o preview da Vercel.
