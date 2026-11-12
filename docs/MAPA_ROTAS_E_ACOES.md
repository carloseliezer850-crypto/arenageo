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
