begin;
create table public.tb_partida (
 id_partida bigint generated always as identity primary key,
 id_organizador integer not null references public.tb_usuario,
 id_esporte integer not null references public.tb_esporte,
 id_nivel_habilidade integer not null references public.tb_nivel_habilidade,
 nm_titulo varchar(120) not null check(length(trim(nm_titulo)) between 5 and 120),
 ds_descricao varchar(3000) not null default '',
 nm_local varchar(200) not null, nm_cidade varchar(120) not null, nm_uf char(2) not null,
 dt_inicio timestamptz not null, dt_fim timestamptz not null check(dt_fim>dt_inicio),
 nm_fuso varchar(80) not null,
 nr_capacidade integer not null check(nr_capacidade between 2 and 100),
 nm_status varchar(20) not null check(nm_status in ('RASCUNHO','PUBLICADA','CANCELADA','CONCLUIDA')),
 ds_motivo varchar(500), dt_criado timestamptz not null default current_timestamp,
 nr_versao integer not null default 0
);
create index ix_partida_busca on public.tb_partida(nm_status,dt_inicio,id_partida);
create index ix_partida_organizador on public.tb_partida(id_organizador,dt_inicio);
create index ix_partida_esporte on public.tb_partida(id_esporte);
create index ix_partida_nivel on public.tb_partida(id_nivel_habilidade);
create table public.tb_partida_participante (
 id_partida bigint not null references public.tb_partida,
 id_usuario integer not null references public.tb_usuario,
 nm_status varchar(20) not null check(nm_status in ('CONFIRMADA','LISTA_ESPERA','CANCELADA')),
 dt_entrada timestamptz not null default clock_timestamp(),
 primary key(id_partida,id_usuario)
);
create index ix_participante_usuario on public.tb_partida_participante(id_usuario,id_partida);
create index ix_participante_fila on public.tb_partida_participante(id_partida,nm_status,dt_entrada,id_usuario);
alter table public.tb_partida enable row level security;
alter table public.tb_partida_participante enable row level security;
revoke all on public.tb_partida,public.tb_partida_participante from public,anon,authenticated;
commit;
