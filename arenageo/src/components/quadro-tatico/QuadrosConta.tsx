"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  abrirQuadro,
  arquivarQuadro,
  excluirQuadro,
  listarQuadros,
  salvarQuadro,
  type ResumoQuadro,
} from "@/services/servicoQuadro";
import { importarQuadro, type Quadro } from "./modelo";
type Pending = {
  id: string | null;
  title: string;
  document: Quadro;
  revision: number;
  key: string;
};
export function QuadrosConta({
  quadro,
  onLoad,
  gesture,
  connected,
}: {
  quadro: Quadro;
  onLoad: (q: Quadro) => void;
  gesture: boolean;
  connected: boolean;
}) {
  const [title, setTitle] = useState(""),
    [current, setCurrent] = useState<{ id: string; revision: number } | null>(
      null,
    ),
    [saved, setSaved] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(
      "Este quadro está apenas no editor. Salve na conta para abrir em outro dispositivo.",
    ),
    [paused, setPaused] = useState(false),
    [unknown, setUnknown] = useState(false),
    [auto, setAuto] = useState(true),
    [items, setItems] = useState<ResumoQuadro[]>([]),
    [query, setQuery] = useState(""),
    [archived, setArchived] = useState(false);
  const pending = useRef<Pending | null>(null),
    lock = useRef(false);
  const snapshot = JSON.stringify({ title, document: quadro });
  const dirty = snapshot !== saved;
  const save = useCallback(
    async (copy = false) => {
      if (lock.current || gesture) return;
      if (!title.trim()) {
        setMessage("Informe um título para salvar na conta.");
        return;
      }
      lock.current = true;
      setBusy(true);
      setMessage("Salvando na conta…");
      const request = pending.current ?? {
        id: copy ? null : (current?.id ?? null),
        title,
        document: quadro,
        revision: copy ? 0 : (current?.revision ?? 0),
        key: crypto.randomUUID(),
      };
      pending.current = request;
      try {
        const r = await salvarQuadro(
          request.id,
          request.title,
          request.document,
          request.revision,
          request.key,
        );
        if (r.ok) {
          setCurrent({ id: r.data.id, revision: r.data.revision });
          setSaved(
            JSON.stringify({
              title: request.title,
              document: request.document,
            }),
          );
          pending.current = null;
          setPaused(false);
          setUnknown(false);
          setMessage("Salvo na conta.");
        } else {
          setPaused(true);
          setUnknown(r.unknown);
          if (!r.unknown) pending.current = null;
          setMessage(r.message);
        }
      } finally {
        lock.current = false;
        setBusy(false);
      }
    },
    [current, gesture, quadro, title],
  );
  useEffect(() => {
    if (
      !connected ||
      !current ||
      !auto ||
      paused ||
      busy ||
      gesture ||
      !dirty ||
      !title.trim()
    )
      return;
    const timer = setTimeout(() => {
      void save();
    }, 1500);
    return () => clearTimeout(timer);
  }, [
    connected,
    current,
    auto,
    paused,
    busy,
    gesture,
    dirty,
    title,
    snapshot,
    save,
  ]);
  useEffect(() => {
    if (!current || !dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [current, dirty]);
  async function library() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await listarQuadros(query, archived);
      if (r.ok) setItems(r.data);
      else setMessage(r.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function open(id: string) {
    if (lock.current || pending.current) return;
    if (
      dirty &&
      !window.confirm(
        "Abrir a versão da conta substituirá o quadro no editor. Deseja continuar?",
      )
    )
      return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await abrirQuadro(id);
      if (r.ok) {
        const q = importarQuadro(JSON.stringify(r.data.document));
        onLoad(q);
        setTitle(r.data.title);
        setCurrent(
          r.data.archived ? null : { id: r.data.id, revision: r.data.revision },
        );
        setSaved(JSON.stringify({ title: r.data.title, document: q }));
        setPaused(false);
        setMessage(
          r.data.archived
            ? "Cópia de quadro arquivado aberta. Salve como novo para editar."
            : "Quadro da conta carregado.",
        );
      } else setMessage(r.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function change(item: ResumoQuadro, remove = false) {
    if (lock.current || pending.current) return;
    if (
      !window.confirm(
        remove
          ? `Excluir definitivamente “${item.title}”?`
          : `${item.archived ? "Restaurar" : "Arquivar"} “${item.title}”?`,
      )
    )
      return;
    lock.current = true;
    setBusy(true);
    try {
      const r = remove
        ? await excluirQuadro(item.id, item.revision)
        : await arquivarQuadro(item.id, item.revision, !item.archived);
      if (r.ok) {
        setItems((rows) => rows.filter((row) => row.id !== item.id));
        if (current?.id === item.id) {
          setCurrent(null);
          setPaused(true);
        }
        setMessage(
          remove
            ? "Quadro excluído da conta. O editor foi preservado."
            : "Biblioteca atualizada.",
        );
      } else setMessage(r.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!connected)
    return (
      <section className="form-card">
        <h2>Salvar na conta</h2>
        <p>
          Você está usando o editor local. <Link href="/entrar">Entre</Link>{" "}
          para salvar quadros na sua conta. O rascunho deste navegador não será
          importado automaticamente.
        </p>
      </section>
    );
  return (
    <section className="form-card">
      <h2>Meus quadros na conta</h2>
      <p>
        Privados: somente sua conta pode ler e editar. Até 100 quadros,
        incluindo arquivados. O salvamento no navegador continua independente.
      </p>
      <label className="field">
        Título do quadro
        <input
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => setAuto(e.target.checked)}
        />{" "}
        Salvar automaticamente após as alterações
      </label>
      <div>
        <button disabled={busy || gesture} onClick={() => void save()}>
          Salvar na conta
        </button>
        <button
          disabled={busy || gesture || unknown}
          onClick={() => void save(true)}
        >
          Salvar como cópia
        </button>
        {current && (
          <button
            disabled={busy || unknown}
            onClick={() => void open(current.id)}
          >
            Abrir versão da conta
          </button>
        )}
      </div>
      <p role="status" aria-live="polite">
        {busy
          ? "Salvando ou carregando…"
          : current && dirty && !paused
            ? "Alterações ainda não sincronizadas."
            : message}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void library();
        }}
      >
        <label className="field">
          Buscar meus quadros
          <input
            maxLength={120}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />{" "}
          Mostrar arquivados
        </label>
        <button disabled={busy}>Carregar biblioteca</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong> · {item.sport} ·{" "}
            {new Date(item.updated).toLocaleString("pt-BR")}{" "}
            <button disabled={busy} onClick={() => void open(item.id)}>
              Abrir {item.title}
            </button>{" "}
            <button disabled={busy} onClick={() => void change(item)}>
              {item.archived ? "Restaurar" : "Arquivar"} {item.title}
            </button>{" "}
            <button disabled={busy} onClick={() => void change(item, true)}>
              Excluir {item.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
