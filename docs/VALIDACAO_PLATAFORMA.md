# Plataforma — navegação, quadro tático e partidas

Data: 12/11/2026. Base `ef02f0c506c449b0319bae8d961b10438198e9ee`; branch `feat/plataforma-completa`.

Esta branch implementa partes das fases A, B e D do prompt. Não representa conclusão da plataforma.

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
