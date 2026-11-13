# Partidas — incremento de 13/11/2026

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

Convites privados, aprovação pelo organizador, promoção automática/temporizada, edição/duplicação de rascunho, alteração com reconfirmação, presença e resultado, notificações/outbox, auditoria completa de eventos, elenco público com privacidade, vínculo arena/espaço/reserva, lista privada por membros, calendário e paginação do histórico pessoal além das 100 partidas mais recentes. Reservas e pagamentos continuam não implementados.
