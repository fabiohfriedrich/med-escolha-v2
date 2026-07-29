create table public.editais (
  id uuid primary key default gen_random_uuid(),
  instituicao_id uuid not null references public.instituicoes(id) on delete cascade,
  temporada text not null,
  status text not null default 'previsto' check (status = any (array['previsto','aberto','encerrado'])),
  link_oficial text,
  inscricao_inicio date,
  inscricao_fim date,
  taxa numeric,
  data_prova date,
  data_resultado date,
  observacoes text,
  atualizado_em timestamptz not null default now()
);

comment on table public.editais is 'Edital de um processo seletivo de residência médica de uma instituição, por temporada. Radar de Residência.';
comment on column public.editais.temporada is 'Ex: "2026/2027"';
comment on column public.editais.observacoes is 'Usar "EXEMPLO DE DESENVOLVIMENTO" para editais fictícios de teste em dev.';

create index editais_instituicao_id_idx on public.editais(instituicao_id);
create index editais_status_idx on public.editais(status);

alter table public.editais enable row level security;

create policy "editais_select_public"
  on public.editais for select
  to public
  using (true);
