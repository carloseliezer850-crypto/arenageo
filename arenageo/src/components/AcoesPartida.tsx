"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  participarPartida,
  mudarEstadoPartida,
} from "@/services/servicoPartida";
import type { Partida } from "@/types/partidaPlataforma";
import { useToast } from "./ToastProvider";
export function AcoesPartida({
  match,
  connected,
}: {
  match: Partida;
  connected: boolean;
}) {
  const router = useRouter(),
    toast = useToast();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const lock = useRef(false);
  async function action(run: () => ReturnType<typeof participarPartida>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await run();
      const msg = r.success
        ? r.data.participation === "SOLICITADA"
          ? "Solicitação enviada. Aguarde a decisão do organizador."
          : r.data.participation === "LISTA_ESPERA"
            ? "Você está na lista de espera. Volte para confirmar quando for sua vez."
            : "Alteração confirmada."
        : r.message;
      setMessage(msg);
      toast(msg);
      router.refresh();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!connected)
    return (
      <Link href="/entrar" className="primary-button">
        Entrar para participar
      </Link>
    );
  const open = match.accepting;
  return (
    <section aria-label="Ações da partida">
      <p>Sua participação: {match.participation || "Ainda não participa"}</p>
      {match.requiresApproval && (
        <p>
          A entrada exige aprovação do organizador. Solicitar ou aceitar convite
          não garante vaga.
        </p>
      )}
      {match.participation === "SOLICITADA" && (
        <p>Sua solicitação aguarda aprovação e ainda não ocupa uma vaga.</p>
      )}
      {match.participation === "RECUSADA" && (
        <p>
          O organizador recusou a solicitação. Não é possível reenviar para esta
          partida.
        </p>
      )}
      {match.participation === "LISTA_ESPERA" && (
        <p>
          Posição na fila: {match.queuePosition}. A confirmação é manual, por
          ordem de entrada. Você recebe uma notificação no site quando houver
          vaga e chegar sua vez; confirme aqui. Não há promoção automática.
        </p>
      )}
      {open && (
        <div className="action-row">
          {!["CONFIRMADA", "SOLICITADA", "RECUSADA"].includes(
            match.participation || "",
          ) && (
            <button
              disabled={busy}
              className="primary-button"
              onClick={() => action(() => participarPartida(match.id, false))}
            >
              {match.participation === "LISTA_ESPERA"
                ? "Tentar confirmar minha vaga"
                : match.requiresApproval && !match.canManage
                  ? "Solicitar participação"
                  : match.currentPlayers >= match.maxPlayers
                    ? "Entrar na lista de espera"
                    : "Participar"}
            </button>
          )}
          {["CONFIRMADA", "LISTA_ESPERA", "SOLICITADA"].includes(
            match.participation || "",
          ) && (
            <button
              disabled={busy}
              onClick={() => action(() => participarPartida(match.id, true))}
            >
              Sair da partida / fila
            </button>
          )}
        </div>
      )}
      {match.canManage && (
        <div>
          {match.status === "RASCUNHO" && (
            <button
              disabled={busy}
              onClick={() =>
                action(() =>
                  mudarEstadoPartida(match.id, "PUBLICADA", match.version),
                )
              }
            >
              Publicar rascunho
            </button>
          )}
          {["RASCUNHO", "PUBLICADA"].includes(match.status) && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  window.confirm(
                    "Cancelar a partida para todos? Esta ação não cancela reservas externas.",
                  )
                )
                  void action(() =>
                    mudarEstadoPartida(
                      match.id,
                      "CANCELADA",
                      match.version,
                      reason,
                    ),
                  );
              }}
            >
              <label className="field">
                Motivo do cancelamento
                <input
                  required
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <button disabled={busy}>Cancelar partida</button>
            </form>
          )}
          {match.status === "PUBLICADA" && match.canComplete && (
            <button
              disabled={busy}
              onClick={() =>
                action(() =>
                  mudarEstadoPartida(match.id, "CONCLUIDA", match.version),
                )
              }
            >
              Concluir partida
            </button>
          )}
        </div>
      )}
      {busy && <p role="status">Enviando…</p>}
      {message && <p role="status">{message}</p>}
      <Link href="/quadro-tatico">Abrir quadro tático local</Link>
    </section>
  );
}
