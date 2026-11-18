begin;
alter table public.tb_partida add column fl_aprovacao boolean not null default false;
alter table public.tb_partida_participante drop constraint tb_partida_participante_nm_status_check;
alter table public.tb_partida_participante add constraint tb_partida_participante_nm_status_check check(nm_status in ('SOLICITADA','CONFIRMADA','LISTA_ESPERA','RECUSADA','CANCELADA'));
alter table public.tb_partida_participante add column nr_revisao integer not null default 0 check(nr_revisao>=0);
alter table public.tb_partida_participante add column id_decisor integer references public.tb_usuario(id_usuario);
alter table public.tb_partida_participante add column dt_decisao timestamptz;
create index ix_participante_decisor on public.tb_partida_participante(id_decisor) where id_decisor is not null;
commit;
