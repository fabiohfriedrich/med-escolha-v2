create table public.pacotes_psicologo (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nome text,
  hotmart_transaction_id text not null unique,
  sessoes_total int not null default 2,
  sessoes_usadas int not null default 0,
  ativo boolean not null default true,
  status_pagamento text not null default 'pago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessoes_usadas_dentro_do_limite check (sessoes_usadas >= 0 and sessoes_usadas <= sessoes_total)
);

comment on table public.pacotes_psicologo is 'Pacotes de sessões com psicólogo (produto separado do Med Escolha principal, vendido na Hotmart). hotmart_transaction_id garante idempotência do webhook. Sem policy pública: acesso só via service role, autorização na camada Next.js (Clerk).';

create index pacotes_psicologo_email_idx on public.pacotes_psicologo(email);
alter table public.pacotes_psicologo enable row level security;

create table public.agendamentos_psicologo (
  id uuid primary key default gen_random_uuid(),
  cal_booking_uid text not null unique,
  pacote_id uuid references public.pacotes_psicologo(id),
  email text not null,
  status text not null default 'pendente'
    check (status in ('pendente','confirmado','sem_saldo','cancelado')),
  credito_devolvido boolean not null default false,
  event_start_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.agendamentos_psicologo is 'Log de bookings do Cal.com. cal_booking_uid único trava webhooks retentados (evita decrementar 2x o mesmo booking) e guarda qual pacote foi debitado, pra devolver o crédito certo em caso de cancelamento com ≥24h de antecedência. Sem policy pública: acesso só via service role.';

create index agendamentos_psicologo_email_idx on public.agendamentos_psicologo(email);
alter table public.agendamentos_psicologo enable row level security;

-- Incrementa uso de forma atômica, só se ainda houver saldo (evita overshoot em corrida)
create or replace function public.incrementar_sessao_psicologo(p_pacote_id uuid)
returns public.pacotes_psicologo
language sql
as $$
  update public.pacotes_psicologo
  set sessoes_usadas = sessoes_usadas + 1, updated_at = now()
  where id = p_pacote_id and sessoes_usadas < sessoes_total
  returning *;
$$;

-- Devolve 1 sessão ao saldo (cancelamento com ≥24h de antecedência)
create or replace function public.decrementar_sessao_psicologo(p_pacote_id uuid)
returns public.pacotes_psicologo
language sql
as $$
  update public.pacotes_psicologo
  set sessoes_usadas = greatest(sessoes_usadas - 1, 0), updated_at = now()
  where id = p_pacote_id
  returning *;
$$;
