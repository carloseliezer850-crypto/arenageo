begin;
-- Natural names preserve all existing IDs and avoid inventing historical player selections.
insert into public.tb_nivel_habilidade(nm_nivel_habilidade, ds_descricao, fl_ativo)
values ('Iniciante','Aprendendo os fundamentos.',true),
       ('Intermediário','Pratica e conhece as regras.',true),
       ('Avançado','Experiência consistente na modalidade.',true)
on conflict (nm_nivel_habilidade) do nothing;
alter table public.tb_empresa drop constraint if exists ck_tb_empresa_nm_cnpj;
alter table public.tb_empresa add constraint ck_tb_empresa_nm_cnpj
    check (nm_cnpj ~ '^[A-Z0-9]{12}[0-9]{2}$');
create table if not exists public.tb_idempotencia (
 nm_escopo varchar(100) not null, nm_chave varchar(80) not null,
 nm_hash varchar(64) not null, ds_resposta text not null, dt_expira timestamptz not null,
 primary key(nm_escopo,nm_chave)
);
create index if not exists ix_idempotencia_expira on public.tb_idempotencia(dt_expira);
alter table public.tb_idempotencia enable row level security;
revoke all on public.tb_idempotencia from public;
alter table public.tb_arena add column if not exists nm_status_publicacao varchar(20) not null default 'RASCUNHO'
 check(nm_status_publicacao in ('RASCUNHO','INCOMPLETO','PUBLICADO'));
alter table public.tb_arena add column if not exists nm_fuso varchar(80) not null default 'America/Sao_Paulo';
create table if not exists public.tb_espaco (
 id_espaco bigint generated always as identity primary key,
 id_arena integer not null references public.tb_arena,
 nm_nome varchar(120) not null, fl_coberto boolean not null,
 nm_piso varchar(80), nr_capacidade integer check(nr_capacidade>0),
 nr_largura numeric check(nr_largura>0), nr_comprimento numeric check(nr_comprimento>0)
);
create index if not exists ix_espaco_arena on public.tb_espaco(id_arena);
create table if not exists public.tb_espaco_esporte (
 id_espaco bigint not null references public.tb_espaco on delete cascade,
 id_esporte integer not null references public.tb_esporte,
 primary key(id_espaco,id_esporte)
);
create index if not exists ix_espaco_esporte_esporte on public.tb_espaco_esporte(id_esporte);
create table if not exists public.tb_arena_horario (
 id_arena integer not null references public.tb_arena,
 nr_dia integer not null check(nr_dia between 0 and 6),
 nr_inicio integer not null check(nr_inicio between 0 and 1439),
 nr_fim integer not null check(nr_fim>nr_inicio and nr_fim<=nr_inicio+1440),
 primary key(id_arena,nr_dia,nr_inicio)
);
create table if not exists public.tb_arena_excecao (
 id_arena integer not null references public.tb_arena,
 dt_data date not null, ds_periodos jsonb not null,
 primary key(id_arena,dt_data)
);
alter table public.tb_espaco enable row level security;
alter table public.tb_espaco_esporte enable row level security;
alter table public.tb_arena_horario enable row level security;
alter table public.tb_arena_excecao enable row level security;
revoke all on public.tb_espaco,public.tb_espaco_esporte,public.tb_arena_horario,public.tb_arena_excecao from public;
alter table public.tb_usuario add column if not exists fl_email_verificado boolean not null default false;
alter table public.tb_usuario add column if not exists nr_sessao integer not null default 0;
create table if not exists public.tb_token_conta (
 nm_hash varchar(64) primary key, id_usuario integer not null references public.tb_usuario,
 nm_tipo varchar(20) not null check(nm_tipo in ('VERIFY','RESET')),
 dt_criado timestamptz not null default current_timestamp,
 dt_expira timestamptz not null, dt_usado timestamptz
);
create index if not exists ix_token_usuario on public.tb_token_conta(id_usuario,nm_tipo,dt_criado);
create table if not exists public.tb_midia (
 id_midia uuid primary key, id_usuario integer not null references public.tb_usuario,
 id_arena integer references public.tb_arena, ds_conteudo bytea not null,
 nr_ordem integer not null default 0, dt_criado timestamptz not null default current_timestamp
);
create index if not exists ix_midia_usuario on public.tb_midia(id_usuario);
create index if not exists ix_midia_arena on public.tb_midia(id_arena,nr_ordem);
alter table public.tb_token_conta enable row level security;
alter table public.tb_midia enable row level security;
revoke all on public.tb_token_conta,public.tb_midia from public;
-- The application uses Spring JDBC/JWT, not the Supabase Data API.
-- Explicit roles can inherit Supabase default grants independently of PUBLIC.
do $$ declare role_name text; table_name text; begin
 foreach role_name in array array['anon','authenticated'] loop
  if exists(select 1 from pg_roles where rolname=role_name) then
   foreach table_name in array array['tb_usuario','tb_pessoa','tb_jogador','tb_jogador_esporte','tb_empresa','tb_arena','tb_endereco','tb_esporte','tb_nivel_habilidade','tb_tipo_conta','tb_idempotencia','tb_espaco','tb_espaco_esporte','tb_arena_horario','tb_arena_excecao','tb_token_conta','tb_midia'] loop
    execute format('revoke all on public.%I from %I',table_name,role_name);
   end loop;
  end if;
 end loop;
end $$;
commit;
