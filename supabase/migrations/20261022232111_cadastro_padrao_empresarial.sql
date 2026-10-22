-- Migration de cadastro inicial do ArenaGeo.
-- Inicialmente tb_jogador existia como tabela de teste vazia.
-- Esta definição inicial reproduz o formato legado somente para que esta migration
-- também possa ser executada num banco novo; o bloco abaixo padroniza/remodela a tabela.
-- Convenções finais: id_ = identificadores, nm_ = varchar/char, ds_ = textos longos,
-- dt_ = datas/timestamps, nr_ = números e fl_ = booleanos.
-- A senha deve ser armazenada apenas como hash gerado no backend Spring Boot.

begin;

create table if not exists public.tb_jogador (
    id_jogador integer generated always as identity,
    id_equipe integer,
    nm_completo varchar(160) not null,
    dt_nascimento date not null,
    nacionalidade varchar(80) default 'Brasileira',
    genero char(1),
    cpf char(11) not null,
    email varchar(254) not null,
    telefone varchar(20),
    posicao_principal varchar(80),
    numero_camisa integer,
    status_jogador varchar(20) default 'Ativo',
    data_cadastro timestamptz default current_timestamp,
    ultima_atualizacao timestamptz default current_timestamp,
    constraint pk_jogador primary key (id_jogador),
    constraint unq_jogador_cpf unique (cpf),
    constraint unq_jogador_email unique (email),
    constraint chk_genero check (genero = any (array['M'::bpchar, 'F'::bpchar, 'O'::bpchar])),
    constraint chk_status_jogador check (
        status_jogador in ('Ativo', 'Inativo', 'Lesionado', 'Suspenso')
    )
);

create table public.tb_tipo_conta (
    id_tipo_conta integer generated always as identity primary key,
    nm_codigo varchar(30) not null unique,
    nm_tipo_conta varchar(60) not null,
    fl_ativo boolean not null default true,
    dt_cadastro timestamptz not null default current_timestamp,
    constraint ck_tb_tipo_conta_codigo check (nm_codigo = upper(nm_codigo))
);

insert into public.tb_tipo_conta (nm_codigo, nm_tipo_conta)
values ('JOGADOR', 'Jogador'), ('EMPRESA', 'Empresa');

create table public.tb_usuario (
    id_usuario integer generated always as identity primary key,
    id_tipo_conta integer not null references public.tb_tipo_conta(id_tipo_conta),
    nm_email varchar(254) not null,
    nm_senha_hash varchar(255) not null,
    fl_ativo boolean not null default true,
    dt_cadastro timestamptz not null default current_timestamp,
    dt_ultima_atualizacao timestamptz not null default current_timestamp
);

create unique index uq_tb_usuario_nm_email
    on public.tb_usuario (lower(btrim(nm_email)));

create table public.tb_pessoa (
    id_pessoa integer generated always as identity primary key,
    id_usuario integer not null unique
        references public.tb_usuario(id_usuario) on delete cascade,
    nm_completo varchar(160) not null,
    nm_cpf varchar(11) not null unique,
    dt_nascimento date,
    nm_nacionalidade varchar(80) not null default 'Brasileira',
    nm_genero char(1),
    nm_telefone varchar(20),
    nm_url_foto_perfil varchar(500),
    dt_cadastro timestamptz not null default current_timestamp,
    dt_ultima_atualizacao timestamptz not null default current_timestamp,
    constraint ck_tb_pessoa_nm_cpf check (nm_cpf ~ '^[0-9]{11}$'),
    constraint ck_tb_pessoa_nm_genero
        check (nm_genero is null or nm_genero in ('M', 'F', 'O'))
);

-- Migra os nomes de campos legados de tb_jogador para as convenções do projeto.
alter table public.tb_jogador rename column nacionalidade to nm_nacionalidade;
alter table public.tb_jogador rename column genero to nm_genero;
alter table public.tb_jogador rename column cpf to nm_cpf;
alter table public.tb_jogador rename column email to nm_email;
alter table public.tb_jogador rename column telefone to nm_telefone;
alter table public.tb_jogador rename column posicao_principal to nm_posicao_principal;
alter table public.tb_jogador rename column numero_camisa to nr_numero_camisa;
alter table public.tb_jogador rename column status_jogador to nm_status_jogador;
alter table public.tb_jogador rename column data_cadastro to dt_cadastro;
alter table public.tb_jogador rename column ultima_atualizacao to dt_ultima_atualizacao;

-- Dados comuns ficam em tb_pessoa e tb_usuario; tb_jogador é o perfil esportivo.
alter table public.tb_jogador
    drop column nm_completo,
    drop column dt_nascimento,
    drop column nm_nacionalidade,
    drop column nm_genero,
    drop column nm_cpf,
    drop column nm_email,
    drop column nm_telefone;

alter table public.tb_jogador
    add column id_pessoa integer not null
        references public.tb_pessoa(id_pessoa) on delete cascade;

alter table public.tb_jogador
    add constraint uq_tb_jogador_id_pessoa unique (id_pessoa);

alter table public.tb_jogador
    alter column nm_status_jogador set default 'Ativo',
    alter column nm_status_jogador set not null,
    alter column dt_cadastro set default current_timestamp,
    alter column dt_cadastro set not null,
    alter column dt_ultima_atualizacao set default current_timestamp,
    alter column dt_ultima_atualizacao set not null;

create table public.tb_empresa (
    id_empresa integer generated always as identity primary key,
    id_pessoa_responsavel integer not null references public.tb_pessoa(id_pessoa),
    nm_razao_social varchar(180) not null,
    nm_nome_fantasia varchar(180) not null,
    nm_cnpj varchar(14) not null unique,
    nm_inscricao_estadual varchar(30),
    nm_telefone_comercial varchar(20) not null,
    nm_email_comercial varchar(254) not null,
    fl_ativo boolean not null default true,
    dt_cadastro timestamptz not null default current_timestamp,
    dt_ultima_atualizacao timestamptz not null default current_timestamp,
    constraint ck_tb_empresa_nm_cnpj check (nm_cnpj ~ '^[0-9]{14}$')
);

create index idx_tb_empresa_id_pessoa_responsavel
    on public.tb_empresa (id_pessoa_responsavel);

create unique index uq_tb_empresa_nm_email_comercial
    on public.tb_empresa (lower(btrim(nm_email_comercial)));

create table public.tb_arena (
    id_arena integer generated always as identity primary key,
    id_empresa integer not null references public.tb_empresa(id_empresa) on delete cascade,
    nm_nome varchar(160) not null,
    ds_descricao text not null default '',
    nm_url_imagem varchar(500),
    nm_telefone varchar(20) not null,
    nm_email varchar(254) not null,
    nm_website varchar(500),
    nm_instagram varchar(120),
    ds_horario_funcionamento text not null default '',
    fl_ativo boolean not null default true,
    dt_cadastro timestamptz not null default current_timestamp,
    dt_ultima_atualizacao timestamptz not null default current_timestamp
);

create index idx_tb_arena_id_empresa on public.tb_arena (id_empresa);

create table public.tb_endereco (
    id_endereco integer generated always as identity primary key,
    id_pessoa integer references public.tb_pessoa(id_pessoa) on delete cascade,
    id_empresa integer references public.tb_empresa(id_empresa) on delete cascade,
    id_arena integer references public.tb_arena(id_arena) on delete cascade,
    nm_tipo_endereco varchar(20) not null default 'PRINCIPAL',
    nm_cep varchar(8),
    nm_uf char(2),
    nm_cidade varchar(120) not null,
    nm_bairro varchar(120),
    nm_logradouro varchar(160),
    nm_numero varchar(20),
    nm_complemento varchar(120),
    nr_latitude numeric(9,6),
    nr_longitude numeric(9,6),
    fl_principal boolean not null default false,
    dt_cadastro timestamptz not null default current_timestamp,
    dt_ultima_atualizacao timestamptz not null default current_timestamp,
    constraint ck_tb_endereco_dono
        check (num_nonnulls(id_pessoa, id_empresa, id_arena) = 1),
    constraint ck_tb_endereco_tipo
        check (nm_tipo_endereco in ('PRINCIPAL', 'RESIDENCIAL', 'COMERCIAL', 'ARENA')),
    constraint ck_tb_endereco_nm_cep
        check (nm_cep is null or nm_cep ~ '^[0-9]{8}$'),
    constraint ck_tb_endereco_nm_uf
        check (nm_uf is null or nm_uf ~ '^[A-Z]{2}$'),
    constraint ck_tb_endereco_latitude
        check (nr_latitude is null or nr_latitude between -90 and 90),
    constraint ck_tb_endereco_longitude
        check (nr_longitude is null or nr_longitude between -180 and 180),
    constraint ck_tb_endereco_coordenadas
        check ((nr_latitude is null and nr_longitude is null)
            or (nr_latitude is not null and nr_longitude is not null))
);

create index idx_tb_endereco_id_pessoa on public.tb_endereco (id_pessoa);
create index idx_tb_endereco_id_empresa on public.tb_endereco (id_empresa);
create index idx_tb_endereco_id_arena on public.tb_endereco (id_arena);

create unique index uq_tb_endereco_pessoa_principal
    on public.tb_endereco (id_pessoa)
    where id_pessoa is not null and fl_principal;

create unique index uq_tb_endereco_empresa_principal
    on public.tb_endereco (id_empresa)
    where id_empresa is not null and fl_principal;

create unique index uq_tb_endereco_arena_principal
    on public.tb_endereco (id_arena)
    where id_arena is not null and fl_principal;

create table public.tb_esporte (
    id_esporte integer generated always as identity primary key,
    nm_esporte varchar(80) not null unique,
    nm_slug varchar(100) not null unique,
    fl_ativo boolean not null default true,
    dt_cadastro timestamptz not null default current_timestamp
);

insert into public.tb_esporte (nm_esporte, nm_slug)
values
    ('Futebol', 'futebol'),
    ('Futsal', 'futsal'),
    ('Beach Tennis', 'beach-tennis'),
    ('Tênis', 'tenis'),
    ('Vôlei', 'volei');

create table public.tb_nivel_habilidade (
    id_nivel_habilidade integer generated always as identity primary key,
    nm_nivel_habilidade varchar(80) not null unique,
    ds_descricao text not null default '',
    fl_ativo boolean not null default true,
    dt_cadastro timestamptz not null default current_timestamp
);

create table public.tb_jogador_esporte (
    id_jogador integer not null references public.tb_jogador(id_jogador) on delete cascade,
    id_esporte integer not null references public.tb_esporte(id_esporte),
    id_nivel_habilidade integer references public.tb_nivel_habilidade(id_nivel_habilidade),
    dt_cadastro timestamptz not null default current_timestamp,
    constraint pk_tb_jogador_esporte primary key (id_jogador, id_esporte)
);

create index idx_tb_jogador_esporte_id_esporte
    on public.tb_jogador_esporte (id_esporte);

create index idx_tb_jogador_esporte_id_nivel_habilidade
    on public.tb_jogador_esporte (id_nivel_habilidade);

create or replace function public.fn_atualizar_dt_ultima_atualizacao()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
    new.dt_ultima_atualizacao := pg_catalog.now();
    return new;
end;
$$;

revoke all on function public.fn_atualizar_dt_ultima_atualizacao() from public;

create trigger trg_tb_usuario_dt_ultima_atualizacao
before update on public.tb_usuario
for each row execute function public.fn_atualizar_dt_ultima_atualizacao();

create trigger trg_tb_pessoa_dt_ultima_atualizacao
before update on public.tb_pessoa
for each row execute function public.fn_atualizar_dt_ultima_atualizacao();

create trigger trg_tb_jogador_dt_ultima_atualizacao
before update on public.tb_jogador
for each row execute function public.fn_atualizar_dt_ultima_atualizacao();

create trigger trg_tb_empresa_dt_ultima_atualizacao
before update on public.tb_empresa
for each row execute function public.fn_atualizar_dt_ultima_atualizacao();

create trigger trg_tb_arena_dt_ultima_atualizacao
before update on public.tb_arena
for each row execute function public.fn_atualizar_dt_ultima_atualizacao();

create trigger trg_tb_endereco_dt_ultima_atualizacao
before update on public.tb_endereco
for each row execute function public.fn_atualizar_dt_ultima_atualizacao();

alter table public.tb_tipo_conta enable row level security;
alter table public.tb_usuario enable row level security;
alter table public.tb_pessoa enable row level security;
alter table public.tb_jogador enable row level security;
alter table public.tb_empresa enable row level security;
alter table public.tb_arena enable row level security;
alter table public.tb_endereco enable row level security;
alter table public.tb_esporte enable row level security;
alter table public.tb_nivel_habilidade enable row level security;
alter table public.tb_jogador_esporte enable row level security;

comment on table public.tb_usuario is
    'Conta de acesso; nm_senha_hash deve conter exclusivamente hash gerado pelo backend.';
comment on table public.tb_pessoa is
    'Dados cadastrais pessoais compartilhados entre jogador e responsável comercial.';
comment on table public.tb_jogador is
    'Perfil esportivo associado a uma pessoa cadastrada.';
comment on table public.tb_endereco is
    'Endereço pertencente a uma pessoa, empresa ou arena.';

commit;
