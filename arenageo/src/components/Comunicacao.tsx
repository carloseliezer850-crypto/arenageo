"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  convidarJogador,
  listarEnviados,
  marcarLida,
  responderConvite,
  type Convite,
  type Aviso,
} from "@/services/servicoComunicacao";
export function CaixaComunicacao({
  convites,
  avisos,
}: {
  convites: Convite[];
  avisos: Aviso[];
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  const router = useRouter();
  async function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await fn();
      setMessage(r.message);
      router.refresh();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <h2>Convites recebidos</h2>
      <p>
        Aceitar não garante vaga imediata: a lotação e a ordem da fila continuam
        valendo. Até 100 convites recentes.
      </p>
      {!convites.length && <p>Nenhum convite recebido.</p>}
      {convites.map((c) => (
        <article className="info-card" key={c.id}>
          <h3>
            <Link href={`/partidas/${c.matchId}`}>{c.title}</Link>
          </h3>
          <p>{c.status}</p>
          {c.status === "PENDENTE" && (
            <>
              <button
                disabled={busy}
                onClick={() =>
                  void run(() => responderConvite(c.id, "ACEITAR"))
                }
              >
                Aceitar convite
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  void run(() => responderConvite(c.id, "RECUSAR"))
                }
              >
                Recusar convite
              </button>
            </>
          )}
        </article>
      ))}
      <h2>Notificações</h2>
      {!avisos.length && <p>Nenhuma notificação nesta página.</p>}
      {avisos.map((n) => (
        <article className="info-card" key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <p>
            {new Date(n.created).toLocaleString("pt-BR")} ·{" "}
            {n.read ? "Lida" : "Não lida"}
          </p>
          <Link href={n.target}>Abrir detalhes</Link>
          {!n.read && (
            <button
              disabled={busy}
              onClick={() => void run(() => marcarLida(n.id))}
            >
              Marcar como lida
            </button>
          )}
        </article>
      ))}
      {message && <p role="status">{message}</p>}
    </>
  );
}
export function ConvidarPartida({ id }: { id: number }) {
  const [username, setUsername] = useState(""),
    [items, setItems] = useState<Convite[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  async function run(action?: () => Promise<{ ok: boolean; message: string }>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      if (action) {
        const r = await action();
        setMessage(
          r.ok
            ? "Solicitação processada. Confira o estado do convite abaixo."
            : r.message,
        );
      }
      setItems(await listarEnviados(id));
    } catch {
      setMessage("Não foi possível carregar os convites. Tente novamente.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="form-card">
      <h2>Convidar jogador</h2>
      <p>
        Use o nome de usuário exato. Convites aparecem no site, sem envio de
        e-mail. Limite de 20 por hora; um convite por jogador nesta partida.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(() => convidarJogador(id, username));
        }}
      >
        <label className="field">
          Nome de usuário
          <input
            required
            maxLength={50}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <button disabled={busy}>Enviar convite</button>
      </form>
      <button disabled={busy} onClick={() => void run()}>
        Atualizar convites enviados
      </button>
      <ul>
        {items.map((c) => (
          <li key={c.id}>
            {c.username} — {c.status}
            {c.status === "PENDENTE" && (
              <button
                disabled={busy}
                onClick={() =>
                  void run(() => responderConvite(c.id, "REVOGAR"))
                }
              >
                Revogar convite para {c.username}
              </button>
            )}
          </li>
        ))}
      </ul>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
