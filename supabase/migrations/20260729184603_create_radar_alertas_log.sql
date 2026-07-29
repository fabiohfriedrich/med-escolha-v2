create table public.alertas_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  edital_id uuid not null references public.editais(id) on delete cascade,
  tipo_alerta text not null check (tipo_alerta = any (array['novo_edital','inscricao_abriu','ultimos_dias','vespera_prova'])),
  enviado_em timestamptz not null default now(),
  unique (user_id, edital_id, tipo_alerta)
);

comment on table public.alertas_log is 'Log de alertas de e-mail já enviados pelo Radar de Residência, para nunca duplicar. Sem policy pública: acesso só via service role (cron de alertas).';

create index alertas_log_user_id_idx on public.alertas_log(user_id);
create index alertas_log_edital_id_idx on public.alertas_log(edital_id);

alter table public.alertas_log enable row level security;
