begin;
create extension if not exists btree_gist;
create table public.tb_espaco_reserva_config (
 id_espaco bigint primary key references public.tb_espaco,
 fl_online boolean not null default false,
 nr_preco_hora_centavos integer not null check(nr_preco_hora_centavos between 1 and 10000000),
 nr_minutos integer not null check(nr_minutos between 30 and 240 and nr_minutos%15=0),
 nr_preparo integer not null check(nr_preparo between 0 and 120),
 nr_cancelamento_horas integer not null check(nr_cancelamento_horas between 0 and 720),
 ds_politica varchar(1000) not null check(length(trim(ds_politica))>=10),
 nr_versao integer not null default 0
);
create table public.tb_reserva_orcamento (
 id_orcamento uuid primary key,
 id_usuario integer not null references public.tb_usuario,
 id_espaco bigint not null references public.tb_espaco,
 nr_versao integer not null,
 dt_inicio timestamptz not null, dt_fim timestamptz not null check(dt_fim>dt_inicio),
 dt_expira timestamptz not null,
 nr_total_centavos integer not null check(nr_total_centavos>0),
 nr_preparo integer not null,
 nr_cancelamento_horas integer not null,
 ds_politica varchar(1000) not null,
 nm_fuso varchar(80) not null
);
create index ix_orcamento_usuario on public.tb_reserva_orcamento(id_usuario);
create index ix_orcamento_espaco on public.tb_reserva_orcamento(id_espaco);
create table public.tb_reserva (
 id_reserva bigint generated always as identity primary key,
 id_espaco bigint not null references public.tb_espaco,
 id_usuario integer references public.tb_usuario,
 id_autor integer not null references public.tb_usuario,
 id_orcamento uuid unique references public.tb_reserva_orcamento,
 nm_tipo varchar(15) not null check(nm_tipo in ('RESERVA','BLOQUEIO')),
 nm_status varchar(20) not null default 'CONFIRMADA' check(nm_status in ('CONFIRMADA','CANCELADA','CONCLUIDA','NAO_COMPARECEU')),
 dt_inicio timestamptz not null, dt_fim timestamptz not null check(dt_fim>dt_inicio),
 dt_fim_bloqueio timestamptz not null check(dt_fim_bloqueio>=dt_fim),
 nm_fuso varchar(80) not null,
 nr_total_centavos integer not null check(nr_total_centavos>=0),
 nr_cancelamento_horas integer not null,
 ds_politica varchar(1000) not null,
 nm_pagamento varchar(20) not null check(nm_pagamento in ('PENDENTE_LOCAL','RECEBIDO_LOCAL','NAO_APLICAVEL')),
 ds_motivo varchar(500), dt_checkin timestamptz,
 nr_versao integer not null default 0,
 dt_criado timestamptz not null default current_timestamp,
 check((nm_tipo='RESERVA' and id_usuario is not null and id_orcamento is not null and nr_total_centavos>0) or (nm_tipo='BLOQUEIO' and id_usuario is null and nr_total_centavos=0)),
 constraint ex_reserva_sobreposicao exclude using gist (id_espaco with =, tstzrange(dt_inicio,dt_fim_bloqueio,'[)') with &&) where(nm_status<>'CANCELADA')
);
create index ix_reserva_usuario on public.tb_reserva(id_usuario,dt_inicio);
create index ix_reserva_autor on public.tb_reserva(id_autor);
create table public.tb_reserva_evento (
 id_evento bigint generated always as identity primary key,
 id_reserva bigint not null references public.tb_reserva,
 id_autor integer not null references public.tb_usuario,
 nm_acao varchar(30) not null,
 ds_motivo varchar(500), dt_criado timestamptz not null default current_timestamp
);
create index ix_reserva_evento_reserva on public.tb_reserva_evento(id_reserva,id_evento);
create index ix_reserva_evento_autor on public.tb_reserva_evento(id_autor);
alter table public.tb_espaco_reserva_config enable row level security;
alter table public.tb_reserva_orcamento enable row level security;
alter table public.tb_reserva enable row level security;
alter table public.tb_reserva_evento enable row level security;
revoke all on public.tb_espaco_reserva_config,public.tb_reserva_orcamento,public.tb_reserva,public.tb_reserva_evento from public,anon,authenticated;
revoke all on sequence public.tb_reserva_id_reserva_seq,public.tb_reserva_evento_id_evento_seq from public,anon,authenticated;
commit;
