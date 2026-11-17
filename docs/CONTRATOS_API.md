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


## Convites e notificações internas

- GET /notificacoes?page=0: 20 avisos da conta por página, mais contagem de não lidos.
- PUT /notificacoes/{id}/lida: marcação idempotente, somente pelo destinatário.
- GET /convites: até 100 convites recentes recebidos.
- GET/POST /partidas/{id}/convites: somente organizador; POST `{username}` exato, jogador ativo. Até 20 novos convites por hora por organizador; único por partida/destinatário. Reenvio retorna o existente, inclusive após recusa/revogação.
- POST /convites/{id}/resposta: `{action: ACEITAR|RECUSAR|REVOGAR}`. Destinatário aceita/recusa; organizador revoga pendente. Mesma resposta pode ser repetida. Aceitação chama participação com as mesmas travas, limites e fila, sem prioridade adicional. Conflito de agenda reverte a resposta.
- Partida encerrada/data vencida impede resposta. Convite pendente vencido é apresentado como EXPIRADO; cancelamento/conclusão revoga pendentes e avisa os afetados.

Notificações persistidas na mesma transação do evento, com chave única por usuário/evento. Avisos de convite, resposta, participação, vez na fila, cancelamento/conclusão e operações de reserva. Sem e-mail, SMS, push, job externo ou promoção automática. Destinos limitados a partidas/reservas; abrir o recurso revalida a autorização atual. A caixa é atualizada ao carregar/atualizar a página.

## Compartilhamento de quadro — 16/11/2026

- `GET /quadros/{id}/compartilhamento`: dono consulta existência/validade/revisão e opção de nomes; não retorna token.
- `POST /quadros/{id}/compartilhamento` com `{revision,names}`: dono publica uma cópia da versão salva, substituindo qualquer link anterior. Exige revisão atual e quadro não arquivado. `names` omitido/false remove nomes no servidor. Retorna token aleatório (32 bytes), validade de sete dias e revisão. Token original não é armazenado; somente SHA-256.
- `DELETE /quadros/{id}/compartilhamento`: revogação idempotente pelo dono, HTTP 204.
- `GET /quadros-compartilhados/{token}`: público, apenas leitura, retorna título/documento/revisão/validade; sem ID da conta, dados cadastrais ou acesso de escrita. Valida token, expiração, quadro ativo e conta ativa em cada consulta; inexistente/expirado/revogado retorna 404 genérico. `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow`.

Um link por quadro, snapshot independente de alterações posteriores. Arquivar remove o link e restaurar não o reativa. Excluir remove por FK cascade. A interface explica que o título é divulgado e permite optar por divulgar nomes; qualquer pessoa com o link poderá ler. Revogação impede novas consultas, mas não apaga cópias já obtidas. Criar novamente após resposta desconhecida substitui a tentativa anterior. O token não dá acesso a endpoints privados.
## Privacidade de convites — 17/11/2026

- `GET /convites/privacidade`: preferências e lista de remetentes bloqueados da conta autenticada (`enabled`, `blocked: [{id,username}]`). Padrão: novos convites habilitados.
- `PUT /convites/privacidade` com `{enabled: boolean}`: ativa/desativa novos convites; campo obrigatório. HTTP 204.
- `POST /convites/privacidade/bloqueios` com `{username}`: bloqueia novos convites desse remetente por nome de usuário exato, sem distinção de caixa; idempotente. Rejeita a própria conta, usuário inexistente e mais de 500 bloqueios. HTTP 204.
- `DELETE /convites/privacidade/bloqueios/{id}`: desfaz o bloqueio somente na conta autenticada, idempotente, HTTP 204.

Verificação feita dentro da transação de criação do convite, com trava por destinatário compartilhada com a alteração de preferências. Se a alteração de preferência termina primeiro, o novo convite observa essa alteração. Rejeição não cria convite nem notificação. O remetente recebe `INVITEE_UNAVAILABLE` genérico, sem motivo ou lista de bloqueios. Repetir um convite já existente retorna o original sem novo envio; configurações não invalidam convites anteriores nem impedem sua resposta. Avisos operacionais de reservas e participações não são desativados. Escopo é apenas convites para partidas, não bloqueio global de conta/chat/perfis.

## Descoberta voluntária e sessão — 17/11/2026

`GET /jogadores` retorna `{items,total,page,size}` com página fixa de 20, ordenação por nome público e ID; filtros `query`, `city`, `state`, `sport`, `level`, `date`, `period`, `page`. Nome/cidade ignoram caixa e acentos comuns. Nível exige esporte e usa o mesmo vínculo jogador-esporte. Período exige data (madrugada 00–06, manhã 06–12, tarde 12–18, noite 18–24); interseção com disponibilidade semanal declarada, conforme fuso de cada perfil. Não equivale a ausência de compromissos ou confirmação de presença. Sem filtro/ordenação por distância.

`GET /jogadores/{id}` consulta projeção pública por ID, com 404 uniforme para perfil ausente, privado, expirado ou conta inativa. DTO contém apenas ID de jogador, nome público escolhido, username, cidade/UF escolhidas, bio, esportes/níveis, fuso, validade e horários. Não consulta endereço residencial nem devolve CPF, e-mail, telefone, coordenadas ou imagem privada. Catálogos inativos são omitidos. Busca não publica automaticamente contas existentes.

`GET/PUT /jogadores/me/descoberta`: acesso autenticado ao próprio perfil; `visible,name,city,state,bio,timezone,validUntil,revision,slots:[{day,start,end}]`. Dias ISO 1–7, minutos 0–1440, até 28 intervalos não sobrepostos; validade até 90 dias; revisão otimista. Publicação exige ao menos um horário. Desativar ou vencer a validade retira busca e detalhe. Horários virando a meia-noite usam dois intervalos/dias. API pública e privada mantêm projeções separadas.

`GET /usuarios/sessao`: retorna apenas `{authenticated:true}` após validar JWT, conta ativa e versão de sessão. Cabeçalho, painel e controles contextuais usam validação real, sem tratar presença de cookie como autenticação; erro de infraestrutura não é apresentado como sessão confirmada. Memoização apenas dentro da renderização da requisição.

Perfil público permite escolher partida própria publicada/futura e enviar convite pela API existente. Preferências e bloqueios continuam aplicáveis. Dados de localização são texto de cidade/UF declarado, sem identificação municipal ou serviço geográfico neste incremento.

### Vínculo explícito de partida e reserva

- GET `/partidas/{id}/reservas-compativeis`: somente organizador, até 100 reservas da própria conta, confirmadas, esporte e município compatíveis, cobrindo todo o intervalo; exclui reserva já vinculada a outra partida.
- PUT `/partidas/{id}/reserva`: `{bookingId: number|null, version}`; null desvincula. Somente organizador, rascunho/publicada antes do início. Versão evita sobrescrita; locks arena → reserva → partida e índice único impedem duplo vínculo. Reserva externa/manual informada por texto continua sem confirmação de local.
- Detalhe da partida inclui `venue` (arena, espaço e status) e `canChangeVenue`. Apenas organizador recebe `venue.bookingId`; preço, cliente, motivo e pagamento não integram a projeção pública.
- Vínculo/desvinculação e cancelamento da reserva emitem avisos internos ao organizador/participantes ativos. Cancelamento da reserva atualiza status exibido e versão da partida, sem cancelar partida/inscrições. Desvincular ou cancelar partida não cancela nem estorna reserva.
- Não há criação automática de reserva nem cobrança por vincular. Edição de horário e aprovação de participantes ainda pendentes.
