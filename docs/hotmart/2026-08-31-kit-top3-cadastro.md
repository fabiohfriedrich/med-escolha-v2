# Cadastro Hotmart: Kit Valide Seu Top 3

Data: 31/08/2026

## Resumo da configuração

- Produto: Kit Valide Seu Top 3 | Med Escolha 2.0
- Formato: Arquivos para baixar
- Cobrança: pagamento único
- Preço: R$ 47
- Moeda: BRL
- Garantia: 7 dias
- Autor: Amo Medicina
- Afiliados: não permitir
- Marketplace: não publicar

## 1. Criar o produto

Na Hotmart:

1. Acesse **Produtos > Meus produtos**.
2. Clique em **+ Criar produto**.
3. Escolha **Arquivos para baixar**.
4. Preencha os campos abaixo.

### Nome do produto

```text
Kit Valide Seu Top 3 | Med Escolha 2.0
```

### Descrição do produto

```text
Você recebeu seu Top 3. Agora precisa descobrir como essas especialidades funcionam fora do papel. O Kit Valide Seu Top 3 reúne um plano de 14 dias, roteiros para conversar com especialistas e residentes, um checklist para observar a rotina e uma matriz preenchível para comparar as três opções com evidências. São cinco materiais práticos em PDF, para preencher no computador ou imprimir. O kit não escolhe por você: ajuda a transformar percepção em uma investigação organizada antes da decisão.
```

### Imagem do produto

Use:

```text
public/products/kit-top3-hotmart-600x600.png
```

### Informações adicionais

- Idioma: Português
- Mercado principal: Brasil
- Categoria: escolha a opção disponível mais próxima de Educação, Carreira ou Desenvolvimento Profissional
- Autor: Amo Medicina

## 2. Adicionar os arquivos

Envie estes dois arquivos:

### Manual de instruções

```text
assets/downloads/kit-top3/00-comece-por-aqui.pdf
```

### Conteúdo completo

```text
assets/downloads/kit-top3/kit-valide-seu-top3.zip
```

O ZIP contém os cinco PDFs. O manual também está dentro do ZIP, mas deve ser enviado separadamente quando a Hotmart solicitar o PDF de instruções.

## 3. Configurar o preço base e a oferta avulsa

Defina:

- Tipo de pagamento: pagamento único
- Moeda: BRL
- Valor: R$ 47,00
- Parcelamento: 1 vez
- Prazo de reembolso: 7 dias

### Nome interno da oferta avulsa

```text
Kit Top 3 | Avulsa | R$ 47
```

### Descrição no checkout

```text
Cinco PDFs preenchíveis para investigar a rotina real, conversar com especialistas e residentes e comparar seu Top 3 com mais clareza.
```

Depois de salvar, copie:

- Código da oferta avulsa
- Link de pagamento da oferta avulsa

## 4. Criar a oferta específica do order bump

Dentro do produto, acesse **Precificação e ofertas** e clique em **Novo preço**.

Preencha:

- Nome deste preço: Kit Top 3 | Order Bump | R$ 47
- Moeda: BRL
- Forma de pagamento: pagamento único
- Valor: R$ 47,00
- Parcelamento: 1 vez

### Descrição da oferta do bump

```text
Oferta complementar do Med Escolha 2.0: plano de 14 dias, roteiros de conversa, checklist de observação e matriz para comparar seu Top 3.
```

Depois de salvar, copie o código dessa segunda oferta. Não use a oferta avulsa no order bump.

## 5. Configurar o order bump no checkout principal

Na Hotmart:

1. Acesse **Ferramentas**.
2. Abra **Aparência da Página de Pagamento**.
3. Selecione o produto principal Med Escolha 2.0.
4. Clique em **Continuar**.
5. Escolha a página de pagamento usada atualmente.
6. Clique em **Editar**.
7. Na lateral, selecione **Order Bump**.
8. Clique em **Selecionar Produto**.
9. Escolha **Kit Valide Seu Top 3 | Med Escolha 2.0**.
10. Selecione a oferta **Kit Top 3 | Order Bump | R$ 47**.
11. Insira o bloco antes do botão final de pagamento, na primeira área adequada disponível.
12. Revise o texto e salve as alterações.
13. Publique a página quando estiver pronto para iniciar o teste.

### Texto principal do order bump

```text
Não pare no resultado. Valide seu Top 3 na rotina real.
```

### Texto de apoio

```text
Leve o guia de 14 dias, os roteiros de conversa com especialistas e residentes, o checklist de observação e a matriz final de decisão.
```

### Chamada da seleção

```text
Sim, quero adicionar o Kit Valide Seu Top 3 por R$ 47.
```

### Versão curta, caso o campo tenha limite

```text
Investigue a rotina real das suas três opções com 5 materiais preenchíveis.
```

## 6. Configurações recomendadas

- Manter o produto fora do Marketplace da Hotmart.
- Não permitir afiliados neste primeiro teste.
- Não usar contador ou falsa escassez.
- Não apresentar o kit como uma decisão automática.
- Manter a garantia em 7 dias.
- Usar o mesmo preço de R$ 47 na oferta avulsa e no bump durante a validação.

## 7. Dados necessários para ativar a integração

Depois de criar o produto e as duas ofertas, registrar:

```text
HOTMART_PRODUCT_ID_KIT_TOP3=
HOTMART_OFFER_CODE_KIT_BUMP=
HOTMART_OFFER_CODE_KIT_AVULSO=
NEXT_PUBLIC_HOTMART_CHECKOUT_KIT_TOP3=
```

Esses identificadores e links não são senhas. Não compartilhar senha da Hotmart, token de webhook ou chave de API.

## 8. Conferência antes de publicar

- O nome mostra Med Escolha 2.0.
- A imagem quadrada está nítida.
- O preço é R$ 47 em ambas as ofertas.
- A oferta selecionada no order bump é a oferta específica do bump.
- A oferta avulsa tem seu próprio link de pagamento.
- O checkout principal não foi substituído por outro checkout.
- O bloco do bump está visível antes da confirmação do pagamento.
- A garantia é de 7 dias.
- Afiliados e Marketplace permanecem desativados.
- Os quatro dados de integração foram copiados.

