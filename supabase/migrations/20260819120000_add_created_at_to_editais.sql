-- Incidente de 19/08/2026: alertaNovoEditalDevido() considerava "devido" qualquer edital não
-- encerrado, sem janela de tempo. Enquanto o Resend esteve quebrado, toda tentativa de envio
-- falhava e a reserva em alertas_log era desfeita — então nada nunca ficava marcado como
-- enviado. Quando o Resend voltou, o cron encontrou o catálogo inteiro "pendente" de uma vez
-- e mandou 784 alertas pra 24 usuários em ~3 minutos (até 38 pra uma única pessoa).
--
-- editais não tinha coluna de criação. Adiciona created_at, preenchendo os registros já
-- existentes com atualizado_em (sempre no passado) em vez de now(), pra não fazer o catálogo
-- inteiro parecer "novo" de novo assim que essa coluna existir.
alter table public.editais add column created_at timestamptz;
update public.editais set created_at = atualizado_em where created_at is null;
alter table public.editais alter column created_at set default now();
alter table public.editais alter column created_at set not null;
