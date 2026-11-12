# Quadro Tático

Rota pública `/quadro-tatico`, com acesso pela navegação desktop e link no cabeçalho móvel. Componente React/TSX nativo; não usa iframe, HTML injetado nem dependências novas. Base visual: última prancheta leve (campo verde, azul/laranja, peças arrastáveis, setas e edição de nome/número).

## Modalidades e dimensões

| Modalidade | Pequeno | Médio | Grande | Jogadores por equipe |
| --- | --- | --- | --- | --- |
| Futsal | 25 × 16 m | 38 × 20 m | 42 × 25 m | 5 |
| Society/Fut7 | 45 × 25 m | 50 × 30 m | 55 × 35 m | 7 |
| Futebol | 90 × 45 m | 105 × 68 m | 120 × 90 m | 11 |

Todos os totais incluem um goleiro. Pequeno/médio/grande são nomes de presets do produto, não categorias oficiais. Dimensões válidas em regras gerais não garantem homologação para qualquer competição. Futsal internacional exige 38–42 × 20–25 m; a CBFS estabelece mínimos por categoria. Futebol internacional usa 100–110 × 64–75 m. Society usa a referência CBF7S 2026; regulamentos de outras entidades/arenas podem variar.

A dimensão, isoladamente, não determina a quantidade oficial de jogadores. Por isso os tamanhos da mesma modalidade conservam o limite. Há um preset separado de **treino reduzido**, escolhido pelo produto: futsal 20 × 16 m, 3 por equipe; society 30 × 20 m, 5 por equipe; futebol 60 × 45 m, 7 por equipe. Não são regras de competição ou uma fórmula universal de lotação. O desenho é uma representação tática com principais marcações, não planta de homologação.

## Formações

Catálogo: 6 esquemas de futsal/5 jogadores, 8 de society/7 jogadores, 20 de futebol/11 jogadores e 3 para treino/3 jogadores. Os números excluem o goleiro. Inclui 3-1, 2-2, 1-2-1, 4-0; 2-3-1, 3-2-1, 2-2-2; 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2, variações e esquemas históricos. Não existe enumeração oficial e exaustiva de formações. O catálogo combina referências técnicas e variações matematicamente válidas; não implica que todo esquema seja igualmente comum ou recomendado.

Formações personalizadas aceitam até seis linhas, inclusive zero (ex.: 4-0), cuja soma deve corresponder ao número de jogadores de linha. Arraste livre permite assimetrias, variações com/sem bola e goleiro-linha mantendo o mesmo total. Trocar modalidade/tamanho reorganiza posições e limpa desenhos; Desfazer recupera o estado anterior. Nomes/números dos IDs que permanecem são preservados.

## Fontes consultadas em 11/11/2026

- [IFAB, Lei 1: dimensões](https://theifab.com/laws/latest/the-field-of-play/) e [Lei 3: jogadores](https://theifab.com/laws/latest/the-players/).
- [FA, futsal: dimensões](https://www.thefa.com/football-rules-governance/lawsandrules/laws/futsal/law-1---the-pitch) e [jogadores](https://www.thefa.com/football-rules-governance/lawsandrules/laws/futsal/law-3---the-number-of-players).
- [CBFS, diretrizes nacionais 2026](https://cbfs.com.br/cbfsadm/arquivos/Site/343_.pdf).
- [CBF7S, regras oficiais 2026, regras 1 e 3](https://ritmo-images.s3.amazonaws.com/images/arquivos/usuarios/5442/Livro_de_Regras_2026_CBF7S.pdf).
- [FIFA, manual de treinamento de futsal](https://www.fifatrainingcentre.com/media/native/community-area-document/resources/futsal/FIFA_GFD_Futsal_Coaching_Manual_PT.pdf) e [UEFA, manual de futsal](https://www.uefa.com/MultimediaFiles/Download/uefaorg/CoachingCoachedu/02/50/17/35/2501735_DOWNLOAD.pdf).
- [FIFA, 4-3-3 contra 5-3-2 e 3-5-2](https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/attacking-in-a-4-3-3-formation-v-5-3-2-defensive-set-up.php) e [4-2-3-1](https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/wing-play.php).
- [Squadcard, esquemas de 7 jogadores](https://squadcard.app/pt-br/guides/7-a-side-formations) (referência prática complementar, não regulamento).

## Estado e acessibilidade

Estado local, sem chamadas à API ou banco. Salvamento é explícito e restrito ao navegador; não está vinculado à conta. JSON versionado permite portabilidade, com validação de modalidade, tamanho, limites, coordenadas e duplicação de IDs. Arquivos antigos da prancheta HTML têm outro formato e não são compatíveis. Importação limitada a 1 MB/200 desenhos. Texto é renderizado pelo React, sem HTML injetado. PNG exporta o campo e desenhos.

Mouse/caneta/toque usam Pointer Events e captura no SVG. Cancelamento reverte o gesto. Cada gesto completo gera uma entrada no histórico (até 40). Tab/Enter selecionam peças; setas do teclado movem jogador/bola. Mensagens usam região de status acessível.

## Validação

- `node --test tests/quadro-tatico.test.mjs`: perfis, quantidades, formações, troca de modalidade e importações inválidas.
- `npx tsc --noEmit` e `npm run lint`.
- Roteiro manual: acessar a aba no desktop e celular; alternar modalidades/tamanhos; arrastar jogador e bola; desenhar seta/passe/zona; apagar; desfazer/refazer; editar nomes; salvar/restaurar; exportar PNG/JSON e reimportar.
