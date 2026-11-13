export type Modalidade = "futsal" | "society" | "futebol";
export type Lado = 0 | 1;
export type Ponto = { x: number; y: number };
export type Jogador = Ponto & {
  id: string;
  lado: Lado;
  numero: string;
  nome: string;
};
export type Marcacao = {
  id: string;
  tipo: "seta" | "passe" | "zona";
  inicio: Ponto;
  fim: Ponto;
};
export type Perfil = {
  id: string;
  nome: string;
  comprimento: number;
  largura: number;
  limite: number;
  treino?: boolean;
};
export const MODALIDADES: Record<
  Modalidade,
  { nome: string; perfis: Perfil[] }
> = {
  futsal: {
    nome: "Futsal",
    perfis: [
      {
        id: "pequena",
        nome: "Pequena",
        comprimento: 25,
        largura: 16,
        limite: 5,
      },
      { id: "media", nome: "Média", comprimento: 38, largura: 20, limite: 5 },
      { id: "grande", nome: "Grande", comprimento: 42, largura: 25, limite: 5 },
      {
        id: "treino",
        nome: "Treino reduzido · 3 × 3",
        comprimento: 20,
        largura: 16,
        limite: 3,
        treino: true,
      },
    ],
  },
  society: {
    nome: "Society / Futebol 7",
    perfis: [
      {
        id: "pequena",
        nome: "Pequena",
        comprimento: 45,
        largura: 25,
        limite: 7,
      },
      { id: "media", nome: "Média", comprimento: 50, largura: 30, limite: 7 },
      { id: "grande", nome: "Grande", comprimento: 55, largura: 35, limite: 7 },
      {
        id: "treino",
        nome: "Treino reduzido · 5 × 5",
        comprimento: 30,
        largura: 20,
        limite: 5,
        treino: true,
      },
    ],
  },
  futebol: {
    nome: "Futebol de campo",
    perfis: [
      {
        id: "pequena",
        nome: "Pequeno",
        comprimento: 90,
        largura: 45,
        limite: 11,
      },
      { id: "media", nome: "Médio", comprimento: 105, largura: 68, limite: 11 },
      {
        id: "grande",
        nome: "Grande",
        comprimento: 120,
        largura: 90,
        limite: 11,
      },
      {
        id: "treino",
        nome: "Treino reduzido · 7 × 7",
        comprimento: 60,
        largura: 45,
        limite: 7,
        treino: true,
      },
    ],
  },
};
// Os números representam jogadores de linha. O goleiro é acrescentado separadamente.
export const FORMACOES: Record<number, string[]> = {
  3: ["1-1", "2-0", "0-2"],
  5: ["3-1", "2-2", "1-2-1", "4-0", "2-1-1", "1-3"],
  7: ["2-3-1", "3-2-1", "2-2-2", "3-1-2", "2-1-2-1", "1-3-2", "4-1-1", "3-3"],
  11: [
    "4-3-3",
    "4-4-2",
    "4-2-3-1",
    "4-1-4-1",
    "4-4-1-1",
    "4-1-2-1-2",
    "4-3-1-2",
    "4-2-2-2",
    "4-5-1",
    "3-5-2",
    "3-4-3",
    "3-4-2-1",
    "3-4-1-2",
    "3-3-1-3",
    "5-3-2",
    "5-4-1",
    "5-2-3",
    "4-2-4",
    "3-2-2-3",
    "2-3-5",
  ],
};
export type Quadro = {
  versao: 1;
  modalidade: Modalidade;
  perfil: string;
  formacoes: [string, string];
  jogadores: Jogador[];
  bola: Ponto;
  marcacoes: Marcacao[];
  adversario: boolean;
};
export const limitar = (n: number, min = 0.035, max = 0.965) =>
  Math.max(min, Math.min(max, n));
export function obterPerfil(q: Pick<Quadro, "modalidade" | "perfil">): Perfil {
  return MODALIDADES[q.modalidade].perfis.find((p) => p.id === q.perfil)!;
}
export function linhasFormacao(texto: string, limite: number): number[] | null {
  if (!/^\d{1,2}(?:-\d{1,2}){0,5}$/.test(texto)) return null;
  const linhas = texto.split("-").map(Number);
  return linhas.reduce((a, b) => a + b, 0) === limite - 1 ? linhas : null;
}
export function posicionar(
  jogadores: Jogador[],
  lado: Lado,
  formacao: string,
): Jogador[] {
  const grupo = jogadores.filter((p) => p.lado === lado);
  const linhas = linhasFormacao(formacao, grupo.length);
  if (!linhas) return jogadores;
  const posicoes: Ponto[] = [{ x: 0.07, y: 0.5 }];
  linhas.forEach((n, i) => {
    for (let j = 0; j < n; j++)
      posicoes.push({
        x: linhas.length === 1 ? 0.43 : 0.22 + (i * 0.46) / (linhas.length - 1),
        y: n === 1 ? 0.5 : 0.14 + (j * 0.72) / (n - 1),
      });
  });
  let i = 0;
  return jogadores.map((p) => {
    if (p.lado !== lado) return p;
    const ponto = posicoes[i++];
    return { ...p, x: lado ? 1 - ponto.x : ponto.x, y: ponto.y };
  });
}
export function criarQuadro(
  modalidade: Modalidade = "futebol",
  perfil = "media",
  anterior?: Quadro,
): Quadro {
  const limite = obterPerfil({ modalidade, perfil }).limite;
  const formacoes = [0, 1].map((lado) => {
    const atual = anterior?.formacoes[lado];
    return atual && linhasFormacao(atual, limite)
      ? atual
      : FORMACOES[limite][lado];
  }) as [string, string];
  let jogadores: Jogador[] = [];
  for (const lado of [0, 1] as const)
    for (let i = 0; i < limite; i++) {
      const id = `${lado}-${i}`;
      const antigo = anterior?.jogadores.find((p) => p.id === id);
      jogadores.push({
        id,
        lado,
        numero: antigo?.numero ?? String(i + 1),
        nome: antigo?.nome ?? "",
        x: 0,
        y: 0,
      });
    }
  for (const lado of [0, 1] as const)
    jogadores = posicionar(jogadores, lado, formacoes[lado]);
  return {
    versao: 1,
    modalidade,
    perfil,
    formacoes,
    jogadores,
    bola: { x: 0.5, y: 0.5 },
    marcacoes: [],
    adversario: anterior?.adversario ?? true,
  };
}
// Reconstrução explícita impede que JSON arbitrário entre no estado da interface.
export function importarQuadro(texto: string): Quadro {
  const q = JSON.parse(texto) as Quadro;
  if (
    !q ||
    q.versao !== 1 ||
    !Object.hasOwn(MODALIDADES, q.modalidade) ||
    !MODALIDADES[q.modalidade].perfis.some((p) => p.id === q.perfil)
  )
    throw Error("Modalidade ou tamanho inválido.");
  const perfil = obterPerfil(q);
  const pontoValido = (p: Ponto) =>
    p &&
    Number.isFinite(p.x) &&
    Number.isFinite(p.y) &&
    p.x >= 0 &&
    p.x <= 1 &&
    p.y >= 0 &&
    p.y <= 1;
  if (
    !Array.isArray(q.formacoes) ||
    q.formacoes.length !== 2 ||
    q.formacoes.some(
      (f) => typeof f !== "string" || !linhasFormacao(f, perfil.limite),
    )
  )
    throw Error("Formação incompatível com o limite de jogadores.");
  const base = criarQuadro(q.modalidade, q.perfil);
  if (
    !Array.isArray(q.jogadores) ||
    q.jogadores.length !== base.jogadores.length ||
    new Set(q.jogadores.map((p) => p.id)).size !== q.jogadores.length
  )
    throw Error("Quantidade de jogadores inválida.");
  base.jogadores = base.jogadores.map((p) => {
    const j = q.jogadores.find((j) => j.id === p.id);
    if (
      !j ||
      j.lado !== p.lado ||
      !pontoValido(j) ||
      typeof j.nome !== "string" ||
      typeof j.numero !== "string" ||
      j.nome.length > 22 ||
      j.numero.length > 3
    )
      throw Error("Jogador inválido.");
    return {
      ...p,
      nome: j.nome,
      numero: j.numero,
      x: limitar(j.x),
      y: limitar(j.y),
    };
  });
  if (
    !pontoValido(q.bola) ||
    typeof q.adversario !== "boolean" ||
    !Array.isArray(q.marcacoes) ||
    q.marcacoes.length > 200
  )
    throw Error("Quadro inválido.");
  base.marcacoes = q.marcacoes.map((m, i) => {
    if (
      !m ||
      !["seta", "passe", "zona"].includes(m.tipo) ||
      !pontoValido(m.inicio) ||
      !pontoValido(m.fim)
    )
      throw Error("Desenho inválido.");
    return {
      id: `importada-${i}`,
      tipo: m.tipo,
      inicio: { x: m.inicio.x, y: m.inicio.y },
      fim: { x: m.fim.x, y: m.fim.y },
    };
  });
  return {
    ...base,
    formacoes: [...q.formacoes],
    bola: { x: limitar(q.bola.x), y: limitar(q.bola.y) },
    adversario: q.adversario,
  };
}
