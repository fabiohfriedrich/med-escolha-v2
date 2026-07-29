create table public.edital_vagas (
  id uuid primary key default gen_random_uuid(),
  edital_id uuid not null references public.editais(id) on delete cascade,
  especialidade_id integer not null references public.especialidades(id) on delete restrict,
  vagas integer check (vagas is null or vagas >= 0),
  acesso_direto boolean not null default false
);

comment on table public.edital_vagas is 'Vagas por especialidade dentro de um edital. Radar de Residência.';
comment on column public.edital_vagas.vagas is 'Nulo até o número oficial de vagas ser publicado.';

create index edital_vagas_edital_id_idx on public.edital_vagas(edital_id);
create index edital_vagas_especialidade_id_idx on public.edital_vagas(especialidade_id);

alter table public.edital_vagas enable row level security;

create policy "edital_vagas_select_public"
  on public.edital_vagas for select
  to public
  using (true);
