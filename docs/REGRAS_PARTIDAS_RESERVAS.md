# Partidas — incremento de 13/11/2026

**Banco atualizado em 13/11/2026:** migrations desta branch aplicadas no Supabase, incluindo isolamento da extensão. Histórico e verificações em [APLICACAO_SUPABASE.md](APLICACAO_SUPABASE.md). Menções a migrations pendentes abaixo registram o estado anterior.

## Implementado

Partida gratuita com local externo informado, cidade/UF, modalidade/nível reais, data/hora completa com zona IANA, duração de 15 a 480 minutos e capacidade total de 2 a 100 participantes. Isso não representa lotação oficial em campo. O organizador vem exclusivamente do principal autenticado e pode optar por ocupar uma vaga.

RASCUNHO é visível somente ao organizador. Publicar exige data futura; RASCUNHO e PUBLICADA podem ser cancelados pelo organizador com motivo. PUBLICADA pode ser concluída somente após o fim. Alterações de estado usam versão para impedir decisões sobre revisão antiga. Não há edição de horário/local após criação neste incremento.

A busca pública retorna somente PUBLICADA com início futuro, ordenada por início e ID; filtros cidade (sem distinção de caixa/acentos comuns), UF, esporte, nível e data local no fuso da partida. Página de 1–50 resultados; total e paginação no servidor. Detalhe consulta diretamente o ID. Rascunhos nunca entram na busca. Partidas públicas canceladas/concluídas continuam acessíveis pelo link.

## Vagas e fila

Toda entrada/saída adquire lock da partida; vínculo único por partida/conta. Duas tentativas da última vaga resultam em uma confirmação e uma entrada na fila. Repetir participação confirmada é idempotente. Entrada em outra partida conflitante é bloqueada por lock da conta e verificação de intervalos; intervalo adjacente não conflita.

Fila ordenada por instante de entrada e ID. A primeira pessoa da fila pode confirmar manualmente quando há vaga. Novos ingressos não passam à frente; repetir espera mantém posição. Não há promoção automática, aviso ou expiração da prioridade neste incremento. Isso é uma limitação operacional explícita: se a primeira pessoa não agir, a vaga permanece reservada à ordem da fila até ela sair. O frontend explica essa regra. Ao sair e voltar, a pessoa vai ao fim.

Uma vaga na partida **não é uma reserva de quadra**. Detalhe sempre informa local a confirmar. Não há preço, cobrança, contrato de cancelamento comercial ou reserva gerados implicitamente.

## Reenvios

POST exige Idempotency-Key, com escopo por conta e proteção transacional existente. Mesmo envio não recria a partida; payload diferente com a mesma chave gera conflito. Em resultado desconhecido, o formulário mantém os dados e a chave, permite repetir e aponta para Minhas partidas. Participação é PUT idempotente para estado já confirmado/ausente. Transição concorrente recebe VERSION_CONFLICT; frontend atualiza detalhe.

## Ainda pendente

Convites privados, aprovação pelo organizador, promoção automática/temporizada, edição/duplicação de rascunho, alteração com reconfirmação, presença e resultado, notificações/outbox, auditoria completa de eventos, elenco público com privacidade, vínculo arena/espaço/reserva, lista privada por membros, calendário e paginação do histórico pessoal além das 100 partidas mais recentes. Reservas com pagamento local foram implementadas no incremento abaixo. Pagamento online continua pendente.

## Reservas — pagamento no local

Implementado orçamento → revisão → confirmação imediata, sem cobrança online nem hold. A arena ativa explicitamente cada espaço, define tarifa por hora em centavos, duração fixa (30–240 minutos, múltiplos de 15), preparo (0–120 minutos), antecedência de cancelamento e condições. O total é calculado no servidor, proporcional à duração e arredondado para cima ao centavo. Valores e política aceitos são preservados na reserva.

Orçamento vinculado à conta, válido por dez minutos, não ocupa o horário. Confirmação revalida publicação, configuração/versionamento, validade, funcionamento e conflito. Mesmo orçamento não produz outra reserva, mesmo com outra chave; o endpoint também usa Idempotency-Key. Alteração de preço invalida orçamentos anteriores, sem alterar reservas confirmadas.

Reservas e bloqueios compartilham `tb_reserva` e exclusion constraint GiST por espaço e `tstzrange [início,fim+preparo)`. CONFIRMADA, CONCLUIDA e NAO_COMPARECEU preservam a ocupação histórica; CANCELADA libera. Mutex transacional da arena serializa confirmação, alterações de horários, configuração e bloqueios; a constraint é uma segunda proteção independente da API. Espaço multiuso tem uma só agenda. Não há subdivisão pai/filhos.

Horários regulares usam o fuso IANA da arena. Exceção da data substitui o funcionamento regular e corta à meia-noite intervalos herdados do dia anterior. Intervalos que atravessam meia-noite são suportados; horários ambíguos/inexistentes de DST não são oferecidos. Datas reserváveis limitadas aos próximos 180 dias. Indisponibilidade de consulta nunca vira horário livre.

Cliente e responsável consultam detalhe; outras contas recebem 404. Histórico pessoal paginado (20/página). Agenda diária da arena mostra reservas/bloqueios. Responsável cria bloqueio com motivo, sem sobrepor reserva. Alterar fuso, horários, exceções, despublicar ou remover espaço com reserva/bloqueio futuro exige resolver a agenda antes. Preços novos não alteram snapshots existentes.

Cancelamento exige motivo e versão; cliente respeita antecedência definida pela arena, responsável pode resolver exceções. Sem recebimento registrado, não há cobrança/reembolso online. Com RECEBIDO_LOCAL, cancelamento é bloqueado até resolução comercial (fluxo de devolução ainda pendente). Check-in manual do responsável: de 1 hora antes até o fim, uma vez. Conclusão/ausência somente após o fim; ausência incompatível com check-in. Registro de recebimento local é explícito, não integração de pagamento. Eventos preservam autor, ação, motivo e instante. Exportação ICS usa UID estável, SEQUENCE e UTC.

Limitações deste fluxo: tarifa única por espaço, duração fixa, agenda diária/lista, confirmação imediata e pagamento local. Reagendamento, reservas manuais para cliente sem conta, QR, devolução local, regras tarifárias por faixa, pagamentos online/holds, notificações e vínculo entre partida e reserva continuam pendentes. A migration é preparada e testada isoladamente; não aplicada ao Supabase remoto.
