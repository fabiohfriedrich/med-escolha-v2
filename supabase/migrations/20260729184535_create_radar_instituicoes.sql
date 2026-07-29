create table public.instituicoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sigla text not null unique,
  uf text,
  site text not null,
  tipo text not null check (tipo = any (array['enare','universidade','hospital','secretaria_saude'])),
  created_at timestamptz not null default now()
);

comment on table public.instituicoes is 'Instituições que promovem processos seletivos de residência médica. Radar de Residência.';
comment on column public.instituicoes.uf is 'Nulo para instituições nacionais (ex: ENARE), que não têm UF única.';

alter table public.instituicoes enable row level security;

create policy "instituicoes_select_public"
  on public.instituicoes for select
  to public
  using (true);
