"use client";

import { useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import {
  criarQuadro,
  FORMACOES,
  importarQuadro,
  limitar,
  linhasFormacao,
  MODALIDADES,
  obterPerfil,
  posicionar,
  type Lado,
  type Marcacao,
  type Modalidade,
  type Ponto,
  type Quadro,
} from "./modelo";
import styles from "./quadro.module.css";
import { QuadrosConta } from "./QuadrosConta";

type Ferramenta = "mover" | Marcacao["tipo"] | "apagar";
type Arraste = {
  ponteiro: number;
  inicio: Ponto;
  anterior: Quadro;
  alvo?: string;
  ferramenta: Ferramenta;
  mudou: boolean;
};
const EQUIPES = ["Azul", "Laranja"];
const CHAVE = "arenageo-quadro-tatico-v1";

export function QuadroTatico({ connected = false }: { connected?: boolean }) {
  const [gesture, setGesture] = useState(false);
  const [quadro, setQuadro] = useState<Quadro>(() => criarQuadro());
  const [selecionado, selecionar] = useState<string | null>(null);
  const [ferramenta, setFerramenta] = useState<Ferramenta>("mover");
  const [previa, setPrevia] = useState<Marcacao | null>(null);
  const [passado, setPassado] = useState<Quadro[]>([]);
  const [futuro, setFuturo] = useState<Quadro[]>([]);
  const [personalizada, setPersonalizada] = useState("");
  const [ladoPersonalizado, setLadoPersonalizado] = useState<Lado>(0);
  const [mensagem, setMensagem] = useState(
    "Selecione uma peça e toque no destino, arraste ou use as setas do teclado.",
  );
  const svg = useRef<SVGSVGElement>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  const arraste = useRef<Arraste | null>(null);
  const perfil = obterPerfil(quadro);
  const largura = 920;
  const altura = (largura * perfil.largura) / perfil.comprimento;
  const h = altura + 40;
  const jogador = quadro.jogadores.find((p) => p.id === selecionado);
  const projetar = (p: Ponto) => ({
    x: 20 + p.x * largura,
    y: 20 + p.y * altura,
  });

  function lembrar(q: Quadro) {
    setPassado((p) => [...p.slice(-39), q]);
    setFuturo([]);
  }
  function mudar(q: Quadro) {
    lembrar(quadro);
    setQuadro(q);
  }
  function desfazer() {
    if (!passado.length || arraste.current) return;
    setFuturo((p) => [...p, quadro]);
    setQuadro(passado[passado.length - 1]);
    setPassado((p) => p.slice(0, -1));
    selecionar(null);
  }
  function refazer() {
    if (!futuro.length || arraste.current) return;
    setPassado((p) => [...p, quadro]);
    setQuadro(futuro[futuro.length - 1]);
    setFuturo((p) => p.slice(0, -1));
    selecionar(null);
  }
  function configurar(modalidade: Modalidade, tamanho: string) {
    mudar(criarQuadro(modalidade, tamanho, quadro));
    selecionar(null);
    setMensagem(
      "Campo e equipes reorganizados. Desfazer recupera a jogada anterior.",
    );
  }
  function formar(lado: Lado, formacao: string) {
    if (!linhasFormacao(formacao, perfil.limite)) {
      setMensagem(
        `A formação deve somar ${perfil.limite - 1} jogadores de linha. Exemplo: ${FORMACOES[perfil.limite][0]}.`,
      );
      return;
    }
    const formacoes: [string, string] = [...quadro.formacoes];
    formacoes[lado] = formacao;
    mudar({
      ...quadro,
      formacoes,
      jogadores: posicionar(quadro.jogadores, lado, formacao),
    });
    setMensagem(
      "Formação aplicada. O goleiro está incluído no total da equipe.",
    );
  }
  function ponto(e: PointerEvent<SVGSVGElement>): Ponto {
    const matriz = svg.current?.getScreenCTM();
    if (!matriz) return { x: 0.5, y: 0.5 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      matriz.inverse(),
    );
    return {
      x: limitar((p.x - 20) / largura, 0, 1),
      y: limitar((p.y - 20) / altura, 0, 1),
    };
  }
  function iniciar(e: PointerEvent<SVGSVGElement>) {
    if (e.button !== 0 || arraste.current) return;
    const alvo = (e.target as Element)
      .closest("[data-peca]")
      ?.getAttribute("data-peca");
    const marca = (e.target as Element)
      .closest("[data-marca]")
      ?.getAttribute("data-marca");
    if (ferramenta === "apagar") {
      if (marca)
        mudar({
          ...quadro,
          marcacoes: quadro.marcacoes.filter((m) => m.id !== marca),
        });
      return;
    }
    if (ferramenta === "mover") {
      if (!alvo) {
        if (selecionado) {
          const posicao = ponto(e);
          const destino = { x: limitar(posicao.x), y: limitar(posicao.y) };
          mudar({
            ...quadro,
            bola: selecionado === "bola" ? destino : quadro.bola,
            jogadores: quadro.jogadores.map((j) =>
              j.id === selecionado ? { ...j, ...destino } : j,
            ),
          });
          setMensagem(
            "Peça posicionada. Desfazer recupera a posição anterior.",
          );
          selecionar(null);
        }
        return;
      }
      selecionar(alvo);
    }
    if (ferramenta !== "mover" && quadro.marcacoes.length >= 200) {
      setMensagem("Limite de 200 desenhos. Apague alguns para continuar.");
      return;
    }
    setGesture(true);
    arraste.current = {
      ponteiro: e.pointerId,
      inicio: ponto(e),
      anterior: quadro,
      alvo: alvo ?? undefined,
      ferramenta,
      mudou: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function mover(e: PointerEvent<SVGSVGElement>) {
    const d = arraste.current;
    if (!d || d.ponteiro !== e.pointerId) return;
    const p = ponto(e),
      dx = p.x - d.inicio.x,
      dy = p.y - d.inicio.y;
    if (Math.hypot(dx * largura, dy * altura) < 2 && !d.mudou) return;
    d.mudou = true;
    if (d.ferramenta === "mover") {
      const deslocar = (origem: Ponto) => ({
        x: limitar(origem.x + dx),
        y: limitar(origem.y + dy),
      });
      setQuadro({
        ...d.anterior,
        bola: d.alvo === "bola" ? deslocar(d.anterior.bola) : d.anterior.bola,
        jogadores: d.anterior.jogadores.map((j) =>
          j.id === d.alvo ? { ...j, ...deslocar(j) } : j,
        ),
      });
    } else if (d.ferramenta !== "apagar")
      setPrevia({ id: "previa", tipo: d.ferramenta, inicio: d.inicio, fim: p });
  }
  function terminar(e: PointerEvent<SVGSVGElement>, cancelar = false) {
    const d = arraste.current;
    if (!d || d.ponteiro !== e.pointerId) return;
    if (cancelar) setQuadro(d.anterior);
    else if (d.mudou) {
      if (d.ferramenta === "mover") lembrar(d.anterior);
      else if (
        previa &&
        Math.hypot(
          (previa.fim.x - previa.inicio.x) * largura,
          (previa.fim.y - previa.inicio.y) * altura,
        ) > 12
      ) {
        lembrar(d.anterior);
        setQuadro({
          ...d.anterior,
          marcacoes: [
            ...d.anterior.marcacoes,
            { ...previa, id: crypto.randomUUID() },
          ],
        });
      }
    }
    arraste.current = null;
    setGesture(false);
    setPrevia(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function teclado(e: KeyboardEvent<SVGGElement>, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selecionar(id);
      return;
    }
    const passos: Record<string, Ponto> = {
      ArrowLeft: { x: -0.01, y: 0 },
      ArrowRight: { x: 0.01, y: 0 },
      ArrowUp: { x: 0, y: -0.01 },
      ArrowDown: { x: 0, y: 0.01 },
    };
    const passo = passos[e.key];
    if (!passo) return;
    e.preventDefault();
    selecionar(id);
    const alterar = (p: Ponto) => ({
      x: limitar(p.x + passo.x),
      y: limitar(p.y + passo.y),
    });
    mudar({
      ...quadro,
      bola: id === "bola" ? alterar(quadro.bola) : quadro.bola,
      jogadores: quadro.jogadores.map((j) =>
        j.id === id ? { ...j, ...alterar(j) } : j,
      ),
    });
  }
  function desenhar(m: Marcacao) {
    const a = projetar(m.inicio),
      b = projetar(m.fim);
    if (m.tipo === "zona")
      return (
        <rect
          x={Math.min(a.x, b.x)}
          y={Math.min(a.y, b.y)}
          width={Math.abs(b.x - a.x)}
          height={Math.abs(b.y - a.y)}
          fill="#ffe16b"
          fillOpacity=".18"
          stroke="#ffe16b"
          strokeWidth="3"
        />
      );
    const angulo = Math.atan2(b.y - a.y, b.x - a.x);
    return (
      <>
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="transparent"
          strokeWidth="22"
        />
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="#ffe16b"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={m.tipo === "passe" ? "12 9" : undefined}
        />
        <polygon
          fill="#ffe16b"
          points={`${b.x},${b.y} ${b.x - 15 * Math.cos(angulo - 0.55)},${b.y - 15 * Math.sin(angulo - 0.55)} ${b.x - 15 * Math.cos(angulo + 0.55)},${b.y - 15 * Math.sin(angulo + 0.55)}`}
        />
      </>
    );
  }
  function baixar(blob: Blob, nome: string) {
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function salvarLocal() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(quadro));
      setMensagem(
        "Quadro salvo neste navegador. Exporte JSON para levar a outro dispositivo.",
      );
    } catch {
      setMensagem(
        "Não foi possível salvar neste navegador. Use Exportar JSON.",
      );
    }
  }
  function restaurarLocal() {
    try {
      const texto = localStorage.getItem(CHAVE);
      if (!texto) {
        setMensagem("Nenhum quadro salvo neste navegador.");
        return;
      }
      mudar(importarQuadro(texto));
      selecionar(null);
      setMensagem("Quadro restaurado.");
    } catch {
      setMensagem("Não foi possível restaurar o quadro salvo.");
    }
  }
  async function abrirArquivo(file?: File) {
    if (!file) return;
    if (file.size > 1_000_000) {
      setMensagem("O arquivo deve ter até 1 MB.");
      return;
    }
    try {
      mudar(importarQuadro(await file.text()));
      selecionar(null);
      setMensagem("Quadro importado.");
    } catch {
      setMensagem(
        "Arquivo inválido. Use um JSON exportado pelo Quadro Tático do ArenaGeo.",
      );
    }
  }
  function exportarPng() {
    if (!svg.current) return;
    const copia = svg.current.cloneNode(true) as SVGSVGElement;
    copia.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copia.setAttribute("width", "960");
    copia.setAttribute("height", String(h));
    copia.querySelectorAll("[data-selecao]").forEach((n) => n.remove());
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(copia)], {
        type: "image/svg+xml",
      }),
    );
    const imagem = new Image();
    imagem.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = Math.round(h * 2);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) baixar(blob, "arenageo-quadro-tatico.png");
        else setMensagem("Não foi possível gerar a imagem.");
      });
    };
    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      setMensagem("Não foi possível gerar a imagem.");
    };
    imagem.src = url;
  }
  const bola = projetar(quadro.bola);
  const escala = largura / perfil.comprimento;
  const centro = h / 2;
  return (
    <section className={styles.quadro} aria-label="Editor de quadro tático">
      <div className={styles.topo}>
        <div>
          <strong>Prancheta tática</strong>
          <span>Planeje o próximo lance</span>
        </div>
        <span className={styles.selo}>
          {perfil.limite} × {perfil.limite} · {perfil.comprimento} ×{" "}
          {perfil.largura} m
        </span>
      </div>
      <div className={styles.barra}>
        <label>
          Modalidade{" "}
          <select
            value={quadro.modalidade}
            onChange={(e) => configurar(e.target.value as Modalidade, "media")}
          >
            {Object.entries(MODALIDADES).map(([id, m]) => (
              <option key={id} value={id}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tamanho{" "}
          <select
            value={quadro.perfil}
            onChange={(e) => configurar(quadro.modalidade, e.target.value)}
          >
            {MODALIDADES[quadro.modalidade].perfis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} · {p.comprimento} × {p.largura} m
              </option>
            ))}
          </select>
        </label>
        <span className={styles.dica}>
          {perfil.treino
            ? "Treino: limite definido pelo preset, não por regra oficial."
            : "O tamanho varia; o limite da modalidade permanece."}{" "}
          Inclui 1 goleiro por equipe.
        </span>
      </div>
      <div className={styles.barra}>
        {([0, 1] as const).map((lado) => (
          <label key={lado}>
            <span className={lado ? styles.laranja : styles.azul}>
              {EQUIPES[lado]}
            </span>
            <select
              aria-label={`Formação ${EQUIPES[lado]}`}
              value={quadro.formacoes[lado]}
              onChange={(e) => formar(lado, e.target.value)}
            >
              {[
                ...new Set([
                  ...FORMACOES[perfil.limite],
                  quadro.formacoes[lado],
                ]),
              ].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        ))}
        <label>
          <input
            type="checkbox"
            checked={quadro.adversario}
            onChange={(e) => {
              mudar({ ...quadro, adversario: e.target.checked });
              selecionar(null);
            }}
          />{" "}
          Adversário
        </label>
        <span className={styles.dica}>
          Formações indicam somente jogadores de linha.
        </span>
      </div>
      <details className={styles.detalhes}>
        <summary>Formação personalizada</summary>
        <form
          className={styles.barra}
          onSubmit={(e) => {
            e.preventDefault();
            formar(ladoPersonalizado, personalizada.trim());
          }}
        >
          <label>
            Equipe{" "}
            <select
              value={ladoPersonalizado}
              onChange={(e) =>
                setLadoPersonalizado(Number(e.target.value) as Lado)
              }
            >
              <option value="0">Azul</option>
              <option value="1">Laranja</option>
            </select>
          </label>
          <label>
            Linhas{" "}
            <input
              value={personalizada}
              maxLength={20}
              placeholder={FORMACOES[perfil.limite][0]}
              onChange={(e) => setPersonalizada(e.target.value)}
            />
          </label>
          <button>Aplicar</button>
          <span className={styles.dica}>
            Some {perfil.limite - 1} jogadores. Você também pode posicioná-los
            livremente.
          </span>
        </form>
      </details>
      <div className={styles.barra}>
        {(
          [
            ["mover", "✥ Mover"],
            ["seta", "↗ Seta"],
            ["passe", "⇢ Passe"],
            ["zona", "▣ Zona"],
            ["apagar", "⌫ Apagar"],
          ] as const
        ).map(([id, nome]) => (
          <button
            key={id}
            aria-pressed={ferramenta === id}
            className={ferramenta === id ? styles.ativo : ""}
            onClick={() => setFerramenta(id)}
          >
            {nome}
          </button>
        ))}
        <button disabled={!passado.length} onClick={desfazer}>
          ↶ Desfazer
        </button>
        <button disabled={!futuro.length} onClick={refazer}>
          ↷ Refazer
        </button>
        <button
          disabled={!quadro.marcacoes.length}
          onClick={() => mudar({ ...quadro, marcacoes: [] })}
        >
          Limpar desenhos
        </button>
        <button
          onClick={() => {
            mudar(criarQuadro(quadro.modalidade, quadro.perfil, quadro));
            selecionar(null);
          }}
        >
          Reiniciar posições
        </button>
      </div>
      <div className={styles.campo}>
        <svg
          ref={svg}
          viewBox={`0 0 960 ${h}`}
          role="group"
          aria-label={`Campo de ${MODALIDADES[quadro.modalidade].nome}, ${perfil.limite} jogadores por equipe`}
          onPointerDown={iniciar}
          onPointerMove={mover}
          onPointerUp={(e) => terminar(e)}
          onPointerCancel={(e) => terminar(e, true)}
          onLostPointerCapture={(e) => {
            if (arraste.current) terminar(e, true);
          }}
        >
          <rect width="960" height={h} fill="#1c7050" />
          {Array.from({ length: 4 }, (_, i) => (
            <rect
              key={i}
              x={20 + i * 230}
              y="20"
              width="115"
              height={altura}
              fill="#fff"
              opacity=".055"
            />
          ))}
          <g stroke="#effff1" strokeWidth="2.4" fill="none" opacity=".85">
            <rect x="20" y="20" width={largura} height={altura} />
            <path d={`M480 20V${altura + 20}`} />
            {quadro.modalidade !== "society" && (
              <circle
                cx="480"
                cy={centro}
                r={(quadro.modalidade === "futsal" ? 3 : 9.15) * escala}
              />
            )}
            {([0, 1] as const).map((lado) => (
              <g
                key={lado}
                transform={lado ? "translate(960 0) scale(-1 1)" : undefined}
              >
                {quadro.modalidade === "futsal" ? (
                  <>
                    <path
                      d={`M20 ${centro - 7.5 * escala} a${6 * escala} ${6 * escala} 0 0 1 ${6 * escala} ${6 * escala} v${3 * escala} a${6 * escala} ${6 * escala} 0 0 1 ${-6 * escala} ${6 * escala}`}
                    />
                    <circle
                      cx={20 + 6 * escala}
                      cy={centro}
                      r="3"
                      fill="#fff"
                    />
                    <circle
                      cx={20 + 10 * escala}
                      cy={centro}
                      r="3"
                      fill="#fff"
                    />
                  </>
                ) : quadro.modalidade === "society" ? (
                  <>
                    <rect
                      x="20"
                      y={centro - 7.5 * escala}
                      width={8 * escala}
                      height={15 * escala}
                    />
                    <path
                      d={`M${480 - 5 * escala} ${centro - 2.5 * escala} v${5 * escala}`}
                    />
                    <circle
                      cx={20 + 8 * escala}
                      cy={centro}
                      r="3"
                      fill="#fff"
                    />
                  </>
                ) : (
                  <>
                    <rect
                      x="20"
                      y={centro - 20.16 * escala}
                      width={16.5 * escala}
                      height={40.32 * escala}
                    />
                    <rect
                      x="20"
                      y={centro - 9.16 * escala}
                      width={5.5 * escala}
                      height={18.32 * escala}
                    />
                    <circle
                      cx={20 + 11 * escala}
                      cy={centro}
                      r="3"
                      fill="#fff"
                    />
                  </>
                )}
                <path
                  d={`M20 ${centro - (quadro.modalidade === "futsal" ? 1.5 : quadro.modalidade === "society" ? 2.5 : 3.66) * escala} H6 V${centro + (quadro.modalidade === "futsal" ? 1.5 : quadro.modalidade === "society" ? 2.5 : 3.66) * escala} H20`}
                />
              </g>
            ))}
            <circle cx="480" cy={centro} r="3" fill="#fff" />
          </g>
          {quadro.marcacoes.map((m) => (
            <g key={m.id} data-marca={m.id}>
              {desenhar(m)}
            </g>
          ))}
          {quadro.jogadores
            .filter((p) => p.lado === 0 || quadro.adversario)
            .map((p) => {
              const pos = projetar(p);
              return (
                <g
                  key={p.id}
                  data-peca={p.id}
                  transform={`translate(${pos.x} ${pos.y})`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${EQUIPES[p.lado]}, camisa ${p.numero}${p.id.endsWith("-0") ? ", goleiro" : ""}${p.nome ? ", " + p.nome : ""}`}
                  onFocus={() => selecionar(p.id)}
                  onKeyDown={(e) => teclado(e, p.id)}
                >
                  {selecionado === p.id && (
                    <circle
                      data-selecao="true"
                      r="25"
                      fill="none"
                      stroke="#ffe98c"
                      strokeWidth="3"
                    />
                  )}
                  <circle
                    r="19"
                    fill={p.lado ? "#ec7527" : "#327aef"}
                    stroke="#fff"
                    strokeWidth="2.5"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontSize="17"
                    fontWeight="800"
                    fontFamily="system-ui"
                    pointerEvents="none"
                  >
                    {p.numero}
                  </text>
                  {p.nome && (
                    <text
                      y="34"
                      textAnchor="middle"
                      fill="#fff"
                      stroke="#11442f"
                      strokeWidth="3"
                      paintOrder="stroke"
                      fontFamily="system-ui"
                      fontSize="12"
                      pointerEvents="none"
                    >
                      {p.nome}
                    </text>
                  )}
                </g>
              );
            })}
          <g
            data-peca="bola"
            transform={`translate(${bola.x} ${bola.y})`}
            tabIndex={0}
            role="button"
            aria-label="Bola"
            onFocus={() => selecionar("bola")}
            onKeyDown={(e) => teclado(e, "bola")}
          >
            {selecionado === "bola" && (
              <circle
                data-selecao="true"
                r="16"
                fill="none"
                stroke="#ffe98c"
                strokeWidth="3"
              />
            )}
            <circle r="11" fill="#fff" stroke="#28403f" strokeWidth="1.5" />
            <path d="M0 -6 L6 -1 L4 5 L-4 5 L-6 -1Z" fill="#28373a" />
          </g>
          {previa && (
            <g opacity=".6" pointerEvents="none">
              {desenhar(previa)}
            </g>
          )}
        </svg>
      </div>
      <div className={styles.barra}>
        <strong>
          {jogador
            ? `${EQUIPES[jogador.lado]} · Camisa ${jogador.numero}`
            : selecionado === "bola"
              ? "Bola selecionada"
              : "Selecione um jogador"}
        </strong>
        <label>
          Nº{" "}
          <input
            className={styles.numero}
            maxLength={3}
            disabled={!jogador}
            value={jogador?.numero ?? ""}
            onChange={(e) =>
              mudar({
                ...quadro,
                jogadores: quadro.jogadores.map((p) =>
                  p.id === selecionado ? { ...p, numero: e.target.value } : p,
                ),
              })
            }
          />
        </label>
        <label>
          Nome{" "}
          <input
            maxLength={22}
            disabled={!jogador}
            value={jogador?.nome ?? ""}
            onChange={(e) =>
              mudar({
                ...quadro,
                jogadores: quadro.jogadores.map((p) =>
                  p.id === selecionado ? { ...p, nome: e.target.value } : p,
                ),
              })
            }
          />
        </label>
      </div>
      <div className={styles.barra}>
        <button onClick={salvarLocal}>Salvar no navegador</button>
        <button onClick={restaurarLocal}>Restaurar salvo</button>
        <button
          onClick={() =>
            baixar(
              new Blob([JSON.stringify(quadro, null, 2)], {
                type: "application/json",
              }),
              "arenageo-quadro-tatico.json",
            )
          }
        >
          Exportar JSON
        </button>
        <button onClick={() => arquivo.current?.click()}>Importar JSON</button>
        <button onClick={exportarPng}>Baixar PNG</button>
        <input
          ref={arquivo}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            void abrirArquivo(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <QuadrosConta
        quadro={quadro}
        onLoad={mudar}
        gesture={gesture}
        connected={connected}
      />
      <p className={styles.status} role="status">
        {mensagem}
      </p>
    </section>
  );
}
