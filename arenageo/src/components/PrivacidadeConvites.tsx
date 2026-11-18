"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  definirRecebimento,
  bloquearRemetente,
  desbloquearRemetente,
  type PrivacidadeConvites,
} from "@/services/servicoComunicacao";

export function PrivacidadeConvitesForm({
  value,
}: {
  value: PrivacidadeConvites;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [username, setUsername] = useState("");
  const lock = useRef(false);
  const router = useRouter();
  async function run(action: () => Promise<{ ok: boolean; message: string }>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await action();
      setMessage(r.ok ? "Preferências de convites atualizadas." : r.message);
      router.refresh();
    } catch {
      setMessage(
        "Não foi possível confirmar a alteração. Atualize a página antes de repetir.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="form-card" aria-label="Privacidade dos convites">
      <h2>Privacidade dos convites</h2>
      <p>
        Estas opções valem para novos convites de partidas. Convites já
        recebidos continuam disponíveis para aceitar ou recusar. Avisos de
        reservas e participações continuam ativos.
      </p>
      <p>
        Recebimento de novos convites:{" "}
        <strong>{value.enabled ? "Ativado" : "Desativado"}</strong>
      </p>
      <button
        disabled={busy}
        onClick={() => void run(() => definirRecebimento(!value.enabled))}
      >
        {value.enabled ? "Desativar novos convites" : "Ativar novos convites"}
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(() => bloquearRemetente(username));
        }}
      >
        <label className="field">
          Usuário a bloquear
          <input
            required
            maxLength={50}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <button disabled={busy}>Bloquear convites deste usuário</button>
      </form>
      <p>
        O bloqueio vale apenas para convites enviados a você e não é informado
        ao remetente. Até 500 bloqueios.
      </p>
      {!value.blocked.length && <p>Nenhum remetente bloqueado.</p>}
      <ul>
        {value.blocked.map((b) => (
          <li key={b.id}>
            {b.username}{" "}
            <button
              disabled={busy}
              onClick={() => void run(() => desbloquearRemetente(b.id))}
            >
              Desbloquear {b.username}
            </button>
          </li>
        ))}
      </ul>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
