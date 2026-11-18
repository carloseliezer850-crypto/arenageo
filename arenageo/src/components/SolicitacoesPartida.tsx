"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { decidirParticipacao } from "@/services/servicoPartida";
export function SolicitacoesPartida({
  id,
  version,
  requests,
}: {
  id: number;
  version: number;
  requests: { id: number; username: string; revision: number }[];
}) {
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function decide(user: number, approve: boolean, revision: number) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await decidirParticipacao(id, user, approve, revision, version);
      setMessage(
        r.success
          ? "Decisão registrada. O jogador recebeu um aviso no site."
          : r.message,
      );
      router.refresh();
    } catch {
      setMessage(
        "Não foi possível confirmar. Atualize a página para verificar a solicitação.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="form-card" aria-label="Solicitações de participação">
      <h2>Solicitações de participação</h2>
      <p>
        Aprovar confirma a vaga se houver espaço e ninguém estiver esperando.
        Caso contrário, o jogador entra no fim da fila. Conflitos de agenda
        impedem a aprovação. Recusar encerra esta solicitação sem permitir novos
        pedidos para a mesma partida.
      </p>
      {!requests.length ? (
        <p>Nenhuma solicitação pendente.</p>
      ) : (
        <ul>
          {requests.map((r) => (
            <li key={`${r.id}:${r.revision}`}>
              @{r.username}{" "}
              <button
                disabled={busy}
                onClick={() => decide(r.id, true, r.revision)}
                aria-label={`Aprovar ${r.username}`}
              >
                Aprovar
              </button>{" "}
              <button
                disabled={busy}
                onClick={() => decide(r.id, false, r.revision)}
                aria-label={`Recusar ${r.username}`}
              >
                Recusar
              </button>
            </li>
          ))}
        </ul>
      )}
      <button disabled={busy} onClick={() => router.refresh()}>
        Atualizar solicitações
      </button>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
