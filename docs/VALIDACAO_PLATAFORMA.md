# Plataforma — partidas, reservas e quadros na conta

**Banco atualizado em 13/11/2026:** migrations desta branch aplicadas no Supabase, incluindo isolamento da extensão. Histórico e verificações em [APLICACAO_SUPABASE.md](APLICACAO_SUPABASE.md). Menções a migrations pendentes abaixo registram o estado anterior.

Data: 12/11/2026. Base `ef02f0c506c449b0319bae8d961b10438198e9ee`; branch `feat/plataforma-completa`.

Esta branch implementa partes das fases A, B, C e D do prompt. Não representa conclusão da plataforma. As seções iniciais registram entregas anteriores; o estado mais recente está nos incrementos de reservas e quadros na conta ao final.

## Alterações

- Integração seletiva dos seis arquivos do quadro de `feat/quadro-tatico`, sem substituir cadastros, autenticação ou ToastProvider da develop.
- Editor local com modalidades, presets, formações, peças, desenhos, undo/redo, JSON e PNG; nova alternativa de selecionar peça e tocar/clicar no destino.
- Navegação móvel acessível por botão com estado expandido, Escape, retorno de foco e destinos pessoais. Item da página atual identificado.
- Removidos números fictícios da home e distância fixa dos cartões. CTA de proprietário abre cadastro; mini formulário inerte substituído por acesso ao assistente. Perfil abre seu destino real.
- Home distingue falha de consulta de ausência de resultados; falha de rede não é mais convertida em lista vazia pelo cliente legado.
- Painel comercial antigo redireciona para gestão.
- Espaços preservam IDs em edições; IDs de outra arena, inativos ou repetidos são rejeitados. Remoção inativa a linha e conserva vínculos. Consulta de modalidades dos espaços executada em lote, eliminando o N+1 nessa leitura.

## Banco

Migration preparada: `supabase/migrations/20261112195223_espacos_identidade_estavel.sql`. Adiciona `tb_espaco.fl_ativo`, sem apagar registros ou alterar grants/RLS. Testada apenas no PostgreSQL isolado. **Não aplicada no Supabase remoto**. Aplicar antes de executar este backend contra um banco existente. Não reaplicar migrations antigas.

O Supabase foi consultado somente para confirmar as colunas existentes de `tb_espaco`. Reservas ainda não existem neste incremento; proteção de reservas futuras ao inativar um espaço deve entrar com o módulo de reservas. Controle otimista de edição da arena ainda pendente.

## Validação

- 23 testes backend aprovados localmente, incluindo identidade estável dos espaços, participação concorrente e atualização de perfil sem CEP.
- 4 testes do modelo tático: limites/formações/presets, transição de modalidade, formação inválida e importação malformada.
- Typecheck, build Next e lint; lint mantém quatro avisos preexistentes sobre imagens.
- Playwright executado no GitHub Actions: menu móvel/Escape, posicionamento por clique/desfazer e redirect comercial aprovados. A jornada completa também passou: cadastro, perfil sem CEP, imagem, empresa, duas arenas, criação de partida com validação de campo, persistência após refresh, busca por cidade/UF e histórico pessoal. Execução local indisponível: servidor Next falha com `uv_interface_addresses`; Chromium ausente. Não substitui revisão visual e de usabilidade.
- Workflow executa também a suíte Node do quadro e os novos casos Playwright, com banco descartável.
- PostgreSQL embarcado dos testes: 14.15. Homologação com PostgreSQL 17 remoto, SMTP real, usabilidade observada e desempenho permanecem pendentes.

## Próximos incrementos e dependências

A: concluir CTAs restantes, shell e revisão das projeções públicas. Busca de partidas na URL já implementada. A sessão do cabeçalho ainda verifica presença do cookie; validação real deve preceder mostrar identidade autenticada.
B: núcleo de partidas e painel pessoal implementados; faltam convites, aprovação, notificações, promoção automática da espera e descoberta opt-in.
C: preços, agenda, reservas e proteção de sobreposição; políticas de cancelamento e pagamentos exigem definição de negócio.
D: persistência do quadro na conta, biblioteca, conflitos de versão, compartilhamento revogável, cenas e vínculo com elenco. O editor deste incremento salva **somente no navegador/exportação**, não na nuvem.
E: times, notificações/outbox, comunicação, equipe, avaliações, suporte e pagamento sandbox com fornecedor/recebedor definidos.
F: privacidade, auditoria, acessibilidade completa, desempenho, restauração e testes com pessoas.

Nenhuma cobrança real, merge ou deploy foi realizado neste incremento.

## Incremento de 13/11/2026 — partidas

Implementado núcleo gratuito de partidas (ver REGRAS_PARTIDAS_RESERVAS.md e CONTRATOS_API.md): busca pública paginada, filtros na URL, criação com catálogo e identidade autenticada, rascunho/publicação, detalhe por ID, participação/saída, última vaga concorrente, fila manual ordenada, cancelamento e conclusão pelo organizador, histórico pessoal e resumo no painel. Home e categorias encaminham filtros reais. Migração `20261113124110_partidas_participacao.sql` preparada e testada localmente; não aplicada no Supabase remoto.

O workflow usa ubuntu-24.04, compatível com Playwright 1.57.0, e a origem localhost no navegador para servir os scripts do Next. Build, typecheck, lint, backend, modelo tático e os 5 testes Playwright passaram na execução [43480163191](https://github.com/carloseliezer850-crypto/arenageo/actions/runs/43480163191), commit `677bff37f4aff1adb6ac505112a84425ef2736b9`. Logs e relatórios são preservados em falhas. A configuração restringe a descoberta do Playwright a arquivos `*.spec.ts`; o modelo tático roda somente em sua etapa Node.

Backend ampliado para 23 testes, com corrida da última vaga, unicidade/retry, ordem da fila, rollback por choque de agenda, data passada, horário inexistente no fuso, rascunho privado, busca com acentos/UF, autorização de transições, versão, API pública, acesso autenticado ao histórico e idempotência. Jornada Playwright existente ampliada com criação, refresh, busca e histórico de partida; jornada aprovada no Chromium do CI.

A fase B ainda é parcial: convites, aprovação, notificações, descoberta de jogadores opt-in e demais itens não estão concluídos. Fases C/E/F e persistência remota do quadro seguem pendentes. Nenhum merge, deploy, cobrança ou migration remota neste incremento.

## Correção de regressão — CEP opcional

O E2E identificou que editar perfil sem CEP convertia a ausência em string vazia e violava `ck_tb_endereco_nm_cep`. Atualizações de perfil, arena e empresa agora preservam `null` quando o CEP não é informado, mantendo a restrição do banco. O teste de integração cobre ausência, vazio, máscara e remoção de CEP previamente preenchido. Nenhuma alteração de schema necessária para essa correção.


## Incremento de reservas — 13/11/2026

Implementado fluxo gratuito para a plataforma, com preço da quadra e pagamento no local: configuração por espaço, agenda, orçamento versionado, confirmação atômica, cancelamento, check-in manual, recebimento local, conclusão/ausência, bloqueios e ICS. Novas telas públicas e privadas ligadas à API. Regras e limitações em REGRAS_PARTIDAS_RESERVAS.md.

28 testes backend aprovados localmente; os cinco novos casos verificam concorrência e constraint direta, adjacência/preparo, idempotência/reuso do orçamento, expiração/versão/preço, autorização, cancelamento, histórico, bloqueio, pagamento e exceções na virada do dia. Typecheck, lint (quatro avisos anteriores) e build aprovados. Jornada E2E aprovada com configuração, orçamento, confirmação, reload, agenda e cancelamento no CI 43487371764.

Migration `20261113183256_reservas_agenda_local.sql` criada pelo CLI e testada no PostgreSQL isolado; RLS habilitado e acesso Data API revogado (identidade/autorização pelo backend Spring). Não aplicada ao projeto Supabase remoto. Nenhum merge/deploy/cobrança online. Há agora quatro migrations desta branch pendentes no Supabase: identidade estável, partidas, reservas e quadros.


## Quadros na conta — 13/11/2026

Persistência privada, biblioteca, pesquisa, renomeação/cópia, arquivo/exclusão e autosave com revisão otimista. Preserva editor local. Migration `20261113184401_quadros_na_conta.sql` preparada, não aplicada no Supabase remoto.

30 testes backend aprovados localmente, incluindo acesso entre contas, revisão antiga, arquivamento/restauração, exclusão e rejeição de documento inválido preservando o anterior. Typecheck, lint (quatro avisos antigos) e build aprovados. E2E aprovado para abrir o quadro em segunda aba, salvar, detectar conflito na primeira e preservar as duas versões com cópia. CI [43487533096](https://github.com/carloseliezer850-crypto/arenageo/actions/runs/43487533096), commit `68740eb5bf66afb958c465e27ca255b1c032159b`: 30 testes backend, 4 do modelo, 5 Playwright, typecheck, lint e build aprovados.

Revisão adicional: limite de bloqueio comparado por duração exata (sete dias), resposta 400 para parâmetro obrigatório ausente e 401 para listagem privada sem autenticação. Cobertura adicionada ao teste de operação da arena.


## Convites e notificações — 15/11/2026

Caixa privada de notificações com leitura e paginação; convites por username pelo organizador, resposta/revogação, proteção contra repetição e limite por hora. Aceitar respeita vagas, fila e agenda. Avisos transacionais ligados a reservas/partidas. Nenhum canal externo foi ativado.

33 testes backend aprovados localmente, incluindo isolamento entre contas, deduplicação, leitura idempotente, convite repetido, aceitação com partida cheia, aviso ao primeiro da fila, revogação e cancelamento. Typecheck, lint e build aprovados. E2E aprovado com leitura do aviso de reserva e envio/aceitação de convite entre duas contas. [CI 43740689330](https://github.com/carloseliezer850-crypto/arenageo/actions/runs/43740689330), commit `89a3da56a2d97b72a2dac8bd8bec3cb6f3fd38c7`: 33 testes backend, 4 do modelo tático e 5 Playwright aprovados, além de typecheck, lint e build. Inclui rejeição de convite a jogador inativo. Migration `20261115170926_convites_notificacoes.sql` aplicada no Supabase, versão remota `20261115172454`, com RLS/permissões e histórico conferidos.

## Estado atual e próximos itens — 15/11/2026

As seções anteriores registram o histórico de cada incremento. O estado atual do banco e o mapeamento das migrations estão em APLICACAO_SUPABASE.md: todas as migrations desta branch foram aplicadas. Partidas, reservas com pagamento local, quadros privados na conta, convites e notificações internas estão implementados. Não houve merge ou deploy.

Continuam pendentes: aprovação/descoberta opt-in, promoção automática da fila, preferências/bloqueio de convites e canais externos; times/chat; reserva manual, reagendamento e regras avançadas de tarifa; pagamento online; compartilhamento/cenas/elenco no quadro; avaliações, suporte e demais requisitos de privacidade, acessibilidade e desempenho. A fila atual exige confirmação manual e os avisos exigem atualização da página.

## Compartilhamento do quadro — 16/11/2026

Implementado link revogável, somente leitura, válido por sete dias, com cópia da revisão salva e nomes ocultos por padrão. Testes adicionados para propriedade, versão antiga, snapshot, ocultação de nomes, token armazenado como hash, expiração, rotação, revogação repetida, arquivamento/restauração, exclusão e leitura HTTP pública sem permissão de escrita. E2E ampliado com visitante sem sessão e revogação após abrir o campo. Validação aprovada no [CI 43929749765](https://github.com/carloseliezer850-crypto/arenageo/actions/runs/43929749765), commit `7f405d6d2ebc396588f5992dcbfaa45c0e1f8657`: 35 testes backend, 4 do modelo tático, 5 Playwright, typecheck, lint e build. Lint mantém quatro avisos anteriores de imagens. Migration aplicada no Supabase como `20261116183451`, com histórico, RLS e permissões verificados. Sem merge/deploy. Compartilhamento por membros com edição, cenas e vínculo com elenco continuam pendentes.
## Privacidade de convites — 17/11/2026

Tela de notificações permite desativar/ativar novos convites e bloquear/desbloquear remetentes por username. Backend valida a preferência na criação, mantém respostas anteriores e não revela o motivo da indisponibilidade ao remetente. Preferências e bloqueios são privados, com RLS e permissões Data API revogadas. Testes adicionados para ausência de efeitos ao rejeitar, reativação, isolamento, repetição, bloqueio próprio/inexistente, autenticação e payload inválido. E2E ampliado para preferência persistida após reload e bloqueio/desbloqueio. Validação final e aplicação remota pendentes neste registro inicial.
