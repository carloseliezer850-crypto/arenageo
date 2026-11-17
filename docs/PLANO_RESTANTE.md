# Continuação autorizada — 17/11/2026

O usuário autorizou executar os seis grupos abaixo na ordem. Não é necessário pedir novamente autorização para continuar implementando ou aplicar migrations do escopo no Supabase. Código em feat/plataforma-completa, PR #5; merge/deploy não fazem parte desta entrega.

| Grupo | Estado atual | Próximo resultado verificável |
|---|---|---|
| 1. Descoberta, ações e sessão | Implementação em validação: catálogo opt-in, disponibilidade, perfil público/convite, sessão real | CI completo; geografia por coordenadas e auditoria integral de todas as ações ainda não concluídas |
| 2. Partida → espaço → reserva, edição e aprovação | Pendente | Vínculo autorizado e consistente, atualização de status, edição versionada e aprovação |
| 3. Reagendamento e reserva manual | Pendente | Troca atômica sem perder horário anterior e balcão usando a mesma proteção contra sobreposição |
| 4. Times/elenco/quadro e cenas | Pendente | Papéis, convites, vínculo por IDs e sequência tática persistida |
| 5. Equipe, comunicação, avaliações, suporte e financeiro | Parcial apenas em convites/notificações/pagamento local | Permissões por arena, histórico e fluxos reais; provedor/recebedor precisam de definição para integração financeira externa |
| 6. Validação de lançamento | Parcial em testes automatizados | Cobertura de rotas, acessibilidade, desempenho, restauração e usabilidade observada |

Não confundir todos os testes implementados passando com conclusão de todos os requisitos. Não incluir dados residenciais em projeções públicas. Pagamento local continua válido enquanto a operação online não estiver definida. Provedores e testes com usuários não devem ser simulados como entregues.
