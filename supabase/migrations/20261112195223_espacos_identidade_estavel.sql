begin;
-- Additive: preserve physical spaces and their historical foreign keys.
alter table public.tb_espaco add column if not exists fl_ativo boolean not null default true;
comment on column public.tb_espaco.fl_ativo is 'Inactive spaces retain identity and history; omitted from active management lists.';
commit;
