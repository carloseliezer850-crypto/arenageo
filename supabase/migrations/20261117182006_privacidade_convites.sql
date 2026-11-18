begin;
create table public.tb_convite_preferencia (
 id_usuario integer primary key references public.tb_usuario(id_usuario) on delete cascade,
 fl_receber boolean not null default true
);
create table public.tb_convite_bloqueio (
 id_usuario integer not null references public.tb_usuario(id_usuario) on delete cascade,
 id_bloqueado integer not null references public.tb_usuario(id_usuario) on delete cascade,
 primary key(id_usuario,id_bloqueado),
 check(id_usuario<>id_bloqueado)
);
create index ix_convite_bloqueio_remetente on public.tb_convite_bloqueio(id_bloqueado);
alter table public.tb_convite_preferencia enable row level security;
alter table public.tb_convite_bloqueio enable row level security;
revoke all on public.tb_convite_preferencia,public.tb_convite_bloqueio from public,anon,authenticated;
commit;
