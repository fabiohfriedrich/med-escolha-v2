alter table public.editais
  add column etapas integer check (etapas is null or etapas >= 1),
  add column data_gabarito date;

comment on column public.editais.etapas is 'Quantidade de etapas do processo seletivo (ex: prova objetiva + prática + entrevista = 3).';
comment on column public.editais.data_gabarito is 'Data de divulgação do gabarito, separada da data_resultado (o resultado final costuma sair depois).';
