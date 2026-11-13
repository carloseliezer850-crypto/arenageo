"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { orcarReserva, confirmarReserva } from "@/services/servicoReserva";
import type { Disponibilidade, Orcamento } from "@/types/reserva";
const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v / 100,
  );
export function ReservarEspaco({
  id,
  data,
}: {
  id: number;
  data: Disponibilidade;
}) {
  const [start, setStart] = useState(data.slots[0] || ""),
    [quote, setQuote] = useState<Orcamento | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [unknown, setUnknown] = useState(false);
  const key = useRef("");
  const lock = useRef(false);
  const router = useRouter();
  return (
    <section className="form-card">
      <h2>Reservar {data.space}</h2>
      <p>
        {data.arena} · {data.config.durationMinutes} minutos · fuso{" "}
        {data.timezone}
      </p>
      <p>Quadra inteira. Pagamento no local; nenhuma cobrança online.</p>
      {!quote ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (lock.current) return;
            lock.current = true;
            setBusy(true);
            try {
              const r = await orcarReserva(id, start);
              if (r.ok) {
                setQuote(r.data);
                key.current = crypto.randomUUID();
                setMessage("");
              } else setMessage(r.message);
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          <label className="field">
            Horário disponível
            <select
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              disabled={busy || !data.slots.length}
            >
              {data.slots.map((s) => (
                <option key={s} value={s}>
                  {s.slice(11, 16)}
                </option>
              ))}
            </select>
          </label>
          {!data.slots.length ? (
            <p>Nenhum horário disponível nesta data. Escolha outro dia.</p>
          ) : (
            <button disabled={busy} className="primary-button">
              {busy ? "Consultando…" : "Revisar orçamento"}
            </button>
          )}
        </form>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (lock.current) return;
            lock.current = true;
            setBusy(true);
            try {
              const r = await confirmarReserva(quote.quoteId, key.current);
              if (r.ok) {
                router.push(`/reservas/${r.data.id}`);
                router.refresh();
              } else {
                setMessage(r.message);
                setUnknown(r.unknown);
              }
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          <h3>Revise sua reserva</h3>
          <p>
            {new Date(quote.start).toLocaleString("pt-BR", {
              timeZone: quote.timezone,
            })}{" "}
            —{" "}
            {new Date(quote.end).toLocaleTimeString("pt-BR", {
              timeZone: quote.timezone,
            })}
          </p>
          <p>
            <strong>Total: {money(quote.totalCents)}</strong> · Pagar no local
          </p>
          <p>
            Orçamento válido até{" "}
            {new Date(quote.expires).toLocaleTimeString("pt-BR")}. O horário só
            é garantido após confirmar.
          </p>
          <p>{quote.policy}</p>
          <p>
            Cancelamento online até {quote.cancellationHours} horas antes do
            início, sem cobrança pela plataforma. Após o prazo, fale com a
            arena.
          </p>
          <label>
            <input type="checkbox" required disabled={busy} /> Li e aceito o
            preço e as condições
          </label>
          <div className="actions">
            <button className="primary-button" disabled={busy}>
              {busy
                ? "Confirmando…"
                : unknown
                  ? "Consultar novamente este envio"
                  : "Confirmar reserva — pagar no local"}
            </button>
            <button
              type="button"
              disabled={busy || unknown}
              onClick={() => {
                setQuote(null);
                setMessage("");
              }}
            >
              Revisar outro horário
            </button>
          </div>
        </form>
      )}
      {message && (
        <p role="alert">
          {message} <Link href="/reservas">Minhas reservas</Link>
        </p>
      )}
    </section>
  );
}
