-- Dedup de eventos do webhook Hotmart: evita que um reenvio legítimo do mesmo evento
-- (transaction_id + tipo) reprovisione o acesso e resete a senha de um comprador que já
-- tinha recebido a senha temporária (ver auditoria de 18/08/2026, seção de idempotência).
create table public.hotmart_eventos_processados (
  transaction_id text not null,
  event text not null,
  processed_at timestamptz not null default now(),
  primary key (transaction_id, event)
);

alter table public.hotmart_eventos_processados enable row level security;
comment on table public.hotmart_eventos_processados is 'Dedup de eventos do webhook Hotmart. Sem policy pública: acesso só via service role.';
