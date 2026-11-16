begin;
create table public.tb_quadro_compartilhamento (
 id_quadro uuid primary key references public.tb_quadro_tatico(id_quadro) on delete cascade,
 nm_token_hash varchar(64) not null unique check (nm_token_hash ~ '^[0-9a-f]{64}$'),
 nm_titulo varchar(120) not null,
 ds_documento jsonb not null,
 nr_revisao integer not null check (nr_revisao >= 0),
 fl_nomes boolean not null default false,
 dt_expira timestamptz not null
);
alter table public.tb_quadro_compartilhamento enable row level security;
revoke all on public.tb_quadro_compartilhamento from public,anon,authenticated;
commit;
