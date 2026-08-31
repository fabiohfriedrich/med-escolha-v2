create table public.acessos_produtos_digitais (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  produto_slug text not null,
  hotmart_product_id text not null,
  hotmart_offer_code text,
  hotmart_transaction_id text not null unique,
  origem text not null default 'desconhecida',
  valor_bruto numeric(12, 2),
  moeda text not null default 'BRL',
  ativo boolean not null default true,
  status_pagamento text not null default 'pago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint acessos_produtos_digitais_email_normalizado_check
    check (email = lower(trim(email)) and email <> ''),
  constraint acessos_produtos_digitais_produto_slug_check
    check (produto_slug <> ''),
  constraint acessos_produtos_digitais_origem_check
    check (origem in ('bump', 'avulsa', 'desconhecida')),
  constraint acessos_produtos_digitais_status_pagamento_check
    check (status_pagamento in ('pago', 'reembolsado', 'chargeback', 'cancelado')),
  constraint acessos_produtos_digitais_moeda_check
    check (moeda ~ '^[A-Z]{3}$')
);

create index idx_acessos_produtos_digitais_email_produto
  on public.acessos_produtos_digitais (email, produto_slug);

alter table public.acessos_produtos_digitais enable row level security;

revoke all on table public.acessos_produtos_digitais from anon, authenticated;
grant select, insert, update, delete on table public.acessos_produtos_digitais to service_role;

comment on table public.acessos_produtos_digitais is
  'Direitos de acesso por transação para produtos digitais adicionais. Sem policy pública: acesso apenas pela service role após autorização no servidor.';
