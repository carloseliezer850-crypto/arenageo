import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const codigo = ts.transpileModule(
  readFileSync(
    new URL("../src/components/quadro-tatico/modelo.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const {
  MODALIDADES,
  FORMACOES,
  criarQuadro,
  importarQuadro,
  linhasFormacao,
  posicionar,
} = await import(
  "data:text/javascript;base64," + Buffer.from(codigo).toString("base64")
);

test("todos os perfis respeitam limites, goleiros, formações e coordenadas", () => {
  for (const [modalidade, { perfis }] of Object.entries(MODALIDADES))
    for (const perfil of perfis) {
      const q = criarQuadro(modalidade, perfil.id);
      assert.equal(q.jogadores.length, perfil.limite * 2);
      for (const lado of [0, 1]) {
        assert.equal(
          q.jogadores.filter((p) => p.lado === lado).length,
          perfil.limite,
        );
        for (const formacao of FORMACOES[perfil.limite]) {
          assert.ok(linhasFormacao(formacao, perfil.limite));
          const jogadores = posicionar(q.jogadores, lado, formacao);
          assert.ok(
            jogadores.every(
              (p) =>
                Number.isFinite(p.x) &&
                p.x > 0 &&
                p.x < 1 &&
                p.y > 0 &&
                p.y < 1,
            ),
          );
        }
      }
      assert.deepEqual(importarQuadro(JSON.stringify(q)), q);
    }
});
test("troca de modalidade preserva identidades e desfaz excedentes", () => {
  const q = criarQuadro();
  q.jogadores[0].nome = "Eliézer";
  const futsal = criarQuadro("futsal", "pequena", q);
  assert.equal(futsal.jogadores.length, 10);
  assert.equal(futsal.jogadores[0].nome, "Eliézer");
  assert.equal(criarQuadro("futsal", "grande", futsal).jogadores.length, 10);
  assert.equal(criarQuadro("futsal", "treino", futsal).jogadores.length, 6);
});
test("formações personalizadas rejeitam totais incorretos e sintaxe inválida", () => {
  assert.deepEqual(linhasFormacao("4-0", 5), [4, 0]);
  assert.deepEqual(linhasFormacao("1-1-1-1", 5), [1, 1, 1, 1]);
  for (const f of ["3-3-1", "4-3-3", "-1-5", "abc", "2--2"])
    assert.equal(linhasFormacao(f, 5), null);
});
test("importação bloqueia estado malformado sem confiar em tipos TS", () => {
  for (const alterar of [
    (q) => (q.modalidade = "__proto__"),
    (q) => (q.perfil = "inexistente"),
    (q) => q.jogadores.push(q.jogadores[0]),
    (q) => (q.jogadores[1].id = q.jogadores[0].id),
    (q) => (q.jogadores[0].x = 9),
    (q) => (q.formacoes = ["1-1", "1-1"]),
    (q) => (q.bola = null),
    (q) => (q.marcacoes = Array(201).fill({})),
    (q) => (q.jogadores[0].nome = "<".repeat(23)),
  ]) {
    const q = criarQuadro();
    alterar(q);
    assert.throws(() => importarQuadro(JSON.stringify(q)));
  }
});
