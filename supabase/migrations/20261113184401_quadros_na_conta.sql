begin;
create table public.tb_quadro_tatico (
 id_quadro uuid primary key,
 id_usuario integer not null references public.tb_usuario,
 nm_titulo varchar(120) not null check(length(trim(nm_titulo))>0),
 ds_documento jsonb not null check(jsonb_typeof(ds_documento)='object' and octet_length(ds_documento::text)<=1048576),
 nr_revisao integer not null default 0,
 fl_arquivado boolean not null default false,
 dt_atualizado timestamptz not null default current_timestamp
);
create index ix_quadro_usuario on public.tb_quadro_tatico(id_usuario,fl_arquivado,dt_atualizado desc);
alter table public.tb_quadro_tatico enable row level security;
revoke all on public.tb_quadro_tatico from public,anon,authenticated;
commit;
