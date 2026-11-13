# Plataforma completa — incremento inicial

Data: 12/11/2026. Base `ef02f0c506c449b0319bae8d961b10438198e9ee`; branch `feat/plataforma-completa`.

Este incremento inicia as fases A e D do prompt. Não representa conclusão da plataforma.

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

- 18 testes backend, incluindo as novas asserções de identidade estável, inativação e ID inválido no teste de publicação.
- 4 testes do modelo tático: limites/formações/presets, transição de modalidade, formação inválida e importação malformada.
- Typecheck, build Next e lint; lint mantém quatro avisos preexistentes sobre imagens.
- Três testes Playwright adicionados: menu móvel/Escape, posicionamento por clique/desfazer e redirect comercial. **Não validados localmente**: servidor Next falha com `uv_interface_addresses`; Chromium do Playwright ausente. Não há evidência de teste visual/mobile aprovado.
- Workflow executa também a suíte Node do quadro e os novos casos Playwright, com banco descartável.
- PostgreSQL embarcado dos testes: 14.15. Homologação com PostgreSQL 17 remoto, SMTP real, usabilidade observada e desempenho permanecem pendentes.

## Próximos incrementos e dependências

A: concluir busca na URL, CTAs restantes, shell e projeções públicas sanitizadas. A sessão do cabeçalho ainda verifica presença do cookie; validação real deve preceder mostrar identidade autenticada.
B: persistência e APIs de partidas, participação concorrente, convites, espera, descoberta opt-in e painel pessoal.
C: preços, agenda, reservas e proteção de sobreposição; políticas de cancelamento e pagamentos exigem definição de negócio.
D: persistência do quadro na conta, biblioteca, conflitos de versão, compartilhamento revogável, cenas e vínculo com elenco. O editor deste incremento salva **somente no navegador/exportação**, não na nuvem.
E: times, notificações/outbox, comunicação, equipe, avaliações, suporte e pagamento sandbox com fornecedor/recebedor definidos.
F: privacidade, auditoria, acessibilidade completa, desempenho, restauração e testes com pessoas.

Nenhuma cobrança real, merge ou deploy foi realizado neste incremento.

## Incremento de 13/11/2026 — partidas

Implementado núcleo gratuito de partidas (ver REGRAS_PARTIDAS_RESERVAS.md e CONTRATOS_API.md): busca pública paginada, filtros na URL, criação com catálogo e identidade autenticada, rascunho/publicação, detalhe por ID, participação/saída, última vaga concorrente, fila manual ordenada, cancelamento e conclusão pelo organizador, histórico pessoal e resumo no painel. Home e categorias encaminham filtros reais. Migração `20261113124110_partidas_participacao.sql` preparada e testada localmente; não aplicada no Supabase remoto.

A execução anterior do GitHub confirmou build, typecheck, lint, backend e modelo tático, mas falhou antes dos E2E: ubuntu-latest resolveu Ubuntu 26.04, incompatível com Playwright 1.57.0. Runner fixado em ubuntu-24.04, mantendo dependências do app. Logs e relatórios são preservados em falhas.

Backend ampliado para 22 testes, com corrida da última vaga, unicidade/retry, ordem da fila, rollback por choque de agenda, data passada, horário inexistente no fuso, rascunho privado, busca com acentos/UF, autorização de transições, versão, API pública, acesso autenticado ao histórico e idempotência. Jornada Playwright existente ampliada com criação, refresh, busca e histórico de partida; validação de navegador continua dependente do CI.

A fase B ainda é parcial: convites, aprovação, notificações, descoberta de jogadores opt-in e demais itens não estão concluídos. Fases C/E/F e persistência remota do quadro seguem pendentes. Nenhum merge, deploy, cobrança ou migration remota neste incremento.
