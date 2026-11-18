import Link from "next/link";
import { lerArena } from "@/services/servicoGestao";
import { agendaArena } from "@/services/servicoReserva";
import { BloquearEspaco } from "@/components/ConfigurarReservas";
export const metadata = {
  title: "Agenda da arena | ArenaGeo",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const arena = await lerArena(Number(id));
  const requested = await searchParams;
  const date =
    requested.date ||
    new Intl.DateTimeFormat("en-CA", {
      timeZone: arena.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  const rows = await agendaArena(Number(id), date);
  return (
    <main className="container">
      <Link href={`/gestao/${id}`}>Gerenciar arena</Link>
      <h1>Agenda — {arena.arena.name}</h1>
      <p>Horários no fuso {arena.timezone}.</p>
      <form className="form-card">
        <label className="field">
          Data
          <input type="date" name="date" defaultValue={date} required />
        </label>
        <button>Consultar agenda</button>
      </form>
      {!rows.length && <p>Nenhuma reserva ou bloqueio nesta data.</p>}
      <div className="match-grid">
        {rows.map((r) => (
          <article className="info-card" key={r.id}>
            <h2>
              <Link href={`/reservas/${r.id}`}>{r.space}</Link>
            </h2>
            <p>
              {r.type === "BLOQUEIO" ? "Bloqueio" : "Reserva"} · {r.status}
            </p>
            <p>
              {new Date(r.start).toLocaleString("pt-BR", {
                timeZone: r.timezone,
              })}{" "}
              até{" "}
              {new Date(r.end).toLocaleString("pt-BR", {
                timeZone: r.timezone,
              })}
            </p>
            <Link href={`/reservas/${r.id}`}>Abrir detalhes</Link>
          </article>
        ))}
      </div>
      <BloquearEspaco spaces={arena.spaces} />
    </main>
  );
}
