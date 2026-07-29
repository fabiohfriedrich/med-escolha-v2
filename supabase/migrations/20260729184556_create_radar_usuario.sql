create table public.radar_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  especialidade_ids integer[] not null default '{}',
  ufs text[] not null default '{}',
  alertas_ativos boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.radar_usuario is 'Configuração do Radar de Residência pessoal de cada usuário. user_id = Clerk user id. Sem policy pública: acesso só via service role, com autorização feita na camada Next.js (Clerk).';
comment on column public.radar_usuario.user_id is 'Clerk user id (ex: user_xxx), não é FK pois não há tabela de usuários espelhada no Supabase.';

alter table public.radar_usuario enable row level security;
