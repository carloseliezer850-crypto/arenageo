# Cadastro de jogador, empresa e arena — entrega para revisão

Base: `develop`, commit `44b3acb3465c40ef4690c42b04ef0b29531165de`. Branch: `feat/cadastro-completo-jogador-arena`. Revisão em 12/11/2026. Integração na `develop` autorizada em 12/11/2026. Migration `cadastro_completo` aplicada no Supabase remoto, versão `20261112183301`. Verificação após aplicação: 1 usuário e 1 jogador preservados, 0 empresas e arenas, 3 níveis de habilidade, 17 tabelas com RLS e nenhum grant de tabela para `anon`/`authenticated`. Deploy da aplicação não realizado.

## Diagnóstico e evidência

A inspeção do código confirmou que os checkboxes não atualizavam `sports`, o backend aceitava lista vazia e o frontend perdia `fields`. A consulta remota somente de leitura confirmou 1 usuário, 1 pessoa, 1 jogador, nenhum vínculo esportivo e nenhum nível. O advisor confirmou RLS habilitado sem policies em 10 tabelas. Não foi reproduzido o formulário antigo no navegador; esses achados são de código e SQL.

A autenticação continua sendo Spring/BCrypt/JWT próprio com cookie HttpOnly no Next. Não houve migração para Supabase Auth. As novas tabelas usam JDBC e RLS sem acesso de `anon`/`authenticated`. A migration revoga grants implícitos desses papéis nas tabelas do aplicativo; não cria policies públicas.

## Implementado

| Fluxo | Resultado |
| --- | --- |
| Jogador novo | Etapas, estado controlado de esportes e níveis reais, catálogo com loading/erro/retry, validação por campo, toast, persistência transacional |
| Perfil existente | `/perfil` lê e atualiza nome, telefone, localização e esportes, inclusive a conta antiga sem seleção; não inventa vínculos antigos |
| Empresa nova | Responsável, empresa, arena e endereços separados; opção explícita de reaproveitar o endereço |
| Jogador abre empresa | Reaproveita usuário/pessoa, preserva jogador e esportes |
| Outra arena | `/gestao/nova` seleciona empresa pertencente à conta; não recadastra CNPJ nem responsável |
| Edição comercial | `/gestao/empresas/{id}` e `/gestao/{id}` leem e atualizam dados com autorização pelo proprietário |
| Estrutura | Espaços com modalidades, cobertura, piso, capacidade e dimensões; vínculos relacionais persistidos |
| Funcionamento | Períodos semanais, passagem da meia-noite, fuso IANA e exceções por data; valida sobreposições, inclusive entre dias |
| Publicação | RASCUNHO/INCOMPLETO/PUBLICADO; publicar exige endereço utilizável, espaço e horários; busca só retorna publicados |
| Busca | Cidade e UF; UF opcional preserva compatibilidade com os links existentes |
| Fotos | Upload autenticado, decodificação real JPG/PNG/WebP, remoção de metadados por recodificação, limite 5 MB/20 MP; avatar e galeria com até 10 imagens, remoção e escolha de capa |
| Conta | Token aleatório de uso único, hash SHA-256, validade de 30 minutos, reenvio após 60 segundos, recuperação neutra, redefinição revoga sessões anteriores |
| E-mail | Evento após commit e transporte SMTP configurável; falha não desfaz o cadastro. Reenvio manual disponível |
| CEP | Consulta ViaCEP com timeout, descarte de respostas antigas e preservação de edições posteriores; preenchimento manual continua disponível |
| Reenvios | `Idempotency-Key`, transação e trava PostgreSQL; mesmo payload retorna o resultado, outro payload retorna 409; respostas criptografadas, fingerprint HMAC, validade 24 h |
| Segurança | Erros sem SQL/stacktrace, traceId, mensagens 401/403, limite básico por IP, uploads e endpoints privados vinculados à identidade autenticada |

O upload é feito **depois** do cadastro, no perfil/gestão. A imagem fica no PostgreSQL, não em um bucket externo. Não há integração de Storage alegada. A foto pode ser reenviada sem recriar a conta.

## Campo → payload → validação → persistência

| Campo | Payload | Validação | Persistência |
| --- | --- | --- | --- |
| Nome | `user.name` / `responsible.name` | Obrigatório, trim, 160 | `tb_pessoa.nm_completo` |
| Username | `user.username` | ASCII, ponto/sublinhado, 3–30, normalização, único | `tb_pessoa.nm_nome_usuario` |
| E-mail da conta | `user.email` / `responsible.email` | Formato, 254, trim/lower, único | `tb_usuario.nm_email` |
| CPF | `user.cpf` / `responsible.cpf` | Formato antes da normalização, DV, repetição, único | `tb_pessoa.nm_cpf` com 11 dígitos |
| Nascimento | `user.birthDate` | Opcional, data real, sem futuro | `tb_pessoa.dt_nascimento` |
| Telefone | `*.phone` / `company.businessPhone` | DDD brasileiro, fixo/celular; obrigatório no comercial | Telefone canônico `+55` nas respectivas entidades |
| Senha | `*.password` | Mínimo 12 caracteres Unicode, máximo 72 bytes UTF-8, lista local de senhas comuns, distinta do e-mail/username | Somente hash BCrypt em `tb_usuario` |
| UF/cidade/CEP | `address.*` / `arenaAddress.*` | UF válida, cidade obrigatória até 120, CEP opcional com 8 dígitos | `tb_endereco`, um dono por endereço |
| Esporte e nível | `sports[i].sportId/skillLevelId` | Pelo menos um, IDs ativos, sem duplicatas | `tb_jogador_esporte` |
| Razão/fantasia | `company.legalName/tradeName` | Obrigatórios, 180 | `tb_empresa` |
| CNPJ | `company.cnpj` | Numérico/alfanumérico, DV ASCII−48, único, letras preservadas | `tb_empresa.nm_cnpj`, CHECK compatível |
| Contato comercial | `company.businessEmail/businessPhone` | E-mail e telefone; unicidade comercial preservada | `tb_empresa` |
| Arena | `arena.*` | Nome 160, descrição 10.000, website http/https até 500, Instagram 120 | `tb_arena` |
| Latitude/longitude | `address.latitude/longitude` | Par obrigatório quando informado, faixas válidas | `tb_endereco.nr_latitude/nr_longitude` |
| Estrutura/modalidades | `spaces[]` | Nome, modalidades ativas, limites positivos | `tb_espaco`, `tb_espaco_esporte` |
| Horários | `hours[]`, `exceptions[]`, `timezone` | Períodos até 24 h, sem sobreposição, fuso válido | `tb_arena_horario`, `tb_arena_excecao`, `tb_arena.nm_fuso` |
| Imagens | Multipart `file`, `arena` opcional | Tamanho, assinatura/decoder, dimensões, propriedade | `tb_midia` e referência em pessoa/arena |

## Contrato de erros

Respostas de erro do cadastro preservam `status`, `code`, `message`, `fields` e `traceId`. As Server Actions devolvem objetos serializáveis. O formulário abre a etapa do primeiro erro e mantém os demais dados. Senhas/documentos/tokens não são persistidos em localStorage.

| Código | Uso |
| --- | --- |
| VALIDATION_ERROR | Bean Validation, formato e obrigatórios; mapa por campo |
| CPF_INVALID / CNPJ_INVALID | Dígitos verificadores inválidos |
| PHONE_INVALID / PASSWORD_POLICY / BIRTH_DATE_INVALID | Regras específicas |
| ACCOUNT_CONFLICT / USERNAME_IN_USE / CNPJ_IN_USE / BUSINESS_EMAIL_IN_USE | Conflito de cadastro, HTTP 409 |
| SPORTS_REQUIRED / SPORTS_DUPLICATED / CATALOG_ITEM_UNAVAILABLE | Seleção esportiva e catálogo |
| IDEMPOTENCY_INVALID / IDEMPOTENCY_CONFLICT | Chave inválida ou reutilizada com outro conteúdo |
| ARENA_INCOMPLETE / SCHEDULE_INVALID / TIMEZONE_INVALID | Publicação e funcionamento |
| IMAGE_TOO_LARGE / IMAGE_INVALID / GALLERY_LIMIT / GALLERY_INVALID | Mídia, 413/415 quando aplicável |
| TOKEN_INVALID | Link expirado, inválido ou usado |
| SESSION_EXPIRED / FORBIDDEN / NOT_FOUND | 401/403/404 |
| RATE_LIMITED | 429, `Retry-After: 60` |
| PERSISTENCE_ERROR / INTERNAL_ERROR | Falha de integridade não única ou interna, sem detalhe SQL |

Violações SQL `23505` são conflitos; demais violações de integridade não são apresentadas como duplicidade. O resultado desconhecido de uma falha de transporte deve ser reconciliado reutilizando a chave. A proteção cobre concorrência entre instâncias por meio do PostgreSQL.

## Migration e configuração

Aplicar **apenas depois da revisão**, primeiro em homologação:

`supabase/migrations/20261112145142_cadastro_completo.sql`

Ela insere níveis sem presumir IDs, preserva níveis já existentes, ajusta o CHECK de CNPJ e acrescenta tabelas/colunas. A execução repetida foi testada. Não preenche esportes para jogadores antigos. As migrations antigas não devem ser reaplicadas em banco existente.

**Mudança visível:** arenas existentes ficam como RASCUNHO e deixam de aparecer na busca até serem revisadas/publicadas. Não há exclusão de dados reais. As migrations e seeds foram executadas somente em bancos descartáveis dos testes.

Copiar `arenageo-API/.env.example` para a configuração local, preenchendo os valores. Não versionar senhas reais. JDK 21 completo e Maven são necessários. Frontend usa `NEXT_PUBLIC_API_URL` para o backend local.

Para e-mail: configurar `EMAIL_ENABLED=true`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM`, `APP_PUBLIC_URL`. Por padrão o envio está desativado. **Entrega SMTP real não foi testada**, por falta de credenciais; os fluxos de token foram testados localmente. Após falha/reinício entre commit e envio, o usuário pode solicitar outro link.

Rotação da chave JWT também invalida a criptografia dos resultados de idempotência; excluir registros expirados/antigos em manutenção controlada. A limpeza periódica de `tb_idempotencia` e tokens expirados deve ser agendada antes de produção. Nunca armazenar payload de cadastro em log.

## Testes executados

- Maven: **18 testes aprovados** — 12 integração/API com PostgreSQL descartável e 6 validações.
- Dois esportes com níveis diferentes, releitura e remoção atômica.
- ID inválido após inserções e falha diferida no commit sem conta/endereço residual.
- Mesma chave em requisições concorrentes cria um único grafo; payload diferente dá conflito.
- Seed/migration reexecutável, grants da Data API removidos.
- Jogador vira responsável, endereços distintos, segunda arena e isolamento de proprietário.
- Publicação incompleta rejeitada e publicação com estrutura aceita.
- Confirmação/redefinição de uso único, resposta neutra, sessão anterior revogada.
- Upload decodificado, arquivo inválido e leitura/remoção por outro usuário rejeitados.
- HTTP 400 com campos aninhados e protocolo; 401 após revogação.
- TypeScript sem erros; build Next.js aprovado; ESLint sem erros, com quatro avisos de `<img>` preexistentes fora dos componentes novos.
- Teste Playwright dos validadores JavaScript aprovado.
- **E2E de navegador não validado neste ambiente:** Chromium falhou em `socket(): Operation not permitted` antes de abrir a página. O servidor Next dev também encontrou restrição de interfaces de rede. A suíte completa está em `arenageo/tests/cadastro.spec.ts`, mas não deve ser tratada como aprovada.

PostgreSQL dos testes: 14.15 embarcado; remoto inspecionado: 17.11. Não equivale a homologação no ambiente remoto. O workflow foi corrigido de `arenageo-backend` (pasta inexistente) para `arenageo-API` e inclui build, testes e E2E com banco isolado.

### Reproduzir no PC/CI

```bash
cd arenageo-API
mvn verify dependency:build-classpath -Dmdep.outputFile=target/test-classpath
# Linux/macOS; no Windows o separador do classpath é ponto e vírgula.
java -cp "target/test-classes:target/classes:$(cat target/test-classpath)" com.arenageo.service.CadastroE2eServer
```

Em outro terminal:

```bash
cd arenageo
npm ci
npx playwright install chromium
NEXT_PUBLIC_API_URL=http://localhost:8088 npm run dev -- --port 3100
```

Em um terceiro terminal: `cd arenageo && npm run test:e2e`. O servidor fixture cria seu próprio banco vazio e não aceita URL remota. Nunca apontar esses testes ao projeto real.

## Exemplo sintético e conferência

```json
{
  "user": {"name":"Jogador Teste","username":"jogador.teste","email":"jogador@example.test","phone":"53999999999","cpf":"529.982.247-25","birthDate":"","password":"frase de senha teste"},
  "address": {"state":"RS","city":"Bagé","zipCode":"","neighborhood":"","latitude":null,"longitude":null},
  "sports": [{"sportId":123,"skillLevelId":456}]
}
```

`123`/`456` são marcadores: substituir pelos IDs retornados por `/esportes` e `/niveis`. Documento sintético usado apenas como vetor de DV, nunca como fixture de produção. Enviar UUID no header `Idempotency-Key`.

```sql
-- Contagens sem dados pessoais; executar no ambiente que recebeu a migration.
select count(*) from public.tb_usuario;
select count(*) from public.tb_jogador_esporte;
select count(*) from public.tb_nivel_habilidade;
select nm_status_publicacao, count(*) from public.tb_arena group by 1;
-- Conferir a quantidade de vínculos por jogador no ambiente de teste.
-- Contas históricas sem vínculo são preservadas intencionalmente.
select j.id_jogador, count(je.id_esporte)
from public.tb_jogador j left join public.tb_jogador_esporte je using(id_jogador)
group by j.id_jogador;
```

## Pendências e limites — não considerar o prompt integralmente concluído

1. Rodar E2E no CI/PC, conferir foco/teclado/leitor de tela e mobile visualmente. Não houve inspeção visual completa aqui.
2. Configurar e testar SMTP real, entrega, caixa de spam e reenvio em homologação. O envio usa evento após commit e reenvio manual; não há worker/outbox durável com retentativa automática.
3. Cidade continua texto manual; não há catálogo IBGE com validação cidade–UF ou mapa interativo. Coordenadas podem ser digitadas e validadas na gestão.
4. Lista de senhas comuns é local e pequena; não há consulta a base abrangente de senhas comprometidas. Não aplicar política nova ao login antigo.
5. Perfil edita nome, telefone, endereço e esportes; alteração de e-mail/CPF/username/nascimento pelo usuário ainda exige um fluxo próprio. E-mail verificado é registrado, mas não é condição para login/publicação nesta entrega.
6. UI de exceções oferece datas fechadas; API aceita períodos especiais. Completar a edição visual de períodos especiais e reordenação arbitrária de galeria (hoje é possível promover uma imagem à capa).
7. Rate limit é local por IP e instância (30/minuto/rota). Atrás do Next as requisições podem compartilhar IP. Antes de produção, adotar limites distribuídos por conta/chave e política de proxy confiável.
8. Imagens no banco são uma solução funcional para este porte. Planejar storage externo, quotas e backup para escala. Não há integração Supabase Storage concluída.
9. Edição dos espaços substitui o conjunto e gera novos IDs. Antes de reservas vinculadas a espaços, evoluir para edição com identidade estável e histórico.
10. Observabilidade completa, métricas, health/readiness, retenção, exportação/exclusão, consentimentos versionados e política de menores dependem de trabalho adicional. Não há certificação de conformidade legal.

## Backlog de produto

| Prioridade | Item | Dependência | Aceite |
| --- | --- | --- | --- |
| P0 | Homologar E2E e SMTP | Ambiente isolado e provedor | Suíte completa aprovada e links entregues/reutilização bloqueada |
| P0 | Catálogo municipal e mapa | Fonte IBGE e componente de mapa | Cidade/UF coerentes e coordenada confirmada com alternativa manual |
| P0 | Observabilidade, backups e recuperação | Infraestrutura e métricas | Restore testado e falhas rastreáveis sem PII |
| P1 | Reservas e disponibilidade | IDs estáveis de espaços | Requisições concorrentes não ocupam o mesmo horário |
| P1 | Preços, duração, bloqueios/cancelamento | Reservas | Valor e disponibilidade calculados por horário/data/fuso |
| P1 | Equipes/permissões da empresa | Associação multiusuário | Convites com escopo por arena e isolamento entre empresas |
| P1 | Partidas, participantes/lista de espera | Espaços e reservas | Lotação consistente sob concorrência e desistências |
| P2 | Pagamentos e conciliação | Reserva e provedor | Webhooks idempotentes, reembolso e conciliação auditáveis |
| P2 | Busca por modalidade/proximidade | Geodados e paginação | Filtros combinados e ordenação estável |
| P2 | Moderação/avaliações/notificações | Participação comprovada e preferências | Avaliação vinculada e notificações consentidas |

Referências consultadas: [CNPJ/Receita](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj), [exemplo oficial de DV](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf), [ViaCEP](https://viacep.com.br/), [Supabase changelog](https://supabase.com/changelog.md). Para Next, foram lidos os guias embarcados na versão instalada.
