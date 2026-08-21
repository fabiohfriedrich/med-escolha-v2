-- CRÍTICO: reclamar_provisionamento() foi criada SECURITY DEFINER sem revogar o EXECUTE que o
-- Postgres concede a PUBLIC por padrão em função nova — anon/authenticated conseguiam chamar
-- via /rest/v1/rpc/reclamar_provisionamento (confirmado pelo advisor 0028/0029 do Supabase):
-- consultar se um e-mail existe em compradores, travar o provisionamento de qualquer comprador
-- em 'processando', ou com p_forcar=true sobrescrever até 'legado'/'email_entregue'.
--
-- Aproveitando a recriação da função: generaliza pra também cobrir pacotes_psicologo (compradores
-- exclusivos do pacote de psicólogo não têm linha em `compradores`, então antes ficavam sem
-- nenhum rastreamento atômico real — duas chamadas concorrentes podiam provisionar duas vezes).

alter table pacotes_psicologo
  add column status_provisionamento text not null default 'pendente',
  add column provisionamento_atualizado_em timestamptz,
  add column email_enviado_em timestamptz,
  add column email_entregue_em timestamptz,
  add column ultimo_erro text,
  add column tentativas_provisionamento integer not null default 0,
  add column resend_email_id text;

alter table pacotes_psicologo add constraint pacotes_psicologo_status_provisionamento_check
  check (status_provisionamento in ('pendente', 'processando', 'conta_criada', 'email_enviado', 'email_entregue', 'falhou', 'legado'));

create index idx_pacotes_psicologo_resend_email_id on pacotes_psicologo (resend_email_id) where resend_email_id is not null;

drop function reclamar_provisionamento(text, boolean);

create function reclamar_provisionamento(p_email text, p_forcar boolean default false, p_tabela text default 'compradores')
returns table(reclamado boolean, ja_existia boolean, tentativa_atual integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tentativas integer;
begin
  if p_tabela not in ('compradores', 'pacotes_psicologo') then
    raise exception 'tabela inválida para reclamar_provisionamento: %', p_tabela;
  end if;

  execute format(
    'update %I
     set status_provisionamento = ''processando'', provisionamento_atualizado_em = now(), tentativas_provisionamento = tentativas_provisionamento + 1
     where email = $1
       and ($2
         or status_provisionamento in (''pendente'', ''falhou'')
         or (status_provisionamento in (''processando'', ''conta_criada'') and provisionamento_atualizado_em < now() - interval ''5 minutes''))
     returning tentativas_provisionamento',
    p_tabela
  ) into v_tentativas using p_email, p_forcar;

  if v_tentativas is not null then
    return query select true, true, v_tentativas;
    return;
  end if;

  execute format('select tentativas_provisionamento from %I where email = $1', p_tabela) into v_tentativas using p_email;

  if v_tentativas is null then
    return query select true, false, 1;
    return;
  end if;

  return query select false, true, v_tentativas;
end;
$$;

-- security invoker + só service_role: a rota que chama isso já usa a service role key
-- (getSupabaseAdmin), que ignora RLS de qualquer forma — não precisa (e não deve) rodar com
-- privilégio elevado de dono de função nem ser alcançável por anon/authenticated.
revoke all on function reclamar_provisionamento(text, boolean, text) from public, anon, authenticated;
grant execute on function reclamar_provisionamento(text, boolean, text) to service_role;
