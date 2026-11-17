"use client";
import { useRef, useState } from "react";
import { convidarJogador } from "@/services/servicoComunicacao";
export function ConvidarJogador({
  username,
  matches,
}: {
  username: string;
  matches: { id: number; title: string }[];
}) {
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  async function send() {
    if (lock.current || !id) return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await convidarJogador(Number(id), username);
      setMessage(
        r.ok
          ? "Convite registrado. Consulte os convites enviados no detalhe da partida."
          : r.message,
      );
    } catch {
      setMessage(
        "Resultado não confirmado. Consulte os convites da partida antes de repetir.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!matches.length)
    return (
      <p>
        Você precisa organizar uma partida publicada e futura para convidar este
        jogador.
      </p>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <label className="field">
        Minha partida
        <select required value={id} onChange={(e) => setId(e.target.value)}>
          <option value="">Selecione</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </label>
      <button disabled={busy}>Convidar para partida</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
