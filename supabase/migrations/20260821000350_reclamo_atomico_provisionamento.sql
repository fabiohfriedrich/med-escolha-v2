-- Corrige dois problemas apontados em revisão do rastreamento de provisionamento (20260820233445):
-- 1. O backfill original marcou todos os compradores ativos/pagos como 'email_entregue' sem
--    nenhuma evidência real do Resend (resend_email_id, email_enviado_em, email_entregue_em
--    todos nulos) — o painel mostrava "Entregue" pra quem nunca teve entrega confirmada.
-- 2. A checagem de idempotência (ler status, decidir, escrever) não era atômica: duas chamadas
--    concorrentes (ex: PURCHASE_APPROVED e PURCHASE_COMPLETE da mesma transação chegando quase
--    juntos) podiam gerar duas senhas e dois e-mails pro mesmo comprador.

alter table compradores drop constraint compradores_status_provisionamento_check;
alter table compradores add constraint compradores_status_provisionamento_check
  check (status_provisionamento in ('pendente', 'processando', 'conta_criada', 'email_enviado', 'email_entregue', 'falhou', 'legado'));

alter table compradores add column provisionamento_atualizado_em timestamptz;

-- Corrige o backfill: sem resend_email_id, não há evidência real de entrega. 'legado' deixa
-- claro no admin que é presunção (comprador ativo antes da instrumentação), não confirmação.
update compradores
set status_provisionamento = 'legado'
where status_provisionamento = 'email_entregue' and resend_email_id is null;

-- Função de reclamo atômico: só uma chamada concorrente consegue mover a linha pra
-- 'processando' por vez. 'processando' parado por mais de 5 minutos é considerado abandonado
-- (função serverless morta no meio, sem chance de cair no catch) e pode ser reclamado de novo —
-- evita tanto a corrida quanto um travamento permanente em 'processando'.
create or replace function reclamar_provisionamento(p_email text, p_forcar boolean default false)
returns table(reclamado boolean, ja_existia boolean, tentativa_atual integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row compradores%rowtype;
begin
  update compradores
  set status_provisionamento = 'processando',
      provisionamento_atualizado_em = now(),
      tentativas_provisionamento = tentativas_provisionamento + 1
  where email = p_email
    and (
      p_forcar
      or status_provisionamento in ('pendente', 'falhou')
      -- 'processando'/'conta_criada' parado há mais de 5 minutos é considerado abandonado
      -- (função serverless morta no meio, sem chance de cair no catch) — reclamável de novo.
      or (status_provisionamento in ('processando', 'conta_criada') and provisionamento_atualizado_em < now() - interval '5 minutes')
    )
  returning * into v_row;

  if found then
    return query select true, true, v_row.tentativas_provisionamento;
    return;
  end if;

  select * into v_row from compradores where email = p_email;
  if not found then
    return query select true, false, 1;
    return;
  end if;

  return query select false, true, v_row.tentativas_provisionamento;
end;
$$;
