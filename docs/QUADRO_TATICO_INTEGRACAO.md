# Integração do quadro

Origem: `feat/quadro-tatico` (`7fa77dc02ef155352bc458cce80767fb14643506`). Foram incorporados somente página, editor, modelo, CSS module, testes do modelo e documentação original. Cabeçalho, autenticação e providers atuais foram preservados.

O formato JSON continua na versão original do modelo, com validação de importação e limites de 1 MB/200 desenhos. Não há conversão de HTML legado. O salvamento continua explícito no navegador; importar/restaurar é escolha do usuário. Não há sincronização entre contas/dispositivos neste incremento.

Além de arraste e teclado, selecionar uma peça e clicar/tocar em um ponto vazio move a peça como uma operação desfazível. Coordenadas respeitam os mesmos limites do arraste. Modalidades e presets mantêm as fontes e ressalvas em `arenageo/docs/quadro-tatico.md`; não se afirma certificação oficial de dimensões ou capacidade.

Pendente: biblioteca remota, validação JSON no servidor, revisão otimista, compartilhamento revogável, contexto de time/partida, cenas, autosave offline e validação visual em dispositivos.
