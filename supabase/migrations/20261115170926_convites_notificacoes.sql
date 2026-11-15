begin;
create table public.tb_notificacao (
 id_notificacao bigint generated always as identity primary key,
 id_usuario integer not null references public.tb_usuario,
 nm_evento varchar(160) not null,
 nm_titulo varchar(160) not null,
 ds_mensagem varchar(1000) not null,
 nm_destino varchar(160) not null check(nm_destino ~ '^/(partidas|reservas)/[0-9]+$'),
 fl_lida boolean not null default false,
 dt_criado timestamptz not null default current_timestamp,
 unique(id_usuario,nm_evento)
);
create index ix_notificacao_usuario on public.tb_notificacao(id_usuario,id_notificacao desc);
create index ix_notificacao_nao_lida on public.tb_notificacao(id_usuario) where not fl_lida;
create table public.tb_partida_convite (
 id_convite bigint generated always as identity primary key,
 id_partida bigint not null references public.tb_partida,
 id_destinatario integer not null references public.tb_usuario,
 nm_status varchar(20) not null default 'PENDENTE' check(nm_status in ('PENDENTE','ACEITO','RECUSADO','REVOGADO')),
 dt_criado timestamptz not null default current_timestamp,
 dt_resposta timestamptz,
 unique(id_partida,id_destinatario)
);
create index ix_convite_destinatario on public.tb_partida_convite(id_destinatario,id_convite desc);
alter table public.tb_notificacao enable row level security;
alter table public.tb_partida_convite enable row level security;
revoke all on public.tb_notificacao,public.tb_partida_convite from public,anon,authenticated;
revoke all on sequence public.tb_notificacao_id_notificacao_seq,public.tb_partida_convite_id_convite_seq from public,anon,authenticated;
commit;
