-- compradores: remove policies públicas (insert_service tinha WITH CHECK(true) e update_service
-- tinha USING(true), apesar do nome, liberavam escrita irrestrita pra role public). Mesmo padrão
-- já aplicado em resultados/cronograma_itens em 20260804022139: sem policy pública, acesso só
-- via service role, com autorização feita na camada Next.js (Clerk).
drop policy if exists "insert_service" on public.compradores;
drop policy if exists "update_service" on public.compradores;
revoke insert, update, delete, truncate, trigger, references on public.compradores from anon, authenticated;

comment on table public.compradores is 'Compradores do Med Escolha. Sem policy pública: acesso só via service role, com autorização feita na camada Next.js (Clerk).';

-- incrementar_teste: SECURITY DEFINER sem search_path fixo, executável por anon/authenticated —
-- qualquer um com a chave anônima podia incrementar o contador de testes de qualquer e-mail.
revoke execute on function public.incrementar_teste(text) from public, anon, authenticated;
alter function public.incrementar_teste(text) set search_path = public, pg_temp;
