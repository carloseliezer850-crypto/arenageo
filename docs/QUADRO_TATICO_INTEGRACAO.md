# Integração do quadro

**Banco atualizado em 13/11/2026:** migrations desta branch aplicadas no Supabase, incluindo isolamento da extensão. Histórico e verificações em [APLICACAO_SUPABASE.md](APLICACAO_SUPABASE.md). Menções a migrations pendentes abaixo registram o estado anterior.

Origem: `feat/quadro-tatico` (`7fa77dc02ef155352bc458cce80767fb14643506`). Foram incorporados somente página, editor, modelo, CSS module, testes do modelo e documentação original. Cabeçalho, autenticação e providers atuais foram preservados.

O formato JSON continua na versão original do modelo, com validação de importação e limites de 1 MB/200 desenhos. Não há conversão de HTML legado. O salvamento continua explícito no navegador; importar/restaurar é escolha do usuário. Não há sincronização entre contas/dispositivos neste incremento.

Além de arraste e teclado, selecionar uma peça e clicar/tocar em um ponto vazio move a peça como uma operação desfazível. Coordenadas respeitam os mesmos limites do arraste. Modalidades e presets mantêm as fontes e ressalvas em `arenageo/docs/quadro-tatico.md`; não se afirma certificação oficial de dimensões ou capacidade.

Pendente: biblioteca remota, validação JSON no servidor, revisão otimista, compartilhamento revogável, contexto de time/partida, cenas, autosave offline e validação visual em dispositivos.


## Salvamento privado na conta — 13/11/2026

`tb_quadro_tatico` guarda proprietário, UUID, título, documento v1, revisão otimista, arquivamento e atualização. RLS e revogação de acesso Data API; o backend Spring autoriza cada leitura/escrita. Biblioteca limitada a 100 quadros por conta, pesquisa por título, abertura, renomeação pelo título do editor, cópia, arquivamento/restauração e exclusão confirmada. Não há importação automática do localStorage.

O servidor valida o JSON: versão, modalidade/perfil, formações e limites por lado, identidade das peças, nome/número limitados, coordenadas finitas normalizadas, bola e até 200 desenhos; tamanho até 1 MB. Documento malformado não substitui o anterior. Criação/atualização usam Idempotency-Key; atualização exige a revisão vigente. Resposta perdida permite repetir o mesmo envio. Conflito pausa o autosave e preserva o editor; usuário pode abrir a revisão da conta ou salvar uma cópia.

Autosave de 1,5 segundo após mudança e fora de gesto ativo; só começa depois de salvar/abrir um quadro na conta. Falha não é apresentada como sincronização concluída. Salvar no navegador, exportar JSON/PNG e histórico local permanecem disponíveis e independentes. Abrir outro quadro pede confirmação quando o editor diverge do último salvo. Aviso de saída do navegador quando há quadro remoto modificado.

Ainda pendentes: tags/miniaturas, cenas, vínculo com partida/elenco, compartilhamento revogável, importação compatível de formatos externos, modos visuais adicionais e colaboração em tempo real. Os quadros neste incremento são estritamente privados; não há link público.
