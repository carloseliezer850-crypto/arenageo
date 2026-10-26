-- O cadastro de jogador possui nome de usuário no contrato do frontend.
-- O responsável comercial pode não informar nome de usuário nesta etapa.
begin;

alter table public.tb_pessoa
    add column nm_nome_usuario varchar(30);

alter table public.tb_pessoa
    add constraint ck_tb_pessoa_nm_nome_usuario
    check (nm_nome_usuario is null or length(btrim(nm_nome_usuario)) between 3 and 30);

create unique index uq_tb_pessoa_nm_nome_usuario
    on public.tb_pessoa (lower(btrim(nm_nome_usuario)))
    where nm_nome_usuario is not null;

commit;
