# ArenaGeo Backend

API Spring Boot para o fluxo de cadastro do frontend Next.js/TypeScript. Os contratos JSON correspondem a `src/types/autenticacao.ts` e as rotas em `src/routes/rotasApi.ts`.

## Tecnologias

- Java 21 e Spring Boot 4.1.1
- Spring MVC, Bean Validation, Spring Data JPA e Spring Security
- PostgreSQL/Supabase
- BCrypt para hashes de senha e JWT assinado para a sessão

## Executar localmente

1. Instale JDK 21 e Maven 3.6.3 ou superior.
2. Copie `.env.example` para suas variáveis de ambiente locais.
3. Configure a URL JDBC do PostgreSQL do Supabase, usuário e senha do **banco de dados**. Use SSL. Não use a chave `service_role` da API Supabase como senha JDBC nem exponha segredos no frontend.
4. Gere a chave JWT com `openssl rand -base64 32` e defina-a em `JWT_SECRET_BASE64`.
5. Execute:

```bash
cd arenageo-backend
mvn spring-boot:run
```

A aplicação escuta em `http://localhost:8080`. O Hibernate usa `ddl-auto: validate`: valida os mapeamentos e não cria nem altera tabelas automaticamente.

> **RLS do Supabase:** as tabelas `tb_*` estão com Row Level Security habilitado e ainda não têm políticas para a aplicação. Configure um usuário de banco exclusivo para o backend, com privilégios mínimos e política RLS deliberada. Sem isso, as operações podem ser bloqueadas pelo PostgreSQL. Não use credenciais administrativas permanentemente em produção.

## Endpoints

| Método | Rota | Acesso |
|---|---|---|
| POST | `/jogadores` | Público para criação de conta |
| POST | `/empresas` | Público para criação de conta comercial |
| POST | `/usuarios/entrar` | Público para login |
| GET | `/esportes` | Catálogo público |
| GET | `/niveis` | Catálogo público |

As outras rotas exigem um token Bearer válido e serão implementadas nas próximas etapas.

## Fluxos

`POST /jogadores` recebe `user`, `address` e `sports`, com os mesmos nomes do TypeScript. `sports` pode ser lista vazia enquanto a seleção de esportes da interface não for conectada ao estado do formulário.

`POST /empresas` recebe `responsible`, `company`, `address` e `arena`. Como cada endereço precisa ter um único proprietário na estrutura atual, o endereço informado pelo formulário é persistido para a empresa e para a arena.

Cadastro e login retornam `success`, `message`, `user`, `data` e `token`, compatíveis com `AuthResponse`. A interface atual ainda não persiste o token no estado de autenticação; essa integração é uma próxima etapa.

## Integridade e segurança

- CPF e CNPJ têm validação de dígitos verificadores.
- E-mail é normalizado antes da gravação.
- E-mail, CPF, CNPJ e nome de usuário são verificados no service e protegidos por constraints/índices.
- Cada cadastro é transacional; falhas revertem todas as inserções.
- Senhas são persistidas apenas como hash BCrypt.
- Respostas de erro não expõem SQL, tabelas ou dados internos.
- Os catálogos retornam apenas registros ativos.
- A tabela de níveis ainda não tem valores iniciais cadastrados.

## Verificação

```bash
mvn -B verify
```

O workflow `.github/workflows/backend-build.yml` executa a verificação do backend em alterações direcionadas a `develop`.
