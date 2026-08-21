alter table compradores
  add column status_provisionamento text not null default 'pendente',
  add column email_enviado_em timestamptz,
  add column email_entregue_em timestamptz,
  add column ultimo_erro text,
  add column tentativas_provisionamento integer not null default 0,
  add column resend_email_id text;

alter table compradores
  add constraint compradores_status_provisionamento_check
  check (status_provisionamento in ('pendente', 'conta_criada', 'email_enviado', 'email_entregue', 'falhou'));

create index idx_compradores_resend_email_id on compradores (resend_email_id) where resend_email_id is not null;

-- Compradores já ativos e pagos antes desta migração: não sabemos o estado real de
-- entrega, mas presumir "email_entregue" evita que o botão "Reenviar acesso" e o retry
-- automático do webhook tratem a base inteira como pendente de provisionamento.
-- NOTA: essa presunção foi corrigida na migração seguinte (reclamo_atomico_provisionamento) —
-- sem resend_email_id não há evidência real de entrega, os registros afetados por este
-- backfill foram movidos pra um status 'legado' dedicado.
update compradores set status_provisionamento = 'email_entregue' where ativo = true and status_pagamento = 'pago';
