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


## Reservas e agenda

- GET /arenas?cidade=&uf=; GET /arenas/{id}/espacos; GET /espacos/{id}/disponibilidade?date=YYYY-MM-DD: públicos, apenas arena publicada e espaço ativo; sem dados do reservante.
- GET/PUT /gestao/espacos/{id}/reservas-config: responsável; `{online,hourlyCents,durationMinutes,preparationMinutes,cancellationHours,policy,version}`.
- POST /reservas/orcamentos: conta autenticada, `{spaceId,start}`; start é data/hora local da arena. Retorna quoteId, intervalo UTC, fuso, preço, política e validade.
- POST /reservas: `{quoteId,accepted:true}`, Idempotency-Key obrigatório. CONFIRMADA/PENDENTE_LOCAL; não processa cartão/PIX.
- GET /reservas?page=0; GET /reservas/{id}: privados. Sem dados cadastrais do cliente nos resultados.
- GET /gestao/arenas/{id}/agenda?date=YYYY-MM-DD: agenda diária do responsável.
- POST /gestao/bloqueios: `{spaceId,start,end,reason}`, Idempotency-Key obrigatório; até 7 dias por bloqueio.
- POST /reservas/{id}/acoes: `{action,version,reason?}`; CANCELAR, CHECKIN, CONCLUIR, FALTA, RECEBER_LOCAL. Autorização e regras no servidor.
- BOOKING_CONFLICT (409): sobreposição, orçamento desatualizado/expirado, versão antiga ou transição incompatível. BOOKING_INVALID (400): dados inválidos. FUTURE_BOOKINGS (409): edição de arena incompatível com compromissos futuros.


## Quadros privados

- GET /quadros?query=&archived=false: biblioteca da conta, até 100.
- GET /quadros/{uuid}: documento privado e revisão.
- POST /quadros: `{title,document,revision:0}` e Idempotency-Key. UUID gerado pelo servidor.
- PUT /quadros/{uuid}: `{title,document,revision}` e Idempotency-Key. Revisão antiga/arquivada gera BOARD_VERSION_CONFLICT (409).
- PATCH /quadros/{uuid}: `{revision,archived}`; arquiva/restaura com controle de versão.
- DELETE /quadros/{uuid}?revision=: exclusão do próprio quadro, com revisão.
- BOARD_INVALID (400): documento inválido. BOARD_LIMIT (400): 100 quadros atingidos. Recursos de outra conta retornam 404.
