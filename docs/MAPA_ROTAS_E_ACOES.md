# Mapa de cobertura — incremento inicial

| Rota/ação | Resultado atual | Evidência / pendência |
|---|---|---|
| Cabeçalho desktop/móvel | Navegar, entrar, cadastro, painel, gestão, sair; Escape fecha menu | Playwright preparado; execução local bloqueada |
| `/quadro-tatico` | Editor local, PNG/JSON, presets, desenho, desfazer, teclado e seleção+clique | 4 testes de modelo; E2E pendente |
| Home | Métricas falsas removidas; falhas de seções identificadas | Build/lint; busca funcional ainda pendente |
| Anunciar arena | Abre `/cadastro/empresa` | Link real |
| Preparar partida | Abre `/criar-partida` | Assistente existente; persistência de partida ainda pendente |
| Cartão jogador | Abre `/jogadores/[id]`, sem distância falsa | API pública sanitizada ainda pendente |
| `/empresa/painel` | Redireciona para `/gestao` | Playwright preparado |
| `/gestao/[id]` | PUT mantém ID de espaços e inativa removidos | Integração PostgreSQL, autorização por arena |
| Demais rotas do prompt | Ainda não implementadas ou não revisadas neste incremento | Ver fases em VALIDACAO_PLATAFORMA.md |

Não há afirmação de cobertura integral. Os estados de sucesso, erro, loading e recuperação das novas jornadas serão documentados junto de cada implementação real.

## Incremento de partidas

| Rota/ação | Resultado | Cobertura |
|---|---|---|
| Home/categorias | GET `/partidas` com cidade/UF/data/modalidade em URL | Rota de busca real; sem filtro fictício |
| `/partidas` | Busca paginada, filtros, vazio, falha e navegação entre páginas | Backend/contrato; Playwright ampliado |
| `/criar-partida` | Catálogos reais, gratuita, local informado, fuso, rascunho/publicação, idempotência | Reenvio desconhecido preserva dados/chave |
| `/partidas/[id]` | Detalhe direto, participar/sair/fila, publicar/cancelar/concluir conforme dono/estado | Testes de concorrência, acesso e versão |
| `/minhas-partidas` | Organizando/participando/esperando, até 100 recentes | Autenticação exigida; estado vazio/erro |
| `/painel` | Resumo das partidas e atalhos, preservando busca legada de arenas | Falha de partidas não elimina busca de arenas |

Toda mutação mostra envio, confirmação ou erro; o detalhe é atualizado após ação. Filas exigem confirmação manual e não têm notificação automática. Não há edição/convite privado ou reserva implícita.


## Rotas adicionadas — reservas e quadros na conta

| Rota | Acesso | Operação implementada |
|---|---|---|
| `/arenas` | Público | Busca por cidade/UF |
| `/arenas/[id]` | Público, arena publicada | Espaços ativos e tarifa configurada |
| `/espacos/[id]?date=` | Público; reservar exige conta | Disponibilidade, orçamento, revisão e confirmação local |
| `/reservas` | Conta | Histórico paginado |
| `/reservas/[id]` | Cliente ou responsável | Protocolo, política, cancelamento, operação local, eventos e ICS |
| `/gestao/[id]/agenda?date=` | Responsável | Agenda diária, detalhes e bloqueios |
| `/gestao/espacos/[id]` | Responsável | Preço e condições da reserva |
| `/quadro-tatico` | Editor público; biblioteca privada | Editor local e persistência por conta, revisão, autosave, cópia, arquivo/exclusão |

Pendente: reserva manual/reagendamento, faixas tarifárias, devolução local/online, compartilhamento/cenas do quadro, notificações, convites e demais módulos listados no prompt. Não confundir implementação das rotas acima com conclusão de todas as fases.
