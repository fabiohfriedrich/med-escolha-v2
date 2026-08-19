-- Versiona o resultado com a versão do algoritmo usada pra calculá-lo, permitindo distinguir
-- resultados gerados com o score v1 (viés estrutural, ver auditoria de 18/08/2026) dos
-- gerados com o score v2 (corrigido) e reprocessar/comunicar depois de forma seletiva.
alter table public.resultados add column if not exists scoring_version smallint not null default 1;
