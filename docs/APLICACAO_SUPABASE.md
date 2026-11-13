# Aplicação no Supabase — 13/11/2026

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
