import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { espacosArena } from "@/services/servicoReserva";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spaces = await espacosArena(Number(id));
  return (
    <>
      <Cabecalho />
      <main className="container">
        <Link href="/arenas">Encontrar quadras</Link>
        <h1>Espaços da arena</h1>
        <div className="match-grid">
          {spaces.map((s) => (
            <article className="info-card" key={s.id}>
              <h2>{s.name}</h2>
              <p>
                {s.covered ? "Coberto" : "Ao ar livre"}
                {s.floor ? ` · ${s.floor}` : ""}
                {s.capacity ? ` · Capacidade: ${s.capacity} pessoas` : ""}
              </p>
              {s.online && s.hourlyCents ? (
                <>
                  <p>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(s.hourlyCents / 100)}{" "}
                    por hora. Consulte o total do período antes de confirmar.
                  </p>
                  <Link className="primary-button" href={`/espacos/${s.id}`}>
                    Consultar horários
                  </Link>
                </>
              ) : (
                <p>
                  Reserva online indisponível. Consulte preço e disponibilidade
                  com a arena.
                </p>
              )}
            </article>
          ))}
        </div>
        {!spaces.length && <p>A arena ainda não publicou espaços.</p>}
      </main>
    </>
  );
}
