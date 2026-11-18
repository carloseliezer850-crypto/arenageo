import Link from "next/link";
import { redirect } from "next/navigation";
import { ErroApi } from "@/api/cliente";
import { Cabecalho } from "@/components/Cabecalho";
import { minhasReservas } from "@/services/servicoReserva";
export const metadata = {
  title: "Minhas reservas | ArenaGeo",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const raw = await searchParams;
  const page = Math.max(0, Number(raw.page) || 0);
  const rows = await minhasReservas(page).catch((e) => {
    if (e instanceof ErroApi && e.status === 401) redirect("/entrar");
    throw e;
  });
  return (
    <>
      <Cabecalho />
      <main className="container">
        <h1>Minhas reservas</h1>
        <Link href="/arenas">Reservar uma quadra</Link>
        {!rows.length && <p>Nenhuma reserva nesta página.</p>}
        <div className="match-grid">
          {rows.map((r) => (
            <article key={r.id} className="info-card">
              <h2>
                <Link href={`/reservas/${r.id}`}>
                  {r.space} — {r.arena}
                </Link>
              </h2>
              <p>
                {new Date(r.start).toLocaleString("pt-BR", {
                  timeZone: r.timezone,
                })}{" "}
                · {r.status}
              </p>
              <Link href={`/reservas/${r.id}`}>Ver reserva</Link>
            </article>
          ))}
        </div>
        <nav aria-label="Paginação">
          {page > 0 && (
            <Link href={`/reservas?page=${page - 1}`}>Anterior</Link>
          )}{" "}
          {rows.length === 20 && (
            <Link href={`/reservas?page=${page + 1}`}>Próxima</Link>
          )}
        </nav>
      </main>
    </>
  );
}
