"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { vincularReservaPartida } from "@/services/servicoPartida";
import type { Partida } from "@/types/partidaPlataforma";
export function LocalPartida({
  match,
  options,
}: {
  match: Partida;
  options: { id: number; space: string; arena: string }[];
}) {
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const router = useRouter();
  async function save(booking: number | null) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const result = await vincularReservaPartida(
        match.id,
        booking,
        match.version,
      );
      setMessage(
        result.success
          ? "Local atualizado. Os participantes receberam um aviso no site."
          : result.message,
      );
      router.refresh();
    } catch {
      setMessage(
        "Não foi possível confirmar a alteração. Atualize a página antes de tentar novamente.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="form-card" aria-label="Reserva da partida">
      <h2>Reserva da partida</h2>
      <p>
        Escolha uma reserva confirmada da sua conta, no mesmo município,
        compatível com o esporte e cobrindo todo o horário. Cada reserva pode
        ser vinculada a uma partida. O custo da reserva continua sob sua
        responsabilidade.
      </p>
      {options.length ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selected) void save(Number(selected));
          }}
        >
          <fieldset disabled={busy}>
            <label htmlFor="match-booking">Reserva compatível</label>
            <select
              id="match-booking"
              required
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Selecione</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.arena} · {o.space} · Reserva {o.id}
                </option>
              ))}
            </select>
            <button className="primary-button" disabled={!selected || busy}>
              Vincular reserva
            </button>
          </fieldset>
        </form>
      ) : (
        <p>
          Nenhuma reserva compatível disponível. Reserve um espaço no horário da
          partida e volte aqui.
        </p>
      )}
      <Link href="/arenas">Procurar arena para reservar</Link>
      {match.venue?.bookingId && (
        <>
          <p>
            <Link href={`/reservas/${match.venue.bookingId}`}>
              Consultar minha reserva vinculada
            </Link>
          </p>
          <button disabled={busy} onClick={() => save(null)}>
            Desvincular reserva da partida
          </button>
        </>
      )}
      <p>
        Ao mudar o local, as inscrições continuam confirmadas e os participantes
        recebem um aviso. Eles podem sair da partida; ainda não há reconfirmação
        obrigatória.
      </p>
      <p>
        Desvincular ou cancelar a partida não cancela a reserva. Se precisar
        cancelar o horário, use a página da reserva e confira a política da
        arena.
      </p>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
