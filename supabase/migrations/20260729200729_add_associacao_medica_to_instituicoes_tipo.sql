alter table public.instituicoes drop constraint instituicoes_tipo_check;
alter table public.instituicoes add constraint instituicoes_tipo_check
  check (tipo = any (array['enare','universidade','hospital','secretaria_saude','associacao_medica']));

comment on column public.instituicoes.tipo is 'associacao_medica: associação médica que coordena processo seletivo regional unificado (ex: AMRIGS, AMP, AREMG), não é a própria universidade/hospital/secretaria.';
