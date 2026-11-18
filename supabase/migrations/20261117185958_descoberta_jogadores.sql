begin;
create table public.tb_jogador_descoberta (
 id_jogador integer primary key references public.tb_jogador(id_jogador) on delete cascade,
 fl_visivel boolean not null default false,
 nm_publico varchar(80) not null,
 nm_cidade varchar(120) not null,
 nm_uf varchar(2) not null,
 ds_bio varchar(500) not null default '',
 nm_fuso varchar(80) not null,
 dt_validade date not null,
 nr_revisao integer not null default 1 check(nr_revisao>0)
);
create index ix_descoberta_uf on public.tb_jogador_descoberta(nm_uf,dt_validade,id_jogador) where fl_visivel;
create table public.tb_jogador_disponibilidade (
 id_jogador integer not null references public.tb_jogador_descoberta(id_jogador) on delete cascade,
 nr_dia integer not null check(nr_dia between 1 and 7),
 nr_inicio integer not null check(nr_inicio between 0 and 1439),
 nr_fim integer not null check(nr_fim between 1 and 1440 and nr_fim>nr_inicio),
 primary key(id_jogador,nr_dia,nr_inicio)
);
alter table public.tb_jogador_descoberta enable row level security;
alter table public.tb_jogador_disponibilidade enable row level security;
revoke all on public.tb_jogador_descoberta,public.tb_jogador_disponibilidade from public,anon,authenticated;
commit;
