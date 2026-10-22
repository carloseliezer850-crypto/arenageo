-- Mantem em tb_jogador somente os campos necessários ao cadastro inicial.
-- Dados de equipe, posição, camisa e status esportivo são de módulos futuros.

begin;

alter table public.tb_jogador
    drop column id_equipe,
    drop column nm_posicao_principal,
    drop column nr_numero_camisa,
    drop column nm_status_jogador;

alter table public.tb_jogador
    add column fl_ativo boolean not null default true;

create index idx_tb_usuario_id_tipo_conta
    on public.tb_usuario (id_tipo_conta);

commit;
