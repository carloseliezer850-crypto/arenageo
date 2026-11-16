# Aplicação no Supabase — atualizado em 16/11/2026

Projeto ArenaGeo: `uxvhscoqmttkffrmmkvn`. Aplicação autorizada pelo usuário e concluída em 13/11/2026, aproximadamente 16h12–16h14 (America/Sao_Paulo).

## Histórico aplicado

O conector gera a versão remota no instante da aplicação. Os arquivos de origem foram preservados; as versões abaixo identificam a correspondência exata. Não reaplicar arquivos porque seus prefixos diferem do histórico remoto. Antes de usar `db push`, reconciliar o histórico com esse mapeamento, incluindo migrations antigas aplicadas anteriormente via conector.

| Arquivo local (prefixo) | Nome | Versão remota |
|---|---|---|
| 20261112195223 | espacos_identidade_estavel | 20261113191218 |
| 20261113124110 | partidas_participacao | 20261113191232 |
| 20261113183256 | reservas_agenda_local | 20261113191245 |
| 20261113184401 | quadros_na_conta | 20261113191258 |
| 20261113191348 | isolar_extensao_btree_gist | 20261113191412 |
| 20261115170926 | convites_notificacoes | 20261115172454 |
| 20261116182624 | quadro_compartilhamento | 20261116183451 |

As quatro primeiras migrations foram aplicadas sem alteração do SQL já testado. O verificador apontou `btree_gist` em `public`; a quinta migration moveu a extensão para `extensions`, preservando a restrição de exclusão existente. As tabelas anteriores e os dados de clientes não foram excluídos ou substituídos.

## Verificações

- `tb_espaco.fl_ativo` presente, NOT NULL, default true.
- Sete novas tabelas presentes, todas com RLS habilitado e sem acesso SELECT/INSERT/UPDATE/DELETE/TRUNCATE por `anon` ou `authenticated`. A autorização permanece no backend Spring, conforme a arquitetura existente.
- `ex_reserva_sobreposicao` validada: GiST por espaço e intervalo `[início,fim+preparo)`, exceto canceladas.
- Teste no PostgreSQL remoto com tabela temporária criada a partir de `tb_reserva INCLUDING ALL`: sobreposição rejeitada com exclusion_violation; intervalo adjacente aceito. Transação revertida, sem reservas de teste nos dados persistentes.
- 30 testes backend passaram localmente com a nova migration, incluindo concorrência e restrição direta após mover a extensão.
- Advisor de segurança: nenhum ERROR/WARN. Restam 24 informações de RLS sem policies, intencionais porque as tabelas não são expostas aos clientes e o acesso ocorre pela API Spring. [Referência](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Advisor de performance: 28 informações de índices ainda sem uso; não remover os índices necessários a consultas/relacionamentos com base em estatísticas de um banco sem carga representativa. [Referência](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Estado de entrega

As migrations desta branch estão aplicadas no Supabase. Isso não faz merge nem deploy do frontend/backend: código permanece em `feat/plataforma-completa`, PR #5. Os recursos novos exigem executar essa versão da aplicação. Registros anteriores em outros documentos que descrevem migrations pendentes representam o estado anterior a esta aplicação.

## Convites e notificações — 15/11/2026

Migration aplicada após aprovação do [CI 43740689330](https://github.com/carloseliezer850-crypto/arenageo/actions/runs/43740689330), commit `89a3da56a2d97b72a2dac8bd8bec3cb6f3fd38c7`: 33 testes backend, 4 do modelo tático e 5 Playwright, além de typecheck, lint e build. O navegador validou leitura de notificação e envio/aceitação de convite entre contas isoladas.

`tb_notificacao` e `tb_partida_convite` presentes, com RLS habilitado e nenhum privilégio SELECT/INSERT/UPDATE/DELETE/TRUNCATE para anon/authenticated. Histórico remoto conferido. Advisor de segurança sem ERROR/WARN; 26 informações de RLS sem policies, compatíveis com a autorização exclusiva pela API Spring. Nenhum convite ou notificação de teste foi criado no banco remoto.

Os avisos são internos ao site; não há e-mail, push ou atualização em tempo real. A aplicação precisa executar o código desta branch para usar os novos recursos.

## Compartilhamento do quadro — 16/11/2026

Migration `quadro_compartilhamento` aplicada após aprovação do [CI 43929749765](https://github.com/carloseliezer850-crypto/arenageo/actions/runs/43929749765), commit `7f405d6d2ebc396588f5992dcbfaa45c0e1f8657`. Verificados histórico remoto, tabela `tb_quadro_compartilhamento`, RLS ativo e ausência de privilégios SELECT/INSERT/UPDATE/DELETE/TRUNCATE para anon/authenticated. Advisor de segurança sem ERROR/WARN, apenas 27 informações de RLS sem policies (acesso exclusivo pela API Spring). Nenhum quadro ou link de cliente foi publicado durante a aplicação.

35 testes backend, 4 do modelo tático e 5 Playwright aprovados, além de typecheck, lint e build. O teste no navegador abre um link em sessão anônima, verifica a ausência dos controles de edição, revoga pelo dono e confirma a indisponibilidade ao atualizar. Banco atualizado; aplicação ainda depende da versão da branch, sem merge/deploy.
