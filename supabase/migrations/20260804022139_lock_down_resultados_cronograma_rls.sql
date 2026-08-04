-- resultados: remove policies públicas (select_own tinha USING(true) -- apesar do nome,
-- liberava SELECT irrestrito pra role public; insert_public tinha WITH CHECK(true)).
-- Igual radar_usuario/alertas_log: sem policy pública, acesso só via service role,
-- com autorização feita na camada Next.js (Clerk).
drop policy if exists "select_own" on public.resultados;
drop policy if exists "insert_public" on public.resultados;

comment on table public.resultados is 'Resultados do teste de compatibilidade. Sem policy pública: acesso só via service role, com autorização feita na camada Next.js (Clerk).';

-- cronograma_itens: remove as 4 policies públicas (SELECT/INSERT/UPDATE/DELETE todas com
-- USING(true)/WITH CHECK(true) pra role public — inclusive DELETE, que a rota Next.js
-- tentava restringir com .eq('custom', true), mas isso não era imposto pelo RLS).
drop policy if exists "select_public" on public.cronograma_itens;
drop policy if exists "insert_public" on public.cronograma_itens;
drop policy if exists "update_public" on public.cronograma_itens;
drop policy if exists "delete_public" on public.cronograma_itens;

comment on table public.cronograma_itens is 'Itens do cronograma pós-teste de cada usuário. Sem policy pública: acesso só via service role, com autorização feita na camada Next.js (Clerk).';
