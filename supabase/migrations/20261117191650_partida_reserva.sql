begin;
alter table public.tb_partida add column id_reserva bigint references public.tb_reserva(id_reserva);
create unique index uq_partida_reserva on public.tb_partida(id_reserva) where id_reserva is not null;
comment on column public.tb_partida.id_reserva is 'Reserva do organizador vinculada explicitamente; cancelamentos dos dois registros são independentes.';
commit;
