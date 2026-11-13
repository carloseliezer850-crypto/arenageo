# Contratos incrementais — partidas

Autenticação: JWT Spring em Authorization Bearer, obtido pelo Next do cookie HttpOnly. Identidade de organizador/participante jamais vem do corpo.

| Método/rota | Acesso | Entrada/resultado |
|---|---|---|
| GET `/partidas` | Público | cidade, uf, esporte, nivel, data, page (zero), size (1–50); `{items,total,page,size}` |
| GET `/partidas/{id}` | Público para publicadas/canceladas/concluídas; rascunho só dono | Projeção pública + canManage, participation, queuePosition, accepting, canComplete; 404 uniforme para rascunho alheio |
| GET `/partidas/minhas` | Autenticado | Até 100 organizadas/participações vigentes, ordenadas por início decrescente |
| POST `/partidas` | Autenticado | Idempotency-Key obrigatório; PartidaRequest validado; retorna detalhe |
| PUT `/partidas/{id}/participacao` | Autenticado | `{leave:boolean}`; confirma/espera ou sai; retorna detalhe |
| POST `/partidas/{id}/estado` | Organizador | `{status,version,reason}`; PUBLICADA/CANCELADA/CONCLUIDA conforme ciclo |

PartidaRequest: title (5–120), sportId e skillLevelId ativos, description (1–3000), location (1–200), city (1–120), state (UF), dateTime (local ISO completo), timezone (IANA), durationMinutes (15–480), maxPlayers (2–100), participate e publish. Horário inexistente/ambíguo em transição de fuso é rejeitado. Campo creatorId legado não atribui proprietário.

Projeções não incluem CPF, e-mail, endereço residencial cadastrado, senha, token ou lista de participantes. Nome público do organizador usa username. Erros preservam status/code/message/fields/traceId. Principais códigos: SEARCH_INVALID, REQUEST_INVALID, MATCH_DATE_INVALID, TIMEZONE_INVALID, CATALOG_ITEM_UNAVAILABLE, MATCH_CLOSED, SCHEDULE_CONFLICT, VERSION_CONFLICT, MATCH_TRANSITION_INVALID, CANCELLATION_REASON_REQUIRED e IDEMPOTENCY_CONFLICT.

O antigo contrato GET `/partidas` array foi substituído por página; frontend e serviços foram atualizados juntos. Local ainda é texto; nenhum spaceId fictício é aceito como reserva.
