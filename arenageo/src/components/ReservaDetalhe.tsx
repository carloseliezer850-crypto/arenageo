"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { agirReserva } from "@/services/servicoReserva";
import type { Reserva } from "@/types/reserva";
export function ReservaDetalhe({ reserva: r }: { reserva: Reserva }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [reason, setReason] = useState("");
  const lock = useRef(false);
  const router = useRouter();
  async function act(action: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const result = await agirReserva(
        r.id,
        action,
        r.version,
        reason || undefined,
      );
      setMessage(result.ok ? "Alteração registrada." : result.message);
      router.refresh();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function calendar() {
    const escape = (s: string) =>
      s
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    const date = (s: string) =>
      new Date(s)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    const text = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ArenaGeo//Reservas//PT-BR",
      "BEGIN:VEVENT",
      `UID:reserva-${r.id}@arenageo`,
      `SEQUENCE:${r.version}`,
      `DTSTAMP:${date(new Date().toISOString())}`,
      `DTSTART:${date(r.start)}`,
      `DTEND:${date(r.end)}`,
      `SUMMARY:${escape(r.space + " — " + r.arena)}`,
      `STATUS:${r.status === "CANCELADA" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `reserva-${r.id}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="form-card">
      <p>
        Protocolo: {r.id} · {r.status}
      </p>
      <p>
        {new Date(r.start).toLocaleString("pt-BR", { timeZone: r.timezone })}{" "}
        até {new Date(r.end).toLocaleString("pt-BR", { timeZone: r.timezone })}{" "}
        ({r.timezone})
      </p>
      <p>
        Total:{" "}
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(r.totalCents / 100)}{" "}
        ·{" "}
        {r.payment === "PENDENTE_LOCAL"
          ? "Pagamento pendente no local"
          : r.payment === "RECEBIDO_LOCAL"
            ? "Recebimento no local registrado pela arena"
            : "Sem cobrança"}
      </p>
      <p>{r.policy}</p>
      {r.reason && <p>Motivo: {r.reason}</p>}
      <button onClick={calendar}>Adicionar ao calendário</button>
      {r.status === "CONFIRMADA" && (
        <>
          <h2>Cancelar {r.type === "BLOQUEIO" ? "bloqueio" : "reserva"}</h2>
          <p>
            Sem pagamento online. Cancelamento pelo cliente até{" "}
            {r.cancellationHours} horas antes do início. Valores recebidos no
            local precisam ser resolvidos diretamente com a arena.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void act("CANCELAR");
            }}
          >
            <label className="field">
              Motivo
              <textarea
                required
                minLength={5}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <label>
              <input type="checkbox" required /> Confirmo o cancelamento deste
              horário
            </label>
            <button disabled={busy}>
              Cancelar {r.type === "BLOQUEIO" ? "bloqueio" : "reserva"}
            </button>
          </form>
          {r.canManage && r.type === "RESERVA" && (
            <div>
              <h2>Operação da arena</h2>
              <p>
                Registre recebimento somente após conferir o pagamento no local.
              </p>
              {(
                [
                  ["CHECKIN", "Registrar check-in"],
                  ["RECEBER_LOCAL", "Registrar recebimento no local"],
                  ["CONCLUIR", "Concluir reserva"],
                  ["FALTA", "Registrar ausência"],
                ] as const
              ).map(([action, label]) => (
                <button
                  key={action}
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Confirma: ${label.toLowerCase()}?`))
                      void act(action);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {message && <p role="status">{message}</p>}
      <h2>Histórico</h2>
      <ul>
        {r.events?.map((e, i) => (
          <li key={i}>
            {new Date(e.date).toLocaleString("pt-BR", { timeZone: r.timezone })}{" "}
            — {e.action}
            {e.reason ? `: ${e.reason}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}
